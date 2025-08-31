'use strict';

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;

// 参数解析
function parseArgs() {
    const args = process.argv.slice(2);
    const options = { file: null, write: false, print: false, report: false };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--file': case '-f':
                options.file = args[i + 1]; i++; break;
            case '--write': options.write = true; break;
            case '--print': options.print = true; break;
            case '--report': options.report = true; break;
        }
    }
    return options;
}

const options = parseArgs();
if (!options.file) {
    console.error('Usage: node scripts/i18n-codemod-ast.cjs --file <path> [--write] [--print] [--report]');
    process.exit(1);
}

const absPath = path.resolve(process.cwd(), options.file);
if (!fs.existsSync(absPath)) {
    console.error(`[错误] 文件不存在: ${options.file}`);
    process.exit(1);
}

// 从路径推断命名空间和分组
function inferNsAndGroup(absPath) {
    const p = absPath.replace(/\\/g, '/');
    const pairs = [
        ['src/app/atoms', 'atoms'], ['src/app/molecules', 'molecules'],
        ['src/app/organisms', 'organisms'], ['src/app/components', 'components'],
        ['src/app/features', 'features'], ['src/app/pages', 'pages'],
        ['src/app/hooks', 'hooks'], ['src/app/utils', 'utils'],
        ['src/app/state', 'state'], ['src/app/styles', 'styles'],
        ['src/app/plugins', 'plugins'], ['src/app/partials', 'partials'],
        ['src/client', 'client'], ['src/util', 'util'], ['src/types', 'types'],
    ];

    let ns = 'features', group = '';
    for (const [prefix, n] of pairs) {
        const i = p.indexOf(prefix + '/');
        if (i !== -1) {
            ns = n;
            const rest = p.slice(i + prefix.length + 1);
            const segments = rest.split('/');
            group = segments.slice(0, -1).join('.');
            break;
        }
    }
    return { ns, group };
}

