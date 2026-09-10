import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  RefreshCw,
} from 'lucide-react';
import { CustomerCorrectionRequest } from '../../types';

interface ResortAiRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppliedCorrection?: () => void;
}

export const ResortAiRequestsModal: React.FC<ResortAiRequestsModalProps> = ({
  isOpen,
  onClose,
  onAppliedCorrection,
}) => {
  const [requests, setRequests] = useState<CustomerCorrectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reception/correction-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = async (req: CustomerCorrectionRequest) => {
    setApplyingId(req.id);
    try {
      const res = await fetch(`/api/reception/correction-requests/${req.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'Priya Sharma (Receptionist)' }),
      });

      if (res.ok) {
        setSuccessNotice(`Update applied to central database for ${req.guestName}!`);
        await fetchRequests();
        if (onAppliedCorrection) onAppliedCorrection();
        setTimeout(() => setSuccessNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#E5E1D5] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#F9F8F3] px-6 py-4 border-b border-[#E5E1D5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5C5E4E] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-serif font-bold text-[#1C1C1A]">
                  ARIA AI Customer Requests
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8860B] text-white">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8E71]">
                Guest profile correction requests originating from ARIA Concierge
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

        {/* Success toast */}
        {successNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-[#EAF5EA] border border-[#246B24]/30 text-[#246B24] text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[460px] overflow-y-auto divide-y divide-[#EBE8DE]">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#8A8E71]">
              Loading ARIA AI requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="w-8 h-8 text-[#8A8E71] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#1C1C1A]">No AI Requests Pending</p>
              <p className="text-[11px] text-[#8A8E71] mt-0.5">
                When guests request changes to phone numbers, emails, or dates via ARIA, they appear here.
              </p>
            </div>
          ) : (
            requests.map((req) => {
              const isPending = req.status === 'Pending';

              return (
                <div key={req.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-[#1C1C1A]">
                          {req.guestName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F2EA] text-[#5C5E4E] border border-[#E5E1D5]">
                          Room {req.roomNumber}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isPending
                              ? 'bg-[#FDF6E2] text-[#8B6E1B]'
                              : 'bg-[#EAF5EA] text-[#2E6B2E]'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#5C5E4E] mt-1.5 flex items-center space-x-1.5">
                        <span className="font-medium text-[#1C1C1A]">{req.field}:</span>
                        <span className="text-[#8A8E71] line-through">{req.currentValue}</span>
                        <ArrowRight className="w-3 h-3 text-[#5C5E4E]" />
                        <span className="font-semibold text-[#2E6B2E]">{req.requestedValue}</span>
                      </div>

                      <div className="text-[11px] text-[#8A8E71] mt-1 flex items-center space-x-2">
                        <span>Source: <strong className="text-[#5C5E4E]">{req.source}</strong></span>
                        <span>•</span>
                        <span>Reason: {req.reason}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {isPending ? (
                        <button
                          onClick={() => handleApply(req)}
                          disabled={applyingId === req.id}
                          className="px-3 py-1.5 rounded-xl bg-[#2E6B2E] text-white hover:bg-[#235323] transition-colors text-xs font-medium flex items-center space-x-1.5 shadow-2xs disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{applyingId === req.id ? 'Applying...' : 'Apply Update'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#2E6B2E] font-medium flex items-center space-x-1 bg-[#EAF5EA] px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Updated in DB</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F9F8F3] px-6 py-3 border-t border-[#E5E1D5] flex items-center justify-between">
          <button
            onClick={fetchRequests}
            className="text-xs text-[#5C5E4E] hover:text-[#1C1C1A] flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Requests</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#5C5E4E] text-white hover:bg-[#47493D] transition-colors text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
