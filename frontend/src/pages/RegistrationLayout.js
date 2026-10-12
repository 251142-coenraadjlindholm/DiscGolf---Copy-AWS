import { Link } from "react-router-dom";
import dgsaLogo from "../assets/images/discgolf_logo.png";
import registrationImage from "../assets/images/registration_image.png";
import "../Styling/registrationlayout.css";

export function RegistrationTitle() {
  return <h1 className="regplayerTitleLayout">Registration</h1>;
}

//RegistrationLayout component is used to wrap the registration page content with a consistent layout.
export default function RegistrationLayout({ children }) {
  return (
    <main className="regplayerLayout">
      <aside className="regplayerVisualLayout">
        <img
          className="regplayerImageLayout"
          src={registrationImage}
          alt="Disc golf players celebrating on the course"
        />
        <Link to="/" className="regplayerLogoLayout" aria-label="Back to home">
          <img src={dgsaLogo} alt="Disc Golf South Africa" />
        </Link>
      </aside>
      <div className="regplayerContentLayout">{children}</div>
    </main>
  );
}
