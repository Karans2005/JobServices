import React, { useEffect, useState } from "react";

export default function ChatPage(props) {
  const {
    providers = [],
    chatProvider,
    setChatProvider,
  } = props;

  // ======================================================
  // LOCAL CHAT STATE
  // ======================================================

  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // ======================================================
  // GET LOGGED-IN USER ID FROM JWT
  // ======================================================

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ No JWT token found");
        return null;
      }

      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return payload.userId || null;
    } catch (error) {
      console.error(
        "❌ Failed to decode JWT:",
        error
      );

      return null;
    }
  };

  // ======================================================
  // GET PROVIDER USER ID
  // ======================================================

  const getProviderUserId = (provider) => {
    if (!provider) return null;

    // Provider object backend se aa raha ho
    if (
      provider.userId &&
      typeof provider.userId === "object"
    ) {
      return provider.userId._id;
    }

    return (
      provider.userId ||
      provider.user?._id ||
      provider._id ||
      provider.id ||
      null
    );
  };

  // ======================================================
  // FETCH CONVERSATION
  // ======================================================

  const fetchConversation = async () => {
    if (!chatProvider) {
      setChatMessages([]);
      return;
    }

    const currentUserId = getUserIdFromToken();
    const providerUserId =
      getProviderUserId(chatProvider);

    console.log(
      "👤 Current User ID:",
      currentUserId
    );

    console.log(
      "👨‍🔧 Provider User ID:",
      providerUserId
    );

    if (!currentUserId || !providerUserId) {
      console.error(
        "❌ User ID or Provider User ID missing"
      );

      return;
    }

    try {
      setLoadingMessages(true);

      const response = await fetch(
        `https://job-backend-2bfw.onrender.com/messages/conversation/${currentUserId}/${providerUserId}`
      );

      const data = await response.json();

      console.log(
        "📡 Conversation status:",
        response.status
      );

      console.log(
        "📦 Conversation response:",
        data
      );

      if (
        response.ok &&
        data.status === 1
      ) {
        const formattedMessages =
          (data.messages || []).map((m) => ({
            id: m._id,

            text: m.message,

            sender:
              String(
                m.senderId?._id ||
                  m.senderId
              ) ===
              String(currentUserId)
                ? "me"
                : "other",

            time: m.createdAt,

            read: m.read,

            senderId:
              m.senderId?._id ||
              m.senderId,

            receiverId:
              m.receiverId?._id ||
              m.receiverId,
          }));

        setChatMessages(
          formattedMessages
        );
      } else {
        console.error(
          "❌ Failed to fetch conversation:",
          data
        );

        setChatMessages([]);
      }
    } catch (error) {
      console.error(
        "❌ Conversation fetch error:",
        error
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  // ======================================================
  // FETCH WHEN PROVIDER CHANGES
  // ======================================================

  useEffect(() => {
    fetchConversation();
  }, [chatProvider]);

  // ======================================================
  // SEND MESSAGE
  // ======================================================

  const sendChat = async () => {
    const text = chatText.trim();

    if (!text) {
      return;
    }

    if (!chatProvider) {
      alert("Please select a provider first");
      return;
    }

    const providerUserId =
      getProviderUserId(chatProvider);

    if (!providerUserId) {
      console.error(
        "❌ Provider userId missing:",
        chatProvider
      );

      alert("Provider user ID missing");
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      setSending(true);

      console.log(
        "📤 Sending message to:",
        providerUserId
      );

      const response = await fetch(
        "https://job-backend-2bfw.onrender.com/messages",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            receiverId: providerUserId,
            message: text,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "📡 Send message status:",
        response.status
      );

      console.log(
        "📦 Send message response:",
        data
      );

      if (
        response.ok &&
        data.status === 1
      ) {
        const currentUserId =
          getUserIdFromToken();

        const newMessage =
          data.message;

        // ----------------------------------------------
        // ADD NEW MESSAGE TO CHAT
        // ----------------------------------------------

        setChatMessages((prev) => [
          ...prev,
          {
            id: newMessage._id,

            text: newMessage.message,

            sender: "me",

            time:
              newMessage.createdAt ||
              new Date().toISOString(),

            read: newMessage.read,

            senderId:
              newMessage.senderId,

            receiverId:
              newMessage.receiverId,
          },
        ]);

        // Clear input
        setChatText("");
      } else {
        console.error(
          "❌ Message send failed:",
          data
        );

        alert(
          data.msg ||
            data.message ||
            "Failed to send message"
        );
      }
    } catch (error) {
      console.error(
        "❌ Send message error:",
        error
      );

      alert(
        "Server connection error"
      );
    } finally {
      setSending(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="card">

      <h3>💬 Provider Chat</h3>

      {/* ================================================
          PROVIDER LIST
      ================================================ */}

      <div className="toolbar">

        {providers.length === 0 ? (
          <div className="small">
            No providers available.
          </div>
        ) : (
          providers.map((p, index) => {

            const providerId =
              p._id ||
              p.id ||
              p.userId ||
              index;

            return (
              <button
                key={providerId}
                className="btn"
                onClick={() =>
                  setChatProvider(p)
                }
              >
                {p.name ||
                  p.firstName ||
                  "Provider"}
              </button>
            );
          })
        )}

      </div>

      {/* ================================================
          NO PROVIDER SELECTED
      ================================================ */}

      {!chatProvider ? (
        <div className="small">
          Select a provider to start chatting.
        </div>
      ) : (
        <>
          {/* ============================================
              CHAT HEADER
          ============================================ */}

          <h4>
            Chat with{" "}
            {chatProvider.name ||
              chatProvider.firstName ||
              "Provider"}
          </h4>

          {/* ============================================
              CHAT BOX
          ============================================ */}

          <div className="chat-box">

            {loadingMessages && (
              <div className="small">
                Loading messages...
              </div>
            )}

            {!loadingMessages &&
              chatMessages.length === 0 && (
                <div className="small">
                  Start the conversation...
                </div>
              )}

            {chatMessages.map((m) => (
              <div
                className={`chat-msg ${
                  m.sender === "me"
                    ? "me"
                    : ""
                }`}
                key={m.id}
              >

                <div>
                  {m.text}
                </div>

                <div className="small">
                  {m.time
                    ? new Date(
                        m.time
                      ).toLocaleTimeString()
                    : ""}
                </div>

              </div>
            ))}

          </div>

          {/* ============================================
              MESSAGE INPUT
          ============================================ */}

          <div className="action-row">

            <input
              value={chatText}
              onChange={(e) =>
                setChatText(
                  e.target.value
                )
              }
              placeholder="Type a message..."
              disabled={sending}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendChat();
                }
              }}
            />

            <button
              className="btn"
              onClick={sendChat}
              disabled={
                sending ||
                !chatText.trim()
              }
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>

          </div>
        </>
      )}
    </div>
  );
}