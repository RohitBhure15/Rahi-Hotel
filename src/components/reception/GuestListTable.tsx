import React, { useState } from 'react';
import {
  UserCheck,
  UserX,
  Edit3,
  Send,
  History,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  MapPin,
  Calendar,
  CreditCard,
  Building,
} from 'lucide-react';
import { Booking } from '../../types';

interface GuestListTableProps {
  bookings: Booking[];
  onEditGuest: (booking: Booking) => void;
  onCheckIn: (booking: Booking) => void;
  onCheckOut: (booking: Booking) => void;
  onSendMessage: (booking: Booking) => void;
  onViewAudit: (booking: Booking) => void;
}

export const GuestListTable: React.FC<GuestListTableProps> = ({
  bookings,
  onEditGuest,
  onCheckIn,
  onCheckOut,
  onSendMessage,
  onViewAudit,
}) => {
  const [selectedGuest, setSelectedGuest] = useState<Booking | null>(null);

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#E5E1D5] p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#F5F2EA] flex items-center justify-center mx-auto mb-3 text-[#5C5E4E]">
          <Building className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#1C1C1A]">No Guests Found</h3>
        <p className="text-xs text-[#8A8E71] mt-1 max-w-sm mx-auto">
          No registered hotel guests match the current search or status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E5E1D5] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
          <thead className="bg-[#F9F8F3] border-b border-[#E5E1D5] text-[#5C5E4E] uppercase text-[10px] font-bold tracking-wider select-none">
            <tr>
              <th className="py-3.5 px-4">Customer Name & ID</th>
              <th className="py-3.5 px-4">Room</th>
              <th className="py-3.5 px-4">Contact Info</th>
              <th className="py-3.5 px-4">Check-In</th>
              <th className="py-3.5 px-4">Check-Out</th>
              <th className="py-3.5 px-4 text-center">Guests</th>
              <th className="py-3.5 px-4">Booking Status</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-4">Guest Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE8DE] text-[#33332D]">
            {bookings.map((booking) => {
              const isCheckedIn =
                booking.guestStatus === 'Checked-in' ||
                booking.status === 'Checked In';
              const isCheckedOut =
                booking.guestStatus === 'Checked-out' ||
                booking.status === 'Checked Out';
              const isReserved =
                !isCheckedIn && !isCheckedOut;

              return (
                <tr
                  key={booking.id}
                  className="hover:bg-[#FAF9F5] transition-colors group"
                >
                  {/* Customer Name & ID */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-sm text-[#1C1C1A]">
                      {booking.guestName}
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-[10px] text-[#8A8E71] bg-[#F5F2EA] px-1.5 py-0.5 rounded">
                        {booking.customerId || 'CUST-AUTO'}
                      </span>
                      <span className="font-mono text-[10px] text-[#8A8E71]">
                        {booking.id}
                      </span>
                    </div>
                  </td>

                  {/* Room Number & Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-sm text-[#1C1C1A] bg-[#F5F2EA] border border-[#E5E1D5] px-2 py-0.5 rounded-lg">
                        {booking.roomNumber}
                      </span>
                      <span className="text-[11px] text-[#5C5E4E]">
                        {booking.roomType}
                      </span>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-xs text-[#1C1C1A]">
                        <Phone className="w-3 h-3 text-[#5C5E4E] shrink-0" />
                        <span className="font-mono">{booking.guestPhone}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-[#8A8E71]">
                        <Mail className="w-3 h-3 text-[#8A8E71] shrink-0" />
                        <span className="truncate max-w-[140px]" title={booking.guestEmail}>
                          {booking.guestEmail}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Check-in Date & Time */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#1C1C1A]">
                      {booking.checkIn}
                    </div>
                    <div className="text-[10px] text-[#8A8E71] flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{booking.checkInTime || '14:00'}</span>
                    </div>
                  </td>

                  {/* Check-out Date & Time */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#1C1C1A]">
                      {booking.checkOut}
                    </div>
                    <div className="text-[10px] text-[#8A8E71] flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{booking.checkOutTime || '11:00'}</span>
                    </div>
                  </td>

                  {/* Guests count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center font-semibold text-xs px-2 py-0.5 rounded-md bg-[#F5F2EA] text-[#5C5E4E]">
                      {booking.guestsCount || booking.guests || 2}
                    </span>
                  </td>

                  {/* Booking Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        booking.status === 'Checked In'
                          ? 'bg-[#EBF3EB] text-[#2E6B2E]'
                          : booking.status === 'Confirmed'
                          ? 'bg-[#EBF1F5] text-[#1E5276]'
                          : booking.status === 'Checked Out'
                          ? 'bg-[#F2F2F2] text-[#666666]'
                          : 'bg-[#FBEAE8] text-[#9A2D25]'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span
                        className={`inline-flex items-center text-[11px] font-semibold ${
                          booking.paymentStatus === 'Paid'
                            ? 'text-[#2E6B2E]'
                            : 'text-[#B8860B]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            booking.paymentStatus === 'Paid'
                              ? 'bg-[#2E6B2E]'
                              : 'bg-[#B8860B]'
                          }`}
                        />
                        {booking.paymentStatus}
                      </span>
                      <span className="text-[10px] text-[#8A8E71] mt-0.5">
                        ₹{(booking.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </td>

                  {/* Guest Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-medium ${
                        isCheckedIn
                          ? 'bg-[#EAF5EA] text-[#246B24] border border-[#246B24]/20'
                          : isCheckedOut
                          ? 'bg-[#F0EFF0] text-[#555] border border-[#DDD]'
                          : 'bg-[#FBF6E8] text-[#8C6D1F] border border-[#8C6D1F]/20'
                      }`}
                    >
                      {booking.guestStatus ||
                        (isCheckedIn ? 'Checked-in' : isCheckedOut ? 'Checked-out' : 'Reserved')}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* Check-in / Check-out Toggle */}
                      {isReserved && (
                        <button
                          onClick={() => onCheckIn(booking)}
                          title="Check-in guest & assign room"
                          className="px-2.5 py-1 rounded-lg bg-[#2E6B2E] text-white hover:bg-[#235323] transition-colors flex items-center space-x-1 text-[11px] font-medium shadow-2xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Check-in</span>
                        </button>
                      )}

                      {isCheckedIn && (
                        <button
                          onClick={() => onCheckOut(booking)}
                          title="Check-out guest & trigger cleaning"
                          className="px-2.5 py-1 rounded-lg bg-[#8C3A27] text-white hover:bg-[#702E1F] transition-colors flex items-center space-x-1 text-[11px] font-medium shadow-2xs"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Check-out</span>
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => onEditGuest(booking)}
                        title="Edit Customer Details (name, phone, room, dates, special requests)"
                        className="px-2.5 py-1 rounded-lg bg-[#F5F2EA] hover:bg-[#EBE8DE] text-[#33332D] border border-[#DED9CC] transition-colors flex items-center space-x-1 text-[11px] font-medium"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#5C5E4E]" />
                        <span>Edit</span>
                      </button>

                      {/* Send Reminder / Message */}
                      <button
                        onClick={() => onSendMessage(booking)}
                        title="Send Check-in/Check-out reminder or message"
                        className="p-1.5 rounded-lg bg-[#F5F2EA] hover:bg-[#EBE8DE] text-[#5C5E4E] border border-[#DED9CC] transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      {/* View Activity / Audit Logs */}
                      <button
                        onClick={() => onViewAudit(booking)}
                        title="View audit & activity history"
                        className="p-1.5 rounded-lg bg-[#F5F2EA] hover:bg-[#EBE8DE] text-[#5C5E4E] border border-[#DED9CC] transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
