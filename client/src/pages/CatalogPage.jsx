import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { deleteCard, getTaxonomy, listCards } from "../api.js";
import { notifyCatalogChanged } from "../catalogEvents.js";
import { CardTable } from "../components/CardTable.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { FilterBar } from "../components/FilterBar.jsx";
import { money } from "../format.js";

const INITIAL_FILTERS = {
  genre: "",
  sportOrGame: "",
  condition: "",
  gradingCompany: "",
  grade: "",
  minPrice: "",
  maxPrice: "",
  sort: "createdAt",
  order: "desc",
};

const MIX = [
  { key: "Sports", label: "Sports", color: "var(--sports)" },
  { key: "Table Games", label: "Table Games", color: "var(--games)" },
  { key: "Trading Cards", label: "Trading Cards", color: "var(--trading)" },
];

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get("genre") || "";
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS, genre: genreParam });
  const [taxonomy, setTaxonomy] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [pending, setPending] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  useEffect(() => {
    setFilters((current) => {
      if (current.genre === genreParam) return current;
      return { ...current, genre: genreParam, sportOrGame: "" };
    });
  }, [genreParam]);

  useEffect(() => {
    let cancelled = false;
    getTaxonomy()
      .then((result) => {
        if (!cancelled) setTaxonomy(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "The category list could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await listCards(filters);
        if (!cancelled) {
          setData(result);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          const detail = Object.values(err.fields || {}).filter(Boolean).join(" ");
          setError(detail || err.message || "The catalog could not be loaded.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [filters, version]);

  function updateFilters(patch) {
    setFilters((current) => {
      const next = { ...current, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "genre") && patch.genre !== current.genre) {
        next.sportOrGame = "";
      }
      return next;
    });
  }

  function clearFilters() {
    setFilters((current) => ({
      ...INITIAL_FILTERS,
      sort: current.sort,
      order: current.order,
    }));
    if (searchParams.get("genre")) setSearchParams({});
  }

  async function confirmRemove() {
    if (!pending) return;
    setRemoving(true);
    setRemoveError("");
    try {
      await deleteCard(pending.id);
      setPending(null);
      notifyCatalogChanged();
      setVersion((current) => current + 1);
    } catch (err) {
      setRemoveError(err.message || "The card could not be removed.");
    } finally {
      setRemoving(false);
    }
  }

  const cards = data?.cards || [];
  const copies = cards.reduce((sum, card) => sum + card.quantity, 0);
  const worth = cards.reduce((sum, card) => sum + card.extendedValue, 0);
  const graded = cards.filter((card) => card.grade).length;
  const average = cards.length ? worth / cards.length : 0;
  const catalogEmpty = data?.counts?.All === 0;
  const filteredEmpty = data && cards.length === 0;
  const totalCards = data?.counts?.All || 0;

  return (
    <div className="catalog">
      <section className="stats" aria-label="Collection summary">
        <article className="stat">
          <span className="stat-icon cards" aria-hidden="true">
            <CardsIcon />
          </span>
          <div>
            <p className="stat-label">Cards</p>
            <p className="stat-value">{data ? cards.length : "–"}</p>
            <p className="stat-note">{data ? "In this view" : "Loading"}</p>
          </div>
        </article>
        <article className="stat">
          <span className="stat-icon copies" aria-hidden="true">
            <CopiesIcon />
          </span>
          <div>
            <p className="stat-label">Copies</p>
            <p className="stat-value">{data ? copies : "–"}</p>
            <p className="stat-note">Quantity on hand</p>
          </div>
        </article>
        <article className="stat">
          <span className="stat-icon value" aria-hidden="true">
            <ValueIcon />
          </span>
          <div>
            <p className="stat-label">Value</p>
            <p className="stat-value">{data ? money(worth) : "–"}</p>
            <p className="stat-note">{data ? `${money(average)} average` : "Per card"}</p>
          </div>
        </article>
        <article className="stat">
          <span className="stat-icon graded" aria-hidden="true">
            <GradeIcon />
          </span>
          <div>
            <p className="stat-label">Graded</p>
            <p className="stat-value">{data ? graded : "–"}</p>
            <p className="stat-note">{data && cards.length ? `${Math.round((graded / cards.length) * 100)}% of this view` : "Professionally graded"}</p>
          </div>
        </article>
      </section>

      <section className="panel mix" aria-label="Category mix">
        <div className="mix-head">
          <h2>Category mix</h2>
          <p>{totalCards} {totalCards === 1 ? "card" : "cards"} in the collection</p>
        </div>
        <div className="mix-bar" aria-hidden="true">
          {MIX.map((item) => {
            const count = data?.counts?.[item.key] || 0;
            const width = totalCards ? (count / totalCards) * 100 : 0;
            return <span key={item.key} style={{ width: `${width}%`, background: item.color }} />;
          })}
        </div>
        <ul className="mix-legend">
          {MIX.map((item) => (
            <li key={item.key}>
              <span className="legend-swatch" style={{ background: item.color }} />
              {item.label}
              <strong>{data?.counts?.[item.key] ?? 0}</strong>
            </li>
          ))}
        </ul>
      </section>

      <FilterBar
        taxonomy={taxonomy}
        sportOrGames={data?.sportOrGames}
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
      />

      {error ? (
        <p className="banner" role="alert">
          {error}{" "}
          <button type="button" className="text-action" onClick={() => setVersion((current) => current + 1)}>
            Try again
          </button>
        </p>
      ) : null}

      {loading && !data ? <p className="status">Loading the catalog…</p> : null}

      {data ? (
        <section className="holdings">
          <div className="holdings-head">
            <div>
              <h2>Holdings</h2>
              <p className="summary" aria-live="polite">
                {catalogEmpty
                  ? "No cards yet."
                  : `${cards.length} ${cards.length === 1 ? "card" : "cards"} · ${copies} ${
                      copies === 1 ? "copy" : "copies"
                    } · ${money(worth)}`}
                {loading ? " Updating…" : ""}
              </p>
            </div>
          </div>

          {filteredEmpty ? (
            <div className="empty">
              <h2>{catalogEmpty ? "The catalog is empty" : "No cards match these filters"}</h2>
              <p>
                {catalogEmpty
                  ? "Add a card to start the collection."
                  : "Adjust the category, sport, condition, grade, or price."}
              </p>
              {catalogEmpty ? (
                <Link to="/cards/new" className="button">
                  Add card
                </Link>
              ) : (
                <button type="button" className="button secondary" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <CardTable cards={cards} onDelete={(card) => { setRemoveError(""); setPending(card); }} />
          )}
        </section>
      ) : null}

      {pending ? (
        <ConfirmDialog
          title="Remove this card?"
          body={`${pending.name} will leave the catalog.`}
          confirmLabel="Remove card"
          busy={removing}
          error={removeError}
          onConfirm={confirmRemove}
          onClose={() => {
            if (!removing) setPending(null);
          }}
        />
      ) : null}
    </div>
  );
}

function CardsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="5" width="12" height="15" rx="2" />
      <path d="M8 4h10a2 2 0 0 1 2 2v12" />
    </svg>
  );
}

function CopiesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="8" y="7" width="11" height="13" rx="2" />
      <path d="M5 16V5a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

function ValueIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v9M9.5 9.5c.4-.8 1.2-1.2 2.5-1.2 1.5 0 2.4.7 2.4 1.8s-.8 1.6-2.4 1.9-2.5.7-2.5 1.9 1 1.8 2.6 1.8c1.2 0 2.1-.4 2.5-1.2" />
    </svg>
  );
}

function GradeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.2 11 14.5 15.8 9.5" />
    </svg>
  );
}
