import { Link, Route, Routes } from "react-router-dom";
import { CardFormPage } from "./pages/CardFormPage.jsx";
import { CatalogPage } from "./pages/CatalogPage.jsx";

export function App() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true" />
            <span>
              <span className="brand-name">Card Catalog</span>
              <span className="brand-tag">Sports, table games, and trading cards</span>
            </span>
          </Link>
          <Link to="/cards/new" className="button">
            Add card
          </Link>
        </div>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/cards/new" element={<CardFormPage />} />
          <Route path="/cards/:id/edit" element={<CardFormPage />} />
          <Route path="*" element={<p className="status">That page is not in the catalog.</p>} />
        </Routes>
      </main>
    </>
  );
}
