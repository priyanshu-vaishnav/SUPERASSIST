import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import "./Chatsection.css";
import { useDispatch, useSelector } from "react-redux";
import { useSendMessageMutation } from "../../redux/api/chatApi";
import { getToken } from "../../redux/slices/user.slice";
import { setAgent, setChatId } from "../../redux/slices/chat.slice";

/* =====================================================
   UTILITY: Robust response parser — handles 20+ API shapes
   ===================================================== */
const extractAIResponse = (response) => {
  if (!response) {
    return { text: "No response", type: "empty", meta: {} };
  }

  const meta = {
    agentUsed: response.agentUsed || response.data?.agentUsed || null,
    tokenUsed: response.TOKEN_USED ?? response.data?.TOKEN_USED ?? null,
    modelUsed:
      response.modelUsed || response.data?.modelUsed || response.model || null,
    sources: response.sources || response.data?.sources || null,
  };

  // 1. OpenAI-style: { choices: [{ message: { content } }] }
  if (response.choices?.[0]?.message?.content) {
    return { text: response.choices[0].message.content, type: "openai", meta };
  }

  // 2. Anthropic-style: { content: [{ text }] }
  if (Array.isArray(response.content) && response.content[0]?.text) {
    return { text: response.content[0].text, type: "anthropic", meta };
  }

  // 3. Gemini-style: { candidates: [{ content: { parts: [{ text }] } }] }
  if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
    return {
      text: response.candidates[0].content.parts[0].text,
      type: "gemini",
      meta,
    };
  }

  // 4. LangChain-style: { data: { output } }
  if (response.data?.output) {
    return { text: response.data.output, type: "langchain", meta };
  }

  // 5. Custom nested: { data: [{ messages: [{ message }] }] }
  if (response.data?.[0]?.messages?.length) {
    const msgs = response.data[0].messages;
    const lastAi = [...msgs].reverse().find((m) => m.role !== "human");
    if (lastAi?.message) {
      return { text: lastAi.message, type: "nested-array", meta };
    }
    if (msgs[msgs.length - 1]?.message) {
      return { text: msgs[msgs.length - 1].message, type: "nested-array", meta };
    }
  }

  // 6. { data: { messages: [{ message }] } }
  if (response.data?.messages?.length) {
    const msgs = response.data.messages;
    const lastAi = [...msgs].reverse().find((m) => m.role !== "human");
    if (lastAi?.message) {
      return { text: lastAi.message, type: "nested-messages", meta };
    }
    if (msgs[msgs.length - 1]?.message) {
      return { text: msgs[msgs.length - 1].message, type: "nested-messages", meta };
    }
  }

  // 7. Direct data fields
  if (typeof response.data === "string" && response.data.trim()) {
    return { text: response.data, type: "string-data", meta };
  }
  if (response.data?.message) return { text: response.data.message, type: "data.message", meta };
  if (response.data?.reply) return { text: response.data.reply, type: "data.reply", meta };
  if (response.data?.response) return { text: response.data.response, type: "data.response", meta };
  if (response.data?.content) return { text: response.data.content, type: "data.content", meta };
  if (response.data?.text) return { text: response.data.text, type: "data.text", meta };
  if (response.data?.answer) return { text: response.data.answer, type: "data.answer", meta };
  if (response.data?.result) return { text: response.data.result, type: "data.result", meta };
  if (response.data?.ai_message) return { text: response.data.ai_message, type: "data.ai_message", meta };
  if (response.data?.bot_message) return { text: response.data.bot_message, type: "data.bot_message", meta };
  if (response.data?.assistant_message) return { text: response.data.assistant_message, type: "data.assistant_message", meta };

  // 8. Top-level fields
  if (typeof response === "string" && response.trim()) {
    return { text: response, type: "string", meta };
  }
  if (response.message) return { text: response.message, type: "top.message", meta };
  if (response.reply) return { text: response.reply, type: "top.reply", meta };
  if (response.response) return { text: response.response, type: "top.response", meta };
  if (response.content) return { text: response.content, type: "top.content", meta };
  if (response.text) return { text: response.text, type: "top.text", meta };
  if (response.answer) return { text: response.answer, type: "top.answer", meta };
  if (response.result) return { text: response.result, type: "top.result", meta };

  // 9. Fallback — serialize
  try {
    const stringified = JSON.stringify(response, null, 2);
    if (stringified && stringified !== "{}") {
      return { text: "```json\n" + stringified + "\n```", type: "json-fallback", meta };
    }
  } catch (e) {
    /* ignore */
  }

  return { text: "No response", type: "unknown", meta };
};

