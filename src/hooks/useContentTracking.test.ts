import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTrackView, trackConversion } from './useContentTracking';
import { renderHook, waitFor } from '@testing-library/react';

// Tracking is auth-gated server-side; pretend no one is logged in.
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const UUID1 = '33333333-3333-3333-3333-333333333333';
const UUID2 = '44444444-4444-4444-4444-444444444444';

describe('useContentTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    Object.defineProperty(global, 'navigator', {
      value: { userAgent: 'Mozilla/5.0' },
      configurable: true,
    });
  });

  it('POSTs a view to /api/track with consent-gated persistent visitor_id', async () => {
    localStorage.setItem('regent-cookie-consent', 'accepted');
    renderHook(() => useTrackView('blog_post', UUID1));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.kind).toBe('view');
    expect(body.content_type).toBe('blog_post');
    expect(body.content_id).toBe(UUID1);
    expect(body.page_path).toBeNull();
    expect(body.session_id).toBeDefined();
    expect(body.visitor_id).toBeDefined();
    // persistent visitor id only with consent
    expect(localStorage.getItem('regent_visitor_id')).toBe(body.visitor_id);
  });

  it('reuses the same persistent visitor id across views after consent', async () => {
    localStorage.setItem('regent-cookie-consent', 'accepted');
    renderHook(() => useTrackView('blog_post', UUID1));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const first = JSON.parse(fetchMock.mock.calls[0][1].body).visitor_id;

    fetchMock.mockClear();
    renderHook(() => useTrackView('blog_post', UUID2));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const second = JSON.parse(fetchMock.mock.calls[0][1].body).visitor_id;

    expect(first).toBe(second);
    expect(localStorage.getItem('regent_visitor_id')).toBe(first);
  });

  it('does not persist a visitor id before consent (session-scoped only)', async () => {
    renderHook(() => useTrackView('blog_post', UUID1));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(localStorage.getItem('regent_visitor_id')).toBeNull();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.visitor_id).toBeDefined(); // ephemeral, session-scoped
  });

  it('sends conversions through /api/track with type and ref_id', async () => {
    await trackConversion('newsletter', UUID1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.kind).toBe('conversion');
    expect(body.type).toBe('newsletter');
    expect(body.ref_id).toBe(UUID1);
  });
});
