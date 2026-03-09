import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 需要登录才能访问的API
const protectedPaths = [
  '/api/user',
  '/api/learning',
  '/api/ai/chat'
];

// 公开的API（不需要登录）
const publicPaths = [
  '/api/auth/login',
  '/api/sms/send',
  '/'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 如果是公开路径，直接放行
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 如果需要登录
  const needsAuth = protectedPaths.some(path => pathname.startsWith(path));
  
  if (needsAuth) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未认证' },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { success: false, message: '令牌无效或已过期' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// 只对 /api 开头的路径生效
export const config = {
  matcher: '/api/:path*',
};