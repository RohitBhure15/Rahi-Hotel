import React, { useState } from 'react';
import {
  Calendar,
  Utensils,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Star,
  Phone,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Activity as ActivityIcon,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useHotel } from '../../../context/HotelContext';
import { ResortAIAction } from '../../../types';

interface ActionCardProps {
  action: ResortAIAction;
  onActionComplete?: (resultMessage: string) => void;
}

export const ResortAIActionCard: React.FC<ActionCardProps> = ({ action, onActionComplete }) => {
  const {
    createBooking,
    placeFoodOrder,
    requestHousekeeping,
    submitComplaint,
    bookActivitySlot,
    submitReview,
    setGuestTab,
    activeGuestRoom,
    activeGuestBooking,
    rooms,
  } = useHotel();

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Booking Room Card
  if (action.type === 'booking') {
    const roomList = action.data?.rooms || [
      {
        id: 'deluxe',
        name: 'Deluxe Room',
        price: 3500,
        guests: 2,
        features: ['Pool Access', 'King Bed', 'Rain Shower'],
      },
    ];

    const handleBookRoom = (room: any) => {
      setLoading(true);
      setTimeout(() => {
        const newBooking = createBooking({
          guestName: activeGuestBooking?.guestName || 'Rohit Bhure',
          guestEmail: 'rohitbhure2006@gmail.com',
          guestPhone: '+91 98200 12345',
          guestIdVerified: true,
          idProofType: 'Aadhaar Card',
          idProofNumber: 'XXXX-XXXX-8912',
          roomNumber: room.id === 'deluxe' ? '104' : '205',
          roomType: room.name.includes('Deluxe') ? 'Deluxe' : 'Premium',
          checkIn: '2026-09-10',
          checkOut: '2026-09-13',
          guestsCount: room.guests || 2,
          nights: 3,
          status: 'Confirmed',
          paymentMethod: 'Credit/Debit Card',
          paymentStatus: 'Paid',
          roomCharges: room.price * 3,
          foodCharges: 0,
          spaCharges: 0,
          taxes: Math.round(room.price * 3 * 0.12),
          totalAmount: Math.round(room.price * 3 * 1.12),
          specialRequests: 'Booked via ARIA Concierge',
        });

        setConfirmed(true);
        setLoading(false);
        onActionComplete?.(`Booking confirmed! Reference ${newBooking.id} for ${room.name} (Sept 10 - 13).`);
      }, 500);
    };

    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-[#E5E1D5] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[#5C5E4E] font-medium text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Available Luxury Accommodations</span>
          </div>
          <span className="text-[10px] text-[#8A8E71]">Instant Confirmation</span>
        </div>

        <div className="space-y-2">
          {roomList.slice(0, 2).map((r: any, idx: number) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] flex items-center justify-between"
            >
              <div>
                <h5 className="font-semibold text-xs text-[#33332D]">{r.name}</h5>
                <p className="text-[11px] text-[#5C5E4E] font-medium">
                  ₹{r.price.toLocaleString('en-IN')}{' '}
                  <span className="text-[9px] text-[#8A8E71]">/ night</span>
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#8A8E71]">
                  <span>👥 {r.guests} Guests</span>
                  <span>•</span>
                  <span>🏊 Pool Access</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {confirmed ? (
                  <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Booked</span>
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => handleBookRoom(r)}
                      disabled={loading}
                      className="px-2.5 py-1 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-lg text-[10px] font-semibold transition-colors shadow-2xs"
                    >
                      {loading ? 'Booking...' : 'Book Now'}
                    </button>
                    <button
                      onClick={() => setGuestTab('rooms')}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-[#5C5E4E] border border-[#E5E1D5] rounded-lg text-[9px] font-medium transition-colors"
                    >
                      View Room
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Food Menu Suggestions
  if (action.type === 'food_menu') {
    const items = action.data?.items || [];
    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-[#E5E1D5] shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-1.5">
          <span className="text-xs font-semibold text-[#5C5E4E] flex items-center space-x-1.5">
            <Utensils className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Today's Vegetarian Chef Specials</span>
          </span>
          <button
            onClick={() => setGuestTab('dining')}
            className="text-[10px] text-[#D4AF37] hover:underline font-medium"
          >
            Full Menu →
          </button>
        </div>

        <div className="space-y-1.5">
          {items.slice(0, 3).map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-[#33332D]">{item.name}</p>
                <p className="text-[10px] text-[#5C5E4E] font-medium">₹{item.price} • {item.prepTime || '15 mins'}</p>
              </div>
              <button
                onClick={() => {
                  setGuestTab('dining');
                  onActionComplete?.(`Opened Dining section to order ${item.name}.`);
                }}
                className="px-2 py-1 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-lg text-[10px] font-medium transition-colors"
              >
                Order
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Direct Cart Addition / Food Order Confirmation
  if (action.type === 'cart_add') {
    const items = action.data?.items || [];
    const total = action.data?.total || 0;
    const room = action.data?.roomNumber || activeGuestRoom;

    const handleConfirmOrder = () => {
      setLoading(true);
      setTimeout(() => {
        const fullFoodItem = (name: string, price: number) => ({
          id: `food-${Math.random().toString(36).substring(7)}`,
          name,
          category: 'Indian' as const,
          price,
          rating: 4.9,
          reviewsCount: 120,
          isVeg: true,
          prepTime: '20 mins',
          description: 'Prepared fresh by Chef Arun at Coastal Breeze.',
          image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
        });

        const newOrder = placeFoodOrder({
          orderLocation: 'Room Service',
          roomOrTableNumber: `Room ${room}`,
          guestName: activeGuestBooking?.guestName || 'Rohit Bhure',
          items: items.map((it: any) => ({
            item: fullFoodItem(it.name, it.price),
            quantity: it.qty || 1,
          })),
          total: total,
          notes: 'Ordered via ARIA Concierge with contactless room delivery.',
        });

        setConfirmed(true);
        setLoading(false);
        onActionComplete?.(`Order ${newOrder.id} confirmed! Sent directly to the kitchen for Room ${room}.`);
      }, 500);
    };

    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-[#E5E1D5] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-1.5">
          <span className="text-xs font-semibold text-[#5C5E4E] flex items-center space-x-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>In-Room Food Order Preview</span>
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F5F2EA] text-[#5C5E4E]">
            Room {room}
          </span>
        </div>

        <div className="space-y-1.5">
          {items.map((it: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#F5F2EA] last:border-0">
              <span className="text-[#33332D]">
                <span className="font-semibold text-[#5C5E4E]">{it.qty} ×</span> {it.name}
              </span>
              <span className="font-medium text-[#33332D]">₹{it.price * it.qty}</span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-1 font-bold text-xs text-[#33332D]">
            <span>Total Bill</span>
            <span className="text-[#5C5E4E]">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {confirmed ? (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Order confirmed! Coastal Breeze kitchen is preparing your dishes.</span>
          </div>
        ) : (
          <button
            onClick={handleConfirmOrder}
            disabled={loading}
            className="w-full py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{loading ? 'Placing Order...' : `Confirm & Place Order (₹${total})`}</span>
          </button>
        )}
      </div>
    );
  }

  // 4. Housekeeping Task Request
  if (action.type === 'housekeeping') {
    const data = action.data || {};
    const reqId = data.requestId || 'RS1024';
    const room = data.roomNumber || activeGuestRoom;
    const item = data.request || '2 Towels';

    const handleConfirmHousekeeping = () => {
      setLoading(true);
      setTimeout(() => {
        requestHousekeeping({
          roomNumber: room,
          taskType: 'Linen Change',
          priority: data.priority === 'High' ? 'High' : 'Normal',
          assignedTo: 'Manoj Kumar (Housekeeping)',
          notes: `${item} requested via ARIA Concierge.`,
        });
        setConfirmed(true);
        setLoading(false);
        onActionComplete?.(`Housekeeping request #${reqId} dispatched to attendant for Room ${room}.`);
      }, 400);
    };

    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-[#E5E1D5] shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-1.5">
          <span className="text-xs font-semibold text-[#5C5E4E] flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Housekeeping Request #{reqId}</span>
          </span>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Assigned
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-[#8A8E71]">Room:</span>
            <span className="font-semibold text-[#33332D]">{room}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A8E71]">Request:</span>
            <span className="font-semibold text-[#33332D]">{item}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A8E71]">ETA:</span>
            <span className="font-semibold text-emerald-700">10-15 minutes</span>
          </div>
        </div>

        {confirmed ? (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Task logged in Housekeeping dashboard!</span>
          </div>
        ) : (
          <button
            onClick={handleConfirmHousekeeping}
            disabled={loading}
            className="w-full py-1.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            {loading ? 'Dispatching...' : 'Dispatch Request to Housekeeping'}
          </button>
        )}
      </div>
    );
  }

  // 5. Complaint / Maintenance Request
  if (action.type === 'complaint') {
    const data = action.data || {};
    const cmpId = data.complaintId || 'CMP1024';
    const room = data.roomNumber || activeGuestRoom;
    const cat = data.category || 'Air Conditioning';
    const priority = data.priority || 'HIGH';

    const handleConfirmComplaint = () => {
      setLoading(true);
      setTimeout(() => {
        submitComplaint({
          roomNumber: room,
          guestName: activeGuestBooking?.guestName || 'Rohit Bhure',
          category: cat,
          priority: priority as any,
          description: data.description || 'Reported via ARIA Concierge.',
          assignedTo: 'Vikram Maintenance Lead',
        });
        setConfirmed(true);
        setLoading(false);
        onActionComplete?.(`Complaint #${cmpId} registered. Chief technician assigned.`);
      }, 400);
    };

    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-rose-100 pb-1.5">
          <span className="text-xs font-semibold text-rose-900 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Maintenance Ticket #{cmpId}</span>
          </span>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            Priority: {priority}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-[#8A8E71]">Room:</span>
            <span className="font-semibold text-[#33332D]">{room}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A8E71]">Category:</span>
            <span className="font-semibold text-[#33332D]">{cat}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A8E71]">Status:</span>
            <span className="font-semibold text-amber-700">Assigned to Chief Tech</span>
          </div>
        </div>

        {confirmed ? (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Escalated to General Manager & Technician on-duty!</span>
          </div>
        ) : (
          <button
            onClick={handleConfirmComplaint}
            disabled={loading}
            className="w-full py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            {loading ? 'Submitting...' : 'Confirm & Dispatch Technician'}
          </button>
        )}
      </div>
    );
  }

  // 6. Navigation Card
  if (action.type === 'navigation') {
    const data = action.data || {};
    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-[#E5E1D5] shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-1.5">
          <span className="text-xs font-semibold text-[#5C5E4E] flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Resort Walking Directions</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {data.distance || '150m away'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-xs space-y-1.5">
          <div>
            <span className="font-bold text-[#33332D] block">{data.destination}</span>
            <span className="text-[11px] text-[#5C5E4E]">{data.location}</span>
          </div>
          <p className="text-[11px] text-[#8A8E71] italic border-t border-[#E5E1D5] pt-1">
            "{data.directions || 'Follow the central courtyard path straight ahead.'}"
          </p>
        </div>

        <button
          onClick={() => {
            setGuestTab('mystay');
            onActionComplete?.(`Opened location details for ${data.destination}.`);
          }}
          className="w-full py-1.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
        >
          <span>View Details in My Stay</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // 7. Activity Booking
  if (action.type === 'activity') {
    const acts = action.data?.activities || [
      { id: 'act-4', name: 'Traditional Archery', price: 450, time: '14:00' },
    ];

    const handleBookActivity = (act: any) => {
      setLoading(true);
      setTimeout(() => {
        bookActivitySlot({
          activityId: act.id || 'act-4',
          activityTitle: act.name,
          guestName: activeGuestBooking?.guestName || 'Rohit Bhure',
          roomNumber: activeGuestRoom,
          timeSlot: act.time || '14:00 PM',
          guestsCount: 2,
          pricePerPerson: act.price || 0,
          totalPrice: (act.price || 0) * 2,
        });
        setConfirmed(true);
        setLoading(false);
        onActionComplete?.(`Activity "${act.name}" reserved for 2 guests in Room ${activeGuestRoom}.`);
      }, 400);
    };

    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-[#E5E1D5] shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-1.5">
          <span className="text-xs font-semibold text-[#5C5E4E] flex items-center space-x-1.5">
            <ActivityIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Available Experiences & Slots</span>
          </span>
          <button
            onClick={() => setGuestTab('activities')}
            className="text-[10px] text-[#D4AF37] hover:underline font-medium"
          >
            All Activities →
          </button>
        </div>

        <div className="space-y-1.5">
          {acts.slice(0, 3).map((a: any, idx: number) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-[#33332D]">{a.name}</p>
                <p className="text-[10px] text-[#5C5E4E]">
                  {a.price === 0 ? 'Complimentary' : `₹${a.price}/person`} • {a.time}
                </p>
              </div>

              {confirmed ? (
                <span className="text-[10px] text-emerald-700 font-semibold">Reserved ✓</span>
              ) : (
                <button
                  onClick={() => handleBookActivity(a)}
                  disabled={loading}
                  className="px-2 py-1 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-lg text-[10px] font-semibold transition-colors"
                >
                  Book
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. Structured Review Assistant
  if (action.type === 'review') {
    const data = action.data || {};
    const handlePublishReview = () => {
      setLoading(true);
      setTimeout(() => {
        submitReview({
          guestName: data.guestName || activeGuestBooking?.guestName || 'Rohit Bhure',
          roomType: data.roomType || 'Premium Ocean Room',
          overallRating: data.overall || 4,
          roomRating: data.room || 5,
          foodRating: data.food || 4,
          cleanlinessRating: data.cleanliness || 5,
          staffRating: data.service || 4,
          facilitiesRating: 4,
          categories: {
            cleanliness: data.cleanliness || 5,
            food: data.food || 4,
            staff: data.service || 4,
            location: 5,
          },
          comment: data.comment || 'Wonderful stay at Hotel Rahi.',
        });
        setConfirmed(true);
        setLoading(false);
        onActionComplete?.(`Thank you! Your structured review has been published.`);
      }, 400);
    };

    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-[#E5E1D5] shadow-sm space-y-2">
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-1.5">
          <span className="text-xs font-semibold text-[#5C5E4E] flex items-center space-x-1.5">
            <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            <span>Structured Review Preview</span>
          </span>
          <span className="text-[10px] font-bold text-[#D4AF37]">
            Overall: {data.overall || 4}/5 ★
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-xs space-y-1.5">
          <div className="grid grid-cols-2 gap-1 text-[11px] text-[#5C5E4E]">
            <span>Room: {'★'.repeat(data.room || 5)}</span>
            <span>Food: {'★'.repeat(data.food || 4)}</span>
            <span>Service: {'★'.repeat(data.service || 3)}</span>
            <span>Cleanliness: {'★'.repeat(data.cleanliness || 5)}</span>
          </div>
          <p className="text-[11px] text-[#33332D] italic border-t border-[#E5E1D5] pt-1">
            "{data.comment || 'Pleasant stay'}"
          </p>
        </div>

        {confirmed ? (
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Review submitted to GM & guest directory!</span>
          </div>
        ) : (
          <button
            onClick={handlePublishReview}
            disabled={loading}
            className="w-full py-1.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            {loading ? 'Publishing...' : 'Submit Verified Review'}
          </button>
        )}
      </div>
    );
  }

  // 9. Emergency Alert Card
  if (action.type === 'emergency') {
    const data = action.data || {};
    return (
      <div className="mt-2.5 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-500 shadow-lg space-y-2.5 animate-pulse">
        <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>RESORT EMERGENCY DISPATCH</span>
        </div>
        <p className="text-[11px] text-rose-900 font-medium">
          Assistance requested for Room #{data.roomNumber || activeGuestRoom}. Staff dispatched.
        </p>

        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          <a
            href="tel:9"
            className="p-2 bg-white rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors block"
          >
            <span className="block text-[10px] text-[#8A8E71]">Front Desk</span>
            <span className="font-bold text-rose-700">{data.receptionExt || 'Ext. 9'}</span>
          </a>
          <a
            href="tel:911"
            className="p-2 bg-white rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors block"
          >
            <span className="block text-[10px] text-[#8A8E71]">Security</span>
            <span className="font-bold text-rose-700">{data.securityExt || 'Ext. 911'}</span>
          </a>
          <a
            href="tel:108"
            className="p-2 bg-white rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors block"
          >
            <span className="block text-[10px] text-[#8A8E71]">Doctor</span>
            <span className="font-bold text-rose-700">{data.medicalExt || 'Ext. 108'}</span>
          </a>
        </div>
      </div>
    );
  }

  // 10. Manager Analytics Card
  if (action.type === 'manager_analytics') {
    const data = action.data || {};
    return (
      <div className="mt-2.5 p-3 rounded-2xl bg-white border border-[#E5E1D5] shadow-sm space-y-2 text-xs">
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-1.5">
          <span className="font-semibold text-[#5C5E4E] flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Executive Operations KPI</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#5C5E4E] text-white font-medium">
            Live Query
          </span>
        </div>

        {data.metric && (
          <div className="p-2.5 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] flex items-center justify-between">
            <span className="text-[#8A8E71] font-medium">{data.metric}:</span>
            <span className="text-sm font-bold text-[#5C5E4E]">{data.value}</span>
          </div>
        )}

        {data.details && <p className="text-[11px] text-[#5C5E4E]">{data.details}</p>}
        {data.topItems && (
          <div className="space-y-1 text-[11px]">
            <span className="font-semibold text-[#33332D]">Top Selling:</span>
            {data.topItems.map((item: string, i: number) => (
              <p key={i} className="text-[#5C5E4E] pl-2">• {item}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};
