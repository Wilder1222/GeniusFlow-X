/**
 * AI Domain Configuration
 * 垂直领域配置 - 为不同学科领域提供优化的AI生成参数
 */

export type AIDomain =
    | 'general'      // 通用
    | 'language'     // 语言学习
    | 'programming'  // 编程开发
    | 'science'      // 自然科学
    | 'history'      // 历史人文
    | 'medicine'     // 医学健康
    | 'business'     // 商业财经
    | 'law'          // 法律法规
    | 'exam';        // 考试备考

export interface DomainConfig {
    id: AIDomain;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    systemPrompt: string;
    suggestions: string[];
    cardStyle: 'qa' | 'definition' | 'cloze';
    color: string;
}

export const AI_DOMAINS: DomainConfig[] = [
    {
        id: 'general',
        name: '通用',
        nameEn: 'General',
        icon: '✨',
        description: '适用于各类主题的通用生成模式',
        systemPrompt: `You are an expert flashcard creator. Create high-quality flashcards that test understanding of key concepts.
Guidelines:
- Questions should be clear, specific, and unambiguous
- Answers should be concise but complete
- Focus on core concepts, definitions, and relationships
- Include example-based questions when helpful`,
        suggestions: ['商务英语', 'Python基础', '心理学效应', '世界地理'],
        cardStyle: 'qa',
        color: '#6366f1'
    },
    {
        id: 'language',
        name: '语言学习',
        nameEn: 'Language',
        icon: '🌍',
        description: '外语词汇、语法、表达学习',
        systemPrompt: `You are a language learning flashcard expert. Create cards optimized for vocabulary acquisition and grammar mastery.
Guidelines:
- Include pronunciation hints when relevant
- Provide example sentences for context
- Note common usage patterns and collocations
- Highlight irregular forms or exceptions
- Include cultural context when appropriate`,
        suggestions: ['日语N3词汇', '英语商务邮件', '法语基础动词', '韩语日常对话'],
        cardStyle: 'qa',
        color: '#10b981'
    },
    {
        id: 'programming',
        name: '编程开发',
        nameEn: 'Programming',
        icon: '💻',
        description: '编程语言、框架、算法与数据结构',
        systemPrompt: `You are a programming education specialist. Create flashcards that help developers master coding concepts.
Guidelines:
- Include code snippets when relevant (keep them short)
- Explain the "why" behind concepts, not just "what"
- Cover common pitfalls and best practices
- Test understanding of time/space complexity for algorithms
- Include practical use cases and scenarios`,
        suggestions: ['React Hooks', 'Python数据结构', 'SQL查询优化', 'Git命令'],
        cardStyle: 'qa',
        color: '#3b82f6'
    },
    {
        id: 'science',
        name: '自然科学',
        nameEn: 'Science',
        icon: '🔬',
        description: '物理、化学、生物、数学等理科知识',
        systemPrompt: `You are a science education expert. Create flashcards that build deep understanding of scientific concepts.
Guidelines:
- Explain mechanisms and processes clearly
- Use analogies to simplify complex ideas
- Include relevant formulas with explanations
- Connect concepts to real-world applications
- Test both conceptual understanding and problem-solving`,
        suggestions: ['光合作用原理', '有机化学反应', '牛顿运动定律', '细胞分裂'],
        cardStyle: 'qa',
        color: '#8b5cf6'
    },
    {
        id: 'history',
        name: '历史人文',
        nameEn: 'History',
        icon: '📜',
        description: '历史事件、文化、哲学、艺术',
        systemPrompt: `You are a humanities education specialist. Create flashcards that illuminate historical and cultural knowledge.
Guidelines:
- Include dates and key figures for historical events
- Explain cause-and-effect relationships
- Connect events to broader historical contexts
- Highlight cultural significance and lasting impact
- Include primary source references when relevant`,
        suggestions: ['二战重要战役', '文艺复兴艺术家', '中国古代哲学', '世界文化遗产'],
        cardStyle: 'qa',
        color: '#f59e0b'
    },
    {
        id: 'medicine',
        name: '医学健康',
        nameEn: 'Medicine',
        icon: '⚕️',
        description: '医学知识、解剖学、药理学、临床',
        systemPrompt: `You are a medical education specialist. Create flashcards that support mastery of medical knowledge.
Guidelines:
- Use precise medical terminology with clear definitions
- Explain pathophysiology and mechanisms
- Include clinical presentations and diagnostic criteria
- Note drug interactions and contraindications
- Emphasize safety-critical information`,
        suggestions: ['人体解剖学', '常见药物作用', '心血管疾病', '急救知识'],
        cardStyle: 'qa',
        color: '#ef4444'
    },
    {
        id: 'business',
        name: '商业财经',
        nameEn: 'Business',
        icon: '📈',
        description: '经济学、金融、管理、市场营销',
        systemPrompt: `You are a business education expert. Create flashcards that build strong business acumen.
Guidelines:
- Include relevant formulas and metrics
- Explain concepts with practical business examples
- Cover both theory and real-world applications
- Include case study references when helpful
- Connect concepts to current market trends`,
        suggestions: ['财务报表分析', '市场营销策略', 'MBA核心概念', '投资理财基础'],
        cardStyle: 'qa',
        color: '#14b8a6'
    },
    {
        id: 'law',
        name: '法律法规',
        nameEn: 'Law',
        icon: '⚖️',
        description: '法律条文、判例、法学原理',
        systemPrompt: `You are a legal education specialist. Create flashcards that support mastery of legal concepts.
Guidelines:
- Cite specific laws and articles when relevant
- Explain legal principles with case examples
- Distinguish between similar legal concepts
- Note jurisdictional differences when important
- Include procedural requirements and deadlines`,
        suggestions: ['民法典要点', '刑法罪名', '合同法条款', '知识产权法'],
        cardStyle: 'qa',
        color: '#64748b'
    },
    {
        id: 'exam',
        name: '考试备考',
        nameEn: 'Exam Prep',
        icon: '📝',
        description: '标准化考试、资格证书备考',
        systemPrompt: `You are an exam preparation specialist. Create flashcards optimized for test performance.
Guidelines:
- Focus on high-frequency test topics
- Include common question patterns and formats
- Provide memory tricks and mnemonics
- Highlight commonly confused concepts
- Include practice calculations where relevant`,
        suggestions: ['CPA会计师', '托福词汇', '驾照理论', '教师资格证'],
        cardStyle: 'qa',
        color: '#d946ef'
    }
];

