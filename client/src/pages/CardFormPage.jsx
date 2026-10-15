import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createCard, getCard, getTaxonomy, updateCard } from "../api.js";

const EMPTY_FORM = {
  name: "",
  year: "",
  setName: "",
  cardNumber: "",
  notes: "",
  genre: "Sports",
  sportOrGame: "",
  customSport: "",
  condition: "",
  gradingCompany: "Ungraded",
  grade: "",
  quantity: "1",
  value: "",
};

const GENRE_HINTS = {
  Sports: "Athletes and teams",
  "Table Games": "Cards played at the table",
  "Trading Cards": "Other collectible cards",
};

function cardToForm(card, taxonomy) {
  const known = taxonomy.sportOrGame[card.genre] || [];
  const listed = known.includes(card.sportOrGame);
  return {
    name: card.name,
    year: card.year ?? "",
    setName: card.setName ?? "",
    cardNumber: card.cardNumber ?? "",
    notes: card.notes ?? "",
    genre: card.genre,
    sportOrGame: listed ? card.sportOrGame : "Other",
    customSport: listed ? "" : card.sportOrGame,
    condition: card.condition,
    gradingCompany: card.gradingCompany,
    grade: card.grade ?? "",
    quantity: String(card.quantity),
    value: String(card.value),
  };
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Enter a card name.";
  if (form.year !== "") {
    const year = Number(form.year);
    if (!Number.isInteger(year) || year < 1860 || year > 2100) {
      errors.year = "Year must be between 1860 and 2100.";
    }
  }
  if (!form.sportOrGame) errors.sportOrGame = "Choose a sport or game.";
  if (form.sportOrGame === "Other" && form.customSport.trim().length < 2) {
    errors.customSport = "Enter a name for this sport or game.";
  }
  if (!form.condition) errors.condition = "Choose a condition.";
  if (form.gradingCompany !== "Ungraded" && !form.grade) errors.grade = "Choose a grade.";
  if (form.quantity === "" || !Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 1) {
    errors.quantity = "Enter a whole number of at least 1.";
  }
  if (form.value === "" || !Number.isFinite(Number(form.value)) || Number(form.value) < 0) {
    errors.value = "Enter a value of zero or more.";
  }
  return errors;
}

function toPayload(form) {
  return {
    name: form.name,
    year: form.year,
    setName: form.setName,
    cardNumber: form.cardNumber,
    notes: form.notes,
    genre: form.genre,
    sportOrGame: form.sportOrGame === "Other" ? form.customSport : form.sportOrGame,
    condition: form.condition,
    gradingCompany: form.gradingCompany,
    grade: form.gradingCompany === "Ungraded" ? null : form.grade,
    quantity: form.quantity,
    value: form.value,
  };
}

