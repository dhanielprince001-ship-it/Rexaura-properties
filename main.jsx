import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Menu, X, Search, MapPin, BedDouble, Bath, Ruler, ShieldCheck,
  BadgeCheck, MapPinned, Heart, Phone, Mail, UserRound, LogOut,
  Camera, ChevronDown, ArrowUpRight, KeyRound
} from "lucide-react";
import { supabase } from "./supabase";
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
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
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

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!supabase || !user) { setProfile(null); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(data ?? { id: user.id, full_name: user.user_metadata?.full_name ?? "", avatar_url: user.user_metadata?.avatar_url ?? null });
    }
    loadProfile();
  }, [user]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthMessage("");
    if (!supabase) {
      setAuthMessage("Supabase is not configured yet. Add your project URL and publishable/anon key to the .env file.");
      return;
    }
    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        if (data.session) { setAuthOpen(false); setPassword(""); }
        else setAuthMessage("Account created. Check your email to confirm your address, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthOpen(false); setPassword("");
      }
    } catch (err) {
      setAuthMessage(err.message || "Unable to authenticate. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file || !supabase || !user) return;
    if (!file.type.startsWith("image/")) { setAuthMessage("Choose an image file."); return; }
    if (file.size > 3 * 1024 * 1024) { setAuthMessage("Please choose an image smaller than 3 MB."); return; }
    setPhotoBusy(true);
    setAuthMessage("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = urlData.publicUrl;
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id, full_name: profile?.full_name || user.user_metadata?.full_name || "",
        avatar_url: avatarUrl, updated_at: new Date().toISOString()
      });
      if (updateError) throw updateError;
      setProfile((p) => ({ ...p, id: user.id, avatar_url: avatarUrl }));
      setAuthMessage("Profile picture updated.");
    } catch (err) {
      setAuthMessage(err.message || "Could not upload profile picture.");
    } finally {
      setPhotoBusy(false);
      event.target.value = "";
    }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setAuthOpen(false);
  }

  function openAuth(mode = "login") {
    setAuthMode(mode);
    setAuthMessage("");
    setAuthOpen(true);
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
          {user ? (
            <div className="nav-user">
              <button className="avatar-button" onClick={() => openAuth("profile")} aria-label="Open profile">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="Your profile" /> : <UserRound size={18} />}
              </button>
              <button className="nav-cta compact" onClick={signOut}><LogOut size={15} /> Log out</button>
            </div>
          ) : <button className="nav-cta" onClick={() => openAuth("login")}><UserRound size={16} /> Login / Sign up</button>}
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
          <div className="contact-card">
            <a href="mailto:rexgroups.uk@gmail.com"><Mail /> <span><small>Email us</small><strong>rexgroups.uk@gmail.com</strong></span><ArrowUpRight /></a>
            <a href="tel:+2348033564331"><Phone /> <span><small>Call our team</small><strong>0803 356 4331</strong></span><ArrowUpRight /></a>
            <a href="https://wa.me/2348033564331" target="_blank" rel="noreferrer"><span className="whatsapp-mark">WA</span><span><small>WhatsApp</small><strong>Chat with our team</strong></span><ArrowUpRight /></a>
          </div>
        </section>
      </>}
      </main>

      <footer className="site-footer">
        <div className="footer-top"><a className="brand" href="#/"><span className="brand-mark"><span className="brand-diamond">R</span></span><span className="brand-copy"><strong>REXAURA</strong><small>PROPERTIES</small></span></a><p>Luxury real estate, thoughtfully delivered.</p><div className="footer-links"><a href="#/listings">Properties</a><a href="#/" onClick={(e) => goSection(e, "about")}>About</a><a href="#/" onClick={(e) => goSection(e, "contact")}>Contact</a></div></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Rexaura Properties. All rights reserved.</span><span><a href="mailto:rexgroups.uk@gmail.com">rexgroups.uk@gmail.com</a> · <a href="tel:+2348033564331">08033564331</a></span></div>
      </footer>

      {authOpen && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setAuthOpen(false); }}>
        <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <button className="modal-close" onClick={() => setAuthOpen(false)} aria-label="Close"><X /></button>
          {authMode === "profile" && user ? <>
            <div className="modal-brand"><span className="brand-mark"><span className="brand-diamond">R</span></span></div>
            <h2 id="auth-title">Your Profile</h2><p className="modal-subtitle">Manage your account details.</p>
            <div className="profile-picture">{profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" /> : <UserRound size={38} />}</div>
            <p className="profile-email">{user.email}</p>
            <label className="upload-button"><Camera size={17} /> {photoBusy ? "Uploading..." : "Change profile picture"}<input type="file" accept="image/*" onChange={handlePhoto} disabled={photoBusy} /></label>
            <p className="fine-print">Image files only · Maximum 3 MB</p>
          </> : <>
            <div className="modal-brand"><span className="brand-mark"><span className="brand-diamond">R</span></span></div>
            <h2 id="auth-title">{authMode === "signup" ? "Create your account" : "Welcome back"}</h2>
            <p className="modal-subtitle">{authMode === "signup" ? "Save properties and manage your profile." : "Log in to your Rexaura account."}</p>
            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === "signup" && <label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required autoComplete="name" /></label>}
              <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" /></label>
              <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} autoComplete={authMode === "signup" ? "new-password" : "current-password"} /></label>
              <button className="gold-button" type="submit" disabled={authBusy}>{authBusy ? "Please wait..." : authMode === "signup" ? "Create account" : "Log in"} <KeyRound size={16} /></button>
            </form>
            <p className="switch-auth">{authMode === "signup" ? "Already have an account?" : "New to Rexaura?"} <button onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setAuthMessage(""); }}>{authMode === "signup" ? "Log in" : "Create an account"}</button></p>
          </>}
          {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
          {!supabase && <p className="setup-note">Setup needed: add your Supabase keys in <code>.env</code> to enable account features.</p>}
        </section>
      </div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
