'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layout, Menu, Avatar, Card, Row, Col, Statistic, 
  Input, Button, message, Space, Typography, Progress,
  List, Tabs, Tooltip, Badge
} from 'antd';
import { 
  UserOutlined, RobotOutlined, LogoutOutlined,
  BookOutlined, ClockCircleOutlined, FireOutlined,
  SendOutlined, ShareAltOutlined, LineChartOutlined,
  TeamOutlined, TrophyOutlined,MessageOutlined
} from '@ant-design/icons';

import { Line, Pie } from '@ant-design/plots';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const router = useRouter();
  // 用户统计数据（学习天数、时长、积分等）
const [userStats, setUserStats] = useState(() => {
 const saved = typeof window !== 'undefined' ? localStorage.getItem('user_stats') : null;
  return saved ? JSON.parse(saved) : {
    studyDays: 16,        // 连续打卡
    totalHours: 7.2,      // 学习时长
    completedCourses: 8,  // 完成课程
    points: 1250,         // 积分
  };
});

// 当统计数据变化时自动保存到本地存储
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_stats', JSON.stringify(userStats));
  }
}, [userStats]);
// 处理点击“开始学习”
const handleStartLearning = (courseName: string) => {

  // 更新统计：学习天数+1，积分+10，学习时长+0.5小时
  setUserStats((prev: typeof userStats) => ({
  ...prev,
  studyDays: prev.studyDays + 1,
  points: prev.points + 10,
  totalHours: prev.totalHours + 0.5,
}));

  message.success(`继续学习《${courseName}》，进度已更新！`);
};

