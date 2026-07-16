import { useState } from 'react';
import './Setting.css';
import { useNavigate } from 'react-router';

const Setting = ({ onClose }) => {
   
   const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '👤',
    bio: 'AI enthusiast',
  });



  const [memorySettings, setMemorySettings] = useState({
    aiMemory: true,
    saveConversations: true,
    learnFromChats: false,
  });

  const [currentPlan, setCurrentPlan] = useState('basic');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$0',
      period: 'Free forever',
      icon: '🌱',
      features: [
        '50 messages/day',
        'Basic AI model',
        '7-day chat history',
        'Standard response speed',
      ],
      notIncluded: ['Memory feature', 'Priority support', 'Custom AI personality'],
    },
    {
      id: 'extra',
      name: 'Extra',
      price: '$9',
      period: 'per month',
      icon: '⚡',
      features: [
        '500 messages/day',
        'Advanced AI model',
        '30-day chat history',
        'Fast response speed',
        'Memory feature',
        'Email support',
      ],
      notIncluded: ['Custom AI personality', 'API access'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19',
      period: 'per month',
      icon: '👑',
      features: [
        'Unlimited messages',
        'Best AI model (GPT-4)',
        'Unlimited chat history',
        'Fastest response speed',
        'Advanced Memory',
        'Custom AI personality',
        'Priority support 24/7',
        'API access',
        'Early access to features',
      ],
      notIncluded: [],
    },
  ];

  const handleDeleteMemory = () => {
    if (window.confirm('Are you sure you want to delete all AI memory? This cannot be undone.')) {
      // Call your API to delete memory
     
      alert('All AI memory has been cleared successfully.');
    }
  };

  const handleSaveProfile = () => {
    // Call your API to save profile
   
    alert('Profile updated successfully!');
  };

  const handleUpgrade = (planId) => {
    // Call your payment API
  
    setCurrentPlan(planId);
  };

  function closeSettingPage(){
       navigate("/dashboard")
  }


  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header-bar">
          <h2>⚙️ Settings</h2>
          <button className="close-btn" onClick={closeSettingPage}>✕</button>
        </div>

        <div className="settings-body">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="tab-icon">👤</span>
              <span>Profile</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'memory' ? 'active' : ''}`}
              onClick={() => setActiveTab('memory')}
            >
              <span className="tab-icon">🧠</span>
              <span>AI Memory</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
              onClick={() => setActiveTab('plan')}
            >
              <span className="tab-icon">💎</span>
              <span>Plan</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <span className="tab-icon">🎨</span>
              <span>Preferences</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <span className="tab-icon">🔒</span>
              <span>Account</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="settings-content">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h3>Profile Settings</h3>
                <p className="section-desc">Update your personal information</p>

                <div className="form-group">
                  <label>Avatar</label>
                  <div className="avatar-selector">
                    {['👤', '😎', '🤖', '👨‍💻', '👩‍💻', '🦸', '🧙', '🐱'].map((emoji) => (
                      <button
                        key={emoji}
                        className={`avatar-option ${profile.avatar === emoji ? 'selected' : ''}`}
                        onClick={() => setProfile({ ...profile, avatar: emoji })}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                    rows="3"
                  />
                </div>

                <button className="primary-btn" onClick={handleSaveProfile}>
                  Save Changes
                </button>
              </div>
            )}

            {/* MEMORY TAB */}
            {activeTab === 'memory' && (
              <div className="settings-section">
                <h3>AI Memory</h3>
                <p className="section-desc">Control what the AI remembers about you</p>

                <div className="memory-card">
                  <div className="memory-info">
                    <div className="memory-icon">🧠</div>
                    <div>
                      <h4>AI Memory</h4>
                      <p>Let AI remember your preferences, facts, and context across chats</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={memorySettings.aiMemory}
                      onChange={(e) =>
                        setMemorySettings({ ...memorySettings, aiMemory: e.target.checked })
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="memory-card">
                  <div className="memory-info">
                    <div className="memory-icon">💬</div>
                    <div>
                      <h4>Save Conversations</h4>
                      <p>Store your chat history for later reference</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={memorySettings.saveConversations}
                      onChange={(e) =>
                        setMemorySettings({
                          ...memorySettings,
                          saveConversations: e.target.checked,
                        })
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="memory-card">
                  <div className="memory-info">
                    <div className="memory-icon">📚</div>
                    <div>
                      <h4>Learn From My Chats</h4>
                      <p>Allow AI to improve responses based on your interactions</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={memorySettings.learnFromChats}
                      onChange={(e) =>
                        setMemorySettings({ ...memorySettings, learnFromChats: e.target.checked })
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="danger-zone">
                  <h4>⚠️ Danger Zone</h4>
                  <p>Permanently delete all stored AI memory and conversation data</p>
                  <button className="danger-btn" onClick={handleDeleteMemory}>
                    🗑️ Delete All Memory
                  </button>
                </div>
              </div>
            )}

            {/* PLAN TAB */}
            {activeTab === 'plan' && (
              <div className="settings-section">
                <h3>Choose Your Plan</h3>
                <p className="section-desc">Upgrade for more features and higher limits</p>

                <div className="plans-grid">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`plan-card ${currentPlan === plan.id ? 'current' : ''} ${
                        plan.id === 'premium' ? 'premium-card' : ''
                      }`}
                    >
                      {plan.id === 'premium' && (
                        <div className="best-value-badge">⭐ BEST VALUE</div>
                      )}
                      {currentPlan === plan.id && (
                        <div className="current-badge">✓ CURRENT</div>
                      )}

                      <div className="plan-icon">{plan.icon}</div>
                      <h3>{plan.name}</h3>
                      <div className="plan-price">
                        <span className="price">{plan.price}</span>
                        <span className="period">/{plan.period}</span>
                      </div>

                      <ul className="plan-features">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="included">
                            <span className="check">✓</span> {feature}
                          </li>
                        ))}
                        {plan.notIncluded.map((feature, i) => (
                          <li key={i} className="not-included">
                            <span className="cross">✕</span> {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        className={`plan-btn ${
                          currentPlan === plan.id ? 'current-btn' : 'upgrade-btn'
                        } ${plan.id === 'premium' ? 'premium-btn' : ''}`}
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={currentPlan === plan.id}
                      >
                        {currentPlan === plan.id
                          ? 'Current Plan'
                          : plan.id === 'basic'
                          ? 'Downgrade'
                          : 'Upgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h3>Preferences</h3>
                <p className="section-desc">Customize your chat experience</p>

                <div className="form-group">
                  <label>Theme</label>
                  <select defaultValue="light">
                    <option value="light">☀️ Light</option>
                    <option value="dark">🌙 Dark</option>
                    <option value="auto">⚙️ Auto (System)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Font Size</label>
                  <select defaultValue="medium">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select defaultValue="en">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>
            )}

            {/* ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="settings-section">
                <h3>Account & Security</h3>
                <p className="section-desc">Manage your account security</p>

                <button className="secondary-btn">🔑 Change Password</button>
                <button className="secondary-btn">📧 Change Email</button>
                <button className="secondary-btn">📱 Enable 2FA</button>
                <button className="secondary-btn">📥 Export My Data</button>

                <div className="danger-zone">
                  <h4>⚠️ Delete Account</h4>
                  <p>Permanently delete your account and all associated data</p>
                  <button className="danger-btn">🗑️ Delete Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
