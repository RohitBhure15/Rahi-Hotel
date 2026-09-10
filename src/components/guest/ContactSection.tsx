import React from 'react';
import rahiLogo from '../../assets/images/rahi_hotel_logo_1789045500171.jpg';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Car,
  Wifi,
  Waves,
  Sparkles,
  Utensils,
  ShieldCheck,
  Award,
  Lock,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export const ContactSection: React.FC = () => {
  const { setActiveRole } = useHotel();
  return (
    <footer className="bg-[#1C1C1A] text-[#E5E1D5] pt-16 pb-12 border-t border-[#33332D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Facilities Grid */}
        <div className="pb-12 border-b border-[#33332D] mb-12">
          <h3 className="font-serif text-2xl font-bold text-white text-center mb-8">
            Five-Star Resort Amenities & World-Class Facilities
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-[#33332D]/50 border border-[#5C5E4E]/30">
              <Waves className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="font-semibold text-white text-xs">Infinity Ocean Pool</p>
              <p className="text-[11px] text-[#8A8E71] mt-0.5">Private cabanas & sun loungers</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#33332D]/50 border border-[#5C5E4E]/30">
              <Sparkles className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="font-semibold text-white text-xs">Nirvana Ayurvedic Spa</p>
              <p className="text-[11px] text-[#8A8E71] mt-0.5">Kerala herbal treatments</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#33332D]/50 border border-[#5C5E4E]/30">
              <Utensils className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="font-semibold text-white text-xs">Coastal Breeze Dining</p>
              <p className="text-[11px] text-[#8A8E71] mt-0.5">24/7 gourmet in-room service</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#33332D]/50 border border-[#5C5E4E]/30">
              <Wifi className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="font-semibold text-white text-xs">Ultra-Fast Fiber Wi-Fi</p>
              <p className="text-[11px] text-[#8A8E71] mt-0.5">Seamless resort-wide coverage</p>
            </div>
          </div>
        </div>

        {/* Contact info and Location Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-xs">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37] bg-[#1C1C1A] shrink-0 shadow-md">
                <img
                  src={rahiLogo}
                  alt="Hotel Rahi Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-white tracking-wider block">
                  RAHI HOTEL
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] block font-semibold">
                  Stay • Dine • Experience
                </span>
              </div>
            </div>
            <p className="text-[#8A8E71] leading-relaxed">
              Nestled along the golden sands of Palolem, Hotel Rahi Luxury Resort blends coastal tranquility with bespoke luxury, offering oceanfront villas, curated wellness, and culinary craftsmanship.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#D4AF37]">
              <Award className="w-4 h-4" />
              <span>Condé Nast Traveler Gold List 2026</span>
            </div>
          </div>

          {/* Col 2: Contact Info */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Direct Contact & Reservations
            </h4>
            <div className="flex items-start space-x-2 text-[#E5E1D5]">
              <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
              <span>Palolem Beach Road, Canacona, South Goa, India - 403702</span>
            </div>
            <div className="flex items-center space-x-2 text-[#E5E1D5]">
              <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>+91 (832) 264-9000 / Ext. 9 (Front Desk)</span>
            </div>
            <div className="flex items-center space-x-2 text-[#E5E1D5]">
              <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>reservations@hotelrahi.com</span>
            </div>
            <div className="flex items-center space-x-2 text-[#E5E1D5]">
              <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Front Desk & Concierge: 24 Hours Open</span>
            </div>
          </div>

          {/* Col 3: Airport Transit & Transfers */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Arrival & Chauffeur Services
            </h4>
            <div className="flex items-start space-x-2 text-[#E5E1D5]">
              <Car className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
              <span>
                <strong>Goa Dabolim Airport (GOI):</strong> 60 km (approx. 75 mins via scenic NH66 coastal highway).
              </span>
            </div>
            <p className="text-[#8A8E71] text-[11px]">
              <strong>Mopa Manohar Int'l Airport (GOX):</strong> 110 km (private luxury limousine transfer available upon request).
            </p>
            <p className="text-[#8A8E71] text-[11px]">
              <strong>Madgaon Railway Junction:</strong> 35 km (35 mins).
            </p>
          </div>

          {/* Col 4: Interactive Resort Map representation */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Resort Location Map
            </h4>
            <div className="h-32 rounded-2xl bg-[#33332D]/70 border border-[#5C5E4E]/30 relative overflow-hidden flex items-center justify-center text-center p-3">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="relative z-10">
                <MapPin className="w-6 h-6 text-[#D4AF37] mx-auto animate-bounce mb-1" />
                <p className="font-semibold text-white text-xs">Palolem Beachfront, South Goa</p>
                <span className="inline-block mt-1 text-[10px] text-[#D4AF37] bg-[#1C1C1A]/80 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                  15.0102° N, 74.0232° E
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[#33332D] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8A8E71] gap-2">
          <p>© {new Date().getFullYear()} Hotel Rahi Luxury Resort & Spa Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center space-x-3">
            <button
              onClick={() => setActiveRole('login')}
              className="text-[#D4AF37] hover:text-[#E8CA65] flex items-center space-x-1 font-semibold transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Staff & Manager Portal</span>
            </button>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Stay</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Hotel GST: 30AABCA1234F1Z8</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
