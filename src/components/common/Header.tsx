import React from 'react';
import { useTranslation } from '../../localization/LanguageContext';
import { voice } from '../../services/voice';
import { Volume2, VolumeX, Globe, Settings as SettingsIcon } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  voiceActive: boolean;
  onToggleVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  voiceActive,
  onToggleVoice
}) => {
  const { language, setLanguage, t } = useTranslation();

  const handleLanguageToggle = () => {
    const next = language === 'en' ? 'hi' : 'en';
    setLanguage(next);
    if (voiceActive) {
      voice.speak(next === 'hi' ? 'हिन्दी भाषा चुनी गई है' : 'English language selected', next);
    }
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v8"></path>
            <path d="m4.93 10.93 1.41 1.41"></path>
            <path d="M2 18h2"></path>
            <path d="M20 18h2"></path>
            <path d="m19.07 10.93-1.41 1.41"></path>
            <path d="M22 22H2"></path>
            <path d="m8 22 4-10 4 10"></path>
          </svg>
        </div>
        <div>
          <h1 className="brand-title">{t.brandName}</h1>
          <p className="brand-subtitle">{t.tagline}</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Language switch */}
        <button 
          className="icon-btn" 
          onClick={handleLanguageToggle}
          title={language === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English'}
          style={{ fontSize: '0.8rem', fontWeight: 600, padding: '6px 9px', display: 'flex', gap: '4px' }}
          aria-label="Toggle language"
        >
          <Globe size={15} />
          {language === 'en' ? 'हिन्दी' : 'EN'}
        </button>

        {/* Voice toggle */}
        <button 
          className="icon-btn" 
          onClick={onToggleVoice}
          title={voiceActive ? t.voiceOff : t.voiceOn}
          style={{ color: voiceActive ? '#15803d' : '#6b7280' }}
          aria-label={voiceActive ? 'Mute voice instructions' : 'Enable voice instructions'}
        >
          {voiceActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Settings button */}
        <button 
          className="icon-btn" 
          onClick={onOpenSettings}
          title={t.navSettings}
          aria-label="Open settings and profile"
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};
