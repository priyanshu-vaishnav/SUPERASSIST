import React, { useState, useRef, useEffect } from "react";
import "./Chatsection.css";
import { useSelector } from "react-redux";
import { useSendMessageMutation } from "../../redux/api/chatApi";


function Chatsection() {
  const [sendMessage, { isError, isLoading, isSuccess }] = useSendMessageMutation()
  const allChats = useSelector((state) => state.chat.chatMessage);
  const chatId = useSelector((state) => state.chat.chatId);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {

   function fetchMessage(){
    if (chatId) {
      const c = allChats.filter((chat) => chat.id === chatId);
      setMessages(c[0]?.messages || []);

    } else {
      setMessages([]);
    }

  }
  fetchMessage();

  }, [chatId, allChats, setMessages]);

  const user = null;
  const chatInfo = {
    title: "New Chat",
    icon: "🤖",
    color: "#6366f1",
    agent: "AI Assistant",
  };
  const suggestions = [
    { icon: "", text: "Explain Redis" },
    { icon: "", text: "Help me create API" },
    { icon: "", text: "Make a roadmap for full stack" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 100) + "px";
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

    console.log("Sending:", { chatId, humanMessage: text });

    try {

      const response = await sendMessage({ chatId, humanMessage: text }).unwrap();

      console.log("Backend Response:", response);

      const aiReply = response.data?.[0]?.messages?.slice(-1)[0]?.message || "No response";

      // 


      setMessages((prev) => [...prev, { role: "ai", message: aiReply }]);

    } catch (error) {
      console.error("Failed to send message:", error);

    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-shell">
      {/* Header */}
      <header className="chat-topbar">
        <div className="topbar-left">
          <div className="topbar-avatar" style={{ background: chatInfo.color }}>
            {chatInfo.icon}
            <span className="topbar-presence"></span>
          </div>
          <div className="topbar-info">
            <h5>{chatInfo.title}</h5>
            <div className="topbar-status">
              <span className="status-light"></span>
              <span>{isTyping ? "Typing..." : "Online"}</span>
              {chatInfo.agent && (
                <>
                  <span className="status-divider">·</span>
                  <span className="status-agent">{chatInfo.agent}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <button className="topbar-action">📞</button>
          <button className="topbar-action">📹</button>
          <button className="topbar-action">🔍</button>
          <button className="topbar-action">⋯</button>
        </div>
      </header>

      {/* Messages */}
      <main className="messages-pane">
        <div className="messages-track">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-symbol">{chatInfo.icon}</div>
              <h3>Start a conversation</h3>
              <p>Ask me anything, I'm here to help</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} user={user} />
              ))}

              {isTyping && (
                <div className="bubble-row ai">
                  <div className="bubble-avatar" style={{ background: chatInfo.color }}>
                    {chatInfo.icon}
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Suggestions */}
      {suggestions.length > 0 && messages.length === 0 && (
        <div className="suggestions-row">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-pill"
              onClick={() => setInputText(s.text)}
            >
              <span>{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="composer">
        <div className="composer-inner">
          <button type="button" className="composer-icon">📎</button>
          <button type="button" className="composer-icon">😊</button>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="composer-input"
            rows="1"
          />

          <button type="button" className="composer-icon">🎤</button>
          <button
            type="submit"
            className={`composer-send ${inputText.trim() ? "active" : ""}`}
            disabled={!inputText.trim()}
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, user }) {


  const isMe = message.role === "human";

  return (
    <div className={`bubble-row ${isMe ? "me" : "ai"}`}>
      {!isMe && (
        <div className="bubble-avatar" style={{ background: "#6366f1" }}>
          🤖
        </div>
      )}

      <div className="bubble-stack">
        <div className="bubble-pill">
          <p>{message.message}</p>
        </div>
      </div>

      {isMe && (
        <div
          className="bubble-avatar"
          style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
        >
          {user?.avatar || user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      )}
    </div>
  );
}

export default Chatsection;