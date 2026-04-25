import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client/index.js';
import { requireAuth } from '../plugins/auth-middleware.js';

const prisma = new PrismaClient();

// 服务提供商类型（只使用传统规则引擎）
type AIProvider = 'rule-engine';

// AI任务类型
type AITask =
  | 'finance-parse' // 智能记账解析
  | 'daily-briefing' // 每日简报生成
  | 'study-summary' // 学习内容摘要生成
  | 'exercise-recommend' // 运动推荐
  | 'general-chat'; // 通用聊天

// AI请求接口
interface AIRequest {
  task: AITask;
  input: string;
  context?: Record<string, any>;
  options?: {
    provider?: AIProvider; // 指定提供商，否则自动选择
    maxTokens?: number;
    temperature?: number;
  };
}

// AI响应接口
interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: AIProvider;
  latency: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// AI提供商配置
interface AIProviderConfig {
  name: AIProvider;
  enabled: boolean;
  priority: number; // 优先级，数字越小优先级越高
  apiKey?: string;
  baseUrl?: string;
  rateLimit?: {
    requestsPerMinute: number;
  };
}

// 默认提供商配置（不使用AI，只使用传统规则引擎）
const DEFAULT_PROVIDERS: AIProviderConfig[] = [
  {
    name: 'rule-engine',
    enabled: true, // 总是启用，使用传统规则引擎
    priority: 0,
  },
];

// AI Gateway主类
class AIGateway {
  private providers: AIProviderConfig[];
  private providerCache: Map<
    AIProvider,
    { lastRequest: number; requestCount: number }
  > = new Map();

