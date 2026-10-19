import { useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import DgsaNavbar from "./assets/components/navbar";
import AnimatedBackground from "./assets/components/animatedbackground";
import RegistrationFlow from "./assets/components/registrationflow";
import LoginPage from "./pages/auth/loginpage";
import SignUpPage from "./pages/auth/signuppage";
import AdminDashboardPage from "./pages/dashboard/admindashboardpage";
import MemberDashboardPage from "./pages/dashboard/memberdashboardpage";
import NewEventPage from "./pages/dashboard/neweventpage";
import ProfilePage from "./pages/dashboard/profilepage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import './App.css';
import tournamentPoster from "./assets/images/image1.png";
import eventImageTwo from "./assets/images/image2.png";
import eventImageThree from "./assets/images/image3.png";
import eventImageFour from "./assets/images/image4.png";
import eventImageFive from "./assets/images/image5.png";
import eventImageSix from "./assets/images/image6.png";
import tournamenthighlight from "./assets/images/Highlight Image.png";
import dgsaLogo from "./assets/images/discgolf_logo.png";

const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? window.location.origin : "http://localhost:5000");

/*Data Given for the App from the figma file*/
const Events = [
  {
    id: 1,
    title: "South Africa Open",
    location: "Inanda Disc Golf Course, Kylami",
    date: "12th June",
    time: "07:00 AM",
    image: tournamentPoster,
  },
  {
    id: 2,
    title: "Ladies and Mens Doubles",
    location: "Inanda Disc Golf Course, Kylami",
    date: "13-14 Jun",
    time: "7:00",
    image: eventImageTwo,
  },
    {
    id: 3,
    title: "Ladies' Singles",
    location: "Inanda Disc Golf Course, Kylami",
    date: "24 Jun",
    time: "10:00",
    image: eventImageThree,
  },
     {
    id: 4,
    title: "Gauteng Open",
    location: "Inanda Disc Golf Course, Kylami",
    date: "10 Oct",
    time: "07:00",
    image: eventImageFour,
  },
     {
    id: 5,
    title: "North vs South",
    location: "Inanda Disc Golf Course, Kylami",
    date: "23 Oct",
    time: "14:00",
    image: eventImageFive,
  },
     {
    id: 6,
    title: "Eden Christmas Clash",
    location: "Inanda Disc Golf Course, Kylami",
    date: "21 Dec",
    time: "10:00",
    image: eventImageSix,
  },
];

const FAQS = [
  {
    id: 1,
    question: "Where can I play?",
    answer: `There are multiple locations you can play disc golf including:

Inanda Disc Golf Course, Gauteng, Kyalami. Bart: 0794917034

The Big Red Barn, Gauteng, Irene. Jandre: 0823472182

Zwartkop Country Club, Gauteng, Centurion. Jandre: 0823472182

Derdepoort Recreational Resort, Gauteng, Pretoria. Etienne: 0832359090

Marais Steyn Park, Gauteng, Edenvale. Charles: 0613351883

Rooirivierrif, Western Cape, George. Leon: 0823303966

Stellenbosch, Western Cape. Chris: 0825751061
Note that each course may have it’s own entrance fee and some courses are by reservation only.`,
  },

  { id: 2, question: "What is Disc Golf?", answer: "Disc golf is a flying disc sport where players throw a specialised disc from a tee area into an elevated metal basket with the goal of completing a course in the fewest throws possible" },
  { id: 3, question: "Why should I become a DGSA member", answer: "Joining DGSA helps us grow the sport in the country by allowing us to host events, run leagues, do clinics, do activations. Joining DGSA will also give you cheaper event entrance, priority registration and access to DGSA merchandise" },
  { id: 4, question: "Can i play if I’ve never played before?", answer: "Absolutely, disc golf is a low barrier to entry sport that is easy for new players to pick up and enjoy" },
];

/*Components for the App*/

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero_text">
        <p className="hero_welcome">Welcome to</p>
        <h1 className="hero_title">Disc Golf South Africa</h1>
      </div>
      <p className="hero_tagline">
        Discover your new <br /> favourite hobby
      </p>
    </section>
  );
}

function Tournament() {
  const { user } = useAuth();

  return (
    <section id="tournament" className="section">
      <h2 className="section_title">Tournament</h2>

      <article className="tournament">
        <img
          className="tournament_poster"
          src={tournamenthighlight}
          alt="1st PDGA African Disc Golf Championship poster"
        />

        <div className="tournament_info">
          <h3 className="tournament_title">1st African Disc Golf Championship</h3>

          <p>
            Disc Golf South Africa, the PDGA's country partner, will host the
            inaugural PDGA African Disc Golf Championship at Inanda Disc Golf
            Course in Kyalami, Johannesburg. Top African players will compete
            for the title of 'African Champion,' awarded to the
            highest-finishing African athletes in the MPO and FPO divisions.
          </p>

          <p>
            PDGA Website:{" "}
            <a
              href="https://www.pdga.com/"
              target="_blank"
              rel="noreferrer"
            >
              1st PDGA African Disc Golf Championship
            </a>
          </p>

          <ul className="tournament_details">
            <li>Fri-Sun, November 6-8, 2026</li>
            <li>Inanda Country Base, Kyalami</li>
            <li>PDGA C-Tier</li>
          </ul>

          <Link className="disc-button-tournament" to={user ? "/registration" : "/signup"}>
            Join the tournament
          </Link>
        </div>
      </article>
    </section>
  );
}

