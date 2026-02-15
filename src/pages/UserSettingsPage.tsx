import { type FormEvent, useEffect, useMemo, useState } from "react";
import { LoginButtons } from "../controls/Auth/LoginButtons";
import { useSession } from "../controls/Auth/useSession";
import { ToggleDarkMode } from "../controls/ToggleDarkMode/ToggleDarkMode";
import "./UserSettingsPage.css";

const AUTH_API_ORIGIN = import.meta.env.VITE_AUTH_API_ORIGIN;

type StatusState = {
  tone: `idle` | `success` | `error` | `saving`;
  message: string;
};

export function UserSettingsPage() {
  const { session, isLoading, refreshSession } = useSession();
  const [displayName, setDisplayName] = useState(``);
  const [phoneNumber, setPhoneNumber] = useState(``);
  const [status, setStatus] = useState<StatusState>({ tone: `idle`, message: `` });

  const isAuthenticated = session?.authenticated;

  useEffect(() => {
    if (isAuthenticated) {
      setDisplayName(session?.displayName ?? ``);
    }
  }, [isAuthenticated, session?.displayName]);

  const roles = useMemo(() => session?.roles ?? [], [session?.roles]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) {
      return;
    }

    setStatus({ tone: `saving`, message: `Saving your display name...` });

    try {
      const trimmedName = displayName.trim();
      const payload = {
        displayName: trimmedName.length > 0 ? trimmedName : null,
      };

      const response = await fetch(`${AUTH_API_ORIGIN}/users/me/display-name`, {
        method: `PATCH`,
        headers: {
          "Content-Type": `application/json`,
        },
        credentials: `include`,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await response.json();
      await refreshSession();

      setStatus({ tone: `success`, message: `Display name updated.` });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : `Something went wrong.`;
      setStatus({ tone: `error`, message });
    }
  };

  if (isLoading) {
    return (
      <section className="user-settings">
        <header className="user-settings__header">
          <p>Loading your profile...</p>
        </header>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="user-settings">
        <header className="user-settings__header">
          <h1>Account settings</h1>
          <p>Sign in to view and update your account details.</p>
        </header>
        <div className="user-settings__signin">
          <LoginButtons />
        </div>
      </section>
    );
  }

  return (
    <section className="user-settings">
      <header className="user-settings__header">
        <h1>Account settings</h1>
        <p>Keep your profile up to date for a smooth checkout experience.</p>
      </header>

      <div className="user-settings__grid">
        <form className="user-settings__card" onSubmit={handleSubmit}>
          <div className="user-settings__card-header">
            <h2>Profile details</h2>
            <p>Make sure your name is what you want customers to see.</p>
          </div>

          <label className="user-settings__field">
            <span>Name (display name)</span>
            <input
              type="text"
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              placeholder="Add a display name"
            />
          </label>

          <label className="user-settings__field">
            <span>Phone number</span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={event => setPhoneNumber(event.target.value)}
              placeholder="+31 6 1234 5678"
              disabled
            />
            <small>This will be enabled once the checkout phone field is ready.</small>
          </label>

          <label className="user-settings__field">
            <span>Email</span>
            <input type="email" value={session?.email ?? `Not available yet`} readOnly />
            <small>Email comes from your sign-in provider.</small>
          </label>

          <div className="user-settings__actions">
            <button type="submit" disabled={status.tone === `saving`}>
              Save display name
            </button>
            {status.message ? (
              <p className={`user-settings__status user-settings__status--${status.tone}`} role="status">
                {status.message}
              </p>
            ) : null}
          </div>
        </form>

        <aside className="user-settings__card user-settings__card--secondary">
          <div className="user-settings__card-header">
            <h2>Roles</h2>
            <p>Your roles determine which tools you can access.</p>
          </div>
          <div className="user-settings__roles">
            {roles.length === 0 ? (
              <p className="user-settings__empty">Base user access is implicit for signed-in accounts.</p>
            ) : (
              roles.map(role => (
                <span key={role} className="role-pill">
                  {role}
                </span>
              ))
            )}
          </div>
          <p className="user-settings__hint">
            Roles can only be changed by an administrator through the admin console.
          </p>
        </aside>

        <aside className="user-settings__card user-settings__card--secondary">
          <div className="user-settings__card-header">
            <h2>Appearance</h2>
            <p>Switch between light and dark themes.</p>
          </div>
          <div className="user-settings__toggle-row">
            <span className="user-settings__toggle-label">Dark mode</span>
            <ToggleDarkMode />
          </div>
        </aside>
      </div>
    </section>
  );
}

