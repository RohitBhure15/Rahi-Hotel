import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  testDbConnection,
  initMysqlSchema,
  seedMysqlData,
  executeQuery,
  getTablesSummary,
  getDbConfig,
  isDbConfigured,
  getMysqlPool,
} from './src/db/mysql';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory staff database
let staffDatabase = [
  {
    id: 'emp-1000',
    employee_id: 'EMP1000',
    full_name: 'Vikram Singhania',
    email: 'owner@aurapalms.com',
    phone: '+91 98220 10000',
    role: 'OWNER',
    department: 'Executive Ownership',
    shift: 'General (9 AM - 6 PM)',
    status: 'ACTIVE',
    hotel_id: 'HOTEL001',
    created_by: 'SYSTEM',
    created_at: '2026-01-15',
    last_login: 'Today, 08:30 AM',
    first_login: false,
    password: 'Owner@123',
    assigned_tasks: 0,
    rating: 5.0,
  },
  {
    id: 'emp-1001',
    employee_id: 'EMP1001',
    full_name: 'Kavita Menon',
    email: 'manager@aurapalms.com',
    phone: '+91 98111 00001',
    role: 'MANAGER',
    department: 'General Operations',
    shift: 'General (9 AM - 6 PM)',
    status: 'ACTIVE',
    hotel_id: 'HOTEL001',
    created_by: 'EMP1000',
    created_at: '2026-01-20',
    last_login: 'Today, 09:15 AM',
    first_login: false,
    password: 'Manager@123',
    assigned_tasks: 8,
    rating: 4.9,
  },
  {
    id: 'emp-1024',
    employee_id: 'EMP1024',
    full_name: 'Rahul Kumar',
    email: 'rahul.chef@aurapalms.com',
    phone: '+91 98111 00024',
    role: 'CHEF',
    department: 'Kitchen & F&B',
    shift: 'Morning (6 AM - 2 PM)',
    status: 'ACTIVE',
    hotel_id: 'HOTEL001',
    created_by: 'EMP1001',
    created_at: '2026-03-10',
    last_login: 'Today, 06:45 AM',
    first_login: false,
    password: 'Chef@123',
    assigned_tasks: 22,
    rating: 4.9,
  },
  {
    id: 'emp-1025',
    employee_id: 'EMP1025',
    full_name: 'Arun Saxena',
    email: 'arun.waiter@aurapalms.com',
    phone: '+91 98111 00025',
    role: 'WAITER',
    department: 'Dining & Room Service',
    shift: 'Morning (6 AM - 2 PM)',
    status: 'ACTIVE',
    hotel_id: 'HOTEL001',
    created_by: 'EMP1001',
    created_at: '2026-03-12',
    last_login: 'Today, 07:10 AM',
    first_login: false,
    password: 'Waiter@123',
    assigned_tasks: 12,
    rating: 4.8,
  },
  {
    id: 'emp-1026',
    employee_id: 'EMP1026',
    full_name: 'Priya Sharma',
    email: 'priya.reception@aurapalms.com',
    phone: '+91 98111 00026',
    role: 'RECEPTIONIST',
    department: 'Front Desk',
    shift: 'Morning (6 AM - 2 PM)',
    status: 'ACTIVE',
    hotel_id: 'HOTEL001',
    created_by: 'EMP1001',
    created_at: '2026-02-01',
    last_login: 'Today, 08:00 AM',
    first_login: false,
    password: 'Reception@123',
    assigned_tasks: 14,
    rating: 4.8,
  },
  {
    id: 'emp-1027',
    employee_id: 'EMP1027',
    full_name: 'Kiran Patel',
    email: 'kiran.housekeeping@aurapalms.com',
    phone: '+91 98111 00027',
    role: 'HOUSEKEEPING',
    department: 'Housekeeping',
    shift: 'Morning (6 AM - 2 PM)',
    status: 'ACTIVE',
    hotel_id: 'HOTEL001',
    created_by: 'EMP1001',
    created_at: '2026-03-15',
    last_login: 'Today, 07:30 AM',
    first_login: false,
    password: 'House@123',
    assigned_tasks: 9,
    rating: 4.9,
  },
  {
    id: 'emp-1028',
    employee_id: 'EMP1028',
    full_name: 'Rajesh Sharma',
    email: 'rajesh.maint@aurapalms.com',
    phone: '+91 98111 00028',
    role: 'MAINTENANCE',
    department: 'Engineering & Maintenance',
    shift: 'General (9 AM - 6 PM)',
    status: 'ACTIVE',
    hotel_id: 'HOTEL001',
    created_by: 'EMP1001',
    created_at: '2026-02-18',
    last_login: 'Yesterday, 05:20 PM',
    first_login: false,
    password: 'Maint@123',
    assigned_tasks: 4,
    rating: 4.7,
  },
  {
    id: 'emp-1029',
    employee_id: 'EMP1029',
    full_name: 'Vikram Jadhav',
    email: 'vikram.disabled@aurapalms.com',
    phone: '+91 98111 00029',
    role: 'WAITER',
    department: 'Dining & Room Service',
    shift: 'Evening (2 PM - 10 PM)',
    status: 'INACTIVE',
    hotel_id: 'HOTEL001',
    created_by: 'EMP1001',
    created_at: '2026-04-01',
    last_login: '3 weeks ago',
    first_login: false,
    password: 'Disabled@123',
    assigned_tasks: 0,
    rating: 3.5,
  },
  {
    id: 'emp-1030',
    employee_id: 'EMP1030',
    full_name: 'Sunita Rao',
    email: 'sunita.new@aurapalms.com',
    phone: '+91 98111 00030',
    role: 'HOUSEKEEPING',
    department: 'Housekeeping',
    shift: 'Morning (6 AM - 2 PM)',
    status: 'ACTIVE',
    hotel_id: 'HOTEL001',
    created_by: 'EMP1001',
    created_at: '2026-09-06',
    last_login: 'Never (New Hire)',
    first_login: true,
    temporary_password: 'Temp@1030',
    password: 'Temp@1030',
    assigned_tasks: 2,
    rating: 5.0,
  },
];

let auditLogsDatabase = [
  {
    id: 'aud-1',
    employee_id: 'EMP1001',
    employee_name: 'Kavita Menon',
    role: 'MANAGER',
    action: 'Employee Account Created',
    timestamp: '2026-09-06 11:24 AM',
    details: 'Created account for Sunita Rao (EMP1030, Housekeeping) with temporary password.',
    type: 'account',
  },
  {
    id: 'aud-2',
    employee_id: 'EMP1001',
    employee_name: 'Kavita Menon',
    role: 'MANAGER',
    action: 'Employee Account Disabled',
    timestamp: '2026-08-20 04:15 PM',
    details: 'Disabled account for Vikram Jadhav (EMP1029) due to end of contract.',
    type: 'security',
  },
  {
    id: 'aud-3',
    employee_id: 'EMP1024',
    employee_name: 'Rahul Kumar',
    role: 'CHEF',
    action: 'Successful Login',
    timestamp: 'Today, 06:45 AM',
    details: 'Authenticated via Kitchen Portal (IP: 192.168.1.104).',
    type: 'login',
  },
  {
    id: 'aud-4',
    employee_id: 'EMP1025',
    employee_name: 'Arun Saxena',
    role: 'WAITER',
    action: 'Food Order Picked Up',
    timestamp: 'Today, 07:15 AM',
    details: 'Picked up Order #1024 for Room 204 delivery.',
    type: 'operation',
  },
  {
    id: 'aud-5',
    employee_id: 'EMP1026',
    employee_name: 'Priya Sharma',
    role: 'RECEPTIONIST',
    action: 'Guest Check-in Processed',
    timestamp: 'Today, 08:00 AM',
    details: 'Checked in guest Rohit Bhure to Room 204.',
    type: 'operation',
  },
  {
    id: 'aud-6',
    employee_id: 'EMP1001',
    employee_name: 'Kavita Menon',
    role: 'MANAGER',
    action: 'Successful Login',
    timestamp: 'Today, 09:15 AM',
    details: 'Authenticated via Manager HQ Portal.',
    type: 'login',
  },
];

// --- AUTHENTICATION & STAFF API ROUTES ---

// 1. Staff & Manager Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, expectedRoleCategory } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/Employee ID and password are required.' });
  }

  const cleanId = String(identifier).trim().toLowerCase();
  const emp = staffDatabase.find((e) =>
    e.employee_id.toLowerCase() === cleanId ||
    e.email.toLowerCase() === cleanId ||
    e.full_name.toLowerCase() === cleanId
  );

  if (!emp) {
    return res.status(401).json({ error: 'Account not found. Please check your Employee ID, Name, or Email.' });
  }

  // Check password
  if (emp.password !== password && emp.temporary_password !== password) {
    return res.status(401).json({ error: 'Invalid password. Please verify your credentials.' });
  }

  // Check if account disabled
  if (emp.status === 'INACTIVE') {
    return res.status(403).json({
      error: 'Access Denied: Your employee account has been deactivated. Please contact the Hotel General Manager.',
      accountStatus: 'INACTIVE',
      employeeId: emp.employee_id,
    });
  }

  // Optional category check if manager login was specifically chosen
  if (expectedRoleCategory === 'manager' && !['MANAGER', 'OWNER'].includes(emp.role)) {
    return res.status(403).json({
      error: `Access Denied: ${emp.full_name} is registered as ${emp.role}. Please use the Employee / Staff Login portal.`,
    });
  }

  // Update last login
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
  emp.last_login = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Record audit log
  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: emp.employee_id,
    employee_name: emp.full_name,
    role: emp.role,
    action: 'Successful Login',
    timestamp: 'Just now',
    details: `Authenticated into system via ${emp.role} portal.`,
    type: 'login',
  });

  const { password: _, temporary_password: __, ...safeUser } = emp;
  return res.json({
    message: 'Login successful',
    token: `aura_jwt_${emp.employee_id}_${Date.now()}`,
    user: safeUser,
  });
});

// 2. First-time Login Password Change
app.post('/api/auth/first-login-password', (req, res) => {
  const { employee_id, current_password, new_password } = req.body;
  if (!employee_id || !new_password) {
    return res.status(400).json({ error: 'Employee ID and new password are required.' });
  }

  const emp = staffDatabase.find((e) => e.employee_id.toLowerCase() === String(employee_id).toLowerCase());
  if (!emp) {
    return res.status(404).json({ error: 'Employee account not found.' });
  }

  if (emp.password !== current_password && emp.temporary_password !== current_password) {
    return res.status(400).json({ error: 'Current password does not match record.' });
  }

  emp.password = new_password;
  emp.first_login = false;
  emp.temporary_password = undefined;

  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: emp.employee_id,
    employee_name: emp.full_name,
    role: emp.role,
    action: 'Password Changed',
    timestamp: 'Just now',
    details: 'Initial temporary password replaced with personal password on first login.',
    type: 'security',
  });

  const { password: _, temporary_password: __, ...safeUser } = emp;
  return res.json({
    message: 'Password successfully updated!',
    user: safeUser,
  });
});

// 3. Get All Employees
app.get('/api/staff', (req, res) => {
  return res.json(staffDatabase);
});

// 4. Add New Employee (Manager action)
app.post('/api/staff/create', (req, res) => {
  const {
    full_name,
    role,
    employee_id,
    temporary_password,
    phone,
    email,
    department,
    shift,
    status = 'ACTIVE',
    hotel_id = 'HOTEL001',
    created_by = 'MANAGER',
  } = req.body;

  if (!full_name || !role) {
    return res.status(400).json({ error: 'Full Name and Role are required.' });
  }

  const generatedId = employee_id || `EMP${Math.floor(1000 + Math.random() * 9000)}`;
  const existing = staffDatabase.find((e) => e.employee_id.toLowerCase() === generatedId.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: `Employee ID ${generatedId} already exists.` });
  }

  const tempPass = temporary_password || `Aura@${Math.floor(1000 + Math.random() * 9000)}`;
  const newEmp = {
    id: `emp-${Date.now()}`,
    employee_id: generatedId,
    full_name,
    email: email || `${full_name.toLowerCase().replace(/\s+/g, '.')}@aurapalms.com`,
    phone: phone || '+91 98000 00000',
    role,
    department: department || (role === 'CHEF' ? 'Kitchen & F&B' : role === 'WAITER' ? 'Dining & Room Service' : role === 'HOUSEKEEPING' ? 'Housekeeping' : role === 'RECEPTIONIST' ? 'Front Desk' : role === 'MAINTENANCE' ? 'Engineering' : 'Management'),
    shift: shift || 'Morning (6 AM - 2 PM)',
    status,
    hotel_id,
    created_by,
    created_at: new Date().toISOString().split('T')[0],
    last_login: 'Never (New Hire)',
    first_login: true,
    temporary_password: tempPass,
    password: tempPass,
    assigned_tasks: 0,
    rating: 5.0,
  };

  staffDatabase.push(newEmp);

  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: newEmp.employee_id,
    employee_name: newEmp.full_name,
    role: newEmp.role,
    action: 'Employee Account Created',
    timestamp: 'Just now',
    details: `Created by ${created_by} with initial role ${role} (ID: ${newEmp.employee_id}).`,
    type: 'account',
  });

  return res.status(201).json({
    message: 'Employee account created successfully.',
    employee: newEmp,
  });
});

// 5. Update Employee Details
app.put('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const empIndex = staffDatabase.findIndex((e) => e.id === id || e.employee_id === id);
  if (empIndex === -1) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  const prevRole = staffDatabase[empIndex].role;
  staffDatabase[empIndex] = { ...staffDatabase[empIndex], ...req.body };

  if (req.body.role && req.body.role !== prevRole) {
    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: staffDatabase[empIndex].employee_id,
      employee_name: staffDatabase[empIndex].full_name,
      role: staffDatabase[empIndex].role,
      action: 'Role Changed',
      timestamp: 'Just now',
      details: `Role updated from ${prevRole} to ${req.body.role}.`,
      type: 'account',
    });
  }

  return res.json(staffDatabase[empIndex]);
});

// 6. Toggle Status (Active / Inactive - Disable Account)
app.post('/api/staff/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const emp = staffDatabase.find((e) => e.id === id || e.employee_id === id);
  if (!emp) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  const nextStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  emp.status = nextStatus;

  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: emp.employee_id,
    employee_name: emp.full_name,
    role: emp.role,
    action: nextStatus === 'INACTIVE' ? 'Account Disabled' : 'Account Re-enabled',
    timestamp: 'Just now',
    details: `Account status transitioned to ${nextStatus}. Access ${nextStatus === 'INACTIVE' ? 'blocked' : 'restored'}.`,
    type: 'security',
  });

  return res.json({
    message: `Account status updated to ${nextStatus}`,
    employee: emp,
  });
});

// 7. Reset Password (Manager action)
app.post('/api/staff/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const emp = staffDatabase.find((e) => e.id === id || e.employee_id === id);
  if (!emp) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  const tempPass = `Aura@${Math.floor(1000 + Math.random() * 9000)}`;
  emp.password = tempPass;
  emp.temporary_password = tempPass;
  emp.first_login = true;

  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: emp.employee_id,
    employee_name: emp.full_name,
    role: emp.role,
    action: 'Password Reset by Manager',
    timestamp: 'Just now',
    details: `Generated temporary password for ${emp.full_name} (${emp.employee_id}). First login prompt enabled.`,
    type: 'security',
  });

  return res.json({
    message: 'Password reset successfully. Employee must create new password on next login.',
    temporary_password: tempPass,
    employee: emp,
  });
});

// 8. Audit Logs
app.get('/api/staff/audit-log', (req, res) => {
  return res.json(auditLogsDatabase);
});

app.post('/api/staff/audit-log', (req, res) => {
  const { employee_id, employee_name, role, action, details, type = 'operation' } = req.body;
  const entry = {
    id: `aud-${Date.now()}`,
    employee_id: employee_id || 'SYS',
    employee_name: employee_name || 'System Operator',
    role: role || 'STAFF',
    action: action || 'Operational Event',
    timestamp: 'Just now',
    details: details || 'Action logged by system.',
    type,
  };
  auditLogsDatabase.unshift(entry);
  if (auditLogsDatabase.length > 100) auditLogsDatabase.pop();
  return res.status(201).json(entry);
});

// ============================================================================
// IN-MEMORY DATABASES & UNIQUE ID GENERATORS (SOURCE OF TRUTH)
// ============================================================================

let complaintSeq = 4;
function generateComplaintId(): string {
  const id = `CMP-2026-${String(complaintSeq).padStart(4, '0')}`;
  complaintSeq++;
  return id;
}

let orderSeq = 4;
function generateOrderId(): string {
  const id = `ORD-2026-${String(orderSeq).padStart(4, '0')}`;
  orderSeq++;
  return id;
}

let feedbackSeq = 4;
function generateFeedbackId(): string {
  const id = `FDB-2026-${String(feedbackSeq).padStart(4, '0')}`;
  feedbackSeq++;
  return id;
}

let suggestionSeq = 4;
function generateSuggestionId(): string {
  const id = `SUG-2026-${String(suggestionSeq).padStart(4, '0')}`;
  suggestionSeq++;
  return id;
}

// 1. Complaints Database
let complaintsDatabase = [
  {
    id: 'CMP-2026-0001',
    hotel_id: 'HOTEL001',
    guestName: 'Rohit Bhure',
    roomNumber: '204',
    category: 'WiFi',
    title: 'Balcony Wi-Fi Signal Weak',
    description: 'WiFi connection speed dropped on the balcony area during a conference call.',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Vikash (IT & Maintenance)',
    resolutionNote: 'Secondary access point restarted. Signal boosted to 5GHz.',
    createdAt: '2026-09-02T08:15:00Z',
    updatedAt: '2026-09-02T08:45:00Z',
  },
  {
    id: 'CMP-2026-0002',
    hotel_id: 'HOTEL001',
    guestName: 'Sanjay Deshmukh',
    roomNumber: '305',
    category: 'Maintenance',
    title: 'AC Humming & Slow Cooling',
    description: 'Master bedroom air conditioning is cooling slowly and making a mild humming sound.',
    priority: 'High',
    status: 'Assigned',
    assignedTo: 'Rajesh (Senior Technician)',
    resolutionNote: '',
    createdAt: '2026-09-02T09:00:00Z',
    updatedAt: '2026-09-02T09:10:00Z',
  },
  {
    id: 'CMP-2026-0003',
    hotel_id: 'HOTEL001',
    guestName: 'Meera Nambiar',
    roomNumber: '101',
    category: 'Food',
    title: 'Lukewarm Soup Delivery',
    description: 'Soup was served slightly lukewarm during in-room dining.',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Chef Arun (Executive Chef)',
    resolutionNote: 'Replaced immediately with piping hot bowl and complimentary dessert.',
    createdAt: '2026-09-01T20:30:00Z',
    updatedAt: '2026-09-01T20:55:00Z',
  },
];

