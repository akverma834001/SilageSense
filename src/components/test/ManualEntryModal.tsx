import React, { useState } from 'react';
import { ManualInputRecord, SampleType, SubSampleType } from '../../types';
import { useTranslation } from '../../localization/LanguageContext';
import { ClipboardEdit, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ManualEntryModalProps {
  sampleType: SampleType;
  subType: SubSampleType;
  initialData?: ManualInputRecord;
  onSave: (data: ManualInputRecord) => void;
  onSkip: () => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  sampleType,
  subType,
  initialData,
  onSave,
  onSkip
}) => {
  const { t } = useTranslation();

  // Known measurements (string state to differentiate empty vs 0)
  const [phVal, setPhVal] = useState<string>(initialData?.knownMeasurements?.pH?.toString() || '');
  const [moistureVal, setMoistureVal] = useState<string>(initialData?.knownMeasurements?.moisture?.toString() || '');
  const [tempVal, setTempVal] = useState<string>(initialData?.knownMeasurements?.temperature?.toString() || '');

  // Physical observations
  const [smell, setSmell] = useState<'SWEET_ACIDIC' | 'VINEGAR' | 'PUNGENT_BUTYRIC' | 'MUSTY_MOLD' | 'NORMAL'>(
    initialData?.observations?.smell || 'NORMAL'
  );
  const [visibleMold, setVisibleMold] = useState<boolean>(initialData?.observations?.visibleMold || false);
  const [excessiveHeat, setExcessiveHeat] = useState<boolean>(initialData?.observations?.excessiveHeat || false);

  // Advanced / Lab values expandable section
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [storageMethod, setStorageMethod] = useState<'BUNKER' | 'PIT' | 'SILO_BAG' | 'BALED' | 'BAG_DRY'>(
    initialData?.storageMethod || 'BUNKER'
  );
  const [labAflatoxin, setLabAflatoxin] = useState<string>(
    initialData?.labValues?.labAflatoxinB1Ppb?.toString() || ''
  );
  const [labName, setLabName] = useState<string>(initialData?.labValues?.labName || '');

  const handleSave = () => {
    const record: ManualInputRecord = {
      sampleType,
      subType,
      storageMethod,
      observations: {
        smell,
        visibleMold,
        excessiveHeat
      },
      knownMeasurements: {
        pH: phVal.trim() !== '' ? parseFloat(phVal) : undefined,
        moisture: moistureVal.trim() !== '' ? parseFloat(moistureVal) : undefined,
        temperature: tempVal.trim() !== '' ? parseFloat(tempVal) : undefined
      },
      labValues: labAflatoxin.trim() !== '' ? {
        labAflatoxinB1Ppb: parseFloat(labAflatoxin),
        labName: labName || 'Local Dairy Lab',
        labDate: new Date().toISOString()
      } : undefined
    };

    onSave(record);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="manual-entry-title">
      <div className="modal-sheet" style={{ maxHeight: '88vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardEdit size={22} style={{ color: 'var(--primary)' }} />
            <h2 id="manual-entry-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
              {t.addInfoTitle}
            </h2>
          </div>
          <button 
            onClick={onSkip} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {t.addInfoSubtitle}
        </p>

        {/* Primary Known Measurements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label htmlFor="manual-ph" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              {t.phLabel} (e.g. 4.2)
            </label>
            <input
              id="manual-ph"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={phVal}
              onChange={e => setPhVal(e.target.value)}
              placeholder="e.g. 4.2 (or leave empty)"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label htmlFor="manual-moisture" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              {t.moistureLabel} (e.g. 63%)
            </label>
            <input
              id="manual-moisture"
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={moistureVal}
              onChange={e => setMoistureVal(e.target.value)}
              placeholder="e.g. 62% (or leave empty)"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label htmlFor="manual-temp" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              {t.tempLabel} (e.g. 26°C)
            </label>
            <input
              id="manual-temp"
              type="number"
              step="0.5"
              value={tempVal}
              onChange={e => setTempVal(e.target.value)}
              placeholder="e.g. 25°C (or leave empty)"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        {/* Physical Observations */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>
            Physical Observations
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <label htmlFor="smell-select" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                {t.smellObservationLabel}
              </label>
              <select
                id="smell-select"
                value={smell}
                onChange={e => setSmell(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="NORMAL">Normal pleasant aroma</option>
                <option value="SWEET_ACIDIC">Sweet-acidic / lactic fermentation (Ideal)</option>
                <option value="VINEGAR">Vinegar / sharp acetic smell</option>
                <option value="PUNGENT_BUTYRIC">Pungent rancid butter / butyric smell (Spoiled)</option>
                <option value="MUSTY_MOLD">Musty / moldy smell</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={visibleMold}
                  onChange={e => setVisibleMold(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>Visible mold present</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={excessiveHeat}
                  onChange={e => setExcessiveHeat(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>Hot to touch (Heating)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Expandable Laboratory / Storage Info */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 0'
            }}
          >
            <span>{showAdvanced ? 'Hide Laboratory & Storage details' : '+ Add Storage or Laboratory Test Data'}</span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <div>
                <label htmlFor="storage-method-select" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                  {t.storageMethodLabel}
                </label>
                <select
                  id="storage-method-select"
                  value={storageMethod}
                  onChange={e => setStorageMethod(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="BUNKER">Bunker Silo</option>
                  <option value="PIT">Earthen Trench / Pit</option>
                  <option value="SILO_BAG">Silo Bag</option>
                  <option value="BALED">Wrapped Bales</option>
                  <option value="BAG_DRY">Dry Feed Sacks / Godown</option>
                </select>
              </div>

              <div>
                <label htmlFor="lab-toxin" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                  Laboratory Aflatoxin B1 Test Result (ppb)
                </label>
                <input
                  id="lab-toxin"
                  type="number"
                  value={labAflatoxin}
                  onChange={e => setLabAflatoxin(e.target.value)}
                  placeholder="e.g. 15 (Regulatory limit is 20 ppb)"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label htmlFor="lab-name" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                  Testing Laboratory Name
                </label>
                <input
                  id="lab-name"
                  type="text"
                  value={labName}
                  onChange={e => setLabName(e.target.value)}
                  placeholder="e.g. NDDB / State Agri University Lab"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <button className="btn-primary" onClick={handleSave}>
            {t.saveManualBtn}
          </button>
          <button className="btn-subtle" onClick={onSkip}>
            {t.skipBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
