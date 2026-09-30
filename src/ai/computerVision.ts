// Smart FeedCheck - Computer Vision Quality & Visual Analysis Model
import { VisualAnalysisResult, SampleType } from '../types';

export const computerVisionModel = {
  version: 'v1.4.2-vis-edge',
  
  /**
   * Run pre-inference image quality check & surface inspection
   */
  async analyzeSampleImage(
    imageDataOrUrl: string,
    sampleType: SampleType,
    mockQualityOverride?: 'BLUR' | 'DARK' | 'MOLD' | 'NORMAL'
  ): Promise<VisualAnalysisResult> {
    // Simulate lightweight on-device edge inference latency
    await new Promise(r => setTimeout(r, 450));

    if (mockQualityOverride === 'BLUR') {
      return {
        accepted: false,
        rejectReason: 'Sample image is blurred (Motion/focus error).',
        blurScore: 34,
        brightnessScore: 78,
        samplePresenceDetected: true,
        moldDetected: false,
        moldConfidence: 0.0,
        chopConsistency: 'UNIFORM',
        colorTone: 'NORMAL_GREEN_GOLD',
        modelVersion: this.version
      };
    }

    if (mockQualityOverride === 'DARK') {
      return {
        accepted: false,
        rejectReason: 'Chamber illumination is insufficient or lens obstructed.',
        blurScore: 70,
        brightnessScore: 19,
        samplePresenceDetected: false,
        moldDetected: false,
        moldConfidence: 0.0,
        chopConsistency: 'UNIFORM',
        colorTone: 'BLACKENED',
        modelVersion: this.version
      };
    }

    const hasMold = mockQualityOverride === 'MOLD';

    return {
      accepted: true,
      blurScore: 92,
      brightnessScore: 84,
      samplePresenceDetected: true,
      moldDetected: hasMold,
      moldConfidence: hasMold ? 0.88 : 0.02,
      chopConsistency: sampleType === 'SILAGE' ? 'UNIFORM' : 'COARSE',
      colorTone: hasMold ? 'DARKENED_BROWN' : 'NORMAL_GREEN_GOLD',
      modelVersion: this.version
    };
  }
};