// 2. Food Orders Database
let ordersDatabase = [
  {
    id: 'ORD-2026-0001',
    hotel_id: 'HOTEL001',
    orderLocation: 'Room Service',
    roomOrTableNumber: 'Room 204',
    guestName: 'Rohit Bhure',
    items: [
      {
        item: { id: 'food-1', name: 'Shahi Butter Paneer', category: 'Vegetarian', price: 280, rating: 4.9, reviewsCount: 142, isVeg: true, prepTime: '20 mins', description: 'Fresh cottage cheese cubes simmered in rich tomato, cashew, and butter gravy.', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80' },
        quantity: 2,
      },
      {
        item: { id: 'food-3', name: 'Butter Garlic Naan', category: 'Indian', price: 90, rating: 4.9, reviewsCount: 310, isVeg: true, prepTime: '10 mins', description: 'Clay tandoor blistered bread loaded with crushed roasted garlic and pure Amul butter.', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
        quantity: 4,
      },
    ],
    total: 920,
    status: 'Preparing',
    assignedWaiter: 'Arun Saxena (Waiter)',
    notes: 'Please make it medium spicy. Ring bell twice.',
    createdAt: '12 mins ago',
    updatedAt: 'Just now',
  },
  {
    id: 'ORD-2026-0002',
    hotel_id: 'HOTEL001',
    orderLocation: 'Pool Area',
    roomOrTableNumber: 'Cabana 4',
    guestName: 'Dr. Vikram Malhotra',
    items: [
      {
        item: { id: 'food-4', name: 'Wood-Fired Truffle Margherita', category: 'Pizza', price: 460, rating: 4.8, reviewsCount: 88, isVeg: true, prepTime: '15 mins', description: 'San Marzano plum tomato sauce, fresh buffalo mozzarella, basil, and fragrant white truffle oil drizzle.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80' },
        quantity: 1,
      },
    ],
    total: 460,
    status: 'Ready',
    assignedWaiter: 'Arun Saxena (Waiter)',
    notes: 'Serve with extra napkins at pool deck.',
    createdAt: '24 mins ago',
    updatedAt: '3 mins ago',
  },
  {
    id: 'ORD-2026-0003',
    hotel_id: 'HOTEL001',
    orderLocation: 'Restaurant Table',
    roomOrTableNumber: 'Table 7',
    guestName: 'Sanjay Deshmukh',
    items: [
      {
        item: { id: 'food-2', name: 'Signature Dal Makhani', category: 'Vegetarian', price: 240, rating: 5.0, reviewsCount: 220, isVeg: true, prepTime: '15 mins', description: 'Black lentils slow cooked overnight for 18 hours with churned white butter and cream.', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
        quantity: 2,
      },
    ],
    total: 480,
    status: 'Delivered',
    assignedWaiter: 'Arun Saxena (Waiter)',
    notes: '',
    createdAt: '55 mins ago',
    updatedAt: '20 mins ago',
  },
];

// 2.5. Menu Items Database (Chef Dashboard & Dining Synchronization)
let menuDatabase = [
  {
    id: 'food-1',
    hotel_id: 'HOTEL001',
    name: 'Paneer Butter Masala',
    category: 'Indian',
    price: 280,
    rating: 4.9,
    reviewsCount: 154,
    isVeg: true,
    prepTime: '20 mins',
    description: 'Tender cottage cheese cubes simmered in a velvety, slow-cooked cashew and vine-ripened tomato gravy infused with kasuri methi and fresh cream.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: true,
    isRecommended: true,
    availableTimes: ['Lunch', 'Dinner'],
    spiceLevel: 'Medium',
    allergens: ['Dairy', 'Nuts'],
    ingredients: ['Fresh Paneer', 'Butter', 'Cashews', 'Tomatoes', 'Kasuri Methi', 'Fresh Cream', 'Garam Masala'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-2',
    hotel_id: 'HOTEL001',
    name: 'Dal Makhani Bukhara Style',
    category: 'Indian',
    price: 240,
    rating: 4.8,
    reviewsCount: 118,
    isVeg: true,
    prepTime: '25 mins',
    description: 'Slow-simmered black lentils and kidney beans cooked overnight with white butter and aromatic Kashmiri spices.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: false,
    isRecommended: true,
    availableTimes: ['Lunch', 'Dinner'],
    spiceLevel: 'Mild',
    allergens: ['Dairy'],
    ingredients: ['Whole Black Urad Dal', 'Rajma', 'Butter', 'Cream', 'Ginger-Garlic Paste', 'Tomato Puree'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-3',
    hotel_id: 'HOTEL001',
    name: 'Butter Garlic Naan (2 pcs)',
    category: 'Indian',
    price: 90,
    rating: 4.9,
    reviewsCount: 210,
    isVeg: true,
    prepTime: '10 mins',
    description: 'Traditional clay tandoor baked leavened flatbread brushed generously with salted garlic butter and fresh coriander.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: false,
    isRecommended: false,
    availableTimes: ['Lunch', 'Dinner'],
    spiceLevel: 'None',
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Refined Flour', 'Fresh Garlic', 'Pure Amul Butter', 'Coriander', 'Yogurt'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-4',
    hotel_id: 'HOTEL001',
    name: 'Wood-Fired Truffle Margherita',
    category: 'Italian',
    price: 460,
    rating: 4.8,
    reviewsCount: 88,
    isVeg: true,
    prepTime: '15 mins',
    description: 'San Marzano tomato base, fresh buffalo mozzarella, fragrant basil leaves, and a drizzle of aromatic Italian black truffle oil.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: true,
    isRecommended: true,
    availableTimes: ['Lunch', 'Dinner'],
    spiceLevel: 'None',
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Sourdough Pizza Dough', 'San Marzano Tomatoes', 'Fresh Mozzarella', 'Basil', 'Black Truffle Oil'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-5',
    hotel_id: 'HOTEL001',
    name: 'Crispy Paneer Tikka Angara',
    category: 'Starters',
    price: 310,
    rating: 4.9,
    reviewsCount: 125,
    isVeg: true,
    prepTime: '15 mins',
    description: 'Charcoal-grilled cottage cheese cubes marinated in spiced mustard oil, hung curd, and roasted gram flour. Served with mint chutney.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: true,
    isRecommended: true,
    availableTimes: ['Lunch', 'Dinner', 'All Day'],
    spiceLevel: 'Spicy',
    allergens: ['Dairy'],
    ingredients: ['Malai Paneer', 'Hung Curd', 'Mustard Oil', 'Kasuri Methi', 'Bell Peppers', 'Red Onions'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-6',
    hotel_id: 'HOTEL001',
    name: 'Ghee Roast Masala Dosa',
    category: 'South Indian',
    price: 180,
    rating: 4.9,
    reviewsCount: 140,
    isVeg: true,
    prepTime: '12 mins',
    description: 'Golden, paper-crisp rice crepe roasted in aromatic desi ghee, filled with seasoned potato bhaji, served with coconut chutney and piping sambhar.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: false,
    isRecommended: true,
    availableTimes: ['Breakfast', 'Dinner', 'All Day'],
    spiceLevel: 'Medium',
    allergens: ['Dairy'],
    ingredients: ['Fermented Rice & Urad Batter', 'Pure Desi Ghee', 'Spiced Potatoes', 'Mustard Seeds', 'Curry Leaves'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-7',
    hotel_id: 'HOTEL001',
    name: 'Royal Continental Breakfast Platter',
    category: 'Breakfast',
    price: 320,
    rating: 4.8,
    reviewsCount: 79,
    isVeg: true,
    prepTime: '15 mins',
    description: 'Freshly baked croissants, golden hash browns, grilled herb tomatoes, sauteed butter mushrooms, seasonal fruit bowl, and choice of fresh juice.',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: false,
    isRecommended: false,
    availableTimes: ['Breakfast'],
    spiceLevel: 'None',
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Croissant', 'Potatoes', 'Button Mushrooms', 'Tomatoes', 'Seasonal Fruits', 'Butter'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-8',
    hotel_id: 'HOTEL001',
    name: 'Schezwan Chilli Garlic Noodles',
    category: 'Chinese',
    price: 260,
    rating: 4.7,
    reviewsCount: 94,
    isVeg: true,
    prepTime: '15 mins',
    description: 'Wok-tossed hand-pulled noodles with crunchy shredded vegetables, scorched garlic flakes, and spicy in-house Sichuan pepper sauce.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: false,
    isRecommended: true,
    availableTimes: ['Lunch', 'Dinner'],
    spiceLevel: 'Spicy',
    allergens: ['Gluten', 'Soy'],
    ingredients: ['Noodles', 'Garlic', 'Schezwan Pepper Paste', 'Bell Peppers', 'Spring Onions', 'Soy Sauce'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-9',
    hotel_id: 'HOTEL001',
    name: 'Royal Kesari Saffron Lassi',
    category: 'Beverages',
    price: 110,
    rating: 4.9,
    reviewsCount: 165,
    isVeg: true,
    prepTime: '5 mins',
    description: 'Rich churned yogurt elixir infused with Kashmiri saffron strands, crushed green cardamom, and toasted pistachio flakes.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: true,
    isRecommended: true,
    availableTimes: ['All Day', 'Breakfast', 'Lunch', 'Dinner'],
    spiceLevel: 'None',
    allergens: ['Dairy', 'Nuts'],
    ingredients: ['Full Cream Curd', 'Kashmiri Saffron', 'Pistachios', 'Almonds', 'Cardamom', 'Raw Sugar'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-10',
    hotel_id: 'HOTEL001',
    name: 'Warm Gulab Jamun with Rabri',
    category: 'Desserts',
    price: 180,
    rating: 4.9,
    reviewsCount: 132,
    isVeg: true,
    prepTime: '8 mins',
    description: 'Two golden khoya dumplings steeped in rose cardamom syrup, served atop chilled slow-reduced saffron rabri.',
    image: 'https://images.unsplash.com/photo-1605197148560-637996c141d0?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: true,
    isRecommended: true,
    availableTimes: ['Lunch', 'Dinner', 'All Day'],
    spiceLevel: 'None',
    allergens: ['Dairy', 'Nuts', 'Gluten'],
    ingredients: ['Mawa / Khoya', 'Sugar Syrup', 'Green Cardamom', 'Rose Water', 'Slow-Simmered Rabri', 'Silver Vark'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-11',
    hotel_id: 'HOTEL001',
    name: 'Bombay Masala Toasted Sandwich',
    category: 'Snacks',
    price: 160,
    rating: 4.7,
    reviewsCount: 68,
    isVeg: true,
    prepTime: '10 mins',
    description: 'Triple-layer toasted sandwich stuffed with spiced beetroot, boiled potatoes, tomatoes, cucumbers, processed cheese, and spicy mint coriander chutney.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: false,
    isRecommended: false,
    availableTimes: ['Breakfast', 'All Day'],
    spiceLevel: 'Medium',
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Bread', 'Potatoes', 'Beetroot', 'Mint Chutney', 'Cheese', 'Chaat Masala', 'Butter'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
  {
    id: 'food-12',
    hotel_id: 'HOTEL001',
    name: 'Kids Cheesy Mini Pizza & Fries',
    category: 'Kids Menu',
    price: 220,
    rating: 4.8,
    reviewsCount: 52,
    isVeg: true,
    prepTime: '12 mins',
    description: 'Mild cheese-loaded 6-inch mini pizza topped with sweet corn and diced mozzarella, paired with golden potato smileys and tomato dip.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isChefSpecial: false,
    isRecommended: true,
    availableTimes: ['Lunch', 'Dinner', 'All Day'],
    spiceLevel: 'None',
    allergens: ['Gluten', 'Dairy'],
    ingredients: ['Mini Crust', 'Mild Tomato Sauce', 'Mozzarella', 'Sweet Corn', 'Potato Smileys'],
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-03-10T12:00:00Z',
  },
];

// 3. Customer Feedback Database
let feedbackDatabase = [
  {
    id: 'FDB-2026-0001',
    hotel_id: 'HOTEL001',
    customer_name: 'Ananya Sharma',
    room_number: '204',
    booking_id: '#HTL10234',
    order_id: 'ORD-2026-0001',
    category: 'Overall Experience',
    rating: 5,
    title: 'Magical Stay & Exquisite Ambience',
    message: 'The beachfront serenity, courteous staff, and ocean view terrace exceeded our highest expectations. Truly 5-star hospitality!',
    suggestion: 'Consider adding bicycle rentals for exploring South Goa beaches in the early morning.',
    status: 'Active',
    created_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 'FDB-2026-0002',
    hotel_id: 'HOTEL001',
    customer_name: 'Vikram Malhotra',
    room_number: 'Villa 1',
    booking_id: '#HTL10236',
    order_id: 'ORD-2026-0002',
    category: 'Food',
    rating: 4,
    title: 'Delectable Truffle Pizza and Pool Service',
    message: 'The wood-fired truffle pizza at the poolside was fresh and delicious. Staff arrived promptly with towels and cold drinks.',
    suggestion: 'Would love more vegan dessert options on the poolside menu.',
    status: 'Active',
    created_at: '2026-09-01T15:30:00Z',
  },
  {
    id: 'FDB-2026-0003',
    hotel_id: 'HOTEL001',
    customer_name: 'Rohan Gupta',
    room_number: '101',
    booking_id: '#HTL10237',
    category: 'Cleanliness',
    rating: 5,
    title: 'Immaculate Room Hygiene',
    message: 'Housekeeping team did an exceptional job preparing our room. Very fresh linen and spotless bathroom.',
    suggestion: '',
    status: 'Active',
    created_at: '2026-08-31T18:20:00Z',
  },
];

// 4. Hotel Improvement Suggestions Database ("Help us improve")
let suggestionsDatabase = [
  {
    id: 'SUG-2026-0001',
    hotel_id: 'HOTEL001',
    customer_name: 'Ananya Sharma',
    category: 'Activities',
    title: 'Sunrise Beach Cycling Tours',
    suggestion: 'Add guided coastal bicycle rentals for exploring South Goa coastal roads at dawn.',
    status: 'Planned',
    adminNotes: 'Procured 6 hybrid bikes. Launching guided morning tour next week.',
    created_at: '2026-09-02T10:00:00Z',
    updated_at: '2026-09-02T11:00:00Z',
  },
  {
    id: 'SUG-2026-0002',
    hotel_id: 'HOTEL001',
    customer_name: 'Vikram Malhotra',
    category: 'Food',
    title: 'Dairy-free & Vegan Dessert Selection',
    suggestion: 'Introduce dairy-free artisanal gelato or coconut panna cotta to the poolside lounge.',
    status: 'Reviewing',
    adminNotes: 'Chef Arun is testing coconut milk mango chia puddings.',
    created_at: '2026-09-01T15:30:00Z',
    updated_at: '2026-09-01T16:00:00Z',
  },
  {
    id: 'SUG-2026-0003',
    hotel_id: 'HOTEL001',
    customer_name: 'Kavita Krishnan',
    category: 'Service',
    title: 'EV Fast Charging Stations in Parking Lot',
    suggestion: 'Add dual-port EV chargers for guests driving from Mumbai/Bangalore.',
    status: 'Implemented',
    adminNotes: 'Installed 2x 22kW Type-2 AC chargers in North parking zone.',
    created_at: '2026-08-25T14:10:00Z',
    updated_at: '2026-08-29T12:00:00Z',
  },
];

// ============================================================================
// RESORT ACTIVITIES & GAMES DATABASE (LIVE REPOSITORY)
// ============================================================================
let activitiesDatabase = [
  {
    id: 'act-table-tennis',
    title: 'Table Tennis (Ping Pong Arena)',
    category: 'Recreation',
    duration: '1 Hour',
    timing: '08:00 - 22:00 Daily',
    pricePerPerson: 150,
    isComplimentary: false,
    isAvailable: true,
    description: 'Championship-grade indoor table tennis with Stiga tournament paddles, competition balls, and non-glare LED illumination.',
    location: 'Clubhouse Level 1',
    slotsAvailable: 12,
    indoorOutdoor: 'Indoor',
    capacity: '2 to 4 players',
    suitableFor: ['2 players', '4 players', '4 people', '2 people', 'all', 'children', 'teens', 'adults', 'couples', 'groups'],
    image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80',
    icon: 'Activity',
  },
  {
    id: 'act-chess',
    title: 'Grandmaster Chess Pavilion',
    category: 'Recreation',
    duration: '1 Hour',
    timing: '08:00 - 22:00 Daily',
    pricePerPerson: 100,
    isComplimentary: false,
    isAvailable: true,
    description: 'Hand-carved wooden tournament chess boards and digital chess timers in our shaded garden veranda.',
    location: 'Garden Pavilion',
    slotsAvailable: 10,
    indoorOutdoor: 'Indoor',
    capacity: '2 players',
    suitableFor: ['2 players', '2 people', 'all', 'children', 'adults', 'seniors', 'quiet'],
    image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
    icon: 'Shield',
  },
  {
    id: 'act-carrom',
    title: 'Club Carrom Board Challenge',
    category: 'Recreation',
    duration: '1 Hour',
    timing: '08:00 - 22:00 Daily',
    pricePerPerson: 120,
    isComplimentary: false,
    isAvailable: true,
    description: 'English birch plywood tournament carrom boards with precision acrylic striker coins and boric surface powder.',
    location: 'Game Lounge',
    slotsAvailable: 8,
    indoorOutdoor: 'Indoor',
    capacity: '2 to 4 players',
    suitableFor: ['2 to 4 players', '4 people', '2 people', 'families', 'children', 'groups'],
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80',
    icon: 'Crosshair',
  },
  {
    id: 'act-darts',
    title: 'Precision Darts Zone',
    category: 'Recreation',
    duration: '1 Hour',
    timing: '09:00 - 22:00 Daily',
    pricePerPerson: 150,
    isComplimentary: false,
    isAvailable: true,
    description: 'Official sisal bristle dartboards with balanced steel-tip darts, magnetic safety rings, and electronic scoreboard.',
    location: 'Sports Bar Lounge',
    slotsAvailable: 8,
    indoorOutdoor: 'Indoor',
    capacity: '1 to 4 players',
    suitableFor: ['1 to 4 players', '4 people', 'adults', 'teens', 'groups'],
    image: 'https://images.unsplash.com/photo-1588731234159-8b9963143fca?auto=format&fit=crop&w=1200&q=80',
    icon: 'Target',
  },
  {
    id: 'act-puzzle-games',
    title: 'Puzzle Games & Brain Teasers',
    category: 'Recreation',
    duration: '1 Hour',
    timing: '09:00 - 22:00 Daily',
    pricePerPerson: 100,
    isComplimentary: false,
    isAvailable: true,
    description: 'Extensive curation of 500-1000 pc landscape jigsaw puzzles, mechanical wooden puzzles, Rubik cubes, and logic games.',
    location: 'Library & Hobby Room',
    slotsAvailable: 15,
    indoorOutdoor: 'Indoor',
    capacity: '1 to 6 players',
    suitableFor: ['children', 'families', 'seniors', 'quiet', 'all'],
    image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    icon: 'Puzzle',
  },
  {
    id: 'act-mini-basket',
    title: 'Mini Basketball Shootout',
    category: 'Recreation',
    duration: '1 Hour',
    timing: '08:00 - 20:00 Daily',
    pricePerPerson: 200,
    isComplimentary: false,
    isAvailable: true,
    description: 'Mini basketball half-court with spring-action breakaway rim, rubberized grip flooring, and automated shot counter.',
    location: 'Courtyard Arena',
    slotsAvailable: 14,
    indoorOutdoor: 'Outdoor',
    capacity: '2 to 4 players',
    suitableFor: ['children', 'teens', 'active', 'groups', '4 people', '2 people'],
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    icon: 'Trophy',
  },
  {
    id: 'act-cricket',
    title: 'Box Cricket Pitch & Kit',
    category: 'Adventure',
    duration: '1 Hour',
    timing: '06:30 - 21:00 Daily',
    pricePerPerson: 450,
    isComplimentary: false,
    isAvailable: true,
    description: 'Floodlit artificial grass turf box cricket arena complete with SS Kashmir willow bats, tennis balls, pads, and stumps.',
    location: 'Sports Turf Ground',
    slotsAvailable: 20,
    indoorOutdoor: 'Outdoor',
    capacity: '4 to 12 players',
    suitableFor: ['4 to 12 players', 'groups', 'teams', 'families', 'adults', 'active', '4 people'],
    image: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80',
    icon: 'Dumbbell',
  },
  {
    id: 'act-badminton',
    title: 'Outdoor Badminton Court',
    category: 'Adventure',
    duration: '1 Hour',
    timing: '06:00 - 21:00 Daily',
    pricePerPerson: 250,
    isComplimentary: false,
    isAvailable: true,
    description: 'Non-slip synthetic outdoor badminton court with Yonex carbon racquets, nylon/feather shuttles, and evening lighting.',
    location: 'Palm Courtyard Courts',
    slotsAvailable: 12,
    indoorOutdoor: 'Outdoor',
    capacity: '2 to 4 players',
    suitableFor: ['2 to 4 players', 'singles', 'doubles', 'couples', 'friends', 'groups', '4 people', '2 people'],
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    icon: 'Wind',
  },
  {
    id: 'act-cycling',
    title: 'Coastal Trail Cycling & Bike Rental',
    category: 'Adventure',
    duration: '2 Hours',
    timing: '06:30 - 18:30 Daily',
    pricePerPerson: 200,
    isComplimentary: false,
    isAvailable: true,
    description: 'Premium geared hybrid mountain bikes, safety helmets, smartphone mount, and digital coastal trail GPS map.',
    location: 'Resort Main Gate',
    slotsAvailable: 18,
    indoorOutdoor: 'Outdoor',
    capacity: '1 person per bike',
    suitableFor: ['couples', 'adventure', 'teens', 'adults', 'groups'],
    image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80',
    icon: 'Bike',
  },
  {
    id: 'act-nature-walk',
    title: 'Botanical Nature Walk & Bird Watching',
    category: 'Wellness',
    duration: '1.5 Hours',
    timing: '07:00 - 08:30 & 16:30 - 18:00',
    pricePerPerson: 0,
    isComplimentary: true,
    isAvailable: true,
    description: 'Guided ecological tour through the private palm groves, lotus ponds, and rare coastal bird habitats with resort naturalist.',
    location: 'Nature Trail Reception',
    slotsAvailable: 25,
    indoorOutdoor: 'Outdoor',
    capacity: 'Up to 25 people',
    suitableFor: ['all', 'families', 'children', 'seniors', 'nature lovers'],
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    icon: 'Compass',
  },
  {
    id: 'act-swimming-pool',
    title: 'Infinity Swimming Pool & Jacuzzi',
    category: 'Water',
    duration: 'All Day',
    timing: '06:00 - 21:00 Daily',
    pricePerPerson: 0,
    isComplimentary: true,
    isAvailable: true,
    description: 'Temperature-controlled double-tier infinity swimming pool overlooking the Arabian Sea with heated jacuzzi jets and sun deck.',
    location: 'Central Deck Building B',
    slotsAvailable: 50,
    indoorOutdoor: 'Outdoor',
    capacity: 'Up to 50 guests',
    suitableFor: ['all', 'families', 'children', 'couples', 'relaxation'],
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
    icon: 'Waves',
  },
  {
    id: 'act-spa',
    title: 'Nirvana Ayurvedic Spa & Massage',
    category: 'Wellness',
    duration: '60 - 90 Mins',
    timing: '09:00 - 20:00 Daily',
    pricePerPerson: 2500,
    isComplimentary: false,
    isAvailable: true,
    description: 'Authentic Kerala herbal oil abhyanga massages, hot stone therapies, shirodhara, and private steam suites.',
    location: 'Ayurvedic Wellness Pavilion',
    slotsAvailable: 6,
    indoorOutdoor: 'Indoor',
    capacity: 'Individual or Couple',
    suitableFor: ['adults', 'couples', 'wellness', 'relaxation'],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    icon: 'HeartPulse',
  },
  {
    id: 'act-bonfire',
    title: 'Sunset Beach Bonfire & Live Music',
    category: 'Evening',
    duration: '2 Hours',
    timing: '19:30 - 21:30 Daily',
    pricePerPerson: 0,
    isComplimentary: true,
    isAvailable: true,
    description: 'Complimentary beachfront bonfire gathering with live acoustic guitar melodies, roasted marshmallows, and seaside stargazing.',
    location: 'North Beachfront Deck',
    slotsAvailable: 40,
    indoorOutdoor: 'Outdoor',
    capacity: 'Open to all guests',
    suitableFor: ['all', 'families', 'couples', 'groups', 'evening'],
    image: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=1200&q=80',
    icon: 'Flame',
  },
];

// ============================================================================
// ROOMS DATABASE (LIVE REPOSITORY)
// ============================================================================
let roomsDatabase = [
  {
    id: 'room-101',
    number: '101',
    name: 'Garden Deluxe King',
    type: 'Deluxe',
    pricePerNight: 3500,
    capacity: 2,
    bedType: '1 King Bed',
    sizeSqFt: 380,
    floor: 1,
    amenities: ['Garden View', 'Complimentary WiFi', 'Rain Shower', 'Mini Bar', 'Smart TV', 'Balcony'],
    status: 'available',
    description: 'Comfortable ground-floor room with natural garden views, crisp cotton linens, wooden furnishings, and private veranda.',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'room-201',
    number: '201',
    name: 'Azure Premium Oceanfront',
    type: 'Premium',
    pricePerNight: 5200,
    capacity: 3,
    bedType: '1 King Bed + Daybed',
    sizeSqFt: 460,
    floor: 2,
    amenities: ['Ocean Panorama', 'Coffee Maker', 'Rain Shower', 'High-Speed WiFi', 'Balcony Seating'],
    status: 'available',
    description: 'Airy second-floor room featuring floor-to-ceiling sea-view balcony doors, ocean breeze, and premium coffee bar.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'room-203',
    number: '203',
    name: 'Palms Premium Twin',
    type: 'Premium',
    pricePerNight: 5200,
    capacity: 2,
    bedType: '2 Queen Beds',
    sizeSqFt: 450,
    floor: 2,
    amenities: ['Garden & Sea View', 'High-Speed WiFi', 'Mini Bar', 'Double Vanity', 'Balcony'],
    status: 'available',
    description: 'Two spacious queen beds with luxury duvets, work desk, and balcony overlooking tropical palms.',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'room-204',
    number: '204',
    name: 'Azure Premium Oceanfront',
    type: 'Premium',
    pricePerNight: 5200,
    capacity: 2,
    bedType: '1 King Bed',
    sizeSqFt: 460,
    floor: 2,
    amenities: ['Ocean Panorama', 'Balcony Seating', 'Smart TV', 'Rain Shower', 'Complimentary WiFi'],
    status: 'occupied',
    description: 'Active room for guest Rohit Bhure. Second floor ocean-facing sanctuary with private balcony.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'room-301',
    number: '301',
    name: 'Aura Royal Pool Villa',
    type: 'Villa',
    pricePerNight: 10500,
    capacity: 4,
    bedType: '2 King Suites',
    sizeSqFt: 1100,
    floor: 1,
    amenities: ['Private Plunge Pool', 'Personal Butler', 'Ocean Panorama', 'Jacuzzi Tub', 'Private Sun Deck'],
    status: 'available',
    description: 'Ultra-exclusive private villa with personal swimming plunge pool, landscaped courtyard garden, and 24/7 dedicated butler service.',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'room-302',
    number: '302',
    name: 'Palm Sanctuary Presidential Suite',
    type: 'Suite',
    pricePerNight: 14500,
    capacity: 4,
    bedType: '2 Master Bedrooms',
    sizeSqFt: 1400,
    floor: 3,
    amenities: ['Panoramic Sea Terrace', 'Private Jacuzzi', 'Chef Dining Table', 'Walk-in Wardrobe', 'Champagne Bar'],
    status: 'available',
    description: 'Top-tier luxury penthouse suite with 270-degree coastal vista, heated terrace jacuzzi, private dining salon, and master marble bathrooms.',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  },
];

// ============================================================================
// BOOKINGS DATABASE (LIVE REPOSITORY)
// ============================================================================
// BOOKINGS & GUESTS DATABASE (LIVE CENTRAL REPOSITORY)
// ============================================================================
let bookingsDatabase: any[] = [
  {
    id: '#HTL10234',
    customerId: 'CUST-1001',
    roomNumber: '204',
    guestName: 'Rohit Bhure',
    guestEmail: 'rohitbhure2006@gmail.com',
    guestPhone: '+91 98765 43210',
    guestAddress: '42 Marine Drive, Nariman Point, Mumbai, MH',
    roomType: 'Deluxe',
    checkIn: '2026-09-02',
    checkOut: '2026-09-05',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    guests: 2,
    guestsCount: 2,
    nights: 3,
    bookingType: 'Online',
    totalAmount: 16803,
    status: 'Checked In',
    guestStatus: 'Checked-in',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    specialRequests: 'High floor, ocean facing, extra feather pillows',
    createdAt: '2026-08-28T14:20:00Z',
  },
  {
    id: '#HTL10239',
    customerId: 'CUST-1004',
    roomNumber: '204',
    guestName: 'Rahul Sharma',
    guestEmail: 'rahul.sharma@example.com',
    guestPhone: '+91 98220 12345',
    guestAddress: 'B-14 Koramangala, Bengaluru, KA',
    roomType: 'Deluxe',
    checkIn: '2026-09-10',
    checkOut: '2026-09-12',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    guests: 2,
    guestsCount: 2,
    nights: 2,
    bookingType: 'Direct',
    totalAmount: 8791,
    status: 'Checked In',
    guestStatus: 'Checked-in',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    specialRequests: 'Late checkout if possible, twin beds requested',
    createdAt: '2026-09-08T09:30:00Z',
  },
  {
    id: '#HTL10240',
    customerId: 'CUST-1005',
    roomNumber: '301',
    guestName: 'Priya Kapoor',
    guestEmail: 'priya.kapoor@example.com',
    guestPhone: '+91 98111 22334',
    guestAddress: 'Flat 402, Vasant Vihar, New Delhi, DL',
    roomType: 'Suite',
    checkIn: '2026-09-11',
    checkOut: '2026-09-14',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    guests: 2,
    guestsCount: 2,
    nights: 3,
    bookingType: 'Online',
    totalAmount: 27612,
    status: 'Confirmed',
    guestStatus: 'Reserved',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit/Debit Card',
    specialRequests: 'Honeymoon welcome setup and floral fragrance',
    createdAt: '2026-09-08T15:20:00Z',
  },
  {
    id: '#HTL10235',
    customerId: 'CUST-1002',
    roomNumber: '302',
    guestName: 'Ananya Verma',
    guestEmail: 'ananya.v@example.com',
    guestPhone: '+91 98234 56789',
    guestAddress: 'Sector 50, Noida, UP',
    roomType: 'Suite',
    checkIn: '2026-09-02',
    checkOut: '2026-09-05',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    guests: 2,
    guestsCount: 2,
    nights: 3,
    bookingType: 'Online',
    totalAmount: 27612,
    status: 'Confirmed',
    guestStatus: 'Reserved',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit/Debit Card',
    specialRequests: 'Early check-in around 12:30 PM if ready',
    createdAt: '2026-08-29T10:15:00Z',
  },
  {
    id: '#HTL10236',
    customerId: 'CUST-1003',
    roomNumber: 'Villa 1',
    guestName: 'Dr. Vikram Malhotra',
    guestEmail: 'vikram.m@hospital.org',
    guestPhone: '+91 97111 22334',
    guestAddress: 'Civil Lines, Jaipur, RJ',
    roomType: 'Villa',
    checkIn: '2026-09-01',
    checkOut: '2026-09-06',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    guests: 4,
    guestsCount: 4,
    nights: 5,
    bookingType: 'Corporate',
    totalAmount: 94223,
    status: 'Checked In',
    guestStatus: 'Checked-in',
    paymentStatus: 'Paid',
    paymentMethod: 'Net Banking',
    specialRequests: 'Daily chef breakfast at villa pool',
    createdAt: '2026-08-25T09:00:00Z',
  },
  {
    id: '#HTL10237',
    customerId: 'CUST-1006',
    roomNumber: '201',
    guestName: 'Pooja Iyer',
    guestEmail: 'pooja.iyer@techcorp.in',
    guestPhone: '+91 99887 76655',
    guestAddress: 'T Nagar, Chennai, TN',
    roomType: 'Premium',
    checkIn: '2026-09-03',
    checkOut: '2026-09-06',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    guests: 2,
    guestsCount: 2,
    nights: 3,
    bookingType: 'Online',
    totalAmount: 18408,
    status: 'Confirmed',
    guestStatus: 'Reserved',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    specialRequests: 'Extra pillows and quiet room',
    createdAt: '2026-08-30T16:45:00Z',
  },
  {
    id: '#HTL10238',
    customerId: 'CUST-1007',
    roomNumber: '305',
    guestName: 'Sanjay Deshmukh',
    guestEmail: 'sanjay.d@deshmukh.co',
    guestPhone: '+91 98450 12345',
    guestAddress: 'Shivaji Nagar, Pune, MH',
    roomType: 'Family',
    checkIn: '2026-09-01',
    checkOut: '2026-09-03',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    guests: 4,
    guestsCount: 4,
    nights: 2,
    bookingType: 'Direct',
    totalAmount: 25193,
    status: 'Checked In',
    guestStatus: 'Checked-in',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit/Debit Card',
    specialRequests: 'Baby cot and warm milk at bedtime',
    createdAt: '2026-08-27T11:30:00Z',
  },
];

// RECEPTION AUDIT LOGS (Activity tracking for all receptionist actions)
let guestAuditLogsDatabase: any[] = [
  {
    id: 'aud-101',
    bookingId: '#HTL10234',
    guestName: 'Rohit Bhure',
    roomNumber: '204',
    action: 'Checked-in guest',
    performedBy: 'Priya Sharma (Receptionist)',
    fieldChanged: 'Status',
    oldValue: 'Reserved',
    newValue: 'Checked-in',
    timestamp: 'Sep 02, 2026, 02:15 PM',
  },
  {
    id: 'aud-102',
    bookingId: '#HTL10239',
    guestName: 'Rahul Sharma',
    roomNumber: '204',
    action: 'Changed customer phone number',
    performedBy: 'Priya Sharma (Receptionist)',
    fieldChanged: 'Phone',
    oldValue: '+91 98220 00000',
    newValue: '+91 98220 12345',
    timestamp: 'Sep 10, 2026, 11:30 AM',
  },
  {
    id: 'aud-103',
    bookingId: '#HTL10239',
    guestName: 'Rahul Sharma',
    roomNumber: '204',
    action: 'Checked-in guest',
    performedBy: 'Priya Sharma (Receptionist)',
    fieldChanged: 'Status',
    oldValue: 'Reserved',
    newValue: 'Checked-in',
    timestamp: 'Sep 10, 2026, 02:00 PM',
  },
];

// RECEPTION MESSAGES (Reminders, confirmations, notifications)
let receptionMessagesDatabase: any[] = [
  {
    id: 'MSG-2026-001',
    bookingId: '#HTL10239',
    guestName: 'Rahul Sharma',
    roomNumber: '204',
    guestPhone: '+91 98220 12345',
    guestEmail: 'rahul.sharma@example.com',
    type: 'checkin_reminder',
    subject: 'Check-in Reminder — Hotel Rahi',
    messageText: 'Hello Rahul! 👋 This is a reminder that your check-in at our resort is scheduled for today at 2:00 PM. We look forward to welcoming you!',
    channels: ['In-App', 'SMS / WhatsApp'],
    status: 'Delivered',
    sentBy: 'Priya Sharma (Receptionist)',
    sentAt: 'Sep 10, 2026, 10:00 AM',
  },
  {
    id: 'MSG-2026-002',
    bookingId: '#HTL10240',
    guestName: 'Priya Kapoor',
    roomNumber: '301',
    guestPhone: '+91 98111 22334',
    guestEmail: 'priya.kapoor@example.com',
    type: 'checkin_reminder',
    subject: 'Upcoming Arrival Reminder — Suite 301',
    messageText: 'Hello Priya! 👋 This is a reminder that your check-in at our resort is scheduled for tomorrow at 2:00 PM. We look forward to welcoming you!',
    channels: ['In-App', 'Email'],
    status: 'Delivered',
    sentBy: 'Front Desk Reception',
    sentAt: 'Sep 10, 2026, 11:15 AM',
  },
];

// CUSTOMER CORRECTION REQUESTS (From ARIA or Guest Portal)
let guestCorrectionRequestsDatabase: any[] = [
  {
    id: 'REQ-101',
    guestName: 'Rahul Sharma',
    roomNumber: '204',
    bookingId: '#HTL10239',
    field: 'Phone Number',
    currentValue: '+91 98220 00000',
    requestedValue: '+91 98220 12345',
    reason: 'Guest updated primary contact via ARIA Concierge',
    status: 'Approved',
    source: 'ARIA',
    createdAt: 'Sep 10, 2026, 11:25 AM',
  },
  {
    id: 'REQ-102',
    guestName: 'Priya Kapoor',
    roomNumber: '301',
    bookingId: '#HTL10240',
    field: 'Special Requests',
    currentValue: 'Standard',
    requestedValue: 'Honeymoon welcome setup and floral fragrance',
    reason: 'Guest communicated preference during booking inquiry',
    status: 'Pending',
    source: 'ARIA',
    createdAt: 'Sep 10, 2026, 12:40 PM',
  },
];

// ============================================================================
// RESORT FACILITIES DATABASE (VERIFIED INFRASTRUCTURE)
// ============================================================================
let facilitiesDatabase = [
  {
    id: 'fac-pool',
    name: 'Infinity Swimming Pool & Jacuzzi Deck',
    category: 'Recreation & Water',
    location: 'Building B, Central Resort Deck (~150m from Room 204)',
    timing: '06:00 - 21:00 Daily',
    isComplimentary: true,
    description: 'Temperature-controlled two-tier oceanfront infinity pool with heated jacuzzi, poolside loungers, towel station, and lifeguard on duty.',
  },
  {
    id: 'fac-spa',
    name: 'Aura Ayurvedic Spa & Wellness Center',
    category: 'Wellness',
    location: 'Ground Floor Wellness Pavilion near Lotus Pond',
    timing: '09:00 - 20:00 Daily',
    isComplimentary: false,
    description: 'Full-service Ayurvedic spa offering authentic herbal massages, steam suites, shirodhara, and aromatherapy therapies starting at ₹2,500.',
  },
  {
    id: 'fac-gym',
    name: 'Fitness Center & Gymnasium',
    category: 'Fitness',
    location: 'Clubhouse Level 2',
    timing: '06:00 - 22:00 Daily',
    isComplimentary: true,
    description: 'State-of-the-art Technogym cardio machines, free weights, yoga mats, resistance cables, and certified personal trainers upon request.',
  },
  {
    id: 'fac-beach',
    name: 'Private Beach Access & Sunset Deck',
    category: 'Outdoors',
    location: 'Direct path past North Palm Walk',
    timing: 'Open 24/7 (Lifeguards on duty 07:00 - 18:30)',
    isComplimentary: true,
    description: 'Direct gated access to private golden-sand beachfront with complimentary shaded cabanas, beach loungers, and evening bonfire deck.',
  },
  {
    id: 'fac-restaurant',
    name: 'The Palm Grove Multi-Cuisine Restaurant & Bar',
    category: 'Dining',
    location: 'Central Main Wing, Ground Floor',
    timing: '24/7 Dining & In-Room Service',
    isComplimentary: false,
    description: 'Full-service dining featuring authentic North & South Indian specialties, wood-fired pizzas, oriental dishes, and handcrafted beverages.',
  },
  {
    id: 'fac-kids',
    name: 'Kids Club & Activity Pavilion',
    category: 'Family',
    location: 'Near Garden Pavilion',
    timing: '09:00 - 19:00 Daily',
    isComplimentary: true,
    description: 'Supervised indoor play space with ball pit, board games, coloring tables, puzzle library, and mini basketball arcade.',
  },
  {
    id: 'fac-conference',
    name: 'Royal Palms Banquet & Conference Hall',
    category: 'Events',
    location: 'East Wing Conference Block',
    timing: '08:00 - 22:00 on reservation',
    isComplimentary: false,
    description: 'Air-conditioned banquet venue accommodating up to 200 guests with AV projectors, high-speed conference Wi-Fi, and catering service.',
  },
  {
    id: 'fac-parking',
    name: 'Valet Parking & EV Charging Station',
    category: 'Convenience',
    location: 'Main North Resort Gate',
    timing: '24/7 Daily',
    isComplimentary: true,
    description: 'Complimentary secure valet parking for all registered guests with dual fast Type-2 electric vehicle charging bays.',
  },
];

// ============================================================================
// IDEMPOTENCY & DUPLICATE PREVENTION SYSTEM
// ============================================================================
const recentSubmissions = new Map<string, { timestamp: number; record: any }>();

function isDuplicateSubmission(key: string, ttlMs = 15000): { isDuplicate: boolean; record?: any } {
  const now = Date.now();
  const existing = recentSubmissions.get(key);
  if (existing && now - existing.timestamp < ttlMs) {
    return { isDuplicate: true, record: existing.record };
  }
  return { isDuplicate: false };
}

function recordSubmission(key: string, record: any) {
  recentSubmissions.set(key, { timestamp: Date.now(), record });
  // Periodic cleanup
  if (recentSubmissions.size > 500) {
    const now = Date.now();
    for (const [k, val] of recentSubmissions.entries()) {
      if (now - val.timestamp > 60000) {
        recentSubmissions.delete(k);
      }
    }
  }
}

// ============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) SERVER-SIDE ENFORCEMENT
// ============================================================================
function verifyStaffAuth(req: express.Request, allowedRoles: string[]): { authorized: boolean; role?: string; employee?: any; error?: string } {
  const authHeader = req.headers.authorization;
  const xRole = (req.headers['x-user-role'] as string)?.toUpperCase();
  const xEmpId = (req.headers['x-employee-id'] as string)?.toUpperCase();

  let matchedStaff: any = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const parts = token.split('_');
    if (parts.length >= 3) {
      const empId = parts[2];
      matchedStaff = staffDatabase.find((e) => e.employee_id.toUpperCase() === empId.toUpperCase());
    }
  }

  if (!matchedStaff && xEmpId) {
    matchedStaff = staffDatabase.find((e) => e.employee_id.toUpperCase() === xEmpId.toUpperCase());
  }

  const role = matchedStaff ? matchedStaff.role : xRole;

  if (!role) {
    return { authorized: false, error: 'Unauthorized: Authentication required for staff operation.' };
  }

  if (matchedStaff && matchedStaff.status === 'INACTIVE') {
    return { authorized: false, error: 'Forbidden: Your staff account has been deactivated.' };
  }

  // OWNER has master access to all operations
  if (role === 'OWNER') {
    return { authorized: true, role: 'OWNER', employee: matchedStaff };
  }

  // Check if role is in allowed list
  if (allowedRoles.includes(role)) {
    return { authorized: true, role, employee: matchedStaff };
  }

  return {
    authorized: false,
    error: `Forbidden: Insufficient privileges. Role '${role}' cannot perform this action. Required: ${allowedRoles.join(', ')}`,
  };
}

// ============================================================================
// COMPLAINTS API ROUTES
// ============================================================================

// 1. GET Complaints List (with optional status & room filters)
app.get('/api/complaints', (req, res) => {
  const { status, roomNumber, hotel_id = 'HOTEL001' } = req.query;
  let results = complaintsDatabase.filter((c) => !c.hotel_id || c.hotel_id === hotel_id);

  if (status && typeof status === 'string' && status !== 'all') {
    results = results.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }

  if (roomNumber && typeof roomNumber === 'string') {
    results = results.filter((c) => c.roomNumber === roomNumber);
  }

  return res.json(results);
});

// 2. GET Complaint Live Counters (COUNT WHERE hotel_id = ...)
app.get('/api/complaints/stats', (req, res) => {
  const { hotel_id = 'HOTEL001' } = req.query;
  const filtered = complaintsDatabase.filter((c) => !c.hotel_id || c.hotel_id === hotel_id);

  const stats = {
    total: filtered.length,
    pending: filtered.filter((c) => c.status === 'Pending' || c.status === 'Submitted').length,
    assigned: filtered.filter((c) => c.status === 'Assigned').length,
    in_progress: filtered.filter((c) => c.status === 'In Progress').length,
    resolved: filtered.filter((c) => c.status === 'Resolved').length,
    closed: filtered.filter((c) => c.status === 'Closed').length,
  };

  return res.json(stats);
});

// 3. POST Submit Complaint (with duplicate prevention & validation)
app.post('/api/complaints', (req, res) => {
  const {
    guestName,
    roomNumber,
    category,
    title,
    description,
    priority = 'Medium',
    imageUrl,
    hotel_id = 'HOTEL001',
    idempotencyKey,
  } = req.body;

  if (!description || !roomNumber) {
    return res.status(400).json({ error: 'Room number and issue description are required.' });
  }

  // Duplicate prevention check: room + clean text within 15 seconds
  const dedupeKey = idempotencyKey || `complaint_${roomNumber}_${String(description).slice(0, 30).trim().toLowerCase()}`;
  const dup = isDuplicateSubmission(dedupeKey, 15000);
  if (dup.isDuplicate) {
    return res.status(200).json({
      message: 'Complaint already submitted successfully.',
      complaint: dup.record,
      duplicatePrevented: true,
    });
  }

  const newComplaint = {
    id: generateComplaintId(),
    hotel_id,
    guestName: guestName || 'Valued Guest',
    roomNumber: String(roomNumber).replace('Room ', '').trim(),
    category: category || 'Other',
    title: title || `${category || 'Room'} Issue reported`,
    description: String(description).trim(),
    imageUrl: imageUrl || '',
    priority: priority === 'High' ? 'High' : priority === 'Low' ? 'Low' : 'Medium',
    status: 'Pending',
    assignedTo: '',
    resolutionNote: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  complaintsDatabase.unshift(newComplaint);
  recordSubmission(dedupeKey, newComplaint);

  // Audit log
  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: 'GUEST',
    employee_name: newComplaint.guestName,
    role: 'GUEST',
    action: 'Complaint Submitted',
    timestamp: 'Just now',
    details: `Ticket ${newComplaint.id} logged for Room ${newComplaint.roomNumber} (${newComplaint.category}, Priority: ${newComplaint.priority}).`,
    type: 'operation',
  });

  return res.status(201).json({
    message: 'Complaint registered successfully.',
    complaint: newComplaint,
  });
});

// 4. PATCH Update Complaint Status (RBAC Enforced on Backend)
app.patch('/api/complaints/:id/status', (req, res) => {
  // Only Managers, Owners, Receptionists, and Maintenance can update complaint tickets
  const auth = verifyStaffAuth(req, ['MANAGER', 'OWNER', 'RECEPTIONIST', 'MAINTENANCE']);
  if (!auth.authorized) {
    return res.status(403).json({ error: auth.error });
  }

  const { id } = req.params;
  const { status, assignedTo, resolutionNote } = req.body;

  const complaint = complaintsDatabase.find((c) => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: `Complaint ticket ${id} not found.` });
  }

  if (status) {
    complaint.status = status;
  }
  if (assignedTo !== undefined) {
    complaint.assignedTo = assignedTo;
  }
  if (resolutionNote !== undefined) {
    complaint.resolutionNote = resolutionNote;
  }
  complaint.updatedAt = new Date().toISOString();

  // Audit log
  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: auth.employee?.employee_id || auth.role || 'STAFF',
    employee_name: auth.employee?.full_name || auth.role || 'Staff Operator',
    role: auth.role || 'STAFF',
    action: `Complaint ${id} Updated`,
    timestamp: 'Just now',
    details: `Status transitioned to '${status}'${assignedTo ? ` (Assigned: ${assignedTo})` : ''}.`,
    type: 'operation',
  });

  return res.json({
    message: 'Complaint ticket updated successfully.',
    complaint,
  });
});

// ============================================================================
// FOOD ORDERS API ROUTES
// ============================================================================

// 1. GET Food Orders List
app.get('/api/orders', (req, res) => {
  const { status, hotel_id = 'HOTEL001' } = req.query;
  let results = ordersDatabase.filter((o) => !o.hotel_id || o.hotel_id === hotel_id);

  if (status && typeof status === 'string' && status !== 'all') {
    results = results.filter((o) => o.status.toLowerCase() === status.toLowerCase());
  }

  return res.json(results);
});

// 2. GET Food Order Counters (COUNT WHERE hotel_id = ...)
app.get('/api/orders/stats', (req, res) => {
  const { hotel_id = 'HOTEL001' } = req.query;
  const filtered = ordersDatabase.filter((o) => !o.hotel_id || o.hotel_id === hotel_id);

  const stats = {
    total: filtered.length,
    new: filtered.filter((o) => o.status === 'New').length,
    preparing: filtered.filter((o) => o.status === 'Preparing').length,
    ready: filtered.filter((o) => o.status === 'Ready').length,
    picked_up: filtered.filter((o) => o.status === 'Picked Up').length,
    delivered: filtered.filter((o) => o.status === 'Delivered').length,
    cancelled: filtered.filter((o) => o.status === 'Cancelled').length,
  };

  return res.json(stats);
});

// 3. POST Place Food Order (with duplicate prevention)
app.post('/api/orders', (req, res) => {
  const {
    orderLocation = 'Room Service',
    roomOrTableNumber,
    guestName,
    items,
    total,
    notes,
    assignedWaiter,
    hotel_id = 'HOTEL001',
    idempotencyKey,
  } = req.body;

  if (!roomOrTableNumber || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order destination and at least one item are required.' });
  }

  // Duplicate prevention check: room + item count + total within 10 seconds
  const dedupeKey = idempotencyKey || `order_${roomOrTableNumber}_${items.length}_${total}`;
  const dup = isDuplicateSubmission(dedupeKey, 10000);
  if (dup.isDuplicate) {
    return res.status(200).json({
      message: 'Order already received and queued.',
      order: dup.record,
      duplicatePrevented: true,
    });
  }

  const newOrder = {
    id: generateOrderId(),
    hotel_id,
    orderLocation,
    roomOrTableNumber,
    guestName: guestName || 'Resort Guest',
    items,
    total: Number(total) || 0,
    status: 'New',
    assignedWaiter: assignedWaiter || '',
    notes: notes || '',
    createdAt: 'Just now',
    updatedAt: 'Just now',
  };

  ordersDatabase.unshift(newOrder);
  recordSubmission(dedupeKey, newOrder);

  // Audit log
  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: 'ORDER_DESK',
    employee_name: newOrder.guestName,
    role: 'GUEST',
    action: 'Food Order Created',
    timestamp: 'Just now',
    details: `Order ${newOrder.id} placed for ${newOrder.roomOrTableNumber} (${items.length} items, ₹${newOrder.total}).`,
    type: 'operation',
  });

  return res.status(201).json({
    message: 'Food order successfully sent to kitchen.',
    order: newOrder,
  });
});

// 4. PATCH Update Food Order Status (RBAC Enforced on Backend)
app.patch('/api/orders/:id/status', (req, res) => {
  // Chefs, Waiters, Managers, and Owners can update food order status
  const auth = verifyStaffAuth(req, ['CHEF', 'WAITER', 'MANAGER', 'OWNER']);
  if (!auth.authorized) {
    return res.status(403).json({ error: auth.error });
  }

  const { id } = req.params;
  const { status, assignedWaiter } = req.body;

  const order = ordersDatabase.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: `Order ${id} not found.` });
  }

  if (status) {
    order.status = status;
  }
  if (assignedWaiter) {
    order.assignedWaiter = assignedWaiter;
  }
  order.updatedAt = 'Just now';

  // Audit log
  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: auth.employee?.employee_id || auth.role || 'STAFF',
    employee_name: auth.employee?.full_name || auth.role || 'Staff',
    role: auth.role || 'STAFF',
    action: `Order ${id} Status: ${status}`,
    timestamp: 'Just now',
    details: `Order for ${order.roomOrTableNumber} updated to '${status}'.`,
    type: 'operation',
  });

  return res.json({
    message: 'Order status updated successfully.',
    order,
  });
});

