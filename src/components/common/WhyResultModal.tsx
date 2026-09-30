import React from 'react';
import { useTranslation } from '../../localization/LanguageContext';
import { HelpCircle, Check, X } from 'lucide-react';

interface WhyResultModalProps {
  reasons: string[];
  warnings: string[];
  onClose: () => void;
}

export const WhyResultModal: React.FC<WhyResultModalProps> = ({
  reasons,
  warnings,
  onClose
}) => {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="why-title">
      <div className="modal-sheet">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={22} style={{ color: 'var(--primary)' }} />
            <h2 id="why-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
              {t.whyResultBtn}
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

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          This assessment was mainly influenced by the following physical and sensor benchmarks:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reasons.map((reason, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '10px', 
                backgroundColor: 'var(--bg-app)', 
                padding: '10px 12px', 
                borderRadius: 'var(--radius-md)' 
              }}
            >
              <span style={{ color: '#15803d', marginTop: '2px' }}>
                <Check size={16} />
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {reason}
              </p>
            </div>
          ))}
        </div>

        {warnings.length > 0 && (
          <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#b91c1c', marginBottom: '8px' }}>
              Flagged Warnings:
            </h3>
            {warnings.map((w, idx) => (
              <p key={idx} style={{ fontSize: '0.85rem', color: '#991b1b', marginBottom: '4px' }}>
                • {w}
              </p>
            ))}
          </div>
        )}

        <button className="btn-primary" onClick={onClose} style={{ marginTop: '12px' }}>
          Understood
        </button>
      </div>
    </div>
  );
};
