
import { Trash2, X } from "lucide-react";

function DeleteEmployee({ employee, onConfirm, onCancel }) {
  if (!employee) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">

        <button
          className="modal-close-btn"
          onClick={onCancel}
          title="Close"
        >
          <X size={20} />
        </button>

        <Trash2 size={35} color="#dc2626" />

        <h3>Delete Employee Permanently?</h3>

        <p>
          Are you sure you want to permanently delete
          <strong> {employee.name}</strong>?
          This action cannot be undone.
        </p>

        <div className="delete-modal-actions">

          <button
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="delete-btn"
            onClick={onConfirm}
          >
            Yes, Delete Permanently
          </button>

        </div>
      </div>
    </div>
  );
}

export default DeleteEmployee;