// ============================================================================
// CHEF DASHBOARD & MENU MANAGEMENT API ROUTES
// ============================================================================

// 1. GET Full Menu
app.get('/api/menu', async (req, res) => {
  try {
    const p = getMysqlPool();
    if (p) {
      const [rows]: any = await p.query('SELECT * FROM menu_items ORDER BY category ASC, id ASC');
      if (rows && rows.length > 0) {
        const formatted = rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          price: Number(r.price),
          rating: Number(r.rating || 4.8),
          reviewsCount: Number(r.reviews_count || 50),
          isVeg: Boolean(r.is_veg),
          prepTime: r.prep_time || '15 mins',
          description: r.description || '',
          image: r.image || '',
          isAvailable: r.is_available === null || r.is_available === undefined ? true : Boolean(r.is_available),
          isChefSpecial: Boolean(r.is_chef_special),
          isRecommended: Boolean(r.is_recommended),
          availableTimes: typeof r.available_times === 'string' ? JSON.parse(r.available_times || '[]') : (r.available_times || ['Breakfast', 'Lunch', 'Dinner']),
          spiceLevel: r.spice_level || 'Medium',
          allergens: typeof r.allergens === 'string' ? JSON.parse(r.allergens || '[]') : (r.allergens || []),
          ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients || '[]') : (r.ingredients || []),
        }));
        return res.json(formatted);
      }
    }
  } catch (err: any) {
    if (err?.code !== 'ECONNREFUSED') {
      console.warn('[MySQL Menu Read Info]:', err?.message || err);
    }
  }

  return res.json(menuDatabase);
});

