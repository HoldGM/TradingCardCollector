import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { listCards } from "../api.js";
import { CATALOG_CHANGED } from "../catalogEvents.js";

const CATEGORIES = [
  { label: "All", genre: "" },
  { label: "Sports", genre: "Sports" },
  { label: "Table Games", genre: "Table Games" },
  { label: "Trading Cards", genre: "Trading Cards" },
];

function categoryHref(genre) {
  return genre ? `/?genre=${encodeURIComponent(genre)}` : "/";
}

export function Sidebar() {
  const location = useLocation();
  const [counts, setCounts] = useState(null);
  const currentGenre = new URLSearchParams(location.search).get("genre") || "";
  const onCatalog = location.pathname === "/";

  useEffect(() => {
    let cancelled = false;

    function load() {
      listCards({})
        .then((result) => {
          if (!cancelled) setCounts(result.counts);
        })
        .catch(() => {});
    }

    load();
    window.addEventListener(CATALOG_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(CATALOG_CHANGED, load);
    };
  }, []);

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true" />
        <span>
          <span className="brand-name">Card Catalog</span>
          <span className="brand-tag">Collection</span>
        </span>
      </Link>

      <p className="side-label">Categories</p>
      <nav className="side-nav" aria-label="Categories">
        {CATEGORIES.map((item) => {
          const selected = onCatalog && currentGenre === item.genre;
          const countKey = item.genre || "All";
          return (
            <Link
              key={item.label}
              to={categoryHref(item.genre)}
              className={selected ? "side-link active" : "side-link"}
              aria-current={selected ? "page" : undefined}
            >
              <span className={`side-dot ${item.genre ? item.genre.toLowerCase().split(" ")[0] : "all"}`} />
              <span className="side-link-label">{item.label}</span>
              <span className="side-count">{counts?.[countKey] ?? "–"}</span>
            </Link>
          );
        })}
      </nav>

      <Link to="/cards/new" className={location.pathname === "/cards/new" ? "side-add active" : "side-add"}>
        Add card
      </Link>
    </aside>
  );
}
