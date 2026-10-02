import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  outputDir: 'test-results/artifacts',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5173',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  },
  webServer: [
    { command: 'npm run dev', url: 'http://localhost:5173/lab.html', reuseExistingServer: true, timeout: 60_000 },
    // Build de production servi localement, pour les tests PWA (hors ligne, manifest, service worker).
    { command: 'npm run build && npm run preview', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 120_000 },
    // Même build servi dans un sous-dossier (hébergement pas encore choisi).
    { command: 'npx vite preview --port 4174 --strictPort --base /sous-dossier/', url: 'http://localhost:4174/sous-dossier/', reuseExistingServer: true, timeout: 120_000 },
  ],
});
