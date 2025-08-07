import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 专门检测UI字符串的模式
const uiPatterns = [
    // Text组件中的硬编码文本
    /<Text[^>]*>([^<]+[A-Z][a-zA-Z\s]*[a-zA-Z][^<]*)<\/Text>/g,
    // Button文本
    /<Button[^>]*>([^<]+[A-Z][a-zA-Z\s]*[a-zA-Z][^<]*)<\/Button>/g,
    // 字符串字面量（排除技术性字符串）
    /"([A-Z][a-zA-Z\s]{2,}[a-zA-Z])"/g,
    // 单引号字符串
    /'([A-Z][a-zA-Z\s]{2,}[a-zA-Z])'/g,
    // title属性
    /title="([^"]*[A-Z][a-zA-Z\s]*[a-zA-Z][^"]*)"/g,
    // placeholder属性
    /placeholder="([^"]*[A-Z][a-zA-Z\s]*[a-zA-Z][^"]*)"/g,
    // label属性
    /label="([^"]*[A-Z][a-zA-Z\s]*[a-zA-Z][^"]*)"/g,
];

// 要排除的技术性字符串模式
const excludePatterns = [
    /^[A-Z_]+$/,  // 常量
    /^[a-z]+$/,   // 小写单词
    /^[A-Z][a-z]+$/,  // 单个单词
    /^[0-9]+$/,   // 数字
    /^[A-Z][a-z]+[A-Z][a-z]+$/,  // 驼峰命名
    /^[a-z]+-[a-z]+$/,  // kebab-case
    /^[a-z]+_[a-z]+$/,  // snake_case
    /^(GET|POST|PUT|DELETE|PATCH)$/,  // HTTP方法
    /^(true|false|null|undefined)$/,  // 布尔值
    /^(Primary|Secondary|Success|Warning|Critical|Surface|Background)$/,  // 主题变量
    /^(Yes|No)$/,  // 布尔字符串
    /^(Top|Bottom|Left|Right|Center|Start|End)$/,  // 位置
    /^(Horizontal|Vertical|Both)$/,  // 方向
    /^(Solid|Soft|None)$/,  // 填充
    /^(Pill|Pill|300|400|500|600)$/,  // 尺寸
];

// 要扫描的文件扩展名
const extensions = ['.tsx', '.ts'];

// 要排除的目录
const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', 'scripts'];

function shouldExcludeString(str) {
    return excludePatterns.some(pattern => pattern.test(str));
}

function scanDirectory(dir, results = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(item)) {
                scanDirectory(fullPath, results);
            }
        } else if (extensions.includes(path.extname(item))) {
            scanFile(fullPath, results);
        }
    }

    return results;
}

function scanFile(filePath, results) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;

            // 跳过注释行
            if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
                continue;
            }

            for (const pattern of uiPatterns) {
                let match;
                while ((match = pattern.exec(line)) !== null) {
                    const str = match[1] || match[0];
                    if (str && !shouldExcludeString(str) && str.length > 2) {
                        // 清理字符串
                        const cleanStr = str.replace(/['"]/g, '').trim();
                        if (cleanStr.length > 2) {
                            results.push({
                                file: filePath,
                                line: lineNumber,
                                string: cleanStr,
                                context: line.trim(),
                                type: getStringType(match[0])
                            });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
    }
}

function getStringType(match) {
    if (match.includes('<Text>')) return 'Text Component';
    if (match.includes('<Button>')) return 'Button Text';
    if (match.includes('title=')) return 'Title Attribute';
    if (match.includes('placeholder=')) return 'Placeholder';
    if (match.includes('label=')) return 'Label';
    if (match.includes('"') && !match.includes('<')) return 'String Literal';
    if (match.includes("'") && !match.includes('<')) return 'String Literal';
    return 'Unknown';
}

function generateReport(results) {
    console.log('=== UI硬编码字符串检测报告 ===\n');

    // 按文件分组
    const fileGroups = {};
    const stringCount = {};

    for (const result of results) {
        if (!fileGroups[result.file]) {
            fileGroups[result.file] = [];
        }
        fileGroups[result.file].push(result);

        // 统计字符串出现次数
        if (!stringCount[result.string]) {
            stringCount[result.string] = 0;
        }
        stringCount[result.string]++;
    }

    // 按出现频率排序
    const sortedStrings = Object.entries(stringCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20); // 只显示前20个最常见的

    console.log('🔝 最常见的硬编码字符串:');
    sortedStrings.forEach(([str, count]) => {
        console.log(`  "${str}" - 出现 ${count} 次`);
    });

    console.log('\n📁 按文件分组:');
    for (const [file, items] of Object.entries(fileGroups)) {
        console.log(`\n📄 ${file}:`);
        items.forEach(item => {
            console.log(`  Line ${item.line} (${item.type}): "${item.string}"`);
        });
    }

    console.log(`\n📊 总计: ${results.length} 个UI硬编码字符串`);
    console.log(`📊 唯一字符串: ${Object.keys(stringCount).length} 个`);

    console.log('\n💡 建议:');
    console.log('1. 优先翻译出现频率最高的字符串');
    console.log('2. 使用 t() 函数替换硬编码字符串');
    console.log('3. 将翻译键添加到 en.json 和 zh.json');
}

// 开始扫描
const srcDir = path.join(__dirname, '..', 'src');
console.log('开始扫描 src 目录中的UI字符串...\n');

const results = scanDirectory(srcDir);
generateReport(results);
