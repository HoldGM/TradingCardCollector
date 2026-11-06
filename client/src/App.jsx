import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar.jsx";
import { CardFormPage } from "./pages/CardFormPage.jsx";
import { CatalogPage } from "./pages/CatalogPage.jsx";

function pageCopy(pathname) {
  if (pathname === "/cards/new") {
    return {
      title: "Add a card",
      subtitle: "Choose a genre, then record condition, grade, quantity, and value.",
    };
  }
  if (/^\/cards\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: "Edit card",
      subtitle: "Update condition, grade, quantity, and value.",
    };
  }
  return {
    title: "Collection",
    subtitle: "Sports, table games, and trading cards.",
  };
}

export function App() {
  const location = useLocation();
  const copy = pageCopy(location.pathname);

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <header className="topbar">
          <div>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>
          {location.pathname === "/" ? (
            <Link to="/cards/new" className="button">
              Add card
            </Link>
          ) : (
            <Link to="/" className="button secondary">
              Back to collection
            </Link>
          )}
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/cards/new" element={<CardFormPage />} />
            <Route path="/cards/:id/edit" element={<CardFormPage />} />
            <Route path="*" element={<p className="status">That page is not in the catalog.</p>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
