import React, { useEffect, useState } from "react";

const API = "https://job-backend-2bfw.onrender.com";

export default function BookingPage() {
  const [jobs, setJobs] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");

  const [selectedJob, setSelectedJob] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  // =========================
  // REVIEW STATES
  // =========================
  const [reviewRating, setReviewRating] = useState({});
  const [reviewComment, setReviewComment] = useState({});
  const [reviewingId, setReviewingId] = useState(null);
  const [openReviewId, setOpenReviewId] = useState(null);

  const token = localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // =========================
  // FETCH JOBS
  // =========================
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("JOBS:", data);

      if (response.ok && data.status === 1) {
        setJobs(data.jobs || []);
      } else {
        console.error("Jobs error:", data);
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
    }
  };

  // =========================
  // FETCH PROVIDERS
  // =========================
  const fetchProviders = async () => {
    try {
      const response = await fetch(`${API}/providers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("PROVIDERS:", data);

      if (response.ok && data.status === 1) {
        setProviders(data.providers || []);
      } else {
        console.error("Providers error:", data);
      }
    } catch (error) {
      console.error("Fetch providers error:", error);
    }
  };

  // =========================
  // FETCH BOOKINGS
  // =========================
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("❌ BOOKINGS RESPONSE IS NOT JSON:", text);
        return;
      }

      console.log("BOOKINGS:", data);

      if (response.ok && data.status === 1) {
        setBookings(data.bookings || []);
      } else {
        console.error("Bookings error:", data);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    if (!token) {
      alert("Please login first");
      return;
    }

    fetchJobs();
    fetchProviders();
    fetchBookings();
  }, []);

  // =========================
  // CREATE BOOKING
  // =========================
  const createBooking = async () => {
    if (!selectedJob || !selectedProvider) {
      return alert("Choose both Job and Provider");
    }

    if (!bookingDate || !bookingTime) {
      return alert("Please select booking date and time");
    }

    if (!proposedPrice) {
      return alert("Please enter agreed price");
    }

    try {
      const response = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          jobId: selectedJob,
          providerId: selectedProvider,
          bookingDate,
          bookingTime,
          proposedPrice: Number(proposedPrice),
        }),
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("❌ CREATE BOOKING RESPONSE IS NOT JSON:", text);
        alert("Booking backend ne valid JSON return nahi kiya.");
        return;
      }

      console.log("CREATE BOOKING:", data);

      if (response.ok && data.status === 1) {
        alert("Booking created successfully!");

        setBookingDate("");
        setBookingTime("");
        setProposedPrice("");
        setSelectedJob("");
        setSelectedProvider("");

        await fetchBookings();
      } else {
        alert(data.msg || data.message || "Booking failed");
      }
    } catch (error) {
      console.error("Create booking error:", error);
      alert("Server connection error");
    }
  };

  // =========================
  // COMPLETE CLICK
  // =========================
  const markComplete = (bookingId) => {
    console.log("🟡 Complete clicked:", bookingId);
    setOpenReviewId(bookingId);
  };

  // =========================
  // SUBMIT REVIEW
  // =========================
  const submitReview = async (booking) => {
    const rating = reviewRating[booking._id];
    const comment = reviewComment[booking._id] || "";

    if (!rating) {
      return alert("Please select a rating");
    }

    // Provider ID Handling
    const providerId =
      typeof booking.providerId === "object"
        ? booking.providerId?._id
        : booking.providerId;

    if (!providerId) {
      console.error("❌ Provider ID missing:", booking);
      return alert("Provider ID missing");
    }

    // Booking ID Checking
    if (!booking._id) {
      console.error("❌ Booking ID missing:", booking);
      return alert("Booking ID missing");
    }

    try {
      setReviewingId(booking._id);

      console.log("📝 SUBMIT REVIEW:", {
        bookingId: booking._id,
        providerId,
        rating: Number(rating),
        comment,
      });

      const response = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          bookingId: booking._id,
          providerId,
          rating: Number(rating),
          comment,
        }),
      });

      const text = await response.text();

      console.log("REVIEW STATUS:", response.status);
      console.log("REVIEW RAW RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("❌ REVIEW RESPONSE IS NOT JSON:", text);
        alert("Review backend route ne JSON return nahi kiya.");
        return;
      }

      console.log("📦 REVIEW RESPONSE:", data);

      if (response.ok && data.status === 1) {
        alert("Review submitted successfully! ⭐");

        setReviewRating((prev) => {
          const copy = { ...prev };
          delete copy[booking._id];
          return copy;
        });

        setReviewComment((prev) => {
          const copy = { ...prev };
          delete copy[booking._id];
          return copy;
        });

        setOpenReviewId(null);
        await fetchBookings();
      } else {
        alert(data.msg || data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      alert("Server connection error");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="card">
      <h3>Booking Management</h3>

      {/* CREATE BOOKING */}
      <label className="small">Select Job</label>
      <select
        value={selectedJob}
        onChange={(e) => setSelectedJob(e.target.value)}
        style={{ padding: 10, width: "100%", borderRadius: 8 }}
      >
        <option value="">Select Job</option>
        {jobs.map((j) => (
          <option value={j._id} key={j._id}>
            {j.title}
          </option>
        ))}
      </select>

      <label className="small">Select Provider</label>
      <select
        value={selectedProvider}
        onChange={(e) => setSelectedProvider(e.target.value)}
        style={{ padding: 10, width: "100%", borderRadius: 8 }}
      >
        <option value="">Select Provider</option>
        {providers.map((p) => (
          <option value={p._id} key={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* DATE + TIME */}
      <div className="two-col">
        <div>
          <label className="small">Date</label>
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />
        </div>

        <div>
          <label className="small">Time</label>
          <input
            type="time"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
          />
        </div>
      </div>

      {/* PRICE */}
      <label className="small">Agreed Price ₹</label>
      <input
        type="number"
        value={proposedPrice}
        onChange={(e) => setProposedPrice(e.target.value)}
        placeholder="1500"
      />

      {/* CREATE BUTTON */}
      <div className="action-row">
        <button className="btn" onClick={createBooking}>
          Create Booking
        </button>
      </div>

      {/* BOOKINGS */}
      <h4>Bookings</h4>

      {bookings.length === 0 && (
        <div className="small">No bookings yet.</div>
      )}

      {bookings.map((b) => {
        const jobId =
          typeof b.jobId === "object" ? b.jobId?._id : b.jobId;
        const providerId =
          typeof b.providerId === "object" ? b.providerId?._id : b.providerId;

        const job =
          jobs.find((j) => String(j._id) === String(jobId)) ||
          (typeof b.jobId === "object"
            ? b.jobId
            : { title: "Job removed" });

        const prov =
          providers.find((p) => String(p._id) === String(providerId)) ||
          (typeof b.providerId === "object"
            ? b.providerId
            : { name: "Provider removed" });

        const isReviewing = reviewingId === b._id;
        const isReviewOpen = openReviewId === b._id;

        return (
          <div className="list-item" key={b._id}>
            {/* BOOKING INFO */}
            <div>
              <strong>
                {prov?.name || "Provider removed"} — {job?.title || "Job removed"}
              </strong>

              <div className="small">
                📅 {b.bookingDate} • ⏰ {b.bookingTime} • 💰 ₹
                {b.proposedPrice || 0}
              </div>

              <span className={`badge ${b.status}`}>
                {String(b.status).toUpperCase()}
              </span>

              {/* EXISTING RATING */}
              {b.rating && (
                <div className="small">
                  Rating: {"⭐".repeat(Number(b.rating))}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div
              className="action-row"
              style={{
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              {b.status !== "cancelled" &&
                !b.rating &&
                !isReviewOpen && (
                  <button className="btn" onClick={() => markComplete(b._id)}>
                    Complete
                  </button>
                )}

              {/* REVIEW SECTION */}
              {isReviewOpen && !b.rating && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 14,
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    className="small"
                    style={{
                      marginBottom: 10,
                      fontWeight: 600,
                    }}
                  >
                    ⭐ Rate this provider
                  </div>

                  {/* RATING SELECT */}
                  <select
                    value={reviewRating[b._id] || ""}
                    onChange={(e) =>
                      setReviewRating((prev) => ({
                        ...prev,
                        [b._id]: e.target.value,
                      }))
                    }
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  >
                    <option value="">Select Rating</option>
                    <option value="5">⭐⭐⭐⭐⭐</option>
                    <option value="4">⭐⭐⭐⭐</option>
                    <option value="3">⭐⭐⭐</option>
                    <option value="2">⭐⭐</option>
                    <option value="1">⭐</option>
                  </select>

                  {/* COMMENT INPUT */}
                  <input
                    type="text"
                    placeholder="Write your review..."
                    value={reviewComment[b._id] || ""}
                    onChange={(e) =>
                      setReviewComment((prev) => ({
                        ...prev,
                        [b._id]: e.target.value,
                      }))
                    }
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      marginTop: 8,
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* REVIEW BUTTONS */}
                  <div
                    className="action-row"
                    style={{ marginTop: 8 }}
                  >
                    <button
                      className="btn"
                      disabled={isReviewing}
                      onClick={() => submitReview(b)}
                    >
                      {isReviewing ? "Submitting..." : "Submit Review"}
                    </button>

                    <button
                      className="btn"
                      type="button"
                      disabled={isReviewing}
                      onClick={() => {
                        setOpenReviewId(null);
                        setReviewRating((prev) => {
                          const copy = { ...prev };
                          delete copy[b._id];
                          return copy;
                        });
                        setReviewComment((prev) => {
                          const copy = { ...prev };
                          delete copy[b._id];
                          return copy;
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}