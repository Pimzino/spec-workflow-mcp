/**
 * Pure function to determine the adversarial review display state.
 * Extracted from ApprovalsPage.tsx so it can be tested with vitest
 * (the vitest config excludes dashboard_frontend).
 */

export interface AdversarialDisplayState {
  status: string;
  error?: string;
  specName: string;
  phase: string;
  version?: number;
}

export interface AnnotationData {
  trigger: string;
  specName?: string;
  phase?: string;
  analysisVersion?: number;
  [key: string]: any;
}

/**
 * Determines what adversarial review state to display for an approval.
 *
 * @param job - The live adversarial job (if any)
 * @param approval - The approval object (needs at minimum: status, categoryName, annotations)
 * @param annotationData - Parsed annotation data (or null if no adversarial annotations)
 * @param analysisVerified - Whether the analysis file exists on disk (true/false/null for still checking)
 * @returns Display state, or null if nothing should be shown
 */
export function getAdversarialDisplayState(
  job: { status: string; error?: string; specName: string; phase: string } | undefined | null,
  approval: { status: string; categoryName?: string },
  annotationData: AnnotationData | null,
  analysisVerified: boolean | null,
): AdversarialDisplayState | null {
  if (job) {
    // If the job already completed/failed but the approval has moved back to pending
    // (document was revised and resubmitted), the review cycle is over — don't show banner.
    if ((job.status === 'completed' || job.status === 'failed') && approval.status === 'pending') {
      return null;
    }
    return {
      status: job.status,
      error: job.error,
      specName: job.specName,
      phase: job.phase,
      version: annotationData?.analysisVersion,
    };
  }

  if (annotationData && approval.status === 'needs-revision') {
    const specName = annotationData.specName || approval.categoryName || '';
    const phase = annotationData.phase || '';
    const version = annotationData.analysisVersion;

    if (analysisVerified === true) {
      return { status: 'completed', specName, phase, version };
    }
    if (analysisVerified === false) {
      return { status: 'incomplete', specName, phase, version };
    }
    // analysisVerified === null means still checking, don't show anything yet
    return null;
  }

  return null;
}