// 处理AI提问
const askAI = async () => {
  if (!question.trim()) {
    message.warning('请输入问题');
    return;
  }

  setLoading(true);
  try {
   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
if (!token) {
  message.error('请先登录');
  return;

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question })
    });

    const data = await res.json();
    if (data.success) {
      setAnswer(data.data.answer);
      // 提问成功，增加学习时长和积分
      setUserStats((prev: typeof userStats) => ({
  ...prev,
  totalHours: prev.totalHours + 0.1,
  points: prev.points + 5,
}));
      message.success('回答完成');
    } else {
      message.error(data.message);
    }
  } catch (error) {
    message.error('提问失败');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
// 折线图工具
const LineChart = () => {
  const data = [
    { day: '周一', hours: 2.5 },
    { day: '周二', hours: 3.0 },
    { day: '周三', hours: 1.8 },
    { day: '周四', hours: 4.2 },
    { day: '周五', hours: 2.2 },
    { day: '周六', hours: 5.0 },
    { day: '周日', hours: 3.5 },
  ];
  const config = {
    data,
    xField: 'day',
    yField: 'hours',
    point: { size: 5, shape: 'circle' },
    label: { style: { fill: '#aaa' } },
  };
  return <Line {...config} />;
};

// 饼图工具
const PieChart = () => {
  const data = [
    { type: '已掌握', value: 27 },
    { type: '学习中', value: 45 },
    { type: '未开始', value: 28 },
  ];
  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    label: { type: 'inner', offset: '-30%', content: '{percentage}' },
    interactions: [{ type: 'element-active' }],
  };
  return <Pie {...config} />;
};

  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  // 知识图谱数据
  const knowledgeNodes = [
    { name: '函数', progress: 85, status: 'mastered' },
    { name: '极限', progress: 70, status: 'learning' },
    { name: '导数', progress: 45, status: 'learning' },
    { name: '微分', progress: 30, status: 'started' },
    { name: '积分', progress: 10, status: 'started' },
    { name: '微分方程', progress: 5, status: 'locked' },
  ];

  // 学习统计数据
  const studyStats = [
    { label: '今日学习', value: '2.5小时', icon: <ClockCircleOutlined />, color: '#1890ff' },
    { label: '连续打卡', value: '16天', icon: <FireOutlined />, color: '#fa541c' },
    { label: '完成课程', value: '8门', icon: <BookOutlined />, color: '#52c41a' },
    { label: '获得积分', value: '1250分', icon: <TrophyOutlined />, color: '#faad14' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 左边菜单栏 */}
      <Sider theme="light" width={250} style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.05)', padding: '16px 0' }}>
        <div style={{ padding: '16px 24px', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>EduMind AI</Title>
          <Text type="secondary">智慧教育平台</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => setActiveTab(key)}
          items={[
            { key: '1', icon: <BookOutlined />, label: '学习中心' },
            { key: '2', icon: <RobotOutlined />, label: 'AI助手' },
            { key: '3', icon: <ShareAltOutlined />, label: '知识图谱' },
            { key: '4', icon: <LineChartOutlined />, label: '学习报告' },
            { key: '5', icon: <UserOutlined />, label: '个人中心' },
          ]}
        />
        {/* 学习目标卡片 */}
<Card size="small" style={{ margin: '16px 8px', borderRadius: 12 }}>
  <Statistic 
    title="本周学习目标" 
    value="10小时" 
    valueStyle={{ fontSize: 24, color: '#1890ff' }}
  />
  <Progress 
    percent={Math.min((userStats?.totalHours || 0) / 10 * 100, 100)} 
    size="small" 
    status="active"
  />
  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
    已完成 {(userStats?.totalHours || 0).toFixed(1)} 小时
  </Text>
</Card>
      </Sider>

      {/* 右边主要内容 */}
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>欢迎回来，{user.nickname}</Title>
            <Badge count="新" style={{ backgroundColor: '#52c41a' }}>
              <Avatar icon={<UserOutlined />} />
            </Badge>
          </Space>
          <Space>
            <Button icon={<TeamOutlined />} type="text" onClick={() => message.info('在线同学: 128人')}>学习社区</Button>
            <Button icon={<LogoutOutlined />} onClick={handleLogout} type="text" danger>退出</Button>
          </Space>
        </Header>

        <Content style={{ padding: 24, background: '#f5f5f5', overflow: 'auto' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }}>
            {/* 学习中心 */}
            <TabPane tab="学习中心" key="1">
              <Row gutter={[24, 24]}>
                {studyStats.map((stat, index) => (
                  <Col xs={24} sm={12} md={6} key={index}>
                    <Card hoverable>
                      <Statistic title={stat.label} value={stat.value} prefix={stat.icon} valueStyle={{ color: stat.color }} />
                    </Card>
                  </Col>
                ))}
                <Col span={24}>
                  <Card title="个性化推荐课程" extra={<Button type="link">查看更多</Button>} style={{ borderRadius: 12 }}>
                    <List
                      dataSource={[
                        { title: '导数的应用', desc: '极值、凹凸性', progress: 35, time: '2h', difficulty: '中等' },
                        { title: '不定积分入门', desc: '基本积分公式', progress: 12, time: '1.5h', difficulty: '简单' },
                        { title: '机器学习基础', desc: '线性回归', progress: 0, time: '3h', difficulty: '困难' },
                      ]}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Tooltip title={`难度：${item.difficulty}`}>
                              <Button type="link">开始学习</Button>
                            </Tooltip>
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                {item.title}
                                <Badge count={item.difficulty} style={{ backgroundColor: item.difficulty === '简单' ? '#52c41a' : item.difficulty === '中等' ? '#faad14' : '#f5222d' }} />
                              </Space>
                            }
                            description={item.desc}
                          />
                          <div style={{ width: 200 }}>
                            <Progress percent={item.progress} size="small" />
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            {/* AI助手 */}
            <TabPane tab="AI助手" key="2">
              <Card title={<Space><RobotOutlined style={{ color: '#1890ff' }} /><span>AI助教 · 小思</span></Space>} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input size="large" placeholder="输入你的问题..." value={question} onChange={(e) => setQuestion(e.target.value)} onPressEnter={askAI} />
                    <Button type="primary" size="large" icon={<SendOutlined />} onClick={askAI} loading={loading}>提问</Button>
                  </Space.Compact>
                  {answer && <Card type="inner" style={{ background: '#fafafa' }}><Text>{answer}</Text></Card>}
                  <div>
                    <Text strong>常见问题：</Text>
                    <Space wrap style={{ marginTop: 8 }}>
                      {['什么是导数？', '如何求极限？', '积分公式有哪些？'].map(q => (
                        <Button key={q} size="small" onClick={() => { setQuestion(q); setTimeout(() => askAI(), 100); }}>{q}</Button>
                      ))}
                    </Space>
                  </div>
                </Space>
              </Card>
            </TabPane>

            {/* 知识图谱 */}
            <TabPane tab="知识图谱" key="3">
              <Card title={<Space><ShareAltOutlined style={{ color: '#722ed1' }} /><span>微积分知识图谱</span></Space>} style={{ borderRadius: 12 }}>
               <Row gutter={[24, 24]}>
  <Col xs={24} sm={12} md={6}>
    <Card hoverable>
      <Statistic
        title="今日学习"
        value={`${userStats.totalHours.toFixed(1)}小时`}
        prefix={<ClockCircleOutlined />}
        valueStyle={{ color: '#1890ff' }}
      />
    </Card>
  </Col>
  <Col xs={24} sm={12} md={6}>
    <Card hoverable>
      <Statistic
        title="连续打卡"
        value={`${userStats.studyDays}天`}
        prefix={<FireOutlined />}
        valueStyle={{ color: '#fa541c' }}
      />
    </Card>
  </Col>
  <Col xs={24} sm={12} md={6}>
    <Card hoverable>
      <Statistic
        title="完成课程"
        value={`${userStats.completedCourses}门`}
        prefix={<BookOutlined />}
        valueStyle={{ color: '#52c41a' }}
      />
    </Card>
  </Col>
  <Col xs={24} sm={12} md={6}>
    <Card hoverable>
      <Statistic
        title="获得积分"
        value={`${userStats.points}分`}
        prefix={<TrophyOutlined />}
        valueStyle={{ color: '#faad14' }}
      />
    </Card>
  </Col>
