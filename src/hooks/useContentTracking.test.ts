import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTrackView } from './useContentTracking';
import { renderHook, waitFor } from '@testing-library/react';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: { id: 'test-view-id' }, error: null }),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  then: vi.fn().mockImplementation((cb) => Promise.resolve(cb())),
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('useContentTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    // Mock navigator
    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0' },
      configurable: true
    });
  });

  it('generates and persists visitor_id and session_id', async () => {
    renderHook(() => useTrackView('blog_post', 'test-id'));

    await waitFor(() => {
      const visitorId = localStorage.getItem('regent_visitor_id');
      const sessionId = sessionStorage.getItem('regent_session_id');
      expect(visitorId).toBeDefined();
      expect(sessionId).toBeDefined();
      expect(visitorId).not.toBe(sessionId);
    });
  });

  it('identifies returning visitors via session_id', async () => {
    renderHook(() => useTrackView('blog_post', 'test-id'));
    let vid1: string | null = null;
    await waitFor(() => {
      vid1 = localStorage.getItem('regent_visitor_id');
      expect(vid1).not.toBeNull();
    });

    renderHook(() => useTrackView('blog_post', 'test-id-2'));
    await waitFor(() => {
      const vid2 = localStorage.getItem('regent_visitor_id');
      expect(vid1).toBe(vid2);
    });
  });
});
