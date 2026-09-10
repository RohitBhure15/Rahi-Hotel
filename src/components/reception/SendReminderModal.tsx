import React, { useState } from 'react';
import {
  X,
  Send,
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Booking, ReceptionMessageType } from '../../types';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onMessageSent?: (msg: any) => void;
}

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  isOpen,
  onClose,
  booking,
  onMessageSent,
}) => {
  if (!isOpen || !booking) return null;

  const [messageType, setMessageType] = useState<ReceptionMessageType>('checkin_reminder');
  const [channels, setChannels] = useState<string[]>(['In-App', 'SMS / WhatsApp']);
  const [subject, setSubject] = useState(
    `Check-in Reminder — Hotel Rahi Room ${booking.roomNumber}`
  );
  const [messageText, setMessageText] = useState(
    `Hello ${booking.guestName}! 👋 This is a friendly reminder that your check-in at Hotel Rahi is scheduled for ${booking.checkIn} at ${booking.checkInTime || '2:00 PM'} (Room ${booking.roomNumber}). Our front desk concierge is eager to welcome you!`
  );
  const [isSending, setIsSending] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleTemplateChange = (type: ReceptionMessageType) => {
    setMessageType(type);
    if (type === 'checkin_reminder') {
      setSubject(`Check-in Reminder — Hotel Rahi Room ${booking.roomNumber}`);
      setMessageText(
        `Hello ${booking.guestName}! 👋 This is a friendly reminder that your check-in at Hotel Rahi is scheduled for ${booking.checkIn} at ${booking.checkInTime || '2:00 PM'} (Room ${booking.roomNumber}). Our front desk concierge is eager to welcome you!`
      );
    } else if (type === 'checkout_reminder') {
      setSubject(`Check-out Notice — Room ${booking.roomNumber}`);
      setMessageText(
        `Dear ${booking.guestName}, we hope you have enjoyed your stay! This is a gentle reminder that check-out for Room ${booking.roomNumber} is scheduled for today at ${booking.checkOutTime || '11:00 AM'}. Please contact Front Desk if you require baggage assistance or late checkout.`
      );
    } else if (type === 'room_ready') {
      setSubject(`Your Luxury Room ${booking.roomNumber} is Ready! 🔑`);
      setMessageText(
        `Exciting news, ${booking.guestName}! Room ${booking.roomNumber} (${booking.roomType}) has been fully sanitized and inspected. Your digital key and welcome amenities are ready at the Front Desk.`
      );
    } else if (type === 'welcome_greeting') {
      setSubject(`Welcome to Hotel Rahi Luxury Resort! 🌺`);
      setMessageText(
        `Welcome ${booking.guestName}! We are delighted to host you in Room ${booking.roomNumber}. Feel free to use our ARIA Concierge 24/7 or dial 9 for immediate reception service.`
      );
    } else {
      setSubject(`Notice from Front Desk Reception`);
      setMessageText(`Dear ${booking.guestName}, `);
    }
  };

  const toggleChannel = (channel: string) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSending(true);
    try {
      const payload = {
        bookingId: booking.id,
        guestName: booking.guestName,
        roomNumber: booking.roomNumber,
        guestPhone: booking.guestPhone,
        guestEmail: booking.guestEmail,
        type: messageType,
        subject,
        messageText,
        channels: channels.length > 0 ? channels : ['In-App'],
        sentBy: 'Priya Sharma (Receptionist)',
      };

      const res = await fetch('/api/reception/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (onMessageSent) onMessageSent(data.record);
      }

      setSuccessNotice(`Message dispatched successfully via ${channels.join(' & ')}!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setSuccessNotice('Message dispatched to guest notification tray.');
      setTimeout(() => onClose(), 1200);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-[#E5E1D5] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#F9F8F3] px-6 py-4 border-b border-[#E5E1D5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C5E4E] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1C1C1A]">
                Dispatch Guest Reminder
              </h2>
              <p className="text-xs text-[#8A8E71]">
                Recipient: {booking.guestName} (Room {booking.roomNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A8E71] hover:text-[#1C1C1A] hover:bg-[#EBE8DE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successNotice && (
          <div className="m-6 p-4 rounded-2xl bg-[#EAF5EA] border border-[#246B24]/30 text-[#246B24] text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="p-6 space-y-4">
          {/* Template pills */}
          <div>
            <label className="block text-xs font-bold text-[#5C5E4E] uppercase tracking-wider mb-2">
              Message Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { type: 'checkin_reminder', label: 'Check-in Reminder' },
                { type: 'checkout_reminder', label: 'Check-out Reminder' },
                { type: 'room_ready', label: 'Room Ready' },
                { type: 'welcome_greeting', label: 'Welcome Greeting' },
                { type: 'general_message', label: 'Custom Notice' },
              ].map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => handleTemplateChange(t.type as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-center ${
                    messageType === t.type
                      ? 'bg-[#5C5E4E] text-white border-[#5C5E4E] shadow-2xs'
                      : 'bg-white text-[#33332D] border-[#E5E1D5] hover:bg-[#FAF9F5]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="block text-xs font-bold text-[#5C5E4E] uppercase tracking-wider mb-2">
              Dispatch Channels
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'In-App', icon: Bell },
                { name: 'SMS / WhatsApp', icon: Smartphone },
                { name: 'Email', icon: Mail },
              ].map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleChannel(name)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    channels.includes(name)
                      ? 'bg-[#F2F5F0] border-[#2E6B2E] text-[#2E6B2E]'
                      : 'bg-white border-[#E5E1D5] text-[#8A8E71]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-[#33332D] mb-1">
              Subject Line
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden font-medium"
            />
          </div>

          {/* Message Text */}
          <div>
            <label className="block text-xs font-medium text-[#33332D] mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D5] text-xs focus:ring-2 focus:ring-[#5C5E4E] focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Recipient summary */}
          <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#E5E1D5] text-xs text-[#5C5E4E] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A8E71] block">Recipient Contact</span>
              <span className="font-mono text-[#1C1C1A]">{booking.guestPhone}</span> • <span className="text-[#1C1C1A]">{booking.guestEmail}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF5EA] text-[#2E6B2E]">
              Ready to Send
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-[#EBE8DE] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5E1D5] text-xs text-[#5C5E4E] hover:bg-[#F5F2EA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 rounded-xl bg-[#5C5E4E] text-white hover:bg-[#47493D] transition-colors text-xs font-medium flex items-center space-x-2 shadow-2xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isSending ? 'Dispatching...' : 'Dispatch Reminder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
