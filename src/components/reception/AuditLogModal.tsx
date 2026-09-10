import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  Clock,
  User,
  Building,
} from 'lucide-react';
import { Booking, GuestAuditLog } from '../../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBooking?: Booking | null;
  bookings: Booking[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  selectedBooking,
  bookings,
}) => {
  const [filterGuestId, setFilterGuestId] = useState<string>(
    selectedBooking?.id || 'all'
  );
  const [auditList, setAuditList] = useState<GuestAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedBooking) {
      setFilterGuestId(selectedBooking.id);
    }
  }, [selectedBooking]);

  // Fetch or aggregate audit logs from backend and bookings state
  useEffect(() => {
    if (!isOpen) return;

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/reception/audit-logs');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAuditList(data);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // fallback to state
      }

      // Collect logs from bookings
      const collected: GuestAuditLog[] = [];
      for (const b of bookings) {
        if (b.auditLogs && Array.isArray(b.auditLogs)) {
          collected.push(...b.auditLogs);
        }
      }
      setAuditList(collected);
      setIsLoading(false);
    };

    fetchLogs();
  }, [isOpen, bookings]);

  if (!isOpen) return null;

  const filteredLogs = auditList.filter((log) => {
    if (filterGuestId === 'all') return true;
    return (
      log.bookingId === filterGuestId ||
      (selectedBooking && log.guestName === selectedBooking.guestName)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-[#E5E1D5] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#F9F8F3] px-6 py-4 border-b border-[#E5E1D5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C5E4E] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1C1C1A]">
                Reception Activity & Audit Trail
              </h2>
              <p className="text-xs text-[#8A8E71]">
                Verified tamper-evident record of receptionist edits and status changes
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

        {/* Filter bar */}
        <div className="px-6 py-3 bg-[#FAF9F5] border-b border-[#EBE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#8A8E71]" />
            <span className="text-xs font-semibold text-[#5C5E4E]">Filter by Guest:</span>
            <select
              value={filterGuestId}
              onChange={(e) => setFilterGuestId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E5E1D5] text-xs bg-white text-[#33332D]"
            >
              <option value="all">All Guests & Bookings ({auditList.length} logs)</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.guestName} (Room {b.roomNumber} - {b.id})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-[#8A8E71]">
            Showing <strong className="text-[#1C1C1A]">{filteredLogs.length}</strong> recorded actions
          </div>
        </div>

        {/* Audit List Body */}
        <div className="p-6 max-h-[480px] overflow-y-auto divide-y divide-[#EBE8DE]">
          {isLoading ? (
            <div className="text-center py-12 text-xs text-[#8A8E71]">
              Loading activity logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-8 h-8 text-[#8A8E71] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#1C1C1A]">No Audit Entries Yet</p>
              <p className="text-[11px] text-[#8A8E71] mt-0.5">
                Modifications to customer contact info, dates, or status will appear here.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F2EA] border border-[#E5E1D5] flex items-center justify-center text-[#5C5E4E] shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#1C1C1A]">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono bg-[#EBE8DE] text-[#5C5E4E] px-1.5 py-0.5 rounded">
                          {log.fieldChanged}
                        </span>
                      </div>

                      <div className="text-xs text-[#5C5E4E] mt-1 flex items-center space-x-2">
                        <span>
                          Guest: <strong className="text-[#1C1C1A]">{log.guestName}</strong>
                        </span>
                        <span>•</span>
                        <span>Room {log.roomNumber}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{log.bookingId}</span>
                      </div>

                      {/* Diff change preview */}
                      <div className="mt-2 p-2.5 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-xs flex items-center space-x-2 max-w-xl">
                        <span className="text-[#8A8E71] font-mono line-through truncate max-w-[200px]" title={log.oldValue}>
                          {log.oldValue}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5C5E4E] shrink-0" />
                        <span className="font-semibold text-[#2E6B2E] font-mono truncate max-w-[240px]" title={log.newValue}>
                          {log.newValue}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-medium text-[#1C1C1A] flex items-center justify-end space-x-1">
                      <Clock className="w-3 h-3 text-[#8A8E71]" />
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="text-[10px] text-[#8A8E71] mt-0.5">
                      By: <span className="font-medium text-[#5C5E4E]">{log.performedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F9F8F3] px-6 py-3 border-t border-[#E5E1D5] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#5C5E4E] text-white hover:bg-[#47493D] transition-colors text-xs font-medium"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
