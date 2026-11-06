export function mapCard(row) {
  const quantity = Number(row.quantity);
  const value = Number(row.value);
  return {
    id: row.id,
    name: row.name,
    year: row.year == null ? null : Number(row.year),
    setName: row.set_name,
    cardNumber: row.card_number,
    notes: row.notes,
    genre: row.genre,
    sportOrGame: row.sport_or_game,
    condition: row.condition,
    gradingCompany: row.grading_company,
    grade: row.grade,
    quantity,
    value,
    extendedValue: Math.round((quantity * value + Number.EPSILON) * 100) / 100,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
