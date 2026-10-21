import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Table, Form, Dropdown, Alert, Spinner } from "react-bootstrap";
import { Search, PlusLg, XLg, PersonVcard, PersonBadge, CalendarEvent } from "react-bootstrap-icons";
import DashboardLayout from "./dashboardlayout";
import { CardHeader, FilterButton, EmptyNote } from "./dashboardui";
import {
  getAdminPayments, getAdminMembers, getAdminRegistrations, getEvents,
  updatePaymentStatus, proofUrl,
} from "../../services/api";
import "../../Styling/admindashboardpage.css";

const STATUS_LABEL = { on_time: "On time", pending: "Pending", overdue: "Overdue" };
// The design doesn't list what the Actions menu contains: these are the three statuses plus viewing the proof
const STATUS_ACTIONS = [
  ["on_time", "Mark as on time"],
  ["pending", "Mark as pending"],
  ["overdue", "Mark as overdue"],
];

const includesText = (term, ...values) =>
  !term || values.some((v) => String(v ?? "").toLowerCase().includes(term));

function TierBadge({ tier }) {
  const Icon = tier === "dgsa" ? PersonVcard : PersonBadge;
  return (
    <span className="tier">
      <Icon aria-hidden="true" /> {tier === "dgsa" ? "DGSA" : "Free"}
    </span>
  );
}

