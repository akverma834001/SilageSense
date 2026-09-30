import React, { useState, useEffect } from 'react';
import { 
  SampleType, 
  SubSampleType, 
  TestSession, 
  SensorReadings, 
  VisualAnalysisResult, 
  SpectralAnalysisResult, 
  OODAnalysisResult, 
  ManualInputRecord,
  ValueConflict
} from '../../types';
import { useTranslation } from '../../localization/LanguageContext';
import { voice } from '../../services/voice';
import { deviceSimulator } from '../../services/deviceSimulator';
import { computerVisionModel } from '../../ai/computerVision';
import { spectralModel } from '../../ai/spectralModel';
import { oodDetector } from '../../ai/oodDetector';
import { decisionEngine } from '../../ai/decisionEngine';
import { StatusBadge } from '../common/StatusBadge';
import { ConflictModal } from '../common/ConflictModal';
import { WhyResultModal } from '../common/WhyResultModal';
import { TechnicalDetailsModal } from '../common/TechnicalDetailsModal';
import { PrintReportModal } from '../common/PrintReportModal';
import { ManualEntryModal } from './ManualEntryModal';
import { 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  HelpCircle, 
  FileText, 
  Check, 
  Scale, 
  Camera, 
  FlaskConical, 
  Thermometer, 
  PlusCircle,
  Binary
} from 'lucide-react';

export type WorkflowStep = 
  | 'PREPARE' 
  | 'CUP_LEVEL' 
  | 'DEVICE_CHECK' 
  | 'SAMPLE_WEIGHT' 
  | 'IMAGING' 
  | 'MEASURING' 
  | 'RESULT';

interface TestWorkflowProps {
  sampleType: SampleType;
  scenarioOverride?: string;
  onSaveTest: (session: TestSession) => void;
  onCancel: () => void;
}

