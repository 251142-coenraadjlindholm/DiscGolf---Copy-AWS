import { Card } from "react-bootstrap";
import DashboardLayout from "./dashboardlayout";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout variant={user.role === "admin" ? "admin" : "member"}>
      <Card className="dash-card">
        <Card.Body>
          <h2>Profile</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Account type:</strong> {user.role === "admin" ? "Admin" : "User"}</p>
          <p><strong>Membership:</strong> {user.tier === "dgsa" ? "DGSA member" : "Free member"}</p>
          <p><strong>DGSA membership ID:</strong> {user.dgsaMembershipId || "Not assigned"}</p>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}
