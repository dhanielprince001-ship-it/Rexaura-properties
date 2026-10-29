import React, { useEffect, useState } from "react";
import { MapPin, BedDouble, Bath, Ruler, Calendar, CheckCircle2, Phone, ShieldCheck, Heart, ArrowLeft } from "lucide-react";
import { properties, AMENITIES, CONTACT } from "./data";

export default function PropertyDetail({ id, saved, toggleSave }) {
  const p = properties.find((x) => x.id === Number(id));
  const gallery = p ? p.gallery || [p.image, "/images/home-villa.jpeg", "/images/about-interior.jpeg"] : [];
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setActive(0); setSent(false);
    setForm({ name: "", phone: "", message: p ? `I'm interested in "${p.title}". Please contact me with more details.` : "" });
  }, [id]);

  if (!p) return (
    <section className="page not-found"><h1>Property not found</h1><p>This listing may have been removed.</p><a className="gold-button inline" href="#/listings">Browse all listings</a></section>
  );

  const mapQuery = encodeURIComponent(p.address);
  const submit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Tour request: ${p.title}`);
    const body = encodeURIComponent(`${form.message}\n\nName: ${form.name}\nPhone: ${form.phone}\nProperty: ${p.title} (${p.price})\n${p.address}`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <section className="page detail-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="#/">Home</a><i>·</i><a href="#/listings">Listings</a><i>·</i><span>{p.area}</span><i>·</i><span>{p.title}</span>
      </nav>
      <a className="back-link" href="#/listings"><ArrowLeft size={15} /> Back to listings</a>

      <div className="gallery">
        <div className="gallery-main" style={{ backgroundImage: `url("${gallery[active]}")` }} role="img" aria-label={p.title}>
          <button className={saved.includes(p.id) ? "save-property saved" : "save-property"} aria-label="Save property" onClick={() => toggleSave(p.id)}><Heart size={18} fill={saved.includes(p.id) ? "currentColor" : "none"} /></button>
        </div>
        <div className="thumbs">
          {gallery.slice(1).map((g, i) => (
            <button key={g} className={active === i + 1 ? "active" : ""} onClick={() => setActive(i + 1)} style={{ backgroundImage: `url("${g}")` }} aria-label={`Photo ${i + 2}`} />
          ))}
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <h1>{p.title}</h1>
          <p className="detail-address"><MapPin size={17} /> {p.address}</p>
          <p className="detail-price">{p.price}</p>
          <div className="stat-row">
            <span><BedDouble size={18} /> {p.beds} Bedrooms</span><span><Bath size={18} /> {p.baths} Bathrooms</span>
            <span><Ruler size={18} /> {p.size}</span><span><Calendar size={18} /> Built {p.built}</span>
          </div>

          <h2>Amenities &amp; Features</h2>
          <ul className="amenities">{AMENITIES.map((a) => <li key={a}><CheckCircle2 size={16} /> {a}</li>)}</ul>

          <h2>Location</h2>
          <a className="map-box" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer" aria-label="Open location in Google Maps">
            <span className="map-pin"><MapPin size={22} /></span><span className="map-label">{p.address}</span>
          </a>
          <p className="map-note">Tap the map to open directions in Google Maps.</p>
        </div>

        <aside className="agent-card">
          <h3>CONTACT AGENT</h3>
          <div className="agent-box"><div className="agent-avatar">RP</div><strong>Rexaura Property Team</strong><small>Luxury Property Specialists</small></div>
          {sent ? <p className="auth-message">Your email app should open with your tour request. You can also call or WhatsApp us below.</p> : null}
          <form onSubmit={submit}>
            <label>Your Name<input value={form.name} onChange={set("name")} placeholder="Enter your name" required autoComplete="name" /></label>
            <label>Phone<input type="tel" value={form.phone} onChange={set("phone")} placeholder="0800 000 0000" required autoComplete="tel" /></label>
            <label>Message<textarea rows="3" value={form.message} onChange={set("message")} required /></label>
            <button className="gold-button" type="submit">REQUEST TOUR</button>
          </form>
          <a className="call-row" href={`tel:+${CONTACT.intl}`}><Phone size={16} /> Or call directly: {CONTACT.display}</a>
          <a className="call-row wa" href={`https://wa.me/${CONTACT.intl}?text=${encodeURIComponent(`Hello, I'm interested in ${p.title}`)}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
          <p className="assure"><ShieldCheck size={14} /> Response within 1 hour · Confidential &amp; Secure</p>
        </aside>
      </div>
    </section>
  );
}
