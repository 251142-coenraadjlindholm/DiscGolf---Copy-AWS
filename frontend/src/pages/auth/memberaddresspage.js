import { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import AuthLayout from "./authlayout";
import memberHero from "../../assets/images/become_a_member_image.png";
import "../../Styling/memberaddresspage.css";

/**
 * All fields are treated as required (the design doesn't mark any as optional).
 * Country, province, city and suburb: no numbers. ZIP code: numbers only.
 */
export default function MemberAddressPage({ data, onChange, onBack, onNext }) {
  const [errors, setErrors] = useState({});

  const noNumbers = (field) => (e) =>
    onChange({ ...data, [field]: e.target.value.replace(/\d/g, "") });

  const handleNext = (e) => {
    e.preventDefault();
    const next = {};
    if (!data.homeAddress.trim()) next.homeAddress = "Enter your home address.";
    if (!data.country.trim()) next.country = "Enter your country.";
    if (!data.province.trim()) next.province = "Enter your province.";
    if (!data.city.trim()) next.city = "Enter your city.";
    if (!data.suburb.trim()) next.suburb = "Enter your suburb.";
    if (!/^\d{4}$/.test(data.zip)) next.zip = "Enter a 4-digit ZIP code."; // 4 digits per the annotation: confirm
    setErrors(next);
    if (Object.keys(next).length === 0) onNext();
  };

  const field = (name, placeholder, handler) => (
    <>
      <Form.Control
        type="text"
        className="reg-input"
        placeholder={placeholder}
        aria-label={placeholder}
        value={data[name]}
        isInvalid={!!errors[name]}
        onChange={handler}
      />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </>
  );

  return (
    <AuthLayout pagePrefix="memberPayment" title="Become a Member" image={memberHero} imageAlt="Disc golfer in a South Africa jersey">
      <Form onSubmit={handleNext} noValidate className="d-flex flex-column gap-3 flex-grow-1">
        <Form.Group controlId="homeAddress">
          {field("homeAddress", "Home Address", (e) => onChange({ ...data, homeAddress: e.target.value }))}
        </Form.Group>

        <Row className="g-3">
          <Col xs={6}>{field("country", "Country", noNumbers("country"))}</Col>
          <Col xs={6}>{field("province", "Province", noNumbers("province"))}</Col>
        </Row>

        <Row className="g-3">
          <Col xs={6}>{field("city", "City", noNumbers("city"))}</Col>
          <Col xs={6}>{field("suburb", "Suburb", noNumbers("suburb"))}</Col>
        </Row>

        <Form.Group controlId="zip">
          {field("zip", "ZIP Code", (e) =>
            onChange({ ...data, zip: e.target.value.replace(/\D/g, "").slice(0, 4) })
          )}
        </Form.Group>

        <div className="d-flex justify-content-between mt-auto">
          <Button variant="link" className="reg-link" onClick={onBack}>← Previous Page</Button>
          <Button type="submit" variant="link" className="reg-link">Next Page →</Button>
        </div>
      </Form>
    </AuthLayout>
  );
}