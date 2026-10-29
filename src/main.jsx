import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Menu, X, Search, MapPin, BedDouble, Bath, Ruler, ShieldCheck,
  BadgeCheck, MapPinned, Heart, Phone, Mail, ChevronDown, ArrowUpRight
} from "lucide-react";
import { properties, CONTACT } from "./data";
import Listings from "./Listings";
import PropertyDetail from "./PropertyDetail";
import "./styles.css";
import "./pages.css";

const getRoute = () => (window.location.hash.startsWith("#/") ? window.location.hash.slice(1) : "/");

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem("rexaura-saved")) || []; } catch { return []; } });
  const [route, setRoute] = useState(getRoute);
  const toggleSave = (id) => setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  useEffect(() => { try { localStorage.setItem("rexaura-saved", JSON.stringify(saved)); } catch {} }, [saved]);
  useEffect(() => {
    const onHash = () => { setRoute(getRoute()); setMenuOpen(false); if (window.location.hash.startsWith("#/")) window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { document.title = route === "/listings" ? "Listings | Rexaura Properties" : route.startsWith("/property/") ? "Property Details | Rexaura Properties" : "Rexaura Properties | Luxury Living"; }, [route]);

  function goSection(e, id) {
    e.preventDefault();
    setMenuOpen(false);
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    if (route === "/") scroll();
    else { window.location.hash = "#/"; setTimeout(scroll, 150); }
  }

  const setField = (k) => (e) => setContact({ ...contact, [k]: e.target.value });
  function sendContact(e) {
    e.preventDefault();
    const subject = encodeURIComponent(`Enquiry from ${contact.name}`);
    const body = encodeURIComponent(`${contact.message}\n\nName: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone}`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#/" aria-label="Rexaura Properties home">
          <span className="brand-mark"><span className="brand-diamond">R</span></span>
          <span className="brand-copy"><strong>REXAURA</strong><small>PROPERTIES</small></span>
        </a>
        <button className="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          <a href="#/" className={route === "/" ? "active" : ""}>Home</a>
          <a href="#/listings" className={route === "/listings" || route.startsWith("/property/") ? "active" : ""}>Properties</a>
          <a href="#/" onClick={(e) => goSection(e, "locations")}>Locations</a>
          <a href="#/" onClick={(e) => goSection(e, "about")}>About</a>
          <a href="#/" onClick={(e) => goSection(e, "contact")}>Contact</a>
          <a href="#/" className="nav-cta" onClick={(e) => goSection(e, "contact")}><Mail size={16} /> Contact Us</a>
        </nav>
      </header>

      <main>
        {route === "/listings" ? <Listings search={search} setSearch={setSearch} location={location} setLocation={setLocation} saved={saved} toggleSave={toggleSave} />
        : route.startsWith("/property/") ? <PropertyDetail id={route.split("/")[2]} saved={saved} toggleSave={toggleSave} />
        : <>
        <section className="hero" id="home">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <p className="eyebrow"><span></span> LUXURY REAL ESTATE, REDEFINED</p>
            <h1>Discover Luxury Living in <em>Port Harcourt &amp; Lagos</em></h1>
            <p className="hero-subtitle">Curated high-end homes and modern villas in Nigeria's most prestigious locations.</p>
            <form className="search-bar" onSubmit={(e) => { e.preventDefault(); window.location.hash = "#/listings"; }}>
              <Search size={22} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by location, property type, or name..." aria-label="Search properties" />
              <select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Choose location">
                <option>All locations</option><option>PORT HARCOURT</option><option>LAGOS</option>
              </select>
              <button type="submit">Search homes <ArrowUpRight size={17} /></button>
            </form>
            <div className="location-pills">
              <a href="#/listings" onClick={() => setLocation("PORT HARCOURT")}><MapPin size={17} /> Port Harcourt</a>
              <a href="#/listings" onClick={() => setLocation("LAGOS")}><MapPin size={17} /> Lagos</a>
            </div>
          </div>
          <div className="hero-bottom"><span>DISCREET SERVICE</span><i></i><span>EXCEPTIONAL HOMES</span><i></i><span>LOCAL EXPERTISE</span></div>
        </section>

        <section className="section properties-section" id="properties">
          <div className="section-heading">
            <div><p className="eyebrow">A SELECT COLLECTION</p><h2>Featured <em>Properties</em></h2><p>Handpicked homes in Nigeria's prime locations.</p></div>
            <a className="text-link" href="#/" onClick={(e) => goSection(e, "contact")}>Request a private viewing <ArrowUpRight size={17} /></a>
          </div>
          <div className="property-grid">
            {properties.filter((p) => p.home).map((p) => (
              <article className="property-card" key={p.id}>
                <div className="property-image" style={{ backgroundImage: `url("${p.image}")` }}>
                  <span className="property-tag">{p.location}</span>
                  <button className={saved.includes(p.id) ? "save-property saved" : "save-property"} aria-label="Save property" onClick={() => toggleSave(p.id)}><Heart fill={saved.includes(p.id) ? "currentColor" : "none"} size={19} /></button>
                </div>
                <div className="property-info">
                  <div className="property-title-row"><h3><a href={`#/property/${p.id}`}>{p.title}</a></h3><span className="price">{p.price}</span></div>
                  <p className="property-location"><MapPin size={15} /> {p.area}</p>
                  <div className="property-specs"><span><BedDouble /> {p.beds} Beds</span><span><Bath /> {p.baths} Baths</span><span><Ruler /> {p.size}</span></div>
                  <a href={`#/property/${p.id}`} className="property-action">View details <ArrowUpRight size={16} /></a>
                </div>
              </article>
            ))}
          </div>
          <div className="home-more"><a className="outline-button" href="#/listings">View all listings <ArrowUpRight size={16} /></a></div>
        </section>

        <section className="benefits" id="locations">
          <div className="benefit"><ShieldCheck /><h3>Exclusive Listings</h3><p>Access to premium properties curated for discerning buyers.</p></div>
          <div className="benefit"><BadgeCheck /><h3>Verified &amp; Secure</h3><p>Every listing is reviewed with care and attention to detail.</p></div>
          <div className="benefit"><MapPinned /><h3>Local Expertise</h3><p>Deep knowledge of Port Harcourt and Lagos property markets.</p></div>
        </section>

        <section className="about-section section" id="about">
          <div className="about-image" role="img" aria-label="Luxury contemporary interior"></div>
          <div className="about-copy"><p className="eyebrow">THE REXAURA DIFFERENCE</p><h2>Find a place that feels like <em>your future.</em></h2><p>We connect people with exceptional homes through thoughtful guidance, local insight, and a service built around your needs.</p><p>Whether you are searching for a family residence, a modern villa, or a long-term investment, our team is ready to help you take the next step with confidence.</p><a className="outline-button" href="#/" onClick={(e) => goSection(e, "contact")}>Meet your property partner <ArrowUpRight size={16} /></a></div>
        </section>

        <section className="contact-section section" id="contact">
          <div><p className="eyebrow">LET'S TALK PROPERTY</p><h2>Your next chapter <em>starts here.</em></h2><p>Tell us what you are looking for and our team will help you explore the right options.</p></div>
          <div className="contact-stack">
          <div className="contact-card">
            <a href="mailto:rexgroups.uk@gmail.com"><Mail /> <span><small>Email us</small><strong>rexgroups.uk@gmail.com</strong></span><ArrowUpRight /></a>
            <a href="tel:+2348033564331"><Phone /> <span><small>Call our team</small><strong>0803 356 4331</strong></span><ArrowUpRight /></a>
            <a href="https://wa.me/2348033564331" target="_blank" rel="noreferrer"><span className="whatsapp-mark">WA</span><span><small>WhatsApp</small><strong>Chat with our team</strong></span><ArrowUpRight /></a>
          </div>
          <form className="contact-form" onSubmit={sendContact}>
            <h3>Send us a message</h3>
            <label>Your name<input value={contact.name} onChange={setField("name")} placeholder="Enter your name" required autoComplete="name" /></label>
            <div className="two-col">
              <label>Email<input type="email" value={contact.email} onChange={setField("email")} placeholder="you@example.com" required autoComplete="email" /></label>
              <label>Phone<input type="tel" value={contact.phone} onChange={setField("phone")} placeholder="0800 000 0000" autoComplete="tel" /></label>
            </div>
            <label>Message<textarea rows="4" value={contact.message} onChange={setField("message")} placeholder="Tell us what you are looking for..." required /></label>
            <button className="gold-button" type="submit">Send Message</button>
            {sent && <p className="auth-message" role="status">Your email app should open with your message. You can also call or WhatsApp us.</p>}
          </form>
          </div>

        </section>
      </>}
      </main>

      <footer className="site-footer">
        <div className="footer-top"><a className="brand" href="#/"><span className="brand-mark"><span className="brand-diamond">R</span></span><span className="brand-copy"><strong>REXAURA</strong><small>PROPERTIES</small></span></a><p>Luxury real estate, thoughtfully delivered.</p><div className="footer-links"><a href="#/listings">Properties</a><a href="#/" onClick={(e) => goSection(e, "about")}>About</a><a href="#/" onClick={(e) => goSection(e, "contact")}>Contact</a></div></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Rexaura Properties. All rights reserved.</span><span><a href="mailto:rexgroups.uk@gmail.com">rexgroups.uk@gmail.com</a> · <a href="tel:+2348033564331">08033564331</a></span></div>
      </footer>

    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
