import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function discoverPython(backendPath) {
    try {
        const scriptPath = path.join(__dirname, 'parser.py');
        const output = execSync(`python "${scriptPath}" "${backendPath}"`, {
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024 // 10MB
        });
        return JSON.parse(output);
    } catch (e) {
        console.error("Python AST parsing failed:", e.message);
        return { nodes: [], edges: [] };
    }
}