export const TestWorkflow: React.FC<TestWorkflowProps> = ({
  sampleType,
  scenarioOverride,
  onSaveTest,
  onCancel
}) => {
  const { t, language } = useTranslation();
  const subType: SubSampleType = sampleType === 'SILAGE' ? 'CORN_MAIZE' : 'FEED_PELLETS';

  const [step, setStep] = useState<WorkflowStep>('PREPARE');
  const [deviceCheckState, setDeviceCheckState] = useState<{ loading: boolean; ok: boolean; message: string }>({
    loading: true,
    ok: true,
    message: t.stepDeviceCheckTitle
  });

  const [weightState, setWeightState] = useState<{ loading: boolean; ok: boolean; grams: number; message: string }>({
    loading: true,
    ok: true,
    grams: 124,
    message: t.stepWeightTitle
  });

  const [imagingState, setImagingState] = useState<{ loading: boolean; ok: boolean; result?: VisualAnalysisResult; message: string }>({
    loading: true,
    ok: true,
    message: t.stepImagingTitle
  });

  const [measuringProgress, setMeasuringProgress] = useState<string>(t.measuringPH);

  // Data items collected during test
  const [sensors, setSensors] = useState<SensorReadings | undefined>(undefined);
  const [visual, setVisual] = useState<VisualAnalysisResult | undefined>(undefined);
  const [spectral, setSpectral] = useState<SpectralAnalysisResult | undefined>(undefined);
  const [ood, setOOD] = useState<OODAnalysisResult | undefined>(undefined);
  const [manual, setManual] = useState<ManualInputRecord | undefined>(undefined);
  const [conflicts, setConflicts] = useState<ValueConflict[]>([]);
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<string, { choice: 'DEVICE' | 'MANUAL' }>>({});

  // Modals
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);
  const [showTechModal, setShowTechModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Result session
  const [finalSession, setFinalSession] = useState<TestSession | null>(null);

  // Audio prompts on step changes
  useEffect(() => {
    if (step === 'PREPARE') {
      voice.speak(language === 'hi' ? 'अपना नमूना तैयार करें और कप में भरें' : 'Prepare your sample and place in the sample cup', language);
    } else if (step === 'CUP_LEVEL') {
      voice.speak(language === 'hi' ? 'कप को दिए गए निशान तक भरें' : 'Fill the cup to the marked level', language);
    } else if (step === 'DEVICE_CHECK') {
      voice.speak(language === 'hi' ? 'डिवाइस की जांच की जा रही है' : 'Checking device sensors', language);
    } else if (step === 'RESULT' && finalSession) {
      voice.speak(
        language === 'hi' 
          ? `परीक्षण संपन्न। परिणाम है: ${finalSession.categoryHeadline}` 
          : `Measurement complete. Assessment: ${finalSession.categoryHeadline}`,
        language
      );
    }
  }, [step, language]);

  // Execute Step 3: Device Check
  const runDeviceCheckStep = async () => {
    setDeviceCheckState({ loading: true, ok: true, message: t.stepDeviceCheckTitle });
    
    // Check if scenario requires a fault
    if (scenarioOverride === 'POOR_IMAGE') {
      deviceSimulator.setFaults({ cameraFault: 'BLUR' });
    } else if (scenarioOverride === 'OOD') {
      deviceSimulator.setFaults({ outOfDistributionSample: true });
    } else if (scenarioOverride === 'NORMAL') {
      deviceSimulator.resetFaults();
    }

    const check = await deviceSimulator.runDeviceCheck();
    setDeviceCheckState({
      loading: false,
      ok: check.ok,
      message: check.message
    });
  };

  // Execute Step 4: Sample Weight Check
  const runWeightStep = async () => {
    setWeightState({ loading: true, ok: true, grams: 124, message: t.stepWeightTitle });
    const res = await deviceSimulator.readSampleWeight();
    let msg = t.stepWeightOk;
    if (res.state === 'UNDER') msg = t.stepWeightUnder;
    if (res.state === 'OVER') msg = t.stepWeightOver;

    setWeightState({
      loading: false,
      ok: res.ok,
      grams: res.weightGrams,
      message: msg
    });
  };

  // Execute Step 5: Controlled Imaging
  const runImagingStep = async () => {
    setImagingState({ loading: true, ok: true, message: t.stepImagingTitle });
    const imgRes = await deviceSimulator.captureControlledImage(sampleType);
    setVisual(imgRes);

    setImagingState({
      loading: false,
      ok: imgRes.accepted,
      result: imgRes,
      message: imgRes.accepted ? t.imageQualityOk : (imgRes.rejectReason || t.imageQualityFail)
    });
  };

  // Execute Step 6: Measurement Acquisition and Final Inference
  const runMeasurementStep = async () => {
    setMeasuringProgress(t.measuringPH);
    await new Promise(r => setTimeout(r, 600));

    setMeasuringProgress(t.checkingTemp);
    const scenarioType = scenarioOverride === 'REVIEW' ? 'REVIEW' : scenarioOverride === 'OOD' ? 'OOD' : 'NORMAL';
    const sensorData = await deviceSimulator.acquireSensors(scenarioType);
    setSensors(sensorData);

    await new Promise(r => setTimeout(r, 600));
    setMeasuringProgress(t.examiningVisual);
    const spectralData = await deviceSimulator.acquireSpectralData(sampleType);
    setSpectral(spectralData);

    const oodData = oodDetector.evaluateDistribution(sensorData, sampleType, visual?.moldDetected || false);
    setOOD(oodData);

    await new Promise(r => setTimeout(r, 500));
    setMeasuringProgress(t.completingAssessment);

    // Run decision engine
    const testId = `TEST-${Date.now().toString().slice(-8)}`;
    const sampleId = `SMP-${sampleType.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;

    const decision = decisionEngine.evaluateTest(
      sampleId,
      sampleType,
      subType,
      sensorData,
      visual,
      spectralData,
      oodData,
      manual,
      resolvedConflicts
    );

    // If there are unresolved conflicts, show modal first
    if (decision.conflicts.length > 0 && Object.keys(resolvedConflicts).length === 0) {
      setConflicts(decision.conflicts);
      return;
    }

    const session: TestSession = {
      testId,
      sampleId,
      sampleType,
      subType,
      timestamp: new Date().toISOString(),
      deviceId: 'SS-ESP32-9042',
      durationSeconds: 44,
      category: decision.category,
      categoryHeadline: decision.categoryHeadline,
      summaryMessage: decision.summaryMessage,
      recommendation: decision.recommendation,
      warnings: decision.warnings,
      whyThisResult: decision.whyThisResult,
      confidence: decision.confidence,
      sensorReadings: sensorData,
      visualAnalysis: visual,
      spectralAnalysis: spectralData,
      oodAnalysis: oodData,
      manualInputs: manual,
      conflicts: decision.conflicts,
      provenanceList: decision.provenanceList,
      calibrationVersion: 'CAL-2026-SEP-V2',
      modelVersions: decision.modelVersions,
      farmName: 'Surya Dairy Farm',
      operatorName: 'Ramesh Patil',
      syncStatus: 'SYNCED',
      isDemo: scenarioOverride !== undefined
    };

    setFinalSession(session);
    setStep('RESULT');
  };

  // Step transitions
  const handleProceedFromPrepare = () => {
    setStep('CUP_LEVEL');
  };

  const handleProceedFromCup = () => {
    setStep('DEVICE_CHECK');
    runDeviceCheckStep();
  };

  const handleProceedFromDeviceCheck = () => {
    setStep('SAMPLE_WEIGHT');
    runWeightStep();
  };

  const handleProceedFromWeight = () => {
    setStep('IMAGING');
    runImagingStep();
  };

  const handleProceedFromImaging = () => {
    setStep('MEASURING');
    runMeasurementStep();
  };

  const handleConflictResolve = (resolutions: Record<string, { choice: 'DEVICE' | 'MANUAL' }>) => {
    setResolvedConflicts(resolutions);
    setConflicts([]);
    // Re-run assessment with resolved choices
    runMeasurementStep();
  };

  // ==========================================
  // RENDER STEP 1: PREPARE SAMPLE
  // ==========================================
  if (step === 'PREPARE') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Step 1 of 5
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
            {t.stepPrepareTitle}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t.stepPrepareInstruction}
          </p>
        </div>

        <div className="step-image-container">
          <img 
            src="/assets/sample_cup.jpg" 
            alt="Silage sample being placed in measurement cup" 
            className="step-image" 
          />
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '6px' }}>
            Representative Sampling Rule:
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Do not take silage from the dry outer crust. Dig 15-20 cm into the pit face or bag to capture true fermented core material.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          <button className="btn-primary" onClick={handleProceedFromPrepare} id="prepare-continue-btn">
            <span>{t.stepPrepareBtn}</span>
          </button>
          <button className="btn-subtle" onClick={onCancel}>
            Cancel Test
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STEP 2: FILL SAMPLE CUP
  // ==========================================
  if (step === 'CUP_LEVEL') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Step 2 of 5
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
            {t.stepCupTitle}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t.stepCupInstruction}
          </p>
        </div>

        {/* Visual cup illustration with fill line */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '130px', height: '170px', border: '3px solid #64748b', borderRadius: '0 0 16px 16px', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>
            {/* Silage fill level */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', backgroundColor: '#a3b18a', borderTop: '2px dashed #b91c1c' }}>
              <div style={{ position: 'absolute', top: '-18px', right: '4px', fontSize: '0.68rem', fontWeight: 700, color: '#b91c1c' }}>
                FILL LINE ◄
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#166534', backgroundColor: '#dcfce7', padding: '3px 10px', borderRadius: '999px', fontWeight: 600 }}>
              ✓ {t.correctSampleBadge}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#991b1b', backgroundColor: '#fee2e2', padding: '3px 10px', borderRadius: '999px', fontWeight: 600 }}>
              ✕ {t.incorrectSampleBadge}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          <button className="btn-primary" onClick={handleProceedFromCup} id="cup-ready-btn">
            <span>{t.stepCupReadyBtn}</span>
          </button>
          <button className="btn-subtle" onClick={onCancel}>
            Cancel Test
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STEP 3: DEVICE CHECK
  // ==========================================
  if (step === 'DEVICE_CHECK') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Step 3 of 5
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
            {deviceCheckState.loading ? t.stepDeviceCheckTitle : (deviceCheckState.ok ? t.deviceReadySuccess : t.deviceAttentionReq)}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t.stepDeviceCheckSubtitle}
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {deviceCheckState.loading ? (
            <div className="measuring-pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <RotateCw size={44} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {t.stepDeviceCheckTitle}
              </p>
            </div>
          ) : deviceCheckState.ok ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                <CheckCircle2 size={36} />
              </div>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534' }}>
                {t.deviceReadySuccess}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Sensors, battery (82%), and chamber optics are calibrated and ready.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
                <AlertCircle size={36} />
              </div>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#991b1b', textAlign: 'center' }}>
                {deviceCheckState.message}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          {deviceCheckState.ok && !deviceCheckState.loading && (
            <button className="btn-primary" onClick={handleProceedFromDeviceCheck} id="device-check-next-btn">
              <span>Continue to Weight Check</span>
            </button>
          )}

          {!deviceCheckState.ok && (
            <>
              <button className="btn-primary" onClick={runDeviceCheckStep}>
                <span>{t.deviceCheckRetry}</span>
              </button>
              <button className="btn-secondary" onClick={() => deviceSimulator.resetFaults()}>
                Reset Device to Normal
              </button>
            </>
          )}

          <button className="btn-subtle" onClick={onCancel}>
            Cancel Test
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STEP 4: SAMPLE WEIGHT
  // ==========================================
  if (step === 'SAMPLE_WEIGHT') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Step 4 of 5
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
            {weightState.loading ? t.stepWeightTitle : weightState.message}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Automated load cell verifies sample density for optical repeatability.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: weightState.ok ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: weightState.ok ? '#15803d' : '#b91c1c' }}>
            <Scale size={32} />
          </div>

          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {weightState.grams} g
          </div>

          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: weightState.ok ? '#166534' : '#991b1b' }}>
            {weightState.message}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          {weightState.ok && !weightState.loading && (
            <button className="btn-primary" onClick={handleProceedFromWeight} id="weight-continue-btn">
              <span>Continue to Optical Imaging</span>
            </button>
          )}

          {!weightState.ok && (
            <button className="btn-primary" onClick={runWeightStep}>
              <span>{t.deviceCheckRetry}</span>
            </button>
          )}

          <button className="btn-subtle" onClick={onCancel}>
            Cancel Test
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STEP 5: CONTROLLED IMAGING
  // ==========================================
  if (step === 'IMAGING') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Step 5 of 5
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
            {imagingState.loading ? t.stepImagingTitle : imagingState.message}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t.stepImagingSubtitle}
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          {imagingState.loading ? (
            <div className="measuring-pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Camera size={44} style={{ color: 'var(--primary)' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {t.stepImagingTitle}
              </p>
            </div>
          ) : imagingState.ok ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                <CheckCircle2 size={36} />
              </div>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534' }}>
                {t.imageQualityOk}
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Sharpness: {imagingState.result?.blurScore}/100 • Illumination: {imagingState.result?.brightnessScore}/100
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
                <AlertCircle size={36} />
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', textAlign: 'center' }}>
                {imagingState.message}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Image did not pass pre-inference sharpness or lighting criteria. AI model was not executed on invalid data.
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          {imagingState.ok && !imagingState.loading && (
            <button className="btn-primary" onClick={handleProceedFromImaging} id="imaging-continue-btn">
              <span>Start Sensor Measurement</span>
            </button>
          )}

          {!imagingState.ok && (
            <>
              <button className="btn-primary" onClick={runImagingStep}>
                <span>{t.retakeImageBtn}</span>
              </button>
              <button className="btn-secondary" onClick={() => deviceSimulator.resetFaults()}>
                Clear Camera Obstruction
              </button>
            </>
          )}

          <button className="btn-subtle" onClick={onCancel}>
            Cancel Test
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STEP 6: MEASURING SENSORS & MANUAL DATA ENTRY
  // ==========================================
  if (step === 'MEASURING') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Processing Analysis
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
            {measuringProgress}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Acquiring direct probe readings, multi-band spectral reflectance, and evaluating rules.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="measuring-pulse" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FlaskConical size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>pH Electrode</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Calibrated millivolt signal stabilization</div>
            </div>
          </div>

          <div className="measuring-pulse" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Thermometer size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Thermal Probes</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Differential sample vs. ambient temperature</div>
            </div>
          </div>
        </div>

        {/* Optional Manual Data Entry Button */}
        <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px 14px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--primary)' }}>
              {manual ? '✓ Manual info added' : 'Have known info?'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Add known pH, smell, or lab test data
            </div>
          </div>
          <button 
            type="button"
            className="btn-secondary"
            onClick={() => setShowManualModal(true)}
            style={{ width: 'auto', minHeight: '36px', padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <PlusCircle size={15} />
            <span>{manual ? 'Edit info' : 'Add info'}</span>
          </button>
        </div>

        {/* Conflict Modal if device and manual readings differ */}
        {conflicts.length > 0 && (
          <ConflictModal
            conflicts={conflicts}
            onResolve={handleConflictResolve}
            onRetest={() => {
              setConflicts([]);
              runMeasurementStep();
            }}
          />
        )}

        {/* Manual entry modal */}
        {showManualModal && (
          <ManualEntryModal
            sampleType={sampleType}
            subType={subType}
            initialData={manual}
            onSave={(data) => {
              setManual(data);
              setShowManualModal(false);
            }}
            onSkip={() => setShowManualModal(false)}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER STEP 7: FINAL RESULT SCREEN (ONE SCREEN = ONE DECISION)
  // ==========================================
  if (step === 'RESULT' && finalSession) {
    const isGreen = finalSession.category === 'GREEN';
    const isYellow = finalSession.category === 'YELLOW';
    const isRed = finalSession.category === 'RED';
    const isUnknown = finalSession.category === 'UNKNOWN';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Title */}
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {finalSession.sampleType === 'SILAGE' ? t.silageTitle : t.feedTitle} • {finalSession.sampleId}
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
            {t.assessmentTitle}
          </h2>
        </div>

        {/* Status Card (Green / Yellow / Red / Unknown) */}
        <div className={`result-status-card ${isGreen ? 'status-green' : isYellow ? 'status-yellow' : isRed ? 'status-red' : 'status-unknown'}`}>
          <div className="result-badge">
            <StatusBadge category={finalSession.category} customText={finalSession.categoryHeadline} size="lg" />
          </div>
          <p className="result-subtext">
            {finalSession.summaryMessage}
          </p>
        </div>

        {/* Key Indicators Table */}
        <div className="indicators-card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '10px' }}>
            {t.indicatorsHeader}
          </h3>

          {finalSession.sensorReadings && (
            <>
              <div className="indicator-row">
                <span className="indicator-name">{t.phIndicator}</span>
                <span className="indicator-val">
                  {finalSession.sensorReadings.pH.toFixed(2)}
                  {finalSession.sensorReadings.pH <= 4.4 ? <Check size={16} color="#15803d" /> : <AlertCircle size={16} color="#b45309" />}
                </span>
              </div>

              <div className="indicator-row">
                <span className="indicator-name">{t.moistureIndicator}</span>
                <span className="indicator-val">
                  {finalSession.sensorReadings.moistureEstimate.toFixed(1)}%
                </span>
              </div>

              <div className="indicator-row">
                <span className="indicator-name">{t.tempIndicator}</span>
                <span className="indicator-val">
                  {finalSession.sensorReadings.sampleTemp.toFixed(1)}°C
                </span>
              </div>
            </>
          )}

          {finalSession.visualAnalysis && (
            <div className="indicator-row">
              <span className="indicator-name">{t.mouldIndicator}</span>
              <span className="indicator-val" style={{ color: finalSession.visualAnalysis.moldDetected ? '#b91c1c' : '#15803d' }}>
                {finalSession.visualAnalysis.moldDetected ? t.detectedAlert : t.notDetected}
              </span>
            </div>
          )}

          {finalSession.sensorReadings && (
            <div className="indicator-row">
              <span className="indicator-name">{t.heatingIndicator}</span>
              <span className="indicator-val" style={{ color: finalSession.sensorReadings.sampleTemp >= 35.0 ? '#b91c1c' : '#15803d' }}>
                {finalSession.sensorReadings.sampleTemp >= 35.0 ? t.elevatedState : t.normalState}
              </span>
            </div>
          )}
        </div>

        {/* Farmer Recommendation */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
            {t.recommendationHeader}
          </h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
            {finalSession.recommendation}
          </p>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
            {t.screeningDisclaimer}
          </p>
        </div>

        {/* Secondary Detail Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => setShowWhyModal(true)}
            id="why-this-result-btn"
          >
            <HelpCircle size={16} />
            <span>{t.whyResultBtn}</span>
          </button>

          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => setShowTechModal(true)}
            id="technical-details-btn"
          >
            <Binary size={16} />
            <span>{t.technicalDetailsBtn}</span>
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => onSaveTest(finalSession)}
            id="save-record-btn"
          >
            <Check size={18} />
            <span>{t.saveTestBtn}</span>
          </button>

          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => setShowPrintModal(true)}
            id="print-report-btn"
          >
            <FileText size={18} />
            <span>{t.printReportBtn}</span>
          </button>

          <button 
            type="button" 
            className="btn-subtle" 
            onClick={onCancel}
          >
            {t.newTestBtn}
          </button>
        </div>

        {/* Modals */}
        {showWhyModal && (
          <WhyResultModal
            reasons={finalSession.whyThisResult}
            warnings={finalSession.warnings}
            onClose={() => setShowWhyModal(false)}
          />
        )}

        {showTechModal && (
          <TechnicalDetailsModal
            session={finalSession}
            onClose={() => setShowTechModal(false)}
          />
        )}

        {showPrintModal && (
          <PrintReportModal
            session={finalSession}
            onClose={() => setShowPrintModal(false)}
          />
        )}
      </div>
    );
  }

  return null;
};
