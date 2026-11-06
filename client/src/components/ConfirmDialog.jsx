import { useEffect, useRef } from "react";

export function ConfirmDialog({ title, body, confirmLabel, busy, error, onConfirm, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <h2>{title}</h2>
      <p>{body}</p>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={onClose} disabled={busy}>
          Keep card
        </button>
        <button type="button" className="button danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Removing…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
