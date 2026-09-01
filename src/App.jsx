import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import JobsPage from './pages/JobsPage';
import ProvidersPage from './pages/ProvidersPage';
import ApplicationsPage from './pages/ApplicationsPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import FavoritesPage from './pages/FavoritesPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';

/***** CONFIG: Replace these values with your Firebase project's config for real auth *****/
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const hasFirebaseConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.authDomain;

if (hasFirebaseConfig) {
  try {
    window.firebase.initializeApp(firebaseConfig);
  } catch (e) {
    console.warn("Firebase init error:", e);
  }
}

const LOCAL_USER_KEY = "jp_demo_local_user";

function useDarkMode() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("jp_dark") === "1"
  );

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("jp_dark", dark ? "1" : "0");
  }, [dark]);

  return [dark, setDark];
}

function RootApp() {
  const [dark, setDark] = useDarkMode();
  const [user, setUser] = useState(null);

  const [usingFirebase] = useState(
    hasFirebaseConfig && window.firebase && window.firebase.auth
  );

  useEffect(() => {
    if (usingFirebase) {
      const unsub = window.firebase.auth().onAuthStateChanged((u) => {
        if (u) {
          setUser({ email: u.email, uid: u.uid });
        } else {
          setUser(null);
        }
      });
      return () => unsub();
    } else {
      const local = localStorage.getItem(LOCAL_USER_KEY);
      if (local) {
        setUser({ email: local });
      }
    }
  }, [usingFirebase]);

  return (
    <>
      <Navbar
        user={user}
        setUser={setUser}
        dark={dark}
        setDark={setDark}
        usingFirebase={usingFirebase}
      />

      {user ? (
        <ProtectedApp user={user} usingFirebase={usingFirebase} />
      ) : (
        <AuthScreen setUser={setUser} usingFirebase={usingFirebase} />
      )}
    </>
  );
}

// ======================================================
// AUTH SCREEN (With Fixed SPA State Login)
// ======================================================

