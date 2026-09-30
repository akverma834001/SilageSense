import React from 'react';
import { useTranslation } from '../../localization/LanguageContext';
import { TestSession, SampleType } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ChevronRight, ArrowRight, Play, Sparkles } from 'lucide-react';

interface HomeScreenProps {
  recentTests: TestSession[];
  onStartTest: (sampleType: SampleType, scenarioOverride?: string) => void;
  onViewAllTests: () => void;
  onOpenTestDetail: (test: TestSession) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  recentTests,
  onStartTest,
  onViewAllTests,
  onOpenTestDetail
}) => {
  const { t } = useTranslation();

  // Determine dynamic greeting
  const hour = new Date().getHours();
  let greeting = t.greetingMorning;
  if (hour >= 12 && hour < 17) greeting = t.greetingAfternoon;
  else if (hour >= 17) greeting = t.greetingEvening;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Greeting & Headline */}
      <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {greeting}, Ramesh
        </span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
          {t.questionWhatToTest}
        </h2>
      </div>

      {/* 1-Click Evaluation Scenarios Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <Sparkles size={14} style={{ color: '#b45309' }} />
          <span>{t.demoScenariosTitle}</span>
        </div>
        <div className="scenario-strip">
          <button className="scenario-chip" onClick={() => onStartTest('SILAGE', 'NORMAL')}>
            <Play size={11} fill="currentColor" />
            <span>{t.scenarioNormalSilage}</span>
          </button>
          <button className="scenario-chip" onClick={() => onStartTest('SILAGE', 'REVIEW')}>
            <Play size={11} fill="currentColor" />
            <span>{t.scenarioReviewRequired}</span>
          </button>
          <button className="scenario-chip" onClick={() => onStartTest('SILAGE', 'POOR_IMAGE')}>
            <Play size={11} fill="currentColor" />
            <span>{t.scenarioPoorImage}</span>
          </button>
          <button className="scenario-chip" onClick={() => onStartTest('SILAGE', 'OOD')}>
            <Play size={11} fill="currentColor" />
            <span>{t.scenarioUnknownOOD}</span>
          </button>
          <button className="scenario-chip" onClick={() => onStartTest('SILAGE', 'MANUAL_ONLY')}>
            <Play size={11} fill="currentColor" />
            <span>{t.scenarioManualOnly}</span>
          </button>
        </div>
      </div>

      {/* Primary Option 1: SILAGE */}
      <div className="test-card">
        <div className="test-card-img-wrapper">
          <img 
            src="/assets/silage_sample.jpg" 
            alt="Corn silage sample on farm testing bench" 
            className="test-card-img" 
          />
        </div>
        <div className="test-card-body">
          <h3 className="test-card-title">{t.silageTitle}</h3>
          <p className="test-card-desc">{t.silageSubtitle}</p>
          <button 
            className="btn-primary" 
            onClick={() => onStartTest('SILAGE')}
            id="start-silage-test-btn"
          >
            <span>{t.startTestBtn}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Primary Option 2: CATTLE FEED */}
      <div className="test-card">
        <div className="test-card-img-wrapper">
          <img 
            src="/assets/feed_pellets.jpg" 
            alt="Cattle feed pellets in metal scoop" 
            className="test-card-img" 
          />
        </div>
        <div className="test-card-body">
          <h3 className="test-card-title">{t.feedTitle}</h3>
          <p className="test-card-desc">{t.feedSubtitle}</p>
          <button 
            className="btn-primary" 
            onClick={() => onStartTest('FEED')}
            id="start-feed-test-btn"
          >
            <span>{t.startTestBtn}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Recent Tests Section */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
            {t.recentTestsHeader}
          </h3>
          <button 
            onClick={onViewAllTests}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontWeight: 600, 
              fontSize: '0.82rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>{t.viewAllTestsBtn}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {recentTests.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            {t.noRecentTests}
          </p>
        ) : (
          recentTests.slice(0, 3).map(test => {
            const timeStr = new Date(test.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div 
                key={test.testId} 
                className="recent-item" 
                onClick={() => onOpenTestDetail(test)}
                role="button"
                tabIndex={0}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    {test.sampleType === 'SILAGE' ? t.silageTitle : t.feedTitle}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {timeStr} • {test.sampleId}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge category={test.category} customText={test.category === 'GREEN' ? 'Normal' : test.category === 'YELLOW' ? 'Review' : 'Lab Required'} size="sm" />
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
