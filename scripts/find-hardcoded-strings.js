import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 硬编码字符串的正则表达式模式
const patterns = [
    /"[A-Z][a-zA-Z\s]*[a-zA-Z]"/g,  // 首字母大写的字符串
    /'[A-Z][a-zA-Z\s]*[a-zA-Z]'/g,  // 单引号包围的首字母大写字符串
    /<Text[^>]*>[^<]*[A-Z][a-zA-Z\s]*[a-zA-Z][^<]*<\/Text>/g,  // Text组件中的硬编码
    /title="[^"]*[A-Z][a-zA-Z\s]*[a-zA-Z][^"]*"/g,  // title属性
    /description="[^"]*[A-Z][a-zA-Z\s]*[a-zA-Z][^"]*"/g,  // description属性
];

// 要扫描的文件扩展名
const extensions = ['.tsx', '.ts', '.jsx', '.js'];

// 要排除的目录
const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'coverage'];

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

            for (const pattern of patterns) {
                const matches = line.match(pattern);
                if (matches) {
                    results.push({
                        file: filePath,
                        line: lineNumber,
                        content: line.trim(),
                        matches: matches
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
    }
}

function generateReport(results) {
    console.log('=== 硬编码字符串检测报告 ===\n');

    const fileGroups = {};

    for (const result of results) {
        if (!fileGroups[result.file]) {
            fileGroups[result.file] = [];
        }
        fileGroups[result.file].push(result);
    }

    for (const [file, items] of Object.entries(fileGroups)) {
        console.log(`\n📁 ${file}:`);
        for (const item of items) {
            console.log(`  Line ${item.line}: ${item.content}`);
        }
    }

    console.log(`\n总计: ${results.length} 个可能的硬编码字符串`);
}

// 开始扫描
const srcDir = path.join(__dirname, '..', 'src');
console.log('开始扫描 src 目录...\n');

const results = scanDirectory(srcDir);
generateReport(results);
