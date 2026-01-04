/**
 * 统计API测试脚本
 * 用于验证移动端与Web端的API集成
 * 
 * 运行: node test-stats-api.js
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

// 模拟的认证token (需要替换为真实token)
let AUTH_TOKEN = '';

// 测试结果
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

// 辅助函数
function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        error: '\x1b[31m',
        warning: '\x1b[33m'
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}${message}${reset}`);
}

function recordTest(name, passed, message) {
    results.tests.push({ name, passed, message });
    if (passed) {
        results.passed++;
        log(`✓ ${name}`, 'success');
    } else {
        results.failed++;
        log(`✗ ${name}: ${message}`, 'error');
    }
}

// API测试函数
async function testAPI(endpoint, testName) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            recordTest(testName, false, `HTTP ${response.status}`);
            return null;
        }

        const data = await response.json();
        recordTest(testName, true, 'OK');
        return data;
    } catch (error) {
        recordTest(testName, false, error.message);
        return null;
    }
}

// 主测试流程
async function runTests() {
    log('\n=== GeniusFlow-X 统计API测试 ===\n', 'info');
    log(`API Base URL: ${API_BASE_URL}\n`, 'info');

    // 检查Web端是否运行
    log('1. 检查Web端服务...', 'info');
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`).catch(() => null);
        if (!response) {
            log('✗ Web端服务未运行!', 'error');
            log('请先启动Web端: cd web && npm run dev', 'warning');
            return;
        }
        log('✓ Web端服务正常运行', 'success');
    } catch (error) {
        log('✗ 无法连接到Web端', 'error');
        return;
    }

    // 提示获取token
    log('\n2. 认证检查...', 'info');
    if (!AUTH_TOKEN) {
        log('⚠ 未设置AUTH_TOKEN', 'warning');
        log('请按以下步骤获取token:', 'info');
        log('  1. 在浏览器打开 http://localhost:3000', 'info');
        log('  2. 登录账号', 'info');
        log('  3. 打开浏览器开发者工具 -> Application -> Local Storage', 'info');
        log('  4. 查找 supabase.auth.token', 'info');
        log('  5. 复制access_token的值', 'info');
        log('  6. 设置环境变量: set AUTH_TOKEN=<your_token>', 'info');
        log('  7. 重新运行此脚本\n', 'info');
        return;
    }

    log('\n3. 测试统计API端点...\n', 'info');

    // 测试各个API
    const studyData = await testAPI('/api/stats/study', '学习统计基础数据');
    const chartsData = await testAPI('/api/stats/charts?range=7d', '图表数据(7天)');
    const heatmapData = await testAPI('/api/stats/heatmap', '热力图数据');
    const retentionData = await testAPI('/api/stats/retention', '保留率数据');

    // 数据验证
    log('\n4. 数据格式验证...\n', 'info');

    if (studyData && studyData.data) {
        const hasRequiredFields =
            'total_cards_reviewed' in studyData.data &&
            'current_streak' in studyData.data;
        recordTest('学习统计数据格式', hasRequiredFields,
            hasRequiredFields ? 'OK' : '缺少必需字段');
    }

    if (chartsData && chartsData.data) {
        const hasRequiredFields =
            Array.isArray(chartsData.data.trendData) &&
            Array.isArray(chartsData.data.ratingDistribution);
        recordTest('图表数据格式', hasRequiredFields,
            hasRequiredFields ? 'OK' : '数据格式不正确');
    }

    if (heatmapData && heatmapData.data) {
        const isArray = Array.isArray(heatmapData.data);
        recordTest('热力图数据格式', isArray,
            isArray ? 'OK' : '应该是数组');
    }

    if (retentionData && retentionData.data) {
        const hasRequiredFields = 'byDifficulty' in retentionData.data;
        recordTest('保留率数据格式', hasRequiredFields,
            hasRequiredFields ? 'OK' : '缺少byDifficulty字段');
    }

    // 打印测试结果
    log('\n=== 测试结果 ===\n', 'info');
    log(`通过: ${results.passed}`, 'success');
    log(`失败: ${results.failed}`, results.failed > 0 ? 'error' : 'info');
    log(`总计: ${results.tests.length}\n`, 'info');

    if (results.failed === 0) {
        log('🎉 所有测试通过!移动端可以正常调用Web端API', 'success');
    } else {
        log('⚠ 部分测试失败,请检查上述错误', 'warning');
    }

    // 详细结果
    if (results.failed > 0) {
        log('\n失败的测试:', 'error');
        results.tests
            .filter(t => !t.passed)
            .forEach(t => log(`  - ${t.name}: ${t.message}`, 'error'));
    }
}

// 运行测试
runTests().catch(error => {
    log(`\n测试执行错误: ${error.message}`, 'error');
    process.exit(1);
});
