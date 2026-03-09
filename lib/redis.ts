// 模拟 Redis 客户端（不需要真的安装 Redis）
class MockRedis {
  private store: Map<string, { value: string, expire: number }> = new Map();

  async get(key: string) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expire < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async setex(key: string, seconds: number, value: string) {
    this.store.set(key, {
      value,
      expire: Date.now() + seconds * 1000
    });
    console.log(`[模拟Redis] 存储: ${key} = ${value}`);
    return 'OK';
  }

  async del(key: string) {
    this.store.delete(key);
    return 1;
  }

  async ttl(key: string) {
    const item = this.store.get(key);
    if (!item) return -2;
    const ttl = Math.floor((item.expire - Date.now()) / 1000);
    return ttl > 0 ? ttl : -2;
  }

  on(event: string, callback: Function) {}
}

export const redis = new MockRedis() as any;