import React, { useEffect, useState } from "react";
import ProviderCard from "../components/ProviderCard";

const API_URL = "https://job-backend-2bfw.onrender.com";

export default function ProvidersPage(props) {
  const {
    providers,
    setProviders,

    setSelectedProvider,

    pname,
    setPname,

    pskills,
    setPskills,

    pexperience,
    setPexperience,

    pbio,
    setPbio,

    pavailable,
    setPavailable,

    setChatProvider,
    setTab,
  } = props;

  const [loading, setLoading] = useState(false);

  // =====================================================
  // GET ALL PROVIDERS
  // =====================================================

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        console.log("🔵 Fetching providers...");

        const response = await fetch(
          `${API_URL}/providers`
        );

        console.log(
          "📡 Providers API status:",
          response.status
        );

        const data = await response.json();

        console.log(
          "📦 Providers API response:",
          data
        );

        if (response.ok && data.status === 1) {
          console.log(
            "✅ Providers fetched successfully"
          );

          setProviders(data.providers || []);
        } else {
          console.error(
            "❌ Providers API error:",
            data.msg
          );

          alert(
            data.msg || "Failed to fetch providers"
          );
        }
      } catch (error) {
        console.error(
          "❌ Fetch providers error:",
          error
        );

        alert(
          "Server connection error. Check backend on port 3500."
        );
      }
    };

    fetchProviders();
  }, [setProviders]);

  // =====================================================
  // CREATE PROVIDER
  // =====================================================

  const handleAddProvider = async () => {
    if (!pname.trim()) {
      return alert("Provider name is required");
    }

    if (!pskills.trim()) {
      return alert("Skills are required");
    }

    if (!pexperience.trim()) {
      return alert("Experience is required");
    }

    try {
      const token = localStorage.getItem("token");

      console.log(
        "🔑 Provider token:",
        token ? "Token exists" : "Token missing"
      );

      if (!token) {
        return alert("Please login first");
      }

      setLoading(true);

      console.log("🔵 Creating provider...");

      // Backend schema me skills String hai
      const skills = pskills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .join(", ");

      // Backend schema me available Boolean hai
      const available =
        pavailable === "Available";

      const response = await fetch(
        `${API_URL}/providers`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: pname.trim(),
            skills: skills,
            experience: pexperience.trim(),
            bio: pbio.trim(),
            available: available,
            profileImage: "",
          }),
        }
      );

      console.log(
        "📡 Create Provider status:",
        response.status
      );

      const data = await response.json();

      console.log(
        "📦 Create Provider response:",
        data
      );

      if (response.ok && data.status === 1) {
        console.log(
          "✅ Provider created successfully"
        );

        alert(
          "Provider registered successfully!"
        );

        // New provider ko list ke top par add karo
        setProviders((prev) => [
          data.provider,
          ...(Array.isArray(prev) ? prev : []),
        ]);

        // Form clear
        setPname("");
        setPskills("");
        setPexperience("");
        setPbio("");
        setPavailable("Available");
      } else {
        console.error(
          "❌ Create provider failed:",
          data.msg
        );

        alert(
          data.msg || "Failed to create provider"
        );
      }
    } catch (error) {
      console.error(
        "❌ Create provider error:",
        error
      );

      alert(
        "Server connection error. Check backend on port 3500."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SAFE PROVIDERS
  // =====================================================

  const safeProviders = Array.isArray(providers)
    ? providers
    : [];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="card">
      <h3>Register Service Provider</h3>

      <div className="two-col">
        {/* NAME */}

        <div>
          <label className="small">
            Name
          </label>

          <input
            value={pname}
            onChange={(e) =>
              setPname(e.target.value)
            }
            placeholder="Ajay Electrician"
          />
        </div>

        {/* EXPERIENCE */}

        <div>
          <label className="small">
            Experience
          </label>

          <input
            value={pexperience}
            onChange={(e) =>
              setPexperience(e.target.value)
            }
            placeholder="3 years"
          />
        </div>
      </div>

      {/* SKILLS */}

      <label className="small">
        Skills (comma separated)
      </label>

      <input
        value={pskills}
        onChange={(e) =>
          setPskills(e.target.value)
        }
        placeholder="Electrician, AC Repair"
      />

      {/* BIO */}

      <label className="small">
        About
      </label>

      <textarea
        value={pbio}
        onChange={(e) =>
          setPbio(e.target.value)
        }
        placeholder="Short professional bio"
        rows="3"
      />

      {/* AVAILABILITY */}

      <label className="small">
        Availability
      </label>

      <select
        value={pavailable}
        onChange={(e) =>
          setPavailable(e.target.value)
        }
        style={{
          padding: 10,
          borderRadius: 8,
          width: "100%",
        }}
      >
        <option>Available</option>
        <option>Busy</option>
        <option>Offline</option>
      </select>

      {/* BUTTON */}

      <div className="action-row">
        <button
          className="btn"
          onClick={handleAddProvider}
          disabled={loading}
        >
          {loading
            ? "Registering..."
            : "Register Provider"}
        </button>
      </div>

      {/* PROVIDERS */}

      <h4>Providers</h4>

      {safeProviders.length === 0 && (
        <div className="small">
          No providers yet.
        </div>
      )}

      {safeProviders.map((p) => (
        <ProviderCard
          key={p._id || p.id}
          provider={p}
          onProfile={(provider) => {
  setSelectedProvider(provider);
}}
onChat={(provider) => {
  setChatProvider(provider);
  setTab("chat");
}}
        />
      ))}
    </div>
  );
}