function AuthScreen({ setUser, usingFirebase }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !pass || !confirmPass) {
      return alert("Enter all details");
    }

    if (pass !== confirmPass) {
      return alert("Password and Confirm Password do not match");
    }

    setLoading(true);

    try {
      const response = await fetch("https://job-backend-2bfw.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          password: pass,
          confirmPassword: confirmPass
        })
      });

      const data = await response.json();

      if (response.ok && data.status === 1) {
        alert("Signup successful. Please login.");
        setIsSignup(false);
        setName("");
        setEmail("");
        setPass("");
        setConfirmPass("");
      } else {
        alert(data.msg || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !pass) {
      return alert("Enter email & password");
    }

    setLoading(true);

    try {
      const response = await fetch("https://job-backend-2bfw.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: pass })
      });

      const data = await response.json();

      if (response.ok && data.status === 1) {
        alert("Login successful");

        const userEmail = data.user?.email || email;
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("jp_demo_local_user", userEmail);

        if (data.user?.name) {
          localStorage.setItem("jp_demo_name", data.user.name);
        }

        // ✅ FIXED: Direct React State Update (No Page Refresh required)
        setUser({
          email: userEmail,
          uid: data.user?.id || Date.now()
        });
      } else {
        alert(data.msg || data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 style={{ margin: 0, textAlign: "center" }}>Welcome to JobPilot</h2>

      <p className="muted" style={{ textAlign: "center", marginTop: 8 }}>
        {isSignup ? "Create your JobPilot account" : "Login to your JobPilot account"}
      </p>

      {isSignup && (
        <>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </>
      )}

      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <label>Password</label>
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="••••••••"
      />

      {isSignup && (
        <>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="Confirm your password"
          />
        </>
      )}

      <button
        className="btn"
        style={{ width: "100%", marginTop: 16 }}
        onClick={isSignup ? handleSignup : handleLogin}
        disabled={loading}
      >
        {isSignup
          ? loading ? "Signing up..." : "Sign up"
          : loading ? "Logging in..." : "Login"}
      </button>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <a
          href="#"
          style={{ color: "#fff", opacity: 0.85 }}
          onClick={(e) => {
            e.preventDefault();
            setIsSignup((s) => !s);
            setName("");
            setEmail("");
            setPass("");
            setConfirmPass("");
          }}
        >
          {isSignup ? "Have an account? Login" : "Create a new account"}
        </a>
      </div>

      {!usingFirebase && (
        <div style={{ marginTop: 12 }} className="muted small">
          Tip: Local credentials stored in localstorage.
        </div>
      )}
    </div>
  );
}


// ======================================================

function ProtectedApp({ user }) {
  const [tab, setTab] = useState("jobs");

  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem("jp_jobs") || "[]"));
  const [providers, setProviders] = useState(() => JSON.parse(localStorage.getItem("jp_providers") || "[]"));
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem("jp_bookings") || "[]"));
  const [applications, setApplications] = useState(() => JSON.parse(localStorage.getItem("jp_apps") || "[]"));
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("jp_favorites") || "[]"));
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem("jp_notifications") || "[]"));
  const [chats, setChats] = useState(() => JSON.parse(localStorage.getItem("jp_chats") || "[]"));

  // JOB STATES
  const [title, setTitle] = useState("");
  const [service, setService] = useState("Home Repair");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [postedBy, setPostedBy] = useState(user.email || "");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [jobImage, setJobImage] = useState("");

  // PROVIDER STATES
  const [pname, setPname] = useState("");
  const [pskills, setPskills] = useState("");
  const [pexperience, setPexperience] = useState("");
  const [pbio, setPbio] = useState("");
  const [pavailable, setPavailable] = useState("Available");

  // UI STATES
  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("All");
  const [filterLocation, setFilterLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [chatProvider, setChatProvider] = useState(null);
  const [chatText, setChatText] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");

  // Sync to LocalStorage
  useEffect(() => localStorage.setItem("jp_jobs", JSON.stringify(jobs)), [jobs]);
  useEffect(() => localStorage.setItem("jp_providers", JSON.stringify(providers)), [providers]);
  useEffect(() => localStorage.setItem("jp_bookings", JSON.stringify(bookings)), [bookings]);
  useEffect(() => localStorage.setItem("jp_apps", JSON.stringify(applications)), [applications]);
  useEffect(() => localStorage.setItem("jp_favorites", JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem("jp_notifications", JSON.stringify(notifications)), [notifications]);
  useEffect(() => localStorage.setItem("jp_chats", JSON.stringify(chats)), [chats]);

  const services = ["Home Repair", "Carpentry", "Electrician", "Plumbing", "Vehicle Repair", "Cleaning", "AC Repair", "Painting","Software Engineer","AI Engineer","Cab Booking","Car Rental Service","Food Ordering","Sivil Engineer","Computer Services","Computer Engineer","Phone Repair","Speaker Repair","TV Repair","Other.."];
  const token = localStorage.getItem("token");

  const fetchDashboardBookings = async () => {
  try {
    const response = await fetch(
      "https://job-backend-2bfw.onrender.com/bookings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("DASHBOARD BOOKINGS:", data);

    if (response.ok && data.status === 1) {
      setBookings(data.bookings || []);
    } else {
      console.error("Dashboard bookings error:", data);
    }
  } catch (error) {
    console.error("Dashboard bookings fetch error:", error);
  }
};

useEffect(() => {
  if (token) {
    fetchDashboardBookings();
  }
}, []);



  const notify = (message) =>
    setNotifications((prev) => [
      { id: Date.now() + Math.random(), message, read: false, createdAt: Date.now() },
      ...prev
    ].slice(0, 30));

  // Provider Status Switch Feature
  const toggleProviderStatus = (providerId, newStatus) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, availability: newStatus } : p))
    );
    notify(`Status updated to ${newStatus}`);
  };

  const addJob = () => {
    if (!title.trim() || !location.trim()) {
      return alert("Title and location are required");
    }

    const j = {
      id: Date.now(),
      title: title.trim(),
      service,
      description: desc.trim(),
      location: location.trim(),
      postedBy,
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || 0,
      image: jobImage,
      createdAt: Date.now()
    };

    setJobs((prev) => [j, ...prev]);
    notify(`New job posted: ${j.title}`);

    setTitle("");
    setDesc("");
    setLocation("");
    setBudgetMin("");
    setBudgetMax("");
    setJobImage("");

    alert("Job posted successfully!");
  };

  const addProvider = () => {
    if (!pname.trim() || !pskills.trim()) {
      return alert("Provider name & skills required");
    }

    const p = {
      id: Date.now(),
      name: pname.trim(),
      skills: pskills.split(",").map((s) => s.trim()).filter(Boolean),
      experience: pexperience || "1+ year",
      rating: 4.5,
      reviews: 0,
      bio: pbio.trim(),
      availability: pavailable,
      verified: true
    };

    setProviders((prev) => [p, ...prev]);
    notify(`Provider ${p.name} joined JobPilot`);

    setPname("");
    setPskills("");
    setPexperience("");
    setPbio("");
    setPavailable("Available");

    alert("Provider registered successfully!");
  };

  const applyToJob = (jobId, providerId, price = "") => {
    if (applications.some((a) => a.jobId === jobId && a.providerId === providerId)) {
      return alert("Already applied");
    }

    const job = jobs.find((j) => j.id === jobId);
    const provider = providers.find((p) => p.id === providerId);

    const a = {
      appId: Date.now(),
      jobId,
      providerId,
      status: "pending",
      proposedPrice: Number(price) || 0,
      appliedAt: Date.now()
    };

    setApplications((prev) => [a, ...prev]);
    notify(`${provider?.name || "Provider"} applied for ${job?.title || "your job"}`);
    alert("Application submitted!");
  };

  const updateApplication = (appId, status) => {
    const a = applications.find((x) => x.appId === appId);
    setApplications((prev) =>
      prev.map((x) => (x.appId === appId ? { ...x, status } : x))
    );

    if (a) {
      notify(`Application ${status}: ${jobs.find((j) => j.id === a.jobId)?.title || "Job"}`);
    }
  };

  const createBooking = ({ jobId, providerId }) => {
    if (!bookingDate || !bookingTime) {
      return alert("Please select booking date and time");
    }

    const b = {
      bookingId: Date.now(),
      jobId,
      providerId,
      userName: postedBy,
      date: bookingDate,
      time: bookingTime,
      status: "booked",
      rating: null,
      price: Number(proposedPrice) || 0,
      createdAt: Date.now()
    };

    setBookings((prev) => [b, ...prev]);
    notify(`Booking scheduled for ${bookingDate} at ${bookingTime}`);

    setBookingDate("");
    setBookingTime("");
    setProposedPrice("");

    alert("Booking created successfully!");
  };

  const markComplete = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.bookingId === id ? { ...b, status: "completed" } : b))
    );
    notify("Booking marked completed");
  };

  const rateBooking = (id, rating) => {
    setBookings((prev) =>
      prev.map((b) => (b.bookingId === id ? { ...b, rating: Number(rating) } : b))
    );

    const b = bookings.find((x) => x.bookingId === id);

    if (b) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === b.providerId
            ? {
                ...p,
                rating: Math.min(5, Number(((p.rating + Number(rating)) / 2).toFixed(1))),
                reviews: (p.reviews || 0) + 1
              }
            : p
        )
      );
    }

    notify(`Thanks! You rated the provider ${rating}/5`);
  };

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      (!q || `${j.title} ${j.description} ${j.service} ${j.location}`.toLowerCase().includes(q)) &&
      (filterService === "All" || j.service === filterService) &&
      (!filterLocation || j.location.toLowerCase().includes(filterLocation.toLowerCase()))
    );
  });

  const jobApplications = (id) => applications.filter((a) => a.jobId === id);
  const providerName = (id) => (providers.find((p) => p.id === id) || {}).name || "Unknown provider";
  const unread = notifications.filter((n) => !n.read).length;

  const sendChat = () => {
    if (!chatText.trim() || !chatProvider) return;

    setChats((prev) => [
      ...prev,
      {
        id: Date.now(),
        providerId: chatProvider.id,
        sender: "me",
        text: chatText.trim(),
        time: Date.now()
      }
    ]);

    setChatText("");
  };

  // ======================================================
  // AI SERVICE RECOMMENDATION
  // ======================================================

 const recommendService = async () => {
  if (!aiInput.trim()) {
    return alert("Please describe what service you need.");
  }

  setAiResult("🤖 AI is thinking...");

  try {
    const problem = aiInput.toLowerCase().trim();

    // Small delay for AI-like effect
    await new Promise((resolve) => setTimeout(resolve, 700));

    let recommendation = "";

    if (
      problem.includes("ac") ||
      problem.includes("air conditioner") ||
      problem.includes("cooling")
    ) {
      recommendation = "❄️ Recommended Service: AC Repair";
    } 
    else if (
      problem.includes("electric") ||
      problem.includes("wiring") ||
      problem.includes("fan") ||
      problem.includes("switch") ||
      problem.includes("light") ||
      problem.includes("socket")
    ) {
      recommendation = "⚡ Recommended Service: Electrician";
    } 
    else if (
      problem.includes("water") ||
      problem.includes("pipe") ||
      problem.includes("tap") ||
      problem.includes("leak") ||
      problem.includes("plumb")
    ) {
      recommendation = "🚰 Recommended Service: Plumbing";
    } 
    else if (
      problem.includes("wood") ||
      problem.includes("furniture") ||
      problem.includes("door") ||
      problem.includes("table") ||
      problem.includes("chair")
    ) {
      recommendation = "🪚 Recommended Service: Carpentry";
    } 
    else if (
      problem.includes("clean") ||
      problem.includes("dirt") ||
      problem.includes("room cleaning") ||
      problem.includes("house cleaning")
    ) {
      recommendation = "🧹 Recommended Service: Cleaning";
    } 
    else if (
      problem.includes("paint") ||
      problem.includes("wall") ||
      problem.includes("colour") ||
      problem.includes("color")
    ) {
      recommendation = "🎨 Recommended Service: Painting";
    } 
    else if (
      problem.includes("car") ||
      problem.includes("bike") ||
      problem.includes("vehicle") ||
      problem.includes("engine") ||
      problem.includes("brake")
    ) {
      recommendation = "🚗 Recommended Service: Vehicle Repair";
    } 
    else if (
      problem.includes("phone") ||
      problem.includes("mobile") ||
      problem.includes("screen")
    ) {
      recommendation = "📱 Recommended Service: Phone Repair";
    } 
    else if (
      problem.includes("tv") ||
      problem.includes("television")
    ) {
      recommendation = "📺 Recommended Service: TV Repair";
    } 
    else if (
      problem.includes("computer") ||
      problem.includes("laptop") ||
      problem.includes("pc")
    ) {
      recommendation = "💻 Recommended Service: Computer Services";
    } 
    else if (
      problem.includes("software") ||
      problem.includes("website") ||
      problem.includes("web") ||
      problem.includes("application") ||
      problem.includes("app")
    ) {
      recommendation = "👨‍💻 Recommended Service: Software Engineer";
    } 
    else if (
      problem.includes("ai") ||
      problem.includes("machine learning") ||
      problem.includes("chatbot") ||
      problem.includes("artificial intelligence")
    ) {
      recommendation = "🤖 Recommended Service: AI Engineer";
    } 
    else if (
      problem.includes("cab") ||
      problem.includes("taxi") ||
      problem.includes("ride")
    ) {
      recommendation = "🚕 Recommended Service: Cab Booking";
    } 
    else if (
      problem.includes("rent car") ||
      problem.includes("car rental") ||
      problem.includes("rental")
    ) {
      recommendation = "🚘 Recommended Service: Car Rental Service";
    } 
    else if (
      problem.includes("food") ||
      problem.includes("restaurant") ||
      problem.includes("order food") ||
      problem.includes("meal")
    ) {
      recommendation = "🍔 Recommended Service: Food Ordering";
    } 
    else if (
      problem.includes("speaker") ||
      problem.includes("sound") ||
      problem.includes("audio")
    ) {
      recommendation = "🔊 Recommended Service: Speaker Repair";
    } 
    else if (
      problem.includes("civil") ||
      problem.includes("sivil") ||
      problem.includes("construction") ||
      problem.includes("building")
    ) {
      recommendation = "🏗️ Recommended Service: Sivil Engineer";
    } 
    else {
      recommendation =
        "🔍 Recommended Service: Other..\n\n" +
        "We couldn't identify the exact service. Please describe your problem with a little more detail.";
    }

    setAiResult(recommendation);

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    setAiResult("");
    alert("Something went wrong");
  }
};

  const chatMessages = chatProvider
    ? chats.filter((c) => c.providerId === chatProvider.id)
    : [];

