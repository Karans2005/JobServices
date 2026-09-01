import React from "react";

export default function ProviderCard({
  provider,
  onProfile,
  onChat,
}) {
  // Backend se skills String aa rahi hai
  const skillsText = Array.isArray(provider.skills)
    ? provider.skills.join(", ")
    : provider.skills || "No skills added";

  // Backend me available Boolean hai
  const availability = provider.available
    ? "Available"
    : "Offline";

  return (
    <div className="list-item">
      <div>
        <strong>
          👤 {provider.name}
        </strong>

        {/* Verified agar backend/frontend me available ho */}
        {provider.verified && (
          <span className="verified">
            ✓ Verified
          </span>
        )}

        {/* Skills */}
        <div className="small">
          🛠 {skillsText}
        </div>

        {/* Provider information */}
        <div className="small">
          ⭐ {provider.rating || 0} •{" "}
          {provider.experience || "Experience not specified"} •{" "}
          <span className="pill">
            {availability}
          </span>
        </div>

        {/* Bio */}
        {provider.bio && (
          <div
            className="small"
            style={{ marginTop: 5 }}
          >
            {provider.bio}
          </div>
        )}
      </div>

      <div className="action-row">
        <button
          className="btn"
          onClick={() => onProfile(provider)}
        >
          Profile
        </button>

        <button
          className="btn"
          onClick={() => onChat(provider)}
        >
          💬 Chat
        </button>
      </div>
    </div>
  );
}