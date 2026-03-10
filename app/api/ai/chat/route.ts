export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';

// 初始化OpenAI客户端（指向通义千问/百炼）
const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY || '',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未认证' },
        { status: 401 }
      );
    }

    const decoded = (jwt as any).verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { success: false, message: '请输入问题' },
        { status: 400 }
      );
    }

    // 检查是否配置了API Key
    if (!process.env.DASHSCOPE_API_KEY) {
      console.warn('未配置DASHSCOPE_API_KEY，使用模拟回答');
      return NextResponse.json({
        success: true,
        data: {
          answer: `关于"${question}"的问题，这是一个模拟回答。请在Netlify环境变量中配置DASHSCOPE_API_KEY。`,
          suggestions: ['什么是导数？', '如何求极限？', '微积分应用']
        }
      });
    }

    // 调用通义千问API
    const completion = await openai.chat.completions.create({
      model: 'qwen-turbo', // 免费额度适用
      messages: [
        {
          role: 'system',
          content: '你是一位专业的AI助教，擅长解答数学、编程、物理等学科问题。请用中文回答，语言要清晰易懂。'
        },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = completion.choices[0]?.message?.content || '抱歉，我无法回答这个问题。';

    return NextResponse.json({
      success: true,
      data: {
        answer,
        suggestions: ['什么是导数？', '如何求极限？', '微积分应用']
      }
    });

  } catch (error: any) {
    console.error('AI聊天错误:', error);
    
    // 错误处理：如果API调用失败，回退到模拟回答
    const { question } = await request.json().catch(() => ({ question: '' }));
    
    return NextResponse.json({
      success: true,
      data: {
        answer: `关于"${question}"的问题，AI服务暂时不可用。这是一个模拟回答。`,
        suggestions: ['什么是导数？', '如何求极限？', '微积分应用']
      }
    });
  }
}