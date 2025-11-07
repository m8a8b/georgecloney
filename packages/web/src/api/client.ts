/**
 * API Client for CloneLab Python backend
 */

import type {
  SequenceRecord,
  RestrictionSite,
  EnzymePair,
  DigestResponse,
  HealthResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      `API Error: ${response.statusText}`,
      response.status,
      errorData.detail
    );
  }

  return response.json();
}

// ============================================================================
// Health & Info
// ============================================================================

export async function getHealth(): Promise<HealthResponse> {
  return fetchAPI<HealthResponse>('/health');
}

// ============================================================================
// Sequence Operations
// ============================================================================

export interface ParseSequenceRequest {
  content: string;
  format?: 'fasta' | 'genbank';
}

export async function parseSequence(
  request: ParseSequenceRequest
): Promise<SequenceRecord> {
  return fetchAPI<SequenceRecord>('/api/sequences/parse', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export interface ParseMultiFastaResponse {
  sequences: SequenceRecord[];
  count: number;
}

export async function parseMultiFasta(
  content: string
): Promise<ParseMultiFastaResponse> {
  return fetchAPI<ParseMultiFastaResponse>('/api/sequences/parse-multi', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export interface DetectFormatResponse {
  format: 'fasta' | 'genbank' | 'unknown';
}

export async function detectFormat(
  content: string
): Promise<DetectFormatResponse> {
  return fetchAPI<DetectFormatResponse>('/api/sequences/detect-format', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// ============================================================================
// Enzyme Operations
// ============================================================================

export interface FindSitesRequest {
  sequence: string;
  topology?: 'linear' | 'circular';
  enzymes?: string[];
}

export interface FindSitesResponse {
  sites: Record<string, RestrictionSite[]>;
}

export async function findEnzymeSites(
  request: FindSitesRequest
): Promise<FindSitesResponse> {
  return fetchAPI<FindSitesResponse>('/api/enzymes/find-sites', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export interface CountSitesResponse {
  counts: Record<string, number>;
}

export async function countEnzymeSites(
  request: FindSitesRequest
): Promise<CountSitesResponse> {
  return fetchAPI<CountSitesResponse>('/api/enzymes/count-sites', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export interface SingleCuttersResponse {
  enzymes: string[];
  count: number;
}

export async function getSingleCutters(
  request: FindSitesRequest
): Promise<SingleCuttersResponse> {
  return fetchAPI<SingleCuttersResponse>('/api/enzymes/single-cutters', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export interface SuggestPairsRequest {
  vector_sequence: string;
  insert_sequence: string;
  vector_topology?: 'linear' | 'circular';
}

export interface SuggestPairsResponse {
  pairs: EnzymePair[];
}

export async function suggestEnzymePairs(
  request: SuggestPairsRequest
): Promise<SuggestPairsResponse> {
  return fetchAPI<SuggestPairsResponse>('/api/enzymes/suggest-pairs', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ============================================================================
// Digest Operations
// ============================================================================

export interface SimulateDigestRequest {
  sequence_id: string; // For now, this is the sequence itself
  enzymes: string[];
  topology?: 'linear' | 'circular';
}

export async function simulateDigest(
  request: SimulateDigestRequest
): Promise<DigestResponse> {
  return fetchAPI<DigestResponse>('/api/digest/simulate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Export error class
export { APIError };
