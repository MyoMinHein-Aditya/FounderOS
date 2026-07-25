const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
    { pattern: /bg-black/g, replacement: 'bg-background' },
    { pattern: /text-zinc-100/g, replacement: 'text-foreground' },
    { pattern: /text-gradient/g, replacement: 'text-foreground' },
    { pattern: /bg-zinc-900\/[0-9]+/g, replacement: 'bg-muted' },
    { pattern: /bg-zinc-900/g, replacement: 'bg-muted' },
    { pattern: /bg-zinc-950/g, replacement: 'bg-background' },
    { pattern: /bg-zinc-800/g, replacement: 'bg-secondary' },
    { pattern: /border-zinc-800/g, replacement: 'border-border' },
    { pattern: /border-zinc-700/g, replacement: 'border-border' },
    { pattern: /text-zinc-500/g, replacement: 'text-muted-foreground' },
    { pattern: /text-zinc-400/g, replacement: 'text-muted-foreground' },
    { pattern: /text-zinc-300/g, replacement: 'text-muted-foreground' },
    { pattern: /text-zinc-200/g, replacement: 'text-foreground' },
    { pattern: /text-white/g, replacement: 'text-foreground' },
    { pattern: /hover:bg-zinc-900/g, replacement: 'hover:bg-muted/80' },
    { pattern: /hover:bg-zinc-800/g, replacement: 'hover:bg-muted' },
    { pattern: /hover:text-zinc-300/g, replacement: 'hover:text-foreground' },
    { pattern: /border-dashed/g, replacement: '' }
];

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            // Skip files we already manually refactored to be safe
            if (['Dashboard.jsx', 'Navbar.jsx', 'Card.jsx', 'EmptyState.jsx', 'ProgressBar.jsx', 'Badge.jsx', 'Skeleton.jsx', 'StatCard.jsx'].includes(file)) {
                continue;
            }
            
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            for (const { pattern, replacement } of replacements) {
                content = content.replace(pattern, replacement);
            }
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${file}`);
            }
        }
    }
}

processDirectory(srcDir);
console.log('Refactor complete.');
