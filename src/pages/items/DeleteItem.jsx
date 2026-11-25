
import { AlertTriangle, Trash2, X } from "lucide-react";
import "../../styles/items.css";

function DeleteItem({ item, onCancel, onConfirm }) {
  if (!item) return null;

  return (
    <div
      className="item-delete-overlay"
      onClick={onCancel}
    >
      <div
        className="item-delete-modal"
        onClick={e => e.stopPropagation()}
      >

        <button
          className="item-delete-close"
          onClick={onCancel}
          title="Close"
        >
          <X size={20} />
        </button>

        <div className="item-delete-icon">
          <AlertTriangle size={32} />
        </div>

        <h2>Delete Item?</h2>

        <p>
          Are you sure you want to permanently delete this item?
        </p>

        <div className="item-delete-info">
          <strong>{item.item_name}</strong>
          <span>{item.item_id}</span>
        </div>

        <p className="item-delete-warning">
          This action cannot be undone.
        </p>

        <div className="item-delete-actions">

          <button
            className="item-delete-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="item-delete-confirm"
            onClick={onConfirm}
          >
            <Trash2 size={17} />
            Delete Item
          </button>

        </div>

      </div>
    </div>
  );
}

export default DeleteItem;
