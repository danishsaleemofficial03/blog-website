import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ADMIN_EMAIL } from "../firebase";

export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.code?.replace("auth/", "").replace(/-/g, " ") || err.message);
    } finally {
      setBusy(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    run(() => (mode === "login" ? login(email, password) : register(name, email, password)));
  }

  return (
    <div className="auth">
      <p className="eyebrow">Welcome back</p>
      <h1>{mode === "login" ? "Log in to your account" : "Create an account"}</h1>
      <p className="muted">Sign in to join the conversation. The site administrator can manage and publish stories.</p>
      <form onSubmit={submit}>
        {mode === "register" && (
          <label>Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>
          {mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>
      <button className="btn btn-outline" disabled={busy} onClick={() => run(loginWithGoogle)}>
        Continue with Google
      </button>
      <p className="muted">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <button className="link-btn" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
      <aside className="admin-hint">
        <strong>Testing publishing?</strong>
        <p className="muted small">
          Create a test user in Firebase Authentication with the email configured as <code>VITE_ADMIN_EMAIL</code>.
          Set the same email in <code>firestore.rules</code>, then sign in here. Only that account can access the dashboard.
        </p>
        {ADMIN_EMAIL && <p className="muted small">Configured admin email: <strong>{ADMIN_EMAIL}</strong></p>}
      </aside>
    </div>
  );
}
