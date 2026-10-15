import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteCard, getTaxonomy, listCards } from "../api.js";
import { CardTable } from "../components/CardTable.jsx";
import { CategoryNav } from "../components/CategoryNav.jsx";
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

export function CatalogPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [taxonomy, setTaxonomy] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [pending, setPending] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

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
  }

  async function confirmRemove() {
    if (!pending) return;
    setRemoving(true);
    setRemoveError("");
    try {
      await deleteCard(pending.id);
      setPending(null);
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
  const catalogEmpty = data?.counts?.All === 0;
  const filteredEmpty = data && cards.length === 0;

  return (
    <div className="catalog">
      <CategoryNav counts={data?.counts} genre={filters.genre} onChange={(genre) => updateFilters({ genre })} />

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
        <>
          <p className="summary" aria-live="polite">
            {catalogEmpty
              ? "No cards yet."
              : `${cards.length} ${cards.length === 1 ? "card" : "cards"} · ${copies} ${
                  copies === 1 ? "copy" : "copies"
                } · ${money(worth)}`}
            {loading ? " Updating…" : ""}
          </p>

          {filteredEmpty ? (
            <div className="empty panel">
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
        </>
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
