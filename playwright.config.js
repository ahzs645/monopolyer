import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/e2e',timeout:60000,expect:{timeout:10000},use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:4173',headless:true},webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{command:'npm run dev -- --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},reporter:'list'});