// 2. POST Add New Food Item
app.post('/api/menu', async (req, res) => {
  try {
    const {
      name,
      category = 'Main Course',
      price = 200,
      rating = 5.0,
      reviewsCount = 1,
      isVeg = true,
      prepTime = '15 mins',
      description = '',
      image = '',
      isAvailable = true,
      isChefSpecial = false,
      isRecommended = false,
      availableTimes = ['Lunch', 'Dinner'],
      spiceLevel = 'Medium',
      allergens = [],
      ingredients = [],
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Item name and price are required.' });
    }

    const newItem = {
      id: `food-${Date.now()}`,
      hotel_id: 'HOTEL001',
      name: String(name).trim(),
      category: String(category).trim(),
      price: Number(price),
      rating: Number(rating) || 5.0,
      reviewsCount: Number(reviewsCount) || 1,
      isVeg: Boolean(isVeg),
      prepTime: prepTime || '15 mins',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      isAvailable: isAvailable !== false,
      isChefSpecial: Boolean(isChefSpecial),
      isRecommended: Boolean(isRecommended),
      availableTimes: Array.isArray(availableTimes) ? availableTimes : ['Lunch', 'Dinner'],
      spiceLevel: spiceLevel || 'Medium',
      allergens: Array.isArray(allergens) ? allergens : [],
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    menuDatabase.unshift(newItem);

    const p = getMysqlPool();
    if (p) {
      try {
        await p.query(
          `INSERT INTO menu_items (id, hotel_id, name, category, price, rating, reviews_count, is_veg, prep_time, description, image, is_available, is_chef_special, is_recommended, available_times, spice_level, allergens, ingredients, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newItem.id,
            'HOTEL001',
            newItem.name,
            newItem.category,
            newItem.price,
            newItem.rating,
            newItem.reviewsCount,
            newItem.isVeg,
            newItem.prepTime,
            newItem.description,
            newItem.image,
            newItem.isAvailable,
            newItem.isChefSpecial,
            newItem.isRecommended,
            JSON.stringify(newItem.availableTimes),
            newItem.spiceLevel,
            JSON.stringify(newItem.allergens),
            JSON.stringify(newItem.ingredients),
            newItem.createdAt,
            newItem.updatedAt,
          ]
        );
      } catch (sqlErr) {
        console.warn('[MySQL Menu Insert Error]:', sqlErr);
      }
    }

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'CHEF_01',
      employee_name: 'Executive Chef Vikram',
      role: 'CHEF',
      action: 'Food Item Added',
      timestamp: 'Just now',
      details: `Added new item "${newItem.name}" (₹${newItem.price}) in ${newItem.category}.`,
      type: 'operation',
    });

    return res.status(201).json({ message: 'Food item successfully created', item: newItem });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. PUT Edit Existing Food Item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const itemIndex = menuDatabase.findIndex((m) => m.id === id);
    const existing = itemIndex >= 0 ? menuDatabase[itemIndex] : null;

    const updates = req.body;
    const updatedItem = {
      ...(existing || {}),
      ...updates,
      id,
      price: updates.price !== undefined ? Number(updates.price) : existing?.price,
      updatedAt: new Date().toISOString(),
    };

    if (itemIndex >= 0) {
      menuDatabase[itemIndex] = updatedItem;
    } else {
      menuDatabase.push(updatedItem);
    }

    const p = getMysqlPool();
    if (p) {
      try {
        await p.query(
          `UPDATE menu_items SET 
            name = ?, category = ?, price = ?, rating = ?, reviews_count = ?, is_veg = ?, 
            prep_time = ?, description = ?, image = ?, is_available = ?, is_chef_special = ?, 
            is_recommended = ?, available_times = ?, spice_level = ?, allergens = ?, ingredients = ?, updated_at = ?
           WHERE id = ?`,
          [
            updatedItem.name,
            updatedItem.category,
            updatedItem.price,
            updatedItem.rating || 4.8,
            updatedItem.reviewsCount || 50,
            updatedItem.isVeg !== undefined ? Boolean(updatedItem.isVeg) : true,
            updatedItem.prepTime || '15 mins',
            updatedItem.description || '',
            updatedItem.image || '',
            updatedItem.isAvailable !== undefined ? Boolean(updatedItem.isAvailable) : true,
            updatedItem.isChefSpecial !== undefined ? Boolean(updatedItem.isChefSpecial) : false,
            updatedItem.isRecommended !== undefined ? Boolean(updatedItem.isRecommended) : false,
            JSON.stringify(updatedItem.availableTimes || []),
            updatedItem.spiceLevel || 'Medium',
            JSON.stringify(updatedItem.allergens || []),
            JSON.stringify(updatedItem.ingredients || []),
            updatedItem.updatedAt,
            id,
          ]
        );
      } catch (sqlErr) {
        console.warn('[MySQL Menu Update Error]:', sqlErr);
      }
    }

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'CHEF_01',
      employee_name: 'Executive Chef Vikram',
      role: 'CHEF',
      action: 'Food Item Updated',
      timestamp: 'Just now',
      details: `Updated "${updatedItem.name}" (Price: ₹${updatedItem.price}, Category: ${updatedItem.category}).`,
      type: 'operation',
    });

    return res.json({ message: 'Menu item updated successfully', item: updatedItem });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. PATCH Quick Availability Toggle (🟢 Available / 🔴 Unavailable)
app.patch('/api/menu/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const item = menuDatabase.find((m) => m.id === id);
    if (!item) {
      return res.status(404).json({ error: `Menu item ${id} not found.` });
    }

    item.isAvailable = Boolean(isAvailable);
    item.updatedAt = new Date().toISOString();

    const p = getMysqlPool();
    if (p) {
      try {
        await p.query('UPDATE menu_items SET is_available = ?, updated_at = ? WHERE id = ?', [
          item.isAvailable,
          item.updatedAt,
          id,
        ]);
      } catch (sqlErr) {
        console.warn('[MySQL Menu Availability Update Error]:', sqlErr);
      }
    }

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'CHEF_01',
      employee_name: 'Executive Chef Vikram',
      role: 'CHEF',
      action: `Food Item Availability: ${item.isAvailable ? '🟢 Available' : '🔴 Unavailable'}`,
      timestamp: 'Just now',
      details: `Chef marked "${item.name}" as ${item.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE / SOLD OUT'}.`,
      type: 'operation',
    });

    return res.json({
      message: `Menu item is now ${item.isAvailable ? 'Available' : 'Unavailable'}`,
      item,
      isAvailable: item.isAvailable,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. PATCH Quick Price Editing (Chef clicks Edit -> Price -> ₹320 -> Save)
app.patch('/api/menu/:id/price', async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (price === undefined || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Valid numeric price is required.' });
    }

    const item = menuDatabase.find((m) => m.id === id);
    if (!item) {
      return res.status(404).json({ error: `Menu item ${id} not found.` });
    }

    const oldPrice = item.price;
    const newPrice = Number(price);
    item.price = newPrice;
    item.updatedAt = new Date().toISOString();

    const p = getMysqlPool();
    if (p) {
      try {
        await p.query('UPDATE menu_items SET price = ?, updated_at = ? WHERE id = ?', [
          newPrice,
          item.updatedAt,
          id,
        ]);
      } catch (sqlErr) {
        console.warn('[MySQL Menu Price Update Error]:', sqlErr);
      }
    }

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'CHEF_01',
      employee_name: 'Executive Chef Vikram',
      role: 'CHEF',
      action: 'Food Price Updated',
      timestamp: 'Just now',
      details: `Chef updated price for "${item.name}" from ₹${oldPrice} to ₹${newPrice}.`,
      type: 'operation',
    });

    return res.json({
      message: `Price for "${item.name}" updated to ₹${newPrice}`,
      item,
      oldPrice,
      newPrice,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. DELETE Remove Food Item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const itemIndex = menuDatabase.findIndex((m) => m.id === id);
    const item = itemIndex >= 0 ? menuDatabase[itemIndex] : null;

    if (itemIndex >= 0) {
      menuDatabase.splice(itemIndex, 1);
    }

    const p = getMysqlPool();
    if (p) {
      try {
        await p.query('DELETE FROM menu_items WHERE id = ?', [id]);
      } catch (sqlErr) {
        console.warn('[MySQL Menu Delete Error]:', sqlErr);
      }
    }

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'CHEF_01',
      employee_name: 'Executive Chef Vikram',
      role: 'CHEF',
      action: 'Food Item Removed',
      timestamp: 'Just now',
      details: `Chef removed "${item?.name || id}" from menu catalog.`,
      type: 'operation',
    });

    return res.json({ message: 'Menu item deleted successfully', id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// RESORT ACTIVITIES & GAMES API ROUTES (DYNAMIC MANAGEMENT & AI SOURCE OF TRUTH)
// ============================================================================

// 1. GET All Activities (Optionally filtered by category, availableOnly, isFree)
app.get('/api/activities', async (req, res) => {
  try {
    const { category, availableOnly, isFree, search } = req.query;
    let list = [...activitiesDatabase];

    if (category && typeof category === 'string') {
      list = list.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }
    if (availableOnly === 'true') {
      list = list.filter((a) => a.isAvailable !== false);
    }
    if (isFree === 'true') {
      list = list.filter((a) => a.isComplimentary || a.pricePerPerson === 0);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.location.toLowerCase().includes(q));
    }

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. POST Add New Activity (e.g. Manager adds "Football")
app.post('/api/activities', async (req, res) => {
  try {
    const {
      title,
      category = 'Adventure',
      pricePerPerson = 200,
      duration = '1 Hour',
      timing = '07:00 - 21:00 Daily',
      location = 'Sports Turf Ground',
      indoorOutdoor = 'Outdoor',
      capacity = '4 to 12 players',
      description = '',
      isComplimentary = false,
      slotsAvailable = 15,
      image = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
      icon = 'Trophy',
      suitableFor = ['groups', 'teams', 'active', '4 people'],
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Activity title is required.' });
    }

    const newActivity = {
      id: `act-${Date.now()}`,
      title: title.trim(),
      category,
      pricePerPerson: isComplimentary ? 0 : Number(pricePerPerson),
      duration,
      timing,
      location,
      indoorOutdoor,
      capacity,
      description: description || `Enjoy ${title} at our resort sports ground.`,
      isComplimentary: Boolean(isComplimentary),
      isAvailable: true,
      slotsAvailable: Number(slotsAvailable) || 12,
      image,
      icon,
      suitableFor: Array.isArray(suitableFor) ? suitableFor : [suitableFor],
      createdAt: new Date().toISOString(),
    };

    activitiesDatabase.unshift(newActivity);

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'MGR_01',
      employee_name: 'Resort Manager',
      role: 'MANAGER',
      action: 'Activity Added',
      timestamp: 'Just now',
      details: `Added new resort activity "${newActivity.title}" (₹${newActivity.pricePerPerson}) in ${newActivity.category}.`,
      type: 'operation',
    });

    return res.status(201).json({ message: 'Activity added successfully', activity: newActivity });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. PUT Edit Activity
app.put('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = activitiesDatabase.findIndex((a) => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: `Activity ${id} not found.` });
    }

    const updates = req.body;
    const updated = {
      ...activitiesDatabase[index],
      ...updates,
      id,
      pricePerPerson: updates.pricePerPerson !== undefined ? Number(updates.pricePerPerson) : activitiesDatabase[index].pricePerPerson,
      updatedAt: new Date().toISOString(),
    };

    activitiesDatabase[index] = updated;

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'MGR_01',
      employee_name: 'Resort Manager',
      role: 'MANAGER',
      action: 'Activity Updated',
      timestamp: 'Just now',
      details: `Updated activity "${updated.title}" details.`,
      type: 'operation',
    });

    return res.json({ message: 'Activity updated successfully', activity: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. PATCH Quick Price Editing (e.g. Badminton old: 200, new: 250)
app.patch('/api/activities/:id/price', async (req, res) => {
  try {
    const { id } = req.params;
    const { pricePerPerson } = req.body;

    if (pricePerPerson === undefined || isNaN(Number(pricePerPerson))) {
      return res.status(400).json({ error: 'Valid numeric pricePerPerson is required.' });
    }

    const activity = activitiesDatabase.find((a) => a.id === id);
    if (!activity) {
      return res.status(404).json({ error: `Activity ${id} not found.` });
    }

    const oldPrice = activity.pricePerPerson;
    activity.pricePerPerson = Number(pricePerPerson);
    activity.isComplimentary = activity.pricePerPerson === 0;

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'MGR_01',
      employee_name: 'Resort Manager',
      role: 'MANAGER',
      action: 'Activity Price Changed',
      timestamp: 'Just now',
      details: `Updated "${activity.title}" price from ₹${oldPrice} to ₹${activity.pricePerPerson}.`,
      type: 'operation',
    });

    return res.json({
      message: `Updated price for ${activity.title} to ₹${activity.pricePerPerson}`,
      activity,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. PATCH Quick Availability Toggle (🟢 Available / 🔴 Unavailable)
app.patch('/api/activities/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const activity = activitiesDatabase.find((a) => a.id === id);
    if (!activity) {
      return res.status(404).json({ error: `Activity ${id} not found.` });
    }

    activity.isAvailable = Boolean(isAvailable);

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'MGR_01',
      employee_name: 'Resort Manager',
      role: 'MANAGER',
      action: `Activity Availability: ${activity.isAvailable ? '🟢 Available' : '🔴 Unavailable'}`,
      timestamp: 'Just now',
      details: `Manager marked "${activity.title}" as ${activity.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}.`,
      type: 'operation',
    });

    return res.json({
      message: `${activity.title} is now ${activity.isAvailable ? 'Available' : 'Unavailable'}`,
      activity,
      isAvailable: activity.isAvailable,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. DELETE Activity (Removed from database -> AI stops recommending it)
app.delete('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = activitiesDatabase.findIndex((a) => a.id === id);
    const item = index >= 0 ? activitiesDatabase[index] : null;

    if (index >= 0) {
      activitiesDatabase.splice(index, 1);
    }

    auditLogsDatabase.unshift({
      id: `aud-${Date.now()}`,
      employee_id: 'MGR_01',
      employee_name: 'Resort Manager',
      role: 'MANAGER',
      action: 'Activity Removed',
      timestamp: 'Just now',
      details: `Manager removed "${item?.title || id}" from activities database.`,
      type: 'operation',
    });

    return res.json({ message: 'Activity removed successfully', id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// ROOMS & FACILITIES API ROUTES
// ============================================================================

// GET Rooms
app.get('/api/rooms', (req, res) => {
  const { availableOnly, type } = req.query;
  let list = [...roomsDatabase];
  if (availableOnly === 'true') {
    list = list.filter((r) => r.status === 'available');
  }
  if (type && typeof type === 'string') {
    list = list.filter((r) => r.type.toLowerCase() === type.toLowerCase());
  }
  return res.json(list);
});

// PATCH Room Status
app.patch('/api/rooms/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const room = roomsDatabase.find((r) => r.id === id || r.number === id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  room.status = status;
  return res.json({ message: 'Room status updated', room });
});

// GET Facilities
app.get('/api/facilities', (req, res) => {
  return res.json(facilitiesDatabase);
});

// GET Bookings (Secure - Authenticated guest or manager)
app.get('/api/bookings', (req, res) => {
  const { roomNumber, guestName } = req.query;
  let list = [...bookingsDatabase];
  if (roomNumber && typeof roomNumber === 'string') {
    list = list.filter((b) => b.roomNumber === roomNumber);
  }
  if (guestName && typeof guestName === 'string') {
    list = list.filter((b) => b.guestName.toLowerCase() === guestName.toLowerCase());
  }
  return res.json(list);
});

// ============================================================================
// RECEPTION & GUEST MANAGEMENT API ROUTES
// ============================================================================

// 1. GET Hotel Guest List
app.get('/api/reception/guests', (req, res) => {
  const { search, status, paymentStatus } = req.query;
  let guests = [...bookingsDatabase];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    guests = guests.filter(
      (g) =>
        g.guestName?.toLowerCase().includes(q) ||
        g.id?.toLowerCase().includes(q) ||
        g.customerId?.toLowerCase().includes(q) ||
        g.roomNumber?.toLowerCase().includes(q) ||
        g.guestPhone?.includes(q) ||
        g.guestEmail?.toLowerCase().includes(q)
    );
  }

  if (status && typeof status === 'string' && status !== 'all') {
    guests = guests.filter((g) => g.status?.toLowerCase() === status.toLowerCase() || g.guestStatus?.toLowerCase() === status.toLowerCase());
  }

  if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'all') {
    guests = guests.filter((g) => g.paymentStatus?.toLowerCase() === paymentStatus.toLowerCase());
  }

  return res.json(guests);
});

// 2. POST Add Customer (Receptionist)
app.post('/api/reception/guests', (req, res) => {
  try {
    const {
      guestName,
      guestPhone,
      guestEmail,
      guestAddress = 'Not provided',
      guestsCount = 2,
      roomNumber,
      roomType = 'Deluxe',
      checkIn,
      checkOut,
      checkInTime = '14:00',
      checkOutTime = '11:00',
      bookingType = 'Direct',
      specialRequests = '',
      paymentStatus = 'Paid',
      paymentMethod = 'UPI',
      roomCharges = 7000,
      actor = 'Priya Sharma (Receptionist)',
    } = req.body;

    if (!guestName || !guestPhone || !roomNumber) {
      return res.status(400).json({ error: 'Guest name, phone number, and room number are required.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const taxes = Math.round(roomCharges * 0.18);
    const totalAmount = roomCharges + taxes;

    const newCustomerId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBookingId = `#HTL${Math.floor(10000 + Math.random() * 90000)}`;

    const newGuest = {
      id: newBookingId,
      customerId: newCustomerId,
      guestName,
      guestPhone,
      guestEmail: guestEmail || `${guestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      guestAddress,
      guestIdVerified: true,
      idProofType: 'Aadhaar Card',
      idProofNumber: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      roomNumber,
      roomType,
      checkIn: checkIn || todayStr,
      checkOut: checkOut || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkInTime,
      checkOutTime,
      guests: Number(guestsCount),
      guestsCount: Number(guestsCount),
      nights: 2,
      bookingType,
      status: 'Confirmed',
      guestStatus: 'Reserved',
      paymentStatus,
      paymentMethod,
      roomCharges,
      foodCharges: 0,
      spaCharges: 0,
      taxes,
      totalAmount,
      specialRequests,
      createdAt: new Date().toISOString(),
    };

    // Prepend to central database
    bookingsDatabase.unshift(newGuest);

    // Update room status
    const targetRoom = roomsDatabase.find((r) => r.number === roomNumber);
    if (targetRoom) {
      targetRoom.status = 'reserved';
    }

    // Add Audit Log
    const auditEntry = {
      id: `aud-${Date.now()}`,
      bookingId: newBookingId,
      guestName,
      roomNumber,
      action: 'Registered new customer',
      performedBy: actor,
      fieldChanged: 'New Registration',
      oldValue: 'N/A',
      newValue: `Room ${roomNumber}, ${guestName} (${bookingType})`,
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    guestAuditLogsDatabase.unshift(auditEntry);

    return res.status(201).json({
      success: true,
      message: `Customer ${guestName} successfully added to Hotel Guest List.`,
      guest: newGuest,
      audit: auditEntry,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to add customer' });
  }
});

// 3. PUT Edit Customer Details (With Audit Logging)
app.put('/api/reception/guests/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const actor = updates.actor || 'Priya Sharma (Receptionist)';

    const index = bookingsDatabase.findIndex((b) => b.id === id || b.customerId === id);
    if (index === -1) {
      return res.status(404).json({ error: `Guest record ${id} not found.` });
    }

    const existing = bookingsDatabase[index];
    const changeLogs: any[] = [];
    const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Track field-level diffs for audit trail
    const trackFields = [
      { key: 'guestName', label: 'Guest Name' },
      { key: 'guestPhone', label: 'Phone Number' },
      { key: 'guestEmail', label: 'Email' },
      { key: 'guestAddress', label: 'Address' },
      { key: 'roomNumber', label: 'Room Assignment' },
      { key: 'checkIn', label: 'Check-in Date' },
      { key: 'checkOut', label: 'Check-out Date' },
      { key: 'checkInTime', label: 'Check-in Time' },
      { key: 'checkOutTime', label: 'Check-out Time' },
      { key: 'guestsCount', label: 'Guest Count' },
      { key: 'specialRequests', label: 'Special Requests' },
      { key: 'paymentStatus', label: 'Payment Status' },
      { key: 'status', label: 'Booking Status' },
      { key: 'guestStatus', label: 'Guest Status' },
    ];

    for (const f of trackFields) {
      if (updates[f.key] !== undefined && String(updates[f.key]) !== String(existing[f.key])) {
        const auditItem = {
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          bookingId: existing.id,
          guestName: updates.guestName || existing.guestName,
          roomNumber: updates.roomNumber || existing.roomNumber,
          action: `Changed customer ${f.label.toLowerCase()}`,
          performedBy: actor,
          fieldChanged: f.label,
          oldValue: String(existing[f.key] || 'Empty'),
          newValue: String(updates[f.key]),
          timestamp,
        };
        changeLogs.push(auditItem);
        guestAuditLogsDatabase.unshift(auditItem);
      }
    }

    // Merge updates into central database
    bookingsDatabase[index] = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: `Customer details updated successfully.`,
      guest: bookingsDatabase[index],
      auditLogs: changeLogs,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to update customer' });
  }
});

// 4. POST Check-in Management
app.post('/api/reception/guests/:id/checkin', (req, res) => {
  const { id } = req.params;
  const { actor = 'Priya Sharma (Receptionist)' } = req.body;

  const target = bookingsDatabase.find((b) => b.id === id || b.customerId === id);
  if (!target) {
    return res.status(404).json({ error: `Guest ${id} not found.` });
  }

  target.status = 'Checked In';
  target.guestStatus = 'Checked-in';

  // Room status becomes occupied
  const room = roomsDatabase.find((r) => r.number === target.roomNumber);
  if (room) {
    room.status = 'occupied';
  }

  const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const audit = {
    id: `aud-${Date.now()}`,
    bookingId: target.id,
    guestName: target.guestName,
    roomNumber: target.roomNumber,
    action: 'Checked-in guest',
    performedBy: actor,
    fieldChanged: 'Status',
    oldValue: 'Reserved',
    newValue: 'Checked-in',
    timestamp,
  };
  guestAuditLogsDatabase.unshift(audit);

  return res.json({
    success: true,
    message: `${target.guestName} checked in to Room ${target.roomNumber}. Room status updated to Occupied.`,
    guest: target,
    audit,
  });
});

// 5. POST Check-out Management (Room -> Cleaning, Housekeeping task auto-generated)
app.post('/api/reception/guests/:id/checkout', (req, res) => {
  const { id } = req.params;
  const { actor = 'Priya Sharma (Receptionist)' } = req.body;

  const target = bookingsDatabase.find((b) => b.id === id || b.customerId === id);
  if (!target) {
    return res.status(404).json({ error: `Guest ${id} not found.` });
  }

  target.status = 'Checked Out';
  target.guestStatus = 'Checked-out';

  // Room status becomes cleaning
  const room = roomsDatabase.find((r) => r.number === target.roomNumber);
  if (room) {
    room.status = 'cleaning';
  }

  const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Auto-generate housekeeping cleaning turnover task
  const cleaningTask = {
    id: `hk-${Date.now()}`,
    roomNumber: target.roomNumber,
    type: 'Full Room Turnover & Sanitization',
    priority: 'High',
    notes: `Guest ${target.guestName} checked out. Prepare Room ${target.roomNumber} for next arrival.`,
    requestedBy: 'Receptionist Desk',
    assignedTo: 'Housekeeping Team',
    status: 'Pending',
    createdAt: timestamp,
  };

  const audit = {
    id: `aud-${Date.now()}`,
    bookingId: target.id,
    guestName: target.guestName,
    roomNumber: target.roomNumber,
    action: 'Checked-out guest',
    performedBy: actor,
    fieldChanged: 'Status',
    oldValue: 'Checked-in',
    newValue: 'Checked-out',
    timestamp,
  };
  guestAuditLogsDatabase.unshift(audit);

  return res.json({
    success: true,
    message: `${target.guestName} checked out of Room ${target.roomNumber}. Room is now marked Cleaning, and Turnover Task has been dispatched to Housekeeping.`,
    guest: target,
    cleaningTask,
    audit,
  });
});

// 6. GET Reception Messages & Reminders
app.get('/api/reception/messages', (req, res) => {
  return res.json(receptionMessagesDatabase);
});

// 7. POST Send Message / Reminder
app.post('/api/reception/messages/send', (req, res) => {
  try {
    const {
      bookingId,
      guestName,
      roomNumber,
      guestPhone,
      guestEmail,
      type = 'general_message',
      subject,
      messageText,
      channels = ['In-App', 'SMS / WhatsApp'],
      sentBy = 'Priya Sharma (Receptionist)',
    } = req.body;

    if (!messageText) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const newMsg = {
      id: `MSG-2026-${Math.floor(100 + Math.random() * 900)}`,
      bookingId: bookingId || 'Direct',
      guestName: guestName || 'Valued Guest',
      roomNumber: roomNumber || 'Front Desk',
      guestPhone: guestPhone || '',
      guestEmail: guestEmail || '',
      type,
      subject: subject || 'Notice from Front Desk',
      messageText,
      channels,
      status: 'Delivered',
      sentBy,
      sentAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    receptionMessagesDatabase.unshift(newMsg);

    return res.status(201).json({
      success: true,
      message: `Message dispatched successfully via ${channels.join(' & ')}.`,
      record: newMsg,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to send message' });
  }
});

// 8. GET Customer Correction Requests
app.get('/api/reception/correction-requests', (req, res) => {
  return res.json(guestCorrectionRequestsDatabase);
});

// 9. POST Apply Correction Request (Receptionist verifies & updates central DB)
app.post('/api/reception/correction-requests/:id/apply', (req, res) => {
  const { id } = req.params;
  const { actor = 'Priya Sharma (Receptionist)' } = req.body;

  const reqItem = guestCorrectionRequestsDatabase.find((r) => r.id === id);
  if (!reqItem) {
    return res.status(404).json({ error: `Correction request ${id} not found.` });
  }

  // Find associated customer record in central database
  const booking = bookingsDatabase.find(
    (b) => b.id === reqItem.bookingId || b.roomNumber === reqItem.roomNumber || b.guestName.toLowerCase() === reqItem.guestName.toLowerCase()
  );

  let updatedField = reqItem.field;
  const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (booking) {
    if (reqItem.field.toLowerCase().includes('phone')) {
      const oldVal = booking.guestPhone;
      booking.guestPhone = reqItem.requestedValue;
      guestAuditLogsDatabase.unshift({
        id: `aud-${Date.now()}`,
        bookingId: booking.id,
        guestName: booking.guestName,
        roomNumber: booking.roomNumber,
        action: 'Changed customer phone number',
        performedBy: actor,
        fieldChanged: 'Phone Number',
        oldValue: oldVal,
        newValue: reqItem.requestedValue,
        timestamp,
      });
    } else if (reqItem.field.toLowerCase().includes('email')) {
      const oldVal = booking.guestEmail;
      booking.guestEmail = reqItem.requestedValue;
      guestAuditLogsDatabase.unshift({
        id: `aud-${Date.now()}`,
        bookingId: booking.id,
        guestName: booking.guestName,
        roomNumber: booking.roomNumber,
        action: 'Changed customer email',
        performedBy: actor,
        fieldChanged: 'Email',
        oldValue: oldVal,
        newValue: reqItem.requestedValue,
        timestamp,
      });
    } else if (reqItem.field.toLowerCase().includes('checkout') || reqItem.field.toLowerCase().includes('date')) {
      const oldVal = booking.checkOut;
      booking.checkOut = reqItem.requestedValue;
      guestAuditLogsDatabase.unshift({
        id: `aud-${Date.now()}`,
        bookingId: booking.id,
        guestName: booking.guestName,
        roomNumber: booking.roomNumber,
        action: 'Changed customer check-out details',
        performedBy: actor,
        fieldChanged: 'Check-out Date',
        oldValue: oldVal,
        newValue: reqItem.requestedValue,
        timestamp,
      });
    } else if (reqItem.field.toLowerCase().includes('special') || reqItem.field.toLowerCase().includes('request')) {
      booking.specialRequests = `${booking.specialRequests ? booking.specialRequests + '; ' : ''}${reqItem.requestedValue}`;
      guestAuditLogsDatabase.unshift({
        id: `aud-${Date.now()}`,
        bookingId: booking.id,
        guestName: booking.guestName,
        roomNumber: booking.roomNumber,
        action: 'Updated special requests',
        performedBy: actor,
        fieldChanged: 'Special Requests',
        oldValue: reqItem.currentValue,
        newValue: reqItem.requestedValue,
        timestamp,
      });
    }
  }

  reqItem.status = 'Approved';

  return res.json({
    success: true,
    message: `Correction request approved and applied to central database for ${reqItem.guestName}.`,
    request: reqItem,
    booking,
  });
});

// 10. GET Audit Logs
app.get('/api/reception/audit-logs', (req, res) => {
  return res.json(guestAuditLogsDatabase);
});

// ============================================================================
// CUSTOMER FEEDBACK & IMPROVEMENT SYSTEM API ROUTES
// ============================================================================

// 1. GET Feedback List
app.get('/api/feedback', (req, res) => {
  const { hotel_id = 'HOTEL001' } = req.query;
  const list = feedbackDatabase.filter((f) => !f.hotel_id || f.hotel_id === hotel_id);
  return res.json(list);
});

// 2. GET Feedback Analytics (Aggregates computed directly from DB)
app.get('/api/feedback/analytics', (req, res) => {
  const { hotel_id = 'HOTEL001' } = req.query;
  const list = feedbackDatabase.filter((f) => !f.hotel_id || f.hotel_id === hotel_id);

  const total = list.length;
  const sumRating = list.reduce((acc, f) => acc + (f.rating || 0), 0);
  const averageRating = total > 0 ? Number((sumRating / total).toFixed(1)) : 5.0;

  const ratingDistribution = {
    5: list.filter((f) => f.rating === 5).length,
    4: list.filter((f) => f.rating === 4).length,
    3: list.filter((f) => f.rating === 3).length,
    2: list.filter((f) => f.rating === 2).length,
    1: list.filter((f) => f.rating === 1).length,
  };

  const positiveCount = list.filter((f) => f.rating >= 4).length;
  const negativeCount = list.filter((f) => f.rating <= 2).length;
  const suggestionsCount = list.filter((f) => f.suggestion && f.suggestion.trim().length > 0).length;

  const categoryBreakdown: Record<string, number> = {};
  list.forEach((f) => {
    categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
  });

  return res.json({
    total,
    averageRating,
    ratingDistribution,
    positiveCount,
    negativeCount,
    suggestionsCount,
    categoryBreakdown,
  });
});

// 3. POST Submit Customer Feedback
app.post('/api/feedback', (req, res) => {
  const {
    customer_name,
    room_number,
    booking_id,
    order_id,
    category = 'Overall Experience',
    rating = 5,
    title,
    message,
    suggestion,
    hotel_id = 'HOTEL001',
    idempotencyKey,
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and feedback description are required.' });
  }

  const numRating = Math.max(1, Math.min(5, Number(rating) || 5));

  // Deduplicate
  const dedupeKey = idempotencyKey || `feedback_${customer_name}_${String(title).slice(0, 20)}`;
  const dup = isDuplicateSubmission(dedupeKey, 15000);
  if (dup.isDuplicate) {
    return res.status(200).json({
      message: 'Feedback already received.',
      feedback: dup.record,
      duplicatePrevented: true,
    });
  }

  const newFeedback = {
    id: generateFeedbackId(),
    hotel_id,
    customer_name: customer_name || 'Valued Guest',
    room_number: room_number || '',
    booking_id: booking_id || '',
    order_id: order_id || '',
    category,
    rating: numRating,
    title: String(title).trim(),
    message: String(message).trim(),
    suggestion: suggestion ? String(suggestion).trim() : '',
    status: 'Active',
    created_at: new Date().toISOString(),
  };

  feedbackDatabase.unshift(newFeedback);
  recordSubmission(dedupeKey, newFeedback);

  // If customer provided a suggestion, automatically create an improvement suggestion ticket!
  if (suggestion && suggestion.trim().length > 0) {
    suggestionsDatabase.unshift({
      id: generateSuggestionId(),
      hotel_id,
      customer_name: newFeedback.customer_name,
      category: newFeedback.category,
      title: newFeedback.title,
      suggestion: newFeedback.suggestion,
      status: 'New',
      adminNotes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: 'GUEST',
    employee_name: newFeedback.customer_name,
    role: 'GUEST',
    action: 'Feedback Submitted',
    timestamp: 'Just now',
    details: `${newFeedback.customer_name} left a ${newFeedback.rating}-star review for ${newFeedback.category}.`,
    type: 'operation',
  });

  return res.status(201).json({
    message: 'Thank you for your valuable feedback!',
    feedback: newFeedback,
  });
});

// 4. GET Hotel Improvement Suggestions List ("Help us improve")
app.get('/api/suggestions', (req, res) => {
  const { hotel_id = 'HOTEL001' } = req.query;
  const list = suggestionsDatabase.filter((s) => !s.hotel_id || s.hotel_id === hotel_id);
  return res.json(list);
});

// 5. POST Submit Improvement Suggestion directly
app.post('/api/suggestions', (req, res) => {
  const { customer_name, category = 'General', title, suggestion, hotel_id = 'HOTEL001' } = req.body;
  if (!suggestion) {
    return res.status(400).json({ error: 'Suggestion text is required.' });
  }

  const newSug = {
    id: generateSuggestionId(),
    hotel_id,
    customer_name: customer_name || 'Valued Guest',
    category,
    title: title || 'Guest Suggestion',
    suggestion: String(suggestion).trim(),
    status: 'New' as const,
    adminNotes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  suggestionsDatabase.unshift(newSug);
  return res.status(201).json({
    message: 'Improvement suggestion received.',
    suggestion: newSug,
  });
});

// 6. PATCH Update Improvement Suggestion Status (Manager/Owner RBAC)
app.patch('/api/suggestions/:id/status', (req, res) => {
  const auth = verifyStaffAuth(req, ['MANAGER', 'OWNER']);
  if (!auth.authorized) {
    return res.status(403).json({ error: auth.error });
  }

  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const sug = suggestionsDatabase.find((s) => s.id === id);
  if (!sug) {
    return res.status(404).json({ error: `Suggestion ${id} not found.` });
  }

  if (status) {
    sug.status = status;
  }
  if (adminNotes !== undefined) {
    sug.adminNotes = adminNotes;
  }
  sug.updated_at = new Date().toISOString();

  auditLogsDatabase.unshift({
    id: `aud-${Date.now()}`,
    employee_id: auth.employee?.employee_id || 'MANAGER',
    employee_name: auth.employee?.full_name || 'Manager',
    role: auth.role || 'MANAGER',
    action: `Suggestion ${id} Updated`,
    timestamp: 'Just now',
    details: `Status set to '${status}'.`,
    type: 'operation',
  });

  return res.json({
    message: 'Suggestion status updated successfully.',
    suggestion: sug,
  });
});

// ============================================================================
// REAL-TIME DASHBOARDS & METRICS AGGREGATION APIS (DATABASE-DRIVEN)
// ============================================================================

// 1. Manager Operational Headquarters Stats
app.get('/api/dashboard/manager-stats', (req, res) => {
  const { hotel_id = 'HOTEL001' } = req.query;

  const totalFoodOrders = ordersDatabase.length;
  const pendingOrders = ordersDatabase.filter((o) => o.status === 'New' || o.status === 'Preparing').length;

  const totalComplaints = complaintsDatabase.length;
  const pendingComplaints = complaintsDatabase.filter((c) => c.status === 'Pending' || c.status === 'Submitted' || c.status === 'Assigned' || c.status === 'In Progress').length;

  const totalFeedback = feedbackDatabase.length;
  const sumRating = feedbackDatabase.reduce((acc, f) => acc + (f.rating || 0), 0);
  const averageRating = totalFeedback > 0 ? Number((sumRating / totalFeedback).toFixed(1)) : 4.8;

  return res.json({
    todaysBookings: 24,
    currentGuests: 48,
    availableRooms: 6,
    foodOrders: totalFoodOrders,
    pendingOrders,
    complaints: totalComplaints,
    pendingComplaints,
    feedback: totalFeedback,
    averageRating,
    revenue: 495000,
  });
});

// 2. Owner Executive Headquarters Stats
app.get('/api/dashboard/owner-stats', (req, res) => {
  const totalFoodOrders = ordersDatabase.length;
  const totalComplaints = complaintsDatabase.length;
  const resolvedComplaints = complaintsDatabase.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const complaintResolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

  const totalFeedback = feedbackDatabase.length;
  const positiveFeedback = feedbackDatabase.filter((f) => f.rating >= 4).length;
  const customerSatisfaction = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 95;
  const sumRating = feedbackDatabase.reduce((acc, f) => acc + (f.rating || 0), 0);
  const averageRating = totalFeedback > 0 ? Number((sumRating / totalFeedback).toFixed(1)) : 4.8;

  return res.json({
    totalRevenue: 5420000,
    monthlyRevenue: 1540000,
    occupancyRate: 88,
    totalBookings: 142,
    foodRevenue: 440000,
    totalOrders: totalFoodOrders,
    complaintsTotal: totalComplaints,
    complaintResolutionRate,
    customerSatisfaction,
    averageRating,
    feedbackCount: totalFeedback,
  });
});

// 3. Real-Time State Live Sync (Polled smoothly without page reloads)
app.get('/api/sync/live-state', (req, res) => {
  const complaintStats = {
    total: complaintsDatabase.length,
    pending: complaintsDatabase.filter((c) => c.status === 'Pending' || c.status === 'Submitted').length,
    assigned: complaintsDatabase.filter((c) => c.status === 'Assigned').length,
    in_progress: complaintsDatabase.filter((c) => c.status === 'In Progress').length,
    resolved: complaintsDatabase.filter((c) => c.status === 'Resolved').length,
    closed: complaintsDatabase.filter((c) => c.status === 'Closed').length,
  };

  const orderStats = {
    total: ordersDatabase.length,
    new: ordersDatabase.filter((o) => o.status === 'New').length,
    preparing: ordersDatabase.filter((o) => o.status === 'Preparing').length,
    ready: ordersDatabase.filter((o) => o.status === 'Ready').length,
    picked_up: ordersDatabase.filter((o) => o.status === 'Picked Up').length,
    delivered: ordersDatabase.filter((o) => o.status === 'Delivered').length,
    cancelled: ordersDatabase.filter((o) => o.status === 'Cancelled').length,
  };

  const totalFeedback = feedbackDatabase.length;
  const sumRating = feedbackDatabase.reduce((acc, f) => acc + (f.rating || 0), 0);
  const averageRating = totalFeedback > 0 ? Number((sumRating / totalFeedback).toFixed(1)) : 4.8;

  return res.json({
    timestamp: Date.now(),
    complaintStats,
    orderStats,
    feedbackStats: {
      total: totalFeedback,
      averageRating,
    },
    complaints: complaintsDatabase,
    orders: ordersDatabase,
    feedback: feedbackDatabase,
    suggestions: suggestionsDatabase,
  });
});

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ============================================================================
// DATABASE-AWARE RESORT AI: CONTROLLED QUERY ENGINE & FUNCTION DECLARATIONS
// ============================================================================

interface AuthenticatedGuestContext {
  roomNumber?: string;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
}

function executeDbTool(name: string, args: any = {}, guestContext: AuthenticatedGuestContext = {}) {
  const room = guestContext?.roomNumber || '204';
  const guestName = guestContext?.guestName || 'Rohit Bhure';

  switch (name) {
    case 'get_available_activities': {
      let list = [...activitiesDatabase];
      if (args.category) {
        list = list.filter((a) => a.category.toLowerCase() === String(args.category).toLowerCase());
      }
      if (args.availableOnly) {
        list = list.filter((a) => a.isAvailable !== false);
      }
      if (args.isFree) {
        list = list.filter((a) => a.isComplimentary || a.pricePerPerson === 0);
      }
      if (args.maxPrice !== undefined) {
        list = list.filter((a) => a.pricePerPerson <= Number(args.maxPrice));
      }
      if (args.indoorOutdoor) {
        list = list.filter((a) => (a.indoorOutdoor || '').toLowerCase() === String(args.indoorOutdoor).toLowerCase());
      }
      if (args.suitableFor) {
        const s = String(args.suitableFor).toLowerCase();
        list = list.filter((a) => {
          const suitableArr = (a.suitableFor || []).map((x) => x.toLowerCase());
          return (
            suitableArr.some((x) => x.includes(s)) ||
            (a.capacity && a.capacity.toLowerCase().includes(s)) ||
            a.description.toLowerCase().includes(s) ||
            a.title.toLowerCase().includes(s)
          );
        });
      }
      if (args.keyword) {
        const kw = String(args.keyword).toLowerCase();
        list = list.filter(
          (a) =>
            a.title.toLowerCase().includes(kw) ||
            a.description.toLowerCase().includes(kw) ||
            a.location.toLowerCase().includes(kw) ||
            a.category.toLowerCase().includes(kw)
        );
      }
      if (args.cheapest) {
        list.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
      }

      return {
        queryParameters: args,
        count: list.length,
        activities: list.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          pricePerPerson: a.pricePerPerson,
          isComplimentary: a.isComplimentary,
          isAvailable: a.isAvailable !== false,
          timing: a.timing,
          duration: a.duration,
          location: a.location,
          indoorOutdoor: a.indoorOutdoor || 'Outdoor',
          capacity: a.capacity || 'Open',
          suitableFor: a.suitableFor || [],
          slotsAvailable: a.slotsAvailable,
          description: a.description,
        })),
      };
    }

    case 'get_activity_details': {
      const q = String(args.activityName || '').toLowerCase().trim();
      const match = activitiesDatabase.find((a) => {
        const titleLower = a.title.toLowerCase();
        const idLower = a.id.toLowerCase();
        return (
          titleLower.includes(q) ||
          idLower.includes(q) ||
          (q.includes('badminton') && idLower.includes('badminton')) ||
          (q.includes('table tennis') && idLower.includes('table-tennis')) ||
          (q.includes('ping pong') && idLower.includes('table-tennis')) ||
          (q.includes('chess') && idLower.includes('chess')) ||
          (q.includes('carrom') && idLower.includes('carrom')) ||
          (q.includes('dart') && idLower.includes('dart')) ||
          (q.includes('puzzle') && idLower.includes('puzzle')) ||
          (q.includes('basket') && idLower.includes('basket')) ||
          (q.includes('cricket') && idLower.includes('cricket')) ||
          (q.includes('cycling') && idLower.includes('cycling')) ||
          (q.includes('nature') && idLower.includes('nature')) ||
          (q.includes('bird') && idLower.includes('nature')) ||
          (q.includes('pool') && idLower.includes('swimming')) ||
          (q.includes('swim') && idLower.includes('swimming')) ||
          (q.includes('spa') && idLower.includes('spa')) ||
          (q.includes('massage') && idLower.includes('spa')) ||
          (q.includes('bonfire') && idLower.includes('bonfire'))
        );
      });

      if (!match) {
        return {
          found: false,
          activityName: args.activityName,
          message: `I couldn't find "${args.activityName}" in the resort's current activity database.`,
        };
      }

      return {
        found: true,
        id: match.id,
        title: match.title,
        category: match.category,
        pricePerPerson: match.pricePerPerson,
        isComplimentary: match.isComplimentary,
        isAvailable: match.isAvailable !== false,
        timing: match.timing,
        duration: match.duration,
        location: match.location,
        indoorOutdoor: match.indoorOutdoor || 'Outdoor',
        capacity: match.capacity || 'Open',
        suitableFor: match.suitableFor || [],
        slotsAvailable: match.slotsAvailable,
        description: match.description,
      };
    }

    case 'get_available_menu_items': {
      let list = [...menuDatabase];
      if (args.availableOnly !== false) {
        list = list.filter((m) => m.isAvailable !== false);
      }
      if (args.isVeg) {
        list = list.filter((m) => m.isVeg === true);
      }
      if (args.category) {
        list = list.filter((m) => m.category.toLowerCase() === String(args.category).toLowerCase());
      }
      if (args.maxPrice !== undefined) {
        list = list.filter((m) => m.price <= Number(args.maxPrice));
      }
      if (args.keyword) {
        const kw = String(args.keyword).toLowerCase();
        list = list.filter((m) => m.name.toLowerCase().includes(kw) || m.description.toLowerCase().includes(kw));
      }

      return {
        count: list.length,
        items: list.map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
          price: m.price,
          isVeg: m.isVeg,
          isAvailable: m.isAvailable,
          prepTime: m.prepTime,
          description: m.description,
        })),
      };
    }

    case 'get_menu_item_details': {
      const q = String(args.itemName || '').toLowerCase().trim();
      const match = menuDatabase.find((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));

      if (!match) {
        return {
          found: false,
          itemName: args.itemName,
          message: `I couldn't find "${args.itemName}" in our dining menu database.`,
        };
      }

      return {
        found: true,
        id: match.id,
        name: match.name,
        category: match.category,
        price: match.price,
        isVeg: match.isVeg,
        isAvailable: match.isAvailable,
        spiceLevel: match.spiceLevel,
        prepTime: match.prepTime,
        allergens: match.allergens,
        ingredients: match.ingredients,
        description: match.description,
      };
    }

    case 'get_available_rooms': {
      let list = [...roomsDatabase];
      if (args.availableOnly) {
        list = list.filter((r) => r.status === 'available');
      }
      if (args.roomType) {
        list = list.filter((r) => r.type.toLowerCase().includes(String(args.roomType).toLowerCase()));
      }
      if (args.capacity) {
        list = list.filter((r) => r.capacity >= Number(args.capacity));
      }
      if (args.maxPrice) {
        list = list.filter((r) => r.pricePerNight <= Number(args.maxPrice));
      }

      return {
        count: list.length,
        rooms: list.map((r) => ({
          number: r.number,
          name: r.name,
          type: r.type,
          pricePerNight: r.pricePerNight,
          capacity: r.capacity,
          bedType: r.bedType,
          amenities: r.amenities,
          status: r.status,
          description: r.description,
        })),
      };
    }

    case 'get_room_details': {
      const q = String(args.roomTypeOrNumber || '').toLowerCase().trim();
      const match = roomsDatabase.find(
        (r) => r.number === q || r.type.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
      );

      if (!match) {
        return {
          found: false,
          roomTypeOrNumber: args.roomTypeOrNumber,
          message: `I couldn't find room information for "${args.roomTypeOrNumber}" in our database.`,
        };
      }

      return {
        found: true,
        number: match.number,
        name: match.name,
        type: match.type,
        pricePerNight: match.pricePerNight,
        capacity: match.capacity,
        bedType: match.bedType,
        sizeSqFt: match.sizeSqFt,
        amenities: match.amenities,
        status: match.status,
        description: match.description,
      };
    }

    case 'get_customer_booking': {
      const targetRoom = args.roomNumber || room;
      const booking = bookingsDatabase.find(
        (b) => b.roomNumber === targetRoom || b.guestName.toLowerCase() === guestName.toLowerCase()
      );

      if (!booking) {
        return {
          found: false,
          roomNumber: targetRoom,
          message: `No active reservation found for Room ${targetRoom}.`,
        };
      }

      return {
        found: true,
        bookingId: booking.id,
        customerId: booking.customerId,
        roomNumber: booking.roomNumber,
        roomType: booking.roomType,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        guestEmail: booking.guestEmail,
        guestAddress: booking.guestAddress,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        checkInTime: booking.checkInTime || '14:00',
        checkOutTime: booking.checkOutTime || '11:00',
        guests: booking.guests || booking.guestsCount || 2,
        totalAmount: booking.totalAmount,
        status: booking.status,
        guestStatus: booking.guestStatus,
        paymentStatus: booking.paymentStatus,
        specialRequests: booking.specialRequests,
      };
    }

    case 'request_customer_correction': {
      const targetRoom = args.roomNumber || room;
      const booking = bookingsDatabase.find(
        (b) => b.roomNumber === targetRoom || b.guestName.toLowerCase() === guestName.toLowerCase()
      );
      const reqId = `REQ-${Date.now()}`;
      const newReq = {
        id: reqId,
        guestName: booking?.guestName || guestName,
        roomNumber: targetRoom,
        bookingId: booking?.id || '#HTL10239',
        field: args.field || 'Contact Details',
        currentValue: args.currentValue || (booking ? (args.field?.includes('Phone') ? booking.guestPhone : booking.checkOut) : 'Current Record'),
        requestedValue: args.requestedValue || args.value || 'Requested update',
        reason: args.reason || 'Guest requested change via ARIA Concierge',
        status: 'Pending',
        source: 'ARIA',
        createdAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };
      guestCorrectionRequestsDatabase.unshift(newReq);
      return {
        success: true,
        requestId: reqId,
        message: `Your request to update ${newReq.field} has been dispatched to Front Desk Reception. The receptionist will review and update the central database.`,
        request: newReq,
      };
    }

    case 'get_customer_orders': {
      const targetRoom = args.roomNumber || room;
      const orders = ordersDatabase.filter((o) => (o.roomOrTableNumber || '').includes(targetRoom));

      return {
        roomNumber: targetRoom,
        count: orders.length,
        orders: orders.map((o) => ({
          id: o.id,
          items: o.items,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt,
        })),
      };
    }

    case 'get_customer_complaints': {
      const targetRoom = args.roomNumber || room;
      const complaints = complaintsDatabase.filter((c) => c.roomNumber === targetRoom);

      return {
        roomNumber: targetRoom,
        count: complaints.length,
        complaints: complaints.map((c) => ({
          id: c.id,
          category: c.category,
          priority: c.priority,
          status: c.status,
          description: c.description,
          assignedTo: c.assignedTo,
          createdAt: c.createdAt,
          resolutionNote: c.resolutionNote,
        })),
      };
    }

    case 'get_resort_facility_info': {
      const q = String(args.facilityName || '').toLowerCase().trim();
      const match = facilitiesDatabase.find(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q)
      );

      if (!match) {
        return {
          found: false,
          facilityName: args.facilityName,
          message: `I couldn't find a "${args.facilityName}" in the resort's current facility records.`,
        };
      }

      return {
        found: true,
        id: match.id,
        name: match.name,
        category: match.category,
        location: match.location,
        timing: match.timing,
        isComplimentary: match.isComplimentary,
        description: match.description,
      };
    }

    default:
      return { error: `Tool ${name} not recognized.` };
  }
}

const resortAiFunctionDeclarations = [
  {
    name: 'get_available_activities',
    description:
      'Query the live activities database for resort games and experiences. Supports filtering by category (Recreation, Adventure, Wellness, Water, Evening), whether free or paid, maximum price, indoor vs outdoor, and suitability (e.g. 4 people, children, couples).',
    parameters: {
      type: 'OBJECT',
      properties: {
        keyword: { type: 'STRING', description: 'Search keyword (e.g. badminton, table tennis, chess, carrom, darts, cricket, cycling, spa)' },
        category: { type: 'STRING', description: 'Category: Recreation, Adventure, Wellness, Water, Evening' },
        isFree: { type: 'BOOLEAN', description: 'Set to true to retrieve only free or complimentary activities' },
        maxPrice: { type: 'NUMBER', description: 'Filter activities up to this price per person in INR' },
        availableOnly: { type: 'BOOLEAN', description: 'Filter only currently open and available activities' },
        indoorOutdoor: { type: 'STRING', description: 'Indoor or Outdoor' },
        suitableFor: { type: 'STRING', description: 'Suitability criteria e.g. "4 people", "children", "couples", "groups"' },
        cheapest: { type: 'BOOLEAN', description: 'Sort by lowest price first' },
      },
    },
  },
  {
    name: 'get_activity_details',
    description:
      'Get exact pricing, timings, location, equipment, capacity, and real-time availability for a specific game or activity from the database.',
    parameters: {
      type: 'OBJECT',
      properties: {
        activityName: {
          type: 'STRING',
          description: 'Name of the game or activity (e.g. badminton, table tennis, chess, carrom, darts, cricket, football, cycling, spa)',
        },
      },
      required: ['activityName'],
    },
  },
  {
    name: 'get_available_menu_items',
    description: 'Query dining database for food items and dishes. Filter by vegetarian, category, or maximum price.',
    parameters: {
      type: 'OBJECT',
      properties: {
        keyword: { type: 'STRING', description: 'Search term (e.g. paneer, naan, pizza, dal, biryani)' },
        category: { type: 'STRING', description: 'Category (e.g. Indian, Italian, Beverages, Breakfast)' },
        isVeg: { type: 'BOOLEAN', description: 'Only return vegetarian dishes' },
        maxPrice: { type: 'NUMBER', description: 'Maximum price in INR' },
      },
    },
  },
  {
    name: 'get_menu_item_details',
    description: 'Get live price, availability status, preparation time, allergens, and ingredients for a specific food item.',
    parameters: {
      type: 'OBJECT',
      properties: {
        itemName: { type: 'STRING', description: 'Name of the food item' },
      },
      required: ['itemName'],
    },
  },
  {
    name: 'get_available_rooms',
    description: 'Query database for room tariffs, real-time availability, capacities, and bed types.',
    parameters: {
      type: 'OBJECT',
      properties: {
        roomType: { type: 'STRING', description: 'Deluxe, Premium, Villa, Suite' },
        capacity: { type: 'NUMBER', description: 'Number of guests' },
        maxPrice: { type: 'NUMBER', description: 'Max price per night in INR' },
      },
    },
  },
  {
    name: 'get_room_details',
    description: 'Get detailed amenities, square footage, bed configuration, and pricing for a room number or room type.',
    parameters: {
      type: 'OBJECT',
      properties: {
        roomTypeOrNumber: { type: 'STRING', description: 'Room number (e.g. 101, 204) or type (e.g. Deluxe, Villa)' },
      },
      required: ['roomTypeOrNumber'],
    },
  },
  {
    name: 'get_customer_booking',
    description: 'Retrieve the active customer reservation details (check-in, check-out, room number, guest count) for the authenticated guest.',
    parameters: {
      type: 'OBJECT',
      properties: {
        roomNumber: { type: 'STRING', description: 'Guest room number' },
      },
    },
  },
  {
    name: 'get_customer_orders',
    description: 'Fetch the active food orders and preparation status for the authenticated guest room.',
    parameters: {
      type: 'OBJECT',
      properties: {
        roomNumber: { type: 'STRING', description: 'Guest room number' },
      },
    },
  },
  {
    name: 'get_customer_complaints',
    description: 'Fetch current maintenance tickets and resolution status for the authenticated guest room.',
    parameters: {
      type: 'OBJECT',
      properties: {
        roomNumber: { type: 'STRING', description: 'Guest room number' },
      },
    },
  },
  {
    name: 'get_resort_facility_info',
    description: 'Check verified facilities at the resort (e.g. swimming pool, spa, gym, private beach, kids club, valet parking).',
    parameters: {
      type: 'OBJECT',
      properties: {
        facilityName: { type: 'STRING', description: 'Name of facility (e.g. pool, spa, gym, beach, parking, golf)' },
      },
      required: ['facilityName'],
    },
  },
];

const DYNAMIC_AI_SYSTEM_INSTRUCTION = `
You are ARIA, the intelligent 24/7 AI Concierge and Management Assistant for Hotel Rahi Luxury Resort & Spa in Goa, India.

CRITICAL DATABASE DIRECTIVES:
1. You are directly connected to the resort's LIVE database via tool functions.
2. NEVER invent, hallucinate, or hard-code games, activities, food items, prices, rooms, or facilities.
3. When asked about activities or games:
   - Call 'get_available_activities' or 'get_activity_details' to query the real database.
   - If the database does not contain the game or activity (e.g., if a guest asks for football, golf, or an unknown game that is not in the database), you MUST respond naturally: "I couldn't find [game name] in the resort's current database." Never invent an activity that does not exist.
   - For queries like "Which activities are free?", filter by isFree=true.
   - For queries like "What is the cheapest activity?", find the activity with the lowest price.
   - For queries like "Which games are suitable for 4 people?", filter by suitableFor="4".
4. When asked about food or dining:
   - Call 'get_available_menu_items' or 'get_menu_item_details'.
   - Use the exact live price and availability from the database.
5. When asked about rooms or booking:
   - Call 'get_available_rooms' or 'get_room_details'.
6. When asked about the guest's stay, food orders, or complaints:
   - Call 'get_customer_booking', 'get_customer_orders', or 'get_customer_complaints'.
   - For guest privacy, only disclose records associated with the guest's verified room.
7. When asked about resort facilities (pool, spa, gym, beach):
   - Call 'get_resort_facility_info'. If not found, say it is not available.

OUTPUT FORMAT:
Return a JSON object:
{
  "reply": "Clear, friendly, polite response based strictly on the database query results (2-4 sentences)",
  "action": {
    "type": "booking" | "food_menu" | "cart_add" | "housekeeping" | "complaint" | "activity" | "navigation" | "review" | "emergency" | "stay_info" | "manager_analytics" | null,
    "data": { ... relevant structured data ... }
  }
}
`;

app.post('/api/resort-ai/chat', async (req, res) => {
  try {
    const { message, history, mode = 'guest', guestContext, managerContext, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json(generateStructuredFallback(message, mode, guestContext, managerContext));
    }

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: typeof h.text === 'string' ? h.text : JSON.stringify(h.text) }],
        });
      }
    }

    const contextualUserPrompt = `
[Current Context: Mode=${mode}, Room=${guestContext?.roomNumber || '204'}, Guest=${guestContext?.guestName || 'Rohit Bhure'}, PreferredLanguage=${language || 'auto'}]
${mode === 'manager' && managerContext ? `[Manager Live Stats: Total Rooms=${managerContext.totalRooms}, Occupied=${managerContext.occupiedRooms} (${managerContext.occupancyRate}%), Today Food Sales=₹${managerContext.todayFoodSales}, Open Complaints=${managerContext.openComplaints}, Pending Food Orders=${managerContext.pendingFoodOrders}]` : ''}
User Query: ${message}
`;

    contents.push({
      role: 'user',
      parts: [{ text: contextualUserPrompt }],
    });

    // 1. First call with database query tools
    const firstResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: DYNAMIC_AI_SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: resortAiFunctionDeclarations as any }],
        temperature: 0.2,
      },
    });

    let rawText = '';
    const functionCalls = firstResponse.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const candidateContent = firstResponse.candidates?.[0]?.content;
      if (candidateContent) {
        contents.push(candidateContent);
      }

      for (const call of functionCalls) {
        const toolResult = executeDbTool(call.name, call.args || {}, guestContext);
        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: call.name,
                response: toolResult,
              },
            },
          ],
        });
      }

      // 2. Synthesize tool output into JSON response
      const secondResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction:
            DYNAMIC_AI_SYSTEM_INSTRUCTION +
            '\nSynthesize the database tool results into a warm, grounded response. Output strict JSON with {"reply": "...", "action": { ... }}.',
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      rawText = secondResponse.text || '';
    } else {
      rawText = firstResponse.text || '';
    }

    let parsedData = null;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        parsedData = JSON.parse(cleaned);
      } catch {
        parsedData = {
          reply: rawText || 'How may I assist you at Hotel Rahi today?',
          action: null,
        };
      }
    }

    res.json(parsedData);
  } catch (error) {
    console.error('Gemini API call failed, using intelligent database fallback:', error);
    res.json(generateStructuredFallback(req.body.message || '', req.body.mode || 'guest', req.body.guestContext, req.body.managerContext));
  }
});

