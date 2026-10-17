import {defineConfig} from '@playwright/test';
// Screenshot baselines are the supplied Photoshop composites, not renders from
// one platform, so every OS compares against the same files.
export default defineConfig({testDir:'./tests/e2e',snapshotPathTemplate:'{testDir}/{testFileName}-snapshots/{arg}{ext}',timeout:60000,expect:{timeout:10000},use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:4173',headless:true},webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{command:'npm run dev -- --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},reporter:'list'});
