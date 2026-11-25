
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  IdCard,
  UserRoundCheck
} from "lucide-react";

import "../../styles/employees.css";

const API_URL = "http://127.0.0.1:5000/api/employees";

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        setEmployee(data);
      } catch (err) {
        setError(err.message || "Unable to fetch employee details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  return (
    <div className="add-employee-page">
      <div className="employees-container">

        {/* Header */}
        <div className="add-employee-header">
          <div>
            <h2 className="add-employee-title">
              <UserRoundCheck size={30} className="add-title-icon" />
              Employee Details
            </h2>

            <p>View complete information about this employee.</p>
          </div>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/employees")}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="employee-form">
            <p>Loading employee details...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="employee-form">
            <p className="error-message">{error}</p>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/employees")}
              >
                Back to Employees
              </button>
            </div>
          </div>
        )}

        {/* Employee Information */}
        {!loading && !error && employee && (
          <div className="employee-form">

            <h3 className="form-section-heading">
              Employee Information
            </h3>

            <div className="employee-details-grid">

              <div className="employee-detail-card">
                <div className="employee-detail-icon">
                  <IdCard size={22} />
                </div>

                <div>
                  <span className="employee-detail-label">
                    Employee ID
                  </span>
                  <h3>{employee.id}</h3>
                </div>
              </div>

              <div className="employee-detail-card">
                <div className="employee-detail-icon">
                  <UserRound size={22} />
                </div>

                <div>
                  <span className="employee-detail-label">
                    Full Name
                  </span>
                  <h3>{employee.name}</h3>
                </div>
              </div>

              <div className="employee-detail-card">
                <div className="employee-detail-icon">
                  <Mail size={22} />
                </div>

                <div>
                  <span className="employee-detail-label">
                    Email Address
                  </span>
                  <h3>{employee.email}</h3>
                </div>
              </div>

              <div className="employee-detail-card">
                <div className="employee-detail-icon">
                  <Phone size={22} />
                </div>

                <div>
                  <span className="employee-detail-label">
                    Phone Number
                  </span>
                  <h3>{employee.phone}</h3>
                </div>
              </div>

            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/employees")}
              >
                Back to Employees
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => navigate(`/employees/edit/${employee.id}`)}
              >
                Edit Employee
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default EmployeeDetails;
