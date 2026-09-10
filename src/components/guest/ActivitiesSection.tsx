import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  MapPin,
  Flame,
  Music,
  Waves,
  HeartHandshake,
  SunMedium,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { INITIAL_ACTIVITIES } from '../../data/mockData';
import { Activity, ActivityBooking } from '../../types';
import spaImg from '../../assets/images/resort_spa_1788366861566.jpg';

export const ActivitiesSection: React.FC = () => {
  const { bookActivitySlot, activeGuestRoom, activityBookings } = useHotel();

  const [activitiesList, setActivitiesList] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [bookingModalActivity, setBookingModalActivity] = useState<Activity | null>(null);
  const [guestName, setGuestName] = useState('Rohit Bhure');
  const [date, setDate] = useState('2026-09-02');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [participants, setParticipants] = useState(2);
  const [successBooking, setSuccessBooking] = useState<ActivityBooking | null>(null);

  useEffect(() => {
    fetch('/api/activities')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setActivitiesList(data);
        }
      })
      .catch((err) => {
        console.warn('Using local activities fallback:', err);
      });
  }, []);

  const handleOpenBooking = (act: Activity) => {
    setBookingModalActivity(act);
    setSelectedSlot(act.timing);
    setSuccessBooking(null);
  };

  const handleConfirmActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalActivity) return;

    const totalPrice = bookingModalActivity.pricePerPerson * participants;

    const res = bookActivitySlot({
      activityId: bookingModalActivity.id,
      activityTitle: bookingModalActivity.title,
      guestName,
      roomNumber: activeGuestRoom,
      date,
      timeSlot: selectedSlot || bookingModalActivity.timing,
      participants,
      totalPrice,
    });

    setSuccessBooking(res);
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Spa Sanctuary Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-12 border border-[#E5E1D5] shadow-xs">
        <div className="relative h-64 sm:h-80">
          <img
            src={spaImg}
            alt="Nirvana Ayurvedic Spa & Wellness"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1A]/90 via-[#33332D]/75 to-transparent flex items-center p-6 sm:p-10">
            <div className="max-w-lg text-white">
              <span className="px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase border border-white/20 flex items-center space-x-1.5 w-max">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Nirvana Ayurvedic Wellness</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
                Rejuvenation & Holistic Experiences
              </h2>
              <p className="text-xs sm:text-sm text-[#E5E1D5] mt-2 leading-relaxed">
                Restore equilibrium with ancient Kerala Panchakarma therapies, herbal botanical scrubs, oceanfront morning yoga, and beachfront sunset celebrations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A8E71]">
            Curated Experiences
          </span>
          <h3 className="font-serif text-3xl font-bold text-[#1C1C1A] mt-1">
            Resort Games, Activities & Wellness Services
          </h3>
          <p className="text-sm text-[#8A8E71] mt-1">
            Complimentary experiences and premium wellness rituals available daily.
          </p>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activitiesList.map((act) => (
          <div
            key={act.id}
            className="bg-white rounded-3xl border border-[#E5E1D5] overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
              <img
                src={act.image}
                alt={act.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1531415074868-836332616239?auto=format&fit=crop&w=1200&q=80';
                }}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full bg-[#1C1C1A]/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-[0.15em]">
                  {act.category}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-[#1C1C1A]/85 backdrop-blur-xs text-xs font-bold text-[#D4AF37]">
                {act.isComplimentary ? 'Complimentary' : `₹${act.pricePerPerson.toLocaleString('en-IN')}`}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#1C1C1A] group-hover:text-[#5C5E4E] transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-[#5C5E4E] mt-1.5 leading-relaxed">
                  {act.description}
                </p>

                <div className="mt-4 pt-3 border-t border-[#EBE8DE] space-y-1.5 text-xs text-[#8A8E71]">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5C5E4E]" />
                    <span>Duration: {act.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5C5E4E]" />
                    <span>Location: {act.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#EBE8DE] flex items-center justify-end">
                <button
                  id={`book-activity-${act.id}-btn`}
                  onClick={() => handleOpenBooking(act)}
                  className="w-full py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors text-center"
                >
                  Book Slot
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Booking Modal */}
      {bookingModalActivity && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1C1C1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#E5E1D5] overflow-hidden">
            <div className="bg-[#5C5E4E] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D4AF37]">
                  Reserve Experience
                </span>
                <h3 className="font-serif text-lg font-bold">
                  {bookingModalActivity.title}
                </h3>
              </div>
              <button
                onClick={() => setBookingModalActivity(null)}
                className="text-[#E5E1D5] hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {successBooking ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-[#F2F4F2] text-[#4F6D4F] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-[#1C1C1A]">
                    Experience Reserved!
                  </h4>
                  <p className="text-xs text-[#5C5E4E] mt-1">
                    Slot confirmed for {successBooking.guestName} on {successBooking.date} at {successBooking.timeSlot}.
                  </p>
                  {successBooking.totalPrice > 0 && (
                    <p className="text-xs text-[#5C5E4E] font-semibold mt-1">
                      ₹{successBooking.totalPrice.toLocaleString('en-IN')} added to your room folio.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setBookingModalActivity(null)}
                  className="px-6 py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-semibold rounded-xl"
                >
                  Close & Continue
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmActivity} className="p-6 space-y-4">
                {/* Activity Preview Banner */}
                <div className="flex items-center space-x-3.5 bg-[#F9F8F3] p-3 rounded-2xl border border-[#E5E1D5]">
                  <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-[#E5E1D5] bg-stone-100">
                    <img
                      src={bookingModalActivity.image}
                      alt={bookingModalActivity.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1531415074868-836332616239?auto=format&fit=crop&w=1200&q=80';
                      }}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#8A8E71] uppercase tracking-wider">
                      {bookingModalActivity.category} • {bookingModalActivity.location}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-[#1C1C1A] truncate mt-0.5">
                      {bookingModalActivity.title}
                    </h4>
                    <div className="text-xs text-[#5C5E4E] flex items-center justify-between mt-1">
                      <span>Duration: {bookingModalActivity.duration}</span>
                      <strong className="text-[#D4AF37] font-bold">
                        {bookingModalActivity.isComplimentary
                          ? 'Complimentary'
                          : `₹${bookingModalActivity.pricePerPerson.toLocaleString('en-IN')}/person`}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#8A8E71] mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A8E71] mb-1">Time Slot / Schedule</label>
                    <input
                      type="text"
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-[#F9F8F3] text-[#33332D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#8A8E71] mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A8E71] mb-1">Participants</label>
                    <select
                      value={participants}
                      onChange={(e) => setParticipants(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                    >
                      <option value={1}>1 Person</option>
                      <option value={2}>2 Persons</option>
                      <option value={3}>3 Persons</option>
                      <option value={4}>4 Persons</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#F9F8F3] p-3.5 rounded-2xl border border-[#E5E1D5] flex justify-between items-center text-xs">
                  <span className="text-[#8A8E71]">Total Price:</span>
                  <span className="font-bold text-[#5C5E4E] text-sm">
                    {bookingModalActivity.isComplimentary
                      ? 'Complimentary (Free)'
                      : `₹${(bookingModalActivity.pricePerPerson * participants).toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalActivity(null)}
                    className="px-4 py-2 border border-[#E5E1D5] text-[#5C5E4E] rounded-xl text-xs hover:bg-[#F9F8F3]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold shadow-2xs"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
