// import React, { useEffect, useState } from "react";

// const API_URL = "http://localhost:3500";

// export default function ApplicationsPage(props) {
//   const {
//     applications: propApplications = [],
//     providerName,
//     jobs = [],
//   } = props;

//   // Local State
//   const [applications, setApplications] = useState(
//     Array.isArray(propApplications) ? propApplications : []
//   );
//   const [loading, setLoading] = useState(false);
//   const [updatingId, setUpdatingId] = useState(null);

//   // Merge Applications Logic
//   const mergeApplications = (
//     backendApplications = [],
//     existingApplications = []
//   ) => {
//     const result = [];
//     const allApplications = [...backendApplications, ...existingApplications];

//     allApplications.forEach((app) => {
//       const id = app._id || app.id || app.appId;

//       if (!id) {
//         result.push(app);
//         return;
//       }

//       const alreadyExists = result.some((item) => {
//         const itemId = item._id || item.id || item.appId;
//         return String(itemId) === String(id);
//       });

//       if (!alreadyExists) {
//         result.push(app);
//       }
//     });

//     return result;
//   };

//   // Sync Props Applications
//   useEffect(() => {
//     if (Array.isArray(propApplications)) {
//       setApplications((prev) => mergeApplications(propApplications, prev));
//     }
//   }, [propApplications]);

//   // Fetch Applications from API
//   const fetchApplications = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");

//       const response = await fetch(`${API_URL}/applications`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//       });

//       const data = await response.json();

//       if (response.ok && data.status === 1) {
//         const backendApplications = Array.isArray(data.applications)
//           ? data.applications
//           : [];
//         setApplications((prev) =>
//           mergeApplications(backendApplications, prev)
//         );
//       } else {
//         console.error("Failed to fetch applications:", data.msg);
//       }
//     } catch (error) {
//       console.error("Applications fetch error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApplications();
//   }, []);

//   // Update Application Status (Accept / Reject)
//   const updateApplication = async (applicationId, status) => {
//     if (!applicationId) {
//       alert("Application ID missing");
//       return;
//     }

//     try {
//       setUpdatingId(applicationId);
//       const token = localStorage.getItem("token");

//       const response = await fetch(
//         `${API_URL}/applications/${applicationId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//           body: JSON.stringify({ status }),
//         }
//       );

//       const data = await response.json();

//       if (response.ok && data.status === 1) {
//         setApplications((prev) =>
//           prev.map((app) => {
//             const currentId = app._id || app.id || app.appId;

//             if (String(currentId) === String(applicationId)) {
//               return {
//                 ...app,
//                 status: data.application?.status || status,
//               };
//             }
//             return app;
//           })
//         );
//         alert(`Application ${status} successfully`);
//       } else {
//         alert(data.msg || data.message || "Failed to update application");
//       }
//     } catch (error) {
//       console.error("Update application error:", error);
//       alert("Server connection error");
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="card">
//         <h3>Application Management</h3>
//         <div className="small">Loading applications...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="card">
//       <h3>Application Management</h3>

//       {applications.length === 0 ? (
//         <div className="small">No applications yet.</div>
//       ) : (
//         applications.map((a, index) => {
//           const applicationId = a._id || a.id || a.appId;

//           // Job Data Resolution
//           const backendJob =
//             typeof a.jobId === "object" && a.jobId !== null ? a.jobId : null;
//           const job =
//             backendJob ||
//             jobs.find((j) => {
//               const jobId =
//                 typeof a.jobId === "object" ? a.jobId?._id : a.jobId;
//               return String(j._id || j.id) === String(jobId);
//             });

//           // Provider Data Resolution
//           const backendProvider =
//             typeof a.providerId === "object" && a.providerId !== null
//               ? a.providerId
//               : null;

//           let provider = "Unknown provider";
//           if (backendProvider) {
//             provider =
//               backendProvider.name ||
//               backendProvider.firstName ||
//               "Unknown provider";
//           } else if (providerName) {
//             provider = providerName(a.providerId) || "Unknown provider";
//           }

//           const currentStatus = String(a.status || "pending")
//             .trim()
//             .toLowerCase();

//           const uniqueKey = applicationId || `application-${index}`;

//           return (
//             <div className="list-item" key={uniqueKey}>
//               <div>
//                 <strong>{job?.title || "Job removed"}</strong>
//                 <div className="small">
//                   Provider: {provider} • Proposed:{" "}
//                   {a.proposedPrice !== undefined &&
//                   a.proposedPrice !== null &&
//                   a.proposedPrice !== ""
//                     ? `₹${a.proposedPrice}`
//                     : "Not specified"}
//                 </div>

//                 {a.message && (
//                   <div className="small">Message: {a.message}</div>
//                 )}

//                 <span className={`badge ${currentStatus}`}>
//                   {currentStatus.toUpperCase()}
//                 </span>
//               </div>

//               <div className="action-row">
//                 {currentStatus === "pending" ? (
//                   <>
//                     <button
//                       className="btn"
//                       disabled={
//                         !applicationId || updatingId === applicationId
//                       }
//                       onClick={() =>
//                         updateApplication(applicationId, "accepted")
//                       }
//                     >
//                       {updatingId === applicationId
//                         ? "Updating..."
//                         : "Accept"}
//                     </button>

