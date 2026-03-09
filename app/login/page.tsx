'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { MobileOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [countdown, setCountdown] = useState(0);  // 倒计时
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  // 发送验证码
  const sendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        message.error('请输入正确的手机号');
        return;
      }

      setLoading(true);
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      const data = await res.json();
      if (data.success) {
        message.success('验证码发送成功');
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        if (data.debug?.code) {
          message.info(`验证码：${data.debug.code}`);
        }
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error('发送失败');
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: values.phone, code: values.code })
      });

      const data = await res.json();
      if (data.success) {
        // 把令牌和用户信息存到浏览器里
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        message.success('登录成功！');
        router.push('/dashboard');
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>EduMind AI</Title>
          <Text type="secondary">手机号登录 · 开启智能学习</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="手机号" size="large" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input prefix={<LockOutlined />} placeholder="验证码" size="large" style={{ borderRadius: 8, flex: 1 }} maxLength={6} />
              <Button onClick={sendCode} disabled={countdown > 0} size="large" style={{ minWidth: 100, borderRadius: 8 }}>
                {countdown > 0 ? `${countdown}秒` : '获取'}
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" loading={loading} block style={{ borderRadius: 8, height: 48 }}>
              登录 / 注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>点击登录即表示同意《用户协议》</Text>
        </div>
      </Card>
    </div>
  );
}