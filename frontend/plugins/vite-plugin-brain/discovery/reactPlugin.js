import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
// @babel/traverse is exported as a default export in CommonJS but might be tricky in ESM
const traverse = traverseModule.default || traverseModule;

export function discoverReact(frontendSrcPath) {
    const nodes = [];
    const edges = [];

    function walk(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                const relPath = path.relative(frontendSrcPath, fullPath);
                // Simple heuristic: if it's in pages/, it's a Page node
                if (relPath.startsWith('pages' + path.sep)) {
                    const name = path.basename(file, path.extname(file));
                    nodes.push({
                        id: `page_${name}`,
                        type: 'Frontend',
                        label: name,
                        data: { file: relPath }
                    });
                }
                // We can add more advanced AST parsing here for components, API calls, etc.
            }
        }
    }

    try {
        walk(frontendSrcPath);
    } catch (e) {
        console.error("React discovery failed:", e);
    }

    return { nodes, edges };
}
