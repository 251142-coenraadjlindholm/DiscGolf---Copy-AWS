import { useState } from "react";
import { Link } from "react-router-dom";
import RegistrationPage from "../../pages/registrationpage";
import RegistrantDetailsPage from "../../pages/registrationdetailspage";
import PaymentPage from "../../pages/registrationpaymentpage";
import { useAuth } from "../../context/AuthContext";
import { submitEventRegistration } from "../../services/api";
import logo from "../images/discgolf_logo.png";
import "../../Styling/registrationconfirmation.css";

const FEE_PER_PLAYER = 300; // R300 shown in the design: confirm if this is per player or a flat fee

// replace with your real API calls
async function checkEmailExists(email) {
  const res = await fetch(`/api/users/lookup?email=${encodeURIComponent(email)}`, {
    credentials: "include",
  });
  if (!res.ok) return { exists: false, membershipId: null };
  return res.json();
}
const emptyRegistrant = () => ({ email: "", membershipId: "", division: "" });

export default function RegistrationFlow({ eventId, onBackToDashboard }) {
  const { user } = useAuth();
  const [step, setStep] = useState("choice"); // choice | details | payment | done
  const [registrants, setRegistrants] = useState([]);
  const [current, setCurrent] = useState(0);
  const [submitError, setSubmitError] = useState("");

  const submit = async (registrantsToSubmit, proof) => {
    if (!eventId) {
      setSubmitError("This tournament could not be loaded. Return home and choose the tournament again.");
      return;
    }
    const result = await submitEventRegistration(eventId, registrantsToSubmit, proof);
    if (result.ok) {
      setSubmitError("");
      setStep("done");
    } else {
      setSubmitError(result.data?.message || "Unable to complete registration. Please try again.");
    }
  };

  // begin a new registration flow with multiple registrants
  const beginMultiple = (count) => {
    setRegistrants(Array.from({ length: count }, emptyRegistrant));
    setCurrent(0);
    setStep("details");
  };

  // update a specific registrant
  const updateRegistrant = (updated) =>
    setRegistrants((list) => list.map((r, i) => (i === current ? updated : r)));

  if (step === "choice") {
    return (
      <RegistrationPage
        onBackToDashboard={onBackToDashboard}
        initialEmail={user.email}
        initialMembershipId={user.dgsaMembershipId}
        error={submitError}
        onBeginMultiple={beginMultiple}
        onSubmitSingle={async (data) => {
          await submit([data], data.proof);
        }}
      />
    );
  }

  if (step === "details") {
    return (
      <RegistrantDetailsPage
        index={current}
        total={registrants.length}
        registrant={registrants[current]}
        onChange={updateRegistrant}
        checkEmailExists={checkEmailExists}
        onBack={() => (current === 0 ? setStep("choice") : setCurrent(current - 1))}
        onNext={() =>
          current === registrants.length - 1 ? setStep("payment") : setCurrent(current + 1)
        }
      />
    );
  }

  if (step === "payment") {
    return (
      <PaymentPage
        amount={FEE_PER_PLAYER * registrants.length}
        onBack={() => { setCurrent(registrants.length - 1); setStep("details"); }}
        onFinish={async (proof) => {
          await submit(registrants, proof);
        }}
      />
    );
  }

  return (
    <main className="registrationConfirmation">
      <section className="registrationConfirmation__card" aria-labelledby="registration-confirmation-title">
        <Link to="/" className="registrationConfirmation__logo" aria-label="Return to the home screen">
          <img src={logo} alt="Disc Golf South Africa" />
        </Link>
        <div className="registrationConfirmation__check" aria-hidden="true">✓</div>
        <p className="registrationConfirmation__eyebrow">Tournament registration</p>
        <h1 id="registration-confirmation-title">Registration complete</h1>
        <p className="registrationConfirmation__message">
          Your registration and proof of payment have been submitted successfully.
        </p>
        <p className="registrationConfirmation__note">
          We&apos;ll review your payment and contact you if anything else is needed.
        </p>
        <Link to="/" className="registrationConfirmation__button">
          Return to home
        </Link>
      </section>
    </main>
  );
}