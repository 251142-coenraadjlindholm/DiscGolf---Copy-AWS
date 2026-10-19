import { useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import DashboardLayout from "./dashboardlayout";
import { useAuth } from "../../context/AuthContext";
import { purchaseMembership } from "../../services/api";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    setMessage("");
    setError("");
    const result = await purchaseMembership();
    if (result.ok) {
      setUser(result.data.user);
      setMessage("Your DGSA membership is now active. No real payment was processed.");
    } else {
      setError(result.data.message || "Unable to activate your membership.");
    }
    setPurchasing(false);
  };

  return (
    <DashboardLayout variant={user.role === "admin" ? "admin" : "member"}>
      <Card className="dash-card">
        <Card.Body>
          <h2>Profile</h2>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Account type:</strong> {user.role === "admin" ? "Admin" : "User"}</p>
          <p><strong>Membership:</strong> {user.tier === "dgsa" ? "DGSA member" : "Free member"}</p>
          <p><strong>DGSA membership ID:</strong> {user.tier === "dgsa" ? user.dgsaMembershipId : "Not assigned"}</p>
          {user.tier !== "dgsa" && (
            <Button type="button" onClick={handlePurchase} disabled={purchasing}>
              {purchasing ? <><Spinner size="sm" className="me-2" /> Activating…</> : "Buy DGSA membership (demo)"}
            </Button>
          )}
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}
