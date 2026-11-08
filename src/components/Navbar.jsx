import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">Fieldnotes</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Posts</NavLink>
          {isAdmin && <NavLink to="/admin">Dashboard</NavLink>}
          {user ? (
            <button
              className="btn btn-ghost"
              onClick={async () => { await logout(); navigate("/"); }}
            >
              Log out
            </button>
          ) : (
            <NavLink to="/login">Log in</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
