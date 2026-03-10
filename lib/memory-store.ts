type User = {
  id: string;
  phone: string;
  nickname: string;
  studyDays: number;
  totalHours: number;
};

type CodeEntry = {
  code: string;
  expire: number;
};

class MemoryStore {
  private users: Map<string, User> = new Map();
  private codes: Map<string, CodeEntry> = new Map();

  findUserByPhone(phone: string): User | undefined {
    return this.users.get(phone);
  }

  createUser(phone: string): User {
    const user: User = {
      id: `user_${Date.now()}_${Math.random()}`,
      phone,
      nickname: `用户${phone.slice(-4)}`,
      studyDays: 0,
      totalHours: 0,
    };
    this.users.set(phone, user);
    return user;
  }

  setCode(phone: string, code: string, ttlSeconds: number) {
    this.codes.set(phone, { code, expire: Date.now() + ttlSeconds * 1000 });
  }

  getCode(phone: string): string | null {
    const entry = this.codes.get(phone);
    if (!entry) return null;
    if (entry.expire < Date.now()) {
      this.codes.delete(phone);
      return null;
    }
    return entry.code;
  }

  deleteCode(phone: string) {
    this.codes.delete(phone);
  }

  canSend(phone: string): boolean {
    const key = `last_sent_${phone}`;
    const entry = this.codes.get(key);
    if (!entry) return true;
    if (entry.expire < Date.now()) {
      this.codes.delete(key);
      return true;
    }
    return false;
  }

  markSent(phone: string, ttlSeconds: number) {
    const key = `last_sent_${phone}`;
    this.codes.set(key, { code: 'sent', expire: Date.now() + ttlSeconds * 1000 });
  }
}

export const memoryStore = new MemoryStore();