import { useState } from "react";
import { Form, Button, ProgressBar } from "react-bootstrap";
import AuthLayout from "./authlayout";
import loginHero from "../../assets/images/login_image.png";
import "../../Styling/signuppage.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rules from the design annotation:
// more than 8 characters, mixed cases, one special character, two numbers
const RULES = [
  { id: "length", label: "More than 8 characters", test: (p) => p.length > 8 },
  { id: "case", label: "Upper and lower case letters", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "special", label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
  { id: "numbers", label: "Two numbers", test: (p) => (p.match(/\d/g) || []).length >= 2 },
];

/**
 * onSignUp({ name, email, password }) -> Promise<{ ok: true } | { ok: false, field, message }>
 */
export default function SignUpPage({ onSignUp, onGoToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const passed = RULES.filter((r) => r.test(password)).length;
  const strongEnough = passed === RULES.length;
  const barVariant = passed === RULES.length ? "success" : passed >= 3 ? "warning" : "danger";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = "Enter your name and surname.";
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!strongEnough) next.password = "Your password doesn't meet all the requirements yet.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const result = await onSignUp({ name: name.trim(), email, password });
    setSubmitting(false);
    if (!result.ok) setErrors({ [result.field]: result.message });
  };

  return (
    <AuthLayout title="Sign Up" pagePrefix="signup" image={loginHero} imageAlt="Disc golfer throwing a disc">
      <Form onSubmit={handleSubmit} noValidate className="signupFormPage d-flex flex-column gap-3">
        <Form.Group controlId="signup-name">
          <Form.Control
            type="text"
            className="signupInputPage"
            placeholder="Name & Surname"
            aria-label="Name and surname"
            autoComplete="name"
            required
            value={name}
            isInvalid={!!errors.name}
            // No numbers allowed in this field
            onChange={(e) => setName(e.target.value.replace(/\d/g, ""))}
          />
          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="signup-email">
          <Form.Control
            type="email"
            className="signupInputPage"
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

        <Form.Group controlId="signup-password">
          <Form.Control
            type="password"
            className="signupInputPage"
            placeholder="Password"
            aria-label="Password"
            autoComplete="new-password"
            required
            value={password}
            isInvalid={!!errors.password}
            aria-describedby="password-rules"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>

          {password && (
            <div id="password-rules" className="signupPasswordPage" aria-live="polite">
              <ProgressBar now={(passed / RULES.length) * 100} variant={barVariant} className="signupPasswordBarPage" />
              <p className="signupPasswordStatusPage">
                {strongEnough ? "Strong password" : "Password isn't strong enough yet"}
              </p>
              <ul className="signupPasswordListPage">
                {RULES.map((r) => (
                  <li key={r.id} className={r.test(password) ? "signupPasswordRulePage signupPasswordRuleOkPage" : "signupPasswordRulePage"}>
                    {r.test(password) ? "✓" : "✗"} {r.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Form.Group>

        <Button type="submit" className="signupButtonPage" disabled={submitting}>
          {submitting ? "Creating account…" : "Create an Account"}
        </Button>

        <p className="signupSwitchPage">
          Already Have an Account?{" "}
          <Button variant="link" className="signupLinkPage" onClick={onGoToLogin}>Login</Button>
        </p>
      </Form>
    </AuthLayout>
  );
}