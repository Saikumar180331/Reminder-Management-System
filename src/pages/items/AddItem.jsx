
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Package } from "lucide-react";
import "../../styles/items.css";

const EMPLOYEE_API = "http://127.0.0.1:5000/api/employees";
const STORAGE_KEY = "items";

const categories = [
  "Certifications",
  "Contracts",
  "Licenses",
  "Documents",
  "Appointments",
  "Internal Deadlines",
  "Other"
];

function AddItem() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeError, setEmployeeError] = useState("");

  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    employee_id: "",
    issue_date: "",
    expiry_date: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(EMPLOYEE_API, {
          method: "GET",
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Unable to load employees.");
        }

        const data = await response.json();

        const employeeList = Array.isArray(data)
          ? data
          : data.employees || data.data || [];

        setEmployees(employeeList);
      } catch (err) {
        setEmployeeError(err.message);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const {
      item_name,
      category,
      employee_id,
      issue_date,
      expiry_date
    } = formData;

    if (!item_name.trim() || !category || !employee_id ||
        !issue_date || !expiry_date) {
      setError("Please fill in all required fields.");
      return;
    }

    if (expiry_date < issue_date) {
      setError("Expiry date cannot be earlier than issue date.");
      return;
    }

    const selectedEmployee = employees.find(
      emp => String(emp.id) === String(employee_id)
    );

    if (!selectedEmployee) {
      setError("Please select a valid employee.");
      return;
    }

    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    const newItem = {
      id: `LOCAL-${Date.now()}`,
      item_id: `ITEM-${Date.now()}`,
      item_name: item_name.trim(),
      category,
      employee_id,
      employee_name: selectedEmployee.name,
      employee_email: selectedEmployee.email,
      employee_phone: selectedEmployee.phone,
      issue_date,
      expiry_date,
      created_at: new Date().toISOString()
    };

    items.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    setSuccess(true);

    setTimeout(() => {
      navigate("/items");
    }, 1000);
  };

  return (
    <div className="item-form-page">

      <div className="item-form-header">
        <div>
          <h1>Add New Item</h1>
          <p>Register an item and assign it to an employee.</p>
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
            <h2>Item Information</h2>
            <p>Enter the required item details below.</p>
          </div>
        </div>

        {error && <div className="item-error-message">{error}</div>}

        {success && (
          <div className="item-success-message">
            Item added successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="item-form-grid">

            <div className="item-input-group">
              <label>Item ID</label>
              <input
                type="text"
                value="Automatically Generated"
                disabled
                className="item-auto-id"
              />
              <small>Item ID will be generated automatically.</small>
            </div>

            <div className="item-input-group">
              <label>Item Name <span>*</span></label>
              <input
                type="text"
                name="item_name"
                placeholder="Enter item name"
                value={formData.item_name}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="item-input-group">
              <label>Category <span>*</span></label>
              <select
                name="category"
                value={formData.category}
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
                value={formData.employee_id}
                onChange={handleChange}
                disabled={loadingEmployees || employees.length === 0}
                required
              >
                <option value="">
                  {loadingEmployees
                    ? "Loading employees..."
                    : "Select Employee"}
                </option>

                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>

              {employeeError && (
                <small className="item-field-error">
                  {employeeError}
                </small>
              )}

              {!loadingEmployees && !employeeError &&
                employees.length === 0 && (
                  <small className="item-field-error">
                    No employees found. Add employees first.
                  </small>
                )}
            </div>

            <div className="item-input-group">
              <label>Issue Date <span>*</span></label>
              <input
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="item-input-group">
              <label>Expiry Date <span>*</span></label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                min={formData.issue_date || undefined}
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

            <button
              type="submit"
              className="item-submit-btn"
              disabled={loadingEmployees || employees.length === 0}
            >
              <Save size={17} />
              Save Item
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddItem;
