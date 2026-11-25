
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Pencil, CalendarDays, UserRound } from "lucide-react";
import "../../styles/items.css";

function getStatus(expiryDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${expiryDate}T00:00:00`);
  const days = Math.ceil((expiry - today) / 86400000);

  if (days < 0) return "Expired";
  if (days <= 7) return "Expiring Soon";
  if (days <= 30) return "Upcoming";
  return "Active";
}

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("items") || "[]");

    const selectedItem = items.find(
      item => String(item.id) === String(id)
    );

    setItem(selectedItem || null);
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US");
  };

  if (!item) {
    return (
      <div className="item-not-found">
        <Package size={45} />
        <h2>Item Not Found</h2>
        <p>The requested item could not be found.</p>
        <button onClick={() => navigate("/items")}>
          Back to Items
        </button>
      </div>
    );
  }

  const status = getStatus(item.expiry_date);

  return (
    <div className="item-form-page">

      <div className="item-form-header">
        <div>
          <h1>Item Details</h1>
          <p>View complete information about this item.</p>
        </div>

        <button
          className="item-back-btn"
          onClick={() => navigate("/items")}
        >
          <ArrowLeft size={17} />
          Back to Items
        </button>
      </div>

      <div className="item-details-card">

        <div className="item-details-heading">
          <div className="item-details-icon">
            <Package size={28} />
          </div>

          <div>
            <h2>{item.item_name}</h2>
            <p>{item.item_id}</p>
          </div>

          <span className={`item-status ${status.toLowerCase().replace(/\s+/g, "-")}`}>
            {status}
          </span>
        </div>

        <div className="item-details-grid">

          <div className="item-detail">
            <span>Item ID</span>
            <strong>{item.item_id}</strong>
          </div>

          <div className="item-detail">
            <span>Item Name</span>
            <strong>{item.item_name}</strong>
          </div>

          <div className="item-detail">
            <span>Category</span>
            <strong>{item.category}</strong>
          </div>

          <div className="item-detail">
            <span>Assigned Employee</span>
            <strong>
              <UserRound size={16} />
              {item.employee_name || "-"}
            </strong>
          </div>

          <div className="item-detail">
            <span>Issue Date</span>
            <strong>
              <CalendarDays size={16} />
              {formatDate(item.issue_date)}
            </strong>
          </div>

          <div className="item-detail">
            <span>Expiry Date</span>
            <strong>
              <CalendarDays size={16} />
              {formatDate(item.expiry_date)}
            </strong>
          </div>

        </div>

        <div className="item-details-actions">
          <button
            className="item-edit-large-btn"
            onClick={() => navigate(`/items/edit/${item.id}`)}
          >
            <Pencil size={17} />
            Edit Item
          </button>
        </div>

      </div>
    </div>
  );
}

export default ItemDetails;
