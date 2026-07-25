import path from 'path';
import { fileURLToPath } from 'url';
import { discoverPython } from './discovery/pythonPlugin.js';
import { discoverReact } from './discovery/reactPlugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const virtualModuleId = 'virtual:founder-brain-graph';
const resolvedVirtualModuleId = '\0' + virtualModuleId;

export default function founderBrainPlugin(options = {}) {
    const backendPath = options.backendPath || path.resolve(__dirname, '../../../backend');
    const frontendSrcPath = options.frontendSrcPath || path.resolve(__dirname, '../../src');

    return {
        name: 'vite-plugin-founder-brain',
        
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },

        async load(id) {
            if (id === resolvedVirtualModuleId) {
                // Run discovery
                const pyGraph = discoverPython(backendPath);
                const reactGraph = discoverReact(frontendSrcPath);

                const graph = {
                    nodes: [...pyGraph.nodes, ...reactGraph.nodes],
                    edges: [...pyGraph.edges, ...reactGraph.edges]
                };

                return `export default ${JSON.stringify(graph, null, 2)};`;
            }
        },
        
        configureServer(server) {
            server.middlewares.use('/__brain_webhook', (req, res) => {
                if (req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => { body += chunk; });
                    req.on('end', () => {
                        try {
                            const traceData = JSON.parse(body);
                            server.ws.send('founderos:trace', traceData);
                        } catch(e) {}
                        res.statusCode = 200;
                        res.end('ok');
                    });
                }
            });
        }
    };
}
