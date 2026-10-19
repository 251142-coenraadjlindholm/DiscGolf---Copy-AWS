import { API_URL, readResponse } from "../context/AuthContext";

async function get(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include", ...options });
  return readResponse(response);
}

export const getMemberDashboard = () => get("/api/dashboard/member");
export const getAdminPayments = () => get("/api/admin/payments");
export const getAdminMembers = () => get("/api/admin/members");
export const getAdminRegistrations = (eventId = "") =>
  get(`/api/admin/registrations${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}`);
export const getEvents = () => get("/api/events");
export const purchaseMembership = () => get("/api/users/membership/purchase", { method: "POST" });

export async function createEvent(values, poster) {
  const body = new FormData();
  Object.entries(values).forEach(([key, value]) => body.append(key, value));
  body.append("poster", poster);
  const response = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    credentials: "include",
    body,
  });
  return readResponse(response);
}

export async function updatePaymentStatus(id, status) {
  return get(`/api/admin/payments/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export const proofUrl = (id) => `${API_URL}/api/payments/${id}/proof`;
export const assetUrl = (url) => (url?.startsWith("http") ? url : `${API_URL}${url || ""}`);
