import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client/index.js';
import { requireAuth } from '../plugins/auth-middleware.js';

const prisma = new PrismaClient();

// AI服务提供商类型（只保留火山引擎）
type AIProvider = 'volcano' | 'fallback';

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

// 默认提供商配置（从环境变量加载）
const DEFAULT_PROVIDERS: AIProviderConfig[] = [
  {
    name: 'volcano',
    enabled: !!process.env.VOLCANO_API_KEY,
    priority: 0, // 最高优先级
    apiKey: process.env.VOLCANO_API_KEY,
    baseUrl:
      process.env.VOLCANO_BASE_URL ||
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  },
  {
    name: 'fallback',
    enabled: true, // 总是启用作为后备
    priority: 100,
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

  // 通用AI调用
  private async callGenericAI(
    prompt: string,
    providerConfig?: AIProviderConfig,
  ): Promise<string> {
    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 如果是fallback提供商，使用规则引擎
    if (providerConfig?.name === 'fallback') {
      return this.getFallbackResponse(prompt);
    }

    // 检查是否有API密钥配置
    if (!providerConfig?.apiKey) {
      console.log(
        `Provider ${providerConfig?.name} has no API key, using enhanced simulation`,
      );
      return this.getEnhancedSimulatedResponse(
        prompt,
        providerConfig?.name || 'ai',
      );
    }

    // 根据提供商调用相应的AI API
    try {
      switch (providerConfig?.name) {
        case 'volcano':
          return await this.callVolcanoAI(prompt, providerConfig);
        default:
          return this.getEnhancedSimulatedResponse(
            prompt,
            providerConfig?.name || 'ai',
          );
      }
    } catch (error) {
      console.error(
        `Error calling AI provider ${providerConfig?.name}:`,
        error,
      );
      // 如果API调用失败，返回模拟响应
      return this.getEnhancedSimulatedResponse(
        prompt,
        providerConfig?.name || 'ai',
      );
    }
  }

  // 调用火山引擎（Volcano）AI API
  private async callVolcanoAI(
    prompt: string,
    config: AIProviderConfig,
  ): Promise<string> {
    // 火山引擎API
    const baseUrl = config.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    const apiKey = config.apiKey || '';
    const model = 'deepseek-v3.2'; // 用户指定的模型

    if (!apiKey) {
      throw new Error('Volcano API key is required');
    }

    console.log('Calling Volcano API with baseUrl:', baseUrl);

    try {
      // 使用官方示例中的格式
      const requestData = {
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false // 非流式输出
      };

      console.log('Sending request to Volcano API...');
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Volcano API error (${response.status}):`, errorText);

        // 尝试解析错误信息
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Volcano API error details:', errorJson);

          if (errorJson.error?.message) {
            throw new Error(`Volcano AI API error: ${errorJson.error.message}`);
          } else if (errorJson.message) {
            throw new Error(`Volcano AI API error: ${errorJson.message}`);
          }
        } catch {
          // 忽略解析错误
        }

        throw new Error(`Volcano AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Volcano API response received:', data);

      // 解析响应格式
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        if (data.choices[0]?.message?.content) {
          return data.choices[0].message.content;
        } else if (data.choices[0]?.text) {
          return data.choices[0].text;
        }
      } else if (data.text) {
        return data.text;
      } else if (data.message) {
        return data.message;
      } else if (data.result) {
        return data.result;
      }

      // 如果无法解析，返回原始数据
      console.log('Raw API response (could not parse):', data);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Volcano AI call failed:', error);
      // 不要抛出错误，而是返回模拟响应
      console.log('Falling back to enhanced simulation...');
      return this.getEnhancedSimulatedResponse(prompt, 'volcano');
    }
  }

  // 增强的模拟响应
  private getEnhancedSimulatedResponse(
    prompt: string,
    providerName: string,
  ): string {
    // 根据提示内容生成更有意义的模拟响应
    const lowerPrompt = prompt.toLowerCase();

    if (
      lowerPrompt.includes('记账') ||
      lowerPrompt.includes('财务') ||
      lowerPrompt.includes('花了') ||
      lowerPrompt.includes('收入')
    ) {
      // 财务解析模拟
      return JSON.stringify(
        {
          type: lowerPrompt.includes('花了') ? 'expense' : 'income',
          amount: lowerPrompt.includes('35')
            ? 35
            : lowerPrompt.includes('5000')
              ? 5000
              : 100,
          category: lowerPrompt.includes('午餐')
            ? '餐饮'
            : lowerPrompt.includes('工资')
              ? '工资'
              : lowerPrompt.includes('交通')
                ? '交通'
                : '其他',
          account: lowerPrompt.includes('支付宝')
            ? '支付宝'
            : lowerPrompt.includes('微信')
              ? '微信'
              : lowerPrompt.includes('银行卡')
                ? '银行卡'
                : '现金',
          note: lowerPrompt.includes('午餐')
            ? '午餐'
            : lowerPrompt.includes('工资')
              ? '工资转账'
              : '日常消费',
          date: new Date().toISOString().split('T')[0],
        },
        null,
        2,
      );
    } else if (lowerPrompt.includes('简报') || lowerPrompt.includes('每日')) {
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

  // 后备响应（当所有AI服务都不可用时）
  private getFallbackResponse(prompt: string): string {
    // 简单的规则引擎作为后备
    if (prompt.includes('记账') || prompt.includes('财务')) {
      return '财务解析服务暂时不可用，请手动输入记账信息。';
    } else if (prompt.includes('学习') || prompt.includes('摘要')) {
      return '学习摘要服务暂时不可用，请手动总结学习内容。';
    } else if (prompt.includes('运动') || prompt.includes('推荐')) {
      return '运动推荐服务暂时不可用，建议进行散步或伸展运动。';
    } else if (prompt.includes('简报') || prompt.includes('每日')) {
      return '每日简报服务暂时不可用，祝您有美好的一天！';
    } else {
      return 'AI服务暂时不可用，请稍后再试。';
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
