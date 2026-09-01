#!/usr/bin/env node
/**
 * scripts/bump-version.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Bump de versión de Ptime respetando el esquema oficial del proyecto:
 *
 *   MAJOR.MINOR.FEATURE.FIX   (ej: 1.2.64.13)
 *
 *   - feature  → sube FEATURE, resetea FIX a 0   (1.2.64.13 → 1.2.65.0)
 *   - fix      → sube FIX                         (1.2.64.13 → 1.2.64.14)
 *   - major    → sube MAJOR, resetea todo         (1.2.x → 2.0.0.0)
 *
 * Esquema real del proyecto (usado por Agy):
 *   - "1.2.64"       → feature en el tercer segmento
 *   - "1.2.64.1"     → fix sobre esa feature
 *   - "1.2.63.5"     → fixes del feature 63
 *
 * Uso:
 *   node scripts/bump-version.mjs feature
 *   node scripts/bump-version.mjs fix
 *   node scripts/bump-version.mjs major
 *
 * Actualiza: package.json, package-lock.json (via npm install) y Sidebar.tsx.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkgPath = path.join(root, "package.json");
const sidebarPath = path.join(root, "components/layout/Sidebar.tsx");

const type = process.argv[2];
if (!["feature", "fix", "major"].includes(type)) {
  console.error("Uso: node scripts/bump-version.mjs <feature|fix|major>");
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const parts = pkg.version.split(".").map(Number);
const [major, minor, feature, fix] = [parts[0], parts[1], parts[2] ?? 0, parts[3] ?? 0];

let next;
switch (type) {
  case "feature":
    next = `${major}.${minor}.${feature + 1}.0`;
    break;
  case "fix":
    next = `${major}.${minor}.${feature}.${fix + 1}`;
    break;
  case "major":
    next = `${major + 1}.0.0.0`;
    break;
}

pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

// Sidebar
let sidebar = readFileSync(sidebarPath, "utf8");
sidebar = sidebar.replace(/Ptime v[0-9.]+/, `Ptime v${next}`);
writeFileSync(sidebarPath, sidebar, "utf8");

// package-lock.json sync
try {
  execSync("npm install --silent", { cwd: root, stdio: "ignore" });
} catch {
  // no-op: lockfile se sincroniza en el próximo install
}

console.log(`✅ Version bumped: ${pkg.version} → ${next} (${type})`);
console.log("   Recuerdá actualizar CHANGELOG.md con la nueva entrada.");
