import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, InputGroup, Alert } from "react-bootstrap";
import { Pencil, GeoAlt, Trophy, Calendar3, Clock, TextLeft, CreditCard } from "react-bootstrap-icons";
import "../../Styling/registrationlayout.css";
import FileUpload from "../../assets/components/fileupload";
import { createEvent } from "../../services/api";
import logo from "../../assets/images/discgolf_logo.png";
import "../../Styling/neweventpage.css";

// The design doesn't list the PDGA tiers: replace with the ones from your brief
const PDGA_TIERS = ["A-Tier", "B-Tier", "C-Tier"];

const EMPTY = {
  name: "", location: "", pdgaTier: "",
  startDate: "", startTime: "", endDate: "", endTime: "",
  priceNonMember: "", priceMember: "", description: "", bankDetails: "",
};

// A form control with an icon on the left, like in the design
function IconField({ icon: Icon, error, children }) {
  return (
    <div>
      <InputGroup hasValidation>
        <InputGroup.Text aria-hidden="true"><Icon /></InputGroup.Text>
        {children}
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </InputGroup>
    </div>
  );
}

/** Screenshot 3: New Event. Everything is required except the End date and time (marked "optional"). */
export default function NewEventPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [poster, setPoster] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  const invalid = (field) => !!errors[field];

  const validate = () => {
    const next = {};
    if (!poster) next.poster = "Upload an event poster.";
    if (!values.name.trim()) next.name = "Enter the event name.";
    if (!values.location.trim()) next.location = "Enter the location.";
    if (!values.pdgaTier) next.pdgaTier = "Select a PDGA tier.";
    if (!values.startDate) next.startDate = "Select a start date.";
    if (!values.startTime) next.startTime = "Select a start time.";
    if (values.endDate || values.endTime) {
      if (!values.endDate) next.endDate = "Select an end date.";
      if (!values.endTime) next.endTime = "Select an end time.";
      if (values.endDate && values.endTime && values.startDate && values.startTime &&
          `${values.endDate}T${values.endTime}` < `${values.startDate}T${values.startTime}`) {
        next.endDate = "The end can't be before the start.";
      }
    }
    if (values.priceNonMember === "" || Number(values.priceNonMember) < 0) next.priceNonMember = "Enter the non-member price.";
    if (values.priceMember === "" || Number(values.priceMember) < 0) next.priceMember = "Enter the DGSA member price.";
    if (!values.description.trim()) next.description = "Enter an event description.";
    if (!values.bankDetails.trim()) next.bankDetails = "Enter the bank details.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const result = await createEvent(values, poster);
    setSubmitting(false);

    if (result.ok) return navigate("/dashboard");
    // The server names the field it didn't like; anything else goes in the alert
    if (result.field && result.field in { ...EMPTY, poster: 1 }) setErrors({ [result.field]: result.message });
    else setSubmitError(result.message);
  };

  return (
    <main className="reg-page newev">
      <div className="newev__panel">
        <Button as={Link} to="/dashboard" variant="link" className="reg-link newev__back">← Back to Dashboard</Button>

        <Form onSubmit={handleSubmit} noValidate className="newev__card">
          {submitError && <Alert variant="danger">{submitError}</Alert>}

          <Row className="g-4">
            <Col md={5} className="d-flex flex-column gap-3">
              <img src={logo} alt="Disc Golf South Africa" className="newev__logo" />
              <h1 className="newev__title">New Event</h1>

              <div>
                <p className="newev__label">Event Poster</p>
                <FileUpload
                  file={poster}
                  onChange={setPoster}
                  error={errors.poster}
                  mimeTypes={["image/png", "image/jpeg", "image/webp"]}
                  extensions=".png,.jpg,.jpeg,.webp"
                />
              </div>

              <IconField icon={Pencil} error={errors.name}>
                <Form.Control className="reg-input" placeholder="Event Name" aria-label="Event name"
                  value={values.name} isInvalid={invalid("name")} onChange={set("name")} />
              </IconField>

              <IconField icon={GeoAlt} error={errors.location}>
                <Form.Control className="reg-input" placeholder="Location" aria-label="Location"
                  value={values.location} isInvalid={invalid("location")} onChange={set("location")} />
              </IconField>

              <IconField icon={Trophy} error={errors.pdgaTier}>
                <Form.Select className="reg-input" aria-label="PDGA tier"
                  value={values.pdgaTier} isInvalid={invalid("pdgaTier")} onChange={set("pdgaTier")}>
                  <option value="" disabled>PDGA Tier</option>
                  {PDGA_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </Form.Select>
              </IconField>
            </Col>

            <Col md={7} className="d-flex flex-column gap-3">
              <fieldset className="newev__group">
                <legend className="newev__label">Start</legend>
                <Row className="g-2">
                  <Col xs={6}>
                    <IconField icon={Calendar3} error={errors.startDate}>
                      <Form.Control type="date" className="reg-input newev__date" aria-label="Start date"
                        value={values.startDate} isInvalid={invalid("startDate")} onChange={set("startDate")} />
                    </IconField>
                  </Col>
                  <Col xs={6}>
                    <IconField icon={Clock} error={errors.startTime}>
                      <Form.Control type="time" className="reg-input newev__date" aria-label="Start time"
                        value={values.startTime} isInvalid={invalid("startTime")} onChange={set("startTime")} />
                    </IconField>
                  </Col>
                </Row>
              </fieldset>

              <fieldset className="newev__group">
                <legend className="newev__label">End <span className="newev__optional">(optional)</span></legend>
                <Row className="g-2">
                  <Col xs={6}>
                    <IconField icon={Calendar3} error={errors.endDate}>
                      <Form.Control type="date" className="reg-input newev__date" aria-label="End date (optional)"
                        value={values.endDate} isInvalid={invalid("endDate")} onChange={set("endDate")} />
                    </IconField>
                  </Col>
                  <Col xs={6}>
                    <IconField icon={Clock} error={errors.endTime}>
                      <Form.Control type="time" className="reg-input newev__date" aria-label="End time (optional)"
                        value={values.endTime} isInvalid={invalid("endTime")} onChange={set("endTime")} />
                    </IconField>
                  </Col>
                </Row>
              </fieldset>

              <Row className="g-2">
                <Col xs={6}>
                  <IconField icon={() => <span>R</span>} error={errors.priceNonMember}>
                    <Form.Control type="number" min="0" step="0.01" className="reg-input" placeholder="Non-member"
                      aria-label="Price for non-members in rand" value={values.priceNonMember}
                      isInvalid={invalid("priceNonMember")} onChange={set("priceNonMember")} />
                  </IconField>
                </Col>
                <Col xs={6}>
                  <IconField icon={() => <span>R</span>} error={errors.priceMember}>
                    <Form.Control type="number" min="0" step="0.01" className="reg-input" placeholder="DGSA Member"
                      aria-label="Price for DGSA members in rand" value={values.priceMember}
                      isInvalid={invalid("priceMember")} onChange={set("priceMember")} />
                  </IconField>
                </Col>
              </Row>

              <IconField icon={TextLeft} error={errors.description}>
                <Form.Control as="textarea" rows={4} className="reg-input" placeholder="Event description"
                  aria-label="Event description" value={values.description}
                  isInvalid={invalid("description")} onChange={set("description")} />
              </IconField>

              <IconField icon={CreditCard} error={errors.bankDetails}>
                <Form.Control className="reg-input" placeholder="Bank Details" aria-label="Bank details"
                  value={values.bankDetails} isInvalid={invalid("bankDetails")} onChange={set("bankDetails")} />
              </IconField>

              <Button type="submit" className="reg-btn mt-auto" disabled={submitting}>
                {submitting ? "Adding event…" : "Add Event"}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </main>
  );
}