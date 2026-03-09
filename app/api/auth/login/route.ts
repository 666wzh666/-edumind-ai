import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 从Redis取出之前存的验证码
    const storedCode = await redis.get(`sms:code:${phone}`);
    
    if (!storedCode) {
      return NextResponse.json(
        { success: false, message: '验证码已过期，请重新获取' },
        { status: 400 }
      );
    }

    if (storedCode !== code) {
      return NextResponse.json(
        { success: false, message: '验证码错误' },
        { status: 400 }
      );
    }

    // 验证码用过后立即删除，防止重复使用
    await redis.del(`sms:code:${phone}`);

    // 查找用户，如果没找到就自动注册
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`,  // 取手机号后四位当昵称
          studyDays: 0,
          totalHours: 0
        }
      });
    }

    // 生成一个令牌（相当于登录通行证）
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          studyDays: user.studyDays,
          totalHours: user.totalHours
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}