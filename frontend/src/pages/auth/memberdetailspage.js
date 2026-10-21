import { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import AuthLayout from "./AuthLayout";
import memberHero from "../../assets/member-hero.jpg"; // export from Figma
import "../../Styling/memberdetailpage.css";

// The annotation doesn't list the gender options: replace with the ones from your brief
const GENDERS = ["Male", "Female", "Other"];
const DIVISIONS = ["FPO", "MPO", "MA1", "MA2", "MA3", "FA1", "FA2", "FA3"]; // same list as tournament registration: confirm

const today = new Date().toISOString().split("T")[0];

/**
 * Required: gender, date of birth, mobile number.
 * Optional: SA ID number, passport number (if no SA ID), usual division.
 */
export default function MemberDetailsPage({ data, onChange, onBack, onNext }) {
  const [errors, setErrors] = useState({});
  const update = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    const next = {};
    if (!data.gender) next.gender = "Select your gender.";
    if (!data.dob) next.dob = "Enter your date of birth.";
    if (!data.mobile.trim()) next.mobile = "Enter your mobile number.";
    setErrors(next);
    if (Object.keys(next).length === 0) onNext();
  };

  return (
    <AuthLayout title="Become a Member" image={memberHero} imageAlt="Disc golfer in a South Africa jersey">
      <Form onSubmit={handleNext} noValidate className="d-flex flex-column gap-3 flex-grow-1">
        <Row className="g-3">
          <Col xs={6}>
            <Form.Select
              className="reg-input"
              aria-label="Gender"
              value={data.gender}
              isInvalid={!!errors.gender}
              onChange={update("gender")}
            >
              <option value="" disabled>Gender</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
          </Col>
          <Col xs={6}>
            <Form.Control
              type="date"
              className="reg-input dob-input"
              aria-label="Date of birth"
              max={today}
              value={data.dob}
              isInvalid={!!errors.dob}
              onChange={update("dob")}
            />
            <Form.Control.Feedback type="invalid">{errors.dob}</Form.Control.Feedback>
          </Col>
        </Row>

        <Form.Control
          type="text"
          inputMode="numeric"
          className="reg-input"
          placeholder="SA ID Number"
          aria-label="SA ID number (optional)"
          value={data.saId}
          onChange={update("saId")}
        />

        <Form.Control
          type="text"
          className="reg-input"
          placeholder="Passport Number (if no SA ID)"
          aria-label="Passport number, if no SA ID (optional)"
          value={data.passport}
          onChange={update("passport")}
        />

        <Form.Group controlId="mobile">
          <Form.Control
            type="tel"
            className="reg-input"
            placeholder="Mobile Number"
            aria-label="Mobile number"
            autoComplete="tel"
            required
            value={data.mobile}
            isInvalid={!!errors.mobile}
            onChange={update("mobile")}
          />
          <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
        </Form.Group>

        <Form.Select
          className="reg-input"
          aria-label="Usual division (optional)"
          value={data.division}
          onChange={update("division")}
        >
          <option value="">Select Usual Division</option>
          {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Form.Select>

        <div className="d-flex justify-content-between mt-auto">
          <Button variant="link" className="reg-link" onClick={onBack}>← Back to Sign Up</Button>
          <Button type="submit" variant="link" className="reg-link">Next Page →</Button>
        </div>
      </Form>
    </AuthLayout>
  );
}