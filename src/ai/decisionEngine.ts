// Smart FeedCheck - Hybrid AI + Deterministic Agricultural Decision Engine
import { 
  SampleType, 
  SubSampleType, 
  SensorReadings, 
  VisualAnalysisResult, 
  SpectralAnalysisResult, 
  OODAnalysisResult, 
  ManualInputRecord, 
  ResultCategory, 
  AssessmentFinding,
  ValueConflict,
  DataProvenance
} from '../types';

export interface DecisionOutput {
  category: ResultCategory;
  categoryHeadline: string;
  summaryMessage: string;
  recommendation: string;
  warnings: string[];
  whyThisResult: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  findings: AssessmentFinding[];
  conflicts: ValueConflict[];
  provenanceList: DataProvenance[];
  modelVersions: {
    visionModel: string;
    spectralModel: string;
    decisionEngine: string;
  };
}

export const decisionEngine = {
  version: 'v2.1-agri-rules',

  evaluateTest(
    sampleId: string,
    sampleType: SampleType,
    subType: SubSampleType,
    sensors: SensorReadings | undefined,
    visual: VisualAnalysisResult | undefined,
    spectral: SpectralAnalysisResult | undefined,
    ood: OODAnalysisResult | undefined,
    manual: ManualInputRecord | undefined,
    conflictResolution?: Record<string, { choice: 'DEVICE' | 'MANUAL' }>
  ): DecisionOutput {
    const warnings: string[] = [];
    const whyThisResult: string[] = [];
    const findings: AssessmentFinding[] = [];
    const conflicts: ValueConflict[] = [];
    const provenanceList: DataProvenance[] = [];
    const now = new Date().toISOString();

    // 1. Detect and handle conflicts between Device readings and Manual inputs
    let effectivePH = sensors?.pH;
    let phSource: 'DEVICE' | 'USER' = 'DEVICE';

    if (sensors && manual?.knownMeasurements?.pH !== undefined) {
      const devPH = sensors.pH;
      const manPH = manual.knownMeasurements.pH;
      if (Math.abs(devPH - manPH) >= 0.3) {
        conflicts.push({
          parameter: 'pH',
          deviceValue: devPH,
          manualValue: manPH,
          unit: 'pH'
        });

        // Use resolved choice if provided, otherwise default to DEVICE with caution
        const choice = conflictResolution?.['pH']?.choice || 'DEVICE';
        if (choice === 'MANUAL') {
          effectivePH = manPH;
          phSource = 'USER';
          whyThisResult.push(`Used user-entered manual pH (${manPH.toFixed(2)}) as preferred.`);
        } else {
          effectivePH = devPH;
          phSource = 'DEVICE';
          whyThisResult.push(`Used device pH reading (${devPH.toFixed(2)}) following sensor calibration.`);
        }
      }
    } else if (!sensors && manual?.knownMeasurements?.pH !== undefined) {
      effectivePH = manual.knownMeasurements.pH;
      phSource = 'USER';
    }

    // Moisture handling
    let effectiveMoisture = sensors?.moistureEstimate || spectral?.calibratedMoistureEstimate;
    let moistureSource: 'DEVICE' | 'USER' | 'MODEL' = 'MODEL';

    if (manual?.knownMeasurements?.moisture !== undefined) {
      if (effectiveMoisture !== undefined && Math.abs(effectiveMoisture - manual.knownMeasurements.moisture) > 4) {
        conflicts.push({
          parameter: 'Moisture',
          deviceValue: effectiveMoisture,
          manualValue: manual.knownMeasurements.moisture,
          unit: '%'
        });
      }
      if (conflictResolution?.['Moisture']?.choice === 'MANUAL' || !effectiveMoisture) {
        effectiveMoisture = manual.knownMeasurements.moisture;
        moistureSource = 'USER';
      }
    }

    // Temperature handling
    const effectiveTemp = sensors?.sampleTemp ?? manual?.knownMeasurements?.temperature ?? 25.0;
    const ambientTemp = sensors?.ambientTemp ?? 24.0;
    const tempDelta = effectiveTemp - ambientTemp;

    // Build Provenance Records
    if (effectivePH !== undefined) {
      provenanceList.push({
        sample_id: sampleId,
        parameter: 'pH',
        value: effectivePH,
        unit: 'pH',
        source: phSource,
        entered_by: phSource === 'DEVICE' ? 'SS-ESP32-9042' : 'User Manual Entry',
        timestamp: now,
        confidence: sensors?.isStablePH ? 'HIGH' : 'MEDIUM'
      });
    }

    if (effectiveMoisture !== undefined) {
      provenanceList.push({
        sample_id: sampleId,
        parameter: 'moisture',
        value: effectiveMoisture,
        unit: '%',
        source: moistureSource,
        entered_by: moistureSource === 'USER' ? 'User Manual' : 'v0.9-nir-cal',
        timestamp: now,
        confidence: 'HIGH'
      });
    }

    // Record Visual and Lab provenance if present
    if (visual) {
      provenanceList.push({
        sample_id: sampleId,
        parameter: 'surface_mould',
        value: visual.moldDetected,
        source: 'MODEL',
        entered_by: visual.modelVersion,
        timestamp: now,
        confidence: visual.accepted ? 'HIGH' : 'LOW'
      });
    }

    if (manual?.labValues?.labAflatoxinB1Ppb !== undefined) {
      provenanceList.push({
        sample_id: sampleId,
        parameter: 'aflatoxin_b1',
        value: manual.labValues.labAflatoxinB1Ppb,
        unit: 'ppb',
        source: 'LAB',
        entered_by: manual.labValues.labName || 'Reference Laboratory',
        timestamp: manual.labValues.labDate || now,
        confidence: 'HIGH'
      });
    }

    // 2. CHECK OUT-OF-DISTRIBUTION (OOD)
    if (ood?.isOOD) {
      return {
        category: 'UNKNOWN',
        categoryHeadline: 'Unable to Assess Confidently',
        summaryMessage: 'This sample has physical and sensor characteristics outside our validated reference database.',
        recommendation: 'Do not rely on this screening. Clean the sample cup and repeat with a fresh core sample, or submit to an accredited feed testing laboratory.',
        warnings: [
          'Atypical measurement signature detected.',
          ...ood.deviatingFeatures
        ],
        whyThisResult: [
          'Statistical anomaly detection flagged atypical sensor combinations.',
          ...ood.deviatingFeatures,
          'Screening model refused prediction to prevent false assurance.'
        ],
        confidence: 'LOW',
        findings: [
          { parameter: 'Anomalous Signature', label: 'Anomaly Score', valueString: `${ood.anomalyScore.toFixed(1)} / 10.0`, status: 'ALERT', explanation: 'Significantly exceeds standard reference distribution threshold.' }
        ],
        conflicts,
        provenanceList,
        modelVersions: {
          visionModel: visual?.modelVersion || 'v1.4.2-vis-edge',
          spectralModel: spectral?.modelVersion || 'v0.9-nir-cal',
          decisionEngine: this.version
        }
      };
    }

    // 3. CHECK SENSOR STABILITY
    if (sensors && !sensors.isStablePH) {
      warnings.push('pH sensor readings showed signal noise or instability. Probe cleaning recommended.');
      whyThisResult.push('pH probe stability test indicated drift.');
    }

    // 4. DETERMINISTIC AGRICULTURAL RULES
    let category: ResultCategory = 'GREEN';
    let categoryHeadline = 'Screening Consistent';
    let summaryMessage = 'The measured indicators are consistent with a normally fermented, safe sample.';
    let recommendation = 'Silage is well preserved with adequate fermentation. Safe for regular dairy ration inclusion.';
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';

    const moldDetected = visual?.moldDetected || manual?.observations?.visibleMold;
    const isHeating = tempDelta > 6.0 || effectiveTemp >= 35.0;

    // --- Silage Specific Evaluation ---
    if (sampleType === 'SILAGE') {
      // pH Rules for Corn Silage: 3.8 - 4.2 is ideal; > 4.6 is elevated; > 5.0 is poor
      const targetMinPH = 3.8;
      const targetMaxPH = 4.4;

      if (effectivePH !== undefined) {
        if (effectivePH < targetMinPH) {
          findings.push({
            parameter: 'pH',
            label: 'pH Level',
            valueString: effectivePH.toFixed(2),
            status: 'CAUTION',
            explanation: `Slightly low pH (<${targetMinPH}). Very acidic, monitor dry matter intake.`
          });
          whyThisResult.push(`pH ${effectivePH.toFixed(2)} is lower than standard corn silage baseline (${targetMinPH} - ${targetMaxPH}).`);
        } else if (effectivePH <= targetMaxPH) {
          findings.push({
            parameter: 'pH',
            label: 'pH Level',
            valueString: effectivePH.toFixed(2),
            status: 'NORMAL',
            explanation: `Optimal lactic fermentation range (${targetMinPH} - ${targetMaxPH}).`
          });
          whyThisResult.push(`pH ${effectivePH.toFixed(2)} indicates effective lactic acid fermentation.`);
        } else if (effectivePH <= 4.8) {
          findings.push({
            parameter: 'pH',
            label: 'pH Level',
            valueString: effectivePH.toFixed(2),
            status: 'CAUTION',
            explanation: `Elevated pH (> ${targetMaxPH}). Risk of secondary fermentation.`
          });
          category = 'YELLOW';
          categoryHeadline = 'Review Required';
          summaryMessage = 'Silage pH is slightly elevated above optimal fermentation benchmarks.';
          recommendation = 'Feed from this section soon. Check pit face compaction and ensure silo face is cut cleanly.';
          whyThisResult.push(`Elevated pH (${effectivePH.toFixed(2)}) indicates slower acid stabilization.`);
        } else {
          // pH > 4.8
          findings.push({
            parameter: 'pH',
            label: 'pH Level',
            valueString: effectivePH.toFixed(2),
            status: 'ALERT',
            explanation: `High pH (${effectivePH.toFixed(2)}). Indicates failed lactic fermentation or butyric risk.`
          });
          category = 'RED';
          categoryHeadline = 'Laboratory Confirmation Required';
          summaryMessage = 'High pH indicates inadequate fermentation and spoilage risk. Do not feed without confirmation.';
          recommendation = 'Isolate this batch. Inspect pit for moisture pockets or air infiltration. Request professional laboratory fermentation profile.';
          whyThisResult.push(`High pH (${effectivePH.toFixed(2)}) allows spoilage microorganisms and clostridia to survive.`);
        }
      }

      // Moisture Rules
      if (effectiveMoisture !== undefined) {
        if (effectiveMoisture < 50) {
          findings.push({
            parameter: 'Moisture',
            label: 'Moisture Estimate',
            valueString: `${effectiveMoisture.toFixed(1)}%`,
            status: 'CAUTION',
            explanation: 'Silage is unusually dry (<50%). High risk of air pockets and fungal mold.'
          });
          if (category === 'GREEN') category = 'YELLOW';
          whyThisResult.push(`Low moisture (${effectiveMoisture.toFixed(1)}%) promotes aerobic deterioration.`);
        } else if (effectiveMoisture <= 68) {
          findings.push({
            parameter: 'Moisture',
            label: 'Moisture Estimate',
            valueString: `${effectiveMoisture.toFixed(1)}%`,
            status: 'NORMAL',
            explanation: 'Optimal moisture range (50% - 68%) for bunker consolidation.'
          });
          whyThisResult.push(`Moisture estimate (${effectiveMoisture.toFixed(1)}%) provides good packing density.`);
        } else {
          // > 68%
          findings.push({
            parameter: 'Moisture',
            label: 'Moisture Estimate',
            valueString: `${effectiveMoisture.toFixed(1)}%`,
            status: 'CAUTION',
            explanation: 'Silage is very wet (>68%). Potential for effluent loss and clostridial growth.'
          });
          if (category === 'GREEN') category = 'YELLOW';
          whyThisResult.push(`High moisture (${effectiveMoisture.toFixed(1)}%) increases seepage and butyric acid risk.`);
        }
      }

      // Temperature / Aerobic Heating Rules
      if (isHeating) {
        findings.push({
          parameter: 'Temperature',
          label: 'Sample Temperature',
          valueString: `${effectiveTemp.toFixed(1)}°C (+${tempDelta.toFixed(1)}°C ambient)`,
          status: 'ALERT',
          explanation: 'Aerobic heating detected. Yeasts and molds are metabolizing carbohydrates.'
        });
        warnings.push(`Sample temperature (${effectiveTemp.toFixed(1)}°C) is heating significantly above ambient (${ambientTemp.toFixed(1)}°C).`);
        whyThisResult.push(`Active heating indicates oxygen exposure and aerobic spoilage at bunker face.`);

        if (effectiveTemp >= 38.0 || moldDetected) {
          category = 'RED';
          categoryHeadline = 'Laboratory Confirmation Required';
          summaryMessage = 'Significant heating and aerobic deterioration detected. Unsafe for direct feeding.';
          recommendation = 'Discard hot, discolored material. Feed from fresh unexposed silage face. Check face feed-out rate (advance at least 15-20 cm daily).';
        } else {
          category = 'YELLOW';
          categoryHeadline = 'Review Required';
          summaryMessage = 'Mild heating detected. Feed promptly to avoid nutrient breakdown.';
        }
      } else {
        findings.push({
          parameter: 'Temperature',
          label: 'Sample Temperature',
          valueString: `${effectiveTemp.toFixed(1)}°C`,
          status: 'NORMAL',
          explanation: 'Temperature is cool and stable near ambient. No heating detected.'
        });
        whyThisResult.push(`Sample temperature (${effectiveTemp.toFixed(1)}°C) confirms no active aerobic heating.`);
      }

      // Visual Mould Rules
      if (moldDetected) {
        findings.push({
          parameter: 'Mould',
          label: 'Visible Mould',
          valueString: 'Detected',
          status: 'ALERT',
          explanation: 'Surface fungal mycelium or white/grey mold colonies observed.'
        });
        warnings.push('Visible mould detected on sample surface. Potential mycotoxin hazard.');
        whyThisResult.push('Computer vision inspection identified mold mycelium on feed particles.');

        if (category !== 'RED') {
          category = 'YELLOW';
          categoryHeadline = 'Review Required';
          summaryMessage = 'Visible mould detected on sample. Do not feed affected portions to lactating cows or calves.';
          recommendation = 'Physically discard moldy clumps. Do not mix moldy crust into TMR ration. Consider mycotoxin binder or laboratory verification.';
        }
      } else {
        findings.push({
          parameter: 'Mould',
          label: 'Visible Mould',
          valueString: 'Not detected',
          status: 'NORMAL',
          explanation: 'Surface visual scan detected clean, uniform chop without mold clusters.'
        });
      }

    } else {
      // --- Cattle Feed (Pellets / Concentrate) Specific Evaluation ---
      const safeMoistureLimit = 12.5;

      if (effectiveMoisture !== undefined) {
        if (effectiveMoisture <= safeMoistureLimit) {
          findings.push({
            parameter: 'Moisture',
            label: 'Pellet Moisture',
            valueString: `${effectiveMoisture.toFixed(1)}%`,
            status: 'NORMAL',
            explanation: `Inside safe dry storage benchmark (<= ${safeMoistureLimit}%).`
          });
          whyThisResult.push(`Feed pellet moisture (${effectiveMoisture.toFixed(1)}%) is dry enough to prevent mold during storage.`);
        } else if (effectiveMoisture <= 15.0) {
          findings.push({
            parameter: 'Moisture',
            label: 'Pellet Moisture',
            valueString: `${effectiveMoisture.toFixed(1)}%`,
            status: 'CAUTION',
            explanation: `Elevated moisture (> ${safeMoistureLimit}%). High risk of spoilage if stored.`
          });
          category = 'YELLOW';
          categoryHeadline = 'Review Required';
          summaryMessage = 'Feed pellet moisture is elevated. Feed quickly and avoid stacking in damp godown.';
          recommendation = 'Store feed bags on wooden pallets off concrete floors. Feed current batch within 3-4 days.';
          whyThisResult.push(`Elevated moisture (${effectiveMoisture.toFixed(1)}%) invites fungal growth.`);
        } else {
          // > 15%
          findings.push({
            parameter: 'Moisture',
            label: 'Pellet Moisture',
            valueString: `${effectiveMoisture.toFixed(1)}%`,
            status: 'ALERT',
            explanation: `Excessive moisture (>15%). Imminent mould and mycotoxin risk.`
          });
          category = 'RED';
          categoryHeadline = 'Laboratory Confirmation Required';
          summaryMessage = 'Feed moisture is dangerously high. Susceptible to rapid mycotoxin formation.';
          recommendation = 'Reject or isolate this feed delivery. Inspect for caking and foul odor. Contact supplier.';
          whyThisResult.push(`Moisture content (${effectiveMoisture.toFixed(1)}%) violates safe dry feed storage standards.`);
        }
      }

      if (moldDetected) {
        category = 'RED';
        categoryHeadline = 'Laboratory Confirmation Required';
        summaryMessage = 'Visible mould detected on feed pellets. High mycotoxin risk.';
        recommendation = 'Do NOT feed moldy concentrate to dairy animals. Mycotoxins severely reduce milk yield and impair liver health.';
        warnings.push('Visible mould detected on cattle feed.');
      }
    }

    // Safety-critical override: Manual lab toxin test if >20 ppb Aflatoxin B1
    if (manual?.labValues?.labAflatoxinB1Ppb !== undefined && manual.labValues.labAflatoxinB1Ppb > 20) {
      category = 'RED';
      categoryHeadline = 'Laboratory Confirmation Required';
      summaryMessage = `Laboratory test records confirm Aflatoxin B1 level (${manual.labValues.labAflatoxinB1Ppb} ppb) exceeds safety threshold (20 ppb).`;
      recommendation = 'Mandatory discard. Do not feed to milk-producing cows. Aflatoxin M1 will pass into milk supply.';
      warnings.push(`Safety rule override: Lab Aflatoxin B1 level (${manual.labValues.labAflatoxinB1Ppb} ppb) exceeds regulatory limit.`);
      whyThisResult.unshift('Laboratory reference record indicates hazardous toxin contamination.');
    }

    // Confidence determination
    if (conflicts.length > 0 || !sensors || !visual?.accepted) {
      confidence = 'MEDIUM';
    }
    if (!sensors && !manual) {
      confidence = 'LOW';
    }

    return {
      category,
      categoryHeadline,
      summaryMessage,
      recommendation,
      warnings,
      whyThisResult,
      confidence,
      findings,
      conflicts,
      provenanceList,
      modelVersions: {
        visionModel: visual?.modelVersion || 'v1.4.2-vis-edge',
        spectralModel: spectral?.modelVersion || 'v0.9-nir-cal',
        decisionEngine: this.version
      }
    };
  }
};
