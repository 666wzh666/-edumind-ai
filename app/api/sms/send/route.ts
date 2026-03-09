import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    // 验证手机号格式（必须是11位手机号）
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 检查是否60秒内重复发送
    // 防刷检查
// const lastSent = await redis.get(`sms:last:${phone}`);
// if (lastSent) {
//   const ttl = await redis.ttl(`sms:last:${phone}`);
//   return NextResponse.json(
//     { success: false, message: `请${ttl}秒后再试` },
//     { status: 429 }
//   );
// }

    // 生成6位随机验证码
    const code = randomInt(100000, 999999).toString();

    // 在控制台打印验证码（模拟发送）
    console.log(`[模拟] 发送验证码 ${code} 到手机 ${phone}`);

    // 把验证码存到Redis，5分钟后过期
    await redis.setex(`sms:code:${phone}`, 300, code);
    // 记录发送时间，60秒内不能重复
    await redis.setex(`sms:last:${phone}`, 60, Date.now());

    return NextResponse.json({ 
      success: true, 
      message: '验证码发送成功',
      debug: { code }  // 开发环境返回验证码，方便测试
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}