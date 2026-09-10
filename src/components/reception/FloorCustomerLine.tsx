import React, { useState, useRef } from 'react';
import {
  Building,
  Bed,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Edit3,
  Send,
  History,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Layers,
  Sparkle,
  Wrench,
  Users,
} from 'lucide-react';
import { Room, Booking, RoomStatus } from '../../types';

interface FloorCustomerLineProps {
  rooms: Room[];
  bookings: Booking[];
  onCheckIn: (booking: Booking) => void;
  onCheckOut: (booking: Booking) => void;
  onEditGuest: (booking: Booking) => void;
  onSendMessage: (booking: Booking) => void;
  onViewAudit: (booking: Booking) => void;
  onAddCustomerForRoom: (roomNumber: string) => void;
  onUpdateRoomStatus: (roomNumber: string, status: RoomStatus) => void;
}

export const FloorCustomerLine: React.FC<FloorCustomerLineProps> = ({
  rooms,
  bookings,
  onCheckIn,
  onCheckOut,
  onEditGuest,
  onSendMessage,
  onViewAudit,
  onAddCustomerForRoom,
  onUpdateRoomStatus,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'reserved' | 'available' | 'cleaning'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'line' | 'grid'>('line');

  // Refs for horizontal scrolling per floor
  const floorScrollRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const handleScroll = (floorNum: number, direction: 'left' | 'right') => {
    const el = floorScrollRefs.current[floorNum];
    if (el) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Group rooms by floor and sort numerically/alphabetically
  const floorNumbers: number[] = Array.from(new Set<number>(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  // Helper to find the active or upcoming booking for a room
  const getBookingForRoom = (roomNumber: string): Booking | undefined => {
    // First priority: currently checked in
    const activeBooking = bookings.find(
      (b) =>
        b.roomNumber === roomNumber &&
        (b.status === 'Checked In' || b.guestStatus === 'Checked-in')
    );
    if (activeBooking) return activeBooking;

    // Second priority: upcoming confirmed / reserved booking
    const upcomingBooking = bookings.find(
      (b) =>
        b.roomNumber === roomNumber &&
        (b.status === 'Confirmed' || b.status === 'Pending' || b.guestStatus === 'Reserved')
    );
    if (upcomingBooking) return upcomingBooking;

    // Third: any booking associated with this room
    return bookings.find((b) => b.roomNumber === roomNumber);
  };

  // Floor metadata / friendly titles
  const getFloorTitle = (floorNum: number) => {
    switch (floorNum) {
      case 1:
        return { name: 'Ground Floor & Garden Wing', subtitle: 'Ground level rooms, tropical gardens & private plunge villas' };
      case 2:
        return { name: '2nd Floor • Ocean & Lagoon Wing', subtitle: 'Panoramic sea breeze rooms, horizon deluxe & terrace view suites' };
      case 3:
        return { name: '3rd Floor • Panorama Suites Wing', subtitle: 'Grand signature suites, honeymoon sanctuaries & family havens' };
      case 4:
        return { name: '4th Floor • Presidential Penthouse Wing', subtitle: 'Ultra-exclusive private royal penthouses and VIP skyline suites' };
      default:
        return { name: `Floor ${floorNum}`, subtitle: 'Resort guest accommodations' };
    }
  };

  // Summary counts
  const totalRoomsCount = rooms.length;
  const totalOccupied = rooms.filter((r) => r.status === 'occupied').length;
  const totalAvailable = rooms.filter((r) => r.status === 'available').length;
  const totalCleaning = rooms.filter((r) => r.status === 'cleaning').length;

  return (
    <div className="space-y-6">
      {/* Overview & Controls Banner */}
      <div className="bg-white rounded-3xl border border-[#E5E1D5] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E5E1D5]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-[#5C5E4E] text-[#D4AF37]">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1C1C1A]">
                Floor-by-Floor Customer & Room Line
              </h3>
            </div>
            <p className="text-xs text-[#8A8E71] mt-1">
              Visual floor corridor line displaying every room and customer in sequential room order with instant check-in, check-out, and folio actions.
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#F5F2EA] border border-[#E5E1D5] text-xs flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5C5E4E] animate-pulse" />
              <span className="text-[#8A8E71]">Occupied:</span>
              <strong className="text-[#1C1C1A]">{totalOccupied}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#F2F5F0] border border-[#4F6D4F]/30 text-xs flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4F6D4F]" />
              <span className="text-[#8A8E71]">Available:</span>
              <strong className="text-[#4F6D4F]">{totalAvailable}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#FDF9EE] border border-[#D4AF37]/40 text-xs flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span className="text-[#8A8E71]">Cleaning:</span>
              <strong className="text-[#B8860B]">{totalCleaning}</strong>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D5] text-xs flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-[#5C5E4E]" />
              <span className="text-[#8A8E71]">Total Rooms:</span>
              <strong className="text-[#1C1C1A]">{totalRoomsCount}</strong>
            </div>
          </div>
        </div>

        {/* Filter bar: Floor filter pills, Status filter, Search, and View Mode */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Floor selection pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8E71] mr-1">
              Floor:
            </span>
            <button
              onClick={() => setSelectedFloor('all')}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedFloor === 'all'
                  ? 'bg-[#5C5E4E] text-white shadow-2xs'
                  : 'bg-[#F5F2EA] text-[#5C5E4E] hover:bg-[#EBE8DE]'
              }`}
            >
              All Floors
            </button>
            {floorNumbers.map((floorNum) => (
              <button
                key={floorNum}
                onClick={() => setSelectedFloor(floorNum)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  selectedFloor === floorNum
                    ? 'bg-[#5C5E4E] text-white shadow-2xs'
                    : 'bg-[#F5F2EA] text-[#5C5E4E] hover:bg-[#EBE8DE]'
                }`}
              >
                Floor {floorNum}
              </button>
            ))}
          </div>

          {/* Search, Status & View Mode */}
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
            {/* Status filter */}
            <div className="flex items-center space-x-1 bg-[#FAF9F5] border border-[#E5E1D5] px-2.5 py-1 rounded-xl text-xs">
              <Filter className="w-3 h-3 text-[#8A8E71]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs text-[#33332D] focus:outline-hidden font-medium"
              >
                <option value="all">All Room Statuses</option>
                <option value="occupied">Occupied / Checked-In</option>
                <option value="reserved">Reserved / Arriving</option>
                <option value="available">Available / Vacant</option>
                <option value="cleaning">Cleaning / Turnover</option>
              </select>
            </div>

            {/* Search customer or room */}
            <div className="relative">
              <Search className="w-3 h-3 text-[#8A8E71] absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer / room..."
                className="pl-7 pr-2.5 py-1 bg-white border border-[#E5E1D5] rounded-xl text-xs text-[#33332D] placeholder-[#8A8E71]/70 focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E] w-36 sm:w-44"
              />
            </div>

            {/* View mode toggle */}
            <div className="flex items-center bg-[#FAF9F5] border border-[#E5E1D5] rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setViewMode('line')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  viewMode === 'line' ? 'bg-[#5C5E4E] text-white' : 'text-[#8A8E71] hover:text-[#1C1C1A]'
                }`}
                title="Continuous horizontal corridor line view"
              >
                Line
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-[#5C5E4E] text-white' : 'text-[#8A8E71] hover:text-[#1C1C1A]'
                }`}
                title="Grid layout view"
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floor by Floor Sections */}
      {floorNumbers
        .filter((fn) => selectedFloor === 'all' || selectedFloor === fn)
        .map((floorNum) => {
          const floorMeta = getFloorTitle(floorNum);
          // Rooms on this floor
          const floorRooms = rooms
            .filter((r) => r.floor === floorNum)
            .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
            .filter((room) => {
              const booking = getBookingForRoom(room.number);

              // Status filter
              if (statusFilter !== 'all') {
                if (statusFilter === 'occupied' && room.status !== 'occupied' && booking?.status !== 'Checked In') {
                  return false;
                }
                if (statusFilter === 'reserved' && room.status !== 'reserved' && booking?.status !== 'Confirmed') {
                  return false;
                }
                if (statusFilter === 'available' && room.status !== 'available') {
                  return false;
                }
                if (statusFilter === 'cleaning' && room.status !== 'cleaning') {
                  return false;
                }
              }

              // Search query
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesRoom = room.number.toLowerCase().includes(q) || room.type.toLowerCase().includes(q);
                const matchesBooking =
                  booking &&
                  (booking.guestName.toLowerCase().includes(q) ||
                    (booking.customerId && booking.customerId.toLowerCase().includes(q)) ||
                    booking.id.toLowerCase().includes(q) ||
                    booking.guestPhone.includes(q) ||
                    booking.guestEmail.toLowerCase().includes(q));
                if (!matchesRoom && !matchesBooking) return false;
              }

              return true;
            });

          const totalFloorRooms = rooms.filter((r) => r.floor === floorNum).length;
          const occupiedFloorRooms = rooms.filter((r) => r.floor === floorNum && r.status === 'occupied').length;
          const occupancyRate = totalFloorRooms > 0 ? Math.round((occupiedFloorRooms / totalFloorRooms) * 100) : 0;

          return (
            <div
              key={floorNum}
              className="bg-white rounded-3xl border border-[#E5E1D5] overflow-hidden shadow-xs transition-all"
            >
              {/* Floor Header Ribbon */}
              <div className="bg-[#FAF9F5] border-b border-[#E5E1D5] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#5C5E4E] text-[#D4AF37] flex items-center justify-center font-bold text-xs shadow-2xs">
                    {floorNum}F
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-serif text-base font-bold text-[#1C1C1A]">
                        {floorMeta.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E5E1D5] text-[#5C5E4E]">
                        {totalFloorRooms} Rooms
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A8E71]">
                      {floorMeta.subtitle}
                    </p>
                  </div>
                </div>

                {/* Floor stats & Line scroll buttons */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-[#8A8E71]">Occupancy:</span>
                    <span className="font-bold text-[#1C1C1A]">{occupancyRate}%</span>
                    <span className="text-[11px] text-[#8A8E71]">
                      ({occupiedFloorRooms}/{totalFloorRooms} Occupied)
                    </span>
                  </div>

                  {/* Horizontal Scroll Arrows for Line mode */}
                  {viewMode === 'line' && (
                    <div className="flex items-center space-x-1 border-l border-[#E5E1D5] pl-3">
                      <button
                        onClick={() => handleScroll(floorNum, 'left')}
                        className="p-1.5 rounded-lg border border-[#E5E1D5] bg-white hover:bg-[#F5F2EA] text-[#5C5E4E] transition-colors"
                        title="Scroll line left"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleScroll(floorNum, 'right')}
                        className="p-1.5 rounded-lg border border-[#E5E1D5] bg-white hover:bg-[#F5F2EA] text-[#5C5E4E] transition-colors"
                        title="Scroll line right"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Floor Content: Either Horizontal Line or Grid */}
              <div className="p-4 sm:p-5">
                {floorRooms.length === 0 ? (
                  <div className="py-8 text-center text-[#8A8E71] text-xs">
                    No rooms on this floor match the current filter or search.
                  </div>
                ) : (
                  <div
                    ref={(el) => {
                      floorScrollRefs.current[floorNum] = el;
                    }}
                    className={
                      viewMode === 'line'
                        ? 'flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth'
                        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    }
                  >
                    {floorRooms.map((room) => {
                      const booking = getBookingForRoom(room.number);
                      const isOccupied =
                        room.status === 'occupied' || (booking && booking.status === 'Checked In');
                      const isReserved =
                        room.status === 'reserved' ||
                        (booking && (booking.status === 'Confirmed' || booking.status === 'Pending'));
                      const isCleaning = room.status === 'cleaning';
                      const isMaintenance = room.status === 'maintenance';
                      const isAvailable = room.status === 'available' && !isOccupied && !isReserved;

                      // Status styles
                      let cardBorder = 'border-[#E5E1D5]';
                      let statusBadgeBg = 'bg-[#F2F5F0] text-[#4F6D4F] border-[#4F6D4F]/30';
                      let statusLabel = 'Available';

                      if (isOccupied) {
                        cardBorder = 'border-[#5C5E4E] bg-gradient-to-b from-[#FBF9F5] to-white';
                        statusBadgeBg = 'bg-[#EAE6D8] text-[#5C5E4E] border-[#5C5E4E]/40';
                        statusLabel = 'Checked In';
                      } else if (isReserved) {
                        cardBorder = 'border-[#0284C7]/40 bg-gradient-to-b from-[#F0F9FF] to-white';
                        statusBadgeBg = 'bg-[#E0F2FE] text-[#0369A1] border-[#0284C7]/30';
                        statusLabel = 'Reserved';
                      } else if (isCleaning) {
                        cardBorder = 'border-[#D4AF37]/50 bg-gradient-to-b from-[#FDFCF5] to-white';
                        statusBadgeBg = 'bg-[#FEF9C3] text-[#A16207] border-[#CA8A04]/30';
                        statusLabel = 'Cleaning';
                      } else if (isMaintenance) {
                        cardBorder = 'border-[#E11D48]/40 bg-gradient-to-b from-[#FFF1F2] to-white';
                        statusBadgeBg = 'bg-[#FFE4E6] text-[#BE123C] border-[#E11D48]/30';
                        statusLabel = 'Maintenance';
                      }

                      return (
                        <div
                          key={room.id}
                          className={`rounded-2xl border ${cardBorder} p-4 flex flex-col justify-between transition-all duration-200 shadow-2xs hover:shadow-sm relative ${
                            viewMode === 'line' ? 'w-76 sm:w-84 shrink-0' : 'w-full'
                          }`}
                        >
                          {/* Card Top: Room Number, Type, Price, and Status Pill */}
                          <div>
                            <div className="flex items-start justify-between pb-2.5 border-b border-[#E5E1D5]/70">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-bold text-base text-[#1C1C1A]">
                                    Room {room.number}
                                  </span>
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#F5F2EA] text-[#5C5E4E]">
                                    {room.type}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#8A8E71] mt-0.5">
                                  ₹{room.pricePerNight.toLocaleString('en-IN')}/night • {room.capacity} Guests
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${statusBadgeBg}`}
                              >
                                {isOccupied && <span className="w-1.5 h-1.5 rounded-full bg-[#5C5E4E] animate-pulse" />}
                                {isReserved && <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />}
                                {isCleaning && <Sparkle className="w-2.5 h-2.5 animate-spin" />}
                                {isAvailable && <span className="w-1.5 h-1.5 rounded-full bg-[#4F6D4F]" />}
                                {isMaintenance && <Wrench className="w-2.5 h-2.5" />}
                                <span>{statusLabel}</span>
                              </span>
                            </div>

                            {/* Card Middle: Customer Information or Vacant Notice */}
                            <div className="py-3">
                              {booking && (isOccupied || isReserved) ? (
                                <div className="space-y-2">
                                  {/* Customer Name and ID */}
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 pr-2">
                                      <span className="text-[10px] uppercase font-bold text-[#8A8E71] tracking-wider block">
                                        Assigned Customer
                                      </span>
                                      <h5 className="font-serif text-sm font-bold text-[#1C1C1A] truncate">
                                        {booking.guestName}
                                      </h5>
                                    </div>
                                    <span className="text-[10px] font-mono bg-[#FAF9F5] border border-[#E5E1D5] px-1.5 py-0.5 rounded text-[#5C5E4E] shrink-0 font-medium">
                                      {booking.customerId || booking.id}
                                    </span>
                                  </div>

                                  {/* Contact Line */}
                                  <div className="grid grid-cols-1 gap-1 text-[11px] text-[#5C5E4E]">
                                    <div className="flex items-center space-x-1.5 truncate">
                                      <Phone className="w-3 h-3 text-[#8A8E71] shrink-0" />
                                      <span className="font-mono">{booking.guestPhone}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5 truncate text-[#8A8E71]">
                                      <Mail className="w-3 h-3 text-[#8A8E71] shrink-0" />
                                      <span className="truncate">{booking.guestEmail}</span>
                                    </div>
                                  </div>

                                  {/* Dates of Stay */}
                                  <div className="bg-[#FAF9F5] p-2 rounded-xl border border-[#E5E1D5]/60 text-[11px] space-y-1">
                                    <div className="flex items-center justify-between text-[#1C1C1A]">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3 text-[#5C5E4E]" />
                                        <span>Stay Dates:</span>
                                      </div>
                                      <span className="font-semibold">
                                        {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-[#5C5E4E] flex items-center justify-between">
                                      <span>In: {booking.checkIn} ({booking.checkInTime || '14:00'})</span>
                                      <span>Out: {booking.checkOut} ({booking.checkOutTime || '11:00'})</span>
                                    </div>
                                  </div>

                                  {/* Payment & Channel Badges */}
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span
                                      className={`px-2 py-0.5 rounded-md font-semibold ${
                                        booking.paymentStatus === 'Paid'
                                          ? 'bg-[#EBF5EA] text-[#2E6B2E]'
                                          : 'bg-[#FFF7ED] text-[#C2410C]'
                                      }`}
                                    >
                                      {booking.paymentStatus === 'Paid' ? '✓ Paid' : 'Payment Pending'}
                                    </span>

                                    <span className="text-[#8A8E71]">
                                      Booking: <strong className="text-[#1C1C1A]">{booking.bookingType || 'Direct'}</strong>
                                    </span>
                                  </div>

                                  {/* Special Requests Snippet */}
                                  {booking.specialRequests && (
                                    <p className="text-[10px] text-[#8A8E71] italic truncate bg-white/70 p-1 rounded border border-[#E5E1D5]/50">
                                      "{booking.specialRequests}"
                                    </p>
                                  )}
                                </div>
                              ) : isAvailable ? (
                                <div className="space-y-2.5 py-1 text-center">
                                  <div className="w-10 h-10 rounded-full bg-[#F2F5F0] text-[#4F6D4F] flex items-center justify-center mx-auto border border-[#4F6D4F]/20">
                                    <CheckCircle2 className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-semibold text-[#1C1C1A]">
                                      Room Vacant & Ready
                                    </h6>
                                    <p className="text-[10px] text-[#8A8E71] mt-0.5">
                                      {room.bedType} • Cleaned & Inspected
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => onAddCustomerForRoom(room.number)}
                                    className="w-full py-1.5 px-3 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <span>Assign / Check-In Customer</span>
                                  </button>
                                </div>
                              ) : isCleaning ? (
                                <div className="space-y-2 py-1 text-center">
                                  <div className="w-10 h-10 rounded-full bg-[#FEF9C3] text-[#A16207] flex items-center justify-center mx-auto border border-[#CA8A04]/20">
                                    <Sparkle className="w-5 h-5 animate-pulse" />
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-semibold text-[#1C1C1A]">
                                      Turnover Cleaning
                                    </h6>
                                    <p className="text-[10px] text-[#8A8E71] mt-0.5">
                                      Dispatched to Housekeeping staff
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => onUpdateRoomStatus(room.number, 'available')}
                                    className="w-full py-1.5 px-3 rounded-xl bg-[#4F6D4F] hover:bg-[#3D563D] text-white text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Mark Clean / Ready</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2 py-1 text-center">
                                  <div className="w-10 h-10 rounded-full bg-[#FFE4E6] text-[#BE123C] flex items-center justify-center mx-auto border border-[#E11D48]/20">
                                    <Wrench className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-semibold text-[#1C1C1A]">
                                      Maintenance Inspection
                                    </h6>
                                    <p className="text-[10px] text-[#8A8E71] mt-0.5">
                                      Work order logged with Engineering
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => onUpdateRoomStatus(room.number, 'available')}
                                    className="w-full py-1.5 px-3 rounded-xl bg-[#5C5E4E] text-white text-[11px] font-semibold transition-colors"
                                  >
                                    Mark Available
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Bottom: Action Footers */}
                          <div className="pt-2.5 border-t border-[#E5E1D5]/70 space-y-2">
                            {/* Primary Lifecycle Check-In / Check-Out Actions */}
                            {booking && (
                              <div className="flex items-center space-x-1.5">
                                {booking.status === 'Checked In' ? (
                                  <button
                                    onClick={() => onCheckOut(booking)}
                                    className="flex-1 py-1 px-2.5 rounded-xl bg-[#8C3A27] hover:bg-[#722F20] text-white text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors shadow-2xs"
                                  >
                                    <span>Check Out</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onCheckIn(booking)}
                                    className="flex-1 py-1 px-2.5 rounded-xl bg-[#2E6B2E] hover:bg-[#235323] text-white text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors shadow-2xs"
                                  >
                                    <span>Check In</span>
                                  </button>
                                )}

                                {/* Edit Customer Profile */}
                                <button
                                  onClick={() => onEditGuest(booking)}
                                  className="p-1.5 rounded-xl border border-[#E5E1D5] bg-white hover:bg-[#FAF9F5] text-[#5C5E4E] transition-colors"
                                  title="Edit customer details & sync with ARIA AI"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Send WhatsApp / Reminder */}
                                <button
                                  onClick={() => onSendMessage(booking)}
                                  className="p-1.5 rounded-xl border border-[#E5E1D5] bg-white hover:bg-[#FAF9F5] text-[#5C5E4E] transition-colors"
                                  title="Send WhatsApp / SMS reminder or notice"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>

                                {/* Audit Logs */}
                                <button
                                  onClick={() => onViewAudit(booking)}
                                  className="p-1.5 rounded-xl border border-[#E5E1D5] bg-white hover:bg-[#FAF9F5] text-[#5C5E4E] transition-colors"
                                  title="View audit trail for this customer"
                                >
                                  <History className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Quick Room Status Override Dropdown */}
                            <div className="flex items-center justify-between text-[10px] pt-1">
                              <span className="text-[#8A8E71]">Room Status:</span>
                              <select
                                value={room.status}
                                onChange={(e) => onUpdateRoomStatus(room.number, e.target.value as RoomStatus)}
                                className="bg-white border border-[#E5E1D5] rounded-lg px-1.5 py-0.5 text-[10px] font-medium text-[#33332D] focus:outline-hidden"
                              >
                                <option value="available">Available</option>
                                <option value="occupied">Occupied</option>
                                <option value="cleaning">Cleaning</option>
                                <option value="reserved">Reserved</option>
                                <option value="maintenance">Maintenance</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};
