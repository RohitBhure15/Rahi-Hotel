import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export const FirstLoginModal: React.FC = () => {
  const { authUser, updatePasswordOnFirstLogin, showFirstLoginModal, setShowFirstLoginModal } = useHotel();
  const [currentPassword, setCurrentPassword] = useState(authUser?.temporary_password || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!showFirstLoginModal || !authUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password cannot be identical to your temporary password.');
      return;
    }

    setLoading(true);
    const res = await updatePasswordOnFirstLogin(currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setShowFirstLoginModal(false);
      }, 1200);
    } else {
      setError(res.error || 'Failed to update password. Please check your current password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#E5E1D5] shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F2EA] text-[#5C5E4E] mx-auto flex items-center justify-center mb-3 shadow-inner">
            <KeyRound className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1C1C1A]">
            First-Time Password Setup
          </h2>
          <p className="text-xs text-[#8A8E71] mt-1">
            Welcome to Hotel Rahi, <strong className="text-[#1C1C1A]">{authUser.full_name}</strong> ({authUser.employee_id}).
          </p>
          <div className="mt-3 p-3 bg-[#F9F8F3] rounded-xl border border-[#E5E1D5] text-[11px] text-[#5C5E4E] text-left">
            <p>
              Your account was provisioned with a <strong>temporary password</strong>. To comply with hotel security policies, please create your permanent personal password before accessing your workstation.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FBEAEA] border border-[#F2C0C0] text-xs text-[#A64D4D] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#4F6D4F] mx-auto animate-bounce" />
            <p className="font-bold text-sm text-[#1C1C1A]">Password Successfully Updated!</p>
            <p className="text-xs text-[#8A8E71]">Redirecting you to your workstation...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                Current Temporary Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current temporary password"
                required
                className="w-full px-3.5 py-2.5 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-sm focus:outline-none focus:border-[#5C5E4E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                New Personal Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-sm focus:outline-none focus:border-[#5C5E4E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A8E71]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
                className="w-full px-3.5 py-2.5 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-sm focus:outline-none focus:border-[#5C5E4E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password & Enter Dashboard</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
