
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  UserRoundPen,
  Save,
  X
} from "lucide-react";

import "../../styles/employees.css";

const API_URL = "http://127.0.0.1:5000/api/employees";

function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch employee from MySQL
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Employee not found.");
        }

        setEmployee({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || ""
        });

      } catch (error) {
        setFormError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEmployee((previous) => ({
      ...previous,
      [name]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: ""
    }));

    setFormError("");
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!employee.name.trim()) {
      newErrors.name = "Employee name is required.";
    }

    if (!employee.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!employee.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    return newErrors;
  };

  // Update employee in MySQL
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();

    setErrors(newErrors);
    setFormError("");

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify({
          name: employee.name.trim(),
          email: employee.email.trim().toLowerCase(),
          phone: employee.phone.trim().replace(/\s+/g, "")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          const message = data.message || "Duplicate employee details.";

          if (message.toLowerCase().includes("email")) {
            setErrors({ email: message });
          } else if (message.toLowerCase().includes("phone")) {
            setErrors({ phone: message });
          } else {
            setFormError(message);
          }

          return;
        }

        throw new Error(data.message || "Unable to update employee.");
      }

      alert(data.message || "Employee updated successfully!");

      navigate("/employees");

    } catch (error) {
      console.error("UPDATE EMPLOYEE ERROR:", error);

      setFormError(
        error.message || "Unable to connect to the Flask server."
      );

    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="add-employee-page">
        <div className="employees-container">
          <p>Loading employee information...</p>
        </div>
      </div>
    );
  }

  // Fetch error
  if (formError && !employee.name && !employee.email && !employee.phone) {
    return (
      <div className="add-employee-page">
        <div className="employees-container">
          <p className="error-message">{formError}</p>

          <button
            className="back-btn"
            onClick={() => navigate("/employees")}
          >
            <ArrowLeft size={17} />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-employee-page">

      <div className="employees-container">

        {/* Header */}
        <div className="add-employee-header">

          <div className="add-employee-title">

            <div className="add-title-icon">
              <UserRoundPen size={26} />
            </div>

            <h2>Edit Employee</h2>

            <p>
              Update the employee information using the form below.
            </p>

          </div>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/employees")}
          >
            <ArrowLeft size={17} />
            Back
          </button>

        </div>

        {/* Form */}
        <form
          className="employee-form"
          onSubmit={handleSubmit}
          noValidate
        >

          <div className="form-section-heading">
            <h3>Employee Information</h3>

            <p>
              Modify the employee's existing contact information.
            </p>
          </div>

          {/* Employee ID */}
          <div className="form-group">
            <label>Employee ID</label>

            <input
              type="text"
              value={id}
              disabled
            />

            <small className="field-hint">
              Employee ID cannot be changed.
            </small>
          </div>

          {/* Name */}
          <div className="form-group">
            <label>Employee Name</label>

            <input
              type="text"
              name="name"
              value={employee.name}
              onChange={handleChange}
              placeholder="Enter employee full name"
              required
            />

            {errors.name && (
              <span className="error-text">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
            />

            {errors.email && (
              <span className="error-text">
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              value={employee.phone}
              onChange={handleChange}
              placeholder="+1 (212) 555-0123"
              required
            />

            {errors.phone && (
              <span className="error-text">
                {errors.phone}
              </span>
            )}
          </div>

          {/* API Error */}
          {formError && (
            <div className="error-message">
              {formError}
            </div>
          )}

          {/* Buttons */}
          <div className="form-actions">

            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/employees")}
              disabled={saving}
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Updating..." : "Update Employee"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditEmployee;
