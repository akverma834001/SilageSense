import React, { useState } from 'react';
import { TestSession, SampleType } from '../../types';
import { useTranslation } from '../../localization/LanguageContext';
import { StatusBadge } from '../common/StatusBadge';
import { PrintReportModal } from '../common/PrintReportModal';
import { TechnicalDetailsModal } from '../common/TechnicalDetailsModal';
import { ChevronRight, Filter, FileText, Binary, TrendingUp, Calendar } from 'lucide-react';

interface HistoryScreenProps {
  sessions: TestSession[];
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ sessions }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'ALL' | 'SILAGE' | 'FEED'>('ALL');
  const [selectedSession, setSelectedSession] = useState<TestSession | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showTechModal, setShowTechModal] = useState<boolean>(false);

  const filteredSessions = sessions.filter(s => {
    if (filter === 'SILAGE') return s.sampleType === 'SILAGE';
    if (filter === 'FEED') return s.sampleType === 'FEED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)' }}>
          {t.historyTitle}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Complete offline test records with full parameter traceability
        </p>
      </div>

      {/* Simple Trend Highlight */}
      <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px 14px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <TrendingUp size={22} style={{ color: 'var(--primary)' }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--primary)', lineHeight: 1.35 }}>
          <strong>Silage Fermentation Stability:</strong> pH has remained stable between 4.12 and 4.18 across the last 3 bunker face samples.
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: filter === 'ALL' ? 700 : 500,
            color: filter === 'ALL' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: filter === 'ALL' ? '2px solid var(--primary)' : 'none',
            cursor: 'pointer'
          }}
        >
          {t.filterAll} ({sessions.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('SILAGE')}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: filter === 'SILAGE' ? 700 : 500,
            color: filter === 'SILAGE' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: filter === 'SILAGE' ? '2px solid var(--primary)' : 'none',
            cursor: 'pointer'
          }}
        >
          {t.filterSilage}
        </button>

        <button
          type="button"
          onClick={() => setFilter('FEED')}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: filter === 'FEED' ? 700 : 500,
            color: filter === 'FEED' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: filter === 'FEED' ? '2px solid var(--primary)' : 'none',
            cursor: 'pointer'
          }}
        >
          {t.filterFeed}
        </button>
      </div>

      {/* Test List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredSessions.length === 0 ? (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
            {t.noHistoryMatch}
          </p>
        ) : (
          filteredSessions.map(session => {
            const dateObj = new Date(session.timestamp);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={session.testId}
                className="recent-item"
                style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px', cursor: 'pointer' }}
                onClick={() => setSelectedSession(session)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                      {session.sampleType === 'SILAGE' ? t.silageTitle : t.feedTitle}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      {session.sampleId}
                    </span>
                  </div>

                  <StatusBadge category={session.category} customText={session.category === 'GREEN' ? 'Normal' : session.category === 'YELLOW' ? 'Review' : 'Lab Required'} size="sm" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                  <span>{dateStr} • {timeStr}</span>
                  {session.sensorReadings && (
                    <span>pH: {session.sensorReadings.pH.toFixed(1)} | {session.sensorReadings.moistureEstimate.toFixed(0)}% Moisture</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Test Detail Modal */}
      {selectedSession && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-sheet" style={{ maxHeight: '88vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(selectedSession.timestamp).toLocaleString()}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {selectedSession.sampleType === 'SILAGE' ? t.silageTitle : t.feedTitle} Assessment
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSession(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: '4px' }}>
              <StatusBadge category={selectedSession.category} customText={selectedSession.categoryHeadline} size="md" />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '8px' }}>
                {selectedSession.summaryMessage}
              </p>
            </div>

            {/* Key Indicators */}
            {selectedSession.sensorReadings && (
              <div className="indicators-card" style={{ margin: '8px 0' }}>
                <div className="indicator-row">
                  <span className="indicator-name">pH Reading:</span>
                  <span className="indicator-val">{selectedSession.sensorReadings.pH.toFixed(2)}</span>
                </div>
                <div className="indicator-row">
                  <span className="indicator-name">Moisture Estimate:</span>
                  <span className="indicator-val">{selectedSession.sensorReadings.moistureEstimate.toFixed(1)}%</span>
                </div>
                <div className="indicator-row">
                  <span className="indicator-name">Sample Temperature:</span>
                  <span className="indicator-val">{selectedSession.sensorReadings.sampleTemp.toFixed(1)}°C</span>
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                {t.recommendationHeader}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {selectedSession.recommendation}
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setShowPrintModal(true)}>
                <FileText size={16} />
                <span>Inspection Report</span>
              </button>
              <button className="btn-secondary" onClick={() => setShowTechModal(true)}>
                <Binary size={16} />
                <span>Telemetry</span>
              </button>
            </div>

            <button className="btn-primary" onClick={() => setSelectedSession(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showPrintModal && selectedSession && (
        <PrintReportModal session={selectedSession} onClose={() => setShowPrintModal(false)} />
      )}

      {showTechModal && selectedSession && (
        <TechnicalDetailsModal session={selectedSession} onClose={() => setShowTechModal(false)} />
      )}
    </div>
  );
};
