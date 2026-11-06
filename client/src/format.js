const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function money(value) {
  return moneyFormat.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

export function gradeLabel(card) {
  if (!card.grade || card.gradingCompany === "Ungraded") return "Ungraded";
  return `${card.gradingCompany} ${card.grade}`;
}

export function cardDetails(card) {
  return [card.year, card.setName, card.cardNumber ? `#${card.cardNumber}` : null]
    .filter((part) => part != null && part !== "")
    .join(" · ");
}

export const SORT_LABELS = {
  createdAt: { desc: "Newest first", asc: "Oldest first" },
  name: { desc: "Z to A", asc: "A to Z" },
  genre: { desc: "Z to A", asc: "A to Z" },
  sportOrGame: { desc: "Z to A", asc: "A to Z" },
  condition: { desc: "Best first", asc: "Worst first" },
  grade: { desc: "Highest first", asc: "Lowest first" },
  value: { desc: "Highest first", asc: "Lowest first" },
  extendedValue: { desc: "Highest first", asc: "Lowest first" },
  quantity: { desc: "Highest first", asc: "Lowest first" },
};

export const SORT_FIELDS = [
  { value: "createdAt", label: "Date added" },
  { value: "name", label: "Name" },
  { value: "genre", label: "Genre" },
  { value: "sportOrGame", label: "Sport / game" },
  { value: "condition", label: "Condition" },
  { value: "grade", label: "Grade" },
  { value: "value", label: "Price" },
  { value: "extendedValue", label: "Total value" },
  { value: "quantity", label: "Quantity" },
];
