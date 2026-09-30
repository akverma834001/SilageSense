// Smart FeedCheck - ESP32-S3 Device Simulator & Sensor Interface
import { DeviceTelemetry, SensorReadings, VisualAnalysisResult, SpectralAnalysisResult } from '../types';

export interface SimulatorFaults {
  dirtyPHProbe: boolean;
  sampleWeightFault: 'NONE' | 'UNDERFILL' | 'OVERFILL';
  cameraFault: 'NONE' | 'BLUR' | 'DARK_OBSTRUCTION';
  chamberOpen: boolean;
  lowBattery: boolean;
  outOfDistributionSample: boolean;
}

class DeviceSimulator {
  private connected: boolean = true;
  private batteryPercentage: number = 82;
  private isCharging: boolean = false;
  private firmwareVersion: string = 'v1.4.1-esp32s3';
  private calibrationStatus: 'UP_TO_DATE' | 'DUE_SOON' | 'CALIBRATION_REQUIRED' = 'UP_TO_DATE';

  // Fault injection for testing & evaluation
  public faults: SimulatorFaults = {
    dirtyPHProbe: false,
    sampleWeightFault: 'NONE',
    cameraFault: 'NONE',
    chamberOpen: false,
    lowBattery: false,
    outOfDistributionSample: false
  };

  private listeners: ((telemetry: DeviceTelemetry) => void)[] = [];

  constructor() {
    // Initial state
  }

  public subscribe(callback: (telemetry: DeviceTelemetry) => void) {
    this.listeners.push(callback);
    callback(this.getTelemetry());
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    const telemetry = this.getTelemetry();
    this.listeners.forEach(cb => cb(telemetry));
  }

  public getTelemetry(): DeviceTelemetry {
    return {
      deviceId: 'SS-ESP32-9042',
      connected: this.connected,
      batteryPercentage: this.faults.lowBattery ? 12 : this.batteryPercentage,
      isCharging: this.isCharging,
      firmwareVersion: this.firmwareVersion,
      lastTestTime: 'Today, 10:42 AM',
      calibrationDate: '2026-09-26',
      calibrationStatus: this.calibrationStatus,
      chamberStatus: this.faults.chamberOpen ? 'OPEN' : 'CLOSED',
      sensors: {
        phProbe: {
          healthy: !this.faults.dirtyPHProbe,
          statusText: this.faults.dirtyPHProbe ? 'Cleaning required (Signal noisy)' : 'Calibrated & stable',
          slopeMV: 58.2,
          offsetMV: 2.1
        },
        temperatureSensor: {
          healthy: true,
          statusText: 'Active ±0.1°C'
        },
        loadCell: {
          healthy: true,
          statusText: 'HX711 0-500g tared',
          tareZero: 0.0
        },
        cameraModule: {
          healthy: this.faults.cameraFault === 'NONE',
          statusText: this.faults.cameraFault !== 'NONE' ? 'Optics obstructed / dark' : 'OV5640 5MP Ready'
        },
        spectralModule: {
          healthy: true,
          statusText: 'AS7265x Tri-spectral online'
        }
      }
    };
  }

  public connect(): boolean {
    this.connected = true;
    this.notify();
    return true;
  }

  public disconnect(): boolean {
    this.connected = false;
    this.notify();
    return true;
  }

  public toggleChamber(isOpen: boolean) {
    this.faults.chamberOpen = isOpen;
    this.notify();
  }

  public setFaults(patch: Partial<SimulatorFaults>) {
    this.faults = { ...this.faults, ...patch };
    this.notify();
  }

  public resetFaults() {
    this.faults = {
      dirtyPHProbe: false,
      sampleWeightFault: 'NONE',
      cameraFault: 'NONE',
      chamberOpen: false,
      lowBattery: false,
      outOfDistributionSample: false
    };
    this.notify();
  }

  // Pre-flight automated device check
  public async runDeviceCheck(): Promise<{ ok: boolean; message: string; subChecks: Record<string, boolean> }> {
    await new Promise(r => setTimeout(r, 600));

    if (!this.connected) {
      return {
        ok: false,
        message: 'Device not connected via Bluetooth or USB.',
        subChecks: { ble: false, battery: false, chamber: false, sensors: false }
      };
    }

    if (this.faults.chamberOpen) {
      return {
        ok: false,
        message: 'Sample chamber lid is open. Please close the lid securely.',
        subChecks: { ble: true, battery: true, chamber: false, sensors: true }
      };
    }

    if (this.faults.dirtyPHProbe) {
      return {
        ok: false,
        message: 'The pH sensor needs cleaning before this test. Rinse probe in distilled water and wipe gently.',
        subChecks: { ble: true, battery: true, chamber: true, sensors: false }
      };
    }

    if (this.faults.cameraFault !== 'NONE') {
      return {
        ok: false,
        message: 'Camera lens appears obstructed or illumination is insufficient. Please check optical glass.',
        subChecks: { ble: true, battery: true, chamber: true, sensors: false }
      };
    }

    return {
      ok: true,
      message: 'Device ready ✓',
      subChecks: { ble: true, battery: true, chamber: true, sensors: true }
    };
  }

