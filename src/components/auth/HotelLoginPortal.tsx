import React, { useState } from 'react';
import rahiLogo from '../../assets/images/rahi_hotel_logo_1789045500171.jpg';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  AlertTriangle,
  Building2,
  Sparkles,
  CheckCircle2,
  Users,
  Briefcase,
  ChevronRight,
  Eye,
  EyeOff,
  Hotel,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { ActiveRole } from '../../types';

interface HotelLoginPortalProps {
  initialTab?: 'employee' | 'manager';
}

export const HotelLoginPortal: React.FC<HotelLoginPortalProps> = ({ initialTab = 'employee' }) => {
  const { login, setActiveRole, setGuestTab } = useHotel();
  const [tab, setTab] = useState<'employee' | 'manager'>(initialTab);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both your Employee ID / Username and Password.');
      return;
    }

    setError(null);
    setLoading(true);
    const res = await login(identifier, password, tab);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleQuickLogin = (id: string, pass: string, portalTab: 'employee' | 'manager') => {
    setTab(portalTab);
    setIdentifier(id);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Brand Greeting */}
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-xl mx-auto mb-4 bg-[#1C1C1A]">
          <img
            src={rahiLogo}
            alt="Rahi Hotel Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#EBE8DE] text-[#5C5E4E] text-xs font-semibold uppercase tracking-wider mb-3">
          <Hotel className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Hotel Rahi • Stay • Dine • Experience</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1C1A]">
          Hotel Operations Portal
        </h1>
        <p className="text-sm text-[#8A8E71] mt-1.5">
          Unified authentication gateway for resort employees, front desk, culinary, and executive management.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E5E1D5] shadow-xl overflow-hidden">
        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 bg-[#F9F8F3] border-b border-[#EBE8DE]">
          <button
            type="button"
            onClick={() => {
              setTab('employee');
              setError(null);
            }}
            className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'employee'
                ? 'bg-white text-[#1C1C1A] shadow-xs border border-[#E5E1D5]'
                : 'text-[#8A8E71] hover:text-[#1C1C1A]'
            }`}
          >
            <Users className="w-4 h-4 text-[#5C5E4E]" />
            <span>👷 Employee Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('manager');
              setError(null);
            }}
            className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'manager'
                ? 'bg-white text-[#1C1C1A] shadow-xs border border-[#E5E1D5]'
                : 'text-[#8A8E71] hover:text-[#1C1C1A]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>👨‍💼 Manager / Executive</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* Information Notice */}
          <div className="mb-6 p-4 rounded-2xl bg-[#F5F2EA] border border-[#E5E1D5] text-xs text-[#5C5E4E] flex items-start space-x-3">
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              {tab === 'employee' ? (
                <p>
                  <strong>Role-Based Redirection:</strong> You do not pick your department manually. Your credentials determine whether you enter the <strong>Kitchen, Waiter, Housekeeping, Reception, or Maintenance</strong> dashboard.
                </p>
              ) : (
                <p>
                  <strong>Management Headquarters:</strong> Restricted to the General Manager and Resort Owners. Grants oversight over staff accounts, rooms, analytics, stock, and resolution tickets.
                </p>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-[#FBEAEA] border border-[#F2C0C0] text-xs text-[#A64D4D] flex items-start space-x-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-[#A64D4D] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-0.5">Authentication Issue</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-2">
                {tab === 'employee' ? 'Employee ID, Name, or Email' : 'Manager ID or Corporate Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8E71]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={tab === 'employee' ? 'e.g. EMP1024 or Rahul Kumar' : 'e.g. EMP1001 or manager@aurapalms.com'}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-sm text-[#1C1C1A] placeholder-[#8A8E71] focus:outline-none focus:border-[#5C5E4E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-[#8A8E71]">
                  Temporary or Personal Password
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8E71]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-sm text-[#1C1C1A] placeholder-[#8A8E71] focus:outline-none focus:border-[#5C5E4E] focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8A8E71] hover:text-[#1C1C1A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to {tab === 'employee' ? 'Staff Workstation' : 'Executive Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-[#EBE8DE]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A8E71]">
                Quick Demo Credentials (1-Click Test)
              </span>
              <span className="text-[11px] text-[#5C5E4E]">Click to pre-fill</span>
            </div>

            {tab === 'employee' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP1024', 'Chef@123', 'employee')}
                  className="p-2.5 rounded-xl border border-[#E5E1D5] bg-[#F9F8F3] hover:bg-white hover:border-[#5C5E4E] transition-all text-xs"
                >
                  <p className="font-bold text-[#1C1C1A]">👨‍🍳 Rahul (Chef)</p>
                  <p className="text-[10px] text-[#8A8E71]">ID: EMP1024</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP1025', 'Waiter@123', 'employee')}
                  className="p-2.5 rounded-xl border border-[#E5E1D5] bg-[#F9F8F3] hover:bg-white hover:border-[#5C5E4E] transition-all text-xs"
                >
                  <p className="font-bold text-[#1C1C1A]">🍽️ Arun (Waiter)</p>
                  <p className="text-[10px] text-[#8A8E71]">ID: EMP1025</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP1026', 'Reception@123', 'employee')}
                  className="p-2.5 rounded-xl border border-[#E5E1D5] bg-[#F9F8F3] hover:bg-white hover:border-[#5C5E4E] transition-all text-xs"
                >
                  <p className="font-bold text-[#1C1C1A]">🛎️ Priya (Reception)</p>
                  <p className="text-[10px] text-[#8A8E71]">ID: EMP1026</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP1027', 'House@123', 'employee')}
                  className="p-2.5 rounded-xl border border-[#E5E1D5] bg-[#F9F8F3] hover:bg-white hover:border-[#5C5E4E] transition-all text-xs"
                >
                  <p className="font-bold text-[#1C1C1A]">🧹 Kiran (Housekeeper)</p>
                  <p className="text-[10px] text-[#8A8E71]">ID: EMP1027</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP1028', 'Maint@123', 'employee')}
                  className="p-2.5 rounded-xl border border-[#E5E1D5] bg-[#F9F8F3] hover:bg-white hover:border-[#5C5E4E] transition-all text-xs"
                >
                  <p className="font-bold text-[#1C1C1A]">🔧 Rajesh (Maintenance)</p>
                  <p className="text-[10px] text-[#8A8E71]">ID: EMP1028</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP1030', 'Temp@1030', 'employee')}
                  className="p-2.5 rounded-xl border border-[#D4AF37] bg-[#FDFBF7] hover:bg-white transition-all text-xs"
                  title="Test first-time login with temporary password"
                >
                  <p className="font-bold text-[#1C1C1A]">🔑 Sunita (New Hire)</p>
                  <p className="text-[10px] text-[#D4AF37] font-semibold">First-Time Setup</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP1029', 'Disabled@123', 'employee')}
                  className="col-span-2 sm:col-span-3 p-2 rounded-xl border border-[#F2C0C0] bg-[#FFF5F5] hover:bg-[#FBEAEA] transition-all text-xs text-center text-[#A64D4D]"
                  title="Test deactivated account access rejection"
                >
                  <span className="font-bold">❌ Vikram Jadhav (Disabled Account)</span> — Test Account Blocked Flow
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-left">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP1001', 'Manager@123', 'manager')}
                  className="p-3 rounded-xl border border-[#E5E1D5] bg-[#F9F8F3] hover:bg-white hover:border-[#5C5E4E] transition-all text-xs"
                >
                  <p className="font-bold text-[#1C1C1A]">📋 Kavita Menon</p>
                  <p className="text-[11px] text-[#5C5E4E]">General Manager</p>
                  <p className="text-[10px] text-[#8A8E71] mt-1">ID: EMP1001</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP1000', 'Owner@123', 'manager')}
                  className="p-3 rounded-xl border border-[#E5E1D5] bg-[#F9F8F3] hover:bg-white hover:border-[#5C5E4E] transition-all text-xs"
                >
                  <p className="font-bold text-[#1C1C1A]">👑 Vikram Singhania</p>
                  <p className="text-[11px] text-[#5C5E4E]">Resort Owner</p>
                  <p className="text-[10px] text-[#8A8E71] mt-1">ID: EMP1000</p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-4 bg-[#F9F8F3] border-t border-[#EBE8DE] text-center">
          <button
            type="button"
            onClick={() => {
              setActiveRole('guest');
              setGuestTab('home');
            }}
            className="text-xs font-semibold text-[#5C5E4E] hover:text-[#1C1C1A] transition-colors"
          >
            ← Return to Resort Guest View & Bookings
          </button>
        </div>
      </div>
    </div>
  );
};
