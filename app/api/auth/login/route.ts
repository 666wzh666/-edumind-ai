import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memory-store';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '手机号格式不正确' },
        { status: 400 }
      );
    }

    const storedCode = memoryStore.getCode(phone);
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

    memoryStore.deleteCode(phone);

    let user = memoryStore.findUserByPhone(phone);
    if (!user) {
      user = memoryStore.createUser(phone);
    }

    const token = (jwt as any).sign(
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
          totalHours: user.totalHours,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}