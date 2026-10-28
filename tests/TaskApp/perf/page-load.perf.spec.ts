import { test, expect, type Page } from '@playwright/test';

// Budgets are deliberately generous so CI runners don't flake; tighten them for your own targets.
// LCP thresholds follow Google's Core Web Vitals ("good" is under 2.5 s).
const BUDGET = {
  domContentLoadedMs: 1000,
  loadMs: 2000,
  lcpMs: 2500,
  throttledLcpMs: 4000,
};

test.describe.configure({ mode: 'serial' });

async function collectPageMetrics(page: Page) {
  return page.evaluate(async () => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const lcp = await new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries[entries.length - 1].startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    return {
      domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      loadMs: Math.round(nav.loadEventEnd - nav.startTime),
      transferBytes: nav.transferSize,
      lcpMs: Math.round(lcp),
    };
  });
}

test('home page loads within budget', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem').first()).toBeVisible();

  const metrics = await collectPageMetrics(page);
  await testInfo.attach('page-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });

  expect(metrics.domContentLoadedMs).toBeLessThan(BUDGET.domContentLoadedMs);
  expect(metrics.loadMs).toBeLessThan(BUDGET.loadMs);
  expect(metrics.lcpMs).toBeLessThan(BUDGET.lcpMs);
});

test('home page stays usable on a slow 4G connection', async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium', 'Network throttling uses the Chrome DevTools Protocol');

  // Lighthouse's "Slow 4G" profile: 150 ms RTT, 1.6 Mbps down, 750 Kbps up.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Tasks' }).getByRole('listitem').first()).toBeVisible();

  const metrics = await collectPageMetrics(page);
  await testInfo.attach('throttled-page-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });

  expect(metrics.lcpMs).toBeLessThan(BUDGET.throttledLcpMs);
});
