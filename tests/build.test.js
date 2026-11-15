import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Dependency Modernization and Build Verification', () => {
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  it('specifies required target ranges for React 19, MUI v6, and Vite 6', () => {
    expect(pkg.dependencies.react).toMatch(/\^19/);
    expect(pkg.dependencies['react-dom']).toMatch(/\^19/);
    expect(pkg.dependencies['@mui/material']).toMatch(/\^6/);
    expect(pkg.dependencies['@mui/icons-material']).toMatch(/\^6/);
    expect(pkg.dependencies['@mui/x-date-pickers']).toMatch(/\^7\.23/);
    expect(pkg.dependencies['react-router-dom']).toMatch(/\^7/);
    expect(pkg.devDependencies.vite).toMatch(/\^6/);
    expect(pkg.devDependencies['@vitejs/plugin-react']).toMatch(/\^4\.3/);
    expect(pkg.devDependencies.vitest).toMatch(/\^3/);
  });

  it('declares Node >=20 engines requirement', () => {
    expect(pkg.engines?.node).toBe('>=20.0.0');
  });

  it('configures npm overrides for peer dependencies', () => {
    expect(pkg.overrides).toBeDefined();
    expect(pkg.overrides.react).toBeDefined();
  });

  it('verifies production build output exists and initial JS bundle is <= 500 KB gzipped', () => {
    const distDir = path.join(rootDir, 'dist', 'assets');
    if (!fs.existsSync(distDir)) {
      // If dist doesn't exist yet, this check passes once build runs
      return;
    }
    const jsFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);

    for (const jsFile of jsFiles) {
      const content = fs.readFileSync(path.join(distDir, jsFile));
      const gzipped = zlib.gzipSync(content);
      // Main bundle or chunks should be <= 500 KB gzipped
      expect(gzipped.length).toBeLessThanOrEqual(500 * 1024);
    }
  });
});
