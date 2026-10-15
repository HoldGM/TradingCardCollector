const CATEGORIES = ["All", "Sports", "Table Games", "Trading Cards"];

export function CategoryNav({ counts, genre, onChange }) {
  return (
    <div className="categories" role="group" aria-label="Categories">
      {CATEGORIES.map((item) => {
        const selected = (genre || "All") === item;
        return (
          <button
            key={item}
            type="button"
            aria-pressed={selected}
            className={selected ? "category active" : "category"}
            onClick={() => onChange(item === "All" ? "" : item)}
          >
            <span>{item}</span>
            <span className="count">{counts?.[item] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
