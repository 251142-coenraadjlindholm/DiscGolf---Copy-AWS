import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import RegistrationLayout, { RegistrationTitle } from "./RegistrationLayout";
import "../Styling/registrationdetailspage.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIVISIONS = ["FPO", "MPO", "MA1", "MA2", "MA3", "FA1", "FA2", "FA3"]; // confirm against the Figma note

/**
 * Screens 3 & 4: one registrant per step.
 * checkEmailExists(email) -> Promise<boolean>  (your backend call)
 */
export default function RegistrantDetailsPage({
  index,            // 0-based
  total,
  registrant,       // { email, membershipId, division }
  onChange,
  onBack,
  onNext,
  checkEmailExists,
}) {
  const [errors, setErrors] = useState({});
  const [checking, setChecking] = useState(false);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const update = (field) => (e) => onChange({ ...registrant, [field]: e.target.value });

  const handleNext = async (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(registrant.email)) next.email = "Enter a valid email address.";
    if (!registrant.division) next.division = "Select a division.";

    if (!next.email) {
      setChecking(true);
      const result = await checkEmailExists(registrant.email);
      setChecking(false);
      if (!result.exists) next.email = "Email not found. This user must create an account.";
      else if (!result.membershipId) next.membershipId = "This account does not have a DGSA membership ID.";
      else onChange({ ...registrant, membershipId: String(result.membershipId) });
    }

    setErrors(next);
    if (Object.keys(next).length === 0) onNext();
  };

  return (
    <RegistrationLayout>
      <RegistrationTitle />

      <Form onSubmit={handleNext} noValidate className="regplayerDetailsPage d-flex flex-column gap-3 flex-grow-1">
        <p className="regplayerDetailsHeadingPage mb-0">Registrant {index + 1} Details:</p>

        <Form.Group controlId="email">
          <Form.Control
            type="email"
            className="regplayerInputDetailsPage"
            placeholder="Email"
            aria-label="Email"
            required
            value={registrant.email}
            isInvalid={!!errors.email}
            onChange={update("email")}
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="membershipId">
          <Form.Control
            type="text"
            className="regplayerInputDetailsPage"
            placeholder="DGSA Membership ID"
            aria-label="DGSA Membership ID"
            required
            readOnly={Boolean(registrant.membershipId)}
            value={registrant.membershipId}
            onChange={update("membershipId")}
          />
        </Form.Group>

        <Form.Group controlId="division">
          <Form.Select
            className="regplayerInputDetailsPage"
            aria-label="Division"
            value={registrant.division}
            isInvalid={!!errors.division}
            onChange={update("division")}
          >
            <option value="" disabled>Select Division</option>
            {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.division}</Form.Control.Feedback>
        </Form.Group>

        <div className="d-flex justify-content-between mt-auto">
          <Button variant="link" className="regplayerLinkDetailsPage" onClick={onBack}>
            ← {isFirst ? "Back to Player Choice" : "Previous Registrant"}
          </Button>
          <Button type="submit" variant="link" className="regplayerLinkDetailsPage" disabled={checking}>
            {checking ? "Checking…" : isLast ? "Next Step" : "Next Registrant"} →
          </Button>
        </div>
      </Form>
    </RegistrationLayout>
  );
}