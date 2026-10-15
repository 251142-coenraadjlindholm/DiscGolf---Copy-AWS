import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import AuthLayout from "./authlayout";
import loginHero from "../../assets/images/login_image.png";
import "../../Styling/loginpage.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * onLogin(email, password) -> Promise<{ ok: true } | { ok: false, field: "email" | "password", message: string }>
 * e.g. field "email" + "Email not found. This user must create an account."
 *      field "password" + "Incorrect password."
 */
export default function LoginPage({ onLogin, onGoToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const result = await onLogin(email, password);
    setSubmitting(false);
    if (!result.ok) setErrors({ [result.field]: result.message });
  };

  return (
    <AuthLayout title="Login" pagePrefix="login" image={loginHero} imageAlt="Disc golfer throwing a disc">
      <Form onSubmit={handleSubmit} noValidate className="loginFormPage d-flex flex-column gap-3">
        <Form.Group controlId="login-email">
          <Form.Control
            type="email"
            className="loginInputPage"
            placeholder="Email"
            aria-label="Email"
            autoComplete="email"
            required
            value={email}
            isInvalid={!!errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="login-password">
          <Form.Control
            type="password"
            className="loginInputPage"
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            required
            value={password}
            isInvalid={!!errors.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
        </Form.Group>

        <Button type="submit" className="loginButtonPage" disabled={submitting}>
          {submitting ? "Logging in…" : "Login"}
        </Button>

        <p className="loginSwitchPage">
          Don't Have an Account?{" "}
          <Button variant="link" className="loginLinkPage" onClick={onGoToSignUp}>Sign Up</Button>
        </p>
      </Form>
    </AuthLayout>
  );
}