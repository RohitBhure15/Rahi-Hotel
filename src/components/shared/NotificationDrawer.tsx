import React from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, Coffee, BedDouble, X, Trash2 } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, clearNotifications, activeRole } = useHotel();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Coffee className="w-4 h-4 text-[#D4AF37]" />;
      case 'booking':
        return <BedDouble className="w-4 h-4 text-[#4F6D4F]" />;
      case 'housekeeping':
        return <Clock className="w-4 h-4 text-[#5C5E4E]" />;
      case 'complaint':
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-[#A64D4D]" />;
      default:
        return <Bell className="w-4 h-4 text-[#8A8E71]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1C1C1A]/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-[#FDFCF8] h-full shadow-2xl flex flex-col border-l border-[#E5E1D5]">
        {/* Header */}
        <div className="p-4 border-b border-[#E5E1D5] flex items-center justify-between bg-[#F5F2EA]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5C5E4E] flex items-center justify-center text-[#D4AF37]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#1C1C1A] text-sm">Resort Notifications</h3>
              <p className="text-xs text-[#8A8E71]">Live operational & guest status updates</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button
                id="clear-all-notifications-btn"
                onClick={clearNotifications}
                className="p-1.5 text-[#8A8E71] hover:text-[#A64D4D] hover:bg-[#FCF3F3] rounded-xl transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="p-1.5 text-[#8A8E71] hover:text-[#1C1C1A] hover:bg-[#E5E1D5]/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-[#8A8E71]">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#8A8E71]" />
              <p className="text-sm font-semibold text-[#1C1C1A]">No new notifications</p>
              <p className="text-xs mt-1 text-[#8A8E71]">You will receive live booking, food, and housekeeping alerts here.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3.5 cursor-pointer transition-colors rounded-2xl border ${
                  notif.read
                    ? 'bg-white border-[#E5E1D5] opacity-75 hover:bg-[#F5F2EA]/60'
                    : 'bg-[#F9F8F3] border-[#5C5E4E]/30 shadow-2xs hover:bg-[#F5F2EA]'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-white shadow-2xs border border-[#E5E1D5]">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[#1C1C1A] truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[11px] text-[#8A8E71] whitespace-nowrap ml-2">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#33332D] mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.roomNumber && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium bg-[#E5E1D5]/60 text-[#5C5E4E] rounded-md">
                        Room {notif.roomNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#E5E1D5] bg-[#F5F2EA] flex items-center justify-between text-xs text-[#8A8E71]">
          <span>Active Role: <strong className="capitalize text-[#1C1C1A]">{activeRole}</strong></span>
          <button
            id="mark-all-read-btn"
            onClick={() => notifications.forEach((n) => markNotificationAsRead(n.id))}
            className="text-[#5C5E4E] font-medium hover:underline text-xs flex items-center space-x-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6D4F]" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>
    </div>
  );
};
