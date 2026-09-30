// Smart FeedCheck - Core Types and Data Models

export type SampleType = 'SILAGE' | 'FEED';

export type SubSampleType = 
  | 'CORN_MAIZE' 
  | 'SORGHUM' 
  | 'GRASS_HAYLAGE' 
  | 'FEED_PELLETS' 
  | 'GRAIN_MASH' 
  | 'OILCAKE_MIX';

export type ResultCategory = 
  | 'GREEN'   // Screening consistent - looks normal
  | 'YELLOW'  // Review required - abnormal indicator
  | 'RED'     // Laboratory confirmation required - high risk / safety check
  | 'UNKNOWN'; // Out of distribution / insufficient input - cannot assess confidently

export type DataSource = 'DEVICE' | 'USER' | 'LAB' | 'MODEL' | 'REFERENCE';

export interface DataProvenance {
  sample_id: string;
  parameter: string;
  value: number | string | boolean;
  unit?: string;
  source: DataSource;
  entered_by: string;
  timestamp: string;
  device_id?: string;
  calibration_version?: string;
  model_version?: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SensorReadings {
  pH: number;
  sampleTemp: number; // °C
  ambientTemp: number; // °C
  moistureEstimate: number; // %
  weightGrams: number;
  opticalReflectanceIndex: number;
  isStablePH: boolean;
  isStableTemp: boolean;
}

export interface VisualAnalysisResult {
  accepted: boolean;
  rejectReason?: string;
  blurScore: number; // 0 (blurry) to 100 (sharp)
  brightnessScore: number; // 0 to 100
  samplePresenceDetected: boolean;
  moldDetected: boolean;
  moldConfidence: number; // 0 to 1
  chopConsistency: 'UNIFORM' | 'MIXED' | 'COARSE';
  colorTone: 'NORMAL_GREEN_GOLD' | 'DARKENED_BROWN' | 'BLACKENED' | 'LIGHT_PALE';
  modelVersion: string;
}

export interface SpectralAnalysisResult {
  calibratedMoistureEstimate: number;
  crudeProteinIndexEstimate?: number; // Calibrated estimate only
  fibreIndexEstimate?: number;
  spectrumCurve: number[]; // Reflectance across 450nm-950nm (8 bands)
  modelVersion: string;
  status: 'CALIBRATED_ESTIMATE' | 'UNAVAILABLE_AWAITING_REF';
}

export interface OODAnalysisResult {
  isOOD: boolean;
  anomalyScore: number; // 0.0 to 10.0 (> 3.5 = OOD)
  deviatingFeatures: string[];
  modelVersion: string;
}

export interface ManualInputRecord {
  sampleType: SampleType;
  subType?: SubSampleType;
  storageMethod?: 'BUNKER' | 'PIT' | 'SILO_BAG' | 'BALED' | 'BAG_DRY';
  storageDurationDays?: number;
  batchId?: string;
  observations: {
    color?: string;
    smell?: 'SWEET_ACIDIC' | 'VINEGAR' | 'PUNGENT_BUTYRIC' | 'MUSTY_MOLD' | 'NORMAL';
    texture?: 'FIRM' | 'SLIMY' | 'DRY_BRITTLE' | 'NORMAL';
    visibleMold?: boolean;
    foreignMaterial?: boolean;
    excessiveHeat?: boolean;
  };
  knownMeasurements: {
    pH?: number;
    moisture?: number;
    temperature?: number;
    crudeProtein?: number;
  };
  labValues?: {
    labPH?: number;
    labMoisture?: number;
    labCrudeProtein?: number;
    labAflatoxinB1Ppb?: number;
    labDate?: string;
    labName?: string;
  };
}

export interface ValueConflict {
  parameter: string;
  deviceValue: number;
  manualValue: number;
  unit: string;
  resolvedValue?: number;
  resolvedSource?: DataSource;
}

export interface AssessmentFinding {
  parameter: string;
  label: string;
  valueString: string;
  status: 'NORMAL' | 'CAUTION' | 'ALERT' | 'INFO';
  explanation: string;
}

export interface TestSession {
  testId: string;
  sampleId: string;
  sampleType: SampleType;
  subType: SubSampleType;
  timestamp: string;
  deviceId: string;
  durationSeconds: number;
  
  // Status
  category: ResultCategory;
  categoryHeadline: string;
  summaryMessage: string;
  recommendation: string;
  warnings: string[];
  whyThisResult: string[];
  
  // Technical details
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sensorReadings?: SensorReadings;
  visualAnalysis?: VisualAnalysisResult;
  spectralAnalysis?: SpectralAnalysisResult;
  oodAnalysis?: OODAnalysisResult;
  manualInputs?: ManualInputRecord;
  conflicts?: ValueConflict[];
  provenanceList: DataProvenance[];
  
  // Calibration & model info
  calibrationVersion: string;
  modelVersions: {
    visionModel: string;
    spectralModel: string;
    decisionEngine: string;
  };
  
  // Farm & Operator
  farmName: string;
  operatorName: string;
  syncStatus: 'SYNCED' | 'PENDING_OFFLINE';
  isDemo?: boolean;
}

export interface DeviceTelemetry {
  deviceId: string;
  connected: boolean;
  batteryPercentage: number;
  isCharging: boolean;
  firmwareVersion: string;
  lastTestTime: string;
  calibrationDate: string;
  calibrationStatus: 'UP_TO_DATE' | 'DUE_SOON' | 'CALIBRATION_REQUIRED';
  chamberStatus: 'CLOSED' | 'OPEN' | 'EMPTY';
  sensors: {
    phProbe: { healthy: boolean; statusText: string; slopeMV: number; offsetMV: number };
    temperatureSensor: { healthy: boolean; statusText: string };
    loadCell: { healthy: boolean; statusText: string; tareZero: number };
    cameraModule: { healthy: boolean; statusText: string };
    spectralModule: { healthy: boolean; statusText: string };
  };
}

export interface CalibrationRecord {
  id: string;
  deviceId: string;
  sensor: 'PH_ELECTRODE' | 'LOAD_CELL' | 'CAMERA_WHITE_BALANCE' | 'TEMPERATURE';
  timestamp: string;
  operator: string;
  referencePoints: { target: string | number; measured: number }[];
  slope?: number;
  offset?: number;
  status: 'SUCCESS' | 'FAILED';
  versionTag: string;
}

export interface UserSettings {
  language: 'en' | 'hi';
  preferredTempUnit: 'C' | 'F';
  farmName: string;
  operatorName: string;
  herdSize: number;
  expertMode: boolean;
  voiceAssistanceEnabled: boolean;
  demoMode: boolean;
}
