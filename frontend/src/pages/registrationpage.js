import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import RegistrationLayout, { RegistrationTitle } from "./RegistrationLayout";
import FileUpload from "../assets/components/fileupload";
import "../Styling/registrationpage.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Screens 1 & 2: "Are you registering for multiple players?"
 *  - No / nothing chosen -> single registration form
 *  - Yes                 -> player-count dropdown + Begin Registration
 */
export default function RegistrationPage({
  onSubmitSingle,
  onBeginMultiple,
  onBackToDashboard,
  initialEmail = "",
  initialMembershipId = "",
  error = "",
}) {
  const [multiple, setMultiple] = useState(null); // "yes" | "no" | null
  const [email, setEmail] = useState(initialEmail);
  const [membershipId, setMembershipId] = useState(initialMembershipId ? String(initialMembershipId) : "");
  const [proof, setProof] = useState(null);
  const [playerCount, setPlayerCount] = useState("");
  const [errors, setErrors] = useState({});

  const handleSingle = (e) => {
    e.preventDefault();
    const next = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!proof) next.proof = "Upload your proof of payment.";
    setErrors(next);
    if (Object.keys(next).length === 0) onSubmitSingle({ email, membershipId, proof });
  };

  const handleMultiple = (e) => {
    e.preventDefault();
    if (!playerCount) {
      setErrors({ playerCount: "Select the number of players." });
      return;
    }
    setErrors({});
    onBeginMultiple(Number(playerCount));
  };

  return (
    <RegistrationLayout>
      <RegistrationTitle />
      {error && <div className="alert alert-danger">{error}</div>}

      <Form.Group role="radiogroup" aria-labelledby="multiple-label" className="regplayerChoicePage">
      <Form.Label id="multiple-label" className="regplayerChoiceLabelPage mb-0">
          Are you registering for <strong>multiple</strong> players?
        </Form.Label>
        <Form.Check inline type="radio" id="multiple-yes" name="multiple" label="Yes"
          checked={multiple === "yes"} onChange={() => setMultiple("yes")} />
        <Form.Check inline type="radio" id="multiple-no" name="multiple" label="No"
          checked={multiple === "no"} onChange={() => setMultiple("no")} />
      </Form.Group>

      {multiple === "yes" ? (
        <Form onSubmit={handleMultiple} noValidate className="d-flex flex-column gap-3">
          <Form.Group controlId="playerCount">
            <Form.Label className="small">Indicate the Amount of Players</Form.Label>
            <Form.Select
              className="regplayerInputPage"
              value={playerCount}
              isInvalid={!!errors.playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
            >
              <option value="" disabled>Players</option>
              {PLAYER_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.playerCount}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" className="regplayerButtonPage">Begin Registration</Button>
          <Button variant="link" className="regplayerLinkPage align-self-start" onClick={onBackToDashboard}>
            ← Back to Dashboard
          </Button>
        </Form>
      ) : (
        <Form onSubmit={handleSingle} noValidate className="d-flex flex-column gap-3">
          <Form.Group controlId="email">
            <Form.Control
              type="email"
              className="regplayerInputPage"
              placeholder="Email"
              aria-label="Email"
              required
              value={email}
              isInvalid={!!errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="membershipId">
            <Form.Control
              type="text"
              className="regplayerInputPage"
              placeholder="DGSA Membership ID"
              aria-label="DGSA Membership ID"
              aria-describedby="membershipId-help"
              value={membershipId}
              isInvalid={!!errors.membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
            />
            <Form.Text id="membershipId-help">
              Optional. Enter your ID to receive the DGSA member discount.
            </Form.Text>
            <Form.Control.Feedback type="invalid">{errors.membershipId}</Form.Control.Feedback>
          </Form.Group>

          <p className="fw-semibold mb-0">Proof of Payment</p>
          <FileUpload file={proof} onChange={setProof} error={errors.proof} />

          <Button type="submit" className="regplayerButtonPage">Register</Button>
        </Form>
      )}
    </RegistrationLayout>
  );
}