  // Measure weight on load cell
  public async readSampleWeight(): Promise<{ ok: boolean; weightGrams: number; state: 'OK' | 'UNDER' | 'OVER' }> {
    await new Promise(r => setTimeout(r, 500));

    let grams = 124;
    if (this.faults.sampleWeightFault === 'UNDERFILL') grams = 45;
    if (this.faults.sampleWeightFault === 'OVERFILL') grams = 210;

    let state: 'OK' | 'UNDER' | 'OVER' = 'OK';
    if (grams < 80) state = 'UNDER';
    else if (grams > 175) state = 'OVER';

    return {
      ok: state === 'OK',
      weightGrams: grams,
      state
    };
  }

  // Controlled Image Capture and pre-inference quality validation
  public async captureControlledImage(sampleType: 'SILAGE' | 'FEED'): Promise<VisualAnalysisResult> {
    await new Promise(r => setTimeout(r, 800));

    if (this.faults.cameraFault === 'BLUR') {
      return {
        accepted: false,
        rejectReason: 'Image is blurred. Keep device still and clean camera glass.',
        blurScore: 32, // < 50 rejects
        brightnessScore: 72,
        samplePresenceDetected: true,
        moldDetected: false,
        moldConfidence: 0.0,
        chopConsistency: 'UNIFORM',
        colorTone: 'NORMAL_GREEN_GOLD',
        modelVersion: 'v1.4.2-vis-edge'
      };
    }

    if (this.faults.cameraFault === 'DARK_OBSTRUCTION') {
      return {
        accepted: false,
        rejectReason: 'Chamber illumination failed or optical path obstructed.',
        blurScore: 75,
        brightnessScore: 18, // < 30 rejects
        samplePresenceDetected: false,
        moldDetected: false,
        moldConfidence: 0.0,
        chopConsistency: 'UNIFORM',
        colorTone: 'BLACKENED',
        modelVersion: 'v1.4.2-vis-edge'
      };
    }

    // Normal or OOD visual assessment
    const isOOD = this.faults.outOfDistributionSample;
    return {
      accepted: true,
      blurScore: 94,
      brightnessScore: 82,
      samplePresenceDetected: true,
      moldDetected: isOOD ? true : false,
      moldConfidence: isOOD ? 0.78 : 0.03,
      chopConsistency: sampleType === 'SILAGE' ? 'UNIFORM' : 'COARSE',
      colorTone: isOOD ? 'DARKENED_BROWN' : 'NORMAL_GREEN_GOLD',
      modelVersion: 'v1.4.2-vis-edge'
    };
  }

  // Acquire multi-sensor streams
  public async acquireSensors(scenarioOverride?: 'NORMAL' | 'REVIEW' | 'OOD'): Promise<SensorReadings> {
    await new Promise(r => setTimeout(r, 900));

    // Normal silage baseline
    let pH = 4.15;
    let sampleTemp = 24.8;
    const ambientTemp = 24.2;
    let moisture = 62.5;

    if (scenarioOverride === 'REVIEW') {
      pH = 5.25; // Elevated pH indicates improper fermentation
      sampleTemp = 37.8; // Aerobic heating!
      moisture = 72.0; // Excessively wet
    } else if (scenarioOverride === 'OOD' || this.faults.outOfDistributionSample) {
      pH = 7.4; // Neutral/alkaline, extremely abnormal for silage
      sampleTemp = 42.0;
      moisture = 31.0;
    }

    return {
      pH,
      sampleTemp,
      ambientTemp,
      moistureEstimate: moisture,
      weightGrams: 125,
      opticalReflectanceIndex: 0.84,
      isStablePH: !this.faults.dirtyPHProbe,
      isStableTemp: true
    };
  }

  // Spectral sensing estimation
  public async acquireSpectralData(sampleType: 'SILAGE' | 'FEED'): Promise<SpectralAnalysisResult> {
    await new Promise(r => setTimeout(r, 600));

    if (sampleType === 'SILAGE') {
      return {
        calibratedMoistureEstimate: 62.5,
        crudeProteinIndexEstimate: 8.6,
        fibreIndexEstimate: 43.8,
        spectrumCurve: [0.14, 0.25, 0.48, 0.70, 0.83, 0.75, 0.67, 0.59],
        modelVersion: 'v0.9-nir-cal',
        status: 'CALIBRATED_ESTIMATE'
      };
    } else {
      return {
        calibratedMoistureEstimate: 11.8,
        crudeProteinIndexEstimate: 20.4,
        fibreIndexEstimate: 8.9,
        spectrumCurve: [0.18, 0.31, 0.52, 0.65, 0.73, 0.70, 0.63, 0.55],
        modelVersion: 'v0.9-nir-cal',
        status: 'CALIBRATED_ESTIMATE'
      };
    }
  }
}

export const deviceSimulator = new DeviceSimulator();
