const fs = require('fs');
const path = require('path');

// 读取翻译文件
const zhPath = path.join(__dirname, '../messages/zh.json');
const enPath = path.join(__dirname, '../messages/en.json');

const zhContent = JSON.parse(fs.readFileSync(zhPath, 'utf8'));
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// 获取所有键的函数
function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

// 检查中文翻译中的英文单词 (排除专业术语)
function checkChineseForEnglish(obj, prefix = '') {
    const issues = [];
    const allowedTerms = ['AI', 'SM-2', 'XP', 'PDF', 'DOCX', 'TXT', 'LaTeX', 'GitHub', 'Google',
        'Anki', 'API', 'JSON', 'Markdown', 'Q&A', 'N3', 'MBA', 'CPA', 'TOEFL',
        'JLPT', 'IP', 'ADP', 'ATP', 'DNA', 'RNA', 'WWII'];

    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            issues.push(...checkChineseForEnglish(obj[key], fullKey));
        } else if (typeof obj[key] === 'string') {
            // 检查是否包含英文单词 (3个或更多连续字母)
            const englishWords = obj[key].match(/[a-zA-Z]{3,}/g);
            if (englishWords) {
                const problematicWords = englishWords.filter(word =>
                    !allowedTerms.some(term => term.toLowerCase() === word.toLowerCase())
                );
                if (problematicWords.length > 0) {
                    issues.push({
                        key: fullKey,
                        value: obj[key],
                        words: problematicWords
                    });
                }
            }
        }
    }
    return issues;
}

// 检查英文翻译中的中文字符
function checkEnglishForChinese(obj, prefix = '') {
    const issues = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            issues.push(...checkEnglishForChinese(obj[key], fullKey));
        } else if (typeof obj[key] === 'string') {
            // 检查是否包含中文字符
            if (/[\u4e00-\u9fa5]/.test(obj[key])) {
                issues.push({
                    key: fullKey,
                    value: obj[key]
                });
            }
        }
    }
    return issues;
}

console.log('=== 国际化翻译检查报告 ===\n');

// 1. 检查键的一致性
const zhKeys = getAllKeys(zhContent);
const enKeys = getAllKeys(enContent);

const missingInEn = zhKeys.filter(k => !enKeys.includes(k));
const missingInZh = enKeys.filter(k => !zhKeys.includes(k));

console.log('1. 翻译键一致性检查:');
console.log(`   中文文件键数量: ${zhKeys.length}`);
console.log(`   英文文件键数量: ${enKeys.length}`);

if (missingInEn.length > 0) {
    console.log(`\n   ⚠️  英文文件中缺失的键 (${missingInEn.length}个):`);
    missingInEn.forEach(k => console.log(`      - ${k}`));
}

if (missingInZh.length > 0) {
    console.log(`\n   ⚠️  中文文件中缺失的键 (${missingInZh.length}个):`);
    missingInZh.forEach(k => console.log(`      - ${k}`));
}

if (missingInEn.length === 0 && missingInZh.length === 0) {
    console.log('   ✅ 所有翻译键完全一致\n');
} else {
    console.log('');
}

// 2. 检查中文翻译中的英文
console.log('2. 中文翻译中的英文单词检查:');
const zhEnglishIssues = checkChineseForEnglish(zhContent);
if (zhEnglishIssues.length > 0) {
    console.log(`   发现 ${zhEnglishIssues.length} 处可能需要本地化的英文:`);
    zhEnglishIssues.slice(0, 20).forEach(issue => {
        console.log(`   - ${issue.key}`);
        console.log(`     值: "${issue.value}"`);
        console.log(`     英文单词: ${issue.words.join(', ')}\n`);
    });
    if (zhEnglishIssues.length > 20) {
        console.log(`   ... 还有 ${zhEnglishIssues.length - 20} 处未显示\n`);
    }
} else {
    console.log('   ✅ 未发现需要本地化的英文单词\n');
}

// 3. 检查英文翻译中的中文
console.log('3. 英文翻译中的中文字符检查:');
const enChineseIssues = checkEnglishForChinese(enContent);
if (enChineseIssues.length > 0) {
    console.log(`   ⚠️  发现 ${enChineseIssues.length} 处中文字符:`);
    enChineseIssues.forEach(issue => {
        console.log(`   - ${issue.key}: "${issue.value}"`);
    });
} else {
    console.log('   ✅ 未发现中文字符\n');
}

// 4. 统计信息
console.log('\n=== 统计摘要 ===');
console.log(`总翻译键数量: ${zhKeys.length}`);
console.log(`键不一致问题: ${missingInEn.length + missingInZh.length}`);
console.log(`中文中的英文: ${zhEnglishIssues.length}`);
console.log(`英文中的中文: ${enChineseIssues.length}`);

// 生成详细报告文件
const report = {
    summary: {
        totalKeys: zhKeys.length,
        keyMismatches: missingInEn.length + missingInZh.length,
        chineseEnglishIssues: zhEnglishIssues.length,
        englishChineseIssues: enChineseIssues.length
    },
    missingInEnglish: missingInEn,
    missingInChinese: missingInZh,
    chineseWithEnglish: zhEnglishIssues,
    englishWithChinese: enChineseIssues
};

const reportPath = path.join(__dirname, '../i18n-validation-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`\n详细报告已保存到: ${reportPath}`);
