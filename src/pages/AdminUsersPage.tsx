import { useEffect, useMemo, useState } from "react";
import { LoginButtons } from "../controls/Auth/LoginButtons";
import { useSession } from "../controls/Auth/useSession";
import "./AdminUsersPage.css";

const AUTH_API_ORIGIN = import.meta.env.VITE_AUTH_API_ORIGIN;
const OWNER_MANAGED_ROLES = [`admin`, `seller`, `tester`] as const;
const ADMIN_MANAGED_ROLES = [`seller`] as const;

type ManagedRole = `admin` | `seller` | `tester`;

type UserRecord = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: `active` | `disabled`;
};

type UsersApiRecord = {
  id: string;
  email: string;
  display_name: string | null;
  roles: string[];
  is_active: number;
};

const normalizeRoles = (roles: string[]): string[] =>
  [...new Set(roles.map(role => role.trim().toLowerCase()).filter(Boolean))].sort();

const equalsRoleLists = (a: string[], b: string[]): boolean => {
  const left = normalizeRoles(a);
  const right = normalizeRoles(b);
  if (left.length !== right.length) return false;
  return left.every((role, index) => role === right[index]);
};

export function AdminUsersPage() {
  const { session, isLoading } = useSession();
  const [query, setQuery] = useState(``);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, ManagedRole[]>>({});
  const [savingByUserId, setSavingByUserId] = useState<Record<string, boolean>>({});
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const isAuthenticated = Boolean(session?.authenticated);
  const isOwner = Boolean(session?.roles?.includes(`owner`));
  const isAdmin = Boolean(session?.roles?.includes(`admin`));
  const canManageUsers = isOwner || isAdmin;

  const allowedManagedRoles = useMemo<ManagedRole[]>(() => {
    if (isOwner) return [...OWNER_MANAGED_ROLES];
    if (isAdmin) return [...ADMIN_MANAGED_ROLES];
    return [];
  }, [isAdmin, isOwner]);

  const mapApiUser = (user: UsersApiRecord): UserRecord => ({
    id: user.id,
    name: user.display_name?.trim() ? user.display_name : user.email,
    email: user.email,
    roles: normalizeRoles(Array.isArray(user.roles) ? user.roles : []),
    status: user.is_active === 1 ? `active` : `disabled`,
  });

  const getManagedRolesForUser = (user: UserRecord): ManagedRole[] =>
    user.roles.filter((role): role is ManagedRole =>
      allowedManagedRoles.includes(role as ManagedRole)
    ) as ManagedRole[];

  const loadUsers = async () => {
    if (!isAuthenticated || !canManageUsers) {
      setUsers([]);
      setRoleDrafts({});
      setUsersError(null);
      setIsUsersLoading(false);
      return;
    }

    setIsUsersLoading(true);
    setUsersError(null);

    try {
      const response = await fetch(`${AUTH_API_ORIGIN}/users`, {
        method: `GET`,
        credentials: `include`,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as { users?: UsersApiRecord[] };
      const nextUsers = (payload.users ?? []).map(mapApiUser);
      setUsers(nextUsers);

      const nextDrafts: Record<string, ManagedRole[]> = {};
      for (const user of nextUsers) {
        nextDrafts[user.id] = getManagedRolesForUser(user);
      }
      setRoleDrafts(nextDrafts);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : `Failed to load users.`;
      setUsers([]);
      setRoleDrafts({});
      setUsersError(message);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [isAuthenticated, canManageUsers, allowedManagedRoles.join(`,`)]);

  const filteredUsers = useMemo(() => {
    if (!query) {
      return users;
    }

    const normalizedQuery = query.toLowerCase();
    return users.filter(user =>
      [user.name, user.email, user.roles.join(` `)].some(value => value.toLowerCase().includes(normalizedQuery))
    );
  }, [query, users]);

  const toggleManagedRole = (userId: string, role: ManagedRole, checked: boolean) => {
    setRoleDrafts(previous => {
      const current = new Set<ManagedRole>(previous[userId] ?? []);
      if (checked) current.add(role);
      else current.delete(role);
      return { ...previous, [userId]: [...current].sort() as ManagedRole[] };
    });
  };

  const handleResetRoles = (user: UserRecord) => {
    setRoleDrafts(previous => ({
      ...previous,
      [user.id]: getManagedRolesForUser(user),
    }));
  };

  const handleSaveRoles = async (user: UserRecord) => {
    const roles = roleDrafts[user.id] ?? [];
    setSavingByUserId(previous => ({ ...previous, [user.id]: true }));
    setUsersError(null);

    try {
      const response = await fetch(`${AUTH_API_ORIGIN}/users/roles`, {
        method: `PATCH`,
        credentials: `include`,
        headers: { "Content-Type": `application/json` },
        body: JSON.stringify({ userId: user.id, roles }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as { user?: UsersApiRecord };
      const updated = payload.user ? mapApiUser(payload.user) : null;
      if (!updated) {
        throw new Error(`Invalid API response`);
      }

      setUsers(previous => previous.map(existing => existing.id === updated.id ? updated : existing));
      setRoleDrafts(previous => ({
        ...previous,
        [updated.id]: getManagedRolesForUser(updated),
      }));
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : `Failed to update roles.`;
      setUsersError(message);
    } finally {
      setSavingByUserId(previous => ({ ...previous, [user.id]: false }));
    }
  };

  if (isLoading) {
    return (
      <section className="admin-users">
        <header className="admin-users__header">
          <p>Loading admin console...</p>
        </header>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="admin-users">
        <header className="admin-users__header">
          <h1>User admin</h1>
          <p>Sign in with an admin account to access user management.</p>
        </header>
        <div className="admin-users__signin">
          <LoginButtons />
        </div>
      </section>
    );
  }

  if (!canManageUsers) {
    return (
      <section className="admin-users">
        <header className="admin-users__header">
          <h1>User admin</h1>
          <p>You do not have permission to view this page.</p>
        </header>
      </section>
    );
  }

  return (
    <section className="admin-users">
      <header className="admin-users__header">
        <h1>User admin</h1>
        <p>{isOwner ? `Owner can manage admin, seller and tester roles.` : `Admin can manage seller role only.`}</p>
      </header>

      <div className="admin-users__layout">
        <aside className="admin-users__filters">
          <h2>Filters</h2>
          <label className="admin-users__field">
            <span>Search users</span>
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search by name, email, role"
            />
          </label>
          <div className="admin-users__notes">
            <p>Filter results update as you type.</p>
            <p>You cannot edit your own roles or any owner account.</p>
          </div>
        </aside>

        <div className="admin-users__list">
          <div className="admin-users__list-header">
            <h2>Users</h2>
            <span>{filteredUsers.length} total</span>
          </div>

          {isUsersLoading ? (
            <div className="admin-users__empty">
              <p>Loading users...</p>
            </div>
          ) : usersError ? (
            <div className="admin-users__empty">
              <p>Unable to process users request.</p>
              <p>{usersError}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-users__empty">
              <p>No users to display yet.</p>
              <p>Try changing your filters.</p>
            </div>
          ) : (
            <div className="admin-users__table">
              <div className="admin-users__row admin-users__row--header">
                <span>Name</span>
                <span>Email</span>
                <span>Roles</span>
                <span>Status</span>
              </div>
              {filteredUsers.map(user => {
                const isSelf = user.id === session?.userId;
                const isOwnerTarget = user.roles.includes(`owner`);
                const canEditRow = !isSelf && !isOwnerTarget && allowedManagedRoles.length > 0;
                const currentManagedRoles = getManagedRolesForUser(user);
                const draftManagedRoles = roleDrafts[user.id] ?? currentManagedRoles;
                const isDirty = !equalsRoleLists(draftManagedRoles, currentManagedRoles);
                const isSaving = Boolean(savingByUserId[user.id]);

                return (
                  <div key={user.id} className="admin-users__row">
                    <span>{user.name}</span>
                    <span>{user.email}</span>
                    <span className="admin-users__roles admin-users__roles--editable">
                      {user.roles.map(role => (
                        <span key={role} className="role-pill">
                          {role}
                        </span>
                      ))}
                      {canEditRow ? (
                        <div className="admin-users__role-editor">
                          <div className="admin-users__checkboxes">
                            {allowedManagedRoles.map(role => (
                              <label key={`${user.id}-${role}`} className="admin-users__checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={draftManagedRoles.includes(role)}
                                  onChange={event => toggleManagedRole(user.id, role, event.target.checked)}
                                  disabled={isSaving}
                                />
                                <span>{role}</span>
                              </label>
                            ))}
                          </div>
                          <div className="admin-users__role-actions">
                            <button
                              type="button"
                              onClick={() => handleResetRoles(user)}
                              disabled={!isDirty || isSaving}
                              className="admin-users__button admin-users__button--secondary"
                            >
                              Reset
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleSaveRoles(user)}
                              disabled={!isDirty || isSaving}
                              className="admin-users__button admin-users__button--primary"
                            >
                              {isSaving ? `Saving...` : `Save roles`}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="admin-users__hint">{isSelf ? `Self` : isOwnerTarget ? `Owner` : `Read-only`}</span>
                      )}
                    </span>
                    <span className={`admin-users__status admin-users__status--${user.status}`}>{user.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
