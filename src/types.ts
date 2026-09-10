export type RoomType = 'Deluxe' | 'Premium' | 'Suite' | 'Family' | 'Villa' | 'Presidential Suite';

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved';

export interface Room {
  id: string;
  number: string;
  name: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  bedType: string;
  sizeSqFt: number;
  floor: number;
  image: string;
  amenities: string[];
  status: RoomStatus;
  description: string;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Checked In'
  | 'Checked Out'
  | 'Cancelled'
  | 'No Show'
  | 'Refunded';

export type GuestStatus = 'Reserved' | 'Checked-in' | 'Checked-out';

export interface GuestAuditLog {
  id: string;
  bookingId: string;
  guestName: string;
  roomNumber?: string;
  action: string;
  performedBy: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export type BookingType = 'Direct' | 'Online' | 'Corporate' | 'Walk-in';

export type ReceptionMessageType =
  | 'checkin_reminder'
  | 'checkout_reminder'
  | 'room_ready'
  | 'welcome_greeting'
  | 'booking_confirmation'
  | 'booking_modification'
  | 'important_announcement'
  | 'payment_reminder'
  | 'room_service'
  | 'general_message';

export interface ReceptionMessage {
  id: string;
  bookingId: string;
  guestName: string;
  roomNumber: string;
  guestPhone: string;
  guestEmail: string;
  type: ReceptionMessageType;
  subject: string;
  messageText: string;
  channels: ('In-App' | 'Email' | 'SMS / WhatsApp')[];
  status: 'Sent' | 'Delivered' | 'Read';
  sentBy: string;
  sentAt: string;
}

export interface CustomerCorrectionRequest {
  id: string;
  guestName: string;
  roomNumber: string;
  bookingId: string;
  field: string;
  currentValue: string;
  requestedValue: string;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  source: 'ARIA' | 'Resort AI' | 'Guest Portal';
  createdAt: string;
}

export interface Booking {
  id: string; // e.g. #HTL10234
  customerId?: string; // e.g. CUST-1001
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress?: string;
  guestIdVerified: boolean;
  idProofType?: string;
  idProofNumber?: string;
  roomNumber: string;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  guestsCount: number;
  nights: number;
  bookingType?: 'Direct' | 'Online' | 'Walk-in' | 'Corporate';
  status: BookingStatus;
  guestStatus?: GuestStatus;
  paymentMethod: 'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Wallet' | 'Pay at Desk' | 'Cash';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Partial';
  roomCharges: number;
  foodCharges: number;
  spaCharges: number;
  taxes: number;
  totalAmount: number;
  specialRequests?: string;
  auditLogs?: GuestAuditLog[];
  createdAt: string;
}

export type FoodCategory =
  | 'Breakfast'
  | 'Starters'
  | 'Main Course'
  | 'Indian'
  | 'Chinese'
  | 'Italian'
  | 'South Indian'
  | 'Desserts'
  | 'Beverages'
  | 'Snacks'
  | 'Kids Menu'
  | 'Pizza'
  | 'Burger'
  | 'Vegetarian';

export type SpiceLevel = 'None' | 'Mild' | 'Medium' | 'Spicy' | 'Extra Spicy';

export type MealTime = 'Breakfast' | 'Lunch' | 'Dinner' | 'All Day';
export type MealAvailability = MealTime;

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory | string;
  price: number;
  rating: number;
  reviewsCount: number;
  isVeg: boolean;
  prepTime: string;
  description: string;
  image: string;
  isAvailable?: boolean;
  isChefSpecial?: boolean;
  isRecommended?: boolean;
  availableTimes?: (MealTime | string)[];
  spiceLevel?: SpiceLevel;
  allergens?: string[];
  ingredients?: string[];
}

export type FoodOrderLocation =
  | 'Room Service'
  | 'Restaurant Table'
  | 'Pool Area'
  | 'Cafe'
  | 'Lounge';

export type FoodOrderStatus =
  | 'New'
  | 'Preparing'
  | 'Ready'
  | 'Picked Up'
  | 'Delivered'
  | 'Cancelled';

export interface FoodOrderItem {
  item: FoodItem;
  quantity: number;
}

export interface FoodOrder {
  id: string; // e.g. #1024
  orderLocation: FoodOrderLocation;
  roomOrTableNumber: string;
  guestName: string;
  items: FoodOrderItem[];
  total: number;
  status: FoodOrderStatus;
  assignedWaiter?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityCategory = 'Wellness' | 'Water' | 'Adventure' | 'Recreation' | 'Evening';

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  icon: string;
  duration: string;
  timing: string;
  pricePerPerson: number;
  isComplimentary: boolean;
  isAvailable?: boolean;
  indoorOutdoor?: 'Indoor' | 'Outdoor' | string;
  capacity?: string;
  suitableFor?: string[];
  description: string;
  image: string;
  slotsAvailable: number;
  location: string;
}

export interface ActivityBooking {
  id: string;
  activityId: string;
  activityTitle: string;
  guestName: string;
  roomNumber: string;
  date: string;
  timeSlot: string;
  participants: number;
  totalPrice: number;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export type HousekeepingType =
  | 'Routine Cleaning'
  | 'Deep Cleaning'
  | 'Extra Towels'
  | 'Toiletries Refill'
  | 'Linen Change'
  | 'Turndown Service';

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  type: HousekeepingType;
  requestedBy: 'Guest' | 'Reception' | 'Scheduled';
  status: 'Pending' | 'In Progress' | 'Clean / Completed';
  priority: 'Normal' | 'High';
  notes?: string;
  assignedStaff?: string;
  createdAt: string;
}

export type ComplaintCategory =
  | 'Room'
  | 'Food'
  | 'Service'
  | 'Staff'
  | 'Housekeeping'
  | 'Cleanliness'
  | 'WiFi'
  | 'Maintenance'
  | 'Payment'
  | 'Booking'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High';

export type ComplaintStatus = 'Pending' | 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';

export interface Complaint {
  id: string; // e.g. CMP-2026-0001
  hotel_id?: string;
  guestName: string;
  roomNumber: string;
  category: ComplaintCategory | string;
  title?: string;
  description: string;
  imageUrl?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedTo?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type FeedbackCategory =
  | 'Room'
  | 'Food'
  | 'Staff'
  | 'Cleanliness'
  | 'Service'
  | 'Activities'
  | 'Overall Experience'
  | 'Website'
  | 'Other';

export interface CustomerFeedback {
  id: string; // e.g. FDB-2026-0001
  hotel_id: string;
  customer_name: string;
  room_number?: string;
  booking_id?: string;
  order_id?: string;
  category: FeedbackCategory | string;
  rating: number; // 1 to 5
  title: string;
  message: string;
  suggestion?: string;
  status: 'Active' | 'Addressed';
  created_at: string;
}

export type SuggestionCategory =
  | 'Amenities'
  | 'Food & Beverage'
  | 'Activities & Entertainment'
  | 'Room Comfort'
  | 'Wellness & Spa'
  | 'Technology & Wi-Fi'
  | 'Eco & Green Initiatives'
  | 'Other';

export type SuggestionStatus =
  | 'Pending'
  | 'New'
  | 'Reviewing'
  | 'Under Review'
  | 'Planned'
  | 'Implemented'
  | 'Rejected'
  | 'Dismissed';

export interface ImprovementSuggestion {
  id: string; // e.g. SUG-2026-0001
  hotel_id: string;
  customer_name: string;
  category: string;
  title: string;
  suggestion: string;
  status: SuggestionStatus;
  adminNotes?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface FoodOrderStats {
  total: number;
  new: number;
  preparing: number;
  ready: number;
  picked_up: number;
  delivered: number;
  cancelled: number;
}

export interface FeedbackAnalytics {
  total: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  positiveCount: number;
  negativeCount: number;
  suggestionsCount: number;
  categoryBreakdown: Record<string, number>;
}

export interface Review {
  id: string;
  guestName: string;
  stayDate?: string;
  roomType: string;
  overallRating: number;
  roomRating?: number;
  foodRating?: number;
  cleanlinessRating?: number;
  staffRating?: number;
  facilitiesRating?: number;
  categories?: {
    cleanliness?: number;
    food?: number;
    staff?: number;
    location?: number;
  };
  comment: string;
  managerReply?: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  roomNumber: string;
  problem: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedBy: string;
  assignedTechnician?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'F&B' | 'Housekeeping' | 'Beverages' | 'Linens';
  quantity: number;
  unit: string;
  minThreshold: number;
  supplier: string;
  lastRestocked: string;
}

export type EmployeeRole =
  | 'OWNER'
  | 'MANAGER'
  | 'RECEPTIONIST'
  | 'CHEF'
  | 'WAITER'
  | 'HOUSEKEEPING'
  | 'MAINTENANCE';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  id: string;
  employee_id: string; // e.g. EMP1024
  full_name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: string;
  shift: string;
  status: EmployeeStatus;
  hotel_id: string;
  created_by: string;
  created_at: string;
  last_login?: string;
  first_login: boolean;
  temporary_password?: string;
  password?: string;
  assigned_tasks?: number;
  rating?: number;
}

export interface AuditLogEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  role: string;
  action: string;
  timestamp: string;
  details: string;
  type: 'login' | 'security' | 'operation' | 'account';
}

export interface AuthUser {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  department: string;
  first_login: boolean;
  hotel_id: string;
  token: string;
  last_login?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Manager' | 'Receptionist' | 'Chef' | 'Waiter' | 'Housekeeping' | 'Maintenance';
  department: string;
  phone: string;
  shift: 'Morning (6 AM - 2 PM)' | 'General (9 AM - 6 PM)' | 'Evening (2 PM - 10 PM)' | 'Night (10 PM - 6 AM)';
  status: 'On Duty' | 'Off Duty' | 'Break';
  assignedTasks: number;
  rating: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'food' | 'housekeeping' | 'complaint' | 'alert' | 'reminder';
  timestamp: string;
  read: boolean;
  targetRole?: string;
  roomNumber?: string;
}

export type ActiveRole =
  | 'guest'
  | 'login'
  | 'owner'
  | 'manager'
  | 'reception'
  | 'waiter'
  | 'kitchen'
  | 'housekeeping'
  | 'maintenance'
  | 'kitchen-waiter';

export type GuestTab =
  | 'home'
  | 'rooms'
  | 'dining'
  | 'activities'
  | 'mystay'
  | 'reviews'
  | 'feedback'
  | 'contact'
  | 'map';

export type ResortAIMode = 'guest' | 'manager';

export interface ResortAIAction {
  type:
    | 'booking'
    | 'food_menu'
    | 'cart_add'
    | 'housekeeping'
    | 'complaint'
    | 'activity'
    | 'navigation'
    | 'review'
    | 'emergency'
    | 'stay_info'
    | 'checkin_info'
    | 'customer_correction'
    | 'manager_analytics';
  data?: any;
}
