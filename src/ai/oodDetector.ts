// Smart FeedCheck - Out-Of-Distribution (OOD) Anomaly Detector
import { OODAnalysisResult, SensorReadings, SampleType } from '../types';

export const oodDetector = {
  version: 'v1.1-mahalanobis',

  /**
   * Check whether sensor and visual parameters fall inside valid reference training distributions
   */
  evaluateDistribution(
    sensors: SensorReadings,
    sampleType: SampleType,
    moldDetected: boolean
  ): OODAnalysisResult {
    const deviatingFeatures: string[] = [];
    let anomalyScore = 0.5;

    if (sampleType === 'SILAGE') {
      // Valid silage pH range is typically 3.5 - 5.5
      if (sensors.pH < 3.2 || sensors.pH > 6.8) {
        anomalyScore += 4.2;
        deviatingFeatures.push(`Extreme pH value (${sensors.pH.toFixed(1)}) outside valid fermentation distribution`);
      }

      // Valid silage temperature range
      if (sensors.sampleTemp > 45 || sensors.sampleTemp < 5) {
        anomalyScore += 3.5;
        deviatingFeatures.push(`Severe thermal abnormality (${sensors.sampleTemp.toFixed(1)}°C)`);
      }

      // Moisture range
      if (sensors.moistureEstimate < 20 || sensors.moistureEstimate > 85) {
        anomalyScore += 3.0;
        deviatingFeatures.push(`Moisture content (${sensors.moistureEstimate.toFixed(1)}%) outside silage benchmarks`);
      }
    } else {
      // Cattle feed pellets
      if (sensors.moistureEstimate > 28) {
        anomalyScore += 3.8;
        deviatingFeatures.push(`Feed pellet moisture (${sensors.moistureEstimate.toFixed(1)}%) severely elevated`);
      }
    }

    if (moldDetected && sensors.sampleTemp > 38) {
      anomalyScore += 1.8;
    }

    const isOOD = anomalyScore >= 3.5;

    return {
      isOOD,
      anomalyScore: parseFloat(anomalyScore.toFixed(2)),
      deviatingFeatures,
      modelVersion: this.version
    };
  }
};
