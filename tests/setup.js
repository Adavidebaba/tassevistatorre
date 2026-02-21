/**
 * setup.js
 * Carica le classi JS del progetto nel contesto globale
 * senza modificare i file sorgente (non hanno export/module).
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const files = [
    'js/reverse-calculator.js',
    'js/tax-engine.js',
    'js/breakeven-calculator.js',
];

for (const file of files) {
    const code = readFileSync(join(root, file), 'utf-8');
    // eslint-disable-next-line no-eval
    const fn = new Function(code + `\nreturn { ${extractClassNames(code).join(', ')} };`);
    const exported = fn();
    Object.assign(globalThis, exported);
}

/**
 * Estrae i nomi delle classi dichiarate in un file JS.
 */
function extractClassNames(code) {
    const matches = code.matchAll(/^class\s+(\w+)/gm);
    return [...matches].map(m => m[1]);
}
