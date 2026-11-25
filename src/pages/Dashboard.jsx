
function Dashboard() {
  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1e293b" }}>
        Welcome to Reminder Management System
      </h1>

      <p style={{ color: "#64748b", marginTop: "10px" }}>
        Manage your employees, items, reminders and schedules in one place.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginTop: "30px"
      }}>
        {[
          ["Total Employees", "0"],
          ["Total Items", "0"],
          ["Upcoming Reminders", "0"],
          ["Completed Reminders", "0"]
        ].map(([title, value]) => (
          <div key={title} style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ color: "#64748b" }}>{title}</h3>
            <h2 style={{ fontSize: "30px", marginTop: "12px" }}>
              {value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
