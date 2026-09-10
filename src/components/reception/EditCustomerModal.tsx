import React, { useState } from 'react';
import {
  X,
  Edit3,
  Building,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Booking, Room } from '../../types';

interface EditCustomerModalProps {
  isOpen: boolean;
  booking: Booking | null;
  rooms: Room[];
  onClose: () => void;
  onSave: (updatedBooking: Booking) => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  booking,
  rooms,
  onClose,
  onSave,
}) => {
  if (!isOpen || !booking) return null;

  const [guestName, setGuestName] = useState(booking.guestName);
  const [guestPhone, setGuestPhone] = useState(booking.guestPhone);
  const [guestEmail, setGuestEmail] = useState(booking.guestEmail);
  const [guestAddress, setGuestAddress] = useState(booking.guestAddress || '');
  const [guestsCount, setGuestsCount] = useState<number>(
    booking.guestsCount || booking.guests || 2
  );
  const [roomNumber, setRoomNumber] = useState(booking.roomNumber);
  const [checkIn, setCheckIn] = useState(booking.checkIn);
  const [checkInTime, setCheckInTime] = useState(booking.checkInTime || '14:00');
  const [checkOut, setCheckOut] = useState(booking.checkOut);
  const [checkOutTime, setCheckOutTime] = useState(booking.checkOutTime || '11:00');
  const [specialRequests, setSpecialRequests] = useState(booking.specialRequests || '');
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus);
  const [bookingStatus, setBookingStatus] = useState(booking.status);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedRoom = rooms.find((r) => r.number === roomNumber);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!guestName.trim()) {
      setErrorMessage('Guest name cannot be blank.');
      return;
    }
    if (!guestPhone.trim()) {
      setErrorMessage('Phone number cannot be blank.');
      return;
    }

    const updated: Booking = {
      ...booking,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim(),
      guestAddress: guestAddress.trim(),
      guestsCount: Number(guestsCount),
      guests: Number(guestsCount),
      roomNumber,
      roomType: selectedRoom ? selectedRoom.type : booking.roomType,
      checkIn,
      checkInTime,
      checkOut,
      checkOutTime,
      specialRequests: specialRequests.trim(),
      paymentStatus,
      status: bookingStatus,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#E5E1D5] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#F9F8F3] px-6 py-4 border-b border-[#E5E1D5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C5E4E] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-serif font-bold text-[#1C1C1A]">
                  Edit Customer Details
                </h2>
                <span className="text-[11px] font-mono font-semibold text-[#5C5E4E] bg-[#EBE8DE] px-2 py-0.5 rounded-full">
                  {booking.customerId || 'CUST-AUTO'}
                </span>
              </div>
              <p className="text-xs text-[#8A8E71]">
                Updates will instantly sync to Central Database, Guest Portal & ARIA AI
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

        {/* Error notice */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#FBEAE8] border border-[#F4C5C0] text-[#9A2D25] text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Audit Notice Box */}
          <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#E5E1D5] flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#5C5E4E] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#5C5E4E] leading-relaxed">
              <strong className="font-semibold text-[#1C1C1A]">Automated Audit Trail:</strong> Any corrections made here (phone number, room assignment, dates, special requests) will be automatically recorded in the activity audit log with before/after timestamps.
            </div>
          </div>

          {/* Customer Personal & Contact */}
          <div>
            <h3 className="text-xs font-bold text-[#5C5E4E] uppercase tracking-wider mb-3">
              1. Customer Identity & Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={guestAddress}
                  onChange={(e) => setGuestAddress(e.target.value)}
                  placeholder="Street, City, State"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Room Assignment & Dates */}
          <div className="pt-2 border-t border-[#EBE8DE]">
            <h3 className="text-xs font-bold text-[#5C5E4E] uppercase tracking-wider mb-3">
              2. Room Assignment & Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Assigned Room
                </label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs bg-white focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden font-medium"
                >
                  {rooms.map((r) => (
                    <option key={r.number} value={r.number}>
                      Room {r.number} — {r.name} ({r.type})
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-3 bg-[#F9F8F3] rounded-2xl border border-[#E5E1D5]">
                <label className="block text-[11px] font-bold text-[#5C5E4E] uppercase tracking-wider mb-1.5">
                  Check-in Date & Time
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
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
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
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

          {/* Preferences, Booking Status & Payment */}
          <div className="pt-2 border-t border-[#EBE8DE]">
            <h3 className="text-xs font-bold text-[#5C5E4E] uppercase tracking-wider mb-3">
              3. Preferences & Status
            </h3>
            <div className="mb-3">
              <label className="block text-xs font-medium text-[#33332D] mb-1">
                Special Requests
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Booking Status
                </label>
                <select
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs bg-white focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked In">Checked In</option>
                  <option value="Checked Out">Checked Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#33332D] mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs bg-white focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>
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
              <span>Save & Update Central Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
