import React, { useState } from "react";
import "./Sidebar.css";
import { useDispatch, useSelector } from "react-redux";
import { useFetchUserChatQuery } from "../../redux/api/chatApi";
import { useEffect } from "react";
import { setChatId, setChatMessages } from "../../redux/slices/chat.slice";

function Sidebar() {
  const chatId = useSelector((state) => state.chat.chatId);
  const { data, refetch } = useFetchUserChatQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("chats");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setChatMessages(data?.data));
    refetch();
  }, [data, chatId, dispatch, refetch]);

  const user = useSelector((state) => state.user.value);

  const handleNewChat = () => {
    // Logic goes here
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-mark">N</div>
            {!isCollapsed && (
              <div className="logo-info">
                <h6>NexusAI</h6>
                <span>
                  <span className="pulse-dot"></span>Online
                </span>
              </div>
            )}
          </div>
          <button
            className="collapse-btn d-none d-lg-flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "›" : "‹"}
          </button>
          <button
            className="mobile-close d-lg-none"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* New Chat */}
        <button
          className={`new-chat-btn ${isCollapsed ? "collapsed" : ""}`}
          onClick={handleNewChat}
          title="New conversation"
        >
          <span className="plus-icon">+</span>
          {!isCollapsed && <span>New conversation</span>}
        </button>

        {data?.data?.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${chatId === chat.id ? "active" : ""}`}
            onClick={() => dispatch(setChatId(chat.id))}
          >
            <div className="chat-item-icon">💬</div>
            <div className="chat-item-content">
              <p className="chat-item-title">
                {chat.messages?.[0]?.content
                  ? chat.messages[0].content.slice(0, 28) + "..."
                  : "New Chat"}
              </p>
              <span className="chat-item-date">
                {new Date(chat.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Search */}
        {!isCollapsed && (
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Tabs */}
        {!isCollapsed ? (
          <div className="view-tabs">
            {[
              { id: "chats", label: "Chats" },
              { id: "agents", label: "Agents" },
              { id: "tools", label: "Tools" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`view-tab ${activeView === tab.id ? "active" : ""}`}
                onClick={() => setActiveView(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="collapsed-tabs">
            {[
              { id: "chats", icon: "💬" },
              { id: "agents", icon: "🤖" },
              { id: "tools", icon: "⚙" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`collapsed-tab ${activeView === tab.id ? "active" : ""}`}
                onClick={() => setActiveView(tab.id)}
                title={tab.id}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="sidebar-content">
          {activeView === "chats" && (
            <div className="empty-view">
              {!isCollapsed && <p>No conversations yet</p>}
              {isCollapsed && <span className="collapsed-icon">💬</span>}
            </div>
          )}

          {activeView === "agents" && (
            <div className="empty-view">
              {!isCollapsed && <p>No agents available</p>}
              {isCollapsed && <span className="collapsed-icon">🤖</span>}
            </div>
          )}

          {activeView === "tools" && (
            <div className="empty-view">
              {!isCollapsed && <p>No tools available</p>}
              {isCollapsed && <span className="collapsed-icon">⚙</span>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className={`user-card ${isCollapsed ? "collapsed" : ""}`}>
            <div className="user-avatar">
              {user?.avatar || user?.name?.[0]?.toUpperCase() || "U"}
              <span className="user-presence"></span>
            </div>
            {!isCollapsed && (
              <div className="user-meta">
                <span className="user-name">{user?.username || "User"}</span>
                <span className="user-plan">{user?.tier || "Free"}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;