function Field({ id, label, error, hint, className = "", children }) {
  return (
    <div className={`field${error ? " invalid" : ""}${className ? ` ${className}` : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? <p className="hint">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CardFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [taxonomy, setTaxonomy] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMissing(false);
      setFormError("");
      try {
        const nextTaxonomy = await getTaxonomy();
        if (cancelled) return;
        setTaxonomy(nextTaxonomy);
        if (id) {
          const card = await getCard(id);
          if (cancelled) return;
          setForm(cardToForm(card, nextTaxonomy));
        } else {
          setForm(EMPTY_FORM);
        }
      } catch (error) {
        if (cancelled) return;
        if (error.status === 404) setMissing(true);
        else setFormError(error.message || "The card form could not be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function update(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "gradingCompany" && value === "Ungraded") next.grade = "";
      if (name === "genre") {
        const options = taxonomy?.sportOrGame[value] || [];
        if (next.sportOrGame && !options.includes(next.sportOrGame)) {
          next.sportOrGame = "";
          next.customSport = "";
        }
      }
      return next;
    });
    setErrors((current) => {
      const next = { ...current, [name]: undefined };
      if (name === "sportOrGame") next.customSport = undefined;
      if (name === "gradingCompany") next.grade = undefined;
      return next;
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFormError("Check the highlighted fields.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (isEdit) await updateCard(id, toPayload(form));
      else await createCard(toPayload(form));
      navigate("/");
    } catch (error) {
      const fields = { ...(error.fields || {}) };
      if (form.sportOrGame === "Other" && fields.sportOrGame) {
        fields.customSport = fields.sportOrGame;
        delete fields.sportOrGame;
      }
      setErrors(fields);
      setFormError(error.message || "The card could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="status">Loading the card…</p>;

  if (missing) {
    return (
      <div className="empty panel">
        <h1>This card is not in the catalog</h1>
        <p>It may have been removed.</p>
        <Link to="/" className="button secondary">
          Back to catalog
        </Link>
      </div>
    );
  }

  if (!taxonomy) {
    return (
      <p className="banner" role="alert">
        {formError || "The card form could not be loaded."}
      </p>
    );
  }

  const sportOptions = taxonomy.sportOrGame[form.genre] || [];
  const describedBy = (field) => (errors[field] ? `${field}-error` : undefined);

  return (
    <div className="form-page">
      <div className="page-heading">
        <h1>{isEdit ? "Edit card" : "Add a card"}</h1>
        <p>Choose a genre, then record condition, grade, quantity, and value.</p>
      </div>

      <form className="panel form-panel" onSubmit={onSubmit} noValidate>
        {formError ? (
          <p className="banner" role="alert">
            {formError}
          </p>
        ) : null}

        <section className="form-section">
          <h2>Card</h2>
          <div className="form-grid">
            <Field id="name" label="Name" error={errors.name} className="span-2">
              <input
                id="name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                maxLength={160}
                autoFocus={!isEdit}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy("name")}
              />
            </Field>
            <Field id="year" label="Year" error={errors.year}>
              <input
                id="year"
                inputMode="numeric"
                value={form.year}
                onChange={(event) => update("year", event.target.value)}
                aria-invalid={Boolean(errors.year)}
                aria-describedby={describedBy("year")}
              />
            </Field>
            <Field id="cardNumber" label="Card number" error={errors.cardNumber}>
              <input
                id="cardNumber"
                value={form.cardNumber}
                onChange={(event) => update("cardNumber", event.target.value)}
                maxLength={40}
                aria-invalid={Boolean(errors.cardNumber)}
                aria-describedby={describedBy("cardNumber")}
              />
            </Field>
            <Field id="setName" label="Set" error={errors.setName} className="span-2">
              <input
                id="setName"
                value={form.setName}
                onChange={(event) => update("setName", event.target.value)}
                maxLength={160}
                aria-invalid={Boolean(errors.setName)}
                aria-describedby={describedBy("setName")}
              />
            </Field>
          </div>
        </section>

        <section className="form-section">
          <h2>Category</h2>
          <div className="genre-choices" role="group" aria-label="Genre">
            {taxonomy.genres.map((genre) => (
              <button
                key={genre}
                type="button"
                aria-pressed={form.genre === genre}
                className={form.genre === genre ? "genre-choice active" : "genre-choice"}
                onClick={() => update("genre", genre)}
              >
                <span className="genre-title">{genre}</span>
                <span className="genre-hint">{GENRE_HINTS[genre]}</span>
              </button>
            ))}
          </div>
          <div className="form-grid sport-grid">
            <Field id="sportOrGame" label="Sport / game" error={errors.sportOrGame}>
              <select
                id="sportOrGame"
                value={form.sportOrGame}
                onChange={(event) => update("sportOrGame", event.target.value)}
                aria-invalid={Boolean(errors.sportOrGame)}
                aria-describedby={describedBy("sportOrGame")}
              >
                <option value="">Select</option>
                {sportOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
            {form.sportOrGame === "Other" ? (
              <Field id="customSport" label="Name" error={errors.customSport}>
                <input
                  id="customSport"
                  value={form.customSport}
                  onChange={(event) => update("customSport", event.target.value)}
                  maxLength={80}
                  aria-invalid={Boolean(errors.customSport)}
                  aria-describedby={describedBy("customSport")}
                />
              </Field>
            ) : null}
          </div>
        </section>

        <section className="form-section">
          <h2>Condition and grade</h2>
          <div className="form-grid">
            <Field id="condition" label="Condition" error={errors.condition}>
              <select
                id="condition"
                value={form.condition}
                onChange={(event) => update("condition", event.target.value)}
                aria-invalid={Boolean(errors.condition)}
                aria-describedby={describedBy("condition")}
              >
                <option value="">Select</option>
                {taxonomy.conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="gradingCompany" label="Grading company" error={errors.gradingCompany}>
              <select
                id="gradingCompany"
                value={form.gradingCompany}
                onChange={(event) => update("gradingCompany", event.target.value)}
                aria-invalid={Boolean(errors.gradingCompany)}
                aria-describedby={describedBy("gradingCompany")}
              >
                {taxonomy.gradingCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </Field>
            {form.gradingCompany !== "Ungraded" ? (
              <Field id="grade" label="Grade" error={errors.grade}>
                <select
                  id="grade"
                  value={form.grade}
                  onChange={(event) => update("grade", event.target.value)}
                  aria-invalid={Boolean(errors.grade)}
                  aria-describedby={describedBy("grade")}
                >
                  <option value="">Select</option>
                  {taxonomy.grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
          </div>
        </section>

        <section className="form-section">
          <h2>Quantity and value</h2>
          <div className="form-grid">
            <Field id="quantity" label="Quantity" error={errors.quantity}>
              <input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(event) => update("quantity", event.target.value)}
                aria-invalid={Boolean(errors.quantity)}
                aria-describedby={describedBy("quantity")}
              />
            </Field>
            <Field id="value" label="Value per card" error={errors.value} hint="Estimated price in USD for one card.">
              <input
                id="value"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={form.value}
                onChange={(event) => update("value", event.target.value)}
                aria-invalid={Boolean(errors.value)}
                aria-describedby={describedBy("value")}
              />
            </Field>
            <Field id="notes" label="Notes" error={errors.notes} className="span-2">
              <textarea
                id="notes"
                rows={4}
                maxLength={2000}
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={describedBy("notes")}
              />
            </Field>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Saving…" : "Save card"}
          </button>
          <Link to="/" className="button secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