const props = {
  addJob,
  jobs,
  setJobs,
  title,
  setTitle,
  service,
  setService,
  location,
  setLocation,
  desc,
  setDesc,
  budgetMin,
  setBudgetMin,
  budgetMax,
  setBudgetMax,
  jobImage,
  setJobImage,
  postedBy,
  setPostedBy,

  aiInput,
  setAiInput,
  aiResult,
  recommendService,

  search,
  setSearch,
  filterService,
  setFilterService,
  filterLocation,
  setFilterLocation,
  services,
  filteredJobs,
  favorites,
  toggleFavorite,
  setSelectedJob,
  selectedJob,
  addProvider,
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
  toggleProviderStatus,
  applications,
  providerName,
  updateApplication,
  jobApplications,
  applyToJob,
  bookings,
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime,
  proposedPrice,
  setProposedPrice,
  createBooking,
  markComplete,
  rateBooking,
  notifications,
  setNotifications,
  unread,
  chatProvider,
  setChatProvider,
  chatText,
  setChatText,
  chatMessages,
  sendChat,
  tab,
  setTab
};

  return (
    <div>
      <div className="tabs" role="tablist">
        {["jobs", "providers", "applications", "booking", "dashboard", "favorites", "chat", "notifications"].map((t) => (
          <div
            key={t}
            className={`tab ${t === tab ? "active" : ""}`}
            onClick={() => setTab(t)}
            role="tab"
          >
            {t === "favorites" ? "❤️" : t === "chat" ? "💬" : t === "notifications" ? `🔔 ${unread}` : t.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="grid">
        <main>
          {tab === "jobs" && <JobsPage {...props} />}
          {tab === "providers" && <ProvidersPage {...props} />}
          {tab === "applications" && <ApplicationsPage {...props} />}
          {tab === "booking" && <BookingPage {...props} />}
          {tab === "dashboard" && <DashboardPage {...props} />}
          {tab === "favorites" && <FavoritesPage {...props} />}
          {tab === "notifications" && <NotificationsPage {...props} />}
          {tab === "chat" && <ChatPage {...props} />}
        </main>

        <Sidebar
          setTab={setTab}
          favorites={favorites}
          unread={unread}
          jobs={jobs}
          providers={providers}
          applications={applications}
          bookings={bookings}
          setJobs={setJobs}
          setProviders={setProviders}
          setBookings={setBookings}
          setApplications={setApplications}
          setFavorites={setFavorites}
          setNotifications={setNotifications}
          setChats={setChats}
        />
      </div>

      {/* JOB MODAL */}
      {selectedJob && (
        <div className="modal-backdrop" onClick={() => setSelectedJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedJob.title}</h2>
            {selectedJob.image && (
              <img src={selectedJob.image} style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12 }} alt="Job" />
            )}
            <div className="small">🛠 {selectedJob.service} • 📍 {selectedJob.location}</div>
            <p>{selectedJob.description || "No description provided."}</p>
            <div className="small">💰 Budget: {selectedJob.budgetMin || selectedJob.budgetMax ? `₹${selectedJob.budgetMin || 0} - ₹${selectedJob.budgetMax || selectedJob.budgetMin}` : "Not specified"}</div>
            <div className="small">Posted by: {selectedJob.postedBy}</div>

            <h4>Apply with proposed price</h4>
            <input
              type="number"
              placeholder="Your price ₹"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
            />

            <div className="action-row">
              {providers.map((p) => (
                <button
                  className="btn"
                  key={p.id}
                  disabled={p.availability === "Offline"}
                  onClick={() => {
                    applyToJob(selectedJob.id, p.id, proposedPrice);
                    setProposedPrice("");
                  }}
                >
                  Apply as {p.name}
                </button>
              ))}
              <button className="btn ghost" onClick={() => setSelectedJob(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PROVIDER MODAL */}
   {selectedProvider && (
  <div
    className="modal-backdrop"
    onClick={() => setSelectedProvider(null)}
  >
    <div
      className="modal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* PROVIDER NAME */}
      <h2>
        👤 {selectedProvider.name}

        {selectedProvider.verified && (
          <span className="verified">
            ✓ Verified
          </span>
        )}
      </h2>

      {/* PROVIDER INFO */}
      <p className="small">
        ⭐ {selectedProvider.rating || 0} •{" "}
        {selectedProvider.experience ||
          "Experience not specified"}{" "}
        • {selectedProvider.reviews || 0} reviews •{" "}

        <strong>
          {selectedProvider.available
            ? "Available"
            : selectedProvider.availability || "Offline"}
        </strong>
      </p>

      {/* SKILLS */}
      <h4>Skills</h4>

      <p>
        {Array.isArray(selectedProvider.skills)
          ? selectedProvider.skills.map((s) => (
              <span
                className="pill"
                key={s}
                style={{ marginRight: 5 }}
              >
                {s}
              </span>
            ))
          : selectedProvider.skills
          ? selectedProvider.skills
              .split(",")
              .map((s) => (
                <span
                  className="pill"
                  key={s.trim()}
                  style={{ marginRight: 5 }}
                >
                  {s.trim()}
                </span>
              ))
          : "No skills added"}
      </p>

      {/* ABOUT */}
      <h4>About</h4>

      <p>
        {selectedProvider.bio ||
          "Professional local service provider."}
      </p>

      {/* START CHAT */}
      <button
        className="btn"
        onClick={() => {
          setChatProvider(selectedProvider);
          setSelectedProvider(null);
          setTab("chat");
        }}
      >
        💬 Start Chat
      </button>{" "}

      {/* CLOSE */}
      <button
        className="btn ghost"
        onClick={() => setSelectedProvider(null)}
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default RootApp;