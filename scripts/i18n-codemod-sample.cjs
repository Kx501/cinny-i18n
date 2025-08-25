'use strict';

// A tiny codemod for demo purpose (conservative):
// - Only transforms JSX string expression containers (i.e. {' hardcoded '} or {"..."} inside tags)
// - Replaces with: {t('ns:key', { defaultValue: 'Hardcoded' })}
// - Does NOT inject imports or create `t` binding. Assumes `const { t } = useTranslation()` exists or will be added manually.
// - ns is inferred from file path (features/pages/organisms/components/atoms/hooks/utils/state/styles/plugins/partials/client/util/types)
// - group is the nearest directory name under the ns folder (fallback: file basename without extension)
// Run (dry-run): node scripts/i18n-codemod-sample.cjs --file "src/app/features/room/RoomTimeline.tsx"
// Run (apply):   node scripts/i18n-codemod-sample.cjs --file "src/app/features/room/RoomTimeline.tsx" --write
// Preview:       node scripts/i18n-codemod-sample.cjs --file "..." --print

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function getArg(name, defVal) {
    // prefer the LAST occurrence so users can override defaults in npm scripts
    let foundIdx = -1;
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === name || a.startsWith(name + '=')) foundIdx = i;
    }
    if (foundIdx === -1) return defVal;
    const token = args[foundIdx];
    const hasEq = token.includes('=');
    const val = hasEq ? token.split('=')[1] : args[foundIdx + 1];
    return val ?? defVal;
}

const filePath = getArg('--file') || getArg('-f');
const write = args.includes('--write');
const shouldPrint = args.includes('--print');
const manualLog = path.resolve(process.cwd(), 'i18n-codemod.manual.txt');
const modifiedLog = path.resolve(process.cwd(), 'i18n-codemod.modified.txt');
// no needs-t tracking per user preference

if (!filePath) {
    console.error('Usage: node scripts/i18n-codemod-sample.cjs --file <path> [--write]');
    process.exit(1);
}

// Infer namespace and group from path
function inferNsAndGroup(absPath) {
    const p = absPath.replace(/\\/g, '/');
    const pairs = [
        ['src/app/atoms', 'atoms'],
        ['src/app/molecules', 'molecules'],
        ['src/app/organisms', 'organisms'],
        ['src/app/components', 'components'],
        ['src/app/features', 'features'],
        ['src/app/pages', 'pages'],
        ['src/app/hooks', 'hooks'],
        ['src/app/utils', 'utils'],
        ['src/app/state', 'state'],
        ['src/app/styles', 'styles'],
        ['src/app/plugins', 'plugins'],
        ['src/app/partials', 'partials'],
        ['src/client', 'client'],
        ['src/util', 'util'],
        ['src/types', 'types'],
    ];
    let ns = 'features';
    let group = path.basename(absPath).replace(/\.[^.]+$/, '');
    for (const [prefix, n] of pairs) {
        const i = p.indexOf(prefix + '/');
        if (i !== -1) {
            ns = n;
            const rest = p.slice(i + prefix.length + 1);
            const seg = rest.split('/')[0];
            group = seg || group;
            break;
        }
    }
    // slugify group
    group = group
        .replace(/[A-Z]/g, (m, idx) => (idx === 0 ? m.toLowerCase() : '_' + m.toLowerCase()))
        .replace(/[^a-z0-9_\-]/g, '_')
        .replace(/__+/g, '_');
    return { ns, group };
}

function slugify(text) {
    return String(text)
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_\-]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase()
        .slice(0, 64);
}

const abs = path.resolve(process.cwd(), filePath);
let code = fs.readFileSync(abs, 'utf8');
const original = code;

const { ns, group } = inferNsAndGroup(abs);

