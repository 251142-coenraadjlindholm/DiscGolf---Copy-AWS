import { Link } from "react-router-dom";
import logo from "../../assets/images/discgolf_logo.png";
import "../../Styling/registrationlayout.css";
import "../../Styling/authlayout.css";

/**
 * Shared registration layout used by the Login and Sign Up pages.
 */
export default function AuthLayout({ title, image, imageAlt = "", pagePrefix, children }) {
  return (
    <main className={`${pagePrefix}LayoutPage`}>
      <aside className={`${pagePrefix}VisualPage`}>
        <img className={`${pagePrefix}ImagePage`} src={image} alt={imageAlt} />
        <Link to="/" className={`${pagePrefix}LogoPage`} aria-label="Back to home">
          <img src={logo} alt="Disc Golf South Africa" />
        </Link>
      </aside>
      <div className={`${pagePrefix}ContentPage`}>
        <h1 className={`${pagePrefix}TitlePage`}>{title}</h1>
        {children}
      </div>
    </main>
  );
}