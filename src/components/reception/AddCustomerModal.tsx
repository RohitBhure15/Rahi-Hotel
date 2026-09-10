import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Building,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Users,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Room, BookingType } from '../../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  initialRoomNumber?: string;
  onAddCustomer: (customerData: any) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  rooms,
  initialRoomNumber,
  onAddCustomer,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultOutStr = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>(
    initialRoomNumber || rooms.find((r) => r.status === 'available')?.number || '101'
  );
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutDate, setCheckOutDate] = useState(defaultOutStr);
  const [checkOutTime, setCheckOutTime] = useState('11:00');
  const [bookingType, setBookingType] = useState<BookingType>('Direct');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit/Debit Card' | 'Cash'>('UPI');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoomNumber) {
      setSelectedRoomNumber(initialRoomNumber);
    }
  }, [initialRoomNumber, isOpen]);

  if (!isOpen) return null;

  const selectedRoom = rooms.find((r) => r.number === selectedRoomNumber);

  // Compute stay pricing
  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 1
  );
  const roomPricePerNight = selectedRoom?.pricePerNight || 3500;
  const subtotal = roomPricePerNight * nights;
  const taxes = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + taxes;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter the customer full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage('Please enter a valid customer contact phone number.');
      return;
    }
    if (!selectedRoomNumber) {
      setErrorMessage('Please assign a room for this customer.');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setErrorMessage('Check-out date must be strictly after check-in date.');
      return;
    }

    const payload = {
      guestName: fullName.trim(),
      guestPhone: phone.trim(),
      guestEmail:
        email.trim() ||
        `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      guestAddress: address.trim() || 'Resort Guest Address on file',
      guestsCount: Number(guestsCount),
      roomNumber: selectedRoomNumber,
      roomType: selectedRoom?.type || 'Deluxe',
      checkIn: checkInDate,
      checkInTime,
      checkOut: checkOutDate,
      checkOutTime,
      bookingType,
      specialRequests: specialRequests.trim() || 'Standard luxury stay setup',
      paymentStatus,
      paymentMethod,
      roomCharges: subtotal,
      foodCharges: 0,
      spaCharges: 0,
      taxes,
      totalAmount: grandTotal,
      nights,
      status: 'Confirmed',
      guestStatus: 'Reserved',
    };

    onAddCustomer(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#E5E1D5] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#F9F8F3] px-6 py-4 border-b border-[#E5E1D5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C5E4E] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1C1C1A]">
                Add New Customer
              </h2>
              <p className="text-xs text-[#8A8E71]">
                Register customer into Hotel Guest List & Central Database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A8E71] hover:text-[#1C1C1A] hover:bg-[#EBE8DE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#FBEAE8] border border-[#F4C5C0] text-[#9A2D25] text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Personal & Contact Information */}
          <div>
            <h3 className="text-xs font-bold text-[#5C5E4E] uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>1. Customer Personal & Contact</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Full Name <span className="text-[#9A2D25]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Phone Number <span className="text-[#9A2D25]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98220 12345"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City, State, Country"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Room & Stay Details */}
          <div className="pt-2 border-t border-[#EBE8DE]">
            <h3 className="text-xs font-bold text-[#5C5E4E] uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>2. Room Allocation & Schedule</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Room Assignment <span className="text-[#9A2D25]">*</span>
                </label>
                <select
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs bg-white focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden font-medium"
                >
                  {rooms.map((r) => (
                    <option key={r.number} value={r.number}>
                      Room {r.number} — {r.name} ({r.type}) [₹{r.pricePerNight}/n]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Number of Guests
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs bg-white focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Booking Channel / Type
                </label>
                <select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs bg-white focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                >
                  <option value="Direct">Direct / Walk-in</option>
                  <option value="Online">Online Booking Engine</option>
                  <option value="Corporate">Corporate / Executive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-3 bg-[#F9F8F3] rounded-2xl border border-[#E5E1D5]">
                <label className="block text-[11px] font-bold text-[#5C5E4E] uppercase tracking-wider mb-1.5">
                  Check-in Date & Time
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-2/3 px-2.5 py-1.5 rounded-lg border border-[#E5E1D5] text-xs bg-white"
                  />
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-1/3 px-2 py-1.5 rounded-lg border border-[#E5E1D5] text-xs bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F9F8F3] rounded-2xl border border-[#E5E1D5]">
                <label className="block text-[11px] font-bold text-[#5C5E4E] uppercase tracking-wider mb-1.5">
                  Check-out Date & Time
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-2/3 px-2.5 py-1.5 rounded-lg border border-[#E5E1D5] text-xs bg-white"
                  />
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-1/3 px-2 py-1.5 rounded-lg border border-[#E5E1D5] text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Special Requests & Payment */}
          <div className="pt-2 border-t border-[#EBE8DE]">
            <h3 className="text-xs font-bold text-[#5C5E4E] uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>3. Folio & Preferences</span>
            </h3>

            <div className="mb-3">
              <label className="block text-xs font-medium text-[#33332D] mb-1">
                Special Requests & Notes
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Quiet room, ocean facing, extra feather pillows, welcome drink ready"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Payment Status
                </label>
                <div className="flex space-x-2">
                  {(['Paid', 'Pending'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentStatus(status)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        paymentStatus === status
                          ? 'bg-[#5C5E4E] text-white border-[#5C5E4E]'
                          : 'bg-white text-[#33332D] border-[#E5E1D5] hover:bg-[#F5F2EA]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs bg-white focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe)</option>
                  <option value="Credit/Debit Card">Credit / Debit Card</option>
                  <option value="Cash">Cash at Front Desk</option>
                </select>
              </div>
            </div>

            {/* Total Calculation summary box */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D5] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#8A8E71] block">
                  Estimated Folio ({nights} {nights === 1 ? 'Night' : 'Nights'} @ ₹{roomPricePerNight.toLocaleString('en-IN')}/night + 18% GST)
                </span>
                <span className="text-sm font-bold text-[#1C1C1A]">
                  Grand Total: ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#EBF3EB] text-[#2E6B2E]">
                Auto-computed
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#EBE8DE] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5E1D5] text-xs text-[#5C5E4E] hover:bg-[#F5F2EA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5C5E4E] text-white hover:bg-[#47493D] transition-colors text-xs font-medium flex items-center space-x-2 shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Add Customer to Guest List</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
