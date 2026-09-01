import React from "react";

export default function DashboardPage(props) {
  const {
    jobs = [],
    providers = [],
    applications = [],
    bookings = [],
    favorites = [],
  } = props;

  return (
    <div className="card">
      <h3>JobPilot Dashboard</h3>

      {/* Stats Row */}
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

        <div className="stat">
          Bookings
          <strong>{bookings.length}</strong>
        </div>

        <div className="stat">
          Favorites
          <strong>{favorites.length}</strong>
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