// Mock база данных для демонстрации
// В реальном приложении здесь будет подключение к PostgreSQL, MongoDB и т.д.

export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

class MockDatabase implements DatabaseConnection {
  private connected = false;

  async connect(): Promise<void> {
    console.log('Connecting to mock database...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Имитация задержки
    this.connected = true;
    console.log('Connected to mock database');
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting from mock database...');
    await new Promise(resolve => setTimeout(resolve, 50));
    this.connected = false;
    console.log('Disconnected from mock database');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Mock методы для работы с данными
  async findUser(id: string) {
    if (!this.connected) throw new Error('Database not connected');
    // Имитация запроса к базе данных
    await new Promise(resolve => setTimeout(resolve, 10));
    return { id, name: `User ${id}` };
  }

  async createUser(userData: any) {
    if (!this.connected) throw new Error('Database not connected');
    await new Promise(resolve => setTimeout(resolve, 20));
    return { id: Date.now().toString(), ...userData };
  }

  async updateUser(id: string, userData: any) {
    if (!this.connected) throw new Error('Database not connected');
    await new Promise(resolve => setTimeout(resolve, 15));
    return { id, ...userData };
  }

  async deleteUser(id: string) {
    if (!this.connected) throw new Error('Database not connected');
    await new Promise(resolve => setTimeout(resolve, 10));
    return { success: true };
  }
}

// Singleton instance
export const db = new MockDatabase();

// Функции для инициализации и закрытия соединения
export async function initializeDatabase() {
  try {
    await db.connect();
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

export async function closeDatabase() {
  try {
    await db.disconnect();
    return true;
  } catch (error) {
    console.error('Failed to close database:', error);
    return false;
  }
}

// Утилиты для работы с транзакциями (mock)
export async function withTransaction<T>(callback: () => Promise<T>): Promise<T> {
  console.log('Starting transaction...');
  try {
    const result = await callback();
    console.log('Transaction committed');
    return result;
  } catch (error) {
    console.log('Transaction rolled back');
    throw error;
  }
}

// Утилиты для миграций (mock)
export async function runMigrations() {
  console.log('Running database migrations...');
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('Migrations completed');
}

// Утилиты для seed данных (mock)
export async function seedDatabase() {
  console.log('Seeding database with initial data...');
  await new Promise(resolve => setTimeout(resolve, 200));
  console.log('Database seeded successfully');
}