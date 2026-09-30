import React from 'react';
import { ValueConflict } from '../../types';
import { useTranslation } from '../../localization/LanguageContext';
import { AlertCircle, Cpu, User } from 'lucide-react';

interface ConflictModalProps {
  conflicts: ValueConflict[];
  onResolve: (resolutions: Record<string, { choice: 'DEVICE' | 'MANUAL' }>) => void;
  onRetest: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  conflicts,
  onResolve,
  onRetest
}) => {
  const { t } = useTranslation();
  const [choices, setChoices] = React.useState<Record<string, 'DEVICE' | 'MANUAL'>>(() => {
    const init: Record<string, 'DEVICE' | 'MANUAL'> = {};
    conflicts.forEach(c => {
      init[c.parameter] = 'DEVICE';
    });
    return init;
  });

  if (conflicts.length === 0) return null;

  const handleSelect = (param: string, choice: 'DEVICE' | 'MANUAL') => {
    setChoices(prev => ({ ...prev, [param]: choice }));
  };

  const handleConfirm = () => {
    const result: Record<string, { choice: 'DEVICE' | 'MANUAL' }> = {};
    Object.entries(choices).forEach(([k, v]) => {
      result[k] = { choice: v };
    });
    onResolve(result);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="conflict-title">
      <div className="modal-sheet">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b45309' }}>
          <AlertCircle size={28} />
          <div>
            <h2 id="conflict-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {t.conflictTitle}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t.conflictSubtitle}
            </p>
          </div>
        </div>

        {conflicts.map(c => {
          const currentChoice = choices[c.parameter] || 'DEVICE';
          return (
            <div key={c.parameter} style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--primary)' }}>
                {c.parameter}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleSelect(c.parameter, 'DEVICE')}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: currentChoice === 'DEVICE' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    backgroundColor: currentChoice === 'DEVICE' ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Cpu size={14} />
                    <span>{t.deviceReadingLabel}</span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {c.deviceValue.toFixed(1)} {c.unit}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect(c.parameter, 'MANUAL')}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: currentChoice === 'MANUAL' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    backgroundColor: currentChoice === 'MANUAL' ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <User size={14} />
                    <span>{t.manualReadingLabel}</span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {c.manualValue.toFixed(1)} {c.unit}
                  </div>
                </button>
              </div>
            </div>
          );
        })}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <button className="btn-primary" onClick={handleConfirm}>
            Continue with Selected Readings
          </button>
          <button className="btn-secondary" onClick={onRetest}>
            {t.retestBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
