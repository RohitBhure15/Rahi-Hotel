import React, { useState } from 'react';
import {
  Bed,
  Calendar,
  Wifi,
  Phone,
  FileText,
  Coffee,
  Sparkle,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  Clock,
  ChevronRight,
  Send,
  PlusCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { ComplaintCategory, HousekeepingType } from '../../types';
import { INITIAL_ACTIVITIES } from '../../data/mockData';

export const MyStaySection: React.FC = () => {
  const {
    activeGuestBooking,
    activeGuestRoom,
    foodOrders,
    housekeepingTasks,
    requestHousekeeping,
    complaints,
    submitComplaint,
    setInvoiceBooking,
    setInvoiceOrder,
    activityBookings,
    setGuestTab,
  } = useHotel();

  // Active tab within My Stay
  const [subTab, setSubTab] = useState<'overview' | 'orders' | 'housekeeping' | 'complaints' | 'activities'>('overview');

  // Housekeeping request form state
  const [selectedHkType, setSelectedHkType] = useState<HousekeepingType>('Towel Change');
  const [hkPriority, setHkPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [hkInstructions, setHkInstructions] = useState('Please leave outside door or ring bell.');
  const [hkSubmitted, setHkSubmitted] = useState(false);

  // Complaint form state
  const [complaintCategory, setComplaintCategory] = useState<ComplaintCategory>('Room');
  const [complaintPriority, setComplaintPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintImage, setComplaintImage] = useState<string | null>(null);
  const [complaintSuccessTicket, setComplaintSuccessTicket] = useState<string | null>(null);

  // Filter orders for this room
  const roomOrders = foodOrders.filter(
    (o) => o.roomOrTableNumber.includes(activeGuestRoom) || o.roomOrTableNumber === `Room ${activeGuestRoom}`
  );

  // Filter housekeeping for this room
  const roomHousekeeping = housekeepingTasks.filter((h) => h.roomNumber === activeGuestRoom);

  // Filter complaints for this room
  const roomComplaints = complaints.filter((c) => c.roomNumber === activeGuestRoom);

  // Filter activities for this room
  const roomActivities = activityBookings.filter((a) => a.roomNumber === activeGuestRoom);

  const handleCreateHkRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestHousekeeping({
      roomNumber: activeGuestRoom,
      type: selectedHkType,
      priority: hkPriority,
      instructions: hkInstructions,
    });
    setHkSubmitted(true);
    setTimeout(() => setHkSubmitted(false), 3500);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setComplaintImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const comp = submitComplaint({
      guestName: activeGuestBooking?.guestName || 'Valued Guest',
      roomNumber: activeGuestRoom,
      category: complaintCategory,
      title: complaintTitle.trim() || `${complaintCategory} Issue`,
      description: complaintDescription,
      priority: complaintPriority,
      imageUrl: complaintImage || undefined,
    });
    setComplaintSuccessTicket(comp.id);
    setComplaintTitle('');
    setComplaintDescription('');
    setComplaintImage(null);
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Welcome Card */}
      <div className="bg-[#1C1C1A] rounded-3xl text-white p-6 sm:p-8 shadow-xs relative overflow-hidden mb-8 border border-[#33332D]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#4F6D4F]/20 text-[#8A8E71] text-[10px] font-bold tracking-[0.15em] uppercase border border-[#4F6D4F]/30">
                Active In-House Guest
              </span>
              <span className="text-[#8A8E71] text-xs">•</span>
              <span className="text-[#E5E1D5] text-xs font-mono">
                Booking Ref: {activeGuestBooking?.id || '#HTL10234'}
              </span>
            </div>

            <h2 className="font-serif text-3xl font-bold mt-2 text-white">
              Welcome to Your Stay, {activeGuestBooking?.guestName || 'Rohit Bhure'}
            </h2>
            <p className="text-xs sm:text-sm text-[#E5E1D5] mt-1 max-w-xl leading-relaxed">
              Assigned to <strong>Room {activeGuestRoom}</strong> ({activeGuestBooking?.roomType || 'Deluxe Room'}). Access in-room dining, request prompt housekeeping, report issues, and monitor your folio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeGuestBooking && (
              <button
                id="mystay-open-invoice-btn"
                onClick={() => setInvoiceBooking(activeGuestBooking)}
                className="px-4 py-2.5 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white font-medium text-xs flex items-center space-x-2 shadow-2xs transition-colors"
              >
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span>View Tax Invoice 🧾</span>
              </button>
            )}

            <button
              id="mystay-order-food-shortcut-btn"
              onClick={() => setGuestTab('dining')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center space-x-2 backdrop-blur-xs border border-white/20 transition-colors"
            >
              <Coffee className="w-4 h-4 text-[#D4AF37]" />
              <span>Order In-Room Dining</span>
            </button>
          </div>
        </div>

        {/* Essential In-Room Information Strip */}
        <div className="mt-6 pt-6 border-t border-[#33332D] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#E5E1D5]">
          <div className="flex items-center space-x-2.5">
            <Wifi className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-[#8A8E71] block font-bold tracking-wider">Resort Wi-Fi</span>
              <strong className="text-white font-mono">AuraPalms#Luxury5G</strong>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-[#8A8E71] block font-bold tracking-wider">Front Desk Help</span>
              <strong className="text-white">Dial Ext. 9 or 0</strong>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-[#8A8E71] block font-bold tracking-wider">Check-Out Time</span>
              <strong className="text-white">11:00 AM Sharp</strong>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Receipt className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-[#8A8E71] block font-bold tracking-wider">Current Folio</span>
              <strong className="text-[#D4AF37] font-bold">
                ₹{(activeGuestBooking?.totalAmount || 18700).toLocaleString('en-IN')} (Paid)
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E5E1D5] pb-3 mb-8 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'overview', label: 'Stay Overview & Folio', count: null },
          { key: 'orders', label: 'In-Room Dining Orders', count: roomOrders.length },
          { key: 'housekeeping', label: 'Housekeeping & Amenities', count: roomHousekeeping.length },
          { key: 'activities', label: 'Activity Bookings', count: roomActivities.length },
          { key: 'complaints', label: 'Complaints & Assistance', count: roomComplaints.length },
        ].map((tab) => (
          <button
            key={tab.key}
            id={`mystay-subtab-${tab.key}-btn`}
            onClick={() => setSubTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-2 ${
              subTab === tab.key
                ? 'bg-[#5C5E4E] text-white shadow-2xs'
                : 'text-[#5C5E4E] hover:bg-[#F9F8F3]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${subTab === tab.key ? 'bg-[#47493D] text-white' : 'bg-[#E5E1D5] text-[#33332D]'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SubTab 1: Overview */}
      {subTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 cols: Booking summary & Active Activities */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-[#1C1C1A] mb-4 pb-2 border-b border-[#EBE8DE] flex items-center justify-between">
                <span>Room Stay Details</span>
                <span className="text-xs font-sans font-semibold text-[#4F6D4F] bg-[#F2F4F2] px-2.5 py-1 rounded-full border border-[#4F6D4F]/20">
                  Status: {activeGuestBooking?.status || 'Checked In'}
                </span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-[#5C5E4E]">
                <div>
                  <span className="text-[#8A8E71] block mb-0.5">Assigned Room</span>
                  <strong className="text-[#1C1C1A] text-sm">Room {activeGuestRoom}</strong>
                  <p className="text-[11px] text-[#8A8E71]">{activeGuestBooking?.roomType || 'Deluxe'}</p>
                </div>
                <div>
                  <span className="text-[#8A8E71] block mb-0.5">Check-In Date</span>
                  <strong className="text-[#1C1C1A] text-sm">{activeGuestBooking?.checkIn || '2026-09-01'}</strong>
                  <p className="text-[11px] text-[#8A8E71]">From 14:00 hrs</p>
                </div>
                <div>
                  <span className="text-[#8A8E71] block mb-0.5">Check-Out Date</span>
                  <strong className="text-[#1C1C1A] text-sm">{activeGuestBooking?.checkOut || '2026-09-04'}</strong>
                  <p className="text-[11px] text-[#8A8E71]">Till 11:00 AM</p>
                </div>
                <div>
                  <span className="text-[#8A8E71] block mb-0.5">Number of Guests</span>
                  <strong className="text-[#1C1C1A]">{activeGuestBooking?.guestsCount || 2} Adults</strong>
                </div>
                <div>
                  <span className="text-[#8A8E71] block mb-0.5">Payment Method</span>
                  <strong className="text-[#1C1C1A]">{activeGuestBooking?.paymentMethod || 'UPI'}</strong>
                </div>
                <div>
                  <span className="text-[#8A8E71] block mb-0.5">ID Verification</span>
                  <span className="text-[#4F6D4F] font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>

              {activeGuestBooking?.specialRequests && (
                <div className="mt-4 pt-3 border-t border-[#EBE8DE] text-xs">
                  <span className="text-[#8A8E71] block mb-1">Your Special Requests:</span>
                  <p className="text-[#33332D] italic bg-[#F9F8F3] p-3 rounded-xl border border-[#E5E1D5]">
                    "{activeGuestBooking.specialRequests}"
                  </p>
                </div>
              )}
            </div>

            {/* Reserved Activities */}
            <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-[#1C1C1A] mb-4 pb-2 border-b border-[#EBE8DE] flex items-center justify-between">
                <span>Reserved Experiences & Spa</span>
                <button
                  onClick={() => setGuestTab('activities')}
                  className="text-xs text-[#5C5E4E] font-semibold hover:underline"
                >
                  + Book More
                </button>
              </h3>

              {roomActivities.length === 0 ? (
                <p className="text-xs text-[#8A8E71] py-4 text-center">
                  No activities booked yet. Indulge in an Ayurvedic massage or book a sunset beach bonfire!
                </p>
              ) : (
                <div className="space-y-3">
                  {roomActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl bg-[#F9F8F3] border border-[#E5E1D5] flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-semibold text-[#1C1C1A]">{act.activityTitle}</h4>
                        <p className="text-[#8A8E71] mt-0.5">
                          {act.date} • {act.timeSlot} • {act.participants} Participants
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#5C5E4E]">
                          {act.totalPrice === 0 ? 'Free' : `₹${act.totalPrice.toLocaleString('en-IN')}`}
                        </span>
                        <span className="block text-[10px] text-[#4F6D4F] font-semibold">Confirmed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right col: Folio breakdown & Invoice document */}
          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#EBE8DE]">
              <div className="p-2.5 rounded-2xl bg-[#F5F2EA] text-[#5C5E4E]">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#1C1C1A]">Live Stay Folio</h4>
                <p className="text-[11px] text-[#8A8E71]">Real-time room tariff & on-property charges</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#5C5E4E]">
              <div className="flex justify-between py-1.5 border-b border-[#EBE8DE]">
                <span>Room Charges ({activeGuestBooking?.nights || 3} Nights):</span>
                <strong className="text-[#1C1C1A]">
                  ₹{(activeGuestBooking?.roomCharges || 12000).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#EBE8DE]">
                <span>Food & Dining Folio:</span>
                <strong className="text-[#1C1C1A]">
                  ₹{(activeGuestBooking?.foodCharges || 2350).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#EBE8DE]">
                <span>Spa & Wellness Folio:</span>
                <strong className="text-[#1C1C1A]">
                  ₹{(activeGuestBooking?.spaCharges || 1500).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#EBE8DE]">
                <span>GST Taxes (18%):</span>
                <strong className="text-[#1C1C1A]">
                  ₹{(activeGuestBooking?.taxes || 2850).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between font-bold text-[#1C1C1A] text-sm pt-2">
                <span>TOTAL ACCRUED:</span>
                <span className="text-[#5C5E4E] text-base">
                  ₹{(activeGuestBooking?.totalAmount || 18700).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[#4F6D4F] font-semibold text-xs pt-1">
                <span>Settled / Paid:</span>
                <span>₹{(activeGuestBooking?.totalAmount || 18700).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              id="mystay-view-official-invoice-btn"
              onClick={() => setInvoiceBooking(activeGuestBooking || null)}
              className="w-full py-3 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-2xs transition-colors"
            >
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <span>Download Official Invoice 🧾</span>
            </button>
          </div>
        </div>
      )}

      {/* SubTab 2: Orders */}
      {subTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-[#1C1C1A]">
              Your Food & Dining Orders
            </h3>
            <button
              onClick={() => setGuestTab('dining')}
              className="px-4 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-medium rounded-xl shadow-2xs"
            >
              + Place New Order
            </button>
          </div>

          {roomOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E5E1D5] p-12 text-center text-[#8A8E71]">
              <Coffee className="w-10 h-10 mx-auto mb-2 text-[#8A8E71]/40" />
              <p className="text-xs font-medium text-[#1C1C1A]">No active food orders for Room {activeGuestRoom}</p>
              <p className="text-[11px] text-[#8A8E71] mt-0.5">
                Visit the Dining menu to order in-room dining, pizzas, curries, or snacks.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {roomOrders.map((order) => {
                const steps = ['New', 'Preparing', 'Ready', 'Picked Up', 'Delivered'];
                const currentIdx = steps.indexOf(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EBE8DE] gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#5C5E4E] text-sm">
                            Order {order.id}
                          </span>
                          <span className="text-[#8A8E71] text-xs">•</span>
                          <span className="text-xs text-[#8A8E71]">{order.orderLocation} ({order.roomOrTableNumber})</span>
                        </div>
                        <p className="text-[11px] text-[#8A8E71] mt-0.5">Placed: {order.createdAt}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5F2EA] text-[#5C5E4E] border border-[#E5E1D5]">
                          Status: {order.status}
                        </span>
                        <span className="text-sm font-bold text-[#1C1C1A]">
                          ₹{order.total}
                        </span>
                      </div>
                    </div>

                    {/* Progress Stepper Bar */}
                    <div className="py-2">
                      <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-semibold">
                        {steps.map((step, idx) => {
                          const isDone = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;

                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 text-xs transition-colors ${
                                  isDone
                                    ? 'bg-[#5C5E4E] text-white'
                                    : 'bg-[#F5F2EA] text-[#8A8E71]'
                                } ${isCurrent ? 'ring-2 ring-[#D4AF37] ring-offset-2' : ''}`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span className={isDone ? 'text-[#1C1C1A] font-bold' : 'text-[#8A8E71]'}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="bg-[#F9F8F3] rounded-2xl p-4 text-xs text-[#33332D] border border-[#EBE8DE]">
                      <p className="font-semibold text-[#1C1C1A] mb-1.5">Items Ordered:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {order.items.map((line, idx) => (
                          <div key={idx} className="flex justify-between pr-4">
                            <span>{line.quantity}x {line.item.name}</span>
                            <span className="font-medium text-[#1C1C1A]">₹{line.item.price * line.quantity}</span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <p className="text-[11px] text-[#8A8E71] mt-2 italic">
                          Kitchen instructions: "{order.notes}"
                        </p>
                      )}
                      {order.assignedWaiter && (
                        <p className="text-[11px] text-[#5C5E4E] font-medium mt-1">
                          Assigned Waiter: {order.assignedWaiter}
                        </p>
                      )}

                      <div className="pt-3 mt-2 border-t border-[#EBE8DE] flex justify-end">
                        <button
                          id={`view-order-bill-${order.id}`}
                          onClick={() => {
                            setInvoiceOrder({
                              id: order.id,
                              roomOrTableNumber: order.roomOrTableNumber,
                              guestName: activeGuestBooking?.guestName || `Guest (Room ${activeGuestRoom})`,
                              orderLocation: order.orderLocation,
                              items: order.items.map((it) => ({
                                name: it.item.name,
                                quantity: it.quantity,
                                price: it.item.price,
                              })),
                              subtotal: order.subtotal,
                              tax: order.tax,
                              total: order.total,
                              status: order.status,
                              waiterName: order.assignedWaiter,
                              createdAt: order.createdAt,
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[#E5E1D5] bg-white hover:bg-[#F5F2EA] text-[#5C5E4E] text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>View Food Bill Receipt 🧾</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SubTab 3: Housekeeping */}
      {subTab === 'housekeeping' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Housekeeping Request Form */}
          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#EBE8DE] mb-4">
              <div className="p-2.5 rounded-2xl bg-[#F5F2EA] text-[#5C5E4E]">
                <Sparkle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#1C1C1A]">Request Housekeeping</h4>
                <p className="text-[11px] text-[#8A8E71]">Service for Room {activeGuestRoom}</p>
              </div>
            </div>

            {hkSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-[#F2F4F2] text-[#4F6D4F] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                </div>
                <h5 className="font-serif font-bold text-[#1C1C1A]">Request Dispatched!</h5>
                <p className="text-xs text-[#5C5E4E]">
                  Housekeeping team notified. An attendant will arrive shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateHkRequest} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#1C1C1A] mb-1.5">
                    Select Service Required
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(
                      [
                        'Routine Cleaning',
                        'Towel Change',
                        'Linen & Bed Making',
                        'Toiletries Restock',
                        'Deep Cleaning',
                      ] as HousekeepingType[]
                    ).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSelectedHkType(t)}
                        className={`p-2.5 rounded-xl text-left border transition-colors ${
                          selectedHkType === t
                            ? 'border-[#5C5E4E] bg-[#F5F2EA] text-[#5C5E4E] font-semibold'
                            : 'border-[#E5E1D5] hover:bg-[#F9F8F3] text-[#33332D]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1C1A] mb-1">Priority</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHkPriority('Normal')}
                      className={`p-2 rounded-xl border text-center ${
                        hkPriority === 'Normal' ? 'border-[#5C5E4E] bg-[#F5F2EA] font-bold text-[#5C5E4E]' : 'border-[#E5E1D5]'
                      }`}
                    >
                      Normal (Within 45m)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHkPriority('Urgent')}
                      className={`p-2 rounded-xl border text-center ${
                        hkPriority === 'Urgent' ? 'border-[#A64D4D] bg-[#FCF3F3] font-bold text-[#A64D4D]' : 'border-[#E5E1D5]'
                      }`}
                    >
                      Urgent (Immediate)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1C1A] mb-1">Specific Instructions</label>
                  <input
                    type="text"
                    value={hkInstructions}
                    onChange={(e) => setHkInstructions(e.target.value)}
                    placeholder="e.g. Please replenish drinking water bottles"
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-housekeeping-req-btn"
                  className="w-full py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white font-medium rounded-xl text-xs shadow-2xs"
                >
                  Send Housekeeping Request
                </button>
              </form>
            )}
          </div>

          {/* Active Housekeeping History */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif text-lg font-bold text-[#1C1C1A]">
              Housekeeping Status & Log
            </h4>

            {roomHousekeeping.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E5E1D5] p-8 text-center text-[#8A8E71]">
                <Sparkle className="w-8 h-8 mx-auto mb-2 text-[#8A8E71]/40" />
                <p className="text-xs text-[#5C5E4E]">No requests submitted today.</p>
              </div>
            ) : (
              roomHousekeeping.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-[#E5E1D5] p-4 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#1C1C1A] block text-sm">{task.type}</span>
                    <p className="text-[#8A8E71] mt-0.5">
                      Priority: {task.priority} • Room {task.roomNumber}
                    </p>
                    {task.instructions && (
                      <p className="text-[11px] text-[#8A8E71] mt-0.5">"{task.instructions}"</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        task.status === 'Clean / Completed'
                          ? 'bg-[#F2F4F2] text-[#4F6D4F] border border-[#4F6D4F]/20'
                          : task.status === 'In Progress'
                          ? 'bg-[#F5F2EA] text-[#5C5E4E] border border-[#5C5E4E]/20'
                          : 'bg-[#F9F8F3] text-[#D4AF37] border border-[#D4AF37]/20'
                      }`}
                    >
                      {task.status}
                    </span>
                    {task.assignedStaff && (
                      <p className="text-[10px] text-[#8A8E71] mt-1">Attendant: {task.assignedStaff}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SubTab 4: Complaints */}
      {subTab === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* File Complaint Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#EBE8DE] mb-4">
              <div className="p-2.5 rounded-2xl bg-[#FCF3F3] text-[#A64D4D]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#1C1C1A]">Report an Issue / Complaint</h4>
                <p className="text-[11px] text-[#8A8E71]">Instant Dispatch to Duty Manager</p>
              </div>
            </div>

            {complaintSuccessTicket ? (
              <div className="py-6 text-center space-y-3 bg-[#FCF3F3] border border-[#F5D5D5] rounded-2xl p-5">
                <div className="w-12 h-12 bg-white text-[#4F6D4F] rounded-full flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-6 h-6 stroke-[3] text-emerald-600" />
                </div>
                <h5 className="font-serif font-bold text-[#1C1C1A]">Ticket Logged Successfully!</h5>
                <div className="inline-block px-3 py-1 bg-white border border-[#E5E1D5] rounded-lg font-mono text-xs font-bold text-[#A64D4D]">
                  {complaintSuccessTicket}
                </div>
                <p className="text-xs text-[#5C5E4E]">
                  Status set to <strong>Pending</strong>. Our manager has received this ticket and will coordinate immediate resolution.
                </p>
                <button
                  onClick={() => setComplaintSuccessTicket(null)}
                  className="px-4 py-2 border border-[#E5E1D5] rounded-xl text-xs font-semibold text-[#5C5E4E] bg-white hover:bg-[#F9F8F3] transition-colors"
                >
                  Log Another Issue
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#1C1C1A] mb-1.5">Category *</label>
                  <select
                    id="complaint-category-select"
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-[#F9F8F3] text-[#33332D] font-medium"
                  >
                    <option value="Room">Room (Bedding, Linens, Keys, Furniture)</option>
                    <option value="Food">Food & Beverage (Quality, Delay, Temperature)</option>
                    <option value="Staff">Staff Behavior / Courtesy</option>
                    <option value="Cleanliness">Cleanliness & Hygiene</option>
                    <option value="AC / Cooling">Air Conditioning & Ventilation</option>
                    <option value="Plumbing / Hot Water">Geyser / Hot Water / Plumbing</option>
                    <option value="Wi-Fi / Internet">Wi-Fi & Internet Connectivity</option>
                    <option value="Maintenance">Maintenance & Electrical</option>
                    <option value="Noise Disturbance">Noise Disturbance</option>
                    <option value="Other">Other Observation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1C1A] mb-1">Priority Level *</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Low', 'Medium', 'High'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        id={`complaint-priority-${p.toLowerCase()}`}
                        onClick={() => setComplaintPriority(p as any)}
                        className={`p-2 rounded-xl border text-center font-medium transition-all ${
                          complaintPriority === p
                            ? p === 'High'
                              ? 'border-[#A64D4D] bg-[#FCF3F3] text-[#A64D4D] font-bold'
                              : 'border-[#5C5E4E] bg-[#F5F2EA] text-[#5C5E4E] font-bold'
                            : 'border-[#E5E1D5] text-[#8A8E71]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1C1A] mb-1">Issue Headline / Title</label>
                  <input
                    type="text"
                    id="complaint-title-input"
                    value={complaintTitle}
                    onChange={(e) => setComplaintTitle(e.target.value)}
                    placeholder="e.g. AC cooling low or missing bath towel"
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1C1A] mb-1">Issue Details & Room Location *</label>
                  <textarea
                    id="complaint-desc-input"
                    rows={3}
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    placeholder="Describe what is wrong so our duty team arrives equipped with the right tools..."
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                    required
                  />
                </div>

                {/* Optional Image Attachment */}
                <div>
                  <label className="block font-semibold text-[#1C1C1A] mb-1">
                    Attach Photo (Optional)
                  </label>
                  <div className="border border-dashed border-[#E5E1D5] rounded-xl p-3 bg-[#FAF8F2] text-center">
                    {complaintImage ? (
                      <div className="relative inline-block">
                        <img
                          src={complaintImage}
                          alt="Attachment preview"
                          className="h-20 w-auto rounded-lg object-cover border border-[#E5E1D5]"
                        />
                        <button
                          type="button"
                          onClick={() => setComplaintImage(null)}
                          className="absolute -top-2 -right-2 bg-[#A64D4D] text-white rounded-full p-0.5 text-[10px] w-5 h-5 flex items-center justify-center font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block text-[11px] text-[#5C5E4E]">
                        <span className="font-semibold text-[#A64D4D]">Click to upload photo</span> or drag here
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-complaint-ticket-btn"
                  className="w-full py-2.5 bg-[#A64D4D] hover:bg-[#8F3F3F] text-white font-medium rounded-xl text-xs shadow-2xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Submit Ticket to Duty Manager</span>
                </button>
              </form>
            )}
          </div>

          {/* Complaints list & Tracking Stepper */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-lg font-bold text-[#1C1C1A]">
                Room {activeGuestRoom} Complaints & Resolution Tracker
              </h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FCF3F3] text-[#A64D4D] font-bold border border-[#A64D4D]/20">
                {roomComplaints.length} Total
              </span>
            </div>

            {roomComplaints.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E5E1D5] p-8 text-center text-[#8A8E71]">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#4F6D4F]" />
                <p className="text-xs text-[#1C1C1A] font-medium">No recorded complaints for Room {activeGuestRoom}</p>
                <p className="text-[11px] text-[#8A8E71] mt-0.5">Everything is operating smoothly!</p>
              </div>
            ) : (
              roomComplaints.map((comp) => {
                const steps: Array<'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed'> = [
                  'Pending',
                  'Assigned',
                  'In Progress',
                  'Resolved',
                  'Closed',
                ];
                const currentStepIdx = steps.indexOf(comp.status as any);

                return (
                  <div
                    key={comp.id}
                    className="bg-white rounded-2xl border border-[#E5E1D5] p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[#1C1C1A] bg-[#F5F2EA] px-2 py-0.5 rounded-md">
                          {comp.id}
                        </span>
                        <span className="font-semibold text-[#5C5E4E]">
                          {comp.category}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          comp.status === 'Resolved' || comp.status === 'Closed'
                            ? 'bg-[#F2F4F2] text-[#4F6D4F] border border-[#4F6D4F]/20'
                            : comp.status === 'In Progress' || comp.status === 'Assigned'
                            ? 'bg-[#F5F2EA] text-[#5C5E4E] border border-[#5C5E4E]/20'
                            : 'bg-[#FCF3F3] text-[#A64D4D] border border-[#A64D4D]/20'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </div>

                    {/* Visual Status Stepper */}
                    <div className="py-2">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-2 right-2 top-2.5 h-0.5 bg-[#E5E1D5] -z-0" />
                        {steps.map((s, idx) => {
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;
                          return (
                            <div key={s} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  isDone
                                    ? 'bg-[#4F6D4F] text-white shadow-xs'
                                    : 'bg-white border-2 border-[#E5E1D5] text-[#8A8E71]'
                                } ${isCurrent ? 'ring-2 ring-[#4F6D4F]/30 scale-110' : ''}`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span
                                className={`text-[9px] mt-1 whitespace-nowrap ${
                                  isCurrent ? 'font-bold text-[#1C1C1A]' : 'text-[#8A8E71]'
                                }`}
                              >
                                {s}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {comp.title && (
                      <h5 className="font-bold text-xs text-[#1C1C1A]">{comp.title}</h5>
                    )}
                    <p className="text-xs text-[#33332D] leading-relaxed">{comp.description}</p>

                    {comp.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={comp.imageUrl}
                          alt="Complaint attachment"
                          className="h-24 w-auto rounded-xl object-cover border border-[#E5E1D5]"
                        />
                      </div>
                    )}

                    {comp.assignedTo && (
                      <div className="text-[11px] text-[#5C5E4E] bg-[#FAF8F2] px-3 py-1.5 rounded-xl border border-[#E5E1D5]">
                        <strong>Assigned Staff:</strong> {comp.assignedTo}
                      </div>
                    )}

                    {comp.resolutionNote && (
                      <div className="p-2.5 rounded-xl bg-[#F2F4F2] border border-[#4F6D4F]/30 text-xs text-[#4F6D4F]">
                        <strong>Resolution Note:</strong> {comp.resolutionNote}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#EBE8DE] flex justify-between items-center text-[10px] text-[#8A8E71]">
                      <span>Priority: <strong className="text-[#1C1C1A]">{comp.priority}</strong></span>
                      <span>Logged: {new Date(comp.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SubTab 5: Activity Bookings */}
      {subTab === 'activities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1C1C1A]">My Activity Bookings</h3>
              <p className="text-xs text-[#8A8E71] mt-0.5">
                Scheduled recreation, games, spa appointments, and resort experiences for Room {activeGuestRoom}.
              </p>
            </div>
            <button
              onClick={() => setGuestTab('activities')}
              className="px-4 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-2xs transition-all w-fit cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Explore All 14 Activities & Games</span>
            </button>
          </div>

          {roomActivities.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E1D5] shadow-xs">
              <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
              <h4 className="font-serif text-lg font-bold text-[#1C1C1A]">No Activities Booked Yet</h4>
              <p className="text-xs text-[#8A8E71] mt-1 max-w-md mx-auto">
                Discover table tennis, chess, carrom, badminton, turf cricket, coastal cycling, Ayurvedic spa, or our heated infinity pool.
              </p>
              <button
                onClick={() => setGuestTab('activities')}
                className="mt-4 px-5 py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-2"
              >
                <span>Browse Games & Book Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roomActivities.map((act) => {
                const activityMeta = INITIAL_ACTIVITIES.find(
                  (a) => a.id === act.activityId || a.title === act.activityTitle
                );
                return (
                  <div
                    key={act.id}
                    className="bg-white rounded-2xl border border-[#E5E1D5] p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#EBE8DE]">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-[#1C1C1A]">{act.id}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {act.status}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#D4AF37]">
                          {act.totalPrice === 0 ? 'Complimentary' : `₹${act.totalPrice.toLocaleString('en-IN')}`}
                        </span>
                      </div>

                      <div className="flex items-start space-x-3.5 mt-3">
                        {activityMeta?.image && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#E5E1D5] bg-stone-100">
                            <img
                              src={activityMeta.image}
                              alt={act.activityTitle}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1531415074868-836332616239?auto=format&fit=crop&w=1200&q=80';
                              }}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-base font-bold text-[#1C1C1A] truncate">{act.activityTitle}</h4>
                          <div className="mt-1 space-y-0.5 text-xs text-[#5C5E4E]">
                            <p>• Date: <strong>{act.date}</strong> ({act.timeSlot})</p>
                            <p>• Participants: <strong>{act.participants} Person(s)</strong></p>
                            <p>• Guest: <strong>{act.guestName}</strong></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EBE8DE] flex items-center justify-between text-[11px] text-[#8A8E71]">
                      <span>Pass confirmed at reception desk</span>
                      <span className="text-[#4F6D4F] font-semibold">✓ Pass Ready</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
