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

    content = content.replace(/text-5xl sm:text-7xl font-bold tracking-tight text-gray-900/g, 'text-page-title text-[var(--text)]');
    content = content.replace(/text-5xl sm:text-\[68px\] font-black tracking-\[-0.04em\] leading-\[0.95\] text-black dark:text-white/g, 'text-hero text-[var(--text)]');
    content = content.replace(/text-5xl sm:text-\[64px\] font-extrabold tracking-\[-0.04em\] mb-4 leading-none bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-600 dark:from-white dark:to-gray-400/g, 'text-page-title bg-accent-gradient bg-clip-text text-transparent mb-4');
    content = content.replace(/text-7xl font-bold tracking-tighter leading-none text-black dark:text-white/g, 'text-hero text-[var(--text)]');
    content = content.replace(/text-5xl font-bold tracking-tighter capitalize/g, 'text-page-title text-[var(--text)] capitalize');
    content = content.replace(/text-5xl font-bold tracking-tighter mb-4 text-[var\(--text\)]/g, 'text-hero text-[var(--text)] mb-4');
    content = content.replace(/text-4xl font-bold text-\[var\(--text\)\]/g, 'text-page-title text-[var(--text)]');
    content = content.replace(/text-2xl font-bold text-\[var\(--text\)\]/g, 'text-card-title text-[var(--text)]');
    content = content.replace(/text-2xl font-bold mb-2 capitalize tracking-tight text-\[var\(--text\)\]/g, 'text-card-title text-[var(--text)] mb-2 capitalize');
    content = content.replace(/text-2xl font-bold text-\[var\(--text\)\] tracking-tight/g, 'text-card-title text-[var(--text)]');
    content = content.replace(/text-2xl font-bold tracking-tight/g, 'text-card-title text-[var(--text)]');
    content = content.replace(/text-2xl text-muted font-medium leading-relaxed/g, 'text-body-primary text-[var(--muted)]');

    // Clean up random grays left behind
    content = content.replace(/\btext-gray-900\b/g, 'text-[var(--text)]');
    content = content.replace(/text-black dark:text-white/g, 'text-[var(--text)]');

    fs.writeFileSync(file, content, 'utf8');
});

console.log("Typography replacements complete.");
