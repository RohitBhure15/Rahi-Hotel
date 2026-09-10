import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, KeyRound, Lock, Building } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { ActiveRole } from '../../types';

interface UnauthorizedBarrierProps {
  attemptedRole: ActiveRole;
}

export const UnauthorizedBarrier: React.FC<UnauthorizedBarrierProps> = ({ attemptedRole }) => {
  const { authUser, logout, setActiveRole, setGuestTab } = useHotel();

  const getAuthorizedRoleLabel = (role?: string) => {
    switch (role) {
      case 'CHEF': return 'Kitchen Dashboard';
      case 'WAITER': return 'Waiter & Dining Dashboard';
      case 'HOUSEKEEPING': return 'Housekeeping Dashboard';
      case 'RECEPTIONIST': return 'Front Desk Reception';
      case 'MAINTENANCE': return 'Engineering Maintenance';
      case 'MANAGER': return 'General Manager Headquarters';
      case 'OWNER': return 'Executive Owner Dashboard';
      default: return 'Guest Portal';
    }
  };

  const getAuthorizedRoleKey = (role?: string): ActiveRole => {
    switch (role) {
      case 'CHEF': return 'kitchen';
      case 'WAITER': return 'waiter';
      case 'HOUSEKEEPING': return 'housekeeping';
      case 'RECEPTIONIST': return 'reception';
      case 'MAINTENANCE': return 'maintenance';
      case 'MANAGER': return 'manager';
      case 'OWNER': return 'owner';
      default: return 'guest';
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#F2C0C0] p-8 text-center shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF5F5] text-[#A64D4D] mx-auto flex items-center justify-center border border-[#FBEAEA]">
          <ShieldAlert className="w-8 h-8 text-[#A64D4D]" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A64D4D] bg-[#FFF0F0] px-3 py-1 rounded-full border border-[#FBEAEA]">
            403 • Access Denied
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1A] mt-3">
            Role-Based Access Restricted
          </h2>
          <p className="text-xs text-[#8A8E71] mt-2">
            Backend authorization policies enforce strict departmental isolation.
          </p>
        </div>

        {authUser ? (
          <div className="p-4 rounded-2xl bg-[#F9F8F3] border border-[#E5E1D5] text-xs text-left space-y-2">
            <div className="flex justify-between items-center text-[#8A8E71] border-b border-[#EBE8DE] pb-2">
              <span>Current Session:</span>
              <span className="font-mono font-bold text-[#5C5E4E]">{authUser.employee_id}</span>
            </div>
            <p className="text-[#1C1C1A]">
              Authenticated as: <strong className="text-[#5C5E4E]">{authUser.full_name}</strong>
            </p>
            <p className="text-[#1C1C1A]">
              Assigned Role: <span className="px-2 py-0.5 rounded-md bg-[#EBE8DE] font-bold text-[#5C5E4E]">{authUser.role}</span>
            </p>
            <p className="text-[#8A8E71] text-[11px]">
              Attempted destination: <code className="text-[#A64D4D] font-mono">{attemptedRole.toUpperCase()}</code>
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F9F8F3] border border-[#E5E1D5] text-xs text-[#5C5E4E]">
            <p>You must sign in with staff credentials to access operational workstations.</p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {authUser ? (
            <button
              onClick={() => setActiveRole(getAuthorizedRoleKey(authUser.role))}
              className="w-full py-3 px-4 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to {getAuthorizedRoleLabel(authUser.role)}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveRole('login')}
              className="w-full py-3 px-4 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Go to Staff Login Portal</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              setActiveRole('guest');
              setGuestTab('home');
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-[#E5E1D5] hover:bg-[#F9F8F3] text-[#5C5E4E] text-xs font-medium transition-all flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account / Guest View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
