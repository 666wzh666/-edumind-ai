import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memory-store';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '手机号格式不正确' },
        { status: 400 }
      );
    }

    if (!memoryStore.canSend(phone)) {
      return NextResponse.json(
        { success: false, message: '请稍后再试' },
        { status: 429 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    memoryStore.setCode(phone, code, 300); // 5分钟有效
    memoryStore.markSent(phone, 60);       // 60秒内不能重复发送

    console.log(`[验证码] ${phone} 的验证码是: ${code}`);

    return NextResponse.json({
      success: true,
      message: '验证码发送成功',
      debug: { code },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}