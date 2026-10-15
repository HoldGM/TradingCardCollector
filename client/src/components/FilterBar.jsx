import { SORT_FIELDS, SORT_LABELS } from "../format.js";

function sportGroups(taxonomy, sportOrGames, genre) {
  const facets = sportOrGames || [];
  const genres = genre ? [genre] : taxonomy.genres;
  return genres.map((item) => {
    const known = (taxonomy.sportOrGame[item] || []).filter((name) => name !== "Other");
    const custom = facets
      .filter((facet) => facet.genre === item && !known.includes(facet.name))
      .map((facet) => facet.name);
    return { genre: item, names: [...known, ...custom] };
  });
}

export function FilterBar({ taxonomy, sportOrGames, filters, onChange, onClear }) {
  const groups = taxonomy ? sportGroups(taxonomy, sportOrGames, filters.genre) : [];
  const orderLabels = SORT_LABELS[filters.sort] || SORT_LABELS.createdAt;
  const filtersActive = Boolean(
    filters.genre ||
      filters.sportOrGame ||
      filters.condition ||
      filters.gradingCompany ||
      filters.grade ||
      filters.minPrice ||
      filters.maxPrice,
  );

  return (
    <section className="panel" aria-label="Filters">
      <div className="filters">
        <div className="field">
          <label htmlFor="sportOrGame">Sport / game</label>
          <select
            id="sportOrGame"
            value={filters.sportOrGame}
            onChange={(event) => onChange({ sportOrGame: event.target.value })}
            disabled={!taxonomy}
          >
            <option value="">Any</option>
            {groups.length === 1
              ? groups[0].names.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))
              : groups.map((group) => (
                  <optgroup key={group.genre} label={group.genre}>
                    {group.names.map((name) => (
                      <option key={`${group.genre}-${name}`} value={name}>
                        {name}
                      </option>
                    ))}
                  </optgroup>
                ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="condition">Condition</label>
          <select
            id="condition"
            value={filters.condition}
            onChange={(event) => onChange({ condition: event.target.value })}
            disabled={!taxonomy}
          >
            <option value="">Any</option>
            {taxonomy?.conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="gradingCompany">Grading</label>
          <select
            id="gradingCompany"
            value={filters.gradingCompany}
            onChange={(event) => onChange({ gradingCompany: event.target.value })}
            disabled={!taxonomy}
          >
            <option value="">Any</option>
            {taxonomy?.gradingCompanies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="grade">Grade</label>
          <select
            id="grade"
            value={filters.grade}
            onChange={(event) => onChange({ grade: event.target.value })}
            disabled={!taxonomy}
          >
            <option value="">Any</option>
            {taxonomy?.grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="minPrice">Minimum price</label>
          <input
            id="minPrice"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={filters.minPrice}
            onChange={(event) => onChange({ minPrice: event.target.value })}
          />
        </div>

        <div className="field">
          <label htmlFor="maxPrice">Maximum price</label>
          <input
            id="maxPrice"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(event) => onChange({ maxPrice: event.target.value })}
          />
        </div>
      </div>

      <div className="sort-row">
        <div className="field">
          <label htmlFor="sort">Sort</label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value })}
          >
            {SORT_FIELDS.map((field) => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="order">Order</label>
          <select
            id="order"
            value={filters.order}
            onChange={(event) => onChange({ order: event.target.value })}
          >
            <option value="desc">{orderLabels.desc}</option>
            <option value="asc">{orderLabels.asc}</option>
          </select>
        </div>
        {filtersActive ? (
          <button type="button" className="button secondary" onClick={onClear}>
            Clear filters
          </button>
        ) : null}
      </div>
    </section>
  );
}