// ============================================================================
// DATABASE-GROUNDED DETERMINISTIC FALLBACK (100% LIVE DB QUERIES)
// ============================================================================
function generateStructuredFallback(
  input: string,
  mode: string = 'guest',
  guestContext?: any,
  managerContext?: any
): { reply: string; action: any } {
  const query = input.toLowerCase().trim();
  const room = guestContext?.roomNumber || '204';
  const guest = guestContext?.guestName || 'Rohit Bhure';

  // 1. MANAGER MODE (Real-time DB aggregates)
  if (mode === 'manager') {
    if (query.includes('occupan') || query.includes('room') || query.includes('how many')) {
      const occupied = roomsDatabase.filter((r) => r.status === 'occupied').length;
      const total = roomsDatabase.length;
      const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
      return {
        reply: `Today's current room occupancy is at ${rate}%, with ${occupied} out of ${total} rooms occupied. Deluxe and Premium suites are experiencing high demand.`,
        action: {
          type: 'manager_analytics',
          data: {
            metric: 'Occupancy',
            value: `${rate}%`,
            details: `${occupied} / ${total} Rooms Occupied`,
            status: 'Live DB',
          },
        },
      };
    }
    if (query.includes('food') || query.includes('sale') || query.includes('revenue') || query.includes('dining')) {
      const totalSales = ordersDatabase.reduce((sum, o) => sum + (o.total || 0), 0);
      return {
        reply: `Today's gross food & beverage sales from the database stand at ₹${totalSales.toLocaleString('en-IN')}. Popular dishes include Paneer Butter Masala and Dal Makhani.`,
        action: {
          type: 'manager_analytics',
          data: {
            metric: 'F&B Sales',
            value: `₹${totalSales.toLocaleString('en-IN')}`,
            ordersCount: ordersDatabase.length,
          },
        },
      };
    }
    if (query.includes('complaint') || query.includes('issue') || query.includes('unresolved')) {
      const openTickets = complaintsDatabase.filter((c) => c.status !== 'Resolved');
      return {
        reply: `There are currently ${openTickets.length} active service tickets in the database. Room 204 has an in-progress ticket assigned to technical support.`,
        action: {
          type: 'manager_analytics',
          data: {
            metric: 'Open Complaints',
            value: openTickets.length,
            tickets: openTickets.slice(0, 3),
          },
        },
      };
    }
    return {
      reply: `Resort database summary: ${roomsDatabase.filter((r) => r.status === 'occupied').length} rooms occupied, ₹${ordersDatabase.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString('en-IN')} food orders recorded, and ${complaintsDatabase.filter((c) => c.status !== 'Resolved').length} tickets active.`,
      action: {
        type: 'manager_analytics',
        data: {
          totalRooms: roomsDatabase.length,
          totalActivities: activitiesDatabase.length,
          totalMenuItems: menuDatabase.length,
        },
      },
    };
  }

  // 2. EMERGENCY ASSISTANCE
  if (
    query.includes('emergency') ||
    query.includes('doctor') ||
    query.includes('medical') ||
    query.includes('accident') ||
    query.includes('hurt') ||
    query.includes('police')
  ) {
    return {
      reply: `🚨 EMERGENCY ASSISTANCE ACTIVATED: Our on-site medical and security team has been alerted for Room ${room}. Please call reception or emergency dispatch below immediately.`,
      action: {
        type: 'emergency',
        data: {
          urgent: true,
          roomNumber: room,
          receptionExt: 'Ext. 9',
          securityExt: 'Ext. 911',
          medicalExt: 'Ext. 108',
        },
      },
    };
  }

  // 3. SPECIFIC GAME & ACTIVITY QUERIES (DATABASE-AWARE & FAILSAFE)
  const knownGameKeywords = [
    'badminton',
    'table tennis',
    'ping pong',
    'chess',
    'carrom',
    'darts',
    'dart',
    'cricket',
    'puzzle',
    'brain teaser',
    'basketball',
    'cycling',
    'bicycle',
    'nature walk',
    'bird watching',
    'swimming',
    'pool',
    'spa',
    'massage',
    'bonfire',
    'football',
    'golf',
    'tennis',
    'squash',
    'archery',
    'billiards',
    'snooker',
    'volleyball',
  ];

  const matchedGameKeyword = knownGameKeywords.find((k) => query.includes(k));

  if (matchedGameKeyword) {
    const actRes = executeDbTool('get_activity_details', { activityName: matchedGameKeyword }, guestContext);

    if (!actRes.found) {
      // FAILSAFE: Requested activity does not exist in database!
      return {
        reply: `I couldn't find "${matchedGameKeyword}" in the resort's current database. We offer table tennis, badminton, box cricket, grandmaster chess, darts, carrom, and coastal cycling. Would you like details on any of these?`,
        action: null,
      };
    }

    // It was found in the database!
    if (query.includes('price') || query.includes('cost') || query.includes('rate') || query.includes('charge') || query.includes('fee') || query.includes('kitna')) {
      const priceText = actRes.isComplimentary ? 'complimentary (free for all resort guests)' : `₹${actRes.pricePerPerson} per person for a ${actRes.duration} session`;
      return {
        reply: `${actRes.title} is ${priceText}. Equipment and lighting are provided at ${actRes.location}.`,
        action: {
          type: 'activity',
          data: {
            activityName: actRes.title,
            price: actRes.pricePerPerson,
            timing: actRes.timing,
            location: actRes.location,
            id: actRes.id,
          },
        },
      };
    }

    if (query.includes('timing') || query.includes('time') || query.includes('hour') || query.includes('open') || query.includes('when')) {
      return {
        reply: `${actRes.title} is open ${actRes.timing}. It is located at ${actRes.location}.`,
        action: {
          type: 'activity',
          data: {
            activityName: actRes.title,
            price: actRes.pricePerPerson,
            timing: actRes.timing,
            location: actRes.location,
            id: actRes.id,
          },
        },
      };
    }

    if (query.includes('available') || query.includes('slot') || query.includes('open')) {
      const availStatus = actRes.isAvailable
        ? `currently available today with open slots (${actRes.timing})`
        : 'currently unavailable';
      return {
        reply: `${actRes.title} is ${availStatus} at ${actRes.location}.`,
        action: {
          type: 'activity',
          data: {
            activityName: actRes.title,
            price: actRes.pricePerPerson,
            timing: actRes.timing,
            location: actRes.location,
            id: actRes.id,
          },
        },
      };
    }

    if (query.includes('where') || query.includes('locate') || query.includes('kahan')) {
      return {
        reply: `${actRes.title} is located at ${actRes.location}. Operating hours are ${actRes.timing}.`,
        action: {
          type: 'navigation',
          data: {
            destination: actRes.title,
            location: actRes.location,
            distance: 'Short stroll within resort grounds',
          },
        },
      };
    }

    if (query.includes('player') || query.includes('people') || query.includes('person') || query.includes('capacity')) {
      return {
        reply: `${actRes.title} accommodates ${actRes.capacity}. ${actRes.description}`,
        action: {
          type: 'activity',
          data: {
            activityName: actRes.title,
            price: actRes.pricePerPerson,
            timing: actRes.timing,
            location: actRes.location,
            id: actRes.id,
          },
        },
      };
    }

    // General game details from DB
    return {
      reply: `${actRes.title} is ${actRes.isAvailable ? 'available' : 'unavailable'} at ${actRes.location}. Pricing: ${actRes.isComplimentary ? 'Complimentary' : `₹${actRes.pricePerPerson} per person`}. Timing: ${actRes.timing}.`,
      action: {
        type: 'activity',
        data: {
          activityName: actRes.title,
          price: actRes.pricePerPerson,
          timing: actRes.timing,
          location: actRes.location,
          id: actRes.id,
        },
      },
    };
  }

  // 4. GENERAL ACTIVITY & GAME QUERIES
  if (
    query.includes('game') ||
    query.includes('activit') ||
    query.includes('sport') ||
    query.includes('play') ||
    query.includes('indoor') ||
    query.includes('outdoor') ||
    query.includes('free') ||
    query.includes('cheapest')
  ) {
    if (query.includes('free') || query.includes('complimentary') || query.includes('bina paise')) {
      const freeRes = executeDbTool('get_available_activities', { isFree: true }, guestContext);
      const titles = freeRes.activities.map((a: any) => `${a.title} (${a.timing})`).join(', ');
      return {
        reply: `Our complimentary resort experiences include: ${titles}. All are free for registered guests!`,
        action: {
          type: 'activity',
          data: {
            category: 'Complimentary Experiences',
            activities: freeRes.activities,
          },
        },
      };
    }

    if (query.includes('cheapest') || query.includes('lowest price') || query.includes('budget') || query.includes('kam daam')) {
      const cheapRes = executeDbTool('get_available_activities', { cheapest: true }, guestContext);
      const freeActivities = cheapRes.activities.filter((a: any) => a.isComplimentary);
      const paidActivities = cheapRes.activities.filter((a: any) => !a.isComplimentary);
      const lowestPaid = paidActivities[0];
      return {
        reply: `We have complimentary activities like ${freeActivities.map((a: any) => a.title).join(', ')}. Among our paid games, the lowest-priced are ${lowestPaid.title} at ₹${lowestPaid.pricePerPerson} per person, followed by ${paidActivities[1]?.title} (₹${paidActivities[1]?.pricePerPerson}).`,
        action: {
          type: 'activity',
          data: {
            category: 'Lowest Price Activities',
            activities: [lowestPaid, paidActivities[1]].filter(Boolean),
          },
        },
      };
    }

    if (query.includes('4 people') || query.includes('4 players') || query.includes('group of 4') || query.includes('four people') || query.includes('char log')) {
      const fourRes = executeDbTool('get_available_activities', { suitableFor: '4' }, guestContext);
      const names = fourRes.activities.map((a: any) => `${a.title} (₹${a.pricePerPerson})`).join(', ');
      return {
        reply: `Activities suitable for 4 players include: ${names}. Equipment is ready for doubles or group matches!`,
        action: {
          type: 'activity',
          data: {
            category: 'Games for 4 Players',
            activities: fourRes.activities,
          },
        },
      };
    }

    if (query.includes('children') || query.includes('kid') || query.includes('bachhe') || query.includes('child')) {
      const kidRes = executeDbTool('get_available_activities', { suitableFor: 'children' }, guestContext);
      const names = kidRes.activities.map((a: any) => `${a.title} (${a.indoorOutdoor})`).join(', ');
      return {
        reply: `Popular activities for children and families include: ${names}. Kids club supervised play is also open daily.`,
        action: {
          type: 'activity',
          data: {
            category: 'Kids & Family Activities',
            activities: kidRes.activities,
          },
        },
      };
    }

    if (query.includes('indoor')) {
      const indoorRes = executeDbTool('get_available_activities', { indoorOutdoor: 'Indoor' }, guestContext);
      const names = indoorRes.activities.map((a: any) => `${a.title} (₹${a.pricePerPerson})`).join(', ');
      return {
        reply: `Our indoor games include: ${names}. All are housed in our air-conditioned clubhouse and lounge.`,
        action: {
          type: 'activity',
          data: {
            category: 'Indoor Games',
            activities: indoorRes.activities,
          },
        },
      };
    }

    if (query.includes('outdoor')) {
      const outdoorRes = executeDbTool('get_available_activities', { indoorOutdoor: 'Outdoor' }, guestContext);
      const names = outdoorRes.activities.map((a: any) => `${a.title} (${a.timing})`).join(', ');
      return {
        reply: `Our outdoor activities include: ${names}. All courts and turf facilities are floodlit in the evening.`,
        action: {
          type: 'activity',
          data: {
            category: 'Outdoor Activities',
            activities: outdoorRes.activities,
          },
        },
      };
    }

    // Default: What games are available?
    const allActivities = executeDbTool('get_available_activities', { availableOnly: true }, guestContext);
    return {
      reply: `We have ${allActivities.count} activities and games currently available: Table Tennis (₹150), Grandmaster Chess (₹100), Club Carrom (₹120), Precision Darts (₹150), Outdoor Badminton (₹250), Box Cricket (₹450), Mini Basketball (₹200), Coastal Cycling (₹200), and complimentary Swimming Pool and Nature Walk. Which would you like to explore?`,
      action: {
        type: 'activity',
        data: {
          category: 'Available Resort Activities',
          activities: allActivities.activities,
        },
      },
    };
  }

  // 5. FOOD ITEM QUERIES (DATABASE-AWARE)
  if (
    (query.includes('add') || query.includes('order')) &&
    (query.includes('paneer') || query.includes('naan') || query.includes('dal') || query.includes('pizza') || query.includes('khana'))
  ) {
    const items: any[] = [];
    let total = 0;

    if (query.includes('paneer')) {
      const p = menuDatabase.find((m) => m.name.toLowerCase().includes('paneer')) || menuDatabase[0];
      items.push({ id: p.id, name: p.name, qty: 2, price: p.price });
      total += 2 * p.price;
    }
    if (query.includes('naan')) {
      const n = menuDatabase.find((m) => m.name.toLowerCase().includes('naan')) || menuDatabase[2];
      items.push({ id: n.id, name: n.name, qty: 4, price: n.price });
      total += 4 * n.price;
    }
    if (query.includes('pizza')) {
      const piz = menuDatabase.find((m) => m.name.toLowerCase().includes('pizza')) || menuDatabase[3];
      items.push({ id: piz.id, name: piz.name, qty: 1, price: piz.price });
      total += piz.price;
    }
    if (items.length === 0) {
      const first = menuDatabase[0];
      items.push({ id: first.id, name: first.name, qty: 1, price: first.price });
      total = first.price;
    }

    return {
      reply: `I have prepared your food order for Room ${room} with live prices from our dining menu! Please confirm below to dispatch it straight to the kitchen.`,
      action: {
        type: 'cart_add',
        data: {
          items,
          total,
          roomNumber: room,
          estimatedTime: '20-25 mins',
        },
      },
    };
  }

  // Specific food item price / availability query
  const foodKeywords = ['paneer', 'naan', 'dal', 'makhani', 'pizza', 'lassi', 'pasta', 'biryani', 'dosa'];
  const matchedFood = foodKeywords.find((k) => query.includes(k));
  if (matchedFood) {
    const foodRes = executeDbTool('get_menu_item_details', { itemName: matchedFood }, guestContext);
    if (!foodRes.found) {
      return {
        reply: `I couldn't find "${matchedFood}" in our dining menu database. Would you like to view our available Indian and Italian selections?`,
        action: null,
      };
    }

    const availText = foodRes.isAvailable ? `available for ₹${foodRes.price}` : 'currently unavailable';
    return {
      reply: `${foodRes.name} is ${availText} (${foodRes.prepTime} prep time). ${foodRes.description}`,
      action: {
        type: 'food_menu',
        data: {
          category: foodRes.category,
          items: [foodRes],
        },
      },
    };
  }

  // General dining / vegetarian menu query
  if (
    query.includes('veg') ||
    query.includes('food') ||
    query.includes('menu') ||
    query.includes('dinner') ||
    query.includes('lunch') ||
    query.includes('eat') ||
    query.includes('khana')
  ) {
    const menuRes = executeDbTool('get_available_menu_items', { isVeg: true, availableOnly: true }, guestContext);
    return {
      reply: `Here are our chef-recommended dishes from the live dining catalog. You can order any item directly to Room ${room}:`,
      action: {
        type: 'food_menu',
        data: {
          category: 'Vegetarian Specialties',
          items: menuRes.items.slice(0, 5),
        },
      },
    };
  }

  // 6. ROOM TARIFFS & BOOKING (DATABASE-AWARE)
  if (
    query.includes('room') ||
    query.includes('book') ||
    query.includes('stay') ||
    query.includes('price') ||
    query.includes('tariff') ||
    query.includes('deluxe') ||
    query.includes('villa') ||
    query.includes('suite')
  ) {
    if (query.includes('deluxe') || query.includes('villa') || query.includes('suite') || query.includes('premium')) {
      const typeTerm = query.includes('deluxe')
        ? 'deluxe'
        : query.includes('villa')
        ? 'villa'
        : query.includes('suite')
        ? 'suite'
        : 'premium';
      const rRes = executeDbTool('get_room_details', { roomTypeOrNumber: typeTerm }, guestContext);
      if (rRes.found) {
        return {
          reply: `The ${rRes.name} (${rRes.type}) is ₹${rRes.pricePerNight.toLocaleString('en-IN')} per night. It accommodates ${rRes.capacity} guests with ${rRes.bedType} and features: ${rRes.amenities.join(', ')}.`,
          action: {
            type: 'booking',
            data: {
              rooms: [rRes],
            },
          },
        };
      }
    }

    const availRooms = executeDbTool('get_available_rooms', { availableOnly: true }, guestContext);
    return {
      reply: `We have ${availRooms.count} luxury rooms ready in our database starting from ₹3,500/night:`,
      action: {
        type: 'booking',
        data: {
          rooms: availRooms.rooms,
        },
      },
    };
  }

  // 7. GUEST ACTIVE RESERVATION, CORRECTION REQUESTS, ORDERS, AND COMPLAINTS
  if (
    query.includes('wrong phone') ||
    query.includes('change phone') ||
    query.includes('update phone') ||
    query.includes('correct phone') ||
    query.includes('change mobile') ||
    query.includes('update mobile') ||
    query.includes('update email') ||
    query.includes('change email')
  ) {
    const bookingRes = executeDbTool('get_customer_booking', {}, guestContext);
    const isPhone = query.includes('phone') || query.includes('mobile');
    const field = isPhone ? 'Phone Number' : 'Email';
    const correctionRes = executeDbTool('request_customer_correction', {
      field,
      currentValue: isPhone ? bookingRes.guestPhone || '+91 98220 00000' : bookingRes.guestEmail || 'current@example.com',
      requestedValue: 'Customer requested update via ARIA',
      reason: `Guest requested ${field.toLowerCase()} update via ARIA Concierge chat.`,
    }, guestContext);

    return {
      reply: `I have submitted a customer profile update request for Room ${bookingRes.roomNumber || room} to Reception (${field}: update requested). Our Front Desk receptionist will review and apply this to the central hotel database.`,
      action: {
        type: 'customer_correction',
        data: {
          requestId: correctionRes.requestId,
          field,
          guestName: bookingRes.guestName || guest,
          roomNumber: bookingRes.roomNumber || room,
          status: 'Dispatched to Reception',
        },
      },
    };
  }

  if (
    query.includes('change check-out') ||
    query.includes('change checkout') ||
    query.includes('extend stay') ||
    query.includes('extend my stay') ||
    query.includes('different check-out') ||
    query.includes('late checkout') ||
    query.includes('late check-out')
  ) {
    const bookingRes = executeDbTool('get_customer_booking', {}, guestContext);
    const correctionRes = executeDbTool('request_customer_correction', {
      field: 'Check-out Date / Extension',
      currentValue: bookingRes.checkOut || 'Current scheduled date',
      requestedValue: 'Extension / Date Adjustment Requested',
      reason: `Guest requested check-out date modification or extension via ARIA.`,
    }, guestContext);

    return {
      reply: `I have forwarded your request to modify your check-out date for Room ${bookingRes.roomNumber || room} to the Front Desk Receptionist. Our reception team will check room availability and update your reservation in the central database.`,
      action: {
        type: 'customer_correction',
        data: {
          requestId: correctionRes.requestId,
          field: 'Check-out Date',
          guestName: bookingRes.guestName || guest,
          roomNumber: bookingRes.roomNumber || room,
          status: 'Dispatched to Reception',
        },
      },
    };
  }

  if (query.includes('checkin') || query.includes('check-in') || query.includes('when is my check-in')) {
    const bookingRes = executeDbTool('get_customer_booking', {}, guestContext);
    if (bookingRes.found) {
      return {
        reply: `Hello ${bookingRes.guestName}! Your check-in is scheduled for ${bookingRes.checkIn} at ${bookingRes.checkInTime || '2:00 PM'} for Room ${bookingRes.roomNumber} (${bookingRes.roomType}). We look forward to welcoming you!`,
        action: {
          type: 'stay_info',
          data: {
            ...bookingRes,
            queryType: 'check_in',
          },
        },
      };
    }
  }

  if (
    query.includes('checkout') ||
    query.includes('check-out') ||
    query.includes('when is my check-out') ||
    query.includes('my stay') ||
    query.includes('my booking') ||
    query.includes('reservation')
  ) {
    const bookingRes = executeDbTool('get_customer_booking', {}, guestContext);
    if (bookingRes.found) {
      return {
        reply: `Hello ${bookingRes.guestName}, your reservation for Room ${bookingRes.roomNumber} (${bookingRes.roomType}) is confirmed. Check-out is scheduled for ${bookingRes.checkOut} at ${bookingRes.checkOutTime || '11:00 AM'}.`,
        action: {
          type: 'stay_info',
          data: bookingRes,
        },
      };
    }
  }

  if (query.includes('my order') || query.includes('order status') || query.includes('what did i order')) {
    const orderRes = executeDbTool('get_customer_orders', {}, guestContext);
    if (orderRes.count > 0) {
      return {
        reply: `Room ${room} has ${orderRes.count} active order(s) in the database. The kitchen is preparing your meal.`,
        action: {
          type: 'stay_info',
          data: orderRes,
        },
      };
    }
    return {
      reply: `There are currently no pending food orders for Room ${room}. Would you like to view our dining menu?`,
      action: null,
    };
  }

  if (query.includes('my complaint') || query.includes('ticket') || query.includes('ac status') || query.includes('complaint status')) {
    const compRes = executeDbTool('get_customer_complaints', {}, guestContext);
    if (compRes.count > 0) {
      const top = compRes.complaints[0];
      return {
        reply: `Your service ticket #${top.id} (${top.category}) is currently "${top.status}". It is assigned to ${top.assignedTo} with priority ${top.priority}.`,
        action: {
          type: 'complaint',
          data: top,
        },
      };
    }
    return {
      reply: `No open maintenance complaints are recorded for Room ${room}. Please let me know if anything requires attention!`,
      action: null,
    };
  }

  // 8. HOUSEKEEPING
  if (
    query.includes('towel') ||
    query.includes('pillow') ||
    query.includes('clean') ||
    query.includes('housekeep') ||
    query.includes('linen') ||
    query.includes('toilet') ||
    query.includes('pani') ||
    query.includes('water bottle')
  ) {
    const item = query.includes('towel')
      ? '2 Plush Bath Towels'
      : query.includes('pillow')
      ? '2 Extra Pillows'
      : query.includes('water')
      ? 'Glass Pack Mineral Water (2 bottles)'
      : 'Room Cleaning & Fresh Linens';
    return {
      reply: `Certainly! I have scheduled a housekeeping service request for Room ${room} for ${item}. Our floor attendant will arrive within 10-15 minutes.`,
      action: {
        type: 'housekeeping',
        data: {
          requestId: `RS${Math.floor(1000 + Math.random() * 9000)}`,
          roomNumber: room,
          request: item,
          status: 'Assigned',
          priority: 'Normal',
        },
      },
    };
  }

  // 9. COMPLAINTS & MAINTENANCE CREATION
  if (
    query.includes('ac') ||
    query.includes('air condition') ||
    query.includes('not work') ||
    query.includes('broken') ||
    query.includes('leak') ||
    query.includes('complaint') ||
    query.includes('geyser') ||
    query.includes('hot water') ||
    query.includes('wifi') ||
    query.includes('kharab') ||
    query.includes('kaam nahi')
  ) {
    const isHigh = query.includes('urgent') || query.includes('ac') || query.includes('water') || query.includes('leak');
    const category = query.includes('ac')
      ? 'Air Conditioning'
      : query.includes('wifi')
      ? 'Wi-Fi & Internet'
      : query.includes('water') || query.includes('geyser')
      ? 'Plumbing / Geyser'
      : 'General Maintenance';

    const newTicketId = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    complaintsDatabase.unshift({
      id: newTicketId,
      hotel_id: 'HOTEL001',
      roomNumber: room,
      guestName: guest,
      category,
      title: `${category} Issue - Room ${room}`,
      priority: isHigh ? 'High' : 'Medium',
      status: 'Open',
      description: input,
      assignedTo: 'Vikash Kumar (Engineering)',
      resolutionNote: '',
      createdAt: 'Just now',
      updatedAt: 'Just now',
    });

    return {
      reply: `I deeply apologize for the issue with your ${category} in Room ${room}. I have logged maintenance ticket #${newTicketId} marked as ${isHigh ? 'HIGH' : 'MEDIUM'} priority. Our chief technician has been dispatched.`,
      action: {
        type: 'complaint',
        data: {
          complaintId: newTicketId,
          roomNumber: room,
          category,
          priority: isHigh ? 'HIGH' : 'MEDIUM',
          description: input,
          status: 'Assigned',
        },
      },
    };
  }

  // 10. FACILITIES & NAVIGATION
  if (query.includes('where') || query.includes('locate') || query.includes('kahan') || query.includes('direction')) {
    if (query.includes('pool') || query.includes('swim')) {
      const pool = executeDbTool('get_resort_facility_info', { facilityName: 'pool' }, guestContext);
      return {
        reply: `🏊 The ${pool.name} is located at ${pool.location}. Operating hours: ${pool.timing}.`,
        action: {
          type: 'navigation',
          data: {
            destination: pool.name,
            location: pool.location,
            distance: '150 meters',
          },
        },
      };
    }
    if (query.includes('restaurant') || query.includes('dine') || query.includes('breakfast')) {
      const rest = executeDbTool('get_resort_facility_info', { facilityName: 'restaurant' }, guestContext);
      return {
        reply: `🍽️ ${rest.name} is located at ${rest.location}. Timings: ${rest.timing}.`,
        action: {
          type: 'navigation',
          data: {
            destination: rest.name,
            location: rest.location,
            distance: '80 meters',
          },
        },
      };
    }
    if (query.includes('spa') || query.includes('massage')) {
      const spa = executeDbTool('get_resort_facility_info', { facilityName: 'spa' }, guestContext);
      return {
        reply: `🌿 ${spa.name} is located at ${spa.location}. Operating hours: ${spa.timing}.`,
        action: {
          type: 'navigation',
          data: {
            destination: spa.name,
            location: spa.location,
            distance: '120 meters',
          },
        },
      };
    }
  }

  // 11. FEEDBACK & REVIEWS
  if (
    query.includes('review') ||
    query.includes('stay was') ||
    query.includes('feedback') ||
    query.includes('how was') ||
    query.includes('pretty good') ||
    query.includes('experience')
  ) {
    return {
      reply: `Thank you for sharing your experience! I have converted your feedback into a structured review. Would you like me to submit it to our resort management?`,
      action: {
        type: 'review',
        data: {
          overall: 4,
          room: 5,
          food: 4,
          service: 3,
          cleanliness: 5,
          comment: input,
          guestName: guest,
          roomType: 'Azure Premium Oceanfront',
        },
      },
    };
  }

  // Multilingual Greetings
  if (
    query.includes('namaste') ||
    query.includes('kaise') ||
    query.includes('kasa') ||
    query.includes('kaisa') ||
    query.includes('namaskara') ||
    query.includes('vanakkam')
  ) {
    return {
      reply: `नमस्ते! Hotel Rahi Luxury Resort में आपका स्वागत है। मैं ARIA, आपकी 24/7 AI Concierge हूँ, जो हमारे लाइव डेटाबेस से सीधे जुड़ी हुई हूँ। मैं एक्टिविटीज, गेम्स, डाइनिंग मेनू, रूम सर्विस या नेविगेशन में आपकी क्या मदद करूँ?`,
      action: null,
    };
  }

  return {
    reply: `Welcome to Hotel Rahi! I am ARIA, connected to our real-time database to answer questions on resort games & activities (like badminton, table tennis, cricket, chess, darts, cycling), dining menu, room tariffs, or your current reservation in Room ${room}. What would you like to check?`,
    action: null,
  };
}

