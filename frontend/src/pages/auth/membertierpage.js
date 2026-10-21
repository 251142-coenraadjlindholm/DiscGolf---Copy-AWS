import { Container, Card, Row, Col, Button } from "react-bootstrap";
import "../../Styling/registrationlayout.css";
import "../../Styling/membertierpage.css";
import logo from "../../assets/images/discgolf_logo.png";

// Copy the exact text from Figma. The descriptions were too small to read in the screenshot.
const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "R0",
    description: "", // TODO: paste description from Figma
    perks: ["Register for Tournaments"],
    cta: "Continue",
  },
  {
    id: "member",
    name: "DGSA Member",
    price: "R370",
    description: "", // TODO: paste description from Figma
    perks: [
      "Register for Tournaments",
      "Discounted Tournament Registration Fees",
      "Access to DGSA Exclusive Merchandise",
      "Priority Registration",
    ],
    cta: "Choose membership",
  },
];

export default function MemberTierPage({ onSelectFree, onSelectMember }) {
  const handlers = { free: onSelectFree, member: onSelectMember };

  return (
    <main className="reg-page">
      <Container className="reg-wrap">
        <Card className="reg-card tier-panel">
          <Card.Body>
            <img className="tier__logo" src={logo} alt="Disc Golf South Africa" />
            <h1 className="reg-title tier__title">
              <span className="reg-title__main">Member Tier</span>
            </h1>

            <Row className="g-4 justify-content-center">
              {TIERS.map((tier) => (
                <Col key={tier.id} xs={12} md={6} lg={5}>
                  <Card className="tier-card h-100">
                    <Card.Body className="d-flex flex-column gap-3">
                      <h2 className="tier-card__name">{tier.name}</h2>
                      <p className="tier-card__price">
                        <span className="tier-card__amount">{tier.price}</span> / Year
                      </p>
                      {tier.description && <p className="tier-card__desc">{tier.description}</p>}

                      <Button className="reg-btn" onClick={handlers[tier.id]}>{tier.cta}</Button>

                      <ul className="tier-card__perks">
                        {tier.perks.map((perk) => (
                          <li key={perk}><span aria-hidden="true">✓</span> {perk}</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}