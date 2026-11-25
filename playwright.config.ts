import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const hasGameCheckout = existsSync('C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json')
  && existsSync('C:/dev/Lunaria/LunariaArtLibrary');
const gameScenarios = [
  'ally-walk', 'animation-sheet-replacement', 'capabilities', 'cigarette',
  'compactor', 'escort-level', 'hazel-defense', 'ivy-replacement', 'occupied-board',
  'plastic-bag', 'polluter-animations', 'pose-generation', 'trash-bin-animations',
];

export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1,
  // These scenarios use the separate game checkout and its private source art.
  testIgnore: process.env.CI && !hasGameCheckout ? gameScenarios.map(name => `**/${name}.spec.ts`) : [],
  timeout: 45000, expect: { timeout: 8000 }, retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
});
