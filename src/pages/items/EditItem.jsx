
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Package } from "lucide-react";
import "../../styles/items.css";

const categories = [
  "Certifications",
  "Contracts",
  "Licenses",
  "Documents",
  "Appointments",
  "Internal Deadlines",
  "Other"
];

function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const items = JSON.parse(localStorage.getItem("items") || "[]");

        const selectedItem = items.find(
          item => String(item.id) === String(id)
        );

        if (!selectedItem) {
          setError("Item not found.");
          setLoading(false);
          return;
        }

        setItem(selectedItem);

        const response = await fetch(
          "http://127.0.0.1:5000/api/employees",
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Unable to load employees.");
        }

        const data = await response.json();

        setEmployees(
          Array.isArray(data) ? data : data.employees || data.data || []
        );

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    setItem(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      !item.item_name.trim() ||
      !item.category ||
      !item.employee_id ||
      !item.issue_date ||
      !item.expiry_date
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (item.expiry_date < item.issue_date) {
      setError("Expiry date cannot be earlier than issue date.");
      return;
    }

    const selectedEmployee = employees.find(
      emp => String(emp.id) === String(item.employee_id)
    );

    if (!selectedEmployee) {
      setError("Please select a valid employee.");
      return;
    }

    const items = JSON.parse(localStorage.getItem("items") || "[]");

    const updatedItems = items.map(existing =>
      String(existing.id) === String(id)
        ? {
            ...item,
            item_name: item.item_name.trim(),
            employee_name: selectedEmployee.name,
            employee_email: selectedEmployee.email,
            employee_phone: selectedEmployee.phone
          }
        : existing
    );

    localStorage.setItem("items", JSON.stringify(updatedItems));

    alert("Item updated successfully!");
    navigate("/items");
  };

  if (loading) {
    return <div className="item-loading">Loading item details...</div>;
  }

  if (!item) {
    return (
      <div className="item-not-found">
        <h2>Item Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/items")}>
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="item-form-page">

      <div className="item-form-header">
        <div>
          <h1>Edit Item</h1>
          <p>Update the registered item information.</p>
        </div>

        <button
          className="item-back-btn"
          onClick={() => navigate("/items")}
        >
          <ArrowLeft size={17} />
          Back to Items
        </button>
      </div>

      <div className="item-form-card">

        <div className="item-form-title">
          <div className="item-form-title-icon">
            <Package size={25} />
          </div>
          <div>
            <h2>Update Item Information</h2>
            <p>Modify the required details below.</p>
          </div>
        </div>

        {error && <div className="item-error-message">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="item-form-grid">

            <div className="item-input-group">
              <label>Item ID</label>
              <input value={item.item_id} disabled />
              <small>Item ID cannot be changed.</small>
            </div>

            <div className="item-input-group">
              <label>Item Name <span>*</span></label>
              <input
                name="item_name"
                value={item.item_name}
                onChange={handleChange}
                required
                maxLength={150}
              />
            </div>

            <div className="item-input-group">
              <label>Category <span>*</span></label>
              <select
                name="category"
                value={item.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="item-input-group">
              <label>Assigned Employee <span>*</span></label>
              <select
                name="employee_id"
                value={item.employee_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="item-input-group">
              <label>Issue Date <span>*</span></label>
              <input
                type="date"
                name="issue_date"
                value={item.issue_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="item-input-group">
              <label>Expiry Date <span>*</span></label>
              <input
                type="date"
                name="expiry_date"
                value={item.expiry_date}
                min={item.issue_date || undefined}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="item-form-actions">

            <button
              type="button"
              className="item-cancel-btn"
              onClick={() => navigate("/items")}
            >
              Cancel
            </button>

            <button type="submit" className="item-submit-btn">
              <Save size={17} />
              Update Item
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditItem;
