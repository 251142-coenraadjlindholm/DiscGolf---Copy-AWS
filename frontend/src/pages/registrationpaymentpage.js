import { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import RegistrationLayout from "./RegistrationLayout";
import FileUpload from "../assets/components/fileupload";
import "../Styling/registrationpaymentpage.css";

// Copied these exactly from the Figma design / DGSA
const BANKING = {
  bank: "FNB",
  accountNumber: "546779294",
  accountType: "Cheque",
  branchCode: "20855",
  reference: "Name/Membership No.",
};

export default function PaymentPage({ amount = 300, onBack, onFinish }) {
  const [proof, setProof] = useState(null);
  const [error, setError] = useState("");

  const handleFinish = (e) => {
    e.preventDefault();
    if (!proof) {
      setError("Upload your proof of payment.");
      return;
    }
    setError("");
    onFinish(proof);
  };

  return (
    <RegistrationLayout>
      <Row className="align-items-start">
        <Col>
          <h2 className="regplayerPaymentHeadingPage">DGSA Banking Details</h2>
          <dl className="regplayerPaymentDetailsPage">
            <div><dt>Bank:</dt><dd>{BANKING.bank}</dd></div>
            <div><dt>Account Number:</dt><dd>{BANKING.accountNumber}</dd></div>
            <div><dt>Account Type:</dt><dd>{BANKING.accountType}</dd></div>
            <div><dt>Branch Code:</dt><dd>{BANKING.branchCode}</dd></div>
            <div><dt>Reference:</dt><dd>{BANKING.reference}</dd></div>
          </dl>
        </Col>
        <Col xs="auto" className="regplayerPaymentAmountPage text-end">
          <span className="regplayerPaymentAmountLabelPage">Amount Payable</span>
          <span className="regplayerPaymentAmountValuePage">R{amount}</span>
        </Col>
      </Row>

      <Form onSubmit={handleFinish} noValidate className="d-flex flex-column gap-3 flex-grow-1">
        <p className="fw-semibold mb-0">Proof of Payment</p>
        <FileUpload file={proof} onChange={setProof} error={error} />

        <div className="d-flex justify-content-between mt-auto">
          <Button variant="link" className="regplayerLinkPaymentPage" onClick={onBack}>← Previous Registrant</Button>
          <Button type="submit" variant="link" className="regplayerLinkPaymentPage">Finish Registration →</Button>
        </div>
      </Form>
    </RegistrationLayout>
  );
}