//                     <button
//                       className="btn ghost"
//                       disabled={
//                         !applicationId || updatingId === applicationId
//                       }
//                       onClick={() =>
//                         updateApplication(applicationId, "rejected")
//                       }
//                     >
//                       {updatingId === applicationId
//                         ? "Updating..."
//                         : "Reject"}
//                     </button>
//                   </>
//                 ) : (
//                   <span className="small" style={{ fontWeight: "bold" }}>
//                     Status: {currentStatus.toUpperCase()}
//                   </span>
//                 )}
//               </div>
//             </div>
//           );
//         })
//       )}
//     </div>
//   );
// }




import React, { useEffect, useState } from "react";

const API_URL = "https://job-backend-2bfw.onrender.com";

export default function ApplicationsPage(props) {
  const {
    applications: propApplications = [],
    providerName,
    jobs = [],
  } = props;

  // Local State
  const [applications, setApplications] = useState(
    Array.isArray(propApplications) ? propApplications : []
  );
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Merge Applications Logic
  const mergeApplications = (
    backendApplications = [],
    existingApplications = []
  ) => {
    const result = [];
    const allApplications = [...backendApplications, ...existingApplications];

    allApplications.forEach((app) => {
      const id = app._id || app.id || app.appId;

      if (!id) {
        result.push(app);
        return;
      }

      const alreadyExists = result.some((item) => {
        const itemId = item._id || item.id || item.appId;
        return String(itemId) === String(id);
      });

      if (!alreadyExists) {
        result.push(app);
      }
    });

    return result;
  };

  // Sync Props Applications
  useEffect(() => {
    if (Array.isArray(propApplications)) {
      setApplications((prev) => mergeApplications(propApplications, prev));
    }
  }, [propApplications]);

  // Fetch Applications from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/applications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 1) {
        const backendApplications = Array.isArray(data.applications)
          ? data.applications
          : [];
        setApplications((prev) =>
          mergeApplications(backendApplications, prev)
        );
      } else {
        console.error("Failed to fetch applications:", data.msg);
      }
    } catch (error) {
      console.error("Applications fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update Application Status (Accept / Reject)
const updateApplication = async (applicationId, status) => {
  if (!applicationId || !/^[0-9a-fA-F]{24}$/.test(String(applicationId))) {
    alert("Invalid MongoDB Application ID");
    return;
  }

  try {
    setUpdatingId(applicationId);

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/applications/${applicationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    console.log("UPDATE APPLICATION RESPONSE:", data);

    if (response.ok && data.status === 1) {
      setApplications((prev) =>
        prev.map((app) => {
          if (String(app._id) === String(applicationId)) {
            return {
              ...app,
              status: data.application?.status || status,
            };
          }

          return app;
        })
      );

      alert(`Application ${status} successfully`);
    } else {
      alert(
        data.msg ||
        data.message ||
        "Failed to update application"
      );
    }
  } catch (error) {
    console.error("Update application error:", error);
    alert("Server connection error");
  } finally {
    setUpdatingId(null);
  }
};

  if (loading) {
    return (
      <div className="card">
        <h3>Application Management</h3>
        <div className="small">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Application Management</h3>

      {applications.length === 0 ? (
        <div className="small">No applications yet.</div>
      ) : (
        applications.map((a, index) => {
          const applicationId = a._id;

          // Job Data Resolution
          const backendJob =
            typeof a.jobId === "object" && a.jobId !== null ? a.jobId : null;
          const job =
            backendJob ||
            jobs.find((j) => {
              const jobId =
                typeof a.jobId === "object" ? a.jobId?._id : a.jobId;
              return String(j._id || j.id) === String(jobId);
            });

          // Provider Data Resolution
          const backendProvider =
            typeof a.providerId === "object" && a.providerId !== null
              ? a.providerId
              : null;

          let provider = "Unknown provider";
          if (backendProvider) {
            provider =
              backendProvider.name ||
              backendProvider.firstName ||
              "Unknown provider";
          } else if (providerName) {
            provider = providerName(a.providerId) || "Unknown provider";
          }

          const currentStatus = String(a.status || "pending")
            .trim()
            .toLowerCase();

          const uniqueKey = applicationId || `application-${index}`;

          return (
            <div className="list-item" key={uniqueKey}>
              <div>
                <strong>{job?.title || "Job removed"}</strong>
                <div className="small">
                  Provider: {provider} • Proposed:{" "}
                  {a.proposedPrice !== undefined &&
                  a.proposedPrice !== null &&
                  a.proposedPrice !== ""
                    ? `₹${a.proposedPrice}`
                    : "Not specified"}
                </div>

                {a.message && (
                  <div className="small">Message: {a.message}</div>
                )}

                <span className={`badge ${currentStatus}`}>
                  {currentStatus.toUpperCase()}
                </span>
              </div>

              <div className="action-row">
                {currentStatus === "pending" ? (
                  <>
                    <button
                      className="btn"
                      disabled={
                        !applicationId || updatingId === applicationId
                      }
                      onClick={() =>
                        updateApplication(applicationId, "accepted")
                      }
                    >
                      {updatingId === applicationId
                        ? "Updating..."
                        : "Accept"}
                    </button>

                    <button
                      className="btn ghost"
                      disabled={
                        !applicationId || updatingId === applicationId
                      }
                      onClick={() =>
                        updateApplication(applicationId, "rejected")
                      }
                    >
                      {updatingId === applicationId
                        ? "Updating..."
                        : "Reject"}
                    </button>
                  </>
                ) : (
                  <span className="small" style={{ fontWeight: "bold" }}>
                    Status: {currentStatus.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}




