
import { Navigate, Outlet, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";

// Employee pages
import Employees from "./pages/employees/Employees";
import AddEmployee from "./pages/employees/AddEmployee";
import EditEmployee from "./pages/employees/EditEmployee";
import EmployeeDetails from "./pages/employees/EmployeeDetails";

import Items from "./pages/items/Items";
import AddItem from "./pages/items/AddItem";
import EditItem from "./pages/items/EditItem";
import ItemDetails from "./pages/items/ItemDetails";

function ProtectedRoute() {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Authentication Routes */}
      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
      />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Employee Routes */}
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/add" element={<AddEmployee />} />
          <Route path="/employees/edit/:id" element={<EditEmployee />} />
          <Route path="/employees/view/:id" element={<EmployeeDetails />} />

          {/* Items Modules */}
          <Route path="/items" element={<Items />} />
          <Route path="/items/add" element={<AddItem />} />
          <Route path="/items/view/:id" element={<ItemDetails />} />
          <Route path="/items/edit/:id" element={<EditItem />} />
          {/* Other Modules */}
          <Route path="/calendar" element={<ModulePage />} />
          <Route path="/activity-log" element={<ModulePage />} />
          <Route path="/reminder-log" element={<ModulePage />} />
          <Route path="/recipients" element={<ModulePage />} />
          <Route path="/scheduler" element={<ModulePage />} />
          <Route path="/settings" element={<ModulePage />} />

        </Route>
      </Route>

      {/* Default Routes */}
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
      />

      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
      />
    </Routes>
  );
}

export default App;
