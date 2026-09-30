import React from 'react';
import { useTranslation } from '../../localization/LanguageContext';
import { Home, TestTube2, History, Cpu, BookOpen } from 'lucide-react';

export type TabKey = 'home' | 'test' | 'history' | 'device' | 'learn' | 'settings';

interface BottomNavProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      <button 
        className={`nav-item ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
        aria-label={t.navHome}
      >
        <Home size={20} />
        <span>{t.navHome}</span>
      </button>

      <button 
        className={`nav-item ${currentTab === 'test' ? 'active' : ''}`}
        onClick={() => onSelectTab('test')}
        aria-label={t.navTest}
      >
        <TestTube2 size={20} />
        <span>{t.navTest}</span>
      </button>

      <button 
        className={`nav-item ${currentTab === 'history' ? 'active' : ''}`}
        onClick={() => onSelectTab('history')}
        aria-label={t.navHistory}
      >
        <History size={20} />
        <span>{t.navHistory}</span>
      </button>

      <button 
        className={`nav-item ${currentTab === 'device' ? 'active' : ''}`}
        onClick={() => onSelectTab('device')}
        aria-label={t.navDevice}
      >
        <Cpu size={20} />
        <span>{t.navDevice}</span>
      </button>

      <button 
        className={`nav-item ${currentTab === 'learn' ? 'active' : ''}`}
        onClick={() => onSelectTab('learn')}
        aria-label={t.navLearn}
      >
        <BookOpen size={20} />
        <span>{t.navLearn}</span>
      </button>
    </nav>
  );
};
