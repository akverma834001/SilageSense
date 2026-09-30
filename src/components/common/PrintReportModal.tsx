import React from 'react';
import { TestSession } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Printer, Download, X } from 'lucide-react';

interface PrintReportModalProps {
  session: TestSession;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ session, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SilageSense_${session.testId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="modal-sheet" style={{ maxWidth: '540px', maxHeight: '92vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <div>
            <h2 id="report-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
              Screening Inspection Report
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Report ID: {session.testId}
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Certificate Content */}
        <div id="printable-certificate" style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: '#ffffff' }}>
          {/* Brand header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '10px', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.02em' }}>
              SILAGESENSE
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Rapid Feed & Silage Quality Screening Platform
            </p>
          </div>

          {/* Test Meta Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', marginBottom: '14px', backgroundColor: 'var(--bg-app)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <div><strong>Sample ID:</strong> {session.sampleId}</div>
            <div><strong>Date/Time:</strong> {new Date(session.timestamp).toLocaleString()}</div>
            <div><strong>Sample Type:</strong> {session.sampleType} ({session.subType.replace('_', ' ')})</div>
            <div><strong>Farm:</strong> {session.farmName}</div>
            <div><strong>Operator:</strong> {session.operatorName}</div>
            <div><strong>Device ID:</strong> {session.deviceId}</div>
          </div>

          {/* Result Badge */}
          <div style={{ marginBottom: '14px', textAlign: 'center' }}>
            <StatusBadge category={session.category} customText={session.categoryHeadline} size="lg" />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '8px', fontWeight: 500 }}>
              {session.summaryMessage}
            </p>
          </div>

          {/* Measurements */}
          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px', marginBottom: '6px' }}>
              Measured Parameters
            </h4>
            <div style={{ fontSize: '0.85rem' }}>
              {session.sensorReadings && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>pH Value:</span>
                    <strong>{session.sensorReadings.pH.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>Moisture Estimate:</span>
                    <strong>{session.sensorReadings.moistureEstimate.toFixed(1)}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>Sample Temperature:</span>
                    <strong>{session.sensorReadings.sampleTemp.toFixed(1)}°C (Ambient: {session.sensorReadings.ambientTemp.toFixed(1)}°C)</strong>
                  </div>
                </>
              )}
              {session.visualAnalysis && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Visible Surface Mould:</span>
                  <strong>{session.visualAnalysis.moldDetected ? 'Detected' : 'Not detected'}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ marginBottom: '14px', backgroundColor: '#fcfdfa', border: '1px solid var(--border-light)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
              Feeding Recommendation:
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
              {session.recommendation}
            </p>
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontStyle: 'italic', textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
            * This document is an on-farm rapid screening assessment and is not a certified laboratory certificate. Confirm with accredited laboratory testing when required.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={handlePrint} style={{ flex: 1 }}>
            <Printer size={18} />
            <span>Print Report</span>
          </button>
          <button className="btn-secondary" onClick={handleDownloadJSON} style={{ flex: 1 }}>
            <Download size={18} />
            <span>JSON Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
