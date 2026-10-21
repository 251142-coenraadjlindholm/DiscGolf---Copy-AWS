import { useState } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import AuthLayout from "./authlayout";
import memberHero from "../../assets/images/become_a_member_image.png";
import "../../Styling/memberpaymentpage.css";

// Same details as the tournament payment page: copy exactly from Figma / DGSA
// (move into one shared config file later so you only edit them once)
const BANKING = {
  bank: "FNB",
  accountNumber: "546779294",
  accountType: "Cheque",
  branchCode: "20855",
  reference: "Name/Membership No.",
};

export default function MembershipPaymentPage({ amount = 370, onPay }) {
  const [details, setDetails] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) =>
    setDetails((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(details).some((value) => !value.trim())) {
      setError("Complete all payment details.");
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await onPay();
    setSubmitting(false);
    if (result && result.ok === false) setError(result.message);
  };

  return (
    <AuthLayout pagePrefix="memberPayment" title="Become a Member" image={memberHero} imageAlt="Disc golfer in a South Africa jersey">
      <Row className="memberPaymentSummary align-items-start">
        <Col>
          <h2 className="mpay__heading">DGSA Banking Details</h2>
          <dl className="mpay__details">
            <div><dt>Bank:</dt><dd>{BANKING.bank}</dd></div>
            <div><dt>Account Number:</dt><dd>{BANKING.accountNumber}</dd></div>
            <div><dt>Account Type:</dt><dd>{BANKING.accountType}</dd></div>
            <div><dt>Branch Code:</dt><dd>{BANKING.branchCode}</dd></div>
            <div><dt>Reference:</dt><dd>{BANKING.reference}</dd></div>
          </dl>
        </Col>
        <Col xs="auto" className="mpay__amount">
          <span className="mpay__amount-label">Amount Payable</span>
          <span className="mpay__amount-value">R{amount}</span>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit} noValidate className="d-flex flex-column gap-3 flex-grow-1">
        <p className="memberPaymentLabel mb-0">Demo payment details</p>
        {error && <Alert className="memberPaymentAlert" variant="danger">{error}</Alert>}
        <Form.Control className="memberPaymentInput" placeholder="Name on card" value={details.name} onChange={update("name")} />
        <Form.Control className="memberPaymentInput" inputMode="numeric" placeholder="Card number" value={details.number} onChange={update("number")} />
        <Row className="g-3">
          <Col><Form.Control className="memberPaymentInput" placeholder="MM/YY" value={details.expiry} onChange={update("expiry")} /></Col>
          <Col><Form.Control className="memberPaymentInput" inputMode="numeric" placeholder="CVV" value={details.cvv} onChange={update("cvv")} /></Col>
        </Row>
        <p className="memberPaymentNote mb-0">This is a demo payment. No money will be charged.</p>
        <Button type="submit" className="memberPaymentButton mt-auto" disabled={submitting}>
          {submitting ? "Activating membership…" : `Pay R${amount}`}
        </Button>
      </Form>
    </AuthLayout>
  );
}