
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  UserPlus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
  UserRound
} from "lucide-react";

import DeleteEmployee from "./DeleteEmployee";
import "../../styles/employees.css";

const API_URL = "http://127.0.0.1:5000/api/employees";

function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteEmployee, setDeleteEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load employees from MySQL
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load employees."
        );
      }

      setEmployees(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Loading employees:", error);
      setError(error.message || "Unable to connect to Flask server.");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Search employees
  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      String(employee.id).toLowerCase().includes(search) ||
      String(employee.name).toLowerCase().includes(search) ||
      String(employee.email).toLowerCase().includes(search) ||
      String(employee.phone).toLowerCase().includes(search)
    );
  });

  // Delete employee from MySQL
  const handleDelete = async () => {
    if (!deleteEmployee) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${deleteEmployee.id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete employee.");
      }

      setEmployees((previous) =>
        previous.filter(
          (employee) => employee.id !== deleteEmployee.id
        )
      );

      setMessage(data.message);
      setDeleteEmployee(null);

    } catch (error) {
      console.error("Delete employee:", error);
      setError(error.message || "Unable to delete employee.");
    }
  };

  return (
    <div className="employees-page">
      <div className="employees-container">

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2>Employee Management</h2>
            <p>
              Manage employee information, details and records.
            </p>
          </div>

          <button
            type="button"
            className="add-btn"
            onClick={() => navigate("/employees/add")}
          >
            <UserPlus size={18} />
            Add Employee
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="employee-search-container">
          <Search size={19} />

          <input
            type="text"
            className="employee-search"
            placeholder="Search by Employee ID, Name, Email or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Employee Table */}
        <div className="employee-table-wrapper">
          <table className="employee-table">

            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <h3>Loading employees...</h3>
                      <p>Please wait.</p>
                    </div>
                  </td>
                </tr>

              ) : filteredEmployees.length > 0 ? (

                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>

                    <td>
                      <span className="employee-id">
                        {employee.id}
                      </span>
                    </td>

                    <td>
                      <div className="employee-name-cell">
                        <div className="employee-avatar">
                          <UserRound size={17} />
                        </div>

                        <span>{employee.name}</span>
                      </div>
                    </td>

                    <td>{employee.email}</td>
                    <td>{employee.phone}</td>

                    <td>
                      <div className="employee-actions">

                        <button
                          type="button"
                          className="view-btn"
                          title="View Employee"
                          onClick={() =>
                            navigate(`/employees/view/${employee.id}`)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit Employee"
                          onClick={() =>
                            navigate(`/employees/edit/${employee.id}`)
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          title="Delete Employee"
                          onClick={() => setDeleteEmployee(employee)}
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))

              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">

                      <div className="empty-state-icon">
                        <Users size={38} />
                      </div>

                      <h3>
                        {searchTerm
                          ? "No Employees Found"
                          : "No Employees Added Yet"}
                      </h3>

                      <p>
                        {searchTerm
                          ? "Try another search."
                          : "Start by adding your first employee."}
                      </p>

                      {!searchTerm && (
                        <button
                          type="button"
                          className="add-btn"
                          onClick={() => navigate("/employees/add")}
                        >
                          <UserPlus size={17} />
                          Add First Employee
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>

      {/* Delete Confirmation */}
      <DeleteEmployee
        employee={deleteEmployee}
        onConfirm={handleDelete}
        onCancel={() => setDeleteEmployee(null)}
      />

    </div>
  );
}

export default Employees;