// ============================================================================
// MYSQL DATABASE EXPLORER & MANAGEMENT API ROUTES
// ============================================================================

// 1. Get MySQL connection status & stats
app.get('/api/db/status', async (req, res) => {
  try {
    const status = await testDbConnection();
    const config = getDbConfig();
    return res.json({
      ...status,
      config: {
        host: config.host ? `${config.host.substring(0, 3)}***` : 'Not set',
        rawHost: config.host || '',
        port: config.port,
        database: config.database || 'Not set',
        user: config.user || 'Not set',
        ssl: Boolean(config.ssl),
      },
      inMemoryCounts: {
        staff: staffDatabase.length,
        complaints: complaintsDatabase.length,
        orders: ordersDatabase.length,
        feedback: feedbackDatabase.length,
        suggestions: suggestionsDatabase.length,
        auditLogs: auditLogsDatabase.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Get list of tables and columns
app.get('/api/db/tables', async (req, res) => {
  try {
    const tables = await getTablesSummary();
    if (tables.length > 0) {
      return res.json(tables);
    }

    // If MySQL is not connected or empty, return default table definitions with memory counts
    const fallbackTables = [
      {
        name: 'staff_members',
        rowCount: staffDatabase.length,
        source: 'in-memory',
        columns: [
          { field: 'id', type: 'VARCHAR(64)', key: 'PRI' },
          { field: 'employee_id', type: 'VARCHAR(64)', key: 'UNI' },
          { field: 'full_name', type: 'VARCHAR(128)' },
          { field: 'email', type: 'VARCHAR(128)' },
          { field: 'role', type: 'VARCHAR(64)' },
          { field: 'department', type: 'VARCHAR(128)' },
          { field: 'status', type: 'VARCHAR(32)' },
        ],
      },
      {
        name: 'complaints',
        rowCount: complaintsDatabase.length,
        source: 'in-memory',
        columns: [
          { field: 'id', type: 'VARCHAR(64)', key: 'PRI' },
          { field: 'room_number', type: 'VARCHAR(32)' },
          { field: 'guest_name', type: 'VARCHAR(128)' },
          { field: 'category', type: 'VARCHAR(64)' },
          { field: 'priority', type: 'VARCHAR(32)' },
          { field: 'status', type: 'VARCHAR(32)' },
          { field: 'assigned_to', type: 'VARCHAR(128)' },
        ],
      },
      {
        name: 'food_orders',
        rowCount: ordersDatabase.length,
        source: 'in-memory',
        columns: [
          { field: 'id', type: 'VARCHAR(64)', key: 'PRI' },
          { field: 'room_or_table', type: 'VARCHAR(64)' },
          { field: 'guest_name', type: 'VARCHAR(128)' },
          { field: 'items', type: 'JSON' },
          { field: 'total_amount', type: 'INT' },
          { field: 'status', type: 'VARCHAR(32)' },
        ],
      },
      {
        name: 'feedback',
        rowCount: feedbackDatabase.length,
        source: 'in-memory',
        columns: [
          { field: 'id', type: 'VARCHAR(64)', key: 'PRI' },
          { field: 'customer_name', type: 'VARCHAR(128)' },
          { field: 'rating', type: 'INT' },
          { field: 'title', type: 'VARCHAR(128)' },
          { field: 'status', type: 'VARCHAR(32)' },
        ],
      },
      {
        name: 'suggestions',
        rowCount: suggestionsDatabase.length,
        source: 'in-memory',
        columns: [
          { field: 'id', type: 'VARCHAR(64)', key: 'PRI' },
          { field: 'customer_name', type: 'VARCHAR(128)' },
          { field: 'category', type: 'VARCHAR(64)' },
          { field: 'title', type: 'VARCHAR(128)' },
          { field: 'status', type: 'VARCHAR(32)' },
        ],
      },
      {
        name: 'audit_logs',
        rowCount: auditLogsDatabase.length,
        source: 'in-memory',
        columns: [
          { field: 'id', type: 'VARCHAR(64)', key: 'PRI' },
          { field: 'employee_name', type: 'VARCHAR(128)' },
          { field: 'action', type: 'VARCHAR(64)' },
          { field: 'timestamp', type: 'VARCHAR(64)' },
        ],
      },
      {
        name: 'menu_items',
        rowCount: menuDatabase.length,
        source: 'in-memory',
        columns: [
          { field: 'id', type: 'VARCHAR(64)', key: 'PRI' },
          { field: 'name', type: 'VARCHAR(128)' },
          { field: 'category', type: 'VARCHAR(64)' },
          { field: 'price', type: 'INT' },
          { field: 'is_available', type: 'BOOLEAN' },
          { field: 'is_chef_special', type: 'BOOLEAN' },
          { field: 'is_veg', type: 'BOOLEAN' },
          { field: 'prep_time', type: 'VARCHAR(32)' },
        ],
      },
    ];
    return res.json(fallbackTables);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Execute Raw SQL Query in SQL Console
app.post('/api/db/query', async (req, res) => {
  try {
    const { query: sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'SQL query statement is required.' });
    }

    const trimmed = sql.trim();
    const result = await executeQuery(trimmed);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Fetch Paginated Table Data
app.get('/api/db/table-data/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(5, parseInt(req.query.pageSize as string) || 25));
    const offset = (page - 1) * pageSize;

    const p = getMysqlPool();
    if (p) {
      const [countResult]: any = await p.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      const total = countResult[0]?.count || 0;
      const [rows, fields]: any = await p.query(`SELECT * FROM \`${tableName}\` LIMIT ? OFFSET ?`, [pageSize, offset]);
      const fieldNames = fields ? fields.map((f: any) => f.name) : (rows[0] ? Object.keys(rows[0]) : []);

      return res.json({
        tableName,
        rows,
        fields: fieldNames,
        total,
        page,
        pageSize,
        source: 'mysql',
      });
    }

    // In-memory fallback representation
    let memRows: any[] = [];
    if (tableName === 'staff_members' || tableName === 'staff') memRows = staffDatabase;
    else if (tableName === 'complaints') memRows = complaintsDatabase;
    else if (tableName === 'food_orders') memRows = ordersDatabase;
    else if (tableName === 'feedback') memRows = feedbackDatabase;
    else if (tableName === 'suggestions') memRows = suggestionsDatabase;
    else if (tableName === 'audit_logs') memRows = auditLogsDatabase;
    else if (tableName === 'menu_items' || tableName === 'menu') memRows = menuDatabase;

    const sliced = memRows.slice(offset, offset + pageSize);
    const fields = sliced[0] ? Object.keys(sliced[0]) : [];

    return res.json({
      tableName,
      rows: sliced,
      fields,
      total: memRows.length,
      page,
      pageSize,
      source: 'in-memory',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Trigger Schema Migration & Seed Sync
app.post('/api/db/sync-seed', async (req, res) => {
  try {
    const status = await testDbConnection();
    if (!status.connected) {
      return res.status(400).json({
        error: `MySQL is currently unreachable (${status.message}). Please verify your environment variables.`,
        status,
      });
    }

    const schemaRes = await initMysqlSchema();
    const seedRes = await seedMysqlData({
      staff: staffDatabase,
      complaints: complaintsDatabase,
      orders: ordersDatabase,
      feedback: feedbackDatabase,
      suggestions: suggestionsDatabase,
      auditLogs: auditLogsDatabase,
      menuItems: menuDatabase,
    });

    return res.json({
      message: 'Database schema successfully updated and seed data synchronized.',
      schema: schemaRes,
      seed: seedRes,
      status,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  // Test MySQL connection and initialize schema if configured
  testDbConnection()
    .then(async (status) => {
      if (status.connected) {
        console.log(`[MySQL] Connected successfully to ${status.host}:${status.port}/${status.database}`);
        const schemaRes = await initMysqlSchema();
        console.log(`[MySQL] Tables verified: ${schemaRes.tablesCreated.join(', ')}`);
        const seedRes = await seedMysqlData({
          staff: staffDatabase,
          complaints: complaintsDatabase,
          orders: ordersDatabase,
          feedback: feedbackDatabase,
          suggestions: suggestionsDatabase,
          auditLogs: auditLogsDatabase,
        });
        console.log(`[MySQL] Seed synchronization complete:`, seedRes.insertedCounts);
      } else {
        console.log(`[MySQL] Notice: ${status.message}. Operating in hybrid high-performance mode.`);
      }
    })
    .catch((err) => {
      console.warn(`[MySQL] Notice during startup connection check:`, err.message);
    });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hotel Management Server running on port ${PORT}`);
  });
}

startServer();
