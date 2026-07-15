import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import "./Sidebar.css";
import { useDispatch, useSelector } from "react-redux";
import {
  useCreateUserChatMutation,
  useDeleteUserChatMutation,
  useFetchUserChatQuery,
} from "../../redux/api/chatApi";
import { setChatId, setChatMessages} from "../../redux/slices/chat.slice";
import { getToken } from "../../redux/slices/user.slice";
import { useNavigate } from "react-router";

function Sidebar() {
  const [createUserChat, { isLoading: isCreating }] = useCreateUserChatMutation();
  const [deleteUserChat, { isLoading: isDeleting }] = useDeleteUserChatMutation();
  const { data, refetch, isFetching } = useFetchUserChatQuery();

  const chatId = useSelector((state) => state.chat.chatId);
  const user = useSelector((state) => state.user.value);
  const userTokenUsed = useSelector((state) => state.user.token);
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("chats");
  const [deletingId, setDeletingId] = useState(null);
  const [showTokenDetails, setShowTokenDetails] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  // ✅ FIXED useEffect - only depends on data
  useEffect(() => {
    if (data?.data) {
      if (data.TOKEN_USED !== undefined) {
        dispatch(getToken(data.TOKEN_USED));
      }
      dispatch(setChatMessages(data.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const tokenUsage = useMemo(
    () => ({
      used: userTokenUsed || 0,
      total: 50000,
      period: "month",
    }),
    [userTokenUsed]
  );

  // Filtered chats based on search
  const filteredChats = useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;
    const query = searchQuery.toLowerCase();
    return data.data.filter((chat) => {
      const title =
        chat.messages?.[0]?.message?.toLowerCase() ||
        chat.title?.toLowerCase() ||
        "Chat";
      return title.includes(query);
    });
  }, [data, searchQuery]);

  // Group chats by date
  const groupedChats = useMemo(() => {
    const today = [];
    const yesterday = [];
    const lastWeek = [];
    const older = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.created_at);
      const diff = now - chatDate;
      if (diff < oneDay) today.push(chat);
      else if (diff < 2 * oneDay) yesterday.push(chat);
      else if (diff < 7 * oneDay) lastWeek.push(chat);
      else older.push(chat);
    });

    return { today, yesterday, lastWeek, older };
  }, [filteredChats]);

  // Token Usage calculations
  const tokenStats = useMemo(() => {
    const { used, total } = tokenUsage;
    const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
    const remaining = Math.max(total - used, 0);
    let status = "safe";
    if (percentage >= 90) status = "critical";
    else if (percentage >= 70) status = "warning";
    return { percentage, remaining, status };
  }, [tokenUsage]);

  const formatTokens = useCallback((n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toString();
  }, []);

  const handleNewChat = async () => {
    try {
      await createUserChat().unwrap();
      refetch();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm("Delete this conversation?")) return;
    setDeletingId(id);
    try {
      await deleteUserChat({ chatId: id, id }).unwrap();
      refetch();
      if (chatId === id) dispatch(setChatId(null));
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectChat = (id) => {
    dispatch(setChatId(id));
    setIsOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle responsive collapse on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close mobile sidebar on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const renderChatItem = (chat) => {
    const title =
      chat.messages?.[0]?.message?.slice(0, 40) +
        (chat.messages?.[0]?.message?.length > 40 ? "..." : "") ||
      chat.title ||
      "New Chat";

    return (
      <div
        key={chat.id}
        className={`chat-item ${chatId === chat.id ? "active" : ""} ${
          deletingId === chat.id ? "deleting" : ""
        }`}
        onClick={() => handleSelectChat(chat.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelectChat(chat.id);
          }
        }}
      >
        <div className="chat-item-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="chat-item-content">
          <p className="chat-item-title">
            {!title || title === "undefined" ? "chat" : title}
          </p>
          <span className="chat-item-date">
            {new Date(chat.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
        <button
          className="delete-btn"
          onClick={(e) => handleDeleteChat(chat.id, e)}
          disabled={deletingId === chat.id}
          title="Delete chat"
          aria-label="Delete chat"
        >
          {deletingId === chat.id ? (
            <span className="mini-spinner" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    );
  };

  const renderChatGroup = (label, chats) => {
    if (!chats.length) return null;
    return (
      <div className="chat-group">
        {!isCollapsed && <div className="chat-group-label">{label}</div>}
        {chats.map(renderChatItem)}
      </div>
    );
  };

  const handleMenuOptions = (option) => {
    if (option === "Settings") {
      navigate("/settings");
    }
    setShowUserMenu(false);
    setIsOpen(false);
  };

  const settingsOptions = [
    { icon: "⚙️", label: "Settings" },
    { icon: "🚪", label: "Logout" },
  ];

  const totalChats = data?.data?.length || 0;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 12h18M3 6h18M3 18h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Backdrop for mobile */}
      <div
        className={`sidebar-backdrop ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${
          isCollapsed ? "collapsed" : ""
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-mark">
              <span>S</span>
              <div className="logo-pulse"></div>
            </div>
            {!isCollapsed && (
              <div className="logo-info">
                <h6>SuperAssist</h6>
                <span>
                  <span className="pulse-dot" />
                  Online
                </span>
              </div>
            )}
          </div>
          <button
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand" : "Collapse"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
              }}
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="mobile-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <button
          className={`new-chat-btn ${isCollapsed ? "collapsed" : ""}`}
          onClick={handleNewChat}
          disabled={isCreating}
          title="New conversation"
        >
          {isCreating ? (
            <span className="btn-spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          )}
          {!isCollapsed && (
            <span>{isCreating ? "Creating..." : "New conversation"}</span>
          )}
        </button>

        {/* Search */}
        {!isCollapsed && (
          <div className="search-box">
            <svg
              className="search-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search conversations"
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery("")}
                title="Clear"
                aria-label="Clear search"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        {!isCollapsed ? (
          <div className="view-tabs" role="tablist">
            {[
              { id: "chats", label: "Chats", count: totalChats },
              { id: "agents", label: "Agents" },
              { id: "tools", label: "Tools" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`view-tab ${activeView === tab.id ? "active" : ""}`}
                onClick={() => setActiveView(tab.id)}
                role="tab"
                aria-selected={activeView === tab.id}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="tab-count">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="collapsed-tabs">
            {[
              { id: "chats", icon: "💬", title: "Chats" },
              { id: "agents", icon: "🤖", title: "Agents" },
              { id: "tools", icon: "🛠", title: "Tools" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`collapsed-tab ${activeView === tab.id ? "active" : ""}`}
                onClick={() => setActiveView(tab.id)}
                title={tab.title}
                aria-label={tab.title}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="sidebar-content">
          {activeView === "chats" && (
            <>
              {isFetching && !data?.data && (
                <div className="loading-state">
                  <div className="loader" />
                  {!isCollapsed && <p>Loading conversations...</p>}
                </div>
              )}

              {!isFetching && totalChats === 0 && (
                <div className="empty-view">
                  {!isCollapsed ? (
                    <>
                      <div className="empty-icon">💭</div>
                      <p>No conversations yet</p>
                      <span>Start a new chat to begin</span>
                    </>
                  ) : (
                    <span className="collapsed-icon">💬</span>
                  )}
                </div>
              )}

              {!isFetching && totalChats > 0 && filteredChats.length === 0 && (
                <div className="empty-view">
                  {!isCollapsed ? (
                    <>
                      <div className="empty-icon">🔍</div>
                      <p>No results found</p>
                      <span>Try a different search term</span>
                    </>
                  ) : (
                    <span className="collapsed-icon">🔍</span>
                  )}
                </div>
              )}

              {filteredChats.length > 0 && (
                <div className="chats-list">
                  {renderChatGroup("Today", groupedChats.today)}
                  {renderChatGroup("Yesterday", groupedChats.yesterday)}
                  {renderChatGroup("This Week", groupedChats.lastWeek)}
                  {renderChatGroup("Older", groupedChats.older)}
                </div>
              )}
            </>
          )}

          {activeView === "agents" && (
            <div className="empty-view">
              {!isCollapsed ? (
                <>
                  <div className="empty-icon">🤖</div>
                  <p>No agents available</p>
                  <span>Coming soon</span>
                </>
              ) : (
                <span className="collapsed-icon">🤖</span>
              )}
            </div>
          )}

          {activeView === "tools" && (
            <div className="empty-view">
              {!isCollapsed ? (
                <>
                  <div className="empty-icon">🛠</div>
                  <p>No tools available</p>
                  <span>Coming soon</span>
                </>
              ) : (
                <span className="collapsed-icon">⚙</span>
              )}
            </div>
          )}
        </div>

        {/* Token Usage Section */}
        {!isCollapsed ? (
          <div className={`token-usage-section ${tokenStats.status}`}>
            <div
              className="token-usage-header"
              onClick={() => setShowTokenDetails(!showTokenDetails)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowTokenDetails(!showTokenDetails);
                }
              }}
            >
              <div className="token-usage-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Token Usage</span>
                <span className="period-badge">{tokenUsage.period}</span>
              </div>
              <span className="token-percentage">
                {tokenStats.percentage.toFixed(0)}%
              </span>
            </div>

            <div className="token-progress-track">
              <div
                className="token-progress-fill"
                style={{ width: `${tokenStats.percentage}%` }}
              />
            </div>

            {showTokenDetails && (
              <div className="token-usage-details">
                <div className="token-stat">
                  <span className="token-stat-label">Used</span>
                  <span className="token-stat-value">
                    {formatTokens(tokenUsage.used)}
                  </span>
                </div>
                <div className="token-stat">
                  <span className="token-stat-label">Remaining</span>
                  <span className="token-stat-value">
                    {formatTokens(tokenStats.remaining)}
                  </span>
                </div>
                <div className="token-stat">
                  <span className="token-stat-label">Total</span>
                  <span className="token-stat-value">
                    {formatTokens(tokenUsage.total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`token-usage-collapsed ${tokenStats.status}`}
            title={`${tokenStats.percentage.toFixed(0)}% used`}
          >
            <svg viewBox="0 0 36 36" className="token-circle">
              <path
                className="token-circle-bg"
                d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
              />
              <path
                className="token-circle-fill"
                d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                style={{ strokeDasharray: `${tokenStats.percentage}, 100` }}
              />
            </svg>
            <span className="token-circle-text">
              {tokenStats.percentage.toFixed(0)}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="sidebar-footer">
          <div className={`user-card ${isCollapsed ? "collapsed" : ""}`}>
            <div className="user-avatar">
              {user?.avatar || user?.username[0].toUpperCase() || "U"}
              <span className="user-presence" />
            </div>
            {!isCollapsed && (
              <div className="user-meta">
                <span className="user-name">
                  {user?.username || user?.username || "User"}
                </span>
                <span className="user-plan">
                  <span className="plan-dot" />
                  {user?.plan || "Free"} Plan
                </span>
              </div>
            )}
            <div className="user-menu-container" ref={userMenuRef}>
              {!isCollapsed && (
                <button
                  className="user-menu-btn"
                  title="Menu"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
                  </svg>
                </button>
              )}

              {showUserMenu && (
                <div className="settings-bar">
                  <div className="settings-header">Settings</div>
                  {settingsOptions.map((option, index) => (
                    <button
                      key={index}
                      className="settings-item"
                      onClick={() => handleMenuOptions(option.label)}
                    >
                      <span className="settings-icon">{option.icon}</span>
                      <span className="settings-label">
                        {option.label.toLowerCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
