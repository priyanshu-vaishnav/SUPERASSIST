import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import "./Chatsection.css";
import { useSelector } from "react-redux";
import { useSendMessageMutation } from "../../redux/api/chatApi";

function Chatsection() {
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const allChats = useSelector((state) => state.chat.chatMessage);
  const chatId = useSelector((state) => state.chat.chatId);
  const user = useSelector((state) => state.user.value);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesTrackRef = useRef(null);

  // Sync messages when chat changes
  useEffect(() => {
    if (chatId) {
      const c = allChats?.filter((chat) => chat.id === chatId);
      setMessages(c?.[0]?.messages || []);
    } else {
      setMessages([]);
    }
  }, [chatId, allChats]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const userMsg = {
      role: "human",
      message: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      setIsTyping(true);
      const response = await sendMessage({ chatId, humanMessage: text }).unwrap();
      const aiReply =
        response?.data?.[0]?.messages?.slice(-1)[0]?.message || "No response";
      setMessages((prev) => [...prev, { role: "ai", message: aiReply }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          message: "⚠️ Something went wrong. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const chatInfo = useMemo(
    () => ({
      title: "NexusAI Assistant",
      icon: "✦",
      color: "#6366f1",
      agent: "AI Assistant",
    }),
    []
  );

  const suggestions = [
    { icon: "💡", text: "Explain Redis in simple terms" },
    { icon: "⚡", text: "Help me build a REST API" },
    { icon: "🗺️", text: "Create a full-stack roadmap" },
    { icon: "🎨", text: "Design a modern UI system" },
  ];

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-shell">
      {/* Animated background */}
      <div className="chat-bg-gradient">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>

      {/* Header */}
      <header className="chat-topbar">
        <div className="topbar-left">
          <div
            className="topbar-avatar"
            style={{ background: `linear-gradient(135deg, ${chatInfo.color}, #8b5cf6)` }}
          >
            <span>{chatInfo.icon}</span>
            <span className="topbar-presence" />
          </div>
          <div className="topbar-info">
            <h5>{chatInfo.title}</h5>
            <div className="topbar-status">
              <span className="status-light" />
              <span>{isLoading ? "Thinking..." : "Online"}</span>
              <span className="status-divider">•</span>
              <span className="status-agent">{chatInfo.agent}</span>
            </div>
          </div>
        </div>

        <div className="topbar-right">
         
          
          <button className="topbar-action" title="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button className="topbar-action" title="More options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="messages-pane">
        <div className="messages-track" ref={messagesTrackRef}>
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-symbol">
                <div className="welcome-glow" />
                <span>{chatInfo.icon}</span>
              </div>
              <h3>How can I help you today?</h3>
              <p>Ask me anything — from coding to creative writing</p>

              <div className="welcome-grid">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="welcome-card"
                    onClick={() => {
                      setInputText(s.text);
                      textareaRef.current?.focus();
                    }}
                  >
                    <span className="welcome-card-icon">{s.icon}</span>
                    <span className="welcome-card-text">{s.text}</span>
                    <span className="welcome-card-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="messages-divider">
                <span>Today</span>
              </div>

              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  message={msg}
                  user={user}
                  chatInfo={chatInfo}
                  showTime={i === messages.length - 1 || messages[i + 1]?.role !== msg.role}
                  time={formatTime(msg.timestamp || new Date())}
                />
              ))}

              {isTyping && (
                <div className="bubble-row ai">
                  <div
                    className="bubble-avatar"
                    style={{
                      background: `linear-gradient(135deg, ${chatInfo.color}, #8b5cf6)`,
                    }}
                  >
                    {chatInfo.icon}
                  </div>
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Input */}
      <form onSubmit={handleSubmit} className="composer">
        <div className="composer-inner">
          <button type="button" className="composer-icon" title="Attach file">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message NexusAI..."
            className="composer-input"
            rows="1"
          />

          <button type="button" className="composer-icon" title="Voice input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="submit"
            className={`composer-send ${inputText.trim() ? "active" : ""}`}
            disabled={!inputText.trim() || isLoading}
            title="Send message"
          >
            {isLoading ? (
              <span className="send-spinner" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="composer-footer">
          <span>NexusAI can make mistakes. Verify important info.</span>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, user, chatInfo, showTime, time }) {
  const isMe = message.role === "human";
  const isError = message.isError;

  const formatMessage = (text) => {
    // Basic markdown-like rendering
    if (!text) return null;
    return text.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`bubble-row ${isMe ? "me" : "ai"}`}>
      {!isMe && (
        <div
          className="bubble-avatar"
          style={{
            background: `linear-gradient(135deg, ${chatInfo.color}, #8b5cf6)`,
          }}
        >
          {chatInfo.icon}
        </div>
      )}

      <div className="bubble-stack">
        <div className={`bubble-pill ${isError ? "error" : ""} ${isMe ? "user" : "ai"}`}>
          <p>{formatMessage(message.message)}</p>
        </div>
        {showTime && (
          <span className="bubble-time">
            {isMe ? "You" : chatInfo.agent} · {time}
          </span>
        )}
      </div>

      {isMe && (
        <div
          className="bubble-avatar"
          style={{
            background:
              "linear-gradient(135deg, #ec4899, #f43f5e)",
          }}
        >
          {user?.avatar || user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
        </div>
      )}
    </div>
  );
}

export default Chatsection;