import { Link, NavLink, useNavigate } from "react-router-dom";
import { House, PersonGear, CreditCard, BoxArrowRight } from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";
import { assetUrl } from "../../services/api";
import logo from "../../assets/images/discgolf_logo.png";
import "../../Styling/dashboardlayout.css";

// Pages for "profile" and "payments" aren't in the designs yet, so those links lead nowhere until you add them
const NAV = {
  member: [
    { to: "/dashboard", label: "Home", Icon: House, end: true },
    { to: "/dashboard/profile", label: "Profile", Icon: PersonGear },
  ],
  admin: [
    { to: "/dashboard", label: "Home", Icon: House, end: true },
    { to: "/dashboard/profile", label: "Profile", Icon: PersonGear },
    { to: "/dashboard/payments", label: "Payments", Icon: CreditCard },
  ],
};

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");

/**
 * variant "member": dark panel on a light background (member dashboard)
 * variant "admin":  light panel on a dark background (admin dashboard)
 * `actions` is shown on the right of the header (search + Add an Event on the admin dashboard)
 */
export default function DashboardLayout({ variant = "member", actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <main className={`dash dash--${variant}`}>
      <div className="dash__panel">
        <aside className="dash__sidebar">
          <Link to="/" className="dash__logo" aria-label="Return to the landing page">
            <img src={logo} alt="Disc Golf South Africa" />
          </Link>
          <nav aria-label="Dashboard" className="dash__nav">
            {NAV[variant].map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="dash__nav-link" aria-label={label} title={label}>
                <Icon aria-hidden="true" />
              </NavLink>
            ))}
          </nav>
          <div className="dash__sidebar-bottom">
            <button type="button" className="dash__nav-link" aria-label="Log out" title="Log out" onClick={handleLogout}>
              <BoxArrowRight aria-hidden="true" />
            </button>
          </div>
        </aside>

        <section className="dash__main">
          <header className="dash__header">
            <Link to="/dashboard" className="dash__avatar" aria-label="Your dashboard">
              {user.avatarUrl ? <img src={assetUrl(user.avatarUrl)} alt="" /> : initials(user.name)}
            </Link>
            <div>
              <p className="dash__name">{user.name}</p>
              <h1 className="dash__title">Dashboard</h1>
            </div>
            {actions && <div className="dash__actions">{actions}</div>}
          </header>
          <div className="dash__content">{children}</div>
        </section>
      </div>
    </main>
  );
}