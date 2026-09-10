import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Room,
  RoomStatus,
  Booking,
  BookingStatus,
  FoodOrder,
  FoodOrderStatus,
  FoodItem,
  HousekeepingTask,
  Complaint,
  ComplaintStatus,
  Review,
  ActivityBooking,
  MaintenanceRequest,
  InventoryItem,
  StaffMember,
  NotificationItem,
  ActiveRole,
  GuestTab,
  Employee,
  AuditLogEntry,
  AuthUser,
  CustomerFeedback,
  ImprovementSuggestion,
  ComplaintStats,
  FoodOrderStats,
  FeedbackAnalytics,
  SuggestionStatus,
} from '../types';
import {
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_FOOD_ITEMS,
  INITIAL_FOOD_ORDERS,
  INITIAL_HOUSEKEEPING,
  INITIAL_COMPLAINTS,
  INITIAL_REVIEWS,
  INITIAL_MAINTENANCE,
  INITIAL_INVENTORY,
  INITIAL_STAFF,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { INITIAL_EMPLOYEES, INITIAL_AUDIT_LOGS } from '../data/staffData';

interface HotelContextType {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  guestTab: GuestTab;
  setGuestTab: (tab: GuestTab) => void;
  activeGuestRoom: string;
  setActiveGuestRoom: (room: string) => void;
  activeGuestBooking: Booking | undefined;
  
  // Auth & RBAC
  authUser: AuthUser | null;
  login: (identifier: string, password: string, expectedCategory?: 'manager' | 'employee') => Promise<{ success: boolean; error?: string; targetRole?: ActiveRole }>;
  logout: () => void;
  updatePasswordOnFirstLogin: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  showFirstLoginModal: boolean;
  setShowFirstLoginModal: (show: boolean) => void;
  isRoleAuthorized: (role: ActiveRole) => boolean;

  // Staff Management
  employees: Employee[];
  createEmployee: (empData: Partial<Employee>) => Promise<{ success: boolean; error?: string; employee?: Employee }>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<{ success: boolean; error?: string }>;
  toggleEmployeeStatus: (id: string) => Promise<{ success: boolean; error?: string; status?: 'ACTIVE' | 'INACTIVE' }>;
  resetEmployeePassword: (id: string) => Promise<{ success: boolean; error?: string; temporary_password?: string }>;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Rooms
  rooms: Room[];
  updateRoomStatus: (roomNumber: string, status: RoomStatus) => void;

  // Bookings
  bookings: Booking[];
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;

  // Food Orders
  foodOrders: FoodOrder[];
  placeFoodOrder: (order: Omit<FoodOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => FoodOrder;
  updateFoodOrderStatus: (id: string, status: FoodOrderStatus, waiterName?: string) => void;

  // Food Menu & Chef Management
  foodItems: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, 'id'>) => Promise<FoodItem>;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => Promise<void>;
  deleteFoodItem: (id: string) => Promise<void>;
  toggleFoodItemAvailability: (id: string) => Promise<void>;
  updateFoodItemPrice: (id: string, newPrice: number) => Promise<void>;
  reloadMenu: () => Promise<void>;

  // Housekeeping
  housekeepingTasks: HousekeepingTask[];
  requestHousekeeping: (task: Omit<HousekeepingTask, 'id' | 'status' | 'createdAt'>) => void;
  updateHousekeepingStatus: (id: string, status: HousekeepingTask['status']) => void;

  // Complaints
  complaints: Complaint[];
  submitComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Complaint;
  updateComplaintStatus: (id: string, status: ComplaintStatus, assignedTo?: string, note?: string) => void;

  // Reviews
  reviews: Review[];
  submitReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  replyToReview: (id: string, reply: string) => void;

  // Customer Feedback & Analytics
  feedbackList: CustomerFeedback[];
  feedbackAnalytics: FeedbackAnalytics;
  submitFeedback: (data: Omit<CustomerFeedback, 'id' | 'status' | 'created_at'>) => Promise<CustomerFeedback>;

  // Hotel Improvement Suggestions ("Help us improve")
  suggestions: ImprovementSuggestion[];
  submitSuggestion: (data: Omit<ImprovementSuggestion, 'id' | 'status' | 'created_at' | 'updated_at'>) => Promise<ImprovementSuggestion>;
  updateSuggestionStatus: (id: string, status: SuggestionStatus, notes?: string) => Promise<void>;

  // Database-Driven Live Counters & State Sync
  complaintStats: ComplaintStats;
  foodOrderStats: FoodOrderStats;
  refreshLiveState: () => Promise<void>;

  // Activities
  activityBookings: ActivityBooking[];
  bookActivitySlot: (booking: Omit<ActivityBooking, 'id' | 'status' | 'createdAt'>) => ActivityBooking;

  // Maintenance
  maintenanceRequests: MaintenanceRequest[];
  submitMaintenance: (req: Omit<MaintenanceRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceRequest['status']) => void;

  // Inventory
  inventory: InventoryItem[];
  updateInventoryQuantity: (id: string, newQuantity: number) => void;

  // Staff
  staff: StaffMember[];

  // Notifications
  notifications: NotificationItem[];
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Invoice & Bill Modals
  invoiceBooking: Booking | null;
  setInvoiceBooking: (booking: Booking | null) => void;
  invoiceOrder: FoodOrder | null;
  setInvoiceOrder: (order: FoodOrder | null) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<ActiveRole>('guest');
  const [guestTab, setGuestTab] = useState<GuestTab>('home');
  const [activeGuestRoom, setActiveGuestRoom] = useState<string>('204');
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<FoodOrder | null>(null);

  // Persistent / Initial States
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('aura_rooms');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Room[];
        return INITIAL_ROOMS.map((initRoom) => {
          const found = parsed.find((r) => r.id === initRoom.id || r.number === initRoom.number);
          if (found) {
            return {
              ...initRoom,
              status: found.status || initRoom.status,
              image: initRoom.image,
            };
          }
          return initRoom;
        });
      } catch {
        return INITIAL_ROOMS;
      }
    }
    return INITIAL_ROOMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('aura_bookings');
    if (!saved) return INITIAL_BOOKINGS;
    try {
      const parsed: Booking[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((b) => b.id));
      const missing = INITIAL_BOOKINGS.filter((b) => !existingIds.has(b.id));
      const enriched = parsed.map((b) => {
        const init = INITIAL_BOOKINGS.find((x) => x.id === b.id);
        return init ? { ...init, ...b } : b;
      });
      return [...missing, ...enriched];
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>(() => {
    const saved = localStorage.getItem('aura_food_orders');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_ORDERS;
  });

  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem('aura_food_items');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_ITEMS;
  });

  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(() => {
    const saved = localStorage.getItem('aura_housekeeping');
    return saved ? JSON.parse(saved) : INITIAL_HOUSEKEEPING;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('aura_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('aura_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [activityBookings, setActivityBookings] = useState<ActivityBooking[]>(() => {
    const saved = localStorage.getItem('aura_activities');
    return saved ? JSON.parse(saved) : [
      {
        id: 'AB-881',
        activityId: 'act-2',
        activityTitle: 'Nirvana Ayurvedic Spa & Massage',
        guestName: 'Rohit Bhure',
        roomNumber: '204',
        date: '2026-09-02',
        timeSlot: '16:00 - 17:00',
        participants: 1,
        totalPrice: 2500,
        status: 'Confirmed',
        createdAt: '2026-09-01T15:00:00Z',
      },
      {
        id: 'AB-882',
        activityId: 'act-bonfire',
        activityTitle: 'Sunset Beach Bonfire & Live Music',
        guestName: 'Rohit Bhure',
        roomNumber: '204',
        date: '2026-09-02',
        timeSlot: '19:30 - 21:30',
        participants: 2,
        totalPrice: 0,
        status: 'Confirmed',
        createdAt: '2026-09-02T10:00:00Z',
      },
    ];
  });

  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(() => {
    const saved = localStorage.getItem('aura_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('aura_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('aura_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [showFirstLoginModal, setShowFirstLoginModal] = useState<boolean>(false);

  // Employees database state
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('aura_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_EMPLOYEES;
      }
    }
    return INITIAL_EMPLOYEES;
  });

  // Dynamic staff list derived from employees
  const staff: StaffMember[] = employees.map((emp) => ({
    id: emp.id,
    name: emp.full_name,
    role: emp.role === 'CHEF' ? 'Chef' :
          emp.role === 'WAITER' ? 'Waiter' :
          emp.role === 'HOUSEKEEPING' ? 'Housekeeping' :
          emp.role === 'RECEPTIONIST' ? 'Receptionist' :
          emp.role === 'MAINTENANCE' ? 'Maintenance' : 'Manager',
    department: emp.department,
    phone: emp.phone,
    shift: (emp.shift as any) || 'Morning (6 AM - 2 PM)',
    status: emp.status === 'ACTIVE' ? 'On Duty' : 'Off Duty',
    assignedTasks: emp.assigned_tasks || 0,
    rating: emp.rating || 4.8,
  }));

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('aura_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_AUDIT_LOGS;
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('aura_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Customer Feedback State
  const [feedbackList, setFeedbackList] = useState<CustomerFeedback[]>(() => {
    const saved = localStorage.getItem('aura_feedback');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: 'FDB-2026-0001',
        hotel_id: 'HOTEL001',
        customer_name: 'Ananya Sharma',
        room_number: '204',
        booking_id: '#HTL10234',
        order_id: 'ORD-2026-0001',
        category: 'Overall Experience',
        rating: 5,
        title: 'Magical Stay & Exquisite Ocean Ambience',
        message: 'The beachfront tranquility, prompt service, and cliffside infinity pool exceeded our highest expectations. A truly world-class luxury resort!',
        suggestion: 'Consider adding complimentary morning yoga mats on private balconies.',
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
        title: 'Delectable Truffle Pizza and Poolside Service',
        message: 'The wood-fired sourdough pizza at the poolside gazebo was fresh and piping hot. Staff arrived promptly with towels and cold drinks.',
        suggestion: 'Would love more vegan and dairy-free dessert selections on the poolside menu.',
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
        title: 'Immaculate Room Hygiene & Fragrance',
        message: 'Housekeeping team did an exceptional job preparing our room for check-in. Very fresh linen and spotless bathroom.',
        suggestion: '',
        status: 'Active',
        created_at: '2026-08-31T18:20:00Z',
      },
    ];
  });

  // Improvement Suggestions State ("Help us improve")
  const [suggestions, setSuggestions] = useState<ImprovementSuggestion[]>(() => {
    const saved = localStorage.getItem('aura_suggestions');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: 'SUG-2026-0001',
        hotel_id: 'HOTEL001',
        customer_name: 'Ananya Sharma',
        category: 'Activities',
        title: 'Sunrise Beach Cycling Tours',
        suggestion: 'Add guided coastal hybrid bicycle rentals for exploring South Goa coastal roads at dawn.',
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
        title: 'Dairy-Free & Vegan Dessert Selection',
        suggestion: 'Introduce dairy-free artisanal gelato or coconut mango panna cotta to the poolside lounge.',
        status: 'Reviewing',
        adminNotes: 'Executive Chef Arun is testing coconut milk mango chia desserts.',
        created_at: '2026-09-01T15:30:00Z',
        updated_at: '2026-09-01T16:00:00Z',
      },
      {
        id: 'SUG-2026-0003',
        hotel_id: 'HOTEL001',
        customer_name: 'Kavita Krishnan',
        category: 'Service',
        title: 'EV Fast Charging Stations in Parking Lot',
        suggestion: 'Add dual-port EV chargers for guests driving from Mumbai and Bangalore.',
        status: 'Implemented',
        adminNotes: 'Installed 2x 22kW Type-2 AC chargers in North parking zone.',
        created_at: '2026-08-25T14:10:00Z',
        updated_at: '2026-08-29T12:00:00Z',
      },
    ];
  });

  // Complaint Counters (Database-driven stats)
  const [complaintStats, setComplaintStats] = useState<ComplaintStats>({
    total: 3,
    pending: 0,
    assigned: 1,
    in_progress: 1,
    resolved: 1,
    closed: 0,
  });

  // Food Order Counters (Database-driven stats)
  const [foodOrderStats, setFoodOrderStats] = useState<FoodOrderStats>({
    total: 3,
    new: 0,
    preparing: 1,
    ready: 1,
    picked_up: 0,
    delivered: 1,
    cancelled: 0,
  });

  // Feedback Analytics
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<FeedbackAnalytics>({
    total: 3,
    averageRating: 4.7,
    ratingDistribution: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 },
    positiveCount: 3,
    negativeCount: 0,
    suggestionsCount: 2,
    categoryBreakdown: { 'Overall Experience': 1, 'Food': 1, 'Cleanliness': 1 },
  });

  // Local storage synchronization
  useEffect(() => {
    if (authUser) {
      localStorage.setItem('aura_auth_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('aura_auth_user');
    }
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem('aura_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('aura_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('aura_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('aura_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('aura_food_orders', JSON.stringify(foodOrders));
  }, [foodOrders]);

  useEffect(() => {
    localStorage.setItem('aura_food_items', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('aura_housekeeping', JSON.stringify(housekeepingTasks));
  }, [housekeepingTasks]);

  useEffect(() => {
    localStorage.setItem('aura_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('aura_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('aura_activities', JSON.stringify(activityBookings));
  }, [activityBookings]);

  useEffect(() => {
    localStorage.setItem('aura_maintenance', JSON.stringify(maintenanceRequests));
  }, [maintenanceRequests]);

  useEffect(() => {
    localStorage.setItem('aura_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('aura_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('aura_feedback', JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    localStorage.setItem('aura_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  // Real-time live synchronization with backend database
  const refreshLiveState = async () => {
    try {
      const res = await fetch('/api/sync/live-state');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.complaintStats) setComplaintStats(data.complaintStats);
          if (data.orderStats) setFoodOrderStats(data.orderStats);
          if (data.feedbackStats) setFeedbackAnalytics(data.feedbackStats);
          if (Array.isArray(data.recentComplaints) && data.recentComplaints.length > 0) {
            setComplaints((prev) => {
              const existingIds = new Set(prev.map((c) => c.id));
              const newItems = data.recentComplaints.filter((c: Complaint) => !existingIds.has(c.id));
              // Also update status of existing items from server
              const updated = prev.map((c) => {
                const serverMatch = data.recentComplaints.find((sc: Complaint) => sc.id === c.id);
                return serverMatch ? { ...c, ...serverMatch } : c;
              });
              return [...newItems, ...updated];
            });
          }
          if (Array.isArray(data.recentOrders) && data.recentOrders.length > 0) {
            setFoodOrders((prev) => {
              const existingIds = new Set(prev.map((o) => o.id));
              const newItems = data.recentOrders.filter((o: FoodOrder) => !existingIds.has(o.id));
              const updated = prev.map((o) => {
                const serverMatch = data.recentOrders.find((so: FoodOrder) => so.id === o.id);
                return serverMatch ? { ...o, ...serverMatch } : o;
              });
              return [...newItems, ...updated];
            });
          }
        }
      }
    } catch {
      // Offline fallback: keep client-authoritative state
    }
  };

  // Polling loop for multi-tab / real-time updates
  useEffect(() => {
    refreshLiveState();
    const interval = setInterval(refreshLiveState, 3500);
    return () => clearInterval(interval);
  }, []);

  // Notifications helper
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Rooms
  const updateRoomStatus = (roomNumber: string, status: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) => (r.number === roomNumber ? { ...r, status } : r))
    );
    addNotification({
      title: `Room ${roomNumber} Status Updated`,
      message: `Status transitioned to ${status.toUpperCase()}.`,
      type: 'alert',
      roomNumber,
      targetRole: 'reception',
    });
  };

  // Bookings & Reception Management
  const createBooking = (data: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const newBookingId = `#HTL${Math.floor(10000 + Math.random() * 90000)}`;
    const newCustomerId = data.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...data,
      id: newBookingId,
      customerId: newCustomerId,
      guestStatus: data.guestStatus || (data.status === 'Checked In' ? 'Checked-in' : 'Reserved'),
      auditLogs: data.auditLogs || [
        {
          id: `aud-${Date.now()}`,
          bookingId: newBookingId,
          guestName: data.guestName,
          roomNumber: data.roomNumber,
          action: 'Registered new customer',
          performedBy: authUser?.name ? `${authUser.name} (${authUser.role})` : 'Priya Sharma (Receptionist)',
          fieldChanged: 'New Registration',
          oldValue: 'N/A',
          newValue: `Room ${data.roomNumber}, ${data.guestName}`,
          timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    
    // Update room status to occupied or reserved
    updateRoomStatus(data.roomNumber, data.status === 'Checked In' ? 'occupied' : 'reserved');

    // Notify guest & reception
    addNotification({
      title: 'Booking Confirmed ✅',
      message: `Reservation ${newBookingId} for Room ${data.roomNumber} (${data.roomType}) confirmed for ${data.guestName}.`,
      type: 'booking',
      roomNumber: data.roomNumber,
    });
    addNotification({
      title: 'New Reservation Received 🛎️',
      message: `${data.guestName} booked Room ${data.roomNumber} (${data.checkIn} to ${data.checkOut}). Total: ₹${data.totalAmount.toLocaleString('en-IN')}`,
      type: 'booking',
      targetRole: 'reception',
    });

    // Synchronize with central backend database in background
    fetch('/api/reception/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newBooking,
        actor: authUser?.name ? `${authUser.name} (${authUser.role})` : 'Priya Sharma (Receptionist)',
      }),
    }).catch((err) => console.warn('Background sync to /api/reception/guests failed (offline fallback active):', err));

    return newBooking;
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    let affectedBooking: Booking | undefined;

    setBookings((prev) => {
      const b = prev.find((item) => item.id === id || item.customerId === id);
      if (b) {
        affectedBooking = b;
        if (status === 'Checked In') {
          updateRoomStatus(b.roomNumber, 'occupied');
        } else if (status === 'Checked Out') {
          updateRoomStatus(b.roomNumber, 'cleaning');
          // Automatically dispatch cleaning task for Housekeeping
          requestHousekeeping({
            roomNumber: b.roomNumber,
            type: 'Routine Cleaning',
            priority: 'High',
            notes: `Guest ${b.guestName} checked out. Turnover cleaning and restock amenities.`,
            requestedBy: 'Reception',
          });
        } else if (status === 'Cancelled') {
          updateRoomStatus(b.roomNumber, 'available');
        }
      }

      const mappedGuestStatus = status === 'Checked In' ? 'Checked-in' : status === 'Checked Out' ? 'Checked-out' : 'Reserved';

      return prev.map((item) => {
        if (item.id === id || item.customerId === id) {
          const newAudit = {
            id: `aud-${Date.now()}`,
            bookingId: item.id,
            guestName: item.guestName,
            roomNumber: item.roomNumber,
            action: status === 'Checked In' ? 'Checked-in guest' : status === 'Checked Out' ? 'Checked-out guest' : `Marked ${status}`,
            performedBy: authUser?.name ? `${authUser.name} (${authUser.role})` : 'Priya Sharma (Receptionist)',
            fieldChanged: 'Status',
            oldValue: item.status,
            newValue: status,
            timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          };

          return {
            ...item,
            status,
            guestStatus: mappedGuestStatus,
            auditLogs: [newAudit, ...(item.auditLogs || [])],
          };
        }
        return item;
      });
    });

    addNotification({
      title: `Booking ${id} Status: ${status}`,
      message: `Booking has been marked as ${status}.`,
      type: 'booking',
    });

    // Background sync to backend endpoint
    const endpoint = status === 'Checked In' ? `/api/reception/guests/${id}/checkin` : status === 'Checked Out' ? `/api/reception/guests/${id}/checkout` : null;
    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: authUser?.name ? `${authUser.name} (${authUser.role})` : 'Priya Sharma (Receptionist)' }),
      }).catch((err) => console.warn('Background checkin/checkout sync failed:', err));
    }
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((item) => {
        if (item.id === id || item.customerId === id) {
          // Track audit changes
          const changeAudits: any[] = [];
          const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          const actor = authUser?.name ? `${authUser.name} (${authUser.role})` : 'Priya Sharma (Receptionist)';

          if (updates.guestPhone && updates.guestPhone !== item.guestPhone) {
            changeAudits.push({
              id: `aud-${Date.now()}-1`,
              bookingId: item.id,
              guestName: updates.guestName || item.guestName,
              roomNumber: updates.roomNumber || item.roomNumber,
              action: 'Changed customer phone number',
              performedBy: actor,
              fieldChanged: 'Phone',
              oldValue: item.guestPhone,
              newValue: updates.guestPhone,
              timestamp,
            });
          }
          if (updates.guestName && updates.guestName !== item.guestName) {
            changeAudits.push({
              id: `aud-${Date.now()}-2`,
              bookingId: item.id,
              guestName: updates.guestName,
              roomNumber: updates.roomNumber || item.roomNumber,
              action: 'Changed customer name',
              performedBy: actor,
              fieldChanged: 'Name',
              oldValue: item.guestName,
              newValue: updates.guestName,
              timestamp,
            });
          }
          if (updates.roomNumber && updates.roomNumber !== item.roomNumber) {
            changeAudits.push({
              id: `aud-${Date.now()}-3`,
              bookingId: item.id,
              guestName: updates.guestName || item.guestName,
              roomNumber: updates.roomNumber,
              action: 'Changed room assignment',
              performedBy: actor,
              fieldChanged: 'Room Number',
              oldValue: item.roomNumber,
              newValue: updates.roomNumber,
              timestamp,
            });
            // Update old room to available, new room to reserved/occupied
            updateRoomStatus(item.roomNumber, 'available');
            updateRoomStatus(updates.roomNumber, item.status === 'Checked In' ? 'occupied' : 'reserved');
          }

          return {
            ...item,
            ...updates,
            auditLogs: [...changeAudits, ...(item.auditLogs || [])],
          };
        }
        return item;
      })
    );

    // Sync to backend database
    fetch(`/api/reception/guests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updates,
        actor: authUser?.name ? `${authUser.name} (${authUser.role})` : 'Priya Sharma (Receptionist)',
      }),
    }).catch((err) => console.warn('Background sync to /api/reception/guests/:id failed:', err));
  };

  // Food Ordering
  const placeFoodOrder = (
    data: Omit<FoodOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): FoodOrder => {
    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: FoodOrder = {
      ...data,
      id: orderId,
      status: 'New',
      createdAt: 'Just now',
      updatedAt: 'Just now',
    };

    setFoodOrders((prev) => [newOrder, ...prev]);

    // Also link food charge to active room booking if room service
    if (data.orderLocation === 'Room Service') {
      const roomNum = data.roomOrTableNumber.replace('Room ', '').trim();
      setBookings((prev) =>
        prev.map((b) => {
          if (b.roomNumber === roomNum && b.status === 'Checked In') {
            const newFoodCharge = b.foodCharges + data.total;
            const newTaxes = Math.round((b.roomCharges + newFoodCharge + b.spaCharges) * 0.18);
            return {
              ...b,
              foodCharges: newFoodCharge,
              taxes: newTaxes,
              totalAmount: b.roomCharges + newFoodCharge + b.spaCharges + newTaxes,
            };
          }
          return b;
        })
      );
    }

    addNotification({
      title: `Food Order ${orderId} Placed 🍽️`,
      message: `Order for ${data.roomOrTableNumber} (${data.items.length} items, ₹${data.total}) sent to Kitchen.`,
      type: 'food',
      targetRole: 'kitchen',
      roomNumber: data.roomOrTableNumber.replace('Room ', '').trim(),
    });

    addNotification({
      title: 'Order Placed with Kitchen 👨🍳',
      message: `Your food order ${orderId} has been submitted! Our chefs are preparing your delicious meal.`,
      type: 'food',
      roomNumber: data.roomOrTableNumber.replace('Room ', '').trim(),
    });

    // Send to backend API
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.order) {
          setFoodOrders((prev) =>
            prev.map((o) => (o.id === orderId ? resData.order : o))
          );
          refreshLiveState();
        }
      })
      .catch(() => {});

    return newOrder;
  };

  const updateFoodOrderStatus = (
    id: string,
    status: FoodOrderStatus,
    waiterName?: string
  ) => {
    setFoodOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              updatedAt: 'Just now',
              ...(waiterName ? { assignedWaiter: waiterName } : {}),
            }
          : o
      )
    );

    const order = foodOrders.find((o) => o.id === id);
    const room = order?.roomOrTableNumber.replace('Room ', '').trim();

    if (status === 'Preparing') {
      addNotification({
        title: `Food Preparing 🍳 (${id})`,
        message: `Kitchen is preparing order ${id} for ${order?.roomOrTableNumber}.`,
        type: 'food',
        roomNumber: room,
      });
    } else if (status === 'Ready') {
      addNotification({
        title: `Food Ready for Pick Up 🔔 (${id})`,
        message: `Order ${id} for ${order?.roomOrTableNumber} is ready at Kitchen pass counter.`,
        type: 'food',
        targetRole: 'waiter',
        roomNumber: room,
      });
    } else if (status === 'Picked Up') {
      addNotification({
        title: `Food on the Way! 🛵 (${id})`,
        message: `Your food is picked up and arriving at ${order?.roomOrTableNumber} shortly.`,
        type: 'food',
        roomNumber: room,
      });
    } else if (status === 'Delivered') {
      addNotification({
        title: `Food Delivered! Enjoy Your Meal 🍽️ (${id})`,
        message: `Order ${id} has been delivered to ${order?.roomOrTableNumber}. Bon Appétit!`,
        type: 'food',
        roomNumber: room,
      });
    }

    // Backend sync
    const token = localStorage.getItem('aura_token') || '';
    fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-user-role': authUser?.role || activeRole,
      },
      body: JSON.stringify({ status, assignedWaiter: waiterName }),
    })
      .then(() => refreshLiveState())
      .catch(() => {});
  };

  // ============================================================================
  // CHEF DASHBOARD & MENU MANAGEMENT METHODS
  // ============================================================================

  const reloadMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setFoodItems(data);
          localStorage.setItem('aura_food_items', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.warn('Could not fetch menu from server, using local menu state:', e);
    }
  };

  // Fetch menu on initial mount
  useEffect(() => {
    reloadMenu();
  }, []);

  const addFoodItem = async (itemData: Omit<FoodItem, 'id'>): Promise<FoodItem> => {
    const tempId = `food-${Date.now()}`;
    const newItem: FoodItem = {
      ...itemData,
      id: tempId,
    };

    // Optimistic local state update
    setFoodItems((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem('aura_food_items', JSON.stringify(updated));
      return updated;
    });

    addNotification({
      title: `New Dish Added: ${newItem.name} 🍽️`,
      message: `Chef added ${newItem.name} (₹${newItem.price}) to ${newItem.category}.`,
      type: 'food',
      targetRole: 'kitchen',
    });

    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setFoodItems((prev) => {
            const updated = prev.map((f) => (f.id === tempId ? data.item : f));
            localStorage.setItem('aura_food_items', JSON.stringify(updated));
            return updated;
          });
          return data.item;
        }
      }
    } catch (e) {
      console.warn('Backend menu item creation failed, saved locally:', e);
    }
    return newItem;
  };

  const updateFoodItem = async (id: string, updates: Partial<FoodItem>): Promise<void> => {
    // Optimistic update
    setFoodItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      localStorage.setItem('aura_food_items', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Backend menu item update failed:', e);
    }
  };

  const deleteFoodItem = async (id: string): Promise<void> => {
    const itemToDelete = foodItems.find((f) => f.id === id);
    setFoodItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('aura_food_items', JSON.stringify(updated));
      return updated;
    });

    addNotification({
      title: `Dish Removed: ${itemToDelete?.name || id} 🗑️`,
      message: `Chef removed ${itemToDelete?.name || id} from the active menu catalog.`,
      type: 'food',
      targetRole: 'kitchen',
    });

    try {
      await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Backend menu item deletion failed:', e);
    }
  };

  const toggleFoodItemAvailability = async (id: string): Promise<void> => {
    const target = foodItems.find((item) => item.id === id);
    if (!target) return;
    const newStatus = !target.isAvailable;

    // Instant local state update
    setFoodItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isAvailable: newStatus } : item
      );
      localStorage.setItem('aura_food_items', JSON.stringify(updated));
      return updated;
    });

    addNotification({
      title: `${target.name} is now ${newStatus ? '🟢 Available' : '🔴 Unavailable'}`,
      message: `Chef switched availability status. Customer dining menu updated immediately.`,
      type: 'food',
      targetRole: 'kitchen',
    });

    try {
      await fetch(`/api/menu/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
    } catch (e) {
      console.warn('Backend availability toggle failed:', e);
    }
  };

  const updateFoodItemPrice = async (id: string, newPrice: number): Promise<void> => {
    const target = foodItems.find((item) => item.id === id);
    if (!target) return;
    const oldPrice = target.price;

    // Instant local state update
    setFoodItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, price: newPrice } : item
      );
      localStorage.setItem('aura_food_items', JSON.stringify(updated));
      return updated;
    });

    addNotification({
      title: `Price Updated: ${target.name} 💰`,
      message: `Price updated from ₹${oldPrice} to ₹${newPrice}. Customer dining menu updated.`,
      type: 'food',
      targetRole: 'kitchen',
    });

    try {
      await fetch(`/api/menu/${id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice }),
      });
    } catch (e) {
      console.warn('Backend price update failed:', e);
    }
  };

  // Housekeeping
  const requestHousekeeping = (
    task: Omit<HousekeepingTask, 'id' | 'status' | 'createdAt'>
  ) => {
    const newTask: HousekeepingTask = {
      ...task,
      id: `hk-${Date.now()}`,
      status: 'Pending',
      createdAt: 'Just now',
    };
    setHousekeepingTasks((prev) => [newTask, ...prev]);

    // Update room status if routine cleaning
    if (task.type === 'Routine Cleaning' || task.type === 'Deep Cleaning') {
      updateRoomStatus(task.roomNumber, 'cleaning');
    }

    addNotification({
      title: `Housekeeping Request: Room ${task.roomNumber}`,
      message: `${task.type} requested. Priority: ${task.priority}`,
      type: 'housekeeping',
      targetRole: 'housekeeping',
      roomNumber: task.roomNumber,
    });
    addNotification({
      title: 'Housekeeping Request Received 🧹',
      message: `Our housekeeping team has been dispatched for ${task.type} at Room ${task.roomNumber}.`,
      type: 'housekeeping',
      roomNumber: task.roomNumber,
    });
  };

  const updateHousekeepingStatus = (
    id: string,
    status: HousekeepingTask['status']
  ) => {
    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );

    const task = housekeepingTasks.find((t) => t.id === id);
    if (task && status === 'Clean / Completed') {
      updateRoomStatus(task.roomNumber, 'available');
      addNotification({
        title: `Room ${task.roomNumber} Marked Clean ✨`,
        message: `${task.type} completed by housekeeping team. Room is now available.`,
        type: 'housekeeping',
        targetRole: 'manager',
        roomNumber: task.roomNumber,
      });
    }
  };

  // Complaints
  const submitComplaint = (
    complaint: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Complaint => {
    const compId = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComp: Complaint = {
      ...complaint,
      id: compId,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComplaints((prev) => [newComp, ...prev]);

    addNotification({
      title: `Complaint Registered (${compId}) ⚠️`,
      message: `Room ${complaint.roomNumber} logged a ${complaint.category} complaint with ${complaint.priority} priority.`,
      type: 'complaint',
      targetRole: 'manager',
    });
    addNotification({
      title: `Ticket ${compId} Logged 🎫`,
      message: `Your complaint regarding "${complaint.category}" has been received. Our manager will resolve it shortly.`,
      type: 'complaint',
      roomNumber: complaint.roomNumber,
    });

    // Send to backend API
    fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaint),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.complaint) {
          setComplaints((prev) =>
            prev.map((c) => (c.id === compId ? resData.complaint : c))
          );
          refreshLiveState();
        }
      })
      .catch(() => {});

    return newComp;
  };

  const updateComplaintStatus = (
    id: string,
    status: ComplaintStatus,
    assignedTo?: string,
    note?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              updatedAt: new Date().toISOString(),
              ...(assignedTo ? { assignedTo } : {}),
              ...(note ? { resolutionNote: note } : {}),
            }
          : c
      )
    );

    const complaint = complaints.find((c) => c.id === id);
    addNotification({
      title: `Complaint ${id} Updated: ${status}`,
      message: `Ticket status is now ${status}${assignedTo ? ` (Assigned to ${assignedTo})` : ''}.`,
      type: 'complaint',
      roomNumber: complaint?.roomNumber,
    });

    // Backend sync
    const token = localStorage.getItem('aura_token') || '';
    fetch(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-user-role': authUser?.role || activeRole,
      },
      body: JSON.stringify({ status, assignedTo, resolutionNote: note }),
    })
      .then(() => refreshLiveState())
      .catch(() => {});
  };

  // Customer Feedback
  const submitFeedback = async (
    data: Omit<CustomerFeedback, 'id' | 'status' | 'created_at'>
  ): Promise<CustomerFeedback> => {
    const tempId = `FDB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFeedback: CustomerFeedback = {
      ...data,
      id: tempId,
      status: 'Active',
      created_at: new Date().toISOString(),
    };

    setFeedbackList((prev) => [newFeedback, ...prev]);

    setFeedbackAnalytics((prev) => {
      const newTotal = prev.total + 1;
      const newDistribution = {
        ...prev.ratingDistribution,
        [data.rating]: (prev.ratingDistribution[data.rating as keyof typeof prev.ratingDistribution] || 0) + 1,
      };
      const newAvg = Number(
        (
          (prev.averageRating * prev.total + data.rating) /
          newTotal
        ).toFixed(1)
      );
      return {
        ...prev,
        total: newTotal,
        averageRating: newAvg,
        ratingDistribution: newDistribution,
        positiveCount: data.rating >= 4 ? prev.positiveCount + 1 : prev.positiveCount,
        negativeCount: data.rating <= 2 ? prev.negativeCount + 1 : prev.negativeCount,
        suggestionsCount: data.suggestion?.trim() ? prev.suggestionsCount + 1 : prev.suggestionsCount,
      };
    });

    // If suggestion provided, also save to suggestions
    if (data.suggestion && data.suggestion.trim()) {
      submitSuggestion({
        hotel_id: data.hotel_id,
        customer_name: data.customer_name,
        category: data.category === 'Food' ? 'Food' : data.category === 'Room' ? 'Room' : 'Service',
        title: `Guest Suggestion: ${data.title || data.category}`,
        suggestion: data.suggestion,
      }).catch(() => {});
    }

    addNotification({
      title: `Guest Feedback (${data.rating}★) Received`,
      message: `${data.customer_name} shared feedback on ${data.category}: "${data.title}"`,
      type: 'alert',
      targetRole: 'manager',
    });

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.feedback) {
          setFeedbackList((prev) =>
            prev.map((f) => (f.id === tempId ? body.feedback : f))
          );
          if (body.analytics) setFeedbackAnalytics(body.analytics);
          return body.feedback;
        }
      }
    } catch {
      // offline fallback
    }

    return newFeedback;
  };

  // Hotel Improvement Suggestions ("Help us improve")
  const submitSuggestion = async (
    data: Omit<ImprovementSuggestion, 'id' | 'status' | 'created_at' | 'updated_at'>
  ): Promise<ImprovementSuggestion> => {
    const tempId = `SUG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSug: ImprovementSuggestion = {
      ...data,
      id: tempId,
      status: 'New',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSuggestions((prev) => [newSug, ...prev]);

    addNotification({
      title: 'New Improvement Suggestion 💡',
      message: `"${data.title}" submitted under ${data.category}. View in Manager Headquarters.`,
      type: 'alert',
      targetRole: 'manager',
    });

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.suggestion) {
          setSuggestions((prev) =>
            prev.map((s) => (s.id === tempId ? body.suggestion : s))
          );
          return body.suggestion;
        }
      }
    } catch {
      // offline fallback
    }

    return newSug;
  };

  const updateSuggestionStatus = async (
    id: string,
    status: SuggestionStatus,
    notes?: string
  ): Promise<void> => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              ...(notes !== undefined ? { adminNotes: notes } : {}),
              updated_at: new Date().toISOString(),
            }
          : s
      )
    );

    addNotification({
      title: `Suggestion ${id} Updated: ${status}`,
      message: `Status transitioned to ${status}.`,
      type: 'alert',
      targetRole: 'manager',
    });

    try {
      const token = localStorage.getItem('aura_token') || '';
      await fetch(`/api/suggestions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-user-role': authUser?.role || activeRole,
          'x-employee-id': authUser?.employee_id || '',
        },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
    } catch {
      // offline fallback
    }
  };

  // Reviews
  const submitReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newReview, ...prev]);

    addNotification({
      title: 'New Guest Review Submitted ⭐',
      message: `${review.guestName} rated their stay ${review.overallRating} / 5 stars.`,
      type: 'alert',
      targetRole: 'manager',
    });
  };

  const replyToReview = (id: string, reply: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, managerReply: reply } : r))
    );
  };

  // Activities
  const bookActivitySlot = (
    booking: Omit<ActivityBooking, 'id' | 'status' | 'createdAt'>
  ): ActivityBooking => {
    const actBookingId = `AB-${Math.floor(100 + Math.random() * 900)}`;
    const newActBooking: ActivityBooking = {
      ...booking,
      id: actBookingId,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };
    setActivityBookings((prev) => [newActBooking, ...prev]);

    // Add charge to room booking if any
    if (booking.totalPrice > 0) {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.roomNumber === booking.roomNumber && b.status === 'Checked In') {
            const newSpaCharge = b.spaCharges + booking.totalPrice;
            const newTaxes = Math.round((b.roomCharges + b.foodCharges + newSpaCharge) * 0.18);
            return {
              ...b,
              spaCharges: newSpaCharge,
              taxes: newTaxes,
              totalAmount: b.roomCharges + b.foodCharges + newSpaCharge + newTaxes,
            };
          }
          return b;
        })
      );
    }

    addNotification({
      title: `Activity Booked! 🏊 (${booking.activityTitle})`,
      message: `Slot confirmed for ${booking.guestName} (${booking.participants} persons) on ${booking.date} at ${booking.timeSlot}.`,
      type: 'booking',
      roomNumber: booking.roomNumber,
    });

    return newActBooking;
  };

  // Maintenance
  const submitMaintenance = (
    req: Omit<MaintenanceRequest, 'id' | 'status' | 'createdAt'>
  ) => {
    const newReq: MaintenanceRequest = {
      ...req,
      id: `maint-${Date.now()}`,
      status: 'Open',
      createdAt: 'Just now',
    };
    setMaintenanceRequests((prev) => [newReq, ...prev]);

    addNotification({
      title: `Maintenance Request for ${req.roomNumber}`,
      message: `Issue reported: ${req.problem} (Priority: ${req.priority})`,
      type: 'alert',
      targetRole: 'manager',
    });
  };

  const updateMaintenanceStatus = (
    id: string,
    status: MaintenanceRequest['status']
  ) => {
    setMaintenanceRequests((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  // Inventory
  const updateInventoryQuantity = (id: string, newQuantity: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isLow = newQuantity <= item.minThreshold;
          if (isLow && item.quantity > item.minThreshold) {
            addNotification({
              title: `⚠️ Low Stock Alert: ${item.name}`,
              message: `${item.name} is down to ${newQuantity} ${item.unit} (Minimum: ${item.minThreshold} ${item.unit}).`,
              type: 'alert',
              targetRole: 'manager',
            });
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Role routing helper
  const roleToActiveRole = (role: string): ActiveRole => {
    switch (role) {
      case 'CHEF': return 'kitchen';
      case 'WAITER': return 'waiter';
      case 'HOUSEKEEPING': return 'housekeeping';
      case 'RECEPTIONIST': return 'reception';
      case 'MAINTENANCE': return 'maintenance';
      case 'MANAGER': return 'manager';
      case 'OWNER': return 'owner';
      default: return 'guest';
    }
  };

  // RBAC Authorization Guard
  const isRoleAuthorized = (role: ActiveRole): boolean => {
    if (role === 'guest' || role === 'login') return true;
    if (!authUser) return false;
    if (authUser.role === 'OWNER') return true;
    if (authUser.role === 'MANAGER') {
      return role !== 'owner';
    }
    switch (role) {
      case 'kitchen':
        return authUser.role === 'CHEF';
      case 'waiter':
        return authUser.role === 'WAITER';
      case 'housekeeping':
        return authUser.role === 'HOUSEKEEPING';
      case 'reception':
        return authUser.role === 'RECEPTIONIST';
      case 'maintenance':
        return authUser.role === 'MAINTENANCE';
      case 'kitchen-waiter':
        return authUser.role === 'CHEF' || authUser.role === 'WAITER';
      case 'manager':
        return authUser.role === 'MANAGER' || authUser.role === 'OWNER';
      case 'owner':
        return authUser.role === 'OWNER';
      default:
        return false;
    }
  };

  // Audit log helper
  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
    fetch('/api/staff/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    }).catch(() => {});
  };

  // Authentication: Login
  const login = async (
    identifier: string,
    password: string,
    expectedCategory?: 'manager' | 'employee'
  ): Promise<{ success: boolean; error?: string; targetRole?: ActiveRole }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, expectedRoleCategory: expectedCategory }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed.' };
      }

      const loggedInUser: AuthUser = {
        ...data.user,
        token: data.token,
      };

      setAuthUser(loggedInUser);

      if (loggedInUser.first_login) {
        setShowFirstLoginModal(true);
      }

      const targetRole = roleToActiveRole(loggedInUser.role);
      setActiveRole(targetRole);

      addNotification({
        title: `Welcome back, ${loggedInUser.full_name}! 👋`,
        message: `Signed in as ${loggedInUser.role} (${loggedInUser.employee_id}). Department: ${loggedInUser.department}.`,
        type: 'alert',
        targetRole: targetRole,
      });

      return { success: true, targetRole };
    } catch {
      // Fallback in-browser logic
      const clean = identifier.trim().toLowerCase();
      const emp = employees.find(
        (e) =>
          e.employee_id.toLowerCase() === clean ||
          e.email.toLowerCase() === clean ||
          e.full_name.toLowerCase() === clean
      );
      if (!emp) {
        return { success: false, error: 'Account not found. Please check your credentials.' };
      }
      if (emp.password !== password && emp.temporary_password !== password) {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }
      if (emp.status === 'INACTIVE') {
        return {
          success: false,
          error: 'Access Denied: Your employee account has been deactivated. Please contact the Hotel General Manager.',
        };
      }
      if (expectedCategory === 'manager' && !['MANAGER', 'OWNER'].includes(emp.role)) {
        return {
          success: false,
          error: `Access Denied: ${emp.full_name} is registered as ${emp.role}. Please use Employee Login portal.`,
        };
      }

      const loggedInUser: AuthUser = {
        id: emp.id,
        employee_id: emp.employee_id,
        full_name: emp.full_name,
        email: emp.email,
        role: emp.role,
        status: emp.status,
        department: emp.department,
        first_login: emp.first_login,
        hotel_id: emp.hotel_id,
        token: `local_token_${Date.now()}`,
        last_login: 'Just now',
      };

      setAuthUser(loggedInUser);
      if (loggedInUser.first_login) {
        setShowFirstLoginModal(true);
      }
      const targetRole = roleToActiveRole(loggedInUser.role);
      setActiveRole(targetRole);
      return { success: true, targetRole };
    }
  };

  // Authentication: Logout
  const logout = () => {
    if (authUser) {
      addAuditLog({
        employee_id: authUser.employee_id,
        employee_name: authUser.full_name,
        role: authUser.role,
        action: 'Signed Out',
        details: 'User logged out of session.',
        type: 'login',
      });
    }
    setAuthUser(null);
    setActiveRole('guest');
    setGuestTab('home');
  };

  // Authentication: First-login password change
  const updatePasswordOnFirstLogin = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!authUser) return { success: false, error: 'No active user session.' };
    try {
      const res = await fetch('/api/auth/first-login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: authUser.employee_id,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Password update failed.' };
      }
      setAuthUser((prev) => (prev ? { ...prev, first_login: false } : null));
      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === authUser.employee_id
            ? { ...e, first_login: false, password: newPassword, temporary_password: undefined }
            : e
        )
      );
      setShowFirstLoginModal(false);
      return { success: true };
    } catch {
      setAuthUser((prev) => (prev ? { ...prev, first_login: false } : null));
      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === authUser.employee_id
            ? { ...e, first_login: false, password: newPassword, temporary_password: undefined }
            : e
        )
      );
      setShowFirstLoginModal(false);
      return { success: true };
    }
  };

  // Staff Management: Create Employee
  const createEmployee = async (empData: Partial<Employee>) => {
    try {
      const res = await fetch('/api/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...empData,
          created_by: authUser?.employee_id || 'MANAGER',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create employee.' };
      }
      setEmployees((prev) => [...prev, data.employee]);
      addAuditLog({
        employee_id: authUser?.employee_id || 'EMP1001',
        employee_name: authUser?.full_name || 'Manager',
        role: authUser?.role || 'MANAGER',
        action: 'Employee Created',
        details: `Created account for ${data.employee.full_name} (${data.employee.employee_id}, ${data.employee.role}).`,
        type: 'account',
      });
      return { success: true, employee: data.employee };
    } catch {
      const generatedId = empData.employee_id || `EMP${Math.floor(1000 + Math.random() * 9000)}`;
      const tempPass = empData.temporary_password || `Aura@${Math.floor(1000 + Math.random() * 9000)}`;
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        employee_id: generatedId,
        full_name: empData.full_name || 'New Staff',
        email: empData.email || `${empData.full_name?.toLowerCase().replace(/\s+/g, '.')}@aurapalms.com`,
        phone: empData.phone || '+91 98000 00000',
        role: empData.role || 'WAITER',
        department: empData.department || 'Operations',
        shift: empData.shift || 'Morning (6 AM - 2 PM)',
        status: empData.status || 'ACTIVE',
        hotel_id: 'HOTEL001',
        created_by: authUser?.employee_id || 'MANAGER',
        created_at: new Date().toISOString().split('T')[0],
        last_login: 'Never (New Hire)',
        first_login: true,
        temporary_password: tempPass,
        password: tempPass,
        assigned_tasks: 0,
        rating: 5.0,
      };
      setEmployees((prev) => [...prev, newEmp]);
      return { success: true, employee: newEmp };
    }
  };

  // Staff Management: Update Employee
  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setEmployees((prev) => prev.map((e) => (e.id === id || e.employee_id === id ? { ...e, ...updates } : e)));
      return { success: true };
    } catch {
      setEmployees((prev) => prev.map((e) => (e.id === id || e.employee_id === id ? { ...e, ...updates } : e)));
      return { success: true };
    }
  };

  // Staff Management: Disable / Enable Account
  const toggleEmployeeStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/staff/${id}/toggle-status`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      const newStatus = data.employee.status;
      setEmployees((prev) => prev.map((e) => (e.id === id || e.employee_id === id ? { ...e, status: newStatus } : e)));
      addAuditLog({
        employee_id: authUser?.employee_id || 'EMP1001',
        employee_name: authUser?.full_name || 'Manager',
        role: authUser?.role || 'MANAGER',
        action: newStatus === 'INACTIVE' ? 'Account Disabled' : 'Account Enabled',
        details: `Account status for ${data.employee.full_name} (${data.employee.employee_id}) changed to ${newStatus}.`,
        type: 'security',
      });
      return { success: true, status: newStatus };
    } catch {
      let newStatus: 'ACTIVE' | 'INACTIVE' = 'INACTIVE';
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id === id || e.employee_id === id) {
            newStatus = e.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            return { ...e, status: newStatus };
          }
          return e;
        })
      );
      return { success: true, status: newStatus };
    }
  };

  // Staff Management: Reset Temporary Password
  const resetEmployeePassword = async (id: string) => {
    try {
      const res = await fetch(`/api/staff/${id}/reset-password`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id || e.employee_id === id
            ? { ...e, temporary_password: data.temporary_password, password: data.temporary_password, first_login: true }
            : e
        )
      );
      addAuditLog({
        employee_id: authUser?.employee_id || 'EMP1001',
        employee_name: authUser?.full_name || 'Manager',
        role: authUser?.role || 'MANAGER',
        action: 'Password Reset',
        details: `Temporary password generated for ${data.employee.full_name} (${data.employee.employee_id}).`,
        type: 'security',
      });
      return { success: true, temporary_password: data.temporary_password };
    } catch {
      const tempPass = `Aura@${Math.floor(1000 + Math.random() * 9000)}`;
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === id || e.employee_id === id
            ? { ...e, temporary_password: tempPass, password: tempPass, first_login: true }
            : e
        )
      );
      return { success: true, temporary_password: tempPass };
    }
  };

  const activeGuestBooking = bookings.find(
    (b) => b.roomNumber === activeGuestRoom && (b.status === 'Checked In' || b.status === 'Confirmed')
  ) || bookings.find((b) => b.roomNumber === activeGuestRoom) || bookings[0];

  return (
    <HotelContext.Provider
      value={{
        activeRole,
        setActiveRole,
        guestTab,
        setGuestTab,
        activeGuestRoom,
        setActiveGuestRoom,
        activeGuestBooking,
        authUser,
        login,
        logout,
        updatePasswordOnFirstLogin,
        showFirstLoginModal,
        setShowFirstLoginModal,
        isRoleAuthorized,
        employees,
        createEmployee,
        updateEmployee,
        toggleEmployeeStatus,
        resetEmployeePassword,
        auditLogs,
        addAuditLog,
        rooms,
        updateRoomStatus,
        bookings,
        createBooking,
        updateBookingStatus,
        updateBooking,
        foodOrders,
        placeFoodOrder,
        updateFoodOrderStatus,
        foodItems,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        toggleFoodItemAvailability,
        updateFoodItemPrice,
        reloadMenu,
        housekeepingTasks,
        requestHousekeeping,
        updateHousekeepingStatus,
        complaints,
        submitComplaint,
        updateComplaintStatus,
        complaintStats,
        foodOrderStats,
        feedbackList,
        feedbackAnalytics,
        submitFeedback,
        suggestions,
        submitSuggestion,
        updateSuggestionStatus,
        refreshLiveState,
        reviews,
        submitReview,
        replyToReview,
        activityBookings,
        bookActivitySlot,
        maintenanceRequests,
        submitMaintenance,
        updateMaintenanceStatus,
        inventory,
        updateInventoryQuantity,
        staff,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        invoiceBooking,
        setInvoiceBooking,
        invoiceOrder,
        setInvoiceOrder,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
