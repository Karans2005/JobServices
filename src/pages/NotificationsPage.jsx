// 

import React, { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // ======================================================
  // GET NOTIFICATIONS
  // ======================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      console.log(
        "🔑 Notification Token:",
        token ? "Token exists" : "No token"
      );

      const response = await fetch(
        "http://localhost:3500/notifications",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json();

      console.log(
        "📡 Notifications status:",
        response.status
      );

      console.log(
        "📦 Notifications response:",
        data
      );

      if (response.ok && data.status === 1) {
        console.log(
          "✅ Notifications fetched successfully"
        );

        setNotifications(
          data.notifications || []
        );
      } else {
        console.error(
          "❌ Failed to fetch notifications:",
          data
        );
      }
    } catch (error) {
      console.error(
        "❌ Notifications fetch error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH ON PAGE LOAD
  // ======================================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ======================================================
  // MARK NOTIFICATION AS READ
  // ======================================================

  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      console.error(
        "❌ Notification ID missing"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3500/notifications/${notificationId}/read`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json();

      console.log(
        "📡 Mark notification status:",
        response.status
      );

      console.log(
        "📦 Mark notification response:",
        data
      );

      if (response.ok && data.status === 1) {
        setNotifications((prev) =>
          prev.map((notification) =>
            String(notification._id) ===
            String(notificationId)
              ? {
                  ...notification,
                  read: true,
                }
              : notification
          )
        );
      } else {
        console.error(
          "❌ Failed to mark notification:",
          data
        );
      }
    } catch (error) {
      console.error(
        "❌ Mark notification error:",
        error
      );
    }
  };

  // ======================================================
  // DELETE NOTIFICATION
  // ======================================================

  const deleteNotification = async (
    notificationId
  ) => {
    if (!notificationId) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3500/notifications/${notificationId}`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json();

      console.log(
        "📡 Delete notification status:",
        response.status
      );

      if (response.ok && data.status === 1) {
        setNotifications((prev) =>
          prev.filter(
            (notification) =>
              String(notification._id) !==
              String(notificationId)
          )
        );
      } else {
        console.error(
          "❌ Delete notification failed:",
          data
        );
      }
    } catch (error) {
      console.error(
        "❌ Delete notification error:",
        error
      );
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="card">
        <h3>🔔 Notifications</h3>

        <div className="small">
          Loading notifications...
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="card">
      <h3>🔔 Notifications</h3>

      {notifications.length === 0 && (
        <div className="small">
          No notifications.
        </div>
      )}

      {notifications.map((n) => (
        <div
          className="notice"
          key={n._id}
          onClick={() =>
            !n.read &&
            markAsRead(n._id)
          }
          style={{
            cursor: n.read
              ? "default"
              : "pointer",
          }}
        >
          {!n.read ? "🟡" : "⚪"}{" "}
          {n.title && (
            <strong>
              {n.title}
            </strong>
          )}

          <div>
            {n.message}
          </div>

          <div className="small">
            {n.createdAt
              ? new Date(
                  n.createdAt
                ).toLocaleString()
              : ""}
          </div>
        </div>
      ))}

      {/* ================================================
          CLEAR ALL
      ================================================ */}

      {notifications.length > 0 && (
        <button
          className="btn ghost"
          onClick={async () => {
            const allIds =
              notifications.map(
                (n) => n._id
              );

            for (const id of allIds) {
              await deleteNotification(id);
            }
          }}
        >
          Clear Notifications
        </button>
      )}
    </div>
  );
}