/* =====================================================
   UTILITY: Typewriter effect hook
   ===================================================== */
const useTypewriter = (text, speed = 8, enabled = true) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayed(text || "");
      setDone(true);
      return;
    }

    idxRef.current = 0;
    setDisplayed("");
    setDone(false);

    const step = () => {
      idxRef.current += 1;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) {
        setDone(true);
        return;
      }
      timerRef.current = setTimeout(step, speed);
    };

    timerRef.current = setTimeout(step, speed);
    return () => clearTimeout(timerRef.current);
  }, [text, speed, enabled]);

  return { displayed, done };
};

/* =====================================================
   COMPONENT: Chatsection
   ===================================================== */
function Chatsection() {
  /* ---------- Redux ---------- */
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const allChats = useSelector((state) => state.chat.chatMessage);
  const chatId = useSelector((state) => state.chat.chatId);
  const user = useSelector((state) => state.user.value);
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();

  /* ---------- Local state ---------- */
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingChat, setPendingChat] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [editingMsgIndex, setEditingMsgIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [agentUsed, setAgentUsed] = useState(null);
  const [tokenUsed, setTokenUsed] = useState(null);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [messageReactions, setMessageReactions] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  /* ---------- Refs ---------- */
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesTrackRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const editTextareaRef = useRef(null);

  /* ---------- Persist chatId in localStorage ---------- */
  useEffect(() => {
    let savedChat = localStorage.getItem("chatId");
    if (savedChat && !chatId) {
      dispatch(setChatId(savedChat));
    }
    if (chatId) {
      localStorage.setItem("chatId", chatId);
    }
  }, [chatId, dispatch]);

  /* ---------- Sync messages when chatId changes ---------- */
  useEffect(() => {
    if (chatId) {
      const c = allChats?.filter((chat) => chat.id === chatId);
      setMessages(c?.[0]?.messages || []);
    } else {
      setMessages([]);
    }
  }, [chatId, allChats]);

  /* ---------- Online/offline listener ---------- */
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /* ---------- Auto-scroll logic with show-on-scroll-up ---------- */
  useEffect(() => {
    const track = messagesTrackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = track;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollBtn(distanceFromBottom > 200);
    };

    track.addEventListener("scroll", handleScroll);
    return () => track.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* ---------- File validation ---------- */
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large (max 10MB). Got ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError(`Unsupported file type: ${file.type || "unknown"}`);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  };

  const removeFile = (e) => {
    e?.stopPropagation();
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------- Input handling ---------- */
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
    }
  };

  /* ---------- Send / retry ---------- */
  const sendMessageHandler = useCallback(
    async (overrideText = null, isRetry = false) => {
      const text = (overrideText ?? inputText).trim();
      if (!text || !networkStatus) return;

      const userMsg = {
        role: "human",
        message: text,
        timestamp: new Date().toISOString(),
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      const sfile = isRetry ? lastFailedMessage?.file : selectedFile;

      setMessages((prev) => (isRetry ? prev : [...prev, userMsg]));
      if (!isRetry) {
        setInputText("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }

      try {
        setIsTyping(true);
        setPendingChat(chatId);

        const response = await sendMessage({
          chatId,
          humanMessage: text,
          sfile,
        }).unwrap();

        if (response?.TOKEN_USED !== undefined) {
          dispatch(getToken(response.TOKEN_USED));
          setTokenUsed(response.TOKEN_USED);
        }
        if (response?.agentUsed) {
          dispatch(setAgent(response.agentUsed));
          setAgentUsed(response.agentUsed);
        }

        const { text: aiReply, type: responseType, meta } = extractAIResponse(response);

        if (meta.tokenUsed !== null) setTokenUsed(meta.tokenUsed);
        if (meta.agentUsed) setAgentUsed(meta.agentUsed);

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            message: aiReply,
            timestamp: new Date().toISOString(),
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            responseType,
            agent: meta.agentUsed,
            model: meta.modelUsed,
            sources: meta.sources,
            isStreaming: streamingEnabled,
            isError: false,
          },
        ]);
        setRetryCount(0);
        setLastFailedMessage(null);
      } catch (error) {
        console.error("❌ Failed to send message:", error?.data || error);
        setRetryCount((c) => c + 1);
        setLastFailedMessage({ text, file: sfile });
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            message:
              error?.data?.TOKEN_USED > 10000
                ? "Token overused. Please upgrade your plan."
                : error?.status === 429
                ? "Rate limit reached. Please wait a moment."
                : error?.status === 401
                ? "Session expired. Please log in again."
                : "⚠️ Something went wrong. Please try again.",
            isError: true,
            timestamp: new Date().toISOString(),
            id: `err-${Date.now()}`,
            canRetry: true,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [inputText, chatId, sendMessage, dispatch, selectedFile, streamingEnabled, networkStatus, lastFailedMessage]
  );

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessageHandler();
  };

  const handleRetry = () => {
    if (lastFailedMessage?.text) {
      // remove the last error message
      setMessages((prev) => prev.filter((m) => !m.isError));
      sendMessageHandler(lastFailedMessage.text, true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ---------- Copy with formatting ---------- */
  const handleCopy = useCallback(async (text, index, asMarkdown = false) => {
    try {
      const toCopy = asMarkdown ? text : text.replace(/```[\s\S]*?```/g, "").replace(/[#*`_]/g, "");
      await navigator.clipboard.writeText(toCopy);
      setCopySuccess(index);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  /* ---------- Reactions ---------- */
  const toggleReaction = (messageId, reaction) => {
    setMessageReactions((prev) => {
      const current = prev[messageId] || [];
      const exists = current.includes(reaction);
      return {
        ...prev,
        [messageId]: exists ? current.filter((r) => r !== reaction) : [...current, reaction],
      };
    });
  };

  /* ---------- Edit message ---------- */
  const startEditMessage = (index) => {
    setEditingMsgIndex(index);
    setEditText(messages[index].message);
  };

  const saveEditMessage = () => {
    if (editingMsgIndex === null) return;
    const newText = editText.trim();
    if (!newText) return;
    setMessages((prev) =>
      prev.map((m, i) =>
        i === editingMsgIndex ? { ...m, message: newText, edited: true } : m
      )
    );
    setEditingMsgIndex(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingMsgIndex(null);
    setEditText("");
  };

  /* ---------- Delete message ---------- */
  const deleteMessage = (index) => {
    if (window.confirm("Delete this message?")) {
      setMessages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  /* ---------- Speak (TTS) ---------- */
  const speakMessage = (text) => {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, "").replace(/[#*`_]/g, ""));
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => window.speechSynthesis.cancel();

  /* ---------- Export chat ---------- */
  const exportChat = () => {
    const text = messages
      .map((m) => `[${formatTime(m.timestamp)}] ${m.role === "human" ? "You" : "AI"}: ${m.message}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${chatId || Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Static config ---------- */
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
    { icon: "🔍", text: "Debug my JavaScript code" },
    { icon: "📚", text: "Summarize a complex topic" },
    { icon: "🧠", text: "Explain quantum computing" },
    { icon: "✍️", text: "Write a professional email" },
  ];

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const handleClearChat = () => {
    if (window.confirm("Clear all messages in this chat?")) {
      setMessages([]);
    }
  };

  /* ---------- Search filter ---------- */
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter((m) => m.message.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  const highlightSearch = (text) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="search-highlight">{part}</mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  };

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    const userCount = messages.filter((m) => m.role === "human").length;
    const aiCount = messages.filter((m) => m.role === "ai").length;
    const totalChars = messages.reduce((acc, m) => acc + (m.message?.length || 0), 0);
    return { userCount, aiCount, totalChars };
  }, [messages]);

  return (
    <div className="chat-shell">
      {/* Animated background */}
      <div className="chat-bg-gradient">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>

      {!networkStatus && (
        <div className="offline-banner">
          <span>⚠️ You're offline. Messages will not be sent.</span>
        </div>
      )}

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
              <span className={`status-light ${isTyping || isLoading ? "thinking" : ""}`} />
              <span>
                {isTyping || isLoading
                  ? "Thinking..."
                  : networkStatus
                  ? "Online"
                  : "Offline"}
              </span>
              <span className="status-divider">•</span>
              <span className="status-agent">
                {agentUsed || chatInfo.agent}
              </span>
              {tokenUsed !== null && (
                <>
                  <span className="status-divider">•</span>
                  <span className="status-token" title="Tokens used in last response">
                    🎟 {tokenUsed.toLocaleString()}
                  </span>
                </>
              )}
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
                ref={searchInputRef}
                type="text"
                placeholder="Search in chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-count">
                {searchQuery && `${filteredMessages.length} matches`}
              </span>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                aria-label="Close search"
              >
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
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <button
            className="topbar-action"
            title="Export chat"
            onClick={exportChat}
            aria-label="Export chat"
            disabled={messages.length === 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
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

          <button
            className="topbar-action"
            title="More options"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="More options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {showSettings && (
            <div className="settings-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="settings-row">
                <label>
                  <input
                    type="checkbox"
                    checked={streamingEnabled}
                    onChange={(e) => setStreamingEnabled(e.target.checked)}
                  />
                  <span>Streaming response</span>
                </label>
              </div>
              <div className="settings-stats">
                <div>Your messages: {stats.userCount}</div>
                <div>AI responses: {stats.aiCount}</div>
                <div>Total chars: {stats.totalChars.toLocaleString()}</div>
              </div>
            </div>
          )}
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
                <span>Today · {stats.userCount + stats.aiCount} messages</span>
              </div>

              {filteredMessages.map((msg, i) => {
                const realIndex = messages.indexOf(msg);
                return (
                  <MessageBubble
                    key={msg.id || `${chatId}-${realIndex}`}
                    message={msg}
                    user={user}
                    chatInfo={{ ...chatInfo, agent: msg.agent || agentUsed || chatInfo.agent }}
                    showTime={
                      i === filteredMessages.length - 1 ||
                      filteredMessages[i + 1]?.role !== msg.role
                    }
                    time={formatTime(msg.timestamp || new Date())}
                    onCopy={handleCopy}
                    copySuccess={copySuccess}
                    messageIndex={realIndex}
                    isLast={realIndex === messages.length - 1}
                    streamingEnabled={streamingEnabled}
                    onEdit={startEditMessage}
                    onDelete={deleteMessage}
                    onRetry={handleRetry}
                    onSpeak={speakMessage}
                    onStopSpeak={stopSpeaking}
                    reactions={messageReactions[msg.id] || []}
                    onReact={toggleReaction}
                    isEditing={editingMsgIndex === realIndex}
                    editText={editText}
                    setEditText={setEditText}
                    onSaveEdit={saveEditMessage}
                    onCancelEdit={cancelEdit}
                    editTextareaRef={editTextareaRef}
                    highlight={highlightSearch}
                    isSearchActive={!!searchQuery.trim()}
                    isPending={pendingChat === chatId && isTyping && realIndex === messages.length - 1}
                  />
                );
              })}

              {isTyping && chatId === pendingChat && (
                <div className="bubble-row ai">
                  <div
                    className="bubble-avatar"
                    style={{ background: `linear-gradient(135deg, ${chatInfo.color}, #6366f1)` }}
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

        {showScrollBtn && (
          <button className="scroll-to-bottom" onClick={scrollToBottom} aria-label="Scroll to bottom">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
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
                {selectedFile.name.length > 20
                  ? selectedFile.name.substring(0, 20) + "..."
                  : selectedFile.name}
              </span>
              <span className="file-size">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={removeFile}
                className="remove-file-btn"
                aria-label="Remove file"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="composer-icon"
              title="Attach file (PDF, TXT, DOC — max 10MB)"
              onClick={() => fileInputRef.current.click()}
              aria-label="Attach file"
              disabled={isLoading && chatId === pendingChat}
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
            placeholder={
              !networkStatus
                ? "You're offline..."
                : `Message ${chatInfo.title}...`
            }
            className="composer-input"
            rows="1"
            disabled={isLoading && chatId === pendingChat}
          />

          <button
            type="button"
            className="composer-icon"
            title="Voice input (coming soon)"
            aria-label="Voice input"
            disabled
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
            disabled={
              !inputText.trim() || (isLoading && chatId === pendingChat) || !networkStatus
            }
            title="Send message"
            aria-label="Send message"
          >
            {isLoading && chatId === pendingChat ? (
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

        {fileError && (
          <div className="composer-error">
            <span>⚠️ {fileError}</span>
            <button type="button" onClick={() => setFileError(null)}>✕</button>
          </div>
        )}

        <div className="composer-footer">
          <span>
            {chatInfo.title} can make mistakes. Verify important info.
          </span>
          <span className="char-count">
            {inputText.length} / 4000
          </span>
        </div>
      </form>
    </div>
  );
}

/* =====================================================
   COMPONENT: MessageBubble
   ===================================================== */
const MessageBubble = memo(function MessageBubble({
  message,
  user,
  chatInfo,
  showTime,
  time,
  onCopy,
  copySuccess,
  messageIndex,
  isLast,
  streamingEnabled,
  onEdit,
  onDelete,
  onRetry,
  onSpeak,
  onStopSpeak,
  reactions,
  onReact,
  isEditing,
  editText,
  setEditText,
  onSaveEdit,
  onCancelEdit,
  editTextareaRef,
  highlight,
  isSearchActive,
  isPending,
}) {
  const isMe = message.role === "human";
  const isError = message.isError;
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const shouldStream = isLast && !isMe && streamingEnabled && message.isStreaming !== false;
  const { displayed, done } = useTypewriter(
    shouldStream && !isError ? message.message : "",
    6,
    shouldStream && !isError
  );

  const renderedText = shouldStream && !isError ? displayed : message.message;
  const displayText = isSearchActive && !isMe ? highlight(renderedText) : renderedText;

  useEffect(() => {
    if (done) {
      // mark as done streaming
    }
  }, [done]);

  const reactionEmojis = ["👍", "❤️", "😂", "🎉", "🤔", "👎"];

  const formatMessage = (text) => {
    if (!text) return null;

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="code-block-wrapper">
                <div className="code-block-header">
                  <span className="code-language">{match[1]}</span>
                  <button
                    className={`code-copy-btn ${copySuccess === messageIndex ? "copied" : ""}`}
                    onClick={() =>
                      onCopy(String(children).replace(/\n$/, ""), messageIndex)
                    }
                    aria-label="Copy code"
                  >
                    {copySuccess === messageIndex ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <polyline
                            points="20 6 9 17 4 12"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
                          <path
                            d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
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
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="markdown-link"
              >
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
          blockquote: ({ children }) => (
            <blockquote className="markdown-blockquote">{children}</blockquote>
          ),
          hr: () => <hr className="markdown-hr" />,
          table: ({ children }) => (
            <div className="markdown-table-wrapper">
              <table className="markdown-table">{children}</table>
            </div>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="markdown-img" loading="lazy" />
          ),
        }}
      >
        {typeof text === "string" ? text : String(text)}
      </ReactMarkdown>
    );
  };

  const handleBubbleCopy = () => {
    onCopy(message.message, messageIndex, false);
  };

  const handleCopyAsMarkdown = () => {
    onCopy(message.message, messageIndex, true);
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      onStopSpeak();
      setIsSpeaking(false);
    } else {
      onSpeak(message.message);
      setIsSpeaking(true);
      // Auto-stop indicator after estimated duration
      const estimatedDuration = message.message.length * 50;
      setTimeout(() => setIsSpeaking(false), estimatedDuration);
    }
  };

  // Auto-collapse very long messages initially
  useEffect(() => {
    if (message.message.length > 2000) {
      setIsCollapsed(true);
    }
  }, [message.message.length]);

  return (
    <div
      className={`bubble-row ${isMe ? "me" : "ai"} ${isError ? "error-row" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
    >
      {!isMe && (
        <div
          className="bubble-avatar"
          style={{
            background: `linear-gradient(135deg, ${chatInfo.color}, #6366f1)`,
          }}
          title={message.agent || chatInfo.agent}
        >
          {chatInfo.icon}
        </div>
      )}

      <div className="bubble-stack">
        {isError && message.canRetry && (
          <div className="bubble-retry-bar">
            <span>Failed to send</span>
            <button onClick={onRetry} className="retry-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Retry
            </button>
          </div>
        )}

        <div
          className={`bubble-pill ${isError ? "error" : ""} ${isMe ? "user" : "ai"}`}
          onDoubleClick={() => isMe && onEdit(messageIndex)}
        >
          {isEditing ? (
            <div className="bubble-edit">
              <textarea
                ref={editTextareaRef}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSaveEdit();
                  } else if (e.key === "Escape") {
                    onCancelEdit();
                  }
                }}
                autoFocus
                className="edit-textarea"
              />
              <div className="edit-actions">
                <button onClick={onSaveEdit} className="edit-save">
                  Save
                </button>
                <button onClick={onCancelEdit} className="edit-cancel">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bubble-content">
                {isCollapsed && message.message.length > 2000 ? (
                  <>
                    {formatMessage(message.message.substring(0, 500) + "...")}
                    <button
                      className="expand-btn"
                      onClick={() => setIsCollapsed(false)}
                    >
                      Show full message ({message.message.length} chars)
                    </button>
                  </>
                ) : (
                  formatMessage(displayText)
                )}
                {shouldStream && !done && !isError && (
                  <span className="typing-cursor">▌</span>
                )}
              </div>

              {message.edited && <span className="edited-tag">(edited)</span>}

              {message.responseType && message.responseType !== "openai" && !isError && (
                <span className="response-type-tag" title={`Response format: ${message.responseType}`}>
                  {message.responseType}
                </span>
              )}

              {showActions && (
                <div className="bubble-actions">
                  <button
                    className={`bubble-action-btn ${copySuccess === messageIndex ? "copied" : ""}`}
                    onClick={handleBubbleCopy}
                    title="Copy plain text"
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
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </button>

                  {!isMe && (
                    <button
                      className="bubble-action-btn"
                      onClick={handleCopyAsMarkdown}
                      title="Copy as markdown"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <polyline
                          points="14 2 14 8 20 8"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </button>
                  )}

                  {isMe && (
                    <button
                      className="bubble-action-btn"
                      onClick={() => onEdit(messageIndex)}
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  <button
                    className="bubble-action-btn"
                    onClick={() => onDelete(messageIndex)}
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {!isMe && (
                    <button
                      className={`bubble-action-btn ${isSpeaking ? "active" : ""}`}
                      onClick={handleSpeakToggle}
                      title={isSpeaking ? "Stop speaking" : "Read aloud"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  <div className="reaction-wrapper">
                    <button
                      className="bubble-action-btn"
                      onClick={() => setShowReactions(!showReactions)}
                      title="React"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    {showReactions && (
                      <div className="reaction-picker">
                        {reactionEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              onReact(message.id, emoji);
                              setShowReactions(false);
                            }}
                            className="reaction-option"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {reactions && reactions.length > 0 && (
                <div className="reactions-display">
                  {reactions.map((r, i) => (
                    <span key={i} className="reaction-bubble">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {showTime && (
          <span className="bubble-time">
            {isMe ? "You" : message.agent || chatInfo.agent} · {time}
            {message.model && (
              <span className="model-tag"> · {message.model}</span>
            )}
          </span>
        )}

        {message.sources && message.sources.length > 0 && (
          <details className="bubble-sources">
            <summary>📚 {message.sources.length} sources</summary>
            <div className="sources-list">
              {message.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-item"
                >
                  <span className="source-num">{i + 1}</span>
                  <span>{src.title || src.url}</span>
                </a>
              ))}
            </div>
          </details>
        )}
      </div>

      {isMe && (
        <div
          className="bubble-avatar"
          style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
        >
          {user?.avatar ||
            user?.name?.[0]?.toUpperCase() ||
            user?.username?.[0]?.toUpperCase() ||
            "U"}
        </div>
      )}
    </div>
  );
});

export default Chatsection;