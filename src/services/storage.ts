// Smart FeedCheck - Offline-first Local Storage Service
import { TestSession, CalibrationRecord, UserSettings } from '../types';

const STORAGE_KEYS = {
  TESTS: 'smart_feedcheck_tests',
  CALIBRATIONS: 'smart_feedcheck_calibrations',
  SETTINGS: 'smart_feedcheck_settings',
  SYNC_QUEUE: 'smart_feedcheck_sync_queue'
};

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  preferredTempUnit: 'C',
  farmName: 'Surya Dairy Farm',
  operatorName: 'Ramesh Patil',
  herdSize: 28,
  expertMode: false,
  voiceAssistanceEnabled: true,
  demoMode: false
};

const SEED_TESTS: TestSession[] = [
  {
    testId: 'TEST-2026-0930-1042',
    sampleId: 'SMP-SIL-084',
    sampleType: 'SILAGE',
    subType: 'CORN_MAIZE',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    deviceId: 'SS-ESP32-9042',
    durationSeconds: 42,
    category: 'GREEN',
    categoryHeadline: 'Screening Consistent',
    summaryMessage: 'The measured indicators are consistent with a normally fermented, well-preserved maize silage.',
    recommendation: 'Silage is well fermented with adequate lactic acid stabilization. Safe for regular dairy ration feeding.',
    warnings: [],
    whyThisResult: [
      'pH at 4.15 is inside ideal lactic preservation threshold (3.8 - 4.2).',
      'Moisture at 62% is optimal for bunker compaction.',
      'Sample temperature (24.8°C) is close to ambient, confirming no aerobic heating.',
      'Surface imaging detected uniform chop with zero fungal mycelium.'
    ],
    confidence: 'HIGH',
    sensorReadings: {
      pH: 4.15,
      sampleTemp: 24.8,
      ambientTemp: 24.2,
      moistureEstimate: 62.0,
      weightGrams: 124,
      opticalReflectanceIndex: 0.88,
      isStablePH: true,
      isStableTemp: true
    },
    visualAnalysis: {
      accepted: true,
      blurScore: 92,
      brightnessScore: 78,
      samplePresenceDetected: true,
      moldDetected: false,
      moldConfidence: 0.02,
      chopConsistency: 'UNIFORM',
      colorTone: 'NORMAL_GREEN_GOLD',
      modelVersion: 'v1.4.2-vis-edge'
    },
    spectralAnalysis: {
      calibratedMoistureEstimate: 62.0,
      crudeProteinIndexEstimate: 8.4,
      fibreIndexEstimate: 44.1,
      spectrumCurve: [0.12, 0.22, 0.45, 0.68, 0.81, 0.74, 0.65, 0.58],
      modelVersion: 'v0.9-nir-cal',
      status: 'CALIBRATED_ESTIMATE'
    },
    oodAnalysis: {
      isOOD: false,
      anomalyScore: 0.8,
      deviatingFeatures: [],
      modelVersion: 'v1.1-mahalanobis'
    },
    provenanceList: [
      { sample_id: 'SMP-SIL-084', parameter: 'pH', value: 4.15, unit: 'pH', source: 'DEVICE', entered_by: 'SS-ESP32-9042', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), confidence: 'HIGH' },
      { sample_id: 'SMP-SIL-084', parameter: 'temperature', value: 24.8, unit: '°C', source: 'DEVICE', entered_by: 'SS-ESP32-9042', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), confidence: 'HIGH' },
      { sample_id: 'SMP-SIL-084', parameter: 'moisture', value: 62.0, unit: '%', source: 'MODEL', entered_by: 'v0.9-nir-cal', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), confidence: 'HIGH' },
      { sample_id: 'SMP-SIL-084', parameter: 'visual_mold', value: false, source: 'MODEL', entered_by: 'v1.4.2-vis-edge', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), confidence: 'HIGH' }
    ],
    calibrationVersion: 'CAL-2026-SEP-V2',
    modelVersions: {
      visionModel: 'v1.4.2-vis-edge',
      spectralModel: 'v0.9-nir-cal',
      decisionEngine: 'v2.1-agri-rules'
    },
    farmName: 'Surya Dairy Farm',
    operatorName: 'Ramesh Patil',
    syncStatus: 'SYNCED',
    isDemo: false
  },
  {
    testId: 'TEST-2026-0929-1615',
    sampleId: 'SMP-FEED-039',
    sampleType: 'FEED',
    subType: 'FEED_PELLETS',
    timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(), // Yesterday
    deviceId: 'SS-ESP32-9042',
    durationSeconds: 38,
    category: 'YELLOW',
    categoryHeadline: 'Review Required',
    summaryMessage: 'Pellet moisture reading is elevated above safe storage baseline (12.0%). Risk of mould if stored long-term.',
    recommendation: 'Feed elevated-moisture batch promptly. Do not stack bags in damp corners. Inspect for musty smell before feeding.',
    warnings: [
      'Moisture estimate (14.8%) exceeds standard safe feed storage threshold (12.0%).'
    ],
    whyThisResult: [
      'Moisture reading is 14.8%, which is 2.8% above the safe threshold.',
      'Surface imaging shows intact pellet structure without visible mycelium yet.',
      'Temperature is normal (25.5°C), showing no active heating.'
    ],
    confidence: 'HIGH',
    sensorReadings: {
      pH: 6.2,
      sampleTemp: 25.5,
      ambientTemp: 24.5,
      moistureEstimate: 14.8,
      weightGrams: 130,
      opticalReflectanceIndex: 0.72,
      isStablePH: true,
      isStableTemp: true
    },
    visualAnalysis: {
      accepted: true,
      blurScore: 88,
      brightnessScore: 74,
      samplePresenceDetected: true,
      moldDetected: false,
      moldConfidence: 0.05,
      chopConsistency: 'UNIFORM',
      colorTone: 'NORMAL_GREEN_GOLD',
      modelVersion: 'v1.4.2-vis-edge'
    },
    spectralAnalysis: {
      calibratedMoistureEstimate: 14.8,
      crudeProteinIndexEstimate: 19.8,
      fibreIndexEstimate: 9.5,
      spectrumCurve: [0.15, 0.28, 0.49, 0.62, 0.71, 0.69, 0.61, 0.54],
      modelVersion: 'v0.9-nir-cal',
      status: 'CALIBRATED_ESTIMATE'
    },
    oodAnalysis: {
      isOOD: false,
      anomalyScore: 1.4,
      deviatingFeatures: [],
      modelVersion: 'v1.1-mahalanobis'
    },
    provenanceList: [
      { sample_id: 'SMP-FEED-039', parameter: 'moisture', value: 14.8, unit: '%', source: 'DEVICE', entered_by: 'SS-ESP32-9042', timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(), confidence: 'HIGH' }
    ],
    calibrationVersion: 'CAL-2026-SEP-V2',
    modelVersions: {
      visionModel: 'v1.4.2-vis-edge',
      spectralModel: 'v0.9-nir-cal',
      decisionEngine: 'v2.1-agri-rules'
    },
    farmName: 'Surya Dairy Farm',
    operatorName: 'Ramesh Patil',
    syncStatus: 'SYNCED',
    isDemo: false
  }
];

