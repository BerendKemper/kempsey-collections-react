const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth`;
const MICROSOFT_AUTH_URL = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`;

export function LoginButtons() {
  const googleLogin = () => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: `https://api.emperjs.com/auth/google/callback`,
      response_type: `code`,
      scope: `openid email profile`,
      prompt: `select_account`,
    });

    window.location.href = `${GOOGLE_AUTH_URL}?${params}`;
  };

  const microsoftLogin = () => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
      redirect_uri: `https://api.emperjs.com/auth/microsoft/callback`,
      response_type: `code`,
      scope: `openid email profile`,
      response_mode: `query`,
    });

    window.location.href = `${MICROSOFT_AUTH_URL}?${params}`;
  };

  return (
    <div>
      <button onClick={googleLogin}>Login with Google</button>
      <button onClick={microsoftLogin}>Login with Microsoft</button>
    </div>
  );
}