// 键名生成
function keyFromText(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return 'empty';
    return trimmed
        .replace(/[^a-zA-Z0-9\s]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase()
        .slice(0, 25);
}

// 检查是否应该转换
function shouldTranslate(text, context = {}) {
    if (text.length <= 1) return false;
    if (text.includes('__') || text.includes('--')) return false;
    if (/^[.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>]$/.test(text)) return false;
    if (/^\d+$/.test(text)) return false;
    if (/^<\/?[a-z][a-z0-9]*>$/i.test(text)) return false;

    // 过滤掉 CSS 类名、变量名等
    if (context.isAttribute && ['className', 'style', 'id', 'name', 'type', 'variant', 'size'].includes(context.attrName)) {
        if (!text.includes(' ') && text.length < 10) return false;
    }

    // 过滤掉错误消息和日志
    if (text.startsWith('ERROR:') || text.startsWith('M_') || text.includes('console.')) return false;

    if (text.includes(' ')) return true;
    if (/^[A-Z]/.test(text)) return true;

    const uiWords = ['create', 'edit', 'delete', 'save', 'cancel', 'close', 'open', 'add', 'remove', 'select', 'choose', 'enable', 'disable', 'show', 'hide', 'search', 'filter', 'sort', 'refresh', 'update', 'submit', 'reset', 'back', 'next', 'previous', 'first', 'last', 'home', 'settings', 'profile', 'account', 'user', 'admin', 'guest', 'public', 'private', 'space', 'room', 'message', 'notification', 'error', 'warning', 'info', 'success', 'loading', 'processing', 'waiting', 'ready', 'online', 'offline', 'active', 'inactive', 'visible', 'hidden', 'enabled', 'disabled', 'required', 'optional', 'valid', 'invalid', 'empty', 'full', 'new', 'old', 'current', 'previous', 'next', 'last', 'first', 'all', 'none', 'some', 'many', 'few', 'more', 'less', 'most', 'least', 'best', 'worst', 'good', 'bad', 'yes', 'no', 'ok', 'cancel', 'confirm', 'deny', 'accept', 'reject', 'allow', 'deny', 'grant', 'revoke', 'lock', 'unlock', 'secure', 'public', 'private', 'shared', 'personal', 'global', 'local', 'remote', 'internal', 'external', 'inbound', 'outbound', 'incoming', 'outgoing', 'upload', 'download', 'import', 'export', 'copy', 'paste', 'cut', 'undo', 'redo', 'zoom', 'pan', 'rotate', 'scale', 'move', 'resize', 'align', 'justify', 'center', 'left', 'right', 'top', 'bottom', 'middle', 'start', 'end', 'begin', 'finish', 'complete', 'incomplete', 'done', 'pending', 'scheduled', 'overdue', 'due', 'expired', 'active', 'inactive', 'enabled', 'disabled', 'visible', 'hidden', 'shown', 'collapsed', 'expanded', 'minimized', 'maximized', 'restored', 'focused', 'blurred', 'selected', 'unselected', 'checked', 'unchecked', 'marked', 'unmarked', 'flagged', 'unflagged', 'starred', 'unstarred', 'pinned', 'unpinned', 'archived', 'unarchived', 'deleted', 'restored', 'moved', 'copied', 'renamed', 'created', 'updated', 'modified', 'changed', 'added', 'removed', 'inserted', 'deleted', 'cleared', 'reset', 'initialized', 'configured', 'setup', 'installed', 'uninstalled', 'upgraded', 'downgraded', 'migrated', 'backed', 'restored', 'synchronized', 'connected', 'disconnected', 'linked', 'unlinked', 'joined', 'left', 'entered', 'exited', 'opened', 'closed', 'started', 'stopped', 'paused', 'resumed', 'cancelled', 'aborted', 'failed', 'succeeded', 'completed', 'finished', 'ended', 'terminated', 'killed', 'suspended', 'resumed', 'restarted', 'reloaded', 'refreshed', 'updated', 'upgraded', 'downgraded', 'patched', 'fixed', 'broken', 'working', 'not working', 'available', 'unavailable', 'accessible', 'inaccessible', 'readable', 'writable', 'executable', 'editable', 'viewable', 'printable', 'exportable', 'importable', 'downloadable', 'uploadable', 'shareable', 'private', 'public', 'restricted', 'unrestricted', 'limited', 'unlimited', 'free', 'paid', 'premium', 'basic', 'advanced', 'simple', 'complex', 'easy', 'hard', 'difficult', 'challenging', 'trivial', 'important', 'urgent', 'critical', 'major', 'minor', 'significant', 'insignificant', 'relevant', 'irrelevant', 'useful', 'useless', 'helpful', 'harmful', 'beneficial', 'detrimental', 'positive', 'negative', 'good', 'bad', 'excellent', 'poor', 'great', 'terrible', 'wonderful', 'awful', 'amazing', 'disappointing', 'satisfying', 'frustrating', 'enjoyable', 'boring', 'exciting', 'dull', 'interesting', 'uninteresting', 'engaging', 'disengaging', 'attractive', 'unattractive', 'beautiful', 'ugly', 'clean', 'dirty', 'organized', 'disorganized', 'structured', 'unstructured', 'systematic', 'random', 'logical', 'illogical', 'rational', 'irrational', 'reasonable', 'unreasonable', 'sensible', 'nonsensical', 'practical', 'impractical', 'realistic', 'unrealistic', 'feasible', 'infeasible', 'possible', 'impossible', 'likely', 'unlikely', 'probable', 'improbable', 'certain', 'uncertain', 'definite', 'indefinite', 'clear', 'unclear', 'obvious', 'obscure', 'explicit', 'implicit', 'direct', 'indirect', 'straightforward', 'complicated', 'simple', 'complex', 'basic', 'advanced', 'elementary', 'sophisticated', 'primitive', 'modern', 'traditional', 'conventional', 'unconventional', 'standard', 'nonstandard', 'normal', 'abnormal', 'regular', 'irregular', 'typical', 'atypical', 'common', 'uncommon', 'rare', 'frequent', 'occasional', 'constant', 'variable', 'fixed', 'flexible', 'rigid', 'adaptable', 'stable', 'unstable', 'reliable', 'unreliable', 'consistent', 'inconsistent', 'predictable', 'unpredictable', 'dependable', 'undependable', 'trustworthy', 'untrustworthy', 'secure', 'insecure', 'safe', 'unsafe', 'protected', 'unprotected', 'guarded', 'unguarded', 'monitored', 'unmonitored', 'tracked', 'untracked', 'logged', 'unlogged', 'recorded', 'unrecorded', 'saved', 'unsaved', 'backed', 'unbacked', 'archived', 'unarchived', 'stored', 'unstored', 'cached', 'uncached', 'buffered', 'unbuffered', 'queued', 'unqueued', 'scheduled', 'unscheduled', 'planned', 'unplanned', 'programmed', 'unprogrammed', 'automated', 'unautomated', 'manual', 'automatic', 'semi', 'fully', 'partially', 'completely', 'incompletely', 'totally', 'partially', 'wholly', 'partly', 'entirely', 'partially', 'fully', 'partially', 'mostly', 'slightly', 'barely', 'hardly', 'scarcely', 'rarely', 'seldom', 'occasionally', 'sometimes', 'often', 'frequently', 'usually', 'normally', 'typically', 'generally', 'commonly', 'regularly', 'constantly', 'continuously', 'persistently', 'consistently', 'reliably', 'dependably', 'steadily', 'stably', 'securely', 'safely', 'confidently', 'assuredly', 'certainly', 'definitely', 'absolutely', 'positively', 'undoubtedly', 'unquestionably', 'indisputably', 'incontestably', 'irrefutably', 'incontrovertibly', 'unarguably', 'uncontroversially', 'uncontestedly', 'unopposedly', 'unresistedly', 'unhinderedly', 'unimpededly', 'unobstructedly', 'unblockedly', 'unbarredly', 'unlockedly', 'unsealedly', 'unclosedly', 'unshutly', 'unfastenedly', 'unlatchedly', 'unboltedly', 'unsecuredly', 'unprotectedly', 'unguardedly', 'unwatchedly', 'unmonitoredly', 'unobservedly', 'unnoticedly', 'unspottedly', 'undetectedly', 'unrecognizedly', 'unidentifiedly', 'unlocatedly', 'unfoundly', 'undiscoveredly', 'unreachedly', 'unattainedly', 'unobtainedly', 'ungainedly', 'unearnedly', 'unwonly', 'unachievedly', 'unaccomplishedly', 'uncompletedly', 'unfinishedly', 'undonely', 'unattainedly', 'unreachedly', 'unobtainedly', 'ungainedly', 'unearnedly', 'unwonly', 'unachievedly', 'unaccomplishedly', 'uncompletedly', 'unfinishedly', 'undonely'];
    if (uiWords.some(word => text.toLowerCase().includes(word))) return true;

    if (text.length > 2 && !/^[0-9.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>]+$/.test(text)) return true;
    return false;
}

// 转换统计
const stats = { attributes: 0, textContent: 0, jsxExpressions: 0, conditionals: 0, arrays: 0, templates: 0, total: 0 };
const conversions = [];

function recordConversion(type, original, key, fullKey) {
    stats[type]++;
    stats.total++;
    conversions.push({ type, original, key, fullKey });
}

// 创建 t() 函数调用
function createTFunction(fullKey, defaultValue, interpolations = {}) {
    const args = [t.stringLiteral(fullKey)];

    if (Object.keys(interpolations).length > 0 || defaultValue) {
        const props = [];
        if (defaultValue) {
            props.push(t.objectProperty(t.identifier('defaultValue'), t.stringLiteral(defaultValue)));
        }
        for (const [key, value] of Object.entries(interpolations)) {
            props.push(t.objectProperty(t.identifier(key), value));
        }
        args.push(t.objectExpression(props));
    }

    return t.callExpression(t.identifier('t'), args);
}

// 文件转换主函数
function transformFile(filePath, options) {
    const original = fs.readFileSync(filePath, 'utf8');
    const { ns, group } = inferNsAndGroup(filePath);

    console.log(`[转换] 开始处理文件: ${filePath}`);
    console.log(`[转换] 命名空间: ${ns}, 分组: ${group}`);

    let ast;
    try {
        ast = parser.parse(original, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
    } catch (error) {
        console.error(`[错误] 解析文件失败: ${error.message}`);
        return { code: original, original, ns, group };
    }

    traverse(ast, {
        // JSX 属性
        JSXAttribute(path) {
            const { node } = path;
            if (node.value && node.value.type === 'StringLiteral') {
                const text = node.value.value;
                const attrName = node.name.name;

                // 只转换特定的属性
                const translatableAttrs = ['title', 'placeholder', 'label', 'name', 'type', 'variant', 'size'];
                if (!translatableAttrs.includes(attrName)) return;

                if (!shouldTranslate(text, { isAttribute: true, attrName })) return;

                const key = keyFromText(text);
                if (key && key.trim().length > 0) {
                    const fullKey = group ? `${ns}:${group}.${key}` : `${ns}:${key}`;
                    recordConversion('attributes', text, key, fullKey);

                    const tCall = createTFunction(fullKey, text);
                    node.value = t.jsxExpressionContainer(tCall);
                }
            }
        },

        // JSX 文本内容
        JSXText(path) {
            const text = path.node.value.trim();
            if (!text || !shouldTranslate(text)) return;

            const key = keyFromText(text);
            if (key && key.trim().length > 0) {
                const fullKey = group ? `${ns}:${group}.${key}` : `${ns}:${key}`;
                recordConversion('textContent', text, key, fullKey);

                const tCall = createTFunction(fullKey, text);
                path.replaceWith(t.jsxExpressionContainer(tCall));
            }
        },

        // 字符串字面量（在 JSX 表达式中）
        StringLiteral(path) {
            const { node } = path;
            const text = node.value;
            const parent = path.parent;

            // 检查是否在 JSX 表达式中
            if (parent && parent.type === 'JSXExpressionContainer') {
                if (!shouldTranslate(text)) return;

                const key = keyFromText(text);
                if (key && key.trim().length > 0) {
                    const fullKey = group ? `${ns}:${group}.${key}` : `${ns}:${key}`;
                    recordConversion('jsxExpressions', text, key, fullKey);

                    const tCall = createTFunction(fullKey, text);
                    path.replaceWith(tCall);
                }
            }
        },

        // 条件表达式中的字符串
        ConditionalExpression(path) {
            const { node } = path;

            // 处理 consequent (true 分支)
            if (node.consequent.type === 'StringLiteral') {
                const text = node.consequent.value;
                if (shouldTranslate(text)) {
                    const key = keyFromText(text);
                    if (key && key.trim().length > 0) {
                        const fullKey = group ? `${ns}:${group}.${key}` : `${ns}:${key}`;
                        recordConversion('conditionals', text, key, fullKey);

                        const tCall = createTFunction(fullKey, text);
                        node.consequent = tCall;
                    }
                }
            }

            // 处理 alternate (false 分支)
            if (node.alternate.type === 'StringLiteral') {
                const text = node.alternate.value;
                if (shouldTranslate(text)) {
                    const key = keyFromText(text);
                    if (key && key.trim().length > 0) {
                        const fullKey = group ? `${ns}:${group}.${key}` : `${ns}:${key}`;
                        recordConversion('conditionals', text, key, fullKey);

                        const tCall = createTFunction(fullKey, text);
                        node.alternate = tCall;
                    }
                }
            }
        },

        // 数组中的 text 属性
        ObjectProperty(path) {
            const { node } = path;
            if (node.key.name === 'text' && node.value.type === 'StringLiteral') {
                const text = node.value.value;
                if (!shouldTranslate(text)) return;

                const key = keyFromText(text);
                if (key && key.trim().length > 0) {
                    const fullKey = group ? `${ns}:${group}.${key}` : `${ns}:${key}`;
                    recordConversion('arrays', text, key, fullKey);

                    const tCall = createTFunction(fullKey, text);
                    node.value = tCall;
                }
            }
        },

        // 模板字符串
        TemplateLiteral(path) {
            const { node } = path;
            const quasis = node.quasis.map(q => q.value.raw);
            const expressions = node.expressions;

            // 跳过空模板字符串
            if (quasis.every(q => !q.trim()) && expressions.length === 0) return;

            // 处理简单的 head ${expr} tail 格式
            if (expressions.length === 1 && quasis.length === 2) {
                const head = quasis[0], tail = quasis[1], expr = expressions[0];
                if (expr.type === 'Identifier' || expr.type === 'MemberExpression') {
                    const name = expr.type === 'Identifier' ? expr.name : expr.property.name;
                    const def = `${head}{{${name}}}${tail}`;
                    if (!shouldTranslate(def)) return;

                    const key = keyFromText(def);
                    if (key && key.trim().length > 0) {
                        const fullKey = group ? `${ns}:${group}.${key}` : `${ns}:${key}`;
                        recordConversion('templates', def, key, fullKey);

                        const tCall = createTFunction(fullKey, def, { [name]: expr });
                        path.replaceWith(tCall);
                    }
                }
            }
            // 处理更复杂的模板字符串
            else if (expressions.length > 0) {
                // 检查是否包含需要翻译的内容
                const templateText = quasis.join('{{EXPR}}');
                const hasTranslatableContent = templateText.includes('Space') ||
                    templateText.includes('Room') ||
                    templateText.includes('space') ||
                    templateText.includes('room') ||
                    templateText.includes('Creating') ||
                    templateText.includes('create') ||
                    templateText.includes('Select') ||
                    templateText.includes('join') ||
                    templateText.includes('already in use') ||
                    templateText.includes('address') ||
                    templateText.includes('name');

                if (hasTranslatableContent) {
                    const def = templateText.replace(/{{EXPR}}/g, '{{value}}');
                    if (!shouldTranslate(def)) return;

                    const key = keyFromText(def);
                    if (key && key.trim().length > 0) {
                        const fullKey = group ? `${ns}:${group}.${key}` : `${ns}:${key}`;
                        recordConversion('templates', def, key, fullKey);

                        const interpolations = {};
                        expressions.forEach((expr, index) => {
                            interpolations[`value${index}`] = expr;
                        });

                        const tCall = createTFunction(fullKey, def, interpolations);
                        path.replaceWith(tCall);
                    }
                }
            }
        }
    });

    const result = generate(ast, { retainLines: true, compact: false });
    return { code: result.code, original, ns, group };
}

// 显示转换报告
function showReport() {
    if (conversions.length === 0) {
        console.log('[报告] 没有找到需要转换的内容');
        return;
    }

    console.log('\n[转换报告]');
    console.log(`总转换数: ${stats.total}`);
    console.log(`- 属性转换: ${stats.attributes}`);
    console.log(`- 文本内容: ${stats.textContent}`);
    console.log(`- JSX 表达式: ${stats.jsxExpressions}`);
    console.log(`- 条件表达式: ${stats.conditionals}`);
    console.log(`- 数组定义: ${stats.arrays}`);
    console.log(`- 模板字符串: ${stats.templates}`);

    if (options.report) {
        console.log('\n[详细转换列表]');
        const uniqueKeys = new Map();
        for (const conv of conversions) {
            if (!uniqueKeys.has(conv.fullKey)) {
                uniqueKeys.set(conv.fullKey, conv);
            }
        }
        for (const [fullKey, conv] of uniqueKeys) {
            console.log(`${fullKey} // ${conv.original}`);
        }
    }
}

// 主执行流程
try {
    const { code, original, ns, group } = transformFile(absPath, options);

    if (stats.total === 0) {
        console.log(`[转换] 在 ${options.file} 中没有找到需要转换的内容`);
    } else {
        showReport();

        if (options.print) {
            console.log('\n[更改预览]');
            const header = `--- ${options.file} (原始)\n+++ ${options.file} (修改后)\n`;
            console.log(header);

            const originalLines = original.split('\n');
            const newLines = code.split('\n');
            const maxLines = Math.max(originalLines.length, newLines.length);

            for (let i = 0; i < maxLines; i++) {
                const originalLine = originalLines[i] || '';
                const newLine = newLines[i] || '';
                if (originalLine !== newLine) {
                    console.log(`- ${originalLine}`);
                    console.log(`+ ${newLine}`);
                }
            }
        }

        if (options.write) {
            fs.writeFileSync(absPath, code, 'utf8');
            console.log(`[转换] 已写入文件: ${options.file}`);
        } else {
            console.log('[转换] 预览模式 (使用 --write 应用更改)');
        }
    }
} catch (error) {
    console.error(`[错误] 转换失败: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
}
