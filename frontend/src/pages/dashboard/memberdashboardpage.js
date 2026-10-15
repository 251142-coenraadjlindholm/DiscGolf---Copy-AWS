import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Table, Carousel, Alert, Spinner } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import DashboardLayout from "./dashboardlayout";
import { CardHeader, FilterButton, EmptyNote } from "./dashboardui";
import { getMemberDashboard, assetUrl } from "../../services/api";
import { dateRangeLong, dateRangeShort, timeOf } from "./dateformat";
import "../../Styling/memberdashboard.css";

const chunk = (list, size) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="ev-card">
      {event.posterUrl && <img src={assetUrl(event.posterUrl)} alt="" className="ev-card__img" />}
      <div className="ev-card__info">
        <div>
          <p className="ev-card__name">{event.name}</p>
          <p className="ev-card__loc">{event.location}</p>
        </div>
        <div className="ev-card__when">
          <span>{dateRangeShort(event.startsAt, event.endsAt)}</span>
          <span>{timeOf(event.startsAt)}</span>
        </div>
      </div>
    </Link>
  );
}

/** Screenshot 1: member dashboard */
export default function MemberDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getMemberDashboard().then((r) => {
      if (!alive) return;
      if (r.ok) setData(r.data);
      else setError(r.data.message ?? "We couldn't load your dashboard.");
    });
    return () => { alive = false; };
  }, []);

  const slides = useMemo(() => chunk(data?.upcomingEvents ?? [], 2), [data]);
  const featured = data?.featuredEvent;

  return (
    <DashboardLayout variant="member">
      {error && <Alert variant="danger">{error}</Alert>}
      {!data && !error && <Spinner animation="border" role="status" aria-label="Loading" />}

      {data && (
        <Row className="g-3">
          <Col lg={5}>
            <Card className="dash-card h-100">
              <Card.Body>
                <CardHeader title="What's Happening Soon" />
                {featured?.posterUrl ? (
                  <Link to={`/events/${featured.id}`}>
                    <img src={assetUrl(featured.posterUrl)} alt={`${featured.name} poster`} className="poster" />
                  </Link>
                ) : (
                  <EmptyNote>No upcoming events yet.</EmptyNote>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7} className="d-flex flex-column gap-3">
            <Card className="dash-card">
              <Card.Body>
                <CardHeader title="My Event Registrations">
                  <FilterButton label="Filter my registrations" />
                </CardHeader>
                {data.myRegistrations.length === 0 ? (
                  <EmptyNote>You haven't registered for any events yet.</EmptyNote>
                ) : (
                  <div className="dash-scroll">
                    <Table className="dash-table" responsive>
                      <thead>
                        <tr><th>Name</th><th>Location</th><th>Date</th><th>Info</th></tr>
                      </thead>
                      <tbody>
                        {data.myRegistrations.map((r) => (
                          <tr key={r.id}>
                            <td>{r.name}</td>
                            <td>{r.location}</td>
                            <td>{dateRangeLong(r.startsAt, r.endsAt)}</td>
                            <td><Link to={`/events/${r.eventId}`} className="dash-link">More Info</Link></td>
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
                <CardHeader title="View All Upcoming Events">
                  <FilterButton label="Filter upcoming events" />
                </CardHeader>
                {slides.length === 0 ? (
                  <EmptyNote>No upcoming events yet.</EmptyNote>
                ) : (
                  <Carousel
                    interval={null}
                    variant="dark"
                    indicators={slides.length > 1}
                    controls={slides.length > 1}
                    prevIcon={<ChevronLeft aria-hidden="true" />}
                    nextIcon={<ChevronRight aria-hidden="true" />}
                    className="ev-carousel"
                  >
                    {slides.map((pair, i) => (
                      <Carousel.Item key={i}>
                        <Row className="g-2">
                          {pair.map((ev) => <Col key={ev.id} xs={6}><EventCard event={ev} /></Col>)}
                        </Row>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </DashboardLayout>
  );
}