/** Screenshot 2: admin dashboard */
export default function AdminDashboardPage() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [eventId, setEventId] = useState(""); // "" = all tournaments
  const [search, setSearch] = useState("");
  const [regSearch, setRegSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proofPreview, setProofPreview] = useState(null);
  const [proofAsset, setProofAsset] = useState({ status: "idle", url: "", type: "" });

  const loadMembers = useCallback(async () => {
    const r = await getAdminMembers();
    if (r.ok) setMembers(r.data.members);
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([getAdminPayments(), getAdminMembers(), getEvents()]).then(([p, m, e]) => {
      if (!alive) return;
      if (p.ok) setPayments(p.data.payments);
      if (m.ok) setMembers(m.data.members);
      if (e.ok) setEvents(e.data.events);
      const failed = [p, m, e].find((r) => !r.ok);
      if (failed) setError(failed.data.message ?? "Some dashboard data couldn't be loaded.");
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    getAdminRegistrations(eventId).then((r) => alive && r.ok && setRegistrations(r.data.registrations));
    return () => { alive = false; };
  }, [eventId]);

  const changeStatus = async (payment, status) => {
    const before = payments;
    setPayments((list) => list.map((p) => (p.id === payment.id ? { ...p, status } : p))); // update the screen straight away
    const r = await updatePaymentStatus(payment.id, status);
    if (!r.ok) {
      setPayments(before);
      setError(r.data.message ?? "We couldn't update that payment.");
    } else if (payment.type === "membership" && status === "on_time") {
      loadMembers(); // their tier changes to DGSA
    }
  };

  const term = search.trim().toLowerCase();
  const regTerm = regSearch.trim().toLowerCase();
  const shownPayments = useMemo(() => payments.filter((p) => includesText(term, p.name, p.type)), [payments, term]);
  const shownMembers = useMemo(() => members.filter((m) => includesText(term, m.name, m.contact)), [members, term]);
  const shownRegs = useMemo(
    () => registrations.filter((r) => includesText(regTerm, r.name, r.tournament)),
    [registrations, regTerm]
  );
  const selectedEvent = events.find((e) => e.id === eventId);

  const openProof = (payment) => {
    setProofPreview({ id: payment.id, name: payment.name });
    setProofAsset({ status: "loading", url: "", type: "" });
  };

  useEffect(() => {
    if (!proofPreview) {
      setProofAsset({ status: "idle", url: "", type: "" });
      return undefined;
    }

    let alive = true;
    let objectUrl = "";
    fetch(proofUrl(proofPreview.id), { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("The proof of payment could not be loaded.");
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (alive) setProofAsset({ status: "ready", url: objectUrl, type: blob.type });
      })
      .catch((loadError) => {
        if (alive) {
          setProofAsset({ status: "error", url: "", type: "" });
          setError(loadError.message);
        }
      });

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [proofPreview]);

  const actions = (
    <>
      <div className="dash-search-wrap">
        <Search aria-hidden="true" />
        <Form.Control
          type="search"
          className="dash-search"
          placeholder="Search..."
          aria-label="Search payments and members"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Link to="/dashboard/events/new" className="dash-add-btn">
        <PlusLg aria-hidden="true" /> Add an Event
      </Link>
    </>
  );

  return (
    <DashboardLayout variant="admin" actions={actions}>
      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
      {loading ? (
        <Spinner animation="border" role="status" aria-label="Loading" />
      ) : (
        <Row className="g-3">
          <Col lg={5}>
            <Card className="dash-card h-100">
              <Card.Body>
                <CardHeader title="Live Payment Feed">
                  <FilterButton label="Filter payments" />
                </CardHeader>
                {shownPayments.length === 0 ? (
                  <EmptyNote>No payments to show.</EmptyNote>
                ) : (
                  <ul className="pay-list">
                    {shownPayments.map((p) => (
                      <li key={p.id} className="pay-item">
                        <div className="pay-item__main">
                          <p className="pay-item__name">{p.name}</p>
                          <p className="pay-item__type">
                            {p.type === "membership" ? <PersonVcard aria-hidden="true" /> : <CalendarEvent aria-hidden="true" />}
                            {p.type === "membership" ? "Membership" : "Event"}
                          </p>
                          <button type="button" className="dash-link dash-link-button" onClick={() => openProof(p)}>
                            Proof of Payment
                          </button>
                        </div>
                        <div className="pay-item__side">
                          <span className={`status status--${p.status}`}>{STATUS_LABEL[p.status]}</span>
                          <Dropdown align="end">
                            <Dropdown.Toggle size="sm" className="pay-actions">Actions</Dropdown.Toggle>
                            <Dropdown.Menu>
                              {STATUS_ACTIONS.map(([value, label]) => (
                                <Dropdown.Item
                                  key={value}
                                  active={p.status === value}
                                  onClick={() => changeStatus(p, value)}
                                >
                                  {label}
                                </Dropdown.Item>
                              ))}
                              <Dropdown.Divider />
                              <Dropdown.Item as="button" onClick={() => openProof(p)}>
                                View proof of payment
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7} className="d-flex flex-column gap-3">
            <Card className="dash-card">
              <Card.Body>
                <CardHeader title="Member Overview">
                  <FilterButton label="Filter members" />
                </CardHeader>
                {shownMembers.length === 0 ? (
                  <EmptyNote>No members to show.</EmptyNote>
                ) : (
                  <div className="dash-scroll">
                    <Table className="dash-table" responsive>
                      <thead>
                        <tr><th>Name</th><th>Tier</th><th>Contact</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {shownMembers.map((m) => (
                          <tr key={m.id}>
                            <td>{m.name}</td>
                            <td><TierBadge tier={m.tier} /></td>
                            <td>{m.contact ?? "—"}</td>
                            <td>
                              <span className={`status status--${m.status}`}>
                                {m.status === "active" ? "Active" : "In-active"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="dash-card">
              <Card.Body>
                <CardHeader title="Tournament Registrations">
                  <div className="d-flex align-items-center gap-2">
                    <Dropdown>
                      <Dropdown.Toggle size="sm" className="event-chip">
                        {selectedEvent?.name ?? "All tournaments"}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setEventId("")}>All tournaments</Dropdown.Item>
                        {events.map((e) => (
                          <Dropdown.Item key={e.id} active={e.id === eventId} onClick={() => setEventId(e.id)}>
                            {e.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                    {eventId && (
                      <button type="button" className="chip-clear" aria-label="Show all tournaments" onClick={() => setEventId("")}>
                        <XLg aria-hidden="true" />
                      </button>
                    )}
                    <Form.Control
                      type="search"
                      size="sm"
                      className="reg-search"
                      placeholder="Search..."
                      aria-label="Search registrations"
                      value={regSearch}
                      onChange={(e) => setRegSearch(e.target.value)}
                    />
                  </div>
                </CardHeader>
                {shownRegs.length === 0 ? (
                  <EmptyNote>No registrations to show.</EmptyNote>
                ) : (
                  <div className="dash-scroll">
                    <Table className="dash-table" responsive>
                      <thead>
                        <tr><th>Name</th><th>Tier</th><th>Tournament</th><th>POP</th></tr>
                      </thead>
                      <tbody>
                        {shownRegs.map((r) => (
                          <tr key={r.id}>
                            <td>{r.name}</td>
                            <td><TierBadge tier={r.tier} /></td>
                            <td>{r.tournament}</td>
                            <td>
                              <button
                                type="button"
                                className="dash-link dash-link-button"
                                onClick={() => openProof({ id: r.paymentId, name: r.name })}
                              >
                                Proof of Payment
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      {proofPreview && (
        <div className="proof-preview" role="dialog" aria-modal="true" aria-labelledby="proof-preview-title">
          <button
            type="button"
            className="proof-preview__backdrop"
            aria-label="Close proof preview"
            onClick={() => setProofPreview(null)}
          />
          <section className="proof-preview__dialog">
            <header className="proof-preview__header">
              <div>
                <p className="proof-preview__eyebrow">Payment proof</p>
                <h2 id="proof-preview-title">{proofPreview.name}</h2>
              </div>
              <button type="button" className="proof-preview__close" onClick={() => setProofPreview(null)}>
                <XLg aria-hidden="true" />
                <span className="visually-hidden">Close proof preview</span>
              </button>
            </header>
            <div className="proof-preview__body">
              {proofAsset.status === "loading" && <p className="proof-preview__status">Loading proof…</p>}
              {proofAsset.status === "error" && (
                <p className="proof-preview__status proof-preview__status--error">
                  Unable to load this proof of payment.
                </p>
              )}
              {proofAsset.status === "ready" && proofAsset.type === "application/pdf" && (
                <iframe
                  className="proof-preview__document"
                  src={proofAsset.url}
                  title={`Proof of payment from ${proofPreview.name}`}
                />
              )}
              {proofAsset.status === "ready" && proofAsset.type.startsWith("image/") && (
                <img src={proofAsset.url} alt={`Proof of payment from ${proofPreview.name}`} />
              )}
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}