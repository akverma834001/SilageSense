import React, { useState } from 'react';
import { UserSettings } from '../../types';
import { storage } from '../../services/storage';
import { useTranslation } from '../../localization/LanguageContext';
import { voice } from '../../services/voice';
import { User, Globe, Thermometer, Binary, Volume2, CloudUpload, RotateCcw, Check } from 'lucide-react';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (patch: Partial<UserSettings>) => void;
  onResetSeed: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetSeed
}) => {
  const { language, setLanguage, t } = useTranslation();
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const pendingCount = storage.getSyncQueue().length;

  const handleLanguageChange = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    onUpdateSettings({ language: lang });
    voice.speak(lang === 'hi' ? 'भाषा हिन्दी सेट की गई है' : 'Language set to English', lang);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncSuccessMsg(null);
    const count = await storage.syncQueueNow();
    setSyncing(false);
    setSyncSuccessMsg(`Synced ${count} offline records to dairy cooperative cloud server.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)' }}>
          {t.settingsTitle}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Farmer profile, unit preferences, language, and offline sync
        </p>
      </div>

      {/* Farm & Operator Profile */}
      <div className="indicators-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <User size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
            {t.farmProfileHeader}
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label htmlFor="farm-name-input" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              {t.farmNameLabel}
            </label>
            <input
              id="farm-name-input"
              type="text"
              value={settings.farmName}
              onChange={e => onUpdateSettings({ farmName: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label htmlFor="operator-name-input" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
              {t.operatorNameLabel}
            </label>
            <input
              id="operator-name-input"
              type="text"
              value={settings.operatorName}
              onChange={e => onUpdateSettings({ operatorName: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Preferences (Language, Units, Voice, Mode) */}
      <div className="indicators-card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
          App Preferences
        </h3>

        {/* Language Selection */}
        <div className="indicator-row">
          <span className="indicator-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={16} />
            <span>{t.languageSettingLabel}</span>
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                border: language === 'en' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                backgroundColor: language === 'en' ? 'var(--primary-light)' : '#ffffff',
                fontWeight: language === 'en' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hi')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                border: language === 'hi' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                backgroundColor: language === 'hi' ? 'var(--primary-light)' : '#ffffff',
                fontWeight: language === 'hi' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Temperature Units */}
        <div className="indicator-row">
          <span className="indicator-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Thermometer size={16} />
            <span>{t.unitsSettingLabel}</span>
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => onUpdateSettings({ preferredTempUnit: 'C' })}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                border: settings.preferredTempUnit === 'C' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                backgroundColor: settings.preferredTempUnit === 'C' ? 'var(--primary-light)' : '#ffffff',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ preferredTempUnit: 'F' })}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-md)',
                border: settings.preferredTempUnit === 'F' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                backgroundColor: settings.preferredTempUnit === 'F' ? 'var(--primary-light)' : '#ffffff',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              °F
            </button>
          </div>
        </div>

        {/* Voice Audio Assistance Toggle */}
        <div className="indicator-row">
          <span className="indicator-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={16} />
            <span>{t.voiceAssistanceLabel}</span>
          </span>
          <input
            type="checkbox"
            checked={settings.voiceAssistanceEnabled}
            onChange={e => {
              const val = e.target.checked;
              voice.setEnabled(val);
              onUpdateSettings({ voiceAssistanceEnabled: val });
            }}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>

        {/* Expert Mode Toggle */}
        <div className="indicator-row">
          <span className="indicator-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Binary size={16} />
            <span>{t.expertModeLabel}</span>
          </span>
          <input
            type="checkbox"
            checked={settings.expertMode}
            onChange={e => onUpdateSettings({ expertMode: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Offline Sync Card */}
      <div className="indicators-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <CloudUpload size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
            {t.offlineSyncHeader}
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
          {pendingCount} {t.pendingSyncCount}. All test screenings work 100% offline in field sheds.
        </p>

        <button 
          className="btn-secondary" 
          onClick={handleSyncNow} 
          disabled={syncing || pendingCount === 0}
          style={{ width: '100%' }}
        >
          <span>{syncing ? 'Syncing…' : t.syncNowBtn}</span>
        </button>

        {syncSuccessMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#166534', marginTop: '8px', backgroundColor: '#dcfce7', padding: '6px 10px', borderRadius: '4px' }}>
            <Check size={14} />
            <span>{syncSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Reset Data */}
      <button 
        type="button" 
        className="btn-subtle" 
        onClick={onResetSeed}
        style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
      >
        <RotateCcw size={15} />
        <span>{t.resetDataBtn}</span>
      </button>
    </div>
  );
};
