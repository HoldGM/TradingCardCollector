import { Link } from "react-router-dom";
import { cardDetails, gradeLabel, money } from "../format.js";

export function CardTable({ cards, onDelete }) {
  return (
    <>
      <div className="table-wrap">
        <table className="catalog-table">
          <caption className="sr-only">Cards in the current view</caption>
          <thead>
            <tr>
              <th scope="col">Card</th>
              <th scope="col">Category</th>
              <th scope="col">Condition</th>
              <th scope="col">Grade</th>
              <th scope="col" className="num">
                Qty
              </th>
              <th scope="col" className="num">
                Value <span className="th-sub">per card</span>
              </th>
              <th scope="col" className="num">
                Total
              </th>
              <th scope="col" className="actions">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => {
              const details = cardDetails(card);
              return (
                <tr key={card.id}>
                  <td>
                    <Link className="card-name" to={`/cards/${card.id}/edit`}>
                      {card.name}
                    </Link>
                    {details ? <div className="card-meta">{details}</div> : null}
                  </td>
                  <td>
                    <div>{card.genre}</div>
                    <div className="card-meta">{card.sportOrGame}</div>
                  </td>
                  <td>{card.condition}</td>
                  <td>{gradeLabel(card)}</td>
                  <td className="num">{card.quantity}</td>
                  <td className="num">{money(card.value)}</td>
                  <td className="num total">{money(card.extendedValue)}</td>
                  <td className="actions">
                    <Link className="text-action" to={`/cards/${card.id}/edit`}>
                      Edit
                    </Link>
                    <button type="button" className="text-action danger" onClick={() => onDelete(card)}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card-list">
        {cards.map((card) => {
          const details = cardDetails(card);
          return (
            <article key={card.id} className="catalog-card">
              <div className="catalog-card-top">
                <div>
                  <h2>
                    <Link to={`/cards/${card.id}/edit`}>{card.name}</Link>
                  </h2>
                  {details ? <p className="card-meta">{details}</p> : null}
                </div>
                <p className="total">{money(card.extendedValue)}</p>
              </div>
              <dl>
                <div>
                  <dt>Category</dt>
                  <dd>
                    {card.genre}
                    <span className="card-meta"> {card.sportOrGame}</span>
                  </dd>
                </div>
                <div>
                  <dt>Condition</dt>
                  <dd>{card.condition}</dd>
                </div>
                <div>
                  <dt>Grade</dt>
                  <dd>{gradeLabel(card)}</dd>
                </div>
                <div>
                  <dt>Quantity</dt>
                  <dd>{card.quantity}</dd>
                </div>
                <div>
                  <dt>Value</dt>
                  <dd>{money(card.value)}</dd>
                </div>
              </dl>
              <div className="catalog-card-actions">
                <Link className="button secondary" to={`/cards/${card.id}/edit`}>
                  Edit
                </Link>
                <button type="button" className="button danger" onClick={() => onDelete(card)}>
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