/**
 * Get domain configuration by ID
 */
export function getDomainConfig(domainId: AIDomain): DomainConfig {
    return AI_DOMAINS.find(d => d.id === domainId) || AI_DOMAINS[0];
}

/**
 * Build the complete system prompt for a domain
 */
export function buildDomainPrompt(domainId: AIDomain, text: string, count?: number): string {
    const domain = getDomainConfig(domainId);

    const cardCountDesc = count
        ? `exactly ${Math.min(Math.max(1, count), 10)}`
        : "an appropriate number (maximum 10 based on text complexity)";

    return `${domain.systemPrompt}

First, detect the language of the following text. 
Then, generate ${cardCountDesc} high-quality flashcards.

Text: ${text}

### MANDATORY LANGUAGE CONSTRAINTS:
- The content MUST be in the same language as the input text above.
- !! IF THE INPUT IS IN CHINESE, THE OUTPUT MUST BE IN SIMPLIFIED CHINESE (简体中文). !!
- !! DO NOT USE JAPANESE KANJI IF THE INPUT IS CHINESE. !!
- All fields (front, back, tags) must strictly adhere to the detected language.

### CRITICAL JSON FORMATTING RULES:
- Return ONLY a valid JSON array. No markdown wrapping around the JSON.
- For code examples in "back" field: use inline code with single backticks like \`code\`
- Keep answers concise. Avoid multi-line code blocks to ensure valid JSON.
- Properly escape special characters: use \\" for quotes, \\n for newlines.

Return with this exact structure:
[
  {
    "front": "Clear, specific question",
    "back": "Concise answer with inline code like \`example()\` when needed.",
    "tags": ["topic1", "topic2"],
    "difficulty": "easy|medium|hard"
  }
]

Guidelines:
- Questions should be unambiguous and test understanding.
- Answers should be accurate and self-contained.
- Focus on key concepts, definitions, and facts.
- Use simple language within the detected language.
- Assign difficulty based on concept complexity.`;
}
