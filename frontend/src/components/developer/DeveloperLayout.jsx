import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Key,
  Play,
  BarChart3,
  History,
  LogOut,
  Code2,
} from 'lucide-react';

import DeveloperDashboard from './DeveloperDashboard';
import AvailableApisPage from './AvailableApisPage';
import MyApiKeysPage from './MyApiKeysPage';
import ApiTesterPage from './ApiTesterPage';
import DeveloperAnalyticsPage from './DeveloperAnalyticsPage';
import RequestHistoryPage from './RequestHistoryPage';

export default function DeveloperLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedApiForTest, setSelectedApiForTest] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'available-apis', label: 'Available APIs', icon: <Layers size={18} /> },
    { id: 'my-keys', label: 'My API Keys', icon: <Key size={18} /> },
    { id: 'api-tester', label: 'API Tester', icon: <Play size={18} /> },
    { id: 'usage-analytics', label: 'Usage Analytics', icon: <BarChart3 size={18} /> },
    { id: 'request-history', label: 'Request History', icon: <History size={18} /> },
  ];

  const handleTestApi = (api) => {
    setSelectedApiForTest(api);
    setActiveTab('api-tester');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DeveloperDashboard onNavigate={setActiveTab} />;
      case 'available-apis':
        return <AvailableApisPage onTestApi={handleTestApi} />;
      case 'my-keys':
        return <MyApiKeysPage onSelectKeyForTester={() => setActiveTab('api-tester')} />;
      case 'api-tester':
        return <ApiTesterPage preselectedApi={selectedApiForTest} />;
      case 'usage-analytics':
        return <DeveloperAnalyticsPage />;
      case 'request-history':
        return <RequestHistoryPage />;
      default:
        return <DeveloperDashboard onNavigate={setActiveTab} />;
    }
  };

  const getPageTitle = () => {
    const item = navItems.find((n) => n.id === activeTab);
    return item ? item.label : 'Developer Portal';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Layers size={20} />
          </div>
          <div>
            <div className="sidebar-title">API Manager</div>
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
              Developer Portal
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <span className="user-name">{user?.name || 'Developer'}</span>
            <span className="user-role">Developer</span>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'none',
              color: 'var(--text-muted)',
              padding: '0.35rem',
              borderRadius: '4px',
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-bar">
          <div className="page-title">{getPageTitle()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              color: '#34d399',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontWeight: 600,
            }}>
              <Code2 size={14} /> Developer Workspace
            </span>
          </div>
        </header>

        <main className="page-body">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
