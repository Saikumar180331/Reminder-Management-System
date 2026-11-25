
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  CalendarDays,
  RefreshCw,
  Upload
} from "lucide-react";

import DeleteItem from "./DeleteItem";
import "../../styles/items.css";

const STORAGE_KEY = "items";

const VALID_CATEGORIES = [
  "Certifications",
  "Contracts",
  "Licenses",
  "Documents",
  "Appointments",
  "Internal Deadlines",
  "Other"
];

// Get items from LocalStorage
function getItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Calculate item status using expiry date
function getStatus(expiryDate) {
  if (!expiryDate) return "Unknown";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${expiryDate}T00:00:00`);

  if (Number.isNaN(expiry.getTime())) return "Unknown";

  const days = Math.ceil(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) return "Expired";
  if (days <= 7) return "Expiring Soon";
  if (days <= 30) return "Upcoming";

  return "Active";
}

// Format date in US format
function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US");
}

// Normalize CSV dates
function normalizeDate(date) {
  if (!date) return null;

  const value = date.trim();

  let normalized;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    normalized = value;
  } else {
    const match = value.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (!match) return null;

    const [, month, day, year] = match;

    normalized =
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(`${normalized}T00:00:00`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== normalized
  ) {
    return null;
  }

  return normalized;
}

// Parse CSV while supporting quoted values and commas
function parseCSV(text) {
  const rows = [];

  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !quoted
    ) {
      if (char === "\r" && next === "\n") {
        i++;
      }

      row.push(value.trim());

      if (row.some(cell => cell !== "")) {
        rows.push(row);
      }

      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (quoted) {
    throw new Error("CSV contains an unclosed quotation mark.");
  }

  row.push(value.trim());

  if (row.some(cell => cell !== "")) {
    rows.push(row);
  }

  return rows;
}

function Items() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteItem, setDeleteItem] = useState(null);

  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Load items
  const loadItems = () => {
    setItems(getItems());
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Calculate statuses dynamically
  const updatedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      status: getStatus(item.expiry_date)
    }));
  }, [items]);

  // Search and filter
  const filteredItems = updatedItems.filter(item => {
    const searchMatch =
      item.item_id?.toLowerCase().includes(search.toLowerCase()) ||
      item.item_name?.toLowerCase().includes(search.toLowerCase());

    const categoryMatch =
      categoryFilter === "All" ||
      item.category === categoryFilter;

    const statusMatch =
      statusFilter === "All" ||
      item.status === statusFilter;

    return searchMatch && categoryMatch && statusMatch;
  });

  // Statistics
  const totalItems = items.length;

  const activeItems = updatedItems.filter(
    item => item.status === "Active"
  ).length;

  const upcomingItems = updatedItems.filter(
    item => item.status === "Upcoming"
  ).length;

  const expiringItems = updatedItems.filter(
    item => item.status === "Expiring Soon"
  ).length;

  const expiredItems = updatedItems.filter(
    item => item.status === "Expired"
  ).length;

  // Delete item
  const handleDelete = () => {
    if (!deleteItem) return;

    const updated = items.filter(
      item => item.id !== deleteItem.id
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    setItems(updated);
    setDeleteItem(null);
  };

  // CSV Import
  const handleCSVImport = event => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImportMessage("");
    setImportError("");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setImportError("Please select a valid CSV file.");
      event.target.value = "";
      return;
    }

    setIsImporting(true);

    const reader = new FileReader();

    reader.onload = e => {
      try {
        const csvText = e.target.result;

        const rows = parseCSV(csvText);

        if (rows.length < 2) {
          throw new Error(
            "CSV file contains no item records."
          );
        }

        // Read column names
        const headers = rows[0].map(header =>
          header.replace(/^\uFEFF/, "").trim().toLowerCase()
        );

        const requiredHeaders = [
          "item id",
          "item name",
          "category",
          "assigned employee",
          "issue date",
          "expiry date"
        ];

        const missingHeaders = requiredHeaders.filter(
          header => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          throw new Error(
            `Missing columns: ${missingHeaders.join(", ")}`
          );
        }

        const column = name => headers.indexOf(name);

        const existingItems = getItems();

        const existingIds = new Set(
          existingItems.map(item =>
            String(item.item_id || "").trim().toLowerCase()
          )
        );

        const fileIds = new Set();

        const importedItems = [];
        const errors = [];

        // Process every CSV record
        rows.slice(1).forEach((row, index) => {
          const line = index + 2;

          if (row.length !== headers.length) {
            errors.push(
              `Row ${line}: Incorrect number of columns.`
            );
            return;
          }

          const itemId = row[column("item id")]?.trim();
          const itemName = row[column("item name")]?.trim();
          const category = row[column("category")]?.trim();
          const employeeName =
            row[column("assigned employee")]?.trim();

          const issueDate = normalizeDate(
            row[column("issue date")]
          );

          const expiryDate = normalizeDate(
            row[column("expiry date")]
          );

          // Required fields
          if (
            !itemId ||
            !itemName ||
            !category ||
            !employeeName
          ) {
            errors.push(
              `Row ${line}: Required fields are missing.`
            );
            return;
          }

          // Duplicate Item ID validation
          const idKey = itemId.toLowerCase();

          if (
            existingIds.has(idKey) ||
            fileIds.has(idKey)
          ) {
            errors.push(
              `Row ${line}: Duplicate Item ID ${itemId}.`
            );
            return;
          }

          // Date validation
          if (!issueDate || !expiryDate) {
            errors.push(
              `Row ${line}: Invalid issue date or expiry date.`
            );
            return;
          }

          if (expiryDate < issueDate) {
            errors.push(
              `Row ${line}: Expiry date cannot be before issue date.`
            );
            return;
          }

          // Category validation
          const matchedCategory = VALID_CATEGORIES.find(
            categoryName =>
              categoryName.toLowerCase() === category.toLowerCase()
          );

          if (!matchedCategory) {
            errors.push(
              `Row ${line}: Invalid category ${category}.`
            );
            return;
          }

          fileIds.add(idKey);

          // Create item object
          importedItems.push({
            id: `CSV-${Date.now()}-${index}`,
            item_id: itemId,
            item_name: itemName,
            category: matchedCategory,
            employee_name: employeeName,
            issue_date: issueDate,
            expiry_date: expiryDate,
            status: getStatus(expiryDate)
          });
        });

        // Save valid records
        if (importedItems.length > 0) {
          const updatedItems = [
            ...existingItems,
            ...importedItems
          ];

          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedItems)
          );

          setItems(updatedItems);
        }

        // Display import results
        if (errors.length > 0) {
          setImportError(
            `${importedItems.length} items imported successfully.\n` +
            `${errors.length} rows skipped.\n\n` +
            errors.slice(0, 10).join("\n")
          );
        } else {
          setImportMessage(
            `${importedItems.length} items imported successfully!`
          );
        }

      } catch (error) {
        setImportError(
          error.message || "Unable to import CSV file."
        );
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      setImportError("Unable to read the selected CSV file.");
      setIsImporting(false);
    };

    reader.readAsText(file);

    // Allow selecting the same file again
    event.target.value = "";
  };

  return (
    <div className="items-page">

      {/* Header */}
      <div className="items-header">

        <div>
          <h1>Items Management</h1>
          <p>
            Manage your items and monitor their expiry dates.
          </p>
        </div>

        <div className="items-header-actions">

          {/* Hidden CSV input */}
          <input
            type="file"
            id="csvImport"
            accept=".csv,text/csv"
            hidden
            onChange={handleCSVImport}
          />

          {/* Import CSV */}
          <button
            className="items-import-btn"
            onClick={() =>
              document.getElementById("csvImport").click()
            }
            disabled={isImporting}
          >
            <Upload size={18} />
            {isImporting ? "Importing..." : "Import CSV"}
          </button>

          {/* Add New Item */}
          <button
            className="items-add-btn"
            onClick={() => navigate("/items/add")}
          >
            <Plus size={18} />
            Add New Item
          </button>

        </div>
      </div>

      {/* Import Messages */}
      {importMessage && (
        <div className="csv-success-message">
          <CheckCircle size={18} />
          {importMessage}
        </div>
      )}

      {importError && (
        <div className="csv-error-message">
          <AlertTriangle size={18} />
          <pre>{importError}</pre>
        </div>
      )}

      {/* Summary Cards */}
      <div className="items-stats-grid">

        <div className="item-stat-card total-card">
          <div className="item-stat-icon">
            <Package />
          </div>
          <div>
            <h3>Total Items</h3>
            <h2>{totalItems}</h2>
          </div>
        </div>

        <div className="item-stat-card active-card">
          <div className="item-stat-icon">
            <CheckCircle />
          </div>
          <div>
            <h3>Active Items</h3>
            <h2>{activeItems}</h2>
          </div>
        </div>

        <div className="item-stat-card upcoming-card">
          <div className="item-stat-icon">
            <Clock />
          </div>
          <div>
            <h3>Upcoming</h3>
            <h2>{upcomingItems}</h2>
          </div>
        </div>

        <div className="item-stat-card expiring-card">
          <div className="item-stat-icon">
            <AlertTriangle />
          </div>
          <div>
            <h3>Expiring Soon</h3>
            <h2>{expiringItems}</h2>
          </div>
        </div>

        <div className="item-stat-card expired-card">
          <div className="item-stat-icon">
            <CalendarDays />
          </div>
          <div>
            <h3>Expired</h3>
            <h2>{expiredItems}</h2>
          </div>
        </div>

      </div>

      {/* Search and Filters */}
      <div className="items-toolbar">

        <div className="items-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search by item ID or item name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="items-filter">
          <Filter size={17} />

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {VALID_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="items-filter">

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
            <option value="Completed">Completed</option>
          </select>

        </div>

        <button
          className="items-reset-btn"
          onClick={() => {
            setSearch("");
            setCategoryFilter("All");
            setStatusFilter("All");
          }}
          title="Reset filters"
        >
          <RefreshCw size={17} />
        </button>

      </div>

      {/* Items Table */}
      <div className="items-table-container">

        <div className="items-table-heading">

          <div>
            <h2>All Items</h2>
            <p>
              View and manage your registered items.
            </p>
          </div>

          <span className="items-count">
            {filteredItems.length} Records
          </span>

        </div>

        <div className="items-table-scroll">

          <table className="items-table">

            <thead>
              <tr>
                <th>Item ID</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Assigned Employee</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredItems.length > 0 ? (

                filteredItems.map(item => (

                  <tr key={item.id}>

                    <td className="item-id-cell">
                      {item.item_id}
                    </td>

                    <td className="item-name-cell">
                      {item.item_name}
                    </td>

                    <td>{item.category}</td>

                    <td>{item.employee_name || "-"}</td>

                    <td>{formatDate(item.issue_date)}</td>

                    <td>{formatDate(item.expiry_date)}</td>

                    <td>
                      <span
                        className={`item-status ${item.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="item-action-buttons">

                        {/* View */}
                        <button
                          className="item-view-btn"
                          title="View"
                          onClick={() =>
                            navigate(`/items/view/${item.id}`)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        {/* Edit */}
                        <button
                          className="item-edit-btn"
                          title="Edit"
                          onClick={() =>
                            navigate(`/items/edit/${item.id}`)
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        {/* Delete */}
                        <button
                          className="item-delete-btn"
                          title="Delete"
                          onClick={() => setDeleteItem(item)}
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="8" className="items-empty">
                    <Package size={42} />

                    <h3>No Items Found</h3>

                    <p>
                      Add a new item, import a CSV file,
                      or change your search filters.
                    </p>
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteItem && (
        <DeleteItem
          item={deleteItem}
          onCancel={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}

    </div>
  );
}

export default Items;
