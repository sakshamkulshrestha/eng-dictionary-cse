import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Button replacements
    content = content.replace(/\bbtn-icon\b/g, 'apple-icon-btn');
    content = content.replace(/\bbtn-accent\b/g, 'apple-pill');
    content = content.replace(/\bbtn-ghost\b/g, 'apple-press inline-flex items-center justify-center p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--list-hover)] transition-colors font-medium text-sm');

    // Panel replacements
    content = content.replace(/\bworkspace-panel\b/g, 'apple-card');

    // Text replacements
    content = content.replace(/\btext-gray-400\b/g, 'text-muted');
    content = content.replace(/\btext-gray-500\b/g, 'text-muted');
    content = content.replace(/\btext-gray-600\b/g, 'text-muted');
    content = content.replace(/\btext-gray-300\b/g, 'text-muted');

    content = content.replace(/\bbg-gray-50\b/g, 'bg-card');
    content = content.replace(/\bbg-gray-100\b/g, 'bg-search');
    content = content.replace(/\bbg-gray-800\b/g, 'bg-search');
    content = content.replace(/\bbg-gray-900\b/g, 'bg-card');

    content = content.replace(/\bbg-white\b/g, 'bg-card');
    content = content.replace(/\bbg-black\b/g, 'bg-card');

    content = content.replace(/text-workspace-text-muted/g, 'text-muted');
    content = content.replace(/text-workspace-text/g, 'text-text');
    content = content.replace(/bg-workspace-bg/g, 'bg-bg');
    content = content.replace(/border-workspace-border/g, 'border-border');

    content = content.replace(/\bsearch-intelligent\b/g, 'h-[44px] rounded-full focus:ring-4 focus:ring-[var(--accent-20)] focus:border-accent outline-none transition-all text-[15px] bg-[var(--search)] text-[var(--text)] placeholder:text-[var(--muted)] border border-transparent focus:bg-[var(--card)]');

    fs.writeFileSync(file, content, 'utf8');
});

console.log("Replacements complete.");
