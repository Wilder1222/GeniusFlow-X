/**
 * Mobile App Infrastructure Verification Script
 * 
 * 自动验证项目结构和代码完整性
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
    category: string;
    test: string;
    passed: boolean;
    message?: string;
}

const results: TestResult[] = [];

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');

// 测试1: 检查必要文件是否存在
function testFileStructure(): void {
    const requiredFiles = [
        // 配置文件
        'src/config/theme.ts',
        'src/config/constants.ts',

        // 上下文
        'src/contexts/ThemeContext.tsx',

        // 通用组件
        'src/components/common/Button.tsx',
        'src/components/common/Card.tsx',
        'src/components/common/Input.tsx',
        'src/components/common/Modal.tsx',
        'src/components/common/LoadingSpinner.tsx',
        'src/components/common/index.ts',

        // 应用路由
        'app/_layout.tsx',
        'app/index.tsx',
        'app/auth/login.tsx',
        'app/auth/signup.tsx',
        'app/(tabs)/_layout.tsx',
        'app/(tabs)/home.tsx',
        'app/(tabs)/decks.tsx',
        'app/(tabs)/stats.tsx',
        'app/(tabs)/profile.tsx',

        // 项目配置
        'package.json',
        'app.json',
        'tsconfig.json',
    ];

    requiredFiles.forEach(file => {
        const filePath = path.join(ROOT_DIR, file);
        const exists = fs.existsSync(filePath);
        results.push({
            category: 'File Structure',
            test: `Check ${file}`,
            passed: exists,
            message: exists ? 'File exists' : 'File missing',
        });
    });
}

// 测试2: 检查导入依赖
function testDependencies(): void {
    const packageJsonPath = path.join(ROOT_DIR, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        results.push({
            category: 'Dependencies',
            test: 'package.json exists',
            passed: false,
            message: 'package.json not found',
        });
        return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const requiredDeps = [
        'expo',
        'expo-router',
        'react',
        'react-native',
        'react-native-reanimated',
        'react-native-gesture-handler',
        'react-native-safe-area-context',
        'expo-blur',
        'expo-secure-store',
        'react-native-flash-message',
    ];

    requiredDeps.forEach(dep => {
        const installed =
            packageJson.dependencies?.[dep] ||
            packageJson.devDependencies?.[dep];

        results.push({
            category: 'Dependencies',
            test: `Check ${dep}`,
            passed: !!installed,
            message: installed ? `Installed: ${installed}` : 'Not installed',
        });
    });
}

// 测试3: 验证组件导出
function testComponentExports(): void {
    const indexPath = path.join(ROOT_DIR, 'src/components/common/index.ts');

    if (!fs.existsSync(indexPath)) {
        results.push({
            category: 'Component Exports',
            test: 'index.ts exists',
            passed: false,
        });
        return;
    }

    const content = fs.readFileSync(indexPath, 'utf-8');
    const expectedExports = ['Button', 'Card', 'Input', 'Modal', 'LoadingSpinner'];

    expectedExports.forEach(component => {
        const exported = content.includes(`export { ${component} }`);
        results.push({
            category: 'Component Exports',
            test: `Export ${component}`,
            passed: exported,
            message: exported ? 'Exported' : 'Not exported',
        });
    });
}

// 测试4: 检查主题配置
function testThemeConfig(): void {
    const themePath = path.join(ROOT_DIR, 'src/config/theme.ts');

    if (!fs.existsSync(themePath)) {
        results.push({
            category: 'Theme Config',
            test: 'theme.ts exists',
            passed: false,
        });
        return;
    }

    const content = fs.readFileSync(themePath, 'utf-8');
    const expectedThemes = ['lightTheme', 'darkTheme', 'classicDarkTheme'];

    expectedThemes.forEach(theme => {
        const defined = content.includes(`export const ${theme}`);
        results.push({
            category: 'Theme Config',
            test: `Define ${theme}`,
            passed: defined,
            message: defined ? 'Defined' : 'Not defined',
        });
    });
}

// 运行所有测试
function runTests(): void {
    console.log('🔍 Running Mobile App Infrastructure Tests...\n');

    testFileStructure();
    testDependencies();
    testComponentExports();
    testThemeConfig();

    // 生成报告
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log('='.repeat(60));
    console.log('TEST RESULTS');
    console.log('='.repeat(60));

    // 按类别分组
    const categories = [...new Set(results.map(r => r.category))];
    categories.forEach(category => {
        console.log(`\n📦 ${category}`);
        const categoryResults = results.filter(r => r.category === category);
        categoryResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            const message = result.message ? ` - ${result.message}` : '';
            console.log(`  ${icon} ${result.test}${message}`);
        });
    });

    console.log('\n' + '='.repeat(60));
    console.log(`SUMMARY: ${passed}/${total} tests passed (${failed} failed)`);
    console.log('='.repeat(60));

    if (failed > 0) {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed!');
        process.exit(0);
    }
}

// 执行测试
runTests();
