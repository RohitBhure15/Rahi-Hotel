import React, { useState } from 'react';
import { Calendar, Users, Bed, ArrowRight, Sparkles, Compass, Utensils, Gamepad2 } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import heroImg from '../../assets/images/hero_resort_exterior_1788366799087.jpg';

interface HeroSectionProps {
  onCheckAvailability: (dates: { checkIn: string; checkOut: string; guests: number; roomType: string }) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCheckAvailability }) => {
  const { setGuestTab } = useHotel();

  const today = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(threeDaysLater);
  const [guests, setGuests] = useState(2);
  const [selectedType, setSelectedType] = useState('All');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckAvailability({
      checkIn,
      checkOut,
      guests,
      roomType: selectedType,
    });
    setGuestTab('rooms');
  };

  return (
    <div className="relative">
      {/* Hero Visual Container */}
      <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background Image with warm natural overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Hotel Rahi Luxury Resort Beachfront Exterior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 transform duration-1000 transition-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1A] via-[#33332D]/70 to-[#5C5E4E]/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-20">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#5C5E4E]/40 backdrop-blur-md border border-[#8A8E71]/40 text-[#E5E1D5] text-xs font-medium mb-6 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="tracking-wide">Five-Star Sanctuary on South Goa Shoreline</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15] max-w-3xl mx-auto drop-shadow-xs">
            Escape. Relax. Experience.<br />
            <span className="font-light italic text-[#F5F2EA]">Your perfect stay begins here.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#E5E1D5] font-light max-w-2xl mx-auto leading-relaxed drop-shadow-xs">
            Immerse in private plunge pool villas, Ayurvedic wellness sanctuaries, oceanfront sunset dining, and bespoke 24/7 guest service.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              id="hero-book-stay-btn"
              onClick={() => setGuestTab('rooms')}
              className="px-6 py-3.5 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white font-medium text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center space-x-2 border border-[#8A8E71]/30"
            >
              <span>Book Your Stay</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>

            <button
              id="hero-explore-rooms-btn"
              onClick={() => setGuestTab('rooms')}
              className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 font-medium text-sm transition-all flex items-center space-x-2"
            >
              <Bed className="w-4 h-4 text-[#E5E1D5]" />
              <span>Explore Rooms</span>
            </button>

            <button
              id="hero-order-food-btn"
              onClick={() => setGuestTab('dining')}
              className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 font-medium text-sm transition-all flex items-center space-x-2"
            >
              <Utensils className="w-4 h-4 text-[#E5E1D5]" />
              <span>Order Food</span>
            </button>

            <button
              id="hero-explore-resort-btn"
              onClick={() => setGuestTab('activities')}
              className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 font-medium text-sm transition-all flex items-center space-x-2"
            >
              <Gamepad2 className="w-4 h-4 text-[#E5E1D5]" />
              <span>Games</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Check-in & Availability Search Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-3xl shadow-sm border border-[#E5E1D5] p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end"
        >
          {/* Check in */}
          <div>
            <label className="block text-[10px] font-bold text-[#8A8E71] uppercase tracking-[0.2em] mb-1.5 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#5C5E4E]" />
              <span>Check-In Date</span>
            </label>
            <input
              type="date"
              id="search-check-in"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs font-semibold text-[#33332D] focus:outline-hidden focus:ring-2 focus:ring-[#5C5E4E]/30"
              required
            />
          </div>

          {/* Check out */}
          <div>
            <label className="block text-[10px] font-bold text-[#8A8E71] uppercase tracking-[0.2em] mb-1.5 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#5C5E4E]" />
              <span>Check-Out Date</span>
            </label>
            <input
              type="date"
              id="search-check-out"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs font-semibold text-[#33332D] focus:outline-hidden focus:ring-2 focus:ring-[#5C5E4E]/30"
              required
            />
          </div>

          {/* Guests */}
          <div>
            <label className="block text-[10px] font-bold text-[#8A8E71] uppercase tracking-[0.2em] mb-1.5 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-[#5C5E4E]" />
              <span>Guests Count</span>
            </label>
            <select
              id="search-guests-count"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs font-semibold text-[#33332D] focus:outline-hidden focus:ring-2 focus:ring-[#5C5E4E]/30"
            >
              <option value={1}>1 Adult (Solo)</option>
              <option value={2}>2 Adults (Couple)</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests (Family)</option>
              <option value={6}>5-6 Guests (Villa)</option>
            </select>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-[10px] font-bold text-[#8A8E71] uppercase tracking-[0.2em] mb-1.5 flex items-center space-x-1">
              <Bed className="w-3.5 h-3.5 text-[#5C5E4E]" />
              <span>Room Category</span>
            </label>
            <select
              id="search-room-category"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs font-semibold text-[#33332D] focus:outline-hidden focus:ring-2 focus:ring-[#5C5E4E]/30"
            >
              <option value="All">All Categories</option>
              <option value="Deluxe">Deluxe Room (₹3,500/nt)</option>
              <option value="Premium">Premium Room (₹5,200/nt)</option>
              <option value="Suite">Grand Suite (₹7,800/nt)</option>
              <option value="Family">Family Room (₹9,500/nt)</option>
              <option value="Villa">Plunge Pool Villa (₹14,000/nt)</option>
              <option value="Presidential Suite">Presidential Suite (₹25,000/nt)</option>
            </select>
          </div>

          {/* Submit Search */}
          <div>
            <button
              type="submit"
              id="check-availability-btn"
              className="w-full py-2.5 px-4 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <span>Check Availability</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </form>
      </div>

      {/* Special Highlights Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 rounded-3xl bg-white border border-[#E5E1D5] shadow-xs">
            <p className="font-serif text-2xl font-bold text-[#5C5E4E]">100%</p>
            <p className="text-xs font-semibold text-[#1C1C1A] mt-1">Oceanfront & Lagoon</p>
            <p className="text-[11px] text-[#8A8E71] mt-0.5">Direct private beach access</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-[#E5E1D5] shadow-xs">
            <p className="font-serif text-2xl font-bold text-[#5C5E4E]">24 / 7</p>
            <p className="text-xs font-semibold text-[#1C1C1A] mt-1">In-Room Dining</p>
            <p className="text-[11px] text-[#8A8E71] mt-0.5">Freshly prepared gourmet dishes</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-[#E5E1D5] shadow-xs">
            <p className="font-serif text-2xl font-bold text-[#5C5E4E]">4.9 ★</p>
            <p className="text-xs font-semibold text-[#1C1C1A] mt-1">Guest Satisfaction</p>
            <p className="text-[11px] text-[#8A8E71] mt-0.5">Over 1,200 verified reviews</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-[#E5E1D5] shadow-xs">
            <p className="font-serif text-2xl font-bold text-[#5C5E4E]">Free</p>
            <p className="text-xs font-semibold text-[#1C1C1A] mt-1">Resort Experiences</p>
            <p className="text-[11px] text-[#8A8E71] mt-0.5">Bonfire, Yoga & Infinity Pool</p>
          </div>
        </div>
      </div>
    </div>
  );
};
