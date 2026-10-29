import React, { useMemo, useState } from "react";
import { Search, MapPin, BedDouble, Bath, Ruler, Heart, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { properties } from "./data";

const PER_PAGE = 6;
const PRICES = [["any", "Any"], ["u300", "Under ₦300M"], ["m300", "₦300M – ₦600M"], ["o600", "Above ₦600M"]];
const inPrice = (k, m) => k === "any" || (k === "u300" && m < 300) || (k === "m300" && m >= 300 && m <= 600) || (k === "o600" && m > 600);

export default function Listings({ search, setSearch, location, setLocation, saved, toggleSave }) {
  const [price, setPrice] = useState("any");
  const [beds, setBeds] = useState("any");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const types = ["All", ...new Set(properties.map((p) => p.type))];
  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = properties.filter((p) =>
      `${p.title} ${p.area} ${p.location} ${p.type}`.toLowerCase().includes(q) &&
      (location === "All locations" || p.location === location) &&
      inPrice(price, p.priceM) && (beds === "any" || p.beds >= Number(beds)) && (type === "All" || p.type === type));
    if (sort === "low") list.sort((a, b) => a.priceM - b.priceM);
    if (sort === "high") list.sort((a, b) => b.priceM - a.priceM);
    return list;
  }, [search, location, price, beds, type, sort]);

  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = results.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const change = (fn) => (e) => { fn(e.target.value); setPage(1); };

  return (
    <section className="page listings-page">
      <div className="page-head">
        <p className="eyebrow"><span></span> PROPERTY LISTINGS</p>
        <h1>Find your <em>next address</em></h1>
      </div>
      <form className="filter-bar" onSubmit={(e) => e.preventDefault()}>
        <label className="filter-search"><Search size={18} />
          <input value={search} onChange={change(setSearch)} placeholder="Search by location, property, or neighbourhood..." aria-label="Search listings" />
        </label>
        <div className="filter-row">
          <label className="select-wrap"><span>Location</span>
            <select value={location} onChange={change(setLocation)}><option>All locations</option><option>PORT HARCOURT</option><option>LAGOS</option></select><ChevronDown size={15} /></label>
          <label className="select-wrap"><span>Price</span>
            <select value={price} onChange={change(setPrice)}>{PRICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><ChevronDown size={15} /></label>
          <label className="select-wrap"><span>Bedrooms</span>
            <select value={beds} onChange={change(setBeds)}><option value="any">Any</option>{[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}+</option>)}</select><ChevronDown size={15} /></label>
          <label className="select-wrap"><span>Type</span>
            <select value={type} onChange={change(setType)}>{types.map((t) => <option key={t}>{t}</option>)}</select><ChevronDown size={15} /></label>
          <button type="button" className="gold-button search-btn" onClick={() => setPage(1)}>Search</button>
        </div>
      </form>

      <div className="result-bar">
        <p>{results.length} {results.length === 1 ? "property" : "properties"} found{location !== "All locations" ? ` in ${location.charAt(0) + location.slice(1).toLowerCase()}` : ""}</p>
        <label className="sort-box">Sort:
          <select value={sort} onChange={change(setSort)}><option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select>
        </label>
      </div>

      <div className="listing-grid">
        {visible.map((p) => (
          <article className="listing-card" key={p.id}>
            <a className="listing-photo" href={`#/property/${p.id}`} style={{ backgroundImage: `url("${p.image}")` }} aria-label={`View ${p.title}`}>
              <span className={`badge ${p.tag === "New" ? "new" : ""}`}>{p.tag.toUpperCase()}</span>
            </a>
            <button className={saved.includes(p.id) ? "save-property saved" : "save-property"} aria-label="Save property" onClick={() => toggleSave(p.id)}>
              <Heart size={17} fill={saved.includes(p.id) ? "currentColor" : "none"} /></button>
            <div className="listing-body">
              <strong className="listing-price">{p.price}</strong>
              <h3><a href={`#/property/${p.id}`}>{p.title}</a></h3>
              <p className="listing-meta"><span><BedDouble size={13} /> {p.beds} BD</span><span><Bath size={13} /> {p.baths} BA</span><span><Ruler size={13} /> {p.size}</span></p>
              <p className="listing-area"><MapPin size={13} /> {p.area}</p>
              <p className="listing-features">{p.features.join(" · ")}</p>
            </div>
          </article>
        ))}
        {visible.length === 0 && <div className="empty-results">No properties match your filters. Try widening your search.</div>}
      </div>

      {pages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
          <span>Page {current} of {pages}</span>
          {Array.from({ length: pages }, (_, i) => <button key={i} className={i + 1 === current ? "active" : ""} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
          <button disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
        </nav>
      )}
    </section>
  );
}
