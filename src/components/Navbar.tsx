import React, { useState } from 'react';
import rahiLogo from '../assets/images/rahi_hotel_logo_1789045500171.jpg';
import {
  Hotel,
  Bell,
  User,
  Utensils,
  Sparkles,
  Home,
  BedDouble,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  FileText,
  KeyRound,
  ChefHat,
  Sparkle,
  BarChart3,
  SlidersHorizontal,
  Crown,
  Briefcase,
  Wrench,
  Bike,
  Compass,
  MapPin,
  Lock,
  LogOut,
  ShieldCheck,
  Heart,
  Gamepad2,
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { ActiveRole, GuestTab } from '../types';

interface NavbarProps {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const {
    activeRole,
    setActiveRole,
    guestTab,
    setGuestTab,
    activeGuestRoom,
    setActiveGuestRoom,
    notifications,
    rooms,
    setInvoiceBooking,
    activeGuestBooking,
    authUser,
    logout,
  } = useHotel();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: { key: ActiveRole; label: string; icon: React.ReactNode; desc: string; badge?: string }[] = [
    { key: 'login', label: '🔐 Login Portal', icon: <Lock className="w-4 h-4 text-[#D4AF37]" />, desc: 'Employee & Manager Role-Based Authentication Gateway' },
    { key: 'owner', label: '1. Owner Dashboard', icon: <Crown className="w-4 h-4 text-[#D4AF37]" />, desc: '👑 Business overview, revenue & analytics' },
    { key: 'manager', label: '2. Manager Dashboard', icon: <Briefcase className="w-4 h-4 text-[#5C5E4E]" />, desc: '👨‍💼 Hotel Manager - Staff & daily operations' },
    { key: 'reception', label: '3. Reception Dashboard', icon: <KeyRound className="w-4 h-4 text-emerald-600" />, desc: '🧑‍💻 Bookings, check-in/out & guest folio' },
    { key: 'waiter', label: '4. Waiter Dashboard', icon: <Utensils className="w-4 h-4 text-amber-600" />, desc: '🍽️ Tables, food orders & room service' },
    { key: 'kitchen', label: '5. Kitchen Dashboard', icon: <ChefHat className="w-4 h-4 text-rose-600" />, desc: '👨‍🍳 Food preparation & KDS order status' },
    { key: 'housekeeping', label: '6. Housekeeping Dashboard', icon: <Sparkle className="w-4 h-4 text-sky-600" />, desc: '🧹 Room cleaning & guest requests' },
    { key: 'maintenance', label: '7. Maintenance Dashboard', icon: <Wrench className="w-4 h-4 text-orange-600" />, desc: '🔧 Repairs & maintenance work orders' },
    { key: 'guest', label: '8. Guest Portal', icon: <User className="w-4 h-4 text-[#D4AF37]" />, desc: '👤 My Stay, food orders, concierge & bills' },
  ];

  const guestNavItems: { key: GuestTab; label: string; icon: React.ReactNode }[] = [
    { key: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { key: 'rooms', label: 'Rooms & Villas', icon: <BedDouble className="w-3.5 h-3.5" /> },
    { key: 'dining', label: 'Food & Dining', icon: <Utensils className="w-3.5 h-3.5" /> },
    { key: 'activities', label: 'Games', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { key: 'mystay', label: 'My Stay Portal', icon: <Hotel className="w-3.5 h-3.5" /> },
    { key: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'feedback', label: 'Feedback & Ideas', icon: <Heart className="w-3.5 h-3.5 text-[#D4AF37]" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#E5E1D5] transition-all">
      {/* Top enterprise role ribbon */}
      <div className="bg-[#47493D] text-[#E5E1D5] px-4 py-1.5 text-xs border-b border-[#5C5E4E]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[11px] font-medium text-[#E5E1D5]">
              Live Hotel Management System • South Goa Resort
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Authenticated Staff User Pill */}
            {authUser ? (
              <div className="flex items-center space-x-2 bg-[#37392E] px-2.5 py-0.5 rounded-full text-[11px] border border-[#5C5E4E]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#E5E1D5] font-semibold">{authUser.full_name}</span>
                <span className="text-[#D4AF37] font-mono text-[10px] font-bold">({authUser.role})</span>
                <button
                  onClick={logout}
                  className="ml-1 text-[#E5E1D5] hover:text-rose-300 transition-colors flex items-center space-x-0.5"
                  title="Sign out of staff session"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="text-[10px]">Exit</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveRole('login')}
                className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37] hover:bg-[#C29D2D] text-[#1C1C1A] text-[11px] font-bold transition-all shadow-xs"
              >
                <Lock className="w-3 h-3" />
                <span>Staff Login Portal</span>
              </button>
            )}

            {/* Quick Room switch for guest preview */}
            {activeRole === 'guest' && (
              <div className="relative">
                <button
                  id="active-guest-room-selector-btn"
                  onClick={() => setRoomDropdownOpen(!roomDropdownOpen)}
                  className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-[#37392E] hover:bg-[#2C2E24] text-[11px] text-[#D4AF37] font-medium transition-colors"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>My Stay Room: <strong>{activeGuestRoom}</strong></span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {roomDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white text-[#33332D] rounded-xl shadow-xl border border-[#E5E1D5] p-1.5 z-50">
                    <p className="text-[10px] font-semibold text-[#8A8E71] px-2 py-1 uppercase tracking-wider">
                      Select Demo Guest Room
                    </p>
                    {['204', '302', '305', 'Villa 1'].map((rm) => (
                      <button
                        key={rm}
                        onClick={() => {
                          setActiveGuestRoom(rm);
                          setRoomDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between hover:bg-[#F5F2EA] ${
                          activeGuestRoom === rm ? 'bg-[#F5F2EA] font-semibold text-[#5C5E4E]' : 'text-[#33332D]'
                        }`}
                      >
                        <span>Room {rm}</span>
                        <span className="text-[10px] text-[#8A8E71]">
                          {rm === '204' ? 'Rohit (Checked In)' : rm === '302' ? 'Ananya (Suite)' : rm === '305' ? 'Sanjay (Family)' : 'Dr. Vikram (Villa)'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Role switch dropdown */}
            <div className="relative">
              <button
                id="role-switch-dropdown-btn"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 text-[11px] font-semibold transition-colors border border-[#D4AF37]/40"
              >
                <span>View:</span>
                <strong className="text-white">
                  {roles.find((r) => r.key === activeRole)?.label || 'Guest Portal'}
                </strong>
                <ChevronDown className="w-3 h-3 text-[#D4AF37]" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-[#33332D] rounded-2xl shadow-2xl border border-[#E5E1D5] p-2 z-50">
                  <div className="px-3 py-1.5 border-b border-[#EBE8DE] mb-1">
                    <p className="text-xs font-semibold text-[#1C1C1A]">Switch System View</p>
                    <p className="text-[10px] text-[#8A8E71]">Access role-based operational modules</p>
                  </div>
                  <div className="space-y-1">
                    {roles.map((r) => (
                      <button
                        key={r.key}
                        id={`switch-role-${r.key}-btn`}
                        onClick={() => {
                          setActiveRole(r.key);
                          setRoleDropdownOpen(false);
                          if (r.key === 'guest') setGuestTab('home');
                        }}
                        className={`w-full text-left p-2 rounded-xl flex items-start space-x-2.5 transition-colors ${
                          activeRole === r.key
                            ? 'bg-[#F5F2EA] border border-[#E5E1D5] text-[#5C5E4E] font-medium'
                            : 'hover:bg-[#F9F8F3] text-[#33332D]'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 ${activeRole === r.key ? 'bg-[#5C5E4E] text-white' : 'bg-[#F5F2EA] text-[#5C5E4E]'}`}>
                          {r.icon}
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{r.label}</p>
                          <p className="text-[10px] text-[#8A8E71] leading-tight">{r.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => {
              setActiveRole('guest');
              setGuestTab('home');
            }}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#D4AF37]/80 shadow-md group-hover:scale-105 transition-transform bg-[#1C1C1A] shrink-0">
              <img
                src={rahiLogo}
                alt="Rahi Hotel Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#1C1C1A] flex items-center space-x-1">
                <span>RAHI HOTEL</span>
              </span>
              <span className="block text-[9px] tracking-[0.2em] uppercase font-bold text-[#8A8E71]">
                Stay • Dine • Experience
              </span>
            </div>
          </div>

          {/* Guest Navigation Links (when in guest view) */}
          {activeRole === 'guest' ? (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              {guestNavItems.map((item) => (
                <button
                  key={item.key}
                  id={`nav-guest-${item.key}-btn`}
                  onClick={() => setGuestTab(item.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                    guestTab === item.key
                      ? 'bg-[#5C5E4E] text-white font-medium shadow-2xs'
                      : 'text-[#5C5E4E] hover:text-[#1C1C1A] hover:bg-[#F5F2EA]'
                  }`}
                >
                  {guestTab === item.key && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block -ml-0.5" />
                  )}
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          ) : (
            /* Staff Mode quick tabs */
            <div className="hidden md:flex items-center space-x-1.5 bg-[#F5F2EA] p-1 rounded-2xl border border-[#E5E1D5] text-xs">
              {roles
                .filter((r) => r.key !== 'guest')
                .map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setActiveRole(r.key)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 ${
                      activeRole === r.key
                        ? 'bg-[#5C5E4E] text-white shadow-2xs font-semibold'
                        : 'text-[#5C5E4E] hover:text-[#1C1C1A] hover:bg-[#EBE8DE]'
                    }`}
                  >
                    {r.icon}
                    <span>{r.label.split(' ')[0]}</span>
                  </button>
                ))}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center space-x-2.5">
            {/* Notifications Button */}
            <button
              id="open-notifications-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-[#5C5E4E] hover:text-[#1C1C1A] hover:bg-[#F5F2EA] border border-transparent hover:border-[#E5E1D5] transition-colors"
              title="View live notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#D4AF37] text-[#1C1C1A] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick Invoice Document button if booking active */}
            {activeGuestBooking && (
              <button
                id="navbar-quick-invoice-btn"
                onClick={() => setInvoiceBooking(activeGuestBooking)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-[#E5E1D5] bg-[#F9F8F3] hover:bg-[#F5F2EA] text-xs font-medium text-[#5C5E4E] shadow-2xs transition-colors"
                title="View verified invoice document"
              >
                <FileText className="w-4 h-4 text-[#8A8E71]" />
                <span>Invoice #{activeGuestBooking.id.replace('#', '')}</span>
              </button>
            )}

            {/* Prominent Staff & Manager Login / Auth Profile Button */}
            {authUser ? (
              <div className="hidden sm:flex items-center space-x-1.5 bg-[#F5F2EA] px-3 py-1.5 rounded-xl border border-[#E5E1D5] text-xs shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-[#1C1C1A]">{authUser.full_name}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#EBE8DE] text-[#5C5E4E] font-bold text-[10px]">
                  {authUser.role}
                </span>
                <button
                  onClick={logout}
                  className="ml-1 p-1 text-[#8A8E71] hover:text-[#A64D4D] hover:bg-[#FBEAEA] rounded-md transition-colors"
                  title="Sign out of staff session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="navbar-staff-manager-login-btn"
                onClick={() => setActiveRole('login')}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-[#D4AF37] bg-[#FDFBF7] hover:bg-[#F5F2EA] text-[#1C1C1A] text-xs font-bold transition-all shadow-2xs hover:shadow-xs group"
                title="Open Employee and Manager Login Portal"
              >
                <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#975A16]">
                  <Lock className="w-2.5 h-2.5" />
                </div>
                <span>Staff & Manager Login</span>
              </button>
            )}

            {/* CTA Book Stay */}
            {activeRole === 'guest' && (
              <button
                id="navbar-book-stay-cta-btn"
                onClick={() => setGuestTab('rooms')}
                className="hidden sm:block px-4 py-2 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-semibold shadow-2xs transition-colors tracking-wide"
              >
                Book Your Stay
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#5C5E4E] hover:text-[#1C1C1A] hover:bg-[#F5F2EA]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E1D5] bg-[#FDFCF8] px-4 py-3 space-y-2">
          {activeRole === 'guest' ? (
            <div className="grid grid-cols-2 gap-1.5">
              {guestNavItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setGuestTab(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs font-medium flex items-center space-x-2 ${
                    guestTab === item.key ? 'bg-[#5C5E4E] text-white font-semibold' : 'text-[#33332D] hover:bg-[#F5F2EA]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-[#8A8E71] uppercase tracking-wider">Switch Operational Dashboard</p>
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setActiveRole(r.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2 text-left rounded-xl text-xs font-medium flex items-center space-x-2 ${
                    activeRole === r.key ? 'bg-[#5C5E4E] text-white font-semibold' : 'text-[#33332D] hover:bg-[#F5F2EA]'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Mobile Staff Login & Session Card */}
          <div className="pt-2 border-t border-[#EBE8DE]">
            {authUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F2EA] border border-[#E5E1D5] text-xs">
                <div>
                  <p className="font-bold text-[#1C1C1A]">{authUser.full_name}</p>
                  <p className="text-[10px] text-[#8A8E71]">Role: <strong className="text-[#5C5E4E]">{authUser.role}</strong> • ID: {authUser.employee_id}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#FBEAEA] hover:bg-[#F7DADA] text-[#A64D4D] text-xs font-bold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                id="mobile-nav-staff-login-btn"
                onClick={() => {
                  setActiveRole('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                <span>🔐 Staff & Manager Login Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
