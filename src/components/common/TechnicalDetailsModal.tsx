import React from 'react';
import { TestSession } from '../../types';
import { X, Layers, Activity, FileCheck, Binary } from 'lucide-react';

interface TechnicalDetailsModalProps {
  session: TestSession;
  onClose: () => void;
}

export const TechnicalDetailsModal: React.FC<TechnicalDetailsModalProps> = ({ session, onClose }) => {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="tech-title">
      <div className="modal-sheet" style={{ maxHeight: '90vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Binary size={22} style={{ color: 'var(--primary)' }} />
            <h2 id="tech-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
              Expert Technical Telemetry
            </h2>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section 1: Model & Calibration Versions */}
        <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--primary)', marginBottom: '6px' }}>
            <Layers size={15} />
            <span>Model & Calibration Provenance</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: 'var(--text-muted)' }}>
            <div>Vision Edge Model: <strong style={{ color: 'var(--text-main)' }}>{session.modelVersions.visionModel}</strong></div>
            <div>Spectral NIR Model: <strong style={{ color: 'var(--text-main)' }}>{session.modelVersions.spectralModel}</strong></div>
            <div>Rules Engine: <strong style={{ color: 'var(--text-main)' }}>{session.modelVersions.decisionEngine}</strong></div>
            <div>Calibration Tag: <strong style={{ color: 'var(--text-main)' }}>{session.calibrationVersion}</strong></div>
          </div>
        </div>

        {/* Section 2: Spectral Curve Visualization if available */}
        {session.spectralAnalysis?.spectrumCurve && session.spectralAnalysis.spectrumCurve.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
              <Activity size={15} />
              <span>Multi-Band Optical Reflectance (450nm - 950nm)</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <svg viewBox="0 0 320 80" style={{ width: '100%', height: '80px', overflow: 'visible' }}>
                <polyline
                  fill="none"
                  stroke="#1b7a43"
                  strokeWidth="2.5"
                  points={session.spectralAnalysis.spectrumCurve
                    .map((val, idx) => `${idx * 45 + 10},${70 - val * 65}`)
                    .join(' ')}
                />
                {session.spectralAnalysis.spectrumCurve.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={idx * 45 + 10}
                    cy={70 - val * 65}
                    r="3.5"
                    fill="#15803d"
                  />
                ))}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>450nm</span>
                <span>550nm</span>
                <span>650nm</span>
                <span>750nm</span>
                <span>850nm</span>
                <span>950nm</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Data Provenance Table */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
            <FileCheck size={15} />
            <span>Traceable Data Provenance Log</span>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-strong)' }}>
                <tr>
                  <th style={{ padding: '6px 8px' }}>Parameter</th>
                  <th style={{ padding: '6px 8px' }}>Value</th>
                  <th style={{ padding: '6px 8px' }}>Source</th>
                  <th style={{ padding: '6px 8px' }}>Entered By</th>
                  <th style={{ padding: '6px 8px' }}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {session.provenanceList.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{p.parameter}</td>
                    <td style={{ padding: '6px 8px' }}>{String(p.value)} {p.unit || ''}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{ 
                        padding: '2px 5px', 
                        borderRadius: '4px', 
                        backgroundColor: p.source === 'DEVICE' ? '#dcfce7' : p.source === 'USER' ? '#fef3c7' : '#e0e7ff',
                        color: p.source === 'DEVICE' ? '#166534' : p.source === 'USER' ? '#92400e' : '#3730a3',
                        fontWeight: 600,
                        fontSize: '0.68rem'
                      }}>
                        {p.source}
                      </span>
                    </td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{p.entered_by}</td>
                    <td style={{ padding: '6px 8px' }}>{p.confidence || 'HIGH'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button className="btn-secondary" onClick={onClose} style={{ marginTop: '6px' }}>
          Close Telemetry
        </button>
      </div>
    </div>
  );
};
