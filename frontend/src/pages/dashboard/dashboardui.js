import { Button } from "react-bootstrap";
import { Sliders } from "react-bootstrap-icons";

// The design shows a filter icon on several cards but not what it filters,
// so it is disabled until you decide what each one should do.
export function FilterButton({ label = "Filter" }) {
  return (
    <Button variant="link" className="dash-icon-btn" disabled aria-label={label} title={`${label} (not wired up yet)`}>
      <Sliders aria-hidden="true" />
    </Button>
  );
}

export function CardHeader({ title, children }) {
  return (
    <div className="dash-card__head">
      <h2 className="dash-card__title">{title}</h2>
      <div className="d-flex align-items-center gap-2">{children}</div>
    </div>
  );
}

export function EmptyNote({ children }) {
  return <p className="dash-empty">{children}</p>;
}