</Row>
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Text type="secondary">已掌握 1/6 核心概念 · 推荐学习：微分</Text>
                </div>
              </Card>
            </TabPane>

            {/* 学习报告 */}
    <TabPane tab="学习报告" key="4">
  <Row gutter={[24, 24]}>
    <Col span={24}>
      <Card title="近7天学习时长" style={{ borderRadius: 12 }}>
        <div style={{ height: 300 }}>
          <LineChart />
        </div>
      </Card>
    </Col>
    <Col span={12}>
      <Card title="知识点掌握分布" style={{ borderRadius: 12 }}>
        <PieChart />
      </Card>
    </Col>
   <Col span={12}>
  <Card title="学习建议" style={{ borderRadius: 12 }}>
    <List
      dataSource={[
        '加强微分练习，完成进度30%',
        '复习导数概念，巩固基础',
        '尝试完成积分入门课程',
        '本周目标：完成3个章节'
      ]}
      renderItem={(item) => <List.Item>• {item}</List.Item>}
    />
  </Card>
</Col>
  </Row>
            </TabPane>
            <TabPane tab="个人中心" key="5">
  <Card style={{ borderRadius: 12 }}>
    <Row gutter={[24, 24]}>
      <Col span={24} style={{ textAlign: 'center' }}>
        <Avatar size={80} icon={<UserOutlined />} />
        <Title level={3} style={{ marginTop: 16 }}>{user?.nickname}</Title>
        <Text type="secondary">手机号：{user?.phone}</Text>
      </Col>
      <Col span={24}>
        <List>
          <List.Item>注册时间：2024-01-01</List.Item>
          <List.Item>累计学习：{user?.totalHours?.toFixed(1) || 0}小时</List.Item>
          <List.Item>完成课程：8门</List.Item>
          <List.Item>获得证书：2张</List.Item>
        </List>
      </Col>
    </Row>
    <div style={{ marginTop: 24, textAlign: 'center' }}>
      <Button 
        type="primary" 
        ghost 
        icon={<MessageOutlined />}
        onClick={() => message.info('感谢反馈！我们会尽快处理。')}
      >
        意见反馈
      </Button>
    </div>
  </Card>
</TabPane>
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
}