// Load optional key maps and helpers for key generation
let KEYMAP = {};
let SYNONYMS = {};
try { KEYMAP = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/i18n-keymap.json'), 'utf8')); } catch { }
try { SYNONYMS = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/i18n-synonyms.json'), 'utf8')); } catch { }

function normalizeText(s) {
    let t = String(s).toLowerCase();
    for (const [k, v] of Object.entries(SYNONYMS)) {
        const re = new RegExp(`\\b${k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
        t = t.replace(re, v);
    }
    return t.replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim();
}

// Update STOPWORDS to better handle long sentences
const STOPWORDS = new Set(['a', 'an', 'the', 'to', 'of', 'is', 'has', 'have', 'had', 'been', 'be', 'are', 'was', 'were', 'no', 'not', 'and', 'or', 'for', 'in', 'on', 'at', 'by', 'with', 'this', 'that', 'these', 'those', 'you', 'how', 'being', 'select', 'as', 'both']);

// Improved key generation with better semantic handling
function keyFromText(raw, context = {}) {
    // Handle very short text (punctuation, single words) BEFORE normalization
    const trimmedRaw = raw.trim();
    if (trimmedRaw.length <= 3) {
        if (trimmedRaw === 'and') return 'and';
        if (trimmedRaw === 'or') return 'or';
        if (trimmedRaw === ',') return 'comma';
        if (trimmedRaw === ', ') return 'comma';
        if (trimmedRaw === '.') return 'period';
        if (trimmedRaw === '!') return 'exclamation';
        if (trimmedRaw === '?') return 'question';
        if (trimmedRaw === ' and ') return 'and';
        if (trimmedRaw === ' or ') return 'or';
        if (trimmedRaw === ' , ') return 'comma';
        if (trimmedRaw === ' . ') return 'period';
        if (trimmedRaw === ' ! ') return 'exclamation';
        if (trimmedRaw === ' ? ') return 'question';
        return trimmedRaw.replace(/[^a-z0-9]/g, '_');
    }

    const base = normalizeText(raw);

    // Check for empty or whitespace-only text
    if (!base || base.trim().length === 0) {
        return 'empty_text';
    }

    // Single/plural and map-based rules unchanged...
    const singlePluralPatterns = [
        { single: /^is\s+following/, plural: /^are\s+following/, base: 'following_conversation' },
        { single: /^is\s+typing/, plural: /^are\s+typing/, base: 'typing' },
        { single: /^is\s+online/, plural: /^are\s+online/, base: 'online' },
        { single: /^is\s+offline/, plural: /^are\s+offline/, base: 'offline' },
    ];
    for (const pattern of singlePluralPatterns) {
        if (pattern.single.test(base)) return `${pattern.base}_single`;
        if (pattern.plural.test(base)) return pattern.base;
    }

    for (const [k, v] of Object.entries(KEYMAP)) {
        const kk = normalizeText(k);
        const hitIdx = base.indexOf(kk);
        if (hitIdx !== -1) {
            if (v === 'failed_after' || v === '_failed_after') break;
            if (v === 'permission_denied_after' || v === '_permission_denied_after') {
                let act = null;
                const permTo = base.match(/permission to\s+([a-z0-9_\s]+)/);
                if (permTo) act = permTo[1];
                if (!act) {
                    const after = base.slice(hitIdx + kk.length).trim();
                    const m2 = after.match(/^to\s+([a-z0-9_\s]+)/);
                    if (m2) act = m2[1];
                }
                if (!act) {
                    const m3 = base.match(/(?:not allowed to|forbidden to)\s+([a-z0-9_\s]+)/);
                    if (m3) act = m3[1];
                }
                if (act) {
                    const groupWord = group.toLowerCase();
                    act = normalizeText(act)
                        .split(' ')
                        .filter(w => w && !STOPWORDS.has(w) && w !== groupWord)
                        .slice(0, 2)
                        .join('_');
                    if (!act) act = 'action';
                    return `${act}_permission_denied`;
                }
                return 'permission_denied';
            }
            return v;
        }
    }

    // Heuristic: images usage sentences → images_usage
    if (/\bimages?\b/.test(base) && /(use|usage|used|using)\b/.test(base)) {
        return 'images_usage';
    }

    const m = base.match(/(?:failed to|unable to|could not)\s+([a-z0-9_\s]+)/);
    if (m) {
        const act = m[1].split(' ').filter(w => w && !STOPWORDS.has(w)).slice(0, 3).join('_');
        return `${act}_failed`;
    }

    if (base.includes('no longer active')) return 'inactive';

    const words = base.split(' ').filter(w => w && !STOPWORDS.has(w));
    const key = words.slice(0, 4).join('_');
    return key || 'text';
}

// no binding detection

// No import injection: keep minimal and safe. We rely on existing `t` binding in files.

// Replace only JSX string expression containers: {'...'} or {"..."}
function isLikelyInsideJsx(index) {
    const back = code.lastIndexOf('>', index);
    const lt = code.lastIndexOf('<', index);
    if (back === -1 || back <= lt) return false;

    // Filter out TypeScript generic angle brackets like fn<Generic>(...)
    if (lt > 0) {
        const prevCh = code[lt - 1];
        if (/[A-Za-z0-9_$\.]/.test(prevCh)) {
            return false;
        }
    }

    // Look at the context around this position
    const before = code.slice(Math.max(0, index - 100), index);
    const after = code.slice(index, Math.min(code.length, index + 100));

    // Skip if we're in an attribute (look for = before and no closing quote)
    const beforeMatch = before.match(/[a-zA-Z-]+=\s*["']?[^"']*$/);
    if (beforeMatch) {
        const attrMatch = beforeMatch[0];
        // If we see an unclosed attribute, we're likely in an attribute value
        if (!attrMatch.includes('"') && !attrMatch.includes("'")) {
            return false;
        }
    }

    // Skip if we're in a ternary expression that looks like an attribute value
    if (before.includes('?') && after.includes(':')) {
        const beforeTernary = before.match(/[a-zA-Z-]+=\s*\{[^}]*\?[^}]*$/);
        if (beforeTernary) {
            return false; // e.g. size={cond ? 'H5' : 'H3'}
        }
    }

    return true;
}

// Detect pattern: {"..."} <SomeTag> ... </SomeTag> {"..."}
function isSplitAroundTag(idxStart, idxEnd) {
    const before = code.slice(Math.max(0, idxStart - 160), idxStart);
    const after = code.slice(idxEnd, Math.min(code.length, idxEnd + 160));
    const hasTagAfter = /<\w[\w:-]*\b[^>]*>/.test(after) && /<\/.+?>/.test(after);
    const hasExprBefore = /\{\s*["'][^"'\n\r\t{}<>]+?["']\s*\}$/.test(before);
    const hasExprAfter = /^\s*\{\s*["'][^"'\n\r\t{}<>]+?["']\s*\}/.test(after);
    // Simple heuristic: there exists a tag right after this expr and another expr after the tag
    return hasExprBefore && hasTagAfter && hasExprAfter;
}

function appendManualMarker(idx, text, reason) {
    const line = code.slice(0, idx).split('\n').length;
    const entry = `[complex] ${filePath}:${line} :: ${reason} :: ${text}\n`;
    try { fs.appendFileSync(manualLog, entry, 'utf8'); } catch { }
}

// helper: is current index inside a direct attribute expression like attr={ ... } without nested JSX before this point
function isDirectAttributeExpression(src, at) {
    const before = src.slice(Math.max(0, at - 400), at);
    const m = before.match(/([A-Za-z-]+)\s*=\s*\{[^}]*$/);
    if (!m) return false;
    const attrStartIdx = before.lastIndexOf('{');
    if (attrStartIdx === -1) return false;
    // if there is a '<' between the attribute '{' start and current index, then we're inside nested JSX, allow translate
    const between = before.slice(attrStartIdx);
    if (between.includes('<')) return false;
    return true;
}

// Enhanced JSX expression processing
// Commented out: generic string expression pass
// const strExprRe = /\{\s*(["'])([^"'\n\r\t{}<>]+?)\1\s*\}/g;
let replacedCount = 0;
let out = ''; let lastIndex = 0; let match;

// while ((match = strExprRe.exec(code)) !== null) {
//     const [full, quote, text] = match;
//     const idx = match.index;

//     if (!isLikelyInsideJsx(idx)) continue;
//     if (isDirectAttributeExpression(code, idx)) continue; // skip direct attribute values like size={"H5"}

//     const window = code.slice(Math.max(0, idx - 80), Math.min(code.length, idx + 80));
//     if (/<\s*Trans\b/.test(window)) continue;

//     // Skip split-complex case and log for manual handling
//     if (isSplitAroundTag(idx, idx + full.length)) {
//         appendManualMarker(idx, text, 'split-around-tag');
//         continue;
//     }

//     // Skip very short or empty text
//     if (text.trim().length === 0) continue;

//     const key = keyFromText(text);

//     // Ensure key is not empty
//     if (!key || key.trim().length === 0) {
//         appendManualMarker(idx, text, 'empty-key-generated');
//         continue;
//     }

//     const fullKey = `${ns}:${group}.${key}`;
//     out += code.slice(lastIndex, idx) + `{t('${fullKey}', { defaultValue: '${text.replace(/'/g, "\\'")}' })}`;
//     lastIndex = idx + full.length;
//     replacedCount += 1;
// }
// out += code.slice(lastIndex);
// code = out;

// Replace fallback expressions: {expr || 'text'} and {expr ?? 'text'}
// Commented out: fallback expressions outside content tags
// function replaceFallbacks(src) {
//     const re = /\{\s*([^{}]+?)\s*(\|\||\?\?)\s*(["'])([^"'\n\r{}<>]+)\3\s*\}/g;
//     let buf = ''; let idx = 0; let m;
//     while ((m = re.exec(src)) !== null) {
//         const [full, expr, op, q, text] = m;
//         const at = m.index;
//         if (!isLikelyInsideJsx(at)) continue;
//         if (isDirectAttributeExpression(src, at)) continue;

//         const key = keyFromText(text);
//         if (!key || key.trim().length === 0) continue;

//         const fullKey = `${ns}:${group}.${key}`;
//         buf += src.slice(idx, at) + `{ ${expr.trim()} ${op} t('${fullKey}', { defaultValue: '${text.replace(/'/g, "\\'")}' }) }`;
//         idx = at + full.length;
//         replacedCount += 1;
//     }
//     buf += src.slice(idx);
//     return buf;
// }
// code = replaceFallbacks(code);

// Replace attribute literals: title="...", placeholder="...", aria-label, alt, label, description, subTitle
function replaceAttrLiterals(src) {
    const attrList = ['title', 'placeholder', 'aria-label', 'alt', 'label', 'description', 'subTitle'];
    const re = new RegExp(`(\\s(?:${attrList.join('|')})=)\"([^\"<>{}\\n\\r]+)\"`, 'g');
    return src.replace(re, (m, p1, text) => {
        const key = keyFromText(text);
        if (!key || key.trim().length === 0) return m;

        const fullKey = `${ns}:${group}.${key}`;
        replacedCount += 1;
        return `${p1}{t('${fullKey}', { defaultValue: '${text.replace(/'/g, "\\'")}' })}`;
    });
}
code = replaceAttrLiterals(code);

// Replace simple pure text nodes: <Tag>Hardcoded</Tag> (no nested tags/expressions)
// Keep pure text nodes only within Text via transformInsideContentTags; disable global pure text pass
// function replacePureTextNodes(src) {
//     const re = /(<([A-Za-z][\w:-]*)\b[^>]*>)(\s*[^<{][^<{}]*?\s*)(<\/\2>)/g;
//     return src.replace(re, (m, open, tag, inner, close) => {
//         const raw = inner.trim();
//         if (!raw) return m;
//         if (/\bt\(['\"]/i.test(inner)) return m;

//         const key = keyFromText(raw);
//         if (!key || key.trim().length === 0) return m;

//         const fullKey = `${ns}:${group}.${key}`;
//         replacedCount += 1;
//         return `${open}{t('${fullKey}', { defaultValue: '${raw.replace(/'/g, "\\'")}' })}${close}`;
//     });
// }
// code = replacePureTextNodes(code);

// NOTE: intentionally removed unsafe replaceMixedJsxExpressions to avoid touching destructuring/attributes

// Enhanced: Handle ternary expressions like {condition ? 'text1' : 'text2'}
// Commented out: global ternary replacement; handled inside Text by transformInsideContentTags
// function replaceTernaryExpressions(src) {
//     const re = /\{\s*([^{}]+?)\s*\?\s*(["'])([^"'\n\r\t{}<>]+?)\2\s*:\s*(["'])([^"'\n\r\t{}<>]+?)\4\s*\}/g;
//     let buf = ''; let last = 0; let m;
//     while ((m = re.exec(src)) !== null) {
//         const [full, condition, q1, text1, q2, text2] = m;
//         const at = m.index;
//         if (!isLikelyInsideJsx(at)) { continue; }
//         if (isDirectAttributeExpression(src, at)) { continue; }

//         const key1 = keyFromText(text1);
//         const key2 = keyFromText(text2);
//         if (!key1 || !key2 || key1.trim().length === 0 || key2.trim().length === 0) { continue; }

//         const fullKey1 = `${ns}:${group}.${key1}`;
//         const fullKey2 = `${ns}:${group}.${key2}`;
//         buf += src.slice(last, at) + `{${condition} ? t('${fullKey1}', { defaultValue: '${text1.replace(/'/g, "\\'")}' }) : t('${fullKey2}', { defaultValue: '${text2.replace(/'/g, "\\'")}' })}`;
//         last = at + full.length;
//         replacedCount += 2;
//     }
//     buf += src.slice(last);
//     return buf;
// }
// code = replaceTernaryExpressions(code);

// Process inside specific content tags (e.g., <Text> ... </Text>)
function transformInsideContentTags(src, tagNames = ['Text']) {
    function transformInner(inner) {
        // 1) { 'literal' } or { "literal" }
        inner = inner.replace(/\{\s*(["'])([^"'\n\r\t{}<>]+?)\1\s*\}/g, (m, q, text) => {
            const key = keyFromText(text);
            if (!key || key.trim().length === 0) return m;
            return `{t('${ns}:${group}.${key}', { defaultValue: '${text.replace(/'/g, "\\'")}' })}`;
        });
        // 2) { cond ? 'A' : 'B' }
        inner = inner.replace(/\{\s*([^{}]+?)\s*\?\s*(["'])([^"'\n\r\t{}<>]+?)\2\s*:\s*(["'])([^"'\n\r\t{}<>]+?)\4\s*\}/g,
            (m, condition, q1, a, q2, b) => {
                const k1 = keyFromText(a); const k2 = keyFromText(b);
                if (!k1 || !k2 || !k1.trim() || !k2.trim()) return m;
                return `{${condition} ? t('${ns}:${group}.${k1}', { defaultValue: '${a.replace(/'/g, "\\'")}' }) : t('${ns}:${group}.${k2}', { defaultValue: '${b.replace(/'/g, "\\'")}' })}`;
            }
        );
        // 3) Pure text between tags (no nested tags/expressions)
        inner = inner.replace(/(^|>)\s*([^<{][^<{}]*?)\s*(?=<|$)/g, (m, openOrStart, raw) => {
            const text = raw.trim();
            if (!text) return m;
            if (/\bt\(['\"]/i.test(raw)) return m;
            const key = keyFromText(text);
            if (!key || !key.trim()) return m;
            const repl = `{t('${ns}:${group}.${key}', { defaultValue: '${text.replace(/'/g, "\\'")}' })}`;
            return `${openOrStart}${repl}`;
        });
        return inner;
    }
    let out = src;
    for (const tag of tagNames) {
        const re = new RegExp(`(<${tag}\\b[^>]*>)([\\s\\S]*?)(</${tag}>)`, 'g');
        out = out.replace(re, (m, open, inner, close) => {
            const transformed = transformInner(inner);
            return `${open}${transformed}${close}`;
        });
    }
    return out;
}

// --- Simplify: only run content-tag transform and attribute literals ---
// (Disable broad JSX passes to avoid touching non-target cases)

// Commented out: generic string expression pass
// const strExprRe = /\{\s*(["'])([^"'\n\r\t{}<>]+?)\1\s*\}/g;
// ... (disabled)

// Commented out: fallback expressions outside content tags
// code = replaceFallbacks(code);

// Keep attribute literals (title/description/...)
// code = replaceAttrLiterals(code);

// Keep pure text nodes only within Text via transformInsideContentTags; disable global pure text pass
// code = replacePureTextNodes(code);

// Commented out: global ternary replacement; handled inside Text by transformInsideContentTags
// code = replaceTernaryExpressions(code);

// --- apply content-tag transform first ---
code = transformInsideContentTags(code, ['Text']);

if (replacedCount === 0) {
    console.log(`[codemod] No matches in ${filePath}`);
} else {
    console.log(`[codemod] ${replacedCount} occurrence(s) updated in ${filePath}`);
}

if (shouldPrint) {
    const header = `--- ${filePath} (preview)\n+++ ${filePath} (modified)\n`;
    console.log(header);
    const oLines = original.split('\n');
    const nLines = code.split('\n');
    for (let i = 0; i < Math.max(oLines.length, nLines.length); i++) {
        const o = oLines[i] ?? '';
        const n = nLines[i] ?? '';
        if (o !== n) console.log(`> ${n}`); else console.log(`  ${n}`);
    }
}

if (write && code !== original) {
    fs.writeFileSync(abs, code, 'utf8');
    console.log(`[codemod] File written: ${filePath}`);
    // record modified file
    try { fs.appendFileSync(modifiedLog, `${filePath}\n`, 'utf8'); } catch { }
} else {
    console.log('[codemod] Dry-run (use --write to apply changes)');
}

// no needs-t log


