import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';

function SettingsPage() {
  const { activeProfile, updateActiveProfile, resetAllProfiles } = useProfile();
  
  const [activeTab, setActiveTab] = useState('account'); // account, appearance, security, notifications, danger

  // Form states loaded from activeProfile context
  const [username, setUsername] = useState(activeProfile.name);
  const [email, setEmail] = useState(activeProfile.id === 'aarav' ? 'aarav.singh@devverse.app' : 'learner@devverse.app');
  const [language, setLanguage] = useState(activeProfile.settings.language);
  const [darkMode, setDarkMode] = useState(activeProfile.settings.darkMode);
  const [selectedTheme, setSelectedTheme] = useState(activeProfile.settings.selectedTheme);
  const [privacyLevel, setPrivacyLevel] = useState(activeProfile.settings.privacyLevel);

  // Security states
  const [twoFactor, setTwoFactor] = useState(activeProfile.settings.twoFactor);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // Notification states
  const [notifyEmail, setNotifyEmail] = useState(activeProfile.settings.notifyEmail);
  const [notifyPush, setNotifyPush] = useState(activeProfile.settings.notifyPush);
  const [notifySound, setNotifySound] = useState(activeProfile.settings.notifySound);

  // Delete Account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);

  // Sync state if active profile changes
  useEffect(() => {
    setUsername(activeProfile.name);
    setLanguage(activeProfile.settings.language);
    setDarkMode(activeProfile.settings.darkMode);
    setSelectedTheme(activeProfile.settings.selectedTheme);
    setPrivacyLevel(activeProfile.settings.privacyLevel);
    setTwoFactor(activeProfile.settings.twoFactor);
    setNotifyEmail(activeProfile.settings.notifyEmail);
    setNotifyPush(activeProfile.settings.notifyPush);
    setNotifySound(activeProfile.settings.notifySound);
    setEmail(activeProfile.id === 'aarav' ? 'aarav.singh@devverse.app' : 'learner@devverse.app');
  }, [activeProfile.id]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateActiveProfile({
      name: username,
      settings: {
        ...activeProfile.settings,
        language,
        privacyLevel
      }
    });
    alert('Profile configurations updated successfully!');
  };

  const handleUpdateTheme = (themeName) => {
    setSelectedTheme(themeName);
    updateActiveProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        selectedTheme: themeName
      }
    }));
  };

  const handleToggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    updateActiveProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        darkMode: nextVal
      }
    }));
  };

  const handleToggle2FA = () => {
    const nextVal = !twoFactor;
    setTwoFactor(nextVal);
    updateActiveProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        twoFactor: nextVal
      }
    }));
  };

  const handleToggleNotification = (type) => {
    if (type === 'email') {
      const nextVal = !notifyEmail;
      setNotifyEmail(nextVal);
      updateActiveProfile(prev => ({ ...prev, settings: { ...prev.settings, notifyEmail: nextVal } }));
    }
    if (type === 'push') {
      const nextVal = !notifyPush;
      setNotifyPush(nextVal);
      updateActiveProfile(prev => ({ ...prev, settings: { ...prev.settings, notifyPush: nextVal } }));
    }
    if (type === 'sound') {
      const nextVal = !notifySound;
      setNotifySound(nextVal);
      updateActiveProfile(prev => ({ ...prev, settings: { ...prev.settings, notifySound: nextVal } }));
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill out all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password inputs do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters long.');
      return;
    }

    setPwSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      setIsDeleted(true);
      setShowDeleteModal(false);
      resetAllProfiles();
    } else {
      alert('Verification text mismatched.');
    }
  };

  if (isDeleted) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center glass rounded-[2rem] border border-red-500/20 my-12 animate-fade-in text-slate-100">
        <span className="text-5xl block mb-4">⚠️</span>
        <h2 className="text-2xl font-bold text-red-400">Account Deleted / Sandbox Reset</h2>
        <p className="mt-3 text-sm text-slate-400">Your profile data has been wiped from the sandbox. Re-initializing default sandbox environment.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-slate-800 px-6 py-2.5 text-xs text-white hover:bg-slate-700 transition btn-micro"
        >
          Re-initialize Sandbox
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-fade-in text-slate-100">
      
      {/* Header section */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8">
        <h1 className="text-3xl font-semibold text-white">Settings Workspace</h1>
        <p className="mt-2 text-slate-400">Manage account safety, interface parameters, toggles, notifications, and profile details.</p>
      </div>

      {/* Main Grid: Sidebar selection + forms content */}
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        
        {/* Navigation Tabs on the left */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 h-fit space-y-2 card-hover-premium">
          {[
            { id: 'account', label: '👤 Account Profile' },
            { id: 'appearance', label: '🎨 Appearance / Theme' },
            { id: 'security', label: '🔒 Security Controls' },
            { id: 'notifications', label: '🔔 Notifications Toggle' },
            { id: 'danger', label: '⚠️ Danger Zone' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left rounded-xl px-4 py-3 text-xs font-semibold transition-all btn-micro ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white border-l-2 border-cyan-400'
                  : 'text-slate-400 border-l-2 border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Configurations forms on the right */}
        <div className="glass rounded-[2rem] border border-white/10 p-6 min-h-[400px] card-hover-premium">
          
          {/* 1. Account Settings */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">Profile Credentials</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Username display</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-sm rounded-xl border border-white/10 bg-slate-950/60 p-3 text-white outline-none focus:border-cyan-400/40"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm rounded-xl border border-white/10 bg-slate-950/60 p-3 text-slate-400 outline-none cursor-not-allowed"
                    disabled
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Registered email within the DevVerse sandbox environment.</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">System Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full text-sm rounded-xl border border-white/10 bg-slate-950/60 p-3 text-white outline-none focus:border-cyan-400/40"
                  >
                    <option>English</option>
                    <option>Spanish (Español)</option>
                    <option>French (Français)</option>
                    <option>German (Deutsch)</option>
                    <option>Japanese (日本語)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Privacy Level</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {['public', 'friends-only', 'private'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPrivacyLevel(opt)}
                        className={`rounded-lg py-2 text-xs font-semibold border transition btn-micro ${
                          privacyLevel === opt
                            ? 'border-cyan-400 bg-cyan-400/10 text-cyan-200 shadow'
                            : 'border-white/5 bg-slate-950/40 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt === 'public' ? '🌍 Public' : opt === 'private' ? '🔒 Private' : '👥 Friends'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 text-xs font-semibold transition active:scale-95 btn-micro"
              >
                Save Settings
              </button>
            </form>
          )}

          {/* 2. Appearance settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">Interface Theme Configurations</h3>
              
              <div className="space-y-5">
                {/* Dark Mode toggle */}
                <div className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Forced Dark Mode</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Maintain low luminosity palette structures.</p>
                  </div>
                  <button
                    onClick={handleToggleDarkMode}
                    className={`h-6 w-11 rounded-full p-0.5 transition duration-300 ${
                      darkMode ? 'bg-cyan-400' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-slate-950 shadow-md transform transition duration-300 ${
                      darkMode ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Curated Theme selection */}
                <div>
                  <span className="block text-xs uppercase tracking-wider text-slate-400 mb-3">Color Accent Palettes</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { name: 'Indigo Cyber', desc: 'Futuristic digital neon purple glows', accent: 'bg-indigo-500' },
                      { name: 'Emerald Glow', desc: 'Harmonious nature developer tones', accent: 'bg-emerald-400' },
                      { name: 'Sunset Pink', desc: 'Warm gradients of twilight sunset', accent: 'bg-rose-500' },
                      { name: 'Slate Dark', desc: 'Minimalist industrial charcoal slate', accent: 'bg-slate-500' }
                    ].map((theme) => (
                      <div
                        key={theme.name}
                        onClick={() => handleUpdateTheme(theme.name)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 flex items-center justify-between ${
                          selectedTheme === theme.name
                            ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-950/20'
                            : 'border-white/5 bg-slate-950/40 hover:border-white/10'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{theme.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{theme.desc}</p>
                        </div>
                        <span className={`h-4 w-4 rounded-full ${theme.accent}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">Security & Shielding</h3>

              {/* 2FA Toggle */}
              <div className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-white/5 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Double Factor Authentication (2FA)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Secure logins with verification codes emailed to credentials.</p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`h-6 w-11 rounded-full p-0.5 transition duration-300 ${
                    twoFactor ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full bg-slate-950 shadow-md transform transition duration-300 ${
                    twoFactor ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Password update form */}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alter Password Credentials</h4>
                
                {pwError && (
                  <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                    ❌ {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                    ✓ Password updated successfully in mock sandbox database.
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Old password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-white outline-none focus:border-cyan-400/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-white outline-none focus:border-cyan-400/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-white outline-none focus:border-cyan-400/40"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 text-xs font-semibold transition active:scale-95 btn-micro"
                >
                  Save Credentials
                </button>
              </form>
            </div>
          )}

          {/* 4. Notifications settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">Notification parameters</h3>
              
              <div className="space-y-3">
                {[
                  { title: 'Email reports', state: notifyEmail, toggle: () => handleToggleNotification('email'), desc: 'Weekly consistency summaries sent to mailbox.' },
                  { title: 'Push banners', state: notifyPush, toggle: () => handleToggleNotification('push'), desc: 'Receive instant alerts on achievement unlocks.' },
                  { title: 'Audio notifications', state: notifySound, toggle: () => handleToggleNotification('sound'), desc: 'Trigger subtle audio sounds on completing missions.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-white/5">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={item.toggle}
                      className={`h-6 w-11 rounded-full p-0.5 transition duration-300 ${
                        item.state ? 'bg-cyan-400' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full bg-slate-950 shadow-md transform transition duration-300 ${
                        item.state ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Danger Zone settings */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-rose-400 border-b border-rose-500/20 pb-3">Caution Core Danger zone</h3>
              
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-4">
                <h4 className="text-xs font-bold text-red-300 uppercase tracking-widest">Wipe Account Data Details</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Deleting your profile immediately terminates all current streaks, earned badges, custom roadmaps progress, and claimed XP rewards. This sequence is permanent and cannot be rolled back.
                </p>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-xl bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 text-xs font-semibold transition active:scale-95 btn-micro"
                >
                  Delete Account Profile
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Delete account caution modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="glass max-w-md w-full rounded-[2rem] border border-red-500/20 p-6 space-y-6 animate-slide-up">
            <div>
              <h3 className="text-lg font-bold text-white">Confirm Account Deletion</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                To confirm deletion, please type the word <strong className="text-red-400">delete</strong> in the text container input below.
              </p>
            </div>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type delete to confirm..."
              className="w-full text-xs rounded-xl border border-white/10 bg-slate-950/60 p-3 text-white outline-none focus:border-red-400/40"
            />

            <div className="flex gap-3 justify-end text-xs">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 hover:text-white transition btn-micro"
              >
                Cancel Action
              </button>
              <button
                onClick={handleDeleteAccount}
                className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-white font-semibold transition active:scale-95 btn-micro"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsPage;
