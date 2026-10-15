import { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import AuthLayout from "./authlayout";
import FileUpload from "../registration/FileUpload";
import memberHero from "../../assets/member-hero.jpg";
import "./MembershipPaymentPage.css";

// Same details as the tournament payment page: copy exactly from Figma / DGSA
// (move into one shared config file later so you only edit them once)
const BANKING = {
  bank: "FNB",
  accountNumber: "546779294",
  accountType: "Cheque",
  branchCode: "20855",
  reference: "Name/Membership No.",
};

export default function MembershipPaymentPage({ amount = 370, onCreateAccount }) {
  const [proof, setProof] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proof) {
      setError("Upload your proof of payment.");
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await onCreateAccount(proof);
    setSubmitting(false);
    if (result && result.ok === false) setError(result.message);
  };

  return (
    <AuthLayout title="Become a Member" image={memberHero} imageAlt="Disc golfer in a South Africa jersey">
      <Row className="align-items-start">
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
        <p className="fw-semibold mb-0">Proof of Payment</p>
        <FileUpload file={proof} onChange={setProof} error={error} />
        <Button type="submit" className="reg-btn mt-auto" disabled={submitting}>
          {submitting ? "Creating account…" : "Create an Account"}
        </Button>
      </Form>
    </AuthLayout>
  );
}