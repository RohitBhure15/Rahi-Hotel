import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  UserCheck,
  UserX,
  Search,
  PlusCircle,
  FileText,
  Bed,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
  Phone,
  Mail,
  Receipt,
  Sparkles,
  Users,
  Send,
  History,
  Calendar,
  Building,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { RoomStatus, BookingStatus, Booking } from '../../types';
import { GuestListTable } from '../reception/GuestListTable';
import { FloorCustomerLine } from '../reception/FloorCustomerLine';
import { AddCustomerModal } from '../reception/AddCustomerModal';
import { EditCustomerModal } from '../reception/EditCustomerModal';
import { AuditLogModal } from '../reception/AuditLogModal';
import { SendReminderModal } from '../reception/SendReminderModal';
import { ResortAiRequestsModal } from '../reception/ResortAiRequestsModal';

export const ReceptionDashboard: React.FC = () => {
  const {
    rooms,
    updateRoomStatus,
    bookings,
    updateBookingStatus,
    updateBooking,
    createBooking,
    setInvoiceBooking,
    addNotification,
    authUser,
  } = useHotel();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'guests' | 'floor_line' | 'checkins_today' | 'checkouts_today' | 'in_house' | 'rooms' | 'walkin'
  >('guests');

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [guestStatusFilter, setGuestStatusFilter] = useState<'all' | 'Checked-in' | 'Reserved' | 'Checked-out'>('all');

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [addCustomerRoom, setAddCustomerRoom] = useState<string | undefined>(undefined);
  const [editingGuest, setEditingGuest] = useState<Booking | null>(null);
  const [reminderGuest, setReminderGuest] = useState<Booking | null>(null);
  const [auditGuest, setAuditGuest] = useState<Booking | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAiRequestsOpen, setIsAiRequestsOpen] = useState(false);
  const [pendingAiRequestsCount, setPendingAiRequestsCount] = useState(0);

  // Walk-in form state
  const [walkinName, setWalkinName] = useState('Anand Verma');
  const [walkinEmail, setWalkinEmail] = useState('anand.verma@example.com');
  const [walkinPhone, setWalkinPhone] = useState('+91 98234 11223');
  const [walkinRoomNum, setWalkinRoomNum] = useState('101');
  const [walkinNights, setWalkinNights] = useState(2);
  const [walkinGuests, setWalkinGuests] = useState(2);
  const [walkinPaymentMethod, setWalkinPaymentMethod] = useState<'Cash' | 'Credit/Debit Card' | 'UPI'>('UPI');
  const [walkinSuccessId, setWalkinSuccessId] = useState<string | null>(null);

  // Fetch pending AI requests count
  const fetchAiRequests = async () => {
    try {
      const res = await fetch('/api/reception/correction-requests');
      if (res.ok) {
        const data = await res.json();
        const pending = data.filter((r: any) => r.status === 'Pending').length;
        setPendingAiRequestsCount(pending);
      }
    } catch {
      // offline / mock mode fallback
    }
  };

  useEffect(() => {
    fetchAiRequests();
  }, []);

  // Today's date comparison string
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered Bookings logic
  const filteredBookings = bookings.filter((b) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        b.guestName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.customerId && b.customerId.toLowerCase().includes(q)) ||
        b.roomNumber.includes(q) ||
        b.guestPhone.includes(q) ||
        b.guestEmail.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Guest status filter
    if (guestStatusFilter !== 'all') {
      const effectiveGuestStatus =
        b.guestStatus ||
        (b.status === 'Checked In'
          ? 'Checked-in'
          : b.status === 'Checked Out'
          ? 'Checked-out'
          : 'Reserved');
      if (effectiveGuestStatus !== guestStatusFilter) return false;
    }

    // Tab specific filter
    if (activeTab === 'checkins_today') {
      return (
        b.status === 'Confirmed' ||
        b.status === 'Pending' ||
        b.checkIn === todayStr
      );
    }
    if (activeTab === 'checkouts_today') {
      return (
        b.status === 'Checked In' &&
        (b.checkOut === todayStr || b.guestStatus === 'Checked-in')
      );
    }
    if (activeTab === 'in_house') {
      return b.status === 'Checked In' || b.guestStatus === 'Checked-in';
    }

    return true;
  });

  // KPI calculations
  const totalGuestsCount = bookings.length;
  const inHouseGuests = bookings.filter(
    (b) => b.status === 'Checked In' || b.guestStatus === 'Checked-in'
  );
  const todaysArrivals = bookings.filter(
    (b) => b.status === 'Confirmed' || b.checkIn === todayStr
  );
  const todaysDepartures = bookings.filter(
    (b) => (b.status === 'Checked In' && b.checkOut === todayStr) || b.status === 'Checked In'
  );

  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const cleaningCount = rooms.filter((r) => r.status === 'cleaning').length;

  // Handlers
  const handleCheckInGuest = (booking: Booking) => {
    updateBookingStatus(booking.id, 'Checked In');
    addNotification({
      title: 'Guest Checked In 🛎️',
      message: `${booking.guestName} has checked into Room ${booking.roomNumber}. Room marked Occupied.`,
      type: 'booking',
      targetRole: 'reception',
    });
  };

  const handleCheckOutGuest = (booking: Booking) => {
    updateBookingStatus(booking.id, 'Checked Out');
    addNotification({
      title: 'Guest Checked Out 🚪',
      message: `${booking.guestName} checked out of Room ${booking.roomNumber}. Room transitioned to Cleaning for Housekeeping.`,
      type: 'booking',
      targetRole: 'housekeeping',
    });
  };

  const handleAddCustomer = (customerData: any) => {
    const newBooking = createBooking(customerData);
    addNotification({
      title: 'Customer Added Successfully ✅',
      message: `${newBooking.guestName} registered to Room ${newBooking.roomNumber} with ID ${newBooking.customerId || newBooking.id}.`,
      type: 'booking',
      targetRole: 'reception',
    });
  };

  const handleSaveCustomerEdit = (updatedBooking: Booking) => {
    updateBooking(updatedBooking.id, updatedBooking);
    addNotification({
      title: 'Customer Details Updated ✏️',
      message: `Updated profile for ${updatedBooking.guestName}. Central database and ARIA AI synchronized.`,
      type: 'booking',
      targetRole: 'reception',
    });
  };

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoom = rooms.find((r) => r.number === walkinRoomNum);
    if (!targetRoom) return;

    const outDateStr = new Date(
      Date.now() + walkinNights * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0];
    const roomCharges = targetRoom.pricePerNight * walkinNights;
    const taxes = Math.round(roomCharges * 0.18);
    const total = roomCharges + taxes;

    const newBooking = createBooking({
      customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: walkinName,
      guestEmail: walkinEmail,
      guestPhone: walkinPhone,
      guestAddress: 'Walk-in Guest, Counter Registration',
      guestIdVerified: true,
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-3341',
      roomNumber: walkinRoomNum,
      roomType: targetRoom.type,
      checkIn: todayStr,
      checkInTime: '14:00',
      checkOut: outDateStr,
      checkOutTime: '11:00',
      guestsCount: walkinGuests,
      nights: walkinNights,
      status: 'Checked In',
      guestStatus: 'Checked-in',
      paymentMethod: walkinPaymentMethod,
      paymentStatus: 'Paid',
      bookingType: 'Direct',
      roomCharges,
      foodCharges: 0,
      spaCharges: 0,
      taxes,
      totalAmount: total,
      specialRequests: 'Walk-in arrival registered at Front Desk Reception.',
    });

    setWalkinSuccessId(newBooking.id);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D5] mb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2.5 rounded-2xl bg-[#5C5E4E] text-[#D4AF37] shadow-xs">
              <KeyRound className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1A]">
              Front Desk & Receptionist Console
            </h1>
          </div>
          <p className="text-xs text-[#8A8E71] mt-1">
            Complete Guest Registry, Check-In/Out Management, Customer Profile Auditing & Central AI Synchronization
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Floor-by-Floor Line Action */}
          <button
            onClick={() => setActiveTab('floor_line')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-2xs ${
              activeTab === 'floor_line'
                ? 'bg-[#5C5E4E] text-[#D4AF37] ring-1 ring-[#D4AF37]'
                : 'bg-white border border-[#E5E1D5] hover:bg-[#FAF9F5] text-[#33332D]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span>Floor-by-Floor Line</span>
          </button>

          {/* Add Customer Button */}
          <button
            onClick={() => {
              setAddCustomerRoom(undefined);
              setIsAddCustomerOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#5C5E4E] text-white hover:bg-[#47493D] transition-colors text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>Add Customer</span>
          </button>

          {/* Activity & Audit Logs */}
          <button
            onClick={() => {
              setAuditGuest(null);
              setIsAuditModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E5E1D5] hover:bg-[#FAF9F5] text-[#33332D] text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-[#5C5E4E]" />
            <span>Audit Trail</span>
          </button>

          {/* ARIA AI Requests Button */}
          <button
            onClick={() => setIsAiRequestsOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#D4AF37]/40 hover:bg-[#F5F2EA] text-[#5C5E4E] text-xs font-medium flex items-center space-x-1.5 transition-colors relative"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>ARIA AI Requests</span>
            {pendingAiRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#B8860B] text-white animate-pulse">
                {pendingAiRequestsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards (6 Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {/* Card 1: Today's Check-ins */}
        <div
          onClick={() => setActiveTab('checkins_today')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'checkins_today'
              ? 'bg-[#F2F5F0] border-[#2E6B2E] ring-1 ring-[#2E6B2E]'
              : 'bg-white border-[#E5E1D5] hover:border-[#8A8E71]'
          }`}
        >
          <div className="flex items-center justify-between text-[#2E6B2E] mb-1">
            <UserCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Arrivals</span>
          </div>
          <div className="text-xl font-bold text-[#1C1C1A]">{todaysArrivals.length}</div>
          <div className="text-[10px] text-[#8A8E71] truncate">Today's Check-ins</div>
        </div>

        {/* Card 2: Today's Check-outs */}
        <div
          onClick={() => setActiveTab('checkouts_today')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'checkouts_today'
              ? 'bg-[#FAF3F0] border-[#8C3A27] ring-1 ring-[#8C3A27]'
              : 'bg-white border-[#E5E1D5] hover:border-[#8A8E71]'
          }`}
        >
          <div className="flex items-center justify-between text-[#8C3A27] mb-1">
            <UserX className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Departures</span>
          </div>
          <div className="text-xl font-bold text-[#1C1C1A]">{todaysDepartures.length}</div>
          <div className="text-[10px] text-[#8A8E71] truncate">Today's Check-outs</div>
        </div>

        {/* Card 3: Current In-House Guests */}
        <div
          onClick={() => setActiveTab('in_house')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'in_house'
              ? 'bg-[#F5F2EA] border-[#5C5E4E] ring-1 ring-[#5C5E4E]'
              : 'bg-white border-[#E5E1D5] hover:border-[#8A8E71]'
          }`}
        >
          <div className="flex items-center justify-between text-[#5C5E4E] mb-1">
            <Users className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">In-House</span>
          </div>
          <div className="text-xl font-bold text-[#1C1C1A]">{inHouseGuests.length}</div>
          <div className="text-[10px] text-[#8A8E71] truncate">Current In-House</div>
        </div>

        {/* Card 4: Available Rooms */}
        <div
          onClick={() => setActiveTab('rooms')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-[#F2F5F0] border-[#4F6D4F] ring-1 ring-[#4F6D4F]'
              : 'bg-white border-[#E5E1D5] hover:border-[#8A8E71]'
          }`}
        >
          <div className="flex items-center justify-between text-[#4F6D4F] mb-1">
            <Bed className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Rooms</span>
          </div>
          <div className="text-xl font-bold text-[#1C1C1A]">{availableCount}</div>
          <div className="text-[10px] text-[#8A8E71] truncate">Available Rooms</div>
        </div>

        {/* Card 5: Pending AI / Guest Requests */}
        <div
          onClick={() => setIsAiRequestsOpen(true)}
          className="p-3.5 rounded-2xl border bg-white border-[#E5E1D5] hover:border-[#D4AF37] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#B8860B] mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">AI Sync</span>
          </div>
          <div className="text-xl font-bold text-[#1C1C1A] flex items-center space-x-1.5">
            <span>{pendingAiRequestsCount}</span>
            {pendingAiRequestsCount > 0 && (
              <span className="text-[10px] font-semibold text-[#B8860B]">Pending</span>
            )}
          </div>
          <div className="text-[10px] text-[#8A8E71] truncate">Profile Corrections</div>
        </div>

        {/* Card 6: Room Turnover / Cleaning */}
        <div
          onClick={() => setActiveTab('rooms')}
          className="p-3.5 rounded-2xl border bg-white border-[#E5E1D5] hover:border-[#8A8E71] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#8B6E1B] mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Cleaning</span>
          </div>
          <div className="text-xl font-bold text-[#1C1C1A]">{cleaningCount}</div>
          <div className="text-[10px] text-[#8A8E71] truncate">Turnover Tasks</div>
        </div>
      </div>

      {/* Navigation tabs & Search / Status Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-[#F5F2EA] p-1.5 rounded-2xl border border-[#E5E1D5] text-xs font-medium overflow-x-auto">
          {[
            { key: 'guests', label: 'Hotel Guest List', count: totalGuestsCount },
            { key: 'floor_line', label: 'Floor-by-Floor Line', count: rooms.length },
            { key: 'checkins_today', label: "Today's Check-Ins", count: todaysArrivals.length },
            { key: 'checkouts_today', label: "Today's Check-Outs", count: todaysDepartures.length },
            { key: 'in_house', label: 'In-House Guests', count: inHouseGuests.length },
            { key: 'rooms', label: 'Room Matrix', count: rooms.length },
            { key: 'walkin', label: '+ Direct Walk-In', count: null },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#5C5E4E] text-white shadow-2xs font-medium'
                  : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    activeTab === tab.key
                      ? 'bg-[#47493D] text-white'
                      : 'bg-[#E5E1D5] text-[#33332D]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-2.5">
          {/* Status filter dropdown */}
          <div className="flex items-center space-x-1.5 bg-white border border-[#E5E1D5] px-2.5 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-[#8A8E71]" />
            <select
              value={guestStatusFilter}
              onChange={(e) => setGuestStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs text-[#33332D] focus:outline-hidden font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Checked-in">Checked-in</option>
              <option value="Reserved">Reserved</option>
              <option value="Checked-out">Checked-out</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8A8E71] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guest, ID, phone, room..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E1D5] rounded-xl text-xs text-[#33332D] placeholder-[#8A8E71]/70 focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Hotel Guest List / Check-ins / Check-outs / In-House Table */}
      {(activeTab === 'guests' ||
        activeTab === 'checkins_today' ||
        activeTab === 'checkouts_today' ||
        activeTab === 'in_house') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="font-serif text-lg font-bold text-[#1C1C1A]">
                {activeTab === 'guests'
                  ? 'Registered Hotel Guests & Folios'
                  : activeTab === 'checkins_today'
                  ? "Today's Expected Check-Ins"
                  : activeTab === 'checkouts_today'
                  ? "Today's Expected Departures"
                  : 'Current In-House Registered Guests'}
              </h2>
              <span className="text-xs text-[#8A8E71] font-mono">
                ({filteredBookings.length} results)
              </span>
            </div>

            <div className="text-xs text-[#8A8E71] hidden sm:block">
              Click <strong className="text-[#1C1C1A]">Edit</strong> to update phone, room, or stay dates with audit logging
            </div>
          </div>

          {/* Quick Floor-by-Floor Line Ribbon Banner */}
          <div className="bg-gradient-to-r from-[#FAF9F5] via-[#F5F2EA] to-[#FAF9F5] border border-[#E5E1D5] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[#5C5E4E] text-[#D4AF37] shadow-2xs shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#1C1C1A]">
                  Floor-by-Floor Customer Corridor Line
                </h4>
                <p className="text-xs text-[#8A8E71]">
                  View all resort customers lined up floor-by-floor in sequential room number order with real-time occupancy.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('floor_line')}
              className="px-4 py-2 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <span>View Floor-by-Floor Line</span>
              <span className="text-[#D4AF37]">→</span>
            </button>
          </div>

          {/* Render Guest List Table */}
          <GuestListTable
            bookings={filteredBookings}
            onCheckIn={handleCheckInGuest}
            onCheckOut={handleCheckOutGuest}
            onEditGuest={(guest) => setEditingGuest(guest)}
            onSendMessage={(guest) => setReminderGuest(guest)}
            onViewAudit={(guest) => {
              setAuditGuest(guest);
              setIsAuditModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Floor-by-Floor Line View */}
      {activeTab === 'floor_line' && (
        <FloorCustomerLine
          rooms={rooms}
          bookings={bookings}
          onCheckIn={handleCheckInGuest}
          onCheckOut={handleCheckOutGuest}
          onEditGuest={(guest) => setEditingGuest(guest)}
          onSendMessage={(guest) => setReminderGuest(guest)}
          onViewAudit={(guest) => {
            setAuditGuest(guest);
            setIsAuditModalOpen(true);
          }}
          onAddCustomerForRoom={(roomNumber) => {
            setAddCustomerRoom(roomNumber);
            setIsAddCustomerOpen(true);
          }}
          onUpdateRoomStatus={(roomNumber, status) => {
            updateRoomStatus(roomNumber, status);
            addNotification({
              title: 'Room Status Updated 🛎️',
              message: `Room ${roomNumber} transitioned to ${status}.`,
              type: 'room',
              targetRole: 'reception',
            });
          }}
        />
      )}

      {/* Tab 2: Room Matrix View */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1C1C1A]">
                Floor Plan & Room Inventory Status
              </h3>
              <p className="text-xs text-[#8A8E71]">
                Real-time room occupancy and automatic cleaning turnover tracking
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-md bg-[#4F6D4F] inline-block" />
                <span className="text-[#33332D]">Available</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-md bg-[#5C5E4E] inline-block" />
                <span className="text-[#33332D]">Occupied</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-md bg-[#D4AF37] inline-block" />
                <span className="text-[#33332D]">Cleaning</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-md bg-[#A64D4D] inline-block" />
                <span className="text-[#33332D]">Maintenance</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {rooms.map((room) => {
              const currentBooking = bookings.find(
                (b) =>
                  b.roomNumber === room.number &&
                  (b.status === 'Checked In' || b.guestStatus === 'Checked-in')
              );

              return (
                <div
                  key={room.id}
                  className={`p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                    room.status === 'available'
                      ? 'bg-[#F2F4F2] border-[#4F6D4F]/30 text-[#1C1C1A]'
                      : room.status === 'occupied'
                      ? 'bg-[#F5F2EA] border-[#5C5E4E]/30 text-[#1C1C1A]'
                      : room.status === 'cleaning'
                      ? 'bg-[#FDF9EE] border-[#D4AF37]/40 text-[#1C1C1A]'
                      : 'bg-[#FCF3F3] border-[#A64D4D]/30 text-[#1C1C1A]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-sm">
                        Room {room.number}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-[#8A8E71]">
                        {room.floor}F
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold mt-0.5 text-[#33332D]">
                      {room.type}
                    </p>
                    <p className="text-[10px] text-[#8A8E71]">
                      ₹{room.pricePerNight.toLocaleString('en-IN')}/nt
                    </p>

                    {currentBooking && (
                      <div className="mt-2 pt-1.5 border-t border-[#E5E1D5] text-[10px] text-[#5C5E4E]">
                        <strong className="block truncate text-[#1C1C1A]">
                          {currentBooking.guestName}
                        </strong>
                        <span>Till {currentBooking.checkOut}</span>
                      </div>
                    )}
                  </div>

                  {/* Fast action to toggle room status */}
                  <div className="mt-3 pt-2 border-t border-[#E5E1D5] flex items-center justify-between">
                    <select
                      value={room.status}
                      onChange={(e) =>
                        updateRoomStatus(room.number, e.target.value as RoomStatus)
                      }
                      className="text-[10px] bg-white border border-[#E5E1D5] rounded-lg px-1.5 py-0.5 font-medium text-[#33332D]"
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Walk-In Booking Form */}
      {activeTab === 'walkin' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E5E1D5] p-8 shadow-xs">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-[#EBE8DE] mb-6">
            <div className="p-2.5 bg-[#5C5E4E] text-[#D4AF37] rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1C1C1A]">
                Register New Walk-In Guest
              </h3>
              <p className="text-xs text-[#8A8E71]">
                Front-desk instant arrival check-in with on-the-spot folio activation.
              </p>
            </div>
          </div>

          {walkinSuccessId ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-[#F2F4F2] text-[#4F6D4F] rounded-full flex items-center justify-center mx-auto border border-[#4F6D4F]/20">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-serif text-2xl font-bold text-[#1C1C1A]">
                  Walk-In Checked In!
                </h4>
                <p className="text-xs text-[#8A8E71] mt-1">
                  Assigned Booking ID:{' '}
                  <strong className="font-mono text-[#5C5E4E]">{walkinSuccessId}</strong>
                </p>
              </div>

              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={() => {
                    const b = bookings.find((item) => item.id === walkinSuccessId);
                    if (b) setInvoiceBooking(b);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-medium transition-colors"
                >
                  Print Guest Invoice 🧾
                </button>
                <button
                  onClick={() => {
                    setWalkinSuccessId(null);
                    setActiveTab('guests');
                  }}
                  className="px-5 py-2.5 border border-[#E5E1D5] hover:bg-[#F5F2EA] text-[#33332D] rounded-xl text-xs font-medium transition-colors"
                >
                  Back to Guest List
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWalkinSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1C1C1A] font-semibold mb-1">
                    Guest Full Name
                  </label>
                  <input
                    type="text"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-[#33332D] bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#1C1C1A] font-semibold mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-[#33332D] bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1C1C1A] font-semibold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={walkinEmail}
                    onChange={(e) => setWalkinEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-[#33332D] bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#1C1C1A] font-semibold mb-1">
                    Assign Available Room
                  </label>
                  <select
                    value={walkinRoomNum}
                    onChange={(e) => setWalkinRoomNum(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl bg-[#F9F8F3] font-semibold text-[#1C1C1A]"
                  >
                    {rooms
                      .filter((r) => r.status === 'available')
                      .map((r) => (
                        <option key={r.number} value={r.number}>
                          Room {r.number} ({r.type} - ₹{r.pricePerNight}/nt)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#1C1C1A] font-semibold mb-1">
                    Nights
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={walkinNights}
                    onChange={(e) => setWalkinNights(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-[#33332D] bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#1C1C1A] font-semibold mb-1">
                    Guests
                  </label>
                  <select
                    value={walkinGuests}
                    onChange={(e) => setWalkinGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-[#33332D] bg-white"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1C1C1A] font-semibold mb-1">
                    Payment
                  </label>
                  <select
                    value={walkinPaymentMethod}
                    onChange={(e) => setWalkinPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-[#33332D] bg-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Credit/Debit Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBE8DE] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('guests')}
                  className="px-4 py-2 border border-[#E5E1D5] rounded-xl text-[#8A8E71] hover:bg-[#F5F2EA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl font-medium shadow-2xs transition-colors"
                >
                  Confirm Walk-In & Check In
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => {
          setIsAddCustomerOpen(false);
          setAddCustomerRoom(undefined);
        }}
        rooms={rooms}
        initialRoomNumber={addCustomerRoom}
        onAddCustomer={handleAddCustomer}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={!!editingGuest}
        booking={editingGuest}
        rooms={rooms}
        onClose={() => setEditingGuest(null)}
        onSave={handleSaveCustomerEdit}
      />

      {/* Activity & Audit Logs Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => {
          setIsAuditModalOpen(false);
          setAuditGuest(null);
        }}
        selectedBooking={auditGuest}
        bookings={bookings}
      />

      {/* Send Reminder Modal */}
      <SendReminderModal
        isOpen={!!reminderGuest}
        booking={reminderGuest}
        onClose={() => setReminderGuest(null)}
      />

      {/* Resort AI Requests Modal */}
      <ResortAiRequestsModal
        isOpen={isAiRequestsOpen}
        onClose={() => setIsAiRequestsOpen(false)}
        onAppliedCorrection={() => {
          fetchAiRequests();
        }}
      />
    </div>
  );
};