  constructor(providers: AIProviderConfig[] = DEFAULT_PROVIDERS) {
    this.providers = providers
      .filter((p) => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    console.log(
      `AI Gateway initialized with ${this.providers.length} providers:`,
      this.providers.map((p) => p.name),
    );
  }

  // 选择最佳提供商
  private selectProvider(preferred?: AIProvider): AIProviderConfig {
    if (preferred) {
      const provider = this.providers.find((p) => p.name === preferred);
      if (provider) return provider;
    }

    // 返回优先级最高的可用提供商
    return this.providers[0];
  }

  // 检查速率限制
  private checkRateLimit(provider: AIProviderConfig): boolean {
    if (!provider.rateLimit) return true;

    const cacheKey = provider.name;
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    const stats = this.providerCache.get(cacheKey) || {
      lastRequest: 0,
      requestCount: 0,
    };

    // 清除过期的统计
    if (stats.lastRequest < oneMinuteAgo) {
      stats.requestCount = 0;
    }

    // 检查是否超过限制
    if (stats.requestCount >= provider.rateLimit.requestsPerMinute) {
      return false;
    }

    return true;
  }

  // 更新速率限制统计
  private updateRateLimit(provider: AIProviderConfig) {
    const cacheKey = provider.name;
    const now = Date.now();

    const stats = this.providerCache.get(cacheKey) || {
      lastRequest: 0,
      requestCount: 0,
    };
    stats.lastRequest = now;
    stats.requestCount++;
    this.providerCache.set(cacheKey, stats);
  }

  // 调用AI服务
  async callAI(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const providerConfig = this.selectProvider(request.options?.provider);
    const { name: provider } = providerConfig;

    // 检查速率限制
    if (!this.checkRateLimit(providerConfig)) {
      return {
        success: false,
        error: `速率限制 exceeded for provider ${provider}`,
        provider,
        latency: Date.now() - startTime,
      };
    }

    try {
      let result;

      // 根据任务类型调用不同的处理函数
      switch (request.task) {
        case 'finance-parse':
          result = await this.handleFinanceParse(
            request.input,
            request.context,
            providerConfig,
          );
          break;
        case 'daily-briefing':
          result = await this.handleDailyBriefing(
            request.context,
            providerConfig,
          );
          break;
        case 'study-summary':
          result = await this.handleStudySummary(
            request.input,
            request.context,
            providerConfig,
          );
          break;
        case 'exercise-recommend':
          result = await this.handleExerciseRecommend(
            request.context,
            providerConfig,
          );
          break;
        case 'general-chat':
          result = await this.handleGeneralChat(request.input, providerConfig);
          break;
        default:
          throw new Error(`Unknown task: ${request.task}`);
      }

      // 更新速率限制统计
      this.updateRateLimit(providerConfig);

      return {
        success: true,
        data: result,
        provider,
        latency: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error(`AI call failed with provider ${provider}:`, error);

      // 如果当前提供商失败，尝试下一个（降级）
      const nextProvider = this.providers.find(
        (p) => p.priority > providerConfig.priority,
      );
      if (nextProvider && request.options?.provider === undefined) {
        console.log(`Falling back to next provider: ${nextProvider.name}`);
        return this.callAI({
          ...request,
          options: { ...request.options, provider: nextProvider.name },
        });
      }

      return {
        success: false,
        error: error.message || 'AI服务调用失败',
        provider,
        latency: Date.now() - startTime,
      };
    }
  }

  // 智能记账解析处理器
  private async handleFinanceParse(
    input: string,
    context?: Record<string, any>,
    provider?: AIProviderConfig,
  ): Promise<any> {
    // 使用AI解析自然语言记账文本
    const prompt = `请将以下中文记账文本解析为结构化数据。输入: "${input}"

要求返回JSON格式:
{
  "type": "income" 或 "expense",
  "amount": 金额（数字）,
  "category": "分类名称",
  "account": "账户名称"（如支付宝、微信、现金、银行卡等）,
  "note": "备注说明"（可选）,
  "date": "YYYY-MM-DD"（可选，默认为今天）
}

分类参考:
- 收入: 工资、奖金、投资、其他收入
- 支出: 餐饮、交通、购物、娱乐、学习、医疗、住房、其他支出

示例:
输入: "今天午餐用支付宝花了35元"
输出: {"type": "expense", "amount": 35, "category": "餐饮", "account": "支付宝", "note": "午餐"}

输入: "收到工资转账5000元到银行卡"
输出: {"type": "income", "amount": 5000, "category": "工资", "account": "银行卡", "note": "工资转账"}

现在解析这个输入: "${input}"`;

    const aiResponse = await this.callGenericAI(prompt, provider);
    return this.parseFinanceAIResponse(aiResponse);
  }

  // 每日简报生成处理器
  private async handleDailyBriefing(
    context?: Record<string, any>,
    provider?: AIProviderConfig,
  ): Promise<any> {
    // 生成每日简报
    const prompt = `请生成一份个人每日简报，包含以下内容:
1. 今日天气建议（根据当前季节和日期）
2. 健康提醒（饮食、运动建议）
3. 财务小贴士
4. 学习/阅读建议
5. 励志语录

今天是 ${new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

请以友好的中文语气生成，格式为Markdown。`;

    const aiResponse = await this.callGenericAI(prompt, provider);
    return aiResponse;
  }

  // 学习内容摘要生成处理器
  private async handleStudySummary(
    input: string,
    context?: Record<string, any>,
    provider?: AIProviderConfig,
  ): Promise<any> {
    // 生成学习内容摘要
    const prompt = `请为以下学习内容生成摘要:

学习内容:
${input}

要求:
1. 提取3-5个关键点
2. 总结核心概念
3. 提供学习建议
4. 格式为Markdown

请使用中文回复。`;

    const aiResponse = await this.callGenericAI(prompt, provider);
    return aiResponse;
  }

  // 运动推荐处理器
  private async handleExerciseRecommend(
    context?: Record<string, any>,
    provider?: AIProviderConfig,
  ): Promise<any> {
    // 生成运动推荐
    const prompt = `请根据以下信息生成个性化运动推荐:
- 当前季节: ${this.getCurrentSeason()}
- 当前时间: ${new Date().getHours()}点
- 推荐类型: 室内/室外运动

要求:
1. 推荐3种适合当前条件的运动
2. 每种运动说明时长、强度和注意事项
3. 提供热身和放松建议
4. 格式为Markdown

请使用中文回复。`;

    const aiResponse = await this.callGenericAI(prompt, provider);
    return aiResponse;
  }

  // 通用聊天处理器
  private async handleGeneralChat(
    input: string,
    provider?: AIProviderConfig,
  ): Promise<any> {
    const prompt = `用户说: "${input}"

请以友好的助手身份回复，使用中文，保持简洁有帮助。`;

    const aiResponse = await this.callGenericAI(prompt, provider);
    return aiResponse;
  }

  // 传统规则引擎调用（不使用AI）
  private async callGenericAI(
    prompt: string,
    providerConfig?: AIProviderConfig,
  ): Promise<string> {
    // 模拟处理延迟
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 总是使用增强的规则引擎响应（传统方式）
    return this.getEnhancedSimulatedResponse(
      prompt,
      providerConfig?.name || 'rule-engine',
    );
  }


  // 从文本中提取金额
  private extractAmountFromText(text: string): number {
    // 匹配数字模式，包括小数
    const amountRegex = /(\d+(?:\.\d+)?)\s*(?:元|块|块钱|rmb|人民币)?/gi;
    const matches = text.match(amountRegex);

    if (matches && matches.length > 0) {
      // 取第一个匹配的数字
      const amountStr = matches[0].replace(/[^\d.]/g, '');
      const amount = parseFloat(amountStr);

      // 检查是否合理金额（1-1000000之间）
      if (!isNaN(amount) && amount >= 1 && amount <= 1000000) {
        return amount;
      }
    }

    // 如果没有找到有效金额，根据上下文返回默认值
    if (text.includes('工资') || text.includes('收入') || text.includes('转账')) {
      return 5000; // 工资/收入类默认值
    } else if (text.includes('午餐') || text.includes('晚餐') || text.includes('早餐')) {
      return 35; // 餐饮类默认值
    } else if (text.includes('交通') || text.includes('打车') || text.includes('地铁')) {
      return 20; // 交通类默认值
    } else if (text.includes('购物') || text.includes('买') || text.includes('商品')) {
      return 200; // 购物类默认值
    }

    return 100; // 通用默认值
  }

  // 增强的模拟响应
  private getEnhancedSimulatedResponse(
    prompt: string,
    providerName: string,
  ): string {
    // 根据提示内容生成更有意义的模拟响应
    const lowerPrompt = prompt.toLowerCase();

    // 首先检查每日简报（因为其提示可能包含"财务"等词，需要优先匹配）
    if (lowerPrompt.includes('简报') || lowerPrompt.includes('每日')) {
      // 每日简报模拟
      const today = new Date();
      const season = this.getCurrentSeason();
      return `# 📊 每日简报 - ${today.toLocaleDateString('zh-CN')}

## 🌤️ 天气建议
当前是${season}，${
        season === '春季'
          ? '气温适宜，建议户外活动'
          : season === '夏季'
            ? '天气炎热，注意防暑降温'
            : season === '秋季'
              ? '天气凉爽，适合运动'
              : '天气寒冷，注意保暖'
      }。

## 💪 健康提醒
- 保持每天30分钟中等强度运动
- 注意饮食均衡，多吃蔬菜水果
- 保证7-8小时充足睡眠

## 💰 财务小贴士
今天的花费在预算内，继续保持！

## 📚 学习建议
今天可以学习一个新技能或阅读30分钟。

## 💫 励志语录
"行动是治愈恐惧的良药，而犹豫拖延将不断滋养恐惧。"`;
    } else if (
      lowerPrompt.includes('记账') ||
      lowerPrompt.includes('财务') ||
      lowerPrompt.includes('花了') ||
      lowerPrompt.includes('收入') ||
      lowerPrompt.includes('支出') ||
      lowerPrompt.includes('消费')
    ) {
      // 财务解析模拟
      const amount = this.extractAmountFromText(prompt);

      return JSON.stringify(
        {
          type: lowerPrompt.includes('花了') || lowerPrompt.includes('支出') || lowerPrompt.includes('消费') ? 'expense' : 'income',
          amount: amount,
          category: lowerPrompt.includes('午餐') || lowerPrompt.includes('晚饭') || lowerPrompt.includes('晚餐') || lowerPrompt.includes('早饭') || lowerPrompt.includes('早餐') || lowerPrompt.includes('吃饭') || lowerPrompt.includes('餐饮') || lowerPrompt.includes('餐厅') || lowerPrompt.includes('饭店') || lowerPrompt.includes('快餐')
            ? '餐饮'
            : lowerPrompt.includes('工资') || lowerPrompt.includes('薪水') || lowerPrompt.includes('收入') || lowerPrompt.includes('薪资') || lowerPrompt.includes('发工资')
              ? '工资'
              : lowerPrompt.includes('交通') || lowerPrompt.includes('打车') || lowerPrompt.includes('地铁') || lowerPrompt.includes('公交') || lowerPrompt.includes('出租车') || lowerPrompt.includes('滴滴') || lowerPrompt.includes('出行') || lowerPrompt.includes('车费')
                ? '交通'
                : lowerPrompt.includes('购物') || lowerPrompt.includes('买') || lowerPrompt.includes('商品') || lowerPrompt.includes('衣服') || lowerPrompt.includes('鞋子') || lowerPrompt.includes('网购') || lowerPrompt.includes('商场')
                  ? '购物'
                  : lowerPrompt.includes('娱乐') || lowerPrompt.includes('电影') || lowerPrompt.includes('游戏') || lowerPrompt.includes('ktv') || lowerPrompt.includes('唱歌') || lowerPrompt.includes('旅游')
                    ? '娱乐'
                    : lowerPrompt.includes('医疗') || lowerPrompt.includes('医院') || lowerPrompt.includes('药品') || lowerPrompt.includes('看病') || lowerPrompt.includes('药')
                      ? '医疗'
                      : lowerPrompt.includes('教育') || lowerPrompt.includes('学习') || lowerPrompt.includes('课程') || lowerPrompt.includes('学费') || lowerPrompt.includes('书本')
                        ? '教育'
                        : lowerPrompt.includes('住房') || lowerPrompt.includes('房租') || lowerPrompt.includes('房贷') || lowerPrompt.includes('水电') || lowerPrompt.includes('物业')
                          ? '住房'
                          : '其他',
          account: lowerPrompt.includes('支付宝')
            ? '支付宝'
            : lowerPrompt.includes('微信')
              ? '微信'
              : lowerPrompt.includes('银行卡') || lowerPrompt.includes('储蓄卡') || lowerPrompt.includes('信用卡')
                ? '银行卡'
                : '现金',
          note: lowerPrompt.includes('午餐') || lowerPrompt.includes('午饭')
            ? '午餐'
            : lowerPrompt.includes('晚餐') || lowerPrompt.includes('晚饭')
              ? '晚餐'
              : lowerPrompt.includes('早餐') || lowerPrompt.includes('早饭')
                ? '早餐'
                : lowerPrompt.includes('工资') || lowerPrompt.includes('薪水') || lowerPrompt.includes('收入')
                  ? '工资转账'
                  : lowerPrompt.includes('交通') || lowerPrompt.includes('打车') || lowerPrompt.includes('地铁') || lowerPrompt.includes('公交')
                    ? '交通费'
                    : lowerPrompt.includes('购物') || lowerPrompt.includes('买') || lowerPrompt.includes('商品')
                      ? '购物消费'
                      : lowerPrompt.includes('娱乐') || lowerPrompt.includes('电影') || lowerPrompt.includes('游戏')
                        ? '娱乐消费'
                        : lowerPrompt.includes('医疗') || lowerPrompt.includes('医院') || lowerPrompt.includes('药品')
                          ? '医疗费用'
                          : lowerPrompt.includes('教育') || lowerPrompt.includes('学习') || lowerPrompt.includes('课程')
                            ? '教育支出'
                            : lowerPrompt.includes('住房') || lowerPrompt.includes('房租') || lowerPrompt.includes('房贷')
                              ? '住房费用'
                              : '日常消费',
          date: new Date().toISOString().split('T')[0],
        },
        null,
        2,
      );
    } else if (lowerPrompt.includes('学习') || lowerPrompt.includes('摘要')) {
      // 每日简报模拟
      const today = new Date();
      const season = this.getCurrentSeason();
      return `# 📊 每日简报 - ${today.toLocaleDateString('zh-CN')}

## 🌤️ 天气建议
当前是${season}，${
        season === '春季'
          ? '气温适宜，建议户外活动'
          : season === '夏季'
            ? '天气炎热，注意防暑降温'
            : season === '秋季'
              ? '天气凉爽，适合运动'
              : '天气寒冷，注意保暖'
      }。

## 💪 健康提醒
- 保持每天30分钟中等强度运动
- 注意饮食均衡，多吃蔬菜水果
- 保证7-8小时充足睡眠

## 💰 财务小贴士
今天的花费在预算内，继续保持！

## 📚 学习建议
今天可以学习一个新技能或阅读30分钟。

## 💫 励志语录
"行动是治愈恐惧的良药，而犹豫拖延将不断滋养恐惧。"`;
    } else if (lowerPrompt.includes('学习') || lowerPrompt.includes('摘要')) {
      // 学习摘要模拟
      return `# 学习内容摘要

## 关键点
1. ${prompt.substring(0, 30)}...
2. 核心概念理解
3. 实际应用场景

## 核心概念
${prompt.substring(0, 100)}...

## 学习建议
- 复习关键概念
- 实践练习
- 拓展阅读相关材料`;
    } else if (lowerPrompt.includes('运动') || lowerPrompt.includes('推荐')) {
      // 运动推荐模拟
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? '早晨' : hour < 18 ? '下午' : '晚上';
      const season = this.getCurrentSeason();

      return `# 🏃‍♂️ 个性化运动推荐

## 当前条件
- 时间: ${timeOfDay} (${hour}点)
- 季节: ${season}

## 推荐运动
1. **${season === '夏季' ? '游泳' : season === '冬季' ? '室内健身' : '慢跑'}** (30分钟)
   - 强度: 中等
   - 注意事项: 充分热身

2. **${timeOfDay === '早晨' ? '瑜伽' : '力量训练'}** (20分钟)
   - 强度: ${timeOfDay === '早晨' ? '低' : '中'}
   - 注意事项: 保持正确姿势

3. **散步** (45分钟)
   - 强度: 低
   - 注意事项: 保持舒适步伐

## 热身建议
- 动态拉伸 5分钟
- 关节活动 3分钟

## 放松建议
- 静态拉伸 10分钟
- 深呼吸放松`;
    } else {
      // 通用聊天模拟
      return `这是来自${providerName}的响应：

我收到了您的消息："${prompt.substring(0, 50)}..."

作为一名AI助手，我可以帮助您处理财务记账、生成学习摘要、提供运动建议和每日简报等。

请告诉我您需要什么帮助！`;
    }
  }


  // 解析财务AI响应
  private parseFinanceAIResponse(aiResponse: string): any {
    try {
      // 尝试从AI响应中提取JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // 验证必需字段
        if (
          !parsed.type ||
          !parsed.amount ||
          !parsed.category ||
          !parsed.account
        ) {
          throw new Error('解析结果缺少必需字段');
        }

        // 设置默认值
        if (!parsed.date) {
          parsed.date = new Date().toISOString().split('T')[0];
        }

        return parsed;
      }
      throw new Error('未找到JSON响应');
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('AI响应解析失败，请重试或手动输入');
    }
  }

  // 获取当前季节
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return '春季';
    if (month >= 6 && month <= 8) return '夏季';
    if (month >= 9 && month <= 11) return '秋季';
    return '冬季';
  }
}

