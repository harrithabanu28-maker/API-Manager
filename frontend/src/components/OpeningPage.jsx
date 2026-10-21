import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Code2, Layers, KeyRound, Activity, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OpeningPage() {
  const { login, register } = useAuth();
  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin' or 'developer'
  const [isRegistering, setIsRegistering] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegistering) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register(name, email, password, selectedRole);
      } else {
        await login(email, password, selectedRole);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchRole = (role) => {
    setSelectedRole(role);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-main)',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0b0f19 75%)',
    }}>
      {/* Top Header */}
      <header style={{
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}>
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              API Manager
            </span>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Unified API Governance & Gateway
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => switchRole('admin')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: selectedRole === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: selectedRole === 'admin' ? '#818cf8' : 'var(--text-secondary)',
              border: selectedRole === 'admin' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
            }}
          >
            <ShieldCheck size={16} /> Admin Portal
          </button>
          <button
            onClick={() => switchRole('developer')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: selectedRole === 'developer' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: selectedRole === 'developer' ? '#34d399' : 'var(--text-secondary)',
              border: selectedRole === 'developer' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            }}
          >
            <Code2 size={16} /> Developer Portal
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '960px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}>
          {/* Left Column: Brand & Role Highlights */}
          <div style={{
            padding: '2.5rem',
            backgroundColor: selectedRole === 'admin' ? '#0f172a' : '#06201b',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'background-color 0.3s ease',
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: selectedRole === 'admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: selectedRole === 'admin' ? '#818cf8' : '#34d399',
                border: selectedRole === 'admin' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                marginBottom: '1.25rem',
              }}>
                {selectedRole === 'admin' ? <ShieldCheck size={14} /> : <Code2 size={14} />}
                {selectedRole === 'admin' ? 'Administrator Workspace' : 'Developer Workspace'}
              </div>

              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '0.75rem' }}>
                {selectedRole === 'admin' ? 'Centralized API Control' : 'Instant API Integration'}
              </h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                {selectedRole === 'admin'
                  ? 'Register APIs, issue cryptographic keys, enforce strict rate limits, observe real-time health checks, and monitor request analytics.'
                  : 'Access authorized APIs, securely retrieve your scoped keys, test endpoints with the interactive API Tester, and track your request history.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {selectedRole === 'admin' ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} color="#6366f1" /> API registration, lifecycle & health monitoring
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} color="#6366f1" /> Cryptographic API key provisioning & revocation
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} color="#6366f1" /> Rate limiting enforcement with HTTP 429 triggers
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} color="#6366f1" /> 7-day traffic, status distribution & latency graphs
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Browse accessible and authorized APIs
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Generate and manage personal API keys
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Live Interactive API Tester with status & latency
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} color="#10b981" /> Personal request logs and developer analytics
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Need the other workspace?
              </span>
              <button
                onClick={() => switchRole(selectedRole === 'admin' ? 'developer' : 'admin')}
                style={{
                  background: 'none',
                  color: selectedRole === 'admin' ? '#34d399' : '#818cf8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                Switch to {selectedRole === 'admin' ? 'Developer' : 'Admin'} Login <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Authentication Form */}
          <div style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                  {isRegistering
                    ? `Create ${selectedRole === 'admin' ? 'Admin' : 'Developer'} Account`
                    : `${selectedRole === 'admin' ? 'Admin' : 'Developer'} Login`}
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isRegistering
                  ? 'Register your account to access the API Manager platform.'
                  : 'Enter your account credentials to access your dashboard.'}
              </p>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}>
                <AlertCircle size={16} flexShrink={0} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isRegistering && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                  background: selectedRole === 'admin'
                    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                    : 'linear-gradient(135deg, #059669, #10b981)',
                }}
              >
                {submitting
                  ? 'Processing...'
                  : isRegistering
                  ? `Register as ${selectedRole === 'admin' ? 'Admin' : 'Developer'}`
                  : `Sign In to ${selectedRole === 'admin' ? 'Admin' : 'Developer'} Portal`}
              </button>
            </form>

            <div style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}>
              {isRegistering ? (
                <>
                  Already registered?{' '}
                  <button
                    onClick={() => { setIsRegistering(false); setError(''); }}
                    style={{ background: 'none', color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Need an account?{' '}
                  <button
                    onClick={() => { setIsRegistering(true); setError(''); }}
                    style={{ background: 'none', color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Register New Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '1.25rem 2.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}>
        API Manager — Full-Stack API Management Platform
      </footer>
    </div>
  );
}
