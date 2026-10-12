import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import logo from "../images/discgolf_logo.png";

function DgsaNavbar() {
  return (
    <Navbar expand="md" data-bs-theme="dark" className="dgsa-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="Disc Golf South Africa" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="dgsa-nav" />

        <Navbar.Collapse id="dgsa-nav">
          <Nav className="mx-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#tournament">Tournament/Event</Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
            <Nav.Link as={Link} to="/signup">Sign up</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DgsaNavbar;