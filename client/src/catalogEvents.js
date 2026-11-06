export const CATALOG_CHANGED = "catalog:changed";

export function notifyCatalogChanged() {
  window.dispatchEvent(new Event(CATALOG_CHANGED));
}
