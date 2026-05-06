import { describe, it, expect } from 'vitest';
import { getAdversarialDisplayState, AnnotationData } from '../adversarial-display-state.js';

describe('getAdversarialDisplayState', () => {
  const annotationData: AnnotationData = {
    trigger: 'adversarial-review',
    specName: 'my-feature',
    phase: 'requirements',
    analysisVersion: 2,
  };

  it('returns null when no job and no annotation data', () => {
    const result = getAdversarialDisplayState(
      undefined,
      { status: 'pending' },
      null,
      null,
    );
    expect(result).toBeNull();
  });

  it('returns null when no job and approval is pending (not needs-revision)', () => {
    const result = getAdversarialDisplayState(
      undefined,
      { status: 'pending' },
      annotationData,
      true,
    );
    expect(result).toBeNull();
  });

  it('returns null when job completed but approval is pending (stale job)', () => {
    const result = getAdversarialDisplayState(
      { status: 'completed', specName: 'my-feature', phase: 'requirements' },
      { status: 'pending' },
      annotationData,
      null,
    );
    expect(result).toBeNull();
  });

  it('returns null when job failed but approval is pending (stale job)', () => {
    const result = getAdversarialDisplayState(
      { status: 'failed', error: 'timeout', specName: 'my-feature', phase: 'requirements' },
      { status: 'pending' },
      annotationData,
      null,
    );
    expect(result).toBeNull();
  });

  it('returns job status when job is actively running', () => {
    const result = getAdversarialDisplayState(
      { status: 'running-review', specName: 'my-feature', phase: 'requirements' },
      { status: 'needs-revision' },
      annotationData,
      null,
    );
    expect(result).toEqual({
      status: 'running-review',
      error: undefined,
      specName: 'my-feature',
      phase: 'requirements',
      version: 2,
    });
  });

  it('returns completed when annotation exists, approval is needs-revision, analysis verified', () => {
    const result = getAdversarialDisplayState(
      undefined,
      { status: 'needs-revision' },
      annotationData,
      true,
    );
    expect(result).toEqual({
      status: 'completed',
      specName: 'my-feature',
      phase: 'requirements',
      version: 2,
    });
  });

  it('returns incomplete when annotation exists, approval is needs-revision, analysis not verified', () => {
    const result = getAdversarialDisplayState(
      undefined,
      { status: 'needs-revision' },
      annotationData,
      false,
    );
    expect(result).toEqual({
      status: 'incomplete',
      specName: 'my-feature',
      phase: 'requirements',
      version: 2,
    });
  });

  it('returns null when analysis still checking (null)', () => {
    const result = getAdversarialDisplayState(
      undefined,
      { status: 'needs-revision' },
      annotationData,
      null,
    );
    expect(result).toBeNull();
  });
});
