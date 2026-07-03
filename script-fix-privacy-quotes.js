// script-fix-feature5-desc.js — fix Feature 5 description in lib/landing-i18n.ts
const fs = require('fs');

const path = 'lib/landing-i18n.ts';
let content = fs.readFileSync(path, 'utf8');

const regex = /title:\s*"Acceso Multidispositivo",\s*desc:\s*"Acceso instantáneo\.\s*Configuralo una sola vez y accedé desde cualquier dispositivo de forma segura\."/;

const replacement = `title: "Acceso Multidispositivo",
            desc: "Acceso instantáneo. Configuralo una sola vez y accedé desde cualquier dispositivo de forma segura."`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully fixed Spanish feature description!");
} else {
  console.log("Regex didn't match, let's check manually...");
}
