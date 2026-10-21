import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Layers,
  Play,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
  Gauge,
  CheckCircle,
} from 'lucide-react';

export default function AvailableApisPage({ onTestApi }) {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchApis = async () => {
    try {
      const res = await apiService.getApis();
      setApis(res.apis || []);
    } catch (err) {
      console.error('Failed to load available APIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApis();
  }, []);

  const filteredApis = apis.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.endpoint.toLowerCase().includes(search.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Available APIs</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Discover and explore live APIs available for your development and integration.
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '360px' }}>
        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Filter APIs by name or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '2.2rem' }}
        />
      </div>

      {/* APIs Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading available APIs...
        </div>
      ) : apis.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Layers size={48} />
            <div className="empty-state-title">No APIs Currently Available</div>
            <div className="empty-state-desc">
              Your organization administrators have not published any active APIs yet. Please check back later.
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}>
          {filteredApis.map((api) => (
            <div
              key={api._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className={`badge-method method-${api.method.toLowerCase()}`}>
                    {api.method}
                  </span>
                  <span className={`badge ${api.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {api.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                  {api.name}
                </h3>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem', minHeight: '38px' }}>
                  {api.description || 'Standard REST endpoint managed by API Manager.'}
                </p>

                <div className="code-box" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
                  {api.endpoint}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  marginBottom: '1.25rem',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Rate Limit</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{api.rateLimit} req/{api.rateLimitWindow || 60}s</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Avg Latency</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{api.avgResponseTime || 0} ms</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onTestApi(api)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Play size={14} /> Test in API Tester
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
