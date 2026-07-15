import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./Chatsection.css";
import { useDispatch, useSelector } from "react-redux";
import { useSendMessageMutation } from "../../redux/api/chatApi";
import { getToken } from "../../redux/slices/user.slice";

function Chatsection() {
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const allChats = useSelector((state) => state.chat.chatMessage);
  const chatId = useSelector((state) => state.chat.chatId);
  const user = useSelector((state) => state.user.value);
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesTrackRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const userMsg = {
      role: "human",
      message: text,
      timestamp: new Date().toISOString(),
    };

    let sfile = selectedFile;

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      setIsTyping(true);
      const response = await sendMessage({ chatId, humanMessage: text, sfile }).unwrap();
      if (response?.TOKEN_USED !== undefined) {
        dispatch(getToken(response.TOKEN_USED));
      }
      const aiReply =
        response?.data?.[0]?.messages?.slice(-1)[0]?.message || "No response";
      setMessages((prev) => [
        ...prev,
        { role: "ai", message: aiReply, timestamp: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error?.data);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          message:
            error?.data?.TOKEN_USED > 10000
              ? "Token overused please upgrade your plan"
              : "⚠️ Something went wrong. Please try again.",
          isError: true,
          timestamp: new Date().toISOString(),
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

  const handleCopy = useCallback(async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(index);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  const chatInfo = useMemo(
    () => ({
      title: "SuperAssist",
      icon: "✦",
      color: "#8b5cf6",
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

  const handleClearChat = () => {
    if (window.confirm("Clear all messages in this chat?")) {
      setMessages([]);
    }
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
            style={{ background: `linear-gradient(135deg, ${chatInfo.color}, #6366f1)` }}
          >
            <span>{chatInfo.icon}</span>
            <span className="topbar-presence" />
          </div>
          <div className="topbar-info">
            <h5>{chatInfo.title}</h5>
            <div className="topbar-status">
              <span className="status-light" />
              <span>{isTyping || isLoading ? "Thinking..." : "Online"}</span>
              <span className="status-divider">•</span>
              <span className="status-agent">{chatInfo.agent}</span>
            </div>
          </div>
        </div>

        <div className="topbar-right">
          {searchOpen && (
            <div className="topbar-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search in chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} aria-label="Close search">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          <button
            className="topbar-action"
            title="Search"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search messages"
          >
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

          <button
            className="topbar-action"
            title="Clear chat"
            onClick={handleClearChat}
            aria-label="Clear chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button className="topbar-action" title="More options" aria-label="More options">
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
                  key={`${chatId}-${i}`}
                  message={msg}
                  user={user}
                  chatInfo={chatInfo}
                  showTime={i === messages.length - 1 || messages[i + 1]?.role !== msg.role}
                  time={formatTime(msg.timestamp || new Date())}
                  onCopy={handleCopy}
                  copySuccess={copySuccess}
                  messageIndex={i}
                />
              ))}

              {isTyping && (
                <div className="bubble-row ai">
                  <div
                    className="bubble-avatar"
                    style={{
                      background: `linear-gradient(135deg, ${chatInfo.color}, #6366f1)`,
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept=".pdf,.txt,.doc,.docx"
          />

          {selectedFile ? (
            <div className="file-preview-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="14 2 14 8 20 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="file-name" title={selectedFile.name}>
                {selectedFile.name.length > 15
                  ? selectedFile.name.substring(0, 15) + "..."
                  : selectedFile.name}
              </span>
              <button
                type="button"
                onClick={removeFile}
                className="remove-file-btn"
                aria-label="Remove file"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="composer-icon"
              title="Attach file"
              onClick={() => fileInputRef.current.click()}
              aria-label="Attach file"
            >
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
          )}

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${chatInfo.title}...`}
            className="composer-input"
            rows="1"
            disabled={isLoading}
          />

          <button
            type="button"
            className="composer-icon"
            title="Voice input"
            aria-label="Voice input"
          >
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
            aria-label="Send message"
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
          <span>
            {chatInfo.title} can make mistakes. Verify important info.
          </span>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, user, chatInfo, showTime, time, onCopy, copySuccess, messageIndex }) {
  const isMe = message.role === "human";
  const isError = message.isError;

  const formatMessage = (text) => {
    if (!text) return null;

    return (
      <ReactMarkdown
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="code-block-wrapper">
                <div className="code-block-header">
                  <span className="code-language">{match[1]}</span>
                  <button
                    className={`code-copy-btn ${copySuccess === messageIndex ? "copied" : ""}`}
                    onClick={() => onCopy(String(children).replace(/\n$/, ""), messageIndex)}
                    aria-label="Copy code"
                  >
                    {copySuccess === messageIndex ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    borderRadius: "0 0 8px 8px",
                    fontSize: "13px",
                    margin: 0,
                    background: "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="markdown-p">{children}</p>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
                {children}
              </a>
            );
          },
          ul({ children }) {
            return <ul className="markdown-list">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="markdown-list ordered">{children}</ol>;
          },
          li({ children }) {
            return <li className="markdown-list-item">{children}</li>;
          },
          h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
          h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
          blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
          hr: () => <hr className="markdown-hr" />,
          table: ({ children }) => <div className="markdown-table-wrapper"><table className="markdown-table">{children}</table></div>,
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const handleBubbleCopy = () => {
    onCopy(message.message, messageIndex);
  };

  return (
    <div className={`bubble-row ${isMe ? "me" : "ai"} ${isError ? "error-row" : ""}`}>
      {!isMe && (
        <div
          className="bubble-avatar"
          style={{
            background: `linear-gradient(135deg, ${chatInfo.color}, #6366f1)`,
          }}
        >
          {chatInfo.icon}
        </div>
      )}

      <div className="bubble-stack">
        <div className={`bubble-pill ${isError ? "error" : ""} ${isMe ? "user" : "ai"}`}>
          <div className="bubble-content">{formatMessage(message.message)}</div>
          <button
            className={`bubble-copy-btn ${copySuccess === messageIndex ? "copied" : ""}`}
            onClick={handleBubbleCopy}
            title="Copy message"
            aria-label="Copy message"
          >
            {copySuccess === messageIndex ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline
                  points="20 6 9 17 4 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            )}
          </button>
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
            background: "linear-gradient(135deg, #ec4899, #f43f5e)",
          }}
        >
          {user?.avatar ||
            user?.name?.[0]?.toUpperCase() ||
            user?.username?.[0]?.toUpperCase() ||
            "U"}
        </div>
      )}
    </div>
  );
}

export default Chatsection;