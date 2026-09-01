import React from "react";

export default function DashboardPage(props) {
  const {
    jobs = [],
    providers = [],
    applications = [],
    bookings = [],
    favorites = [],
    notifications = [],
  } = props;

  // Status Filter Checks
  const completedBookings = bookings.filter(
    (booking) => booking?.status === "completed"
  ).length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification?.read
  ).length;

  return (
    <div className="card">
      <h3>JobPilot Dashboard</h3>

      {/* First Stats Row */}
      <div className="stats-grid">
        <div className="stat">
          Jobs
          <strong>{jobs.length}</strong>
        </div>

        <div className="stat">
          Providers
          <strong>{providers.length}</strong>
        </div>

        <div className="stat">
          Applications
          <strong>{applications.length}</strong>
        </div>
      </div>

      {/* Second Stats Row */}
      <div className="stats-grid">
        <div className="stat">
          Bookings
          <strong>{bookings.length}</strong>
        </div>

        <div className="stat">
          Completed
          <strong>{completedBookings}</strong>
        </div>

        <div className="stat">
          Favorites
          <strong>{favorites.length}</strong>
        </div>
      </div>

      {/* Notifications */}
      <div className="stats-grid">
        <div className="stat">
          Notifications
          <strong>{unreadNotifications}</strong>
        </div>
      </div>

      {/* Recent Jobs List */}
      <h4>Recent Jobs</h4>

      {jobs.length === 0 ? (
        <div className="small">No jobs available yet.</div>
      ) : (
        jobs.slice(0, 5).map((job) => (
          <div className="list-item" key={job._id || job.id}>
            <strong>{job.title || "Untitled Job"}</strong>

            <span className="small">
              {job.service || "General"} • {job.location || "N/A"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}