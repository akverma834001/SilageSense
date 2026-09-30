import React, { useState, useEffect } from 'react';
import { LanguageProvider, useTranslation } from './localization/LanguageContext';
import { voice } from './services/voice';
import { storage } from './services/storage';
import { deviceSimulator } from './services/deviceSimulator';
import { TestSession, SampleType, UserSettings, DeviceTelemetry } from './types';
import { HardwareBanner } from './components/common/HardwareBanner';
import { Header } from './components/common/Header';
import { BottomNav, TabKey } from './components/common/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { TestWorkflow } from './components/test/TestWorkflow';
import { HistoryScreen } from './components/history/HistoryScreen';
import { DeviceScreen } from './components/device/DeviceScreen';
import { LearnScreen } from './components/learn/LearnScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';

const MainApp: React.FC = () => {
  const { language } = useTranslation();
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [settings, setSettings] = useState<UserSettings>(() => storage.getUserSettings());
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>(() => deviceSimulator.getTelemetry());
  const [testSessions, setTestSessions] = useState<TestSession[]>(() => storage.getTestSessions());
  const [voiceActive, setVoiceActive] = useState<boolean>(() => voice.isEnabled());

  // Active testing state
  const [activeTestSampleType, setActiveTestSampleType] = useState<SampleType | null>(null);
  const [activeScenarioOverride, setActiveScenarioOverride] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsub = deviceSimulator.subscribe(data => setTelemetry(data));
    return unsub;
  }, []);

  const handleStartTest = (sampleType: SampleType, scenarioOverride?: string) => {
    setActiveTestSampleType(sampleType);
    setActiveScenarioOverride(scenarioOverride);
    setCurrentTab('test');
  };

  const handleCancelTest = () => {
    setActiveTestSampleType(null);
    setActiveScenarioOverride(undefined);
    setCurrentTab('home');
    deviceSimulator.resetFaults();
  };

  const handleSaveCompletedTest = (session: TestSession) => {
    storage.saveTestSession(session);
    setTestSessions(storage.getTestSessions());
    setActiveTestSampleType(null);
    setActiveScenarioOverride(undefined);
    setCurrentTab('history');
  };

  const handleUpdateSettings = (patch: Partial<UserSettings>) => {
    const updated = storage.saveUserSettings(patch);
    setSettings(updated);
  };

  const handleResetData = () => {
    storage.resetToDemoSeed();
    setTestSessions(storage.getTestSessions());
    setSettings(storage.getUserSettings());
    deviceSimulator.resetFaults();
    alert('Demo data and calibration baselines have been reset.');
  };

  const handleToggleVoice = () => {
    const next = !voiceActive;
    voice.setEnabled(next);
    setVoiceActive(next);
    if (next) {
      voice.speak(language === 'hi' ? 'आवाज़ मार्गदर्शन चालू है' : 'Voice guidance enabled', language);
    }
  };

  return (
    <div className="app-viewport">
      {/* Top System Status Bar */}
      <HardwareBanner
        connected={telemetry.connected}
        batteryPercentage={telemetry.batteryPercentage}
        isDemoActive={activeScenarioOverride !== undefined || settings.demoMode}
        expertMode={settings.expertMode}
        onOpenDevice={() => setCurrentTab('device')}
      />

      {/* Main Header */}
      <Header
        onOpenSettings={() => setCurrentTab('settings')}
        voiceActive={voiceActive}
        onToggleVoice={handleToggleVoice}
      />

      {/* Main Scrollable Content */}
      <main className="app-content">
        {currentTab === 'home' && (
          <HomeScreen
            recentTests={testSessions}
            onStartTest={handleStartTest}
            onViewAllTests={() => setCurrentTab('history')}
            onOpenTestDetail={() => setCurrentTab('history')}
          />
        )}

        {currentTab === 'test' && (
          activeTestSampleType ? (
            <TestWorkflow
              sampleType={activeTestSampleType}
              scenarioOverride={activeScenarioOverride}
              onSaveTest={handleSaveCompletedTest}
              onCancel={handleCancelTest}
            />
          ) : (
            <HomeScreen
              recentTests={testSessions}
              onStartTest={handleStartTest}
              onViewAllTests={() => setCurrentTab('history')}
              onOpenTestDetail={() => setCurrentTab('history')}
            />
          )
        )}

        {currentTab === 'history' && (
          <HistoryScreen sessions={testSessions} />
        )}

        {currentTab === 'device' && (
          <DeviceScreen />
        )}

        {currentTab === 'learn' && (
          <LearnScreen />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSeed={handleResetData}
          />
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'test') {
            setActiveTestSampleType(null);
            setActiveScenarioOverride(undefined);
          }
          setCurrentTab(tab);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