function UpcomingEvents() {
  const [start, setStart] = useState(0);
  const visible = 3;
  const canPrev = start > 0;
  const canNext = start + visible < Events.length;

  return (
    <section className="section">
      <h2 className="section_title">Upcoming Events</h2>

      <div className="carousel">
        <button
          className="disc-button-upcoming-events"
          type="button"
          aria-label="Previous events"
          disabled={!canPrev}
          onClick={() => setStart((s) => s - 1)}
        >
          ‹
        </button>

        <div className="carousel_track">
          {Events.slice(start, start + visible).map((event) => (
            <article key={event.id} className="event-card">
              <img src={event.image} alt={event.title} />
              <div className="event-card__body">
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.location}</p>
                </div>
                <div className="event-card_when">
                  <strong>{event.date}</strong>
                  <strong>{event.time}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          className="disc-button-upcoming-events"
          type="button"
          aria-label="Next events"
          disabled={!canNext}
          onClick={() => setStart((s) => s + 1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}

function Faq() {
  const [openId, setOpenId] = useState(null);

  return (
    <section id="faq" className="section">
      <h2 className="section_title">FAQ Accordion</h2>

      <div className="faq">
        {FAQS.map(({ id, question, answer }) => {
          const isOpen = openId === id;
          return (
            <div key={id} className={`faq__item ${isOpen ? "is-open" : ""}`}>
              <button
                className="disc-button-faq"
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : id)}
              >
                {question}
                <span className="faq__chevron" aria-hidden="true">⌄</span>
              </button>
              {isOpen && <p className="faq__answer">{answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <ul className="footer__links">
        <li><a href="#home">Home page</a></li>
        <li><a href="#faq">FAQ Accordion</a></li>
        <li><a href="#tournament">Tournament &amp; Event</a></li>
      </ul>

      <div className="footer__contact">
        <a href="mailto:info@discgolfsa.org">info@discgolfsa.org</a>
        <a href="tel:0794917034">079 491 7034</a>
      </div>

      <img
        className="footer__logo"
        src={dgsaLogo}
        alt="Disc Golf South Africa"
      />
    </footer>
  );
}

/* MAIN PAGE*/

function HomePage() {
  return (
    <>
      <DgsaNavbar />
      <main>
        <Hero />
        <Tournament />
        <UpcomingEvents />
        <Faq />
      </main>
      <Footer />
    </>
  );
}

function RegistrationRoute() {
  const navigate = useNavigate();

  return <RegistrationFlow onBackToDashboard={() => navigate("/")} />;
}

function LoginRoute() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return (
    <LoginPage
      onGoToSignUp={() => navigate("/signup")}
      onLogin={async (email, password) => {
        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          });
          const result = await response.json();
          if (!response.ok) return { ok: false, ...result };
          setUser(result.user);
          navigate("/");
          return { ok: true };
        } catch {
          return { ok: false, field: "email", message: "Unable to connect to the backend." };
        }

      }}
    />
  );
}

function DashboardRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading your dashboard…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? <AdminDashboardPage /> : <MemberDashboardPage />;
}

function SignUpRoute() {
  const navigate = useNavigate();

  return (
    <SignUpPage
      onGoToLogin={() => navigate("/login")}
      onSignUp={async ({ name, email, password }) => {
        try {
          const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, email, password }),
          });
          const result = await response.json();
          if (!response.ok) return { ok: false, ...result };
        } catch {
          return { ok: false, field: "email", message: "Unable to connect to the backend." };
        }
        navigate("/login");
        return { ok: true };
      }}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedBackground />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/signup" element={<SignUpRoute />} />
            <Route path="/dashboard" element={<DashboardRoute />} />
            <Route path="/dashboard/profile" element={<ProtectedDashboardRoute />} />
            <Route path="/dashboard/payments" element={<AdminDashboardRoute />} />
            <Route path="/dashboard/events/new" element={<AdminDashboardRoute page="new-event" />} />
            <Route path="/registration" element={<RegistrationRoute />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

function ProtectedDashboardRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading your profile…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <ProfilePage />;
}

function AdminDashboardRoute({ page }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading your dashboard…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return page === "new-event" ? <NewEventPage /> : <AdminDashboardPage />;
}
