import { useState } from "react";
import RegistrationPage from "../../pages/registrationpage";
import RegistrantDetailsPage from "../../pages/registrationdetailspage";
import PaymentPage from "../../pages/registrationpaymentpage";

const FEE_PER_PLAYER = 300; // R300 shown in the design: confirm if this is per player or a flat fee

// replace with your real API calls
async function checkEmailExists(email) {
  // const res = await fetch(`/api/users/exists?email=${encodeURIComponent(email)}`);
  // return (await res.json()).exists;
  return true;
}
async function submitRegistration(payload) {
  // const body = new FormData(); ... await fetch("/api/registrations", { method: "POST", body });
  console.log("Submit", payload);
}

const emptyRegistrant = () => ({ email: "", membershipId: "", division: "" });

export default function RegistrationFlow({ onBackToDashboard }) {
  const [step, setStep] = useState("choice"); // choice | details | payment | done
  const [registrants, setRegistrants] = useState([]);
  const [current, setCurrent] = useState(0);

  const beginMultiple = (count) => {
    setRegistrants(Array.from({ length: count }, emptyRegistrant));
    setCurrent(0);
    setStep("details");
  };

  const updateRegistrant = (updated) =>
    setRegistrants((list) => list.map((r, i) => (i === current ? updated : r)));

  if (step === "choice") {
    return (
      <RegistrationPage
        onBackToDashboard={onBackToDashboard}
        onBeginMultiple={beginMultiple}
        onSubmitSingle={async (data) => {
          await submitRegistration({ registrants: [data], proof: data.proof });
          setStep("done");
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
          await submitRegistration({ registrants, proof });
          setStep("done");
        }}
      />
    );
  }

  return <p>Registration complete.</p>; // replace with your confirmation page
}