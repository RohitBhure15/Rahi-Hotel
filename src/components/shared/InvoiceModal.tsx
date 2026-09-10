import React, { useEffect } from 'react';
import rahiLogo from '../../assets/images/rahi_hotel_logo_1789045500171.jpg';
import {
  X,
  Printer,
  Download,
  CheckCircle,
  ShieldCheck,
  Hotel,
  ArrowLeft,
  Utensils,
  Receipt,
  Clock,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export const InvoiceModal: React.FC = () => {
  const {
    invoiceBooking,
    setInvoiceBooking,
    invoiceOrder,
    setInvoiceOrder,
  } = useHotel();

  const isBillOpen = Boolean(invoiceBooking || invoiceOrder);

  // Close helper
  const handleClose = () => {
    setInvoiceBooking(null);
    setInvoiceOrder(null);
  };

  // Keyboard shortcut: Press Backspace or Escape to exit the bill
  useEffect(() => {
    if (!isBillOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const tagName = target?.tagName?.toLowerCase();
      const isTyping =
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable;

      if ((e.key === 'Backspace' || e.key === 'Escape') && !isTyping) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBillOpen]);

  if (!isBillOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBookingBill = () => {
    if (!invoiceBooking) return;
    const content =
      `Hotel Rahi Luxury Resort & Spa - Official Stay Tax Invoice\n` +
      `============================================================\n` +
      `Invoice #: INV-${invoiceBooking.id.replace('#', '')}\n` +
      `Booking ID: ${invoiceBooking.id}\n` +
      `Guest Name: ${invoiceBooking.guestName}\n` +
      `Room: ${invoiceBooking.roomNumber} (${invoiceBooking.roomType})\n` +
      `Nights: ${invoiceBooking.nights} (${invoiceBooking.checkIn} to ${invoiceBooking.checkOut})\n` +
      `Room Charges: ₹${invoiceBooking.roomCharges.toLocaleString('en-IN')}\n` +
      `Food & Dining: ₹${invoiceBooking.foodCharges.toLocaleString('en-IN')}\n` +
      `Spa & Wellness: ₹${invoiceBooking.spaCharges.toLocaleString('en-IN')}\n` +
      `Taxes (GST 18%): ₹${invoiceBooking.taxes.toLocaleString('en-IN')}\n` +
      `TOTAL AMOUNT: ₹${invoiceBooking.totalAmount.toLocaleString('en-IN')}\n` +
      `Payment Status: ${invoiceBooking.paymentStatus} (${invoiceBooking.paymentMethod})\n` +
      `============================================================\n` +
      `Thank you for staying at Hotel Rahi Luxury Resort & Spa!`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Stay_Invoice_${invoiceBooking.id.replace('#', '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadOrderBill = () => {
    if (!invoiceOrder) return;
    const itemsText = invoiceOrder.items
      .map(
        (it) =>
          `- ${it.name} x${it.quantity} @ ₹${it.price} = ₹${it.quantity * it.price}`
      )
      .join('\n');

    const content =
      `Hotel Rahi - Official Food & Dining Bill Receipt\n` +
      `============================================================\n` +
      `Receipt #: FOOD-${invoiceOrder.id.replace('#', '')}\n` +
      `Order Location: ${invoiceOrder.orderLocation} (${invoiceOrder.roomOrTableNumber})\n` +
      `Guest Name: ${invoiceOrder.guestName}\n` +
      `Date & Time: ${invoiceOrder.createdAt}\n` +
      `Status: ${invoiceOrder.status}\n` +
      `------------------------------------------------------------\n` +
      `Items:\n${itemsText}\n` +
      `------------------------------------------------------------\n` +
      `Subtotal: ₹${invoiceOrder.subtotal.toLocaleString('en-IN')}\n` +
      `GST Tax: ₹${invoiceOrder.tax.toLocaleString('en-IN')}\n` +
      `TOTAL BILLED: ₹${invoiceOrder.total.toLocaleString('en-IN')}\n` +
      `Payment: Charged to Room Folio\n` +
      `============================================================\n` +
      `Thank you for dining with Hotel Rahi!`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Food_Bill_${invoiceOrder.id.replace('#', '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="invoice-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1C1C1A]/70 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5E1D5] overflow-hidden print:border-none print:shadow-none my-6">
        {/* Top actions toolbar (hidden during print) */}
        <div className="bg-[#F5F2EA] px-6 py-3.5 border-b border-[#E5E1D5] flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2.5">
            {/* Backspace Exit Button */}
            <button
              id="exit-bill-top-btn"
              onClick={handleClose}
              className="px-3 py-1.5 bg-white border border-[#E5E1D5] hover:bg-[#F9F8F3] text-[#33332D] rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer group"
              title="Exit Bill (or press Backspace / Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#5C5E4E] group-hover:-translate-x-0.5 transition-transform" />
              <span>Exit Bill</span>
              <span className="px-1.5 py-0.5 bg-[#F5F2EA] text-[#5C5E4E] text-[10px] font-mono font-bold rounded-md border border-[#E5E1D5]">
                ⌫ Backspace
              </span>
            </button>

            <div className="hidden sm:flex items-center space-x-1.5 text-[#5C5E4E] font-medium text-xs pl-1">
              <ShieldCheck className="w-4 h-4 text-[#4F6D4F]" />
              <span>
                {invoiceBooking
                  ? 'Official Tax Stay Invoice'
                  : 'Official Dining Receipt Bill'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="print-invoice-btn"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-[#E5E1D5] rounded-xl text-[#33332D] hover:bg-[#F9F8F3] text-xs font-medium flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#5C5E4E]" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              id="download-invoice-btn"
              onClick={
                invoiceBooking ? handleDownloadBookingBill : handleDownloadOrderBill
              }
              className="px-3.5 py-1.5 bg-[#5C5E4E] text-white rounded-xl hover:bg-[#47493D] text-xs font-medium flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              id="close-invoice-btn"
              onClick={handleClose}
              title="Close (Esc)"
              className="p-1.5 text-[#8A8E71] hover:text-[#1C1C1A] hover:bg-[#E5E1D5]/50 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CASE 1: ROOM STAY TAX INVOICE */}
        {/* ========================================================================= */}
        {invoiceBooking && (
          <div className="p-8 font-sans text-[#33332D]">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#E5E1D5] pb-6">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#D4AF37] bg-[#1C1C1A] shrink-0 shadow-sm">
                    <img
                      src={rahiLogo}
                      alt="Hotel Rahi Logo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1C1C1A]">
                      HOTEL RAHI
                    </h1>
                    <p className="text-[10px] tracking-widest uppercase text-[#8A8E71] font-semibold">
                      Stay • Dine • Experience
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#8A8E71] mt-2 leading-relaxed">
                  Palolem Beach Road, Canacona, South Goa, India - 403702
                  <br />
                  Phone: +91 (832) 264-9000 | reservations@hotelrahi.com
                  <br />
                  GSTIN: 30AABCA1234F1Z8
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-[#F2F4F2] border border-[#4F6D4F]/30 text-[#4F6D4F] text-xs font-bold rounded-lg uppercase tracking-wider">
                  {invoiceBooking.paymentStatus === 'Paid'
                    ? 'PAID IN FULL'
                    : 'PAYMENT PENDING'}
                </span>
                <p className="text-xs font-mono font-semibold text-[#1C1C1A] mt-2">
                  INVOICE #: INV-{invoiceBooking.id.replace('#', '')}
                </p>
                <p className="text-xs text-[#8A8E71]">
                  Date:{' '}
                  {new Date(invoiceBooking.createdAt).toLocaleDateString('en-IN', {
                    dateStyle: 'medium',
                  })}
                </p>
                <p className="text-xs text-[#8A8E71]">
                  Payment: {invoiceBooking.paymentMethod}
                </p>
              </div>
            </div>

            {/* Guest and Stay Details */}
            <div className="grid grid-cols-2 gap-6 py-6 border-b border-[#E5E1D5] text-xs">
              <div>
                <h3 className="font-semibold text-[#5C5E4E] uppercase tracking-wider text-[11px] mb-2">
                  Billed To (Guest Information)
                </h3>
                <p className="font-bold text-[#1C1C1A] text-sm">
                  {invoiceBooking.guestName}
                </p>
                <p className="text-[#8A8E71] mt-0.5">{invoiceBooking.guestEmail}</p>
                <p className="text-[#8A8E71]">{invoiceBooking.guestPhone}</p>
                {invoiceBooking.guestIdVerified && (
                  <p className="text-[#4F6D4F] font-medium flex items-center space-x-1 mt-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      ID Verified ({invoiceBooking.idProofType || 'Aadhaar'})
                    </span>
                  </p>
                )}
              </div>

              <div className="bg-[#F9F8F3] p-4 rounded-2xl border border-[#E5E1D5]">
                <h3 className="font-semibold text-[#5C5E4E] uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
                  <Hotel className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Stay Particulars</span>
                </h3>
                <div className="space-y-1 text-[#33332D]">
                  <div className="flex justify-between">
                    <span className="text-[#8A8E71]">Booking ID:</span>
                    <strong className="text-[#1C1C1A]">{invoiceBooking.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8E71]">Assigned Room:</span>
                    <strong className="text-[#1C1C1A]">
                      Room {invoiceBooking.roomNumber} ({invoiceBooking.roomType})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8E71]">Check-In:</span>
                    <span className="text-[#1C1C1A]">
                      {invoiceBooking.checkIn} (14:00)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8E71]">Check-Out:</span>
                    <span className="text-[#1C1C1A]">
                      {invoiceBooking.checkOut} (11:00)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8E71]">Duration:</span>
                    <span className="text-[#1C1C1A]">
                      {invoiceBooking.nights} Nights ({invoiceBooking.guestsCount}{' '}
                      Guests)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="py-6">
              <h3 className="font-semibold text-[#5C5E4E] uppercase tracking-wider text-[11px] mb-3">
                Itemized Folio Charges
              </h3>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E5E1D5] text-[#5C5E4E] font-semibold uppercase text-[10px]">
                    <th className="py-2.5">Service Description</th>
                    <th className="py-2.5 text-center">Qty / Period</th>
                    <th className="py-2.5 text-right">Rate</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE8DE] text-[#33332D]">
                  <tr>
                    <td className="py-3">
                      <p className="font-medium text-[#1C1C1A]">
                        {invoiceBooking.roomType} Room Accommodation
                      </p>
                      <p className="text-[#8A8E71] text-[11px]">
                        Room #{invoiceBooking.roomNumber}, Complimentary breakfast
                        included
                      </p>
                    </td>
                    <td className="py-3 text-center">
                      {invoiceBooking.nights} Nights
                    </td>
                    <td className="py-3 text-right">
                      ₹
                      {(
                        invoiceBooking.roomCharges / invoiceBooking.nights
                      ).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-medium text-[#1C1C1A]">
                      ₹{invoiceBooking.roomCharges.toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {invoiceBooking.foodCharges > 0 && (
                    <tr>
                      <td className="py-3">
                        <p className="font-medium text-[#1C1C1A]">
                          In-Room Dining & Restaurant Orders
                        </p>
                        <p className="text-[#8A8E71] text-[11px]">
                          Billed to Room Folio (Room Service & Poolside)
                        </p>
                      </td>
                      <td className="py-3 text-center">F&B Folio</td>
                      <td className="py-3 text-right">—</td>
                      <td className="py-3 text-right font-medium text-[#1C1C1A]">
                        ₹{invoiceBooking.foodCharges.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}

                  {invoiceBooking.spaCharges > 0 && (
                    <tr>
                      <td className="py-3">
                        <p className="font-medium text-[#1C1C1A]">
                          Nirvana Spa & Wellness Services
                        </p>
                        <p className="text-[#8A8E71] text-[11px]">
                          Ayurvedic Therapies & Massages
                        </p>
                      </td>
                      <td className="py-3 text-center">Spa Folio</td>
                      <td className="py-3 text-right">—</td>
                      <td className="py-3 text-right font-medium text-[#1C1C1A]">
                        ₹{invoiceBooking.spaCharges.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td className="py-3">
                      <p className="font-medium text-[#1C1C1A]">
                        Goods & Services Tax (GST @ 18%)
                      </p>
                      <p className="text-[#8A8E71] text-[11px]">
                        CGST 9% (₹{Math.round(invoiceBooking.taxes / 2)}) + SGST 9%
                        (₹{Math.round(invoiceBooking.taxes / 2)})
                      </p>
                    </td>
                    <td className="py-3 text-center">18%</td>
                    <td className="py-3 text-right">—</td>
                    <td className="py-3 text-right font-medium text-[#1C1C1A]">
                      ₹{invoiceBooking.taxes.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="border-t-2 border-[#5C5E4E] pt-4 flex justify-between items-start">
              <div className="text-[11px] text-[#8A8E71] max-w-xs leading-relaxed">
                <p className="font-semibold text-[#1C1C1A] mb-1">
                  Terms & Payment Acknowledgement:
                </p>
                <p>
                  This is a computer-generated invoice and requires no physical
                  signature. Check-out time is 11:00 AM. For queries, contact
                  reception desk at Ext. 9.
                </p>
              </div>

              <div className="w-64 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-[#8A8E71]">
                  <span>Subtotal (Net):</span>
                  <span>
                    ₹
                    {(
                      invoiceBooking.roomCharges +
                      invoiceBooking.foodCharges +
                      invoiceBooking.spaCharges
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#8A8E71]">
                  <span>Taxes (GST 18%):</span>
                  <span>₹{invoiceBooking.taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-[#1C1C1A] text-base border-t border-[#E5E1D5] pt-2">
                  <span>TOTAL:</span>
                  <span className="font-serif text-[#1C1C1A]">
                    ₹{invoiceBooking.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#4F6D4F] font-medium text-xs pt-1">
                  <span>Paid via {invoiceBooking.paymentMethod}:</span>
                  <span>
                    -₹{invoiceBooking.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-[#1C1C1A] border-t border-[#E5E1D5] pt-1 text-xs">
                  <span>Balance Due:</span>
                  <span>₹0.00</span>
                </div>
              </div>
            </div>

            {/* Formal stamp */}
            <div className="mt-8 pt-4 border-t border-[#E5E1D5] flex justify-between items-center text-xs text-[#8A8E71]">
              <div>
                <p className="font-medium text-[#1C1C1A]">
                  Rahi Hospitality Pvt. Ltd.
                </p>
                <p className="text-[11px]">Authorized Resort Signatory</p>
              </div>
              <div className="border border-dashed border-[#4F6D4F]/60 rounded-xl px-3.5 py-1.5 text-center text-[#4F6D4F] font-mono text-[10px] uppercase font-bold tracking-widest">
                [ OFFICIAL RECEIPT • PAID ]
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 2: FOOD & DINING ORDER BILL RECEIPT */}
        {/* ========================================================================= */}
        {invoiceOrder && !invoiceBooking && (
          <div className="p-8 font-sans text-[#33332D]">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#E5E1D5] pb-6">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#D4AF37] bg-[#1C1C1A] shrink-0 shadow-sm">
                    <img
                      src={rahiLogo}
                      alt="Hotel Rahi Logo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1C1C1A]">
                      RAHI DINING
                    </h1>
                    <p className="text-[10px] tracking-widest uppercase text-[#8A8E71] font-semibold">
                      Culinary Arts & In-Room Service Folio
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#8A8E71] mt-2 leading-relaxed">
                  Spice Pavilion & Beachside Lounge
                  <br />
                  Order Ref: {invoiceOrder.id} | Kitchen Ext. 104
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-[#F2F4F2] border border-[#4F6D4F]/30 text-[#4F6D4F] text-xs font-bold rounded-lg uppercase tracking-wider">
                  CHARGED TO ROOM
                </span>
                <p className="text-xs font-mono font-semibold text-[#1C1C1A] mt-2">
                  BILL REF: {invoiceOrder.id}
                </p>
                <p className="text-xs text-[#8A8E71]">
                  Placed: {invoiceOrder.createdAt}
                </p>
                <p className="text-xs text-[#8A8E71]">
                  Status: {invoiceOrder.status}
                </p>
              </div>
            </div>

            {/* Order destination particulars */}
            <div className="grid grid-cols-2 gap-6 py-6 border-b border-[#E5E1D5] text-xs">
              <div>
                <h3 className="font-semibold text-[#5C5E4E] uppercase tracking-wider text-[11px] mb-2">
                  Guest Information
                </h3>
                <p className="font-bold text-[#1C1C1A] text-sm">
                  {invoiceOrder.guestName}
                </p>
                <p className="text-[#8A8E71] mt-0.5">
                  Delivery Destination: {invoiceOrder.orderLocation}
                </p>
                <p className="text-[#5C5E4E] font-medium mt-1">
                  Location Identifier: {invoiceOrder.roomOrTableNumber}
                </p>
              </div>

              <div className="bg-[#F9F8F3] p-4 rounded-2xl border border-[#E5E1D5]">
                <h3 className="font-semibold text-[#5C5E4E] uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Order Processing</span>
                </h3>
                <div className="space-y-1 text-[#33332D]">
                  <div className="flex justify-between">
                    <span className="text-[#8A8E71]">Order ID:</span>
                    <strong className="text-[#1C1C1A]">{invoiceOrder.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8E71]">Kitchen Station:</span>
                    <span className="text-[#1C1C1A]">Main Resort Galley</span>
                  </div>
                  {invoiceOrder.waiterName && (
                    <div className="flex justify-between">
                      <span className="text-[#8A8E71]">Assigned Server:</span>
                      <span className="text-[#1C1C1A] font-medium">
                        {invoiceOrder.waiterName}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#8A8E71]">Billed Folio:</span>
                    <span className="text-[#4F6D4F] font-bold">Room #{invoiceOrder.roomOrTableNumber.replace(/\D/g, '') || '204'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="py-6">
              <h3 className="font-semibold text-[#5C5E4E] uppercase tracking-wider text-[11px] mb-3">
                Itemized Dishes & Refreshments
              </h3>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E5E1D5] text-[#5C5E4E] font-semibold uppercase text-[10px]">
                    <th className="py-2.5">Menu Item</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Price</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE8DE] text-[#33332D]">
                  {invoiceOrder.items.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium text-[#1C1C1A]">
                        {line.name}
                      </td>
                      <td className="py-2.5 text-center text-[#5C5E4E]">
                        {line.quantity}
                      </td>
                      <td className="py-2.5 text-right text-[#8A8E71]">
                        ₹{line.price}
                      </td>
                      <td className="py-2.5 text-right font-medium text-[#1C1C1A]">
                        ₹{line.quantity * line.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="border-t-2 border-[#5C5E4E] pt-4 flex justify-between items-start">
              <div className="text-[11px] text-[#8A8E71] max-w-xs leading-relaxed">
                <p className="font-semibold text-[#1C1C1A] mb-1">
                  Billing Acknowledgement:
                </p>
                <p>
                  Charges have been appended to your stay master folio and will be
                  settled during room checkout.
                </p>
              </div>

              <div className="w-64 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-[#8A8E71]">
                  <span>F&B Subtotal:</span>
                  <span>₹{invoiceOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#8A8E71]">
                  <span>Restaurant GST (5%):</span>
                  <span>₹{invoiceOrder.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-[#1C1C1A] text-base border-t border-[#E5E1D5] pt-2">
                  <span>TOTAL BILLED:</span>
                  <span className="font-serif text-[#1C1C1A]">
                    ₹{invoiceOrder.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Formal stamp */}
            <div className="mt-8 pt-4 border-t border-[#E5E1D5] flex justify-between items-center text-xs text-[#8A8E71]">
              <div>
                <p className="font-medium text-[#1C1C1A]">
                  Rahi Culinary Operations
                </p>
                <p className="text-[11px]">Chef de Cuisine & F&B Manager</p>
              </div>
              <div className="border border-dashed border-[#4F6D4F]/60 rounded-xl px-3.5 py-1.5 text-center text-[#4F6D4F] font-mono text-[10px] uppercase font-bold tracking-widest">
                [ BILLED TO ROOM FOLIO ]
              </div>
            </div>
          </div>
        )}

        {/* Bottom bar with Backspace shortcut helper & Exit button */}
        <div className="bg-[#F5F2EA] px-6 py-3.5 border-t border-[#E5E1D5] flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-1.5 text-xs text-[#8A8E71]">
            <Clock className="w-3.5 h-3.5 text-[#5C5E4E]" />
            <span>Shortcut: Press</span>
            <kbd className="px-2 py-0.5 bg-white border border-[#E5E1D5] text-[#1C1C1A] font-mono font-bold rounded-md shadow-2xs text-[11px]">
              ⌫ Backspace
            </kbd>
            <span>or</span>
            <kbd className="px-2 py-0.5 bg-white border border-[#E5E1D5] text-[#1C1C1A] font-mono font-bold rounded-md shadow-2xs text-[11px]">
              Esc
            </kbd>
            <span>to exit this bill</span>
          </div>

          <button
            id="exit-bill-bottom-btn"
            onClick={handleClose}
            className="px-4 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Exit Bill (Backspace)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
