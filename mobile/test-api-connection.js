/**
 * 简化的API连接测试
 * 测试Web端API端点是否可访问
 */

const API_BASE_URL = 'http://localhost:3000';

async function testEndpoint(path, name) {
    try {
        const response = await fetch(`${API_BASE_URL}${path}`);
        const status = response.status;

        // 401表示需要认证,但端点存在
        // 200表示成功
        if (status === 401 || status === 200) {
            console.log(`✓ ${name}: 端点可访问 (${status})`);
            return true;
        } else {
            console.log(`✗ ${name}: 异常状态 (${status})`);
            return false;
        }
    } catch (error) {
        console.log(`✗ ${name}: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('\n=== API端点连接测试 ===\n');
    console.log(`测试目标: ${API_BASE_URL}\n`);

    // 测试Web端是否运行
    console.log('1. 检查Web端服务...');
    try {
        await fetch(`${API_BASE_URL}`);
        console.log('✓ Web端服务运行中\n');
    } catch (error) {
        console.log('✗ Web端服务未运行!');
        console.log('请先启动: cd web && npm run dev\n');
        return;
    }

    // 测试统计API端点
    console.log('2. 测试统计API端点...\n');

    const endpoints = [
        ['/api/stats/study', '学习统计'],
        ['/api/stats/charts', '图表数据'],
        ['/api/stats/heatmap', '热力图'],
        ['/api/stats/retention', '保留率'],
    ];

    let passed = 0;
    for (const [path, name] of endpoints) {
        if (await testEndpoint(path, name)) {
            passed++;
        }
    }

    console.log(`\n结果: ${passed}/${endpoints.length} 个端点可访问`);

    if (passed === endpoints.length) {
        console.log('\n✓ 所有API端点正常!');
        console.log('移动端可以连接到Web端API\n');
    } else {
        console.log('\n⚠ 部分端点不可访问\n');
    }
}

main();