const SEED_CALIBRATIONS: CalibrationRecord[] = [
  {
    id: 'CAL-01',
    deviceId: 'SFC-ESP32-9042',
    sensor: 'PH_ELECTRODE',
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    operator: 'Ramesh Patil',
    referencePoints: [
      { target: 'Buffer 7.00', measured: 7.01 },
      { target: 'Buffer 4.00', measured: 4.02 }
    ],
    slope: 58.2, // mV/pH unit
    offset: 2.1,
    status: 'SUCCESS',
    versionTag: 'CAL-2026-SEP-V2'
  },
  {
    id: 'CAL-02',
    deviceId: 'SFC-ESP32-9042',
    sensor: 'LOAD_CELL',
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    operator: 'Ramesh Patil',
    referencePoints: [
      { target: 'Tare 0g', measured: 0 },
      { target: 'Test 100g', measured: 100.1 }
    ],
    status: 'SUCCESS',
    versionTag: 'CAL-2026-SEP-V2'
  }
];

export const storage = {
  getTestSessions(): TestSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TESTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(SEED_TESTS));
      return SEED_TESTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_TESTS;
    }
  },

  saveTestSession(session: TestSession): void {
    const sessions = this.getTestSessions();
    const updated = [session, ...sessions.filter(s => s.testId !== session.testId)];
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(updated));

    // Add to offline sync queue if marked as pending
    if (session.syncStatus === 'PENDING_OFFLINE') {
      const queue = this.getSyncQueue();
      if (!queue.includes(session.testId)) {
        queue.push(session.testId);
        localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
      }
    }
  },

  deleteTestSession(testId: string): void {
    const sessions = this.getTestSessions().filter(s => s.testId !== testId);
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(sessions));
  },

  getCalibrationRecords(): CalibrationRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CALIBRATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CALIBRATIONS, JSON.stringify(SEED_CALIBRATIONS));
      return SEED_CALIBRATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_CALIBRATIONS;
    }
  },

  saveCalibrationRecord(record: CalibrationRecord): void {
    const records = this.getCalibrationRecords();
    const updated = [record, ...records];
    localStorage.setItem(STORAGE_KEYS.CALIBRATIONS, JSON.stringify(updated));
  },

  getUserSettings(): UserSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveUserSettings(patch: Partial<UserSettings>): UserSettings {
    const current = this.getUserSettings();
    const updated = { ...current, ...patch };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  getSyncQueue(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async syncQueueNow(): Promise<number> {
    const queue = this.getSyncQueue();
    if (queue.length === 0) return 0;

    // Simulate network sync
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update sessions to SYNCED
    const sessions = this.getTestSessions().map(s => {
      if (queue.includes(s.testId)) {
        return { ...s, syncStatus: 'SYNCED' as const };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));

    return queue.length;
  },

  resetToDemoSeed(): void {
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(SEED_TESTS));
    localStorage.setItem(STORAGE_KEYS.CALIBRATIONS, JSON.stringify(SEED_CALIBRATIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
  }
};
