import React, { useState } from "react";
import "./Sidebar.css";
import { useSelector } from "react-redux";

function Sidebar() {


  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("chats");
  const [activeChat, setActiveChat] = useState(null);

  // ===== Tera data yaha aayega =====
  const chats = [];
  const agents = [];
  const tools = [];
  const user = useSelector((state) => state.user.value)

  const handleNewChat = () => {

    const ConversationsButtons = document.querySelector(".newConv"
    )

    const div = document.createElement("button")

    div.innerText = "chat 1"
    ConversationsButtons.appendChild(div)
  };

  const handleToggle = () => {
    if (window.innerWidth < 992) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
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

        {/**new conversations */}
        <div className="newConv" >

        </div>

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