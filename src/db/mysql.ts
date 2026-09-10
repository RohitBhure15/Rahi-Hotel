import mysql, { Pool, PoolOptions } from 'mysql2/promise';

export interface DbConfig {
  host?: string;
  port: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: any;
}

export interface ConnectionStatus {
  connected: boolean;
  configured: boolean;
  message: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  latencyMs?: number;
  tablesCount?: number;
  version?: string;
}

let pool: Pool | null = null;
let lastStatus: ConnectionStatus = {
  connected: false,
  configured: false,
  message: 'Database not initialized',
};

export function getDbConfig(): DbConfig {
  return {
    host: process.env.MYSQL_HOST?.trim() || undefined,
    port: parseInt(process.env.MYSQL_PORT?.trim() || '3306', 10),
    user: process.env.MYSQL_USER?.trim() || undefined,
    password: process.env.MYSQL_PASSWORD || undefined,
    database: process.env.MYSQL_DATABASE?.trim() || undefined,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

export function isDbConfigured(): boolean {
  const config = getDbConfig();
  return Boolean(config.host && config.user && config.database);
}

export function getMysqlPool(): Pool | null {
  if (pool) return pool;

  const config = getDbConfig();
  if (!config.host || !config.user || !config.database) {
    return null;
  }

  const poolOptions: PoolOptions = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 8000,
  };

  pool = mysql.createPool(poolOptions);
  return pool;
}

export async function testDbConnection(): Promise<ConnectionStatus> {
  const config = getDbConfig();
  if (!config.host || !config.user || !config.database) {
    lastStatus = {
      connected: false,
      configured: false,
      message: 'MySQL environment variables (MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE) not configured',
      host: config.host || 'Not set',
      database: config.database || 'Not set',
      user: config.user || 'Not set',
    };
    return lastStatus;
  }

  const start = Date.now();
  try {
    const p = getMysqlPool();
    if (!p) throw new Error('Could not create connection pool');

    const [rows]: any = await p.query('SELECT VERSION() as version, DATABASE() as db');
    const latency = Date.now() - start;

    const [tables]: any = await p.query('SHOW TABLES');

    lastStatus = {
      connected: true,
      configured: true,
      message: 'Successfully connected to MySQL database',
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      latencyMs: latency,
      tablesCount: Array.isArray(tables) ? tables.length : 0,
      version: rows[0]?.version || 'Unknown',
    };
    return lastStatus;
  } catch (err: any) {
    lastStatus = {
      connected: false,
      configured: true,
      message: err.message || 'Connection failed',
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    };
    return lastStatus;
  }
}

export async function initMysqlSchema(): Promise<{ success: boolean; tablesCreated: string[]; error?: string }> {
  const p = getMysqlPool();
  if (!p) {
    return { success: false, tablesCreated: [], error: 'MySQL is not configured' };
  }

  const tablesCreated: string[] = [];

  try {
    // 1. Staff Members Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS staff_members (
        id VARCHAR(64) PRIMARY KEY,
        employee_id VARCHAR(64) UNIQUE NOT NULL,
        full_name VARCHAR(128) NOT NULL,
        email VARCHAR(128) NOT NULL,
        phone VARCHAR(64) NOT NULL,
        role VARCHAR(64) NOT NULL,
        department VARCHAR(128) NOT NULL,
        shift VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
        hotel_id VARCHAR(64) NOT NULL DEFAULT 'HOTEL001',
        created_by VARCHAR(64) DEFAULT 'SYSTEM',
        created_at VARCHAR(64) NOT NULL,
        last_login VARCHAR(64) DEFAULT 'Never',
        first_login BOOLEAN DEFAULT FALSE,
        password VARCHAR(128) NOT NULL,
        assigned_tasks INT DEFAULT 0,
        rating DECIMAL(3, 1) DEFAULT 5.0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('staff_members');

    // 2. Rooms Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(64) PRIMARY KEY,
        room_number VARCHAR(32) UNIQUE NOT NULL,
        name VARCHAR(128) NOT NULL,
        category VARCHAR(64) NOT NULL,
        price INT NOT NULL,
        max_guests INT NOT NULL DEFAULT 2,
        status VARCHAR(32) NOT NULL DEFAULT 'Available',
        floor INT NOT NULL DEFAULT 1,
        rating DECIMAL(3, 1) DEFAULT 4.8,
        amenities JSON,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('rooms');

    // 3. Bookings Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(64) PRIMARY KEY,
        confirmation_code VARCHAR(32) UNIQUE NOT NULL,
        guest_name VARCHAR(128) NOT NULL,
        guest_email VARCHAR(128) NOT NULL,
        guest_phone VARCHAR(64) NOT NULL,
        room_number VARCHAR(32) NOT NULL,
        room_type VARCHAR(64) NOT NULL,
        check_in VARCHAR(64) NOT NULL,
        check_out VARCHAR(64) NOT NULL,
        total_amount INT NOT NULL,
        payment_status VARCHAR(32) NOT NULL DEFAULT 'Paid',
        status VARCHAR(32) NOT NULL DEFAULT 'Confirmed',
        created_at VARCHAR(64) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('bookings');

    // 4. Complaints Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(64) PRIMARY KEY,
        hotel_id VARCHAR(64) NOT NULL DEFAULT 'HOTEL001',
        room_number VARCHAR(32) NOT NULL,
        guest_name VARCHAR(128) NOT NULL,
        guest_phone VARCHAR(64),
        category VARCHAR(64) NOT NULL,
        title VARCHAR(128),
        description TEXT NOT NULL,
        priority VARCHAR(32) NOT NULL DEFAULT 'Medium',
        status VARCHAR(32) NOT NULL DEFAULT 'Pending',
        assigned_to VARCHAR(128),
        image_url TEXT,
        resolution_note TEXT,
        created_at VARCHAR(64) NOT NULL,
        updated_at VARCHAR(64)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('complaints');

    // 5. Food Orders Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS food_orders (
        id VARCHAR(64) PRIMARY KEY,
        hotel_id VARCHAR(64) NOT NULL DEFAULT 'HOTEL001',
        order_location VARCHAR(64) DEFAULT 'Room Service',
        room_or_table VARCHAR(64) NOT NULL,
        guest_name VARCHAR(128) NOT NULL,
        items JSON NOT NULL,
        total_amount INT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'New',
        assigned_waiter VARCHAR(128),
        special_instructions TEXT,
        created_at VARCHAR(64) NOT NULL,
        updated_at VARCHAR(64)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('food_orders');

    // 6. Feedback Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id VARCHAR(64) PRIMARY KEY,
        hotel_id VARCHAR(64) NOT NULL DEFAULT 'HOTEL001',
        booking_id VARCHAR(64),
        order_id VARCHAR(64),
        room_number VARCHAR(32),
        customer_name VARCHAR(128) NOT NULL,
        category VARCHAR(64) DEFAULT 'Overall Experience',
        rating INT NOT NULL DEFAULT 5,
        title VARCHAR(128),
        message TEXT,
        suggestion TEXT,
        status VARCHAR(32) DEFAULT 'Active',
        created_at VARCHAR(64) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('feedback');

    // 7. Suggestions Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id VARCHAR(64) PRIMARY KEY,
        hotel_id VARCHAR(64) NOT NULL DEFAULT 'HOTEL001',
        customer_name VARCHAR(128) NOT NULL,
        customer_phone VARCHAR(64),
        category VARCHAR(64) NOT NULL,
        title VARCHAR(128) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'Pending',
        admin_notes TEXT,
        created_at VARCHAR(64) NOT NULL,
        updated_at VARCHAR(64)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('suggestions');

    // 8. Inventory Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(64) PRIMARY KEY,
        item_name VARCHAR(128) NOT NULL,
        category VARCHAR(64) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        unit VARCHAR(32) NOT NULL DEFAULT 'units',
        min_threshold INT NOT NULL DEFAULT 10,
        cost_per_unit INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('inventory');

    // 9. Audit Logs Table
    await p.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        employee_id VARCHAR(64),
        employee_name VARCHAR(128),
        role VARCHAR(64),
        action VARCHAR(64) NOT NULL,
        timestamp VARCHAR(64) NOT NULL,
        details TEXT,
        type VARCHAR(32) DEFAULT 'operation'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('audit_logs');

    // 10. Menu Items Table (Chef Menu Management)
    await p.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(64) PRIMARY KEY,
        hotel_id VARCHAR(64) NOT NULL DEFAULT 'HOTEL001',
        name VARCHAR(128) NOT NULL,
        category VARCHAR(64) NOT NULL,
        price INT NOT NULL,
        rating DECIMAL(3,1) DEFAULT 4.8,
        reviews_count INT DEFAULT 50,
        is_veg BOOLEAN DEFAULT TRUE,
        prep_time VARCHAR(32) DEFAULT '15 mins',
        description TEXT,
        image TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        is_chef_special BOOLEAN DEFAULT FALSE,
        is_recommended BOOLEAN DEFAULT FALSE,
        available_times JSON,
        spice_level VARCHAR(32) DEFAULT 'Medium',
        allergens JSON,
        ingredients JSON,
        created_at VARCHAR(64) NOT NULL,
        updated_at VARCHAR(64)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tablesCreated.push('menu_items');

    return { success: true, tablesCreated };
  } catch (err: any) {
    console.error('[MySQL Schema Init Error]:', err);
    return { success: false, tablesCreated, error: err.message };
  }
}

export async function executeQuery(sql: string, params: any[] = []): Promise<{ rows: any[]; fields?: string[]; error?: string; affectedRows?: number; executionTimeMs: number }> {
  const start = Date.now();
  const p = getMysqlPool();
  if (!p) {
    return {
      rows: [],
      error: 'MySQL connection is not established. Please configure your MYSQL_HOST credentials in Settings / Environment variables.',
      executionTimeMs: 0,
    };
  }

  try {
    const [result, fields]: any = await p.query(sql, params);
    const executionTimeMs = Date.now() - start;

    if (Array.isArray(result)) {
      const fieldNames = fields ? fields.map((f: any) => f.name) : (result[0] ? Object.keys(result[0]) : []);
      return {
        rows: result,
        fields: fieldNames,
        executionTimeMs,
      };
    } else {
      return {
        rows: [],
        affectedRows: result?.affectedRows || 0,
        executionTimeMs,
      };
    }
  } catch (err: any) {
    return {
      rows: [],
      error: err.message,
      executionTimeMs: Date.now() - start,
    };
  }
}

export async function getTablesSummary(): Promise<{ name: string; rowCount: number; columns: any[] }[]> {
  const p = getMysqlPool();
  if (!p) return [];

  try {
    const [tables]: any = await p.query('SHOW TABLES');
    const summaries: { name: string; rowCount: number; columns: any[] }[] = [];

    for (const t of tables) {
      const tableName = Object.values(t)[0] as string;
      const [countRows]: any = await p.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      const [colRows]: any = await p.query(`DESCRIBE \`${tableName}\``);

      summaries.push({
        name: tableName,
        rowCount: countRows[0]?.count || 0,
        columns: colRows.map((c: any) => ({
          field: c.Field,
          type: c.Type,
          nullable: c.Null === 'YES',
          key: c.Key,
          default: c.Default,
        })),
      });
    }

    return summaries;
  } catch (err) {
    console.error('Failed to get table summary:', err);
    return [];
  }
}

export async function seedMysqlData(seedData: {
  staff?: any[];
  complaints?: any[];
  orders?: any[];
  feedback?: any[];
  suggestions?: any[];
  auditLogs?: any[];
  menuItems?: any[];
}): Promise<{ insertedCounts: Record<string, number> }> {
  const p = getMysqlPool();
  const counts: Record<string, number> = {};
  if (!p) return { insertedCounts: counts };

  // 1. Seed staff
  if (seedData.staff && seedData.staff.length > 0) {
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM staff_members');
    if (rows[0]?.count === 0) {
      for (const s of seedData.staff) {
        await p.query(
          `INSERT IGNORE INTO staff_members (id, employee_id, full_name, email, phone, role, department, shift, status, hotel_id, created_by, created_at, last_login, first_login, password, assigned_tasks, rating)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id,
            s.employee_id,
            s.full_name,
            s.email,
            s.phone,
            s.role,
            s.department,
            s.shift,
            s.status || 'ACTIVE',
            s.hotel_id || 'HOTEL001',
            s.created_by || 'SYSTEM',
            s.created_at || '2026-01-01',
            s.last_login || 'Never',
            Boolean(s.first_login),
            s.password || 'Staff@123',
            s.assigned_tasks || 0,
            s.rating || 5.0,
          ]
        );
      }
      counts.staff_members = seedData.staff.length;
    }
  }

  // 2. Seed complaints
  if (seedData.complaints && seedData.complaints.length > 0) {
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM complaints');
    if (rows[0]?.count === 0) {
      for (const c of seedData.complaints) {
        await p.query(
          `INSERT IGNORE INTO complaints (id, hotel_id, room_number, guest_name, guest_phone, category, title, description, priority, status, assigned_to, image_url, resolution_note, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            c.id,
            c.hotel_id || 'HOTEL001',
            c.roomNumber || c.room_number || '101',
            c.guestName || c.guest_name || 'Guest',
            c.guestPhone || c.guest_phone || '',
            c.category || 'Other',
            c.title || '',
            c.description || '',
            c.priority || 'Medium',
            c.status || 'Pending',
            c.assignedTo || c.assigned_to || '',
            c.imageUrl || c.image_url || '',
            c.resolutionNote || c.resolution_note || '',
            c.createdAt || c.created_at || new Date().toISOString(),
            c.updatedAt || c.updated_at || new Date().toISOString(),
          ]
        );
      }
      counts.complaints = seedData.complaints.length;
    }
  }

  // 3. Seed food orders
  if (seedData.orders && seedData.orders.length > 0) {
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM food_orders');
    if (rows[0]?.count === 0) {
      for (const o of seedData.orders) {
        await p.query(
          `INSERT IGNORE INTO food_orders (id, hotel_id, order_location, room_or_table, guest_name, items, total_amount, status, assigned_waiter, special_instructions, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            o.id,
            o.hotel_id || 'HOTEL001',
            o.orderLocation || 'Room Service',
            o.roomOrTableNumber || o.room_number || 'Room 204',
            o.guestName || 'Guest',
            JSON.stringify(o.items || []),
            o.total || o.totalAmount || 0,
            o.status || 'New',
            o.assignedWaiter || '',
            o.notes || '',
            o.createdAt || new Date().toISOString(),
            o.updatedAt || new Date().toISOString(),
          ]
        );
      }
      counts.food_orders = seedData.orders.length;
    }
  }

  // 4. Seed feedback
  if (seedData.feedback && seedData.feedback.length > 0) {
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM feedback');
    if (rows[0]?.count === 0) {
      for (const f of seedData.feedback) {
        await p.query(
          `INSERT IGNORE INTO feedback (id, hotel_id, booking_id, order_id, room_number, customer_name, category, rating, title, message, suggestion, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            f.id,
            f.hotel_id || 'HOTEL001',
            f.booking_id || '',
            f.order_id || '',
            f.room_number || '',
            f.customer_name || 'Guest',
            f.category || 'Overall Experience',
            f.rating || 5,
            f.title || '',
            f.message || '',
            f.suggestion || '',
            f.status || 'Active',
            f.created_at || new Date().toISOString(),
          ]
        );
      }
      counts.feedback = seedData.feedback.length;
    }
  }

  // 5. Seed suggestions
  if (seedData.suggestions && seedData.suggestions.length > 0) {
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM suggestions');
    if (rows[0]?.count === 0) {
      for (const s of seedData.suggestions) {
        await p.query(
          `INSERT IGNORE INTO suggestions (id, hotel_id, customer_name, customer_phone, category, title, description, status, admin_notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id,
            s.hotel_id || 'HOTEL001',
            s.customer_name || 'Guest',
            s.customer_phone || '',
            s.category || 'General',
            s.title || '',
            s.suggestion || s.description || '',
            s.status || 'Pending',
            s.adminNotes || '',
            s.created_at || new Date().toISOString(),
            s.updated_at || new Date().toISOString(),
          ]
        );
      }
      counts.suggestions = seedData.suggestions.length;
    }
  }

  // 6. Seed audit logs
  if (seedData.auditLogs && seedData.auditLogs.length > 0) {
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM audit_logs');
    if (rows[0]?.count === 0) {
      for (const a of seedData.auditLogs) {
        await p.query(
          `INSERT IGNORE INTO audit_logs (id, employee_id, employee_name, role, action, timestamp, details, type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            a.id,
            a.employee_id || '',
            a.employee_name || '',
            a.role || '',
            a.action || 'Operation',
            a.timestamp || new Date().toLocaleString(),
            a.details || '',
            a.type || 'operation',
          ]
        );
      }
      counts.audit_logs = seedData.auditLogs.length;
    }
  }

  // 7. Seed menu items
  if (seedData.menuItems && seedData.menuItems.length > 0) {
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM menu_items');
    if (rows[0]?.count === 0) {
      for (const m of seedData.menuItems) {
        await p.query(
          `INSERT IGNORE INTO menu_items (id, hotel_id, name, category, price, rating, reviews_count, is_veg, prep_time, description, image, is_available, is_chef_special, is_recommended, available_times, spice_level, allergens, ingredients, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id,
            m.hotel_id || 'HOTEL001',
            m.name,
            m.category,
            m.price,
            m.rating || 4.8,
            m.reviewsCount || m.reviews_count || 50,
            m.isVeg !== undefined ? Boolean(m.isVeg) : true,
            m.prepTime || m.prep_time || '15 mins',
            m.description || '',
            m.image || '',
            m.isAvailable !== undefined ? Boolean(m.isAvailable) : true,
            m.isChefSpecial !== undefined ? Boolean(m.isChefSpecial) : false,
            m.isRecommended !== undefined ? Boolean(m.isRecommended) : false,
            JSON.stringify(m.availableTimes || ['Breakfast', 'Lunch', 'Dinner']),
            m.spiceLevel || 'Medium',
            JSON.stringify(m.allergens || []),
            JSON.stringify(m.ingredients || []),
            m.createdAt || m.created_at || new Date().toISOString(),
            m.updatedAt || m.updated_at || new Date().toISOString(),
          ]
        );
      }
      counts.menu_items = seedData.menuItems.length;
    }
  }

  return { insertedCounts: counts };
}