// 创建全局AI Gateway实例
const aiGateway = new AIGateway();

export default async function aiGatewayRoutes(fastify: FastifyInstance) {
  // 统一的AI接口
  fastify.post(
    '/api/ai/process',
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth(request, reply);

      const user: any = request.user;
      const aiRequest = request.body as AIRequest;

      // 验证请求
      if (!aiRequest.task || !aiRequest.input) {
        return reply.status(400).send({ error: '任务类型和输入内容不能为空' });
      }

      // 添加用户上下文
      const enhancedRequest = {
        ...aiRequest,
        context: {
          ...aiRequest.context,
          userId: user.userId,
          userEmail: user.email,
        },
      };

      const response = await aiGateway.callAI(enhancedRequest);

      // 记录使用日志（可选）
      if (response.success) {
        await prisma.aIUsageLog.create({
          data: {
            userId: user.userId,
            task: aiRequest.task,
            provider: response.provider,
            inputLength: aiRequest.input.length,
            success: true,
            latency: response.latency,
          },
        });
      }

      return response;
    },
  );

  // 获取可用的AI提供商
  fastify.get(
    '/api/ai/providers',
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth(request, reply);

      const providers = aiGateway['providers'].map((p) => ({
        name: p.name,
        enabled: p.enabled,
        priority: p.priority,
        hasApiKey: !!p.apiKey,
      }));

      return { providers };
    },
  );

  // 测试AI服务连接
  fastify.get(
    '/api/ai/test',
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth(request, reply);

      const testRequest: AIRequest = {
        task: 'general-chat',
        input: '你好，测试AI服务',
      };

      const response = await aiGateway.callAI(testRequest);
      return response;
    },
  );

  // 智能记账解析专用接口
  fastify.post(
    '/api/ai/finance/parse',
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth(request, reply);

      const user: any = request.user;
      const { text } = request.body as { text: string };

      if (!text) {
        return reply.status(400).send({ error: '记账文本不能为空' });
      }

      const aiRequest: AIRequest = {
        task: 'finance-parse',
        input: text,
        context: { userId: user.userId },
      };

      const response = await aiGateway.callAI(aiRequest);
      return response;
    },
  );

  // 每日简报生成
  fastify.get(
    '/api/ai/daily-briefing',
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth(request, reply);

      const user: any = request.user;

      // 获取用户最近的打卡数据作为上下文
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const [financeRecords, exerciseRecords, studyRecords] = await Promise.all(
        [
          prisma.financeRecord.findMany({
            where: {
              userId: user.userId,
              date: {
                gte: yesterday,
                lte: today,
              },
            },
            take: 5,
          }),
          prisma.exerciseRecord.findMany({
            where: {
              userId: user.userId,
              date: {
                gte: yesterday,
                lte: today,
              },
            },
            take: 5,
          }),
          prisma.studyRecord.findMany({
            where: {
              userId: user.userId,
              date: {
                gte: yesterday,
                lte: today,
              },
            },
            take: 5,
          }),
        ],
      );

      const aiRequest: AIRequest = {
        task: 'daily-briefing',
        input: '生成每日简报',
        context: {
          userId: user.userId,
          recentFinance: financeRecords,
          recentExercise: exerciseRecords,
          recentStudy: studyRecords,
          date: today.toISOString(),
        },
      };

      const response = await aiGateway.callAI(aiRequest);
      return response;
    },
  );

  // 学习内容摘要生成
  fastify.post(
    '/api/ai/study/summary',
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth(request, reply);

      const user: any = request.user;
      const { content, title, type } = request.body as {
        content: string;
        title?: string;
        type?: string;
      };

      if (!content) {
        return reply.status(400).send({ error: '学习内容不能为空' });
      }

      const aiRequest: AIRequest = {
        task: 'study-summary',
        input: content,
        context: {
          userId: user.userId,
          title,
          type,
        },
      };

      const response = await aiGateway.callAI(aiRequest);
      return response;
    },
  );

  // 运动推荐
  fastify.get(
    '/api/ai/exercise/recommend',
    async (request: FastifyRequest, reply: FastifyReply) => {
      await requireAuth(request, reply);

      const user: any = request.user;
      const query = request.query as {
        intensity?: string;
        duration?: string;
        location?: string;
      };

      // 获取用户历史运动记录
      const recentExercise = await prisma.exerciseRecord.findMany({
        where: { userId: user.userId },
        orderBy: { date: 'desc' },
        take: 10,
      });

      const aiRequest: AIRequest = {
        task: 'exercise-recommend',
        input: '生成运动推荐',
        context: {
          userId: user.userId,
          preferences: query,
          recentExercise,
          currentTime: new Date().toISOString(),
        },
      };

      const response = await aiGateway.callAI(aiRequest);
      return response;
    },
  );
}
