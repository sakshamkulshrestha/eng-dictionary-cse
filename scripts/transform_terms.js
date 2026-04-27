import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace all dashes with spaces in a string
const replaceDashes = (str) => str.replace(/-/g, ' ');

// Transform a single term object
function transformTerm(term) {
    const transformed = { ...term };

    // 1. Change ID
    transformed.id = `cloud-${term.id}`;

    // 2. Transform term name
    transformed.term = replaceDashes(term.term);

    // 3. Transform list fields (replace dashes in every string)
    const fields = ['suggested_related_terms', 'prerequisites', 'next_steps'];
    for (const field of fields) {
        if (Array.isArray(transformed[field])) {
            transformed[field] = transformed[field].map(item => replaceDashes(item));
        }
    }

    return transformed;
}

// Build a set of all existing term names (after transformation)
function buildExistingTermsSet(termsArray) {
    return new Set(termsArray.map(t => t.term));
}

// Generate missing references report as a string
function generateMissingReport(termsArray, existingTermsSet) {
    const lines = [];
    lines.push('=== Missing References Report ===\n');

    for (const term of termsArray) {
        const termName = term.term;
        const missing = [];

        // Check suggested_related_terms
        if (term.suggested_related_terms) {
            for (const ref of term.suggested_related_terms) {
                if (!existingTermsSet.has(ref)) {
                    missing.push(`  - suggested_related_terms: "${ref}"`);
                }
            }
        }

        // Check prerequisites
        if (term.prerequisites) {
            for (const ref of term.prerequisites) {
                if (!existingTermsSet.has(ref)) {
                    missing.push(`  - prerequisites: "${ref}"`);
                }
            }
        }

        // Check next_steps
        if (term.next_steps) {
            for (const ref of term.next_steps) {
                if (!existingTermsSet.has(ref)) {
                    missing.push(`  - next_steps: "${ref}"`);
                }
            }
        }

        if (missing.length > 0) {
            lines.push(`Term: "${termName}"`);
            lines.push(...missing);
            lines.push(''); // blank line
        }
    }

    if (lines.length === 2) { // only header, no missing
        lines.push('All referenced terms exist.');
        lines.push('');
    }

    return lines.join('\n');
}

async function main() {
    const inputPath = path.join(__dirname, 'data', 'cloud_terms.json');
    const outputJsonPath = path.join(__dirname, 'data', 'cloud_terms_transformed.json');
    const missingTxtPath = path.join(__dirname, 'data', 'missing.txt');

    try {
        // Read and parse input JSON
        const rawData = await fs.readFile(inputPath, 'utf8');
        let terms = JSON.parse(rawData);

        // Ensure it's an array (wrap single object if needed)
        if (!Array.isArray(terms)) {
            terms = [terms];
        }

        // Transform each term
        const transformedTerms = terms.map(transformTerm);

        // Write transformed JSON
        await fs.writeFile(outputJsonPath, JSON.stringify(transformedTerms, null, 2), 'utf8');
        console.log(`✅ Transformed JSON written to: ${outputJsonPath}`);

        // Build set of existing term names (from transformed terms)
        const existingTerms = buildExistingTermsSet(transformedTerms);

        // Generate missing report
        const missingReport = generateMissingReport(transformedTerms, existingTerms);

        // Write missing.txt
        await fs.writeFile(missingTxtPath, missingReport, 'utf8');
        console.log(`✅ Missing references report written to: ${missingTxtPath}`);

        // Also print a summary to console
        console.log('\n--- Summary ---');
        const missingCount = missingReport.split('Term:').length - 1;
        console.log(`Total terms processed: ${transformedTerms.length}`);
        console.log(`Terms with missing references: ${missingCount}`);
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

main();