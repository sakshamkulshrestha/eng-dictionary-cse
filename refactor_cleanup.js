import fs from 'fs';

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

    // Remove explicit dark mode background overrides inside Light Mode targets
    content = content.replace(/\bdark:bg-\[#1C1C1E\]\b/g, '');
    content = content.replace(/\bdark:bg-\[#2C2C2E\]\b/g, '');
    content = content.replace(/\bdark:bg-\[#151517\]\b/g, '');
    content = content.replace(/\bdark:bg-\[#1A1A1A\]\b/g, '');

    content = content.replace(/\bdark:border-white\/10\b/g, 'dark:border-[var(--border)]');
    content = content.replace(/\bborder-black\/5\b/g, 'border-[var(--border)]');

    // settings toggles residual overrides
    content = content.replace(/bg-\[#E5E5EA\]/g, 'bg-[var(--border)]');
    content = content.replace(/dark:bg-\[#3A3A3C\]/g, 'dark:bg-[var(--active)]');

    // Explicit primary selections that aren't variables
    content = content.replace(/selectedDomain === domain/g, "/* selection removed */ false");

    fs.writeFileSync(file, content, 'utf8');
});

console.log("Dark background overrides purged.");
