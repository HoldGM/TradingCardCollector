async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    const error = new Error("The catalog could not be reached.");
    error.fields = {};
    throw error;
  }

  if (response.status === 204) return null;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || "Request failed.");
    error.fields = body.fields || {};
    error.status = response.status;
    throw error;
  }
  return body;
}

export function getTaxonomy() {
  return request("/api/taxonomy");
}

export function listCards(filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "" && value != null) params.set(key, String(value));
  }
  const query = params.toString();
  return request(`/api/cards${query ? `?${query}` : ""}`);
}

export function getCard(id) {
  return request(`/api/cards/${id}`);
}

export function createCard(card) {
  return request("/api/cards", { method: "POST", body: JSON.stringify(card) });
}

export function updateCard(id, card) {
  return request(`/api/cards/${id}`, { method: "PUT", body: JSON.stringify(card) });
}

export function deleteCard(id) {
  return request(`/api/cards/${id}`, { method: "DELETE" });
}
