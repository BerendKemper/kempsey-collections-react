import { useMemo, useState } from "react";
import { LoginButtons } from "../controls/Auth/LoginButtons";
import { useSession } from "../controls/Auth/useSession";
import "./AdminUsersPage.css";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: "active" | "disabled";
};

const DEMO_USERS: UserRecord[] = [];

export function AdminUsersPage() {
  const { session, isLoading } = useSession();
  const [query, setQuery] = useState("");

  const isAuthenticated = session?.authenticated;
  const isAdmin = session?.roles?.includes("admin") || session?.roles?.includes("owner");

  const filteredUsers = useMemo(() => {
    if (!query) {
      return DEMO_USERS;
    }

    const normalizedQuery = query.toLowerCase();
    return DEMO_USERS.filter(user =>
      [user.name, user.email, user.roles.join(" ")].some(value => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query]);

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

  if (!isAdmin) {
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
        <p>Owners can promote admins. Admins can disable non-admin users.</p>
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
            <p>Admin roles are read-only for non-owners.</p>
          </div>
        </aside>

        <div className="admin-users__list">
          <div className="admin-users__list-header">
            <h2>Users</h2>
            <span>{filteredUsers.length} total</span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="admin-users__empty">
              <p>No users to display yet.</p>
              <p>Connect the admin list API to populate this view.</p>
            </div>
          ) : (
            <div className="admin-users__table">
              <div className="admin-users__row admin-users__row--header">
                <span>Name</span>
                <span>Email</span>
                <span>Roles</span>
                <span>Status</span>
              </div>
              {filteredUsers.map(user => (
                <div key={user.id} className="admin-users__row">
                  <span>{user.name}</span>
                  <span>{user.email}</span>
                  <span className="admin-users__roles">
                    {user.roles.map(role => (
                      <span key={role} className="role-pill">
                        {role}
                      </span>
                    ))}
                  </span>
                  <span className={`admin-users__status admin-users__status--${user.status}`}>{user.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
