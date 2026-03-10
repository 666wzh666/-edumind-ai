export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
//import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // 从请求头中取出令牌
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未认证' },
        { status: 401 }
      );
    }

    // 验证令牌，取出用户ID
    const decoded = (jwt as any).verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { success: false, message: '请输入问题' },
        { status: 400 }
      );
    }

    // 模拟AI回答（以后可以换成真AI）
    const answer = `关于"${question}"的问题，这是一个模拟回答。等你接入真正的AI（比如通义千问），这里就会有聪明回答了！`;

    // 把提问和回答记录到数据库
   // await prisma.interaction.create({
      //data: {
      //  userId,
    //    question,
    //    answer
   //   }
   // });

    // 给用户增加0.1小时学习时长
   // await prisma.user.update({
     // where: { id: userId },
     // data: {
    //    totalHours: { increment: 0.1 }
  //    }
   // });

    return NextResponse.json({
      success: true,
      data: {
        answer,
        suggestions: ['什么是导数？', '如何求极限？', '微积分应用']
      }
    });
  } catch (error) {
    console.error('AI聊天错误:', error);
    return NextResponse.json(
      { success: false, message: 'AI服务暂时不可用' },
      { status: 500 }
    );
  }
}