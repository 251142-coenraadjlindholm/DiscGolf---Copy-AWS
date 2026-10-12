import { useState } from "react";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import MemberTierPage from "./MemberTierPage";
import MemberDetailsPage from "./MemberDetailsPage";
import MemberAddressPage from "./MemberAddressPage";
import MembershipPaymentPage from "./MembershipPaymentPage";

const MEMBERSHIP_FEE = 370; // the payment screen shows R370, the tier card shows R375: confirm

// TODO: replace these stubs with your real API calls
async function login(email, password) {
  // return { ok: false, field: "email", message: "Email not found. This user must create an account." };
  // return { ok: false, field: "password", message: "Incorrect password." };
  return { ok: true };
}
async function registerUser({ name, email, password }) {
  // return { ok: false, field: "email", message: "An account with this email already exists." };
  return { ok: true };
}
async function submitMembership({ account, member, proof }) {
  console.log("Membership", { account, member, proof });
}

const emptyMember = {
  gender: "", dob: "", saId: "", passport: "", mobile: "", division: "",
  homeAddress: "", country: "", province: "", city: "", suburb: "", zip: "",
};

export default function AuthFlow({ onAuthenticated }) {
  // login | signup | tier | details | address | payment
  const [step, setStep] = useState("login");
  const [account, setAccount] = useState({ name: "", email: "" });
  const [member, setMember] = useState(emptyMember);

  if (step === "login") {
    return (
      <LoginPage
        onGoToSignUp={() => setStep("signup")}
        onLogin={async (email, password) => {
          const result = await login(email, password);
          if (result.ok) onAuthenticated(); // go to the user's dashboard
          return result;
        }}
      />
    );
  }

  if (step === "signup") {
    return (
      <SignUpPage
        onGoToLogin={() => setStep("login")}
        onSignUp={async (values) => {
          const result = await registerUser(values);
          if (result.ok) {
            setAccount({ name: values.name, email: values.email }); // never keep the password in state
            setStep("tier");
          }
          return result;
        }}
      />
    );
  }

  if (step === "tier") {
    return (
      <MemberTierPage
        onSelectFree={onAuthenticated}
        onSelectMember={() => setStep("details")}
      />
    );
  }

  if (step === "details") {
    return (
      <MemberDetailsPage
        data={member}
        onChange={setMember}
        onBack={() => setStep("signup")}
        onNext={() => setStep("address")}
      />
    );
  }

  if (step === "address") {
    return (
      <MemberAddressPage
        data={member}
        onChange={setMember}
        onBack={() => setStep("details")}
        onNext={() => setStep("payment")}
      />
    );
  }

  return (
    <MembershipPaymentPage
      amount={MEMBERSHIP_FEE}
      onCreateAccount={async (proof) => {
        await submitMembership({ account, member, proof });
        onAuthenticated();
      }}
    />
  );
}