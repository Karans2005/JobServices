import React, { useState } from "react";

export default function FavoritesPage(props) {
  const { favorites = [], jobs = [], toggleFavorite, onOpenChat } = props;

  const [selectedFavoriteJob, setSelectedFavoriteJob] = useState(null);

  // Safe Arrays
  const favList = Array.isArray(favorites) ? favorites : [];
  const jobList = Array.isArray(jobs) ? jobs : [];

  // Match favorite jobs using MongoDB _id / id
  const favoriteJobs = jobList.filter((job) => {
    const jobIdStr = String(job?._id || job?.id || "");

    return favList.some((fav) => {
      const favIdStr =
        typeof fav === "object"
          ? String(fav?._id || fav?.id || fav)
          : String(fav);

      return favIdStr === jobIdStr;
    });
  });

  // =========================
  // DETAILED JOB VIEW
  // =========================
  if (selectedFavoriteJob) {
    const job = selectedFavoriteJob;

    return (
      <div className="card">
        <button
          className="btn ghost"
          onClick={() => setSelectedFavoriteJob(null)}
          style={{ marginBottom: 15 }}
        >
          ← Back to Favorites
        </button>

        <h3>📋 Job Details</h3>

        {/* Job Image */}
        {(job?.jobImage || job?.image) && (
          <img
            src={job.jobImage || job.image}
            alt={job.title || "Job"}
            className="image-preview"
            style={{
              width: "100%",
              maxHeight: 300,
              objectFit: "cover",
              borderRadius: 10,
              marginBottom: 15,
            }}
          />
        )}

        {/* Title */}
        <h2 style={{ marginBottom: 8 }}>{job?.title || "Untitled Job"}</h2>

        {/* Service */}
        <div className="small" style={{ marginBottom: 8 }}>
          🛠️ <strong>Service:</strong> {job?.service || "General"}
        </div>

        {/* Location */}
        <div className="small" style={{ marginBottom: 8 }}>
          📍 <strong>Location:</strong> {job?.location || "N/A"}
        </div>

        {/* Budget */}
        <div className="small" style={{ marginBottom: 8 }}>
          💰 <strong>Budget:</strong>{" "}
          {job?.budgetMin || job?.budgetMax
            ? `₹${job?.budgetMin || 0} - ₹${job?.budgetMax || job?.budgetMin || 0}`
            : "Not specified"}
        </div>

        {/* Posted By */}
        <div className="small" style={{ marginBottom: 8 }}>
          👤 <strong>Posted By:</strong>{" "}
          {typeof job?.postedBy === "object"
            ? job?.postedBy?.name || job?.postedBy?.email || "Unknown User"
            : job?.postedBy || "Unknown User"}
        </div>

        {/* Description */}
        <div style={{ marginTop: 18 }}>
          <h4>Description</h4>
          <p
            className="small"
            style={{
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {job?.description || job?.desc || "No description available."}
          </p>
        </div>

        {/* Actions */}
        <div className="action-row" style={{ marginTop: 20, display: "flex", gap: 10 }}>
          {onOpenChat && (
            <button
              className="btn"
              onClick={() => onOpenChat(job)}
            >
              💬 Start Chat
            </button>
          )}

          <button
            className="btn secondary"
            onClick={() => {
              const jobId = job?._id || job?.id;
              toggleFavorite && toggleFavorite(jobId);
              setSelectedFavoriteJob(null);
            }}
          >
            ❤️ Remove from Favorites
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // FAVORITES LIST
  // =========================
  return (
    <div className="card">
      <h3>❤️ Saved Jobs</h3>

      {favoriteJobs.length === 0 ? (
        <div
          className="small"
          style={{
            padding: "12px 0",
            color: "#666",
          }}
        >
          No favorite jobs yet. Tap 🤍 on a job.
        </div>
      ) : (
        favoriteJobs.map((job) => {
          const jobId = job?._id || job?.id;

          return (
            <div
              className="list-item"
              key={jobId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <strong>{job?.title || "Untitled Job"}</strong>

                <div className="small">
                  {job?.service || "General"} • 📍 {job?.location || "N/A"}
                </div>

                <div className="small">
                  💰{" "}
                  {job?.budgetMin || job?.budgetMax
                    ? `₹${job?.budgetMin || 0} - ₹${job?.budgetMax || job?.budgetMin || 0}`
                    : "Not specified"}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {toggleFavorite && (
                  <button
                    className="btn secondary"
                    title="Remove from favorites"
                    onClick={() => toggleFavorite(jobId)}
                  >
                    ❤️
                  </button>
                )}

                <button
                  className="btn"
                  onClick={() => setSelectedFavoriteJob(job)}
                >
                  View
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}