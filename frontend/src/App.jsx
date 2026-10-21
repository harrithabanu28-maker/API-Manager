import React from 'react';
import { useAuth } from './context/AuthContext';
import OpeningPage from './components/OpeningPage';
import AdminLayout from './components/admin/AdminLayout';
import DeveloperLayout from './components/developer/DeveloperLayout';
import { Layers } from 'lucide-react';

export default function App() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        color: '#fff',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
        }}>
          <Layers size={26} />
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          API Manager
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Loading application workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <OpeningPage />;
  }

  if (user.role === 'admin') {
    return <AdminLayout />;
  }

  return <DeveloperLayout />;
}
