import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Users,
  Check,
  Calendar,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Receipt,
  FileText,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHotel } from '../../context/HotelContext';
import { Room, RoomType, Booking } from '../../types';

interface RoomsSectionProps {
  searchFilter?: {
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
  };
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({ searchFilter }) => {
  const { rooms, createBooking, setInvoiceBooking, setGuestTab, setActiveGuestRoom } = useHotel();

  const [selectedCategory, setSelectedCategory] = useState<string>(searchFilter?.roomType || 'All');
  const [bookingModalRoom, setBookingModalRoom] = useState<Room | null>(null);

  // Booking Form State
  const today = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(searchFilter?.checkIn || today);
  const [checkOutDate, setCheckOutDate] = useState(searchFilter?.checkOut || threeDaysLater);
  const [guestCount, setGuestCount] = useState(searchFilter?.guests || 2);
  const [guestName, setGuestName] = useState('Rohit Bhure');
  const [guestEmail, setGuestEmail] = useState('rohitbhure2006@gmail.com');
  const [guestPhone, setGuestPhone] = useState('+91 98765 43210');
  const [specialRequests, setSpecialRequests] = useState('Quiet ocean-facing room, extra towels.');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Wallet'>('UPI');
  const [upiVpa, setUpiVpa] = useState('rohit@okaxis');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Keyboard shortcut: Backspace or Escape exits the booking/bill checkout modal
  useEffect(() => {
    if (!bookingModalRoom) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target?.tagName?.toLowerCase();
      const isTyping =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.isContentEditable;

      if ((e.key === 'Backspace' || e.key === 'Escape') && !isTyping) {
        e.preventDefault();
        setBookingModalRoom(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookingModalRoom]);

  // Compute nights
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const categories = ['All', 'Deluxe', 'Premium', 'Suite', 'Family', 'Villa', 'Presidential Suite'];

  const filteredRooms = rooms.filter((r) => {
    if (selectedCategory !== 'All' && r.type !== selectedCategory) return false;
    return true;
  });

  const handleOpenBooking = (room: Room) => {
    setBookingModalRoom(room);
    setConfirmedBooking(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalRoom) return;

    const roomCharges = bookingModalRoom.pricePerNight * nights;
    const taxes = Math.round(roomCharges * 0.18);
    const total = roomCharges + taxes;

    const newBooking = createBooking({
      guestName,
      guestEmail,
      guestPhone,
      guestIdVerified: true,
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-9481',
      roomNumber: bookingModalRoom.number,
      roomType: bookingModalRoom.type,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guestsCount: guestCount,
      nights,
      status: 'Confirmed',
      paymentMethod,
      paymentStatus: 'Paid',
      roomCharges,
      foodCharges: 0,
      spaCharges: 0,
      taxes,
      totalAmount: total,
      specialRequests,
    });

    setActiveGuestRoom(bookingModalRoom.number);
    setConfirmedBooking(newBooking);

    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#E5E1D5]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A8E71]">
            Accommodations & Suites
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1C1A] mt-1">
            Featured Rooms & Villas
          </h2>
          <p className="text-sm text-[#5C5E4E] mt-1.5 max-w-xl">
            Thoughtfully appointed sanctuaries combining coastal serenity, sustainable teakwood architecture, and world-class hospitality.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-4 md:mt-0 flex items-center flex-wrap gap-1.5 bg-[#F5F2EA] p-1.5 rounded-2xl border border-[#E5E1D5] text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-room-${cat.toLowerCase().replace(' ', '-')}-btn`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#5C5E4E] text-white shadow-2xs'
                  : 'text-[#5C5E4E] hover:text-[#1C1C1A] hover:bg-[#EBE8DE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map((room) => {
          const isAvailable = room.status === 'available';

          return (
            <div
              key={room.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#E5E1D5] shadow-xs hover:shadow-sm transition-all group flex flex-col"
            >
              {/* Image & Badges */}
              <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
                  alt={room.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';
                  }}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#1C1C1A]/80 backdrop-blur-xs text-white text-[10px] font-medium tracking-wide">
                    {room.type}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      room.status === 'available'
                        ? 'bg-[#4F6D4F] text-white'
                        : room.status === 'occupied'
                        ? 'bg-[#5C5E4E] text-white'
                        : room.status === 'cleaning'
                        ? 'bg-[#D4AF37] text-[#1C1C1A]'
                        : 'bg-[#A64D4D] text-white'
                    }`}
                  >
                    {room.status === 'available' ? 'Available' : room.status}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-[#1C1C1A]/85 backdrop-blur-xs text-white">
                  <span className="font-bold text-base text-[#D4AF37]">
                    ₹{room.pricePerNight.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#E5E1D5] font-light"> / night</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8A8E71] mb-1">
                    <span>Room {room.number} • Floor {room.floor}</span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-[#5C5E4E]" />
                      <span>Up to {room.capacity} Guests</span>
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1C1C1A] group-hover:text-[#5C5E4E] transition-colors">
                    {room.name}
                  </h3>

                  <p className="text-xs text-[#5C5E4E] mt-2 line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>

                  {/* Amenities */}
                  <div className="mt-4 pt-3 border-t border-[#EBE8DE] flex flex-wrap gap-1.5">
                    {room.amenities.slice(0, 4).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-[#F5F2EA] text-[#5C5E4E] text-[11px] font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#F5F2EA] text-[#8A8E71] text-[11px]">
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Booking Trigger */}
                <div className="mt-6 pt-4 border-t border-[#EBE8DE] flex items-center justify-between">
                  <div className="text-[11px] text-[#8A8E71]">
                    <span>{room.bedType}</span> • <span>{room.sizeSqFt} sq.ft</span>
                  </div>

                  <button
                    id={`book-room-${room.number}-btn`}
                    onClick={() => handleOpenBooking(room)}
                    className="px-4 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5"
                  >
                    <span>{isAvailable ? 'Book Room' : 'Reserve Stay'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Checkout Modal */}
      {bookingModalRoom && (
        <div
          id="booking-checkout-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setBookingModalRoom(null);
            }
          }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5E1D5] overflow-hidden animate-fadeIn cursor-default"
          >
            {/* Modal Header */}
            <div className="bg-[#5C5E4E] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF37]">
                  Instant Online Reservation & Folio
                </span>
                <h3 className="font-serif text-xl font-bold">
                  {confirmedBooking ? 'Reservation Confirmed!' : `Book ${bookingModalRoom.name}`}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  id="exit-booking-backspace-btn"
                  onClick={() => setBookingModalRoom(null)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#FDFCF8] rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors border border-white/20 cursor-pointer"
                  title="Exit Bill (Backspace or Esc)"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Exit</span>
                  <span className="px-1.5 py-0.5 bg-black/30 text-[#D4AF37] text-[10px] font-mono font-bold rounded-md">
                    ⌫ Backspace
                  </span>
                </button>
                <button
                  id="close-room-modal-btn"
                  onClick={() => setBookingModalRoom(null)}
                  className="text-[#E5E1D5] hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* If Confirmed View */}
            {confirmedBooking ? (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-[#F2F4F2] text-[#4F6D4F] rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div>
                  <h4 className="font-serif text-2xl font-bold text-[#1C1C1A]">
                    Booking Successfully Placed!
                  </h4>
                  <p className="text-sm text-[#5C5E4E] mt-1">
                    Booking Reference ID: <strong className="font-mono text-[#5C5E4E]">{confirmedBooking.id}</strong>
                  </p>
                </div>

                {/* Quick Summary Card */}
                <div className="bg-[#F9F8F3] rounded-2xl p-5 border border-[#E5E1D5] text-left text-xs max-w-md mx-auto space-y-2">
                  <div className="flex justify-between pb-2 border-b border-[#E5E1D5] font-semibold text-[#1C1C1A] text-sm">
                    <span>{confirmedBooking.roomType} (Room #{confirmedBooking.roomNumber})</span>
                    <span className="text-[#4F6D4F] font-bold">PAID</span>
                  </div>
                  <div className="flex justify-between text-[#5C5E4E]">
                    <span>Guest:</span>
                    <strong className="text-[#1C1C1A]">{confirmedBooking.guestName}</strong>
                  </div>
                  <div className="flex justify-between text-[#5C5E4E]">
                    <span>Stay Dates:</span>
                    <span>{confirmedBooking.checkIn} to {confirmedBooking.checkOut} ({confirmedBooking.nights} Nights)</span>
                  </div>
                  <div className="flex justify-between text-[#5C5E4E]">
                    <span>Room Charges:</span>
                    <span>₹{confirmedBooking.roomCharges.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#5C5E4E]">
                    <span>GST (18%):</span>
                    <span>₹{confirmedBooking.taxes.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#1C1C1A] font-bold text-sm pt-2 border-t border-[#E5E1D5]">
                    <span>Total Paid:</span>
                    <span className="text-[#5C5E4E]">₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    id="exit-after-booking-btn"
                    onClick={() => setBookingModalRoom(null)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E5E1D5] hover:bg-[#F5F2EA] text-[#5C5E4E] font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#5C5E4E]" />
                    <span>Exit (Backspace)</span>
                  </button>

                  <button
                    id="view-invoice-after-booking-btn"
                    onClick={() => {
                      setInvoiceBooking(confirmedBooking);
                      setBookingModalRoom(null);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E5E1D5] bg-white hover:bg-[#F9F8F3] text-[#33332D] font-medium text-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#8A8E71]" />
                    <span>View Official Invoice Document 🧾</span>
                  </button>

                  <button
                    id="go-to-my-stay-btn"
                    onClick={() => {
                      setBookingModalRoom(null);
                      setGuestTab('mystay');
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-2xs"
                  >
                    <span>Open My Stay Portal</span>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Checkout Form */
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-5">
                {/* Room Preview Banner */}
                <div className="flex items-center space-x-4 bg-[#F9F8F3] p-3 rounded-2xl border border-[#E5E1D5]">
                  <div className="w-20 sm:w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-[#E5E1D5] bg-stone-100">
                    <img
                      src={bookingModalRoom.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
                      alt={bookingModalRoom.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';
                      }}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-[10px] text-[#8A8E71]">
                      <span className="font-semibold text-[#5C5E4E]">{bookingModalRoom.type}</span>
                      <span>•</span>
                      <span>Room {bookingModalRoom.number}</span>
                      <span>•</span>
                      <span>Floor {bookingModalRoom.floor}</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-[#1C1C1A] truncate mt-0.5">
                      {bookingModalRoom.name}
                    </h4>
                    <div className="text-xs text-[#5C5E4E] flex items-center justify-between mt-1">
                      <span>{bookingModalRoom.bedType} • Max {bookingModalRoom.capacity} Guests</span>
                      <strong className="text-[#D4AF37] font-bold">
                        ₹{bookingModalRoom.pricePerNight.toLocaleString('en-IN')}
                        <span className="text-[10px] text-[#8A8E71] font-normal"> / nt</span>
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Stay Dates & Count */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F9F8F3] p-3.5 rounded-2xl border border-[#E5E1D5]">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8A8E71] uppercase tracking-[0.2em] mb-1">
                      Check-In
                    </label>
                    <input
                      type="date"
                      id="modal-checkin-date"
                      value={checkInDate}
                      min={today}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E1D5] rounded-lg text-xs font-semibold text-[#33332D]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8A8E71] uppercase tracking-[0.2em] mb-1">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      id="modal-checkout-date"
                      value={checkOutDate}
                      min={checkInDate || today}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E1D5] rounded-lg text-xs font-semibold text-[#33332D]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8A8E71] uppercase tracking-[0.2em] mb-1">
                      Guests
                    </label>
                    <select
                      id="modal-guests-count"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E1D5] rounded-lg text-xs font-semibold text-[#33332D]"
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                    </select>
                  </div>
                </div>

                {/* Guest Personal Information */}
                <div>
                  <h4 className="text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2.5">
                    Guest Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#5C5E4E] mb-1">Full Name</label>
                      <input
                        type="text"
                        id="modal-guest-name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Rohit Bhure"
                        className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#5C5E4E] mb-1">Email Address</label>
                      <input
                        type="email"
                        id="modal-guest-email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="rohit@example.com"
                        className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#5C5E4E] mb-1">Mobile Phone</label>
                      <input
                        type="tel"
                        id="modal-guest-phone"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <label className="block text-[11px] text-[#5C5E4E] mb-1">Special Requests (Optional)</label>
                    <input
                      type="text"
                      id="modal-special-requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Quiet floor, early check-in preference, airport cab"
                      className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                    />
                  </div>
                </div>

                {/* Payment Selection */}
                <div>
                  <h4 className="text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2.5">
                    Select Payment Method (India Gateways Supported)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'UPI', label: 'UPI (GPay/PhonePe)', icon: <Smartphone className="w-4 h-4" /> },
                      { id: 'Credit/Debit Card', label: 'Cards (Visa/MC)', icon: <CreditCard className="w-4 h-4" /> },
                      { id: 'Net Banking', label: 'Net Banking', icon: <Building className="w-4 h-4" /> },
                      { id: 'Wallet', label: 'Wallets', icon: <Wallet className="w-4 h-4" /> },
                    ].map((pm) => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-3 rounded-2xl border text-left text-xs font-medium flex flex-col space-y-1 transition-colors ${
                          paymentMethod === pm.id
                            ? 'border-[#5C5E4E] bg-[#F5F2EA] text-[#5C5E4E] font-semibold'
                            : 'border-[#E5E1D5] hover:bg-[#F9F8F3] text-[#33332D]'
                        }`}
                      >
                        <div className="flex items-center space-x-1 text-[#5C5E4E]">
                          {pm.icon}
                        </div>
                        <span className="text-[11px]">{pm.label}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-2.5 bg-[#F9F8F3] p-2.5 rounded-xl border border-[#E5E1D5] flex items-center space-x-2">
                      <span className="text-[11px] text-[#5C5E4E]">UPI ID / VPA:</span>
                      <input
                        type="text"
                        value={upiVpa}
                        onChange={(e) => setUpiVpa(e.target.value)}
                        placeholder="username@okhdfcbank"
                        className="px-2.5 py-1.5 bg-white border border-[#E5E1D5] rounded-lg text-xs text-[#33332D] flex-1"
                      />
                    </div>
                  )}
                </div>

                {/* Bill Calculation */}
                <div className="border-t border-[#E5E1D5] pt-4 bg-[#F9F8F3] -mx-6 -mb-6 p-6">
                  <div className="space-y-1.5 text-xs text-[#5C5E4E] mb-4">
                    <div className="flex justify-between">
                      <span>Room Tariff (₹{bookingModalRoom.pricePerNight.toLocaleString('en-IN')} × {nights} {nights === 1 ? 'night' : 'nights'}):</span>
                      <span>₹{(bookingModalRoom.pricePerNight * nights).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & GST (18%):</span>
                      <span>₹{Math.round(bookingModalRoom.pricePerNight * nights * 0.18).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#1C1C1A] text-sm pt-1 border-t border-[#E5E1D5]">
                      <span>TOTAL PAYABLE:</span>
                      <span className="text-[#5C5E4E]">
                        ₹{(bookingModalRoom.pricePerNight * nights * 1.18).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setBookingModalRoom(null)}
                      className="px-4 py-2 border border-[#E5E1D5] text-[#5C5E4E] rounded-xl text-xs font-medium hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="confirm-and-pay-room-btn"
                      className="px-6 py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      <span>Pay & Confirm Reservation</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
