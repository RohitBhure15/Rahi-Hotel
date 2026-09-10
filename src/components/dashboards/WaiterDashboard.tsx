import React, { useState } from 'react';
import {
  Utensils,
  Clock,
  CheckCircle2,
  Bell,
  MapPin,
  Bike,
  Receipt,
  User,
  Plus,
  Send,
  Coffee,
  Check,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { FoodOrder, FoodOrderStatus, FoodOrderLocation } from '../../types';
import { INITIAL_FOOD_ITEMS } from '../../data/mockData';

export const WaiterDashboard: React.FC = () => {
  const { foodOrders, updateFoodOrderStatus, setInvoiceOrder, placeFoodOrder, activeGuestBooking } = useHotel();

  const [waiterName, setWaiterName] = useState('Rahul (Waiter #4)');
  const [filterLocation, setFilterLocation] = useState<'All' | 'Room Service' | 'Restaurant Table' | 'Pool Area'>('All');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // New quick order form state
  const [orderTarget, setOrderTarget] = useState('Table 4');
  const [orderType, setOrderType] = useState<FoodOrderLocation>('Restaurant Table');
  const [guestNameInput, setGuestNameInput] = useState('Guest');
  const [selectedItems, setSelectedItems] = useState<{ [id: string]: number }>({
    'food-1': 1,
    'food-3': 2,
  });
  const [orderNotes, setOrderNotes] = useState('Serve immediately, extra napkins.');

  const readyOrders = foodOrders.filter((o) => o.status === 'Ready');
  const pickedUpOrders = foodOrders.filter((o) => o.status === 'Picked Up');
  const deliveredOrders = foodOrders.filter((o) => o.status === 'Delivered');
  const activeOrders = foodOrders.filter(
    (o) =>
      (o.status === 'Ready' || o.status === 'Picked Up' || o.status === 'Preparing') &&
      (filterLocation === 'All' || o.orderLocation === filterLocation)
  );

  const tables = [
    { id: 'T-01', name: 'Table 1', zone: 'Sea View Deck', seats: 2, status: 'Occupied', activeOrder: '#1026' },
    { id: 'T-02', name: 'Table 2', zone: 'Garden Veranda', seats: 4, status: 'Available', activeOrder: null },
    { id: 'T-03', name: 'Table 3', zone: 'Main Dining Hall', seats: 6, status: 'Reserved', activeOrder: null },
    { id: 'T-04', name: 'Table 4', zone: 'Sea View Deck', seats: 2, status: 'Occupied', activeOrder: '#1028' },
    { id: 'T-05', name: 'Table 5', zone: 'Poolside Nook', seats: 4, status: 'Available', activeOrder: null },
    { id: 'T-06', name: 'Table 6', zone: 'Garden Veranda', seats: 4, status: 'Occupied', activeOrder: null },
  ];

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const items = Object.entries(selectedItems)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([id, quantity]) => {
        const item = INITIAL_FOOD_ITEMS.find((fi) => fi.id === id) || INITIAL_FOOD_ITEMS[0];
        return { item, quantity: Number(quantity) };
      });

    if (items.length === 0) return;

    const subtotal = items.reduce((sum, it) => sum + it.item.price * it.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    const order = placeFoodOrder({
      orderLocation: orderType,
      roomOrTableNumber: orderTarget,
      guestName: guestNameInput,
      items,
      total,
      notes: `${orderNotes} (Assigned to: ${waiterName})`,
    });

    setShowNewOrderModal(false);
    setInvoiceOrder(order);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D5] mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-[#5C5E4E] text-[#D4AF37] shadow-2xs">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#4F6D4F]/10 text-[#4F6D4F] text-[10px] font-bold uppercase tracking-wider border border-[#4F6D4F]/20">
                Staff Dashboard #4
              </span>
              <span className="text-xs text-[#8A8E71]">Dining & Room Service</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1A] mt-0.5">
              Waitstaff & Delivery Pass Console
            </h1>
            <p className="text-xs text-[#8A8E71] mt-0.5">
              Pickup freshly prepared orders from chef pass, deliver to tables & guest rooms, generate instant bill receipts.
            </p>
          </div>
        </div>

        {/* Waiter Identity & New Order Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5E1D5] text-xs">
            <User className="w-3.5 h-3.5 text-[#5C5E4E]" />
            <span className="text-[#8A8E71]">Active Waiter:</span>
            <select
              value={waiterName}
              onChange={(e) => setWaiterName(e.target.value)}
              className="font-semibold text-[#1C1C1A] bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="Rahul (Waiter #4)">Rahul (Waiter #4)</option>
              <option value="Priya (Waitstaff #2)">Priya (Waitstaff #2)</option>
              <option value="Amit (Captain #1)">Amit (Captain #1)</option>
              <option value="Sameer (Room Service #3)">Sameer (Room Service #3)</option>
            </select>
          </div>

          <button
            id="waiter-new-order-btn"
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Take Table/Room Order</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8E71]">Ready for Pickup</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1C1C1A] mt-2">{readyOrders.length}</p>
          <p className="text-[11px] text-[#5C5E4E] mt-1">Waiting at kitchen hot plate pass</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8E71]">Out for Delivery</span>
            <Bike className="w-4 h-4 text-[#5C5E4E]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1C1C1A] mt-2">{pickedUpOrders.length}</p>
          <p className="text-[11px] text-[#5C5E4E] mt-1">In transit to guest room / tables</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8E71]">Delivered Today</span>
            <CheckCircle2 className="w-4 h-4 text-[#4F6D4F]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#4F6D4F] mt-2">{deliveredOrders.length}</p>
          <p className="text-[11px] text-[#8A8E71] mt-1">Completed food dispatches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8E71]">Total Revenue Served</span>
            <Receipt className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#1C1C1A] mt-2">
            ₹{deliveredOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#8A8E71] mt-1">Settled dining tickets</p>
        </div>
      </div>

      {/* Main Grid: Orders to Dispatch & Restaurant Floor Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Order Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-serif text-lg font-bold text-[#1C1C1A]">Live Orders Dispatch Stream</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#E5E1D5] text-[#5C5E4E] text-xs font-semibold">
                {activeOrders.length}
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center space-x-1.5 text-xs bg-[#F5F2EA] p-1 rounded-xl border border-[#E5E1D5]">
              {(['All', 'Room Service', 'Restaurant Table', 'Pool Area'] as const).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setFilterLocation(loc)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filterLocation === loc
                      ? 'bg-[#5C5E4E] text-white shadow-2xs'
                      : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E1D5] shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-[#4F6D4F] mx-auto mb-3" />
              <h4 className="font-serif text-lg font-bold text-[#1C1C1A]">All Orders Dispatched!</h4>
              <p className="text-xs text-[#8A8E71] mt-1">
                No orders currently waiting for pickup or delivery under {filterLocation}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => {
                const isReady = order.status === 'Ready';
                const isPickedUp = order.status === 'Picked Up';
                const isPreparing = order.status === 'Preparing';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                      isReady
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20'
                        : isPickedUp
                        ? 'border-[#5C5E4E]'
                        : 'border-[#E5E1D5]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBE8DE]">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isReady
                              ? 'bg-[#D4AF37]/15 text-[#9E7D1B] border border-[#D4AF37]/30 animate-pulse'
                              : isPickedUp
                              ? 'bg-[#5C5E4E]/10 text-[#5C5E4E] border border-[#5C5E4E]/30'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status === 'Ready' ? '🔔 Ready for Pickup' : order.status}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#1C1C1A]">{order.id}</span>
                        <span className="text-[#8A8E71] text-xs">•</span>
                        <span className="text-xs font-semibold text-[#5C5E4E] flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-[#5C5E4E]" />
                          <span>{order.roomOrTableNumber} ({order.orderLocation})</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-[#8A8E71]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{order.createdAt}</span>
                      </div>
                    </div>

                    {/* Guest & Items List */}
                    <div className="py-3">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#5C5E4E]">
                          Guest: <strong>{order.guestName}</strong>
                        </span>
                        {order.assignedWaiter && (
                          <span className="text-[#8A8E71] bg-[#F5F2EA] px-2 py-0.5 rounded-md font-mono text-[11px]">
                            Waiter: {order.assignedWaiter}
                          </span>
                        )}
                      </div>

                      <div className="bg-[#F9F8F3] rounded-xl p-3 border border-[#EBE8DE] space-y-1.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-[#33332D]">
                              <strong>{it.quantity}x</strong> {it.item.name}
                            </span>
                            <span className="text-[#5C5E4E] font-mono">
                              ₹{(it.item.price * it.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <p className="text-[11px] text-[#A64D4D] italic mt-2 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                          Special Note: {order.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions Toolbar */}
                    <div className="pt-3 border-t border-[#EBE8DE] flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs font-bold text-[#1C1C1A]">
                        Total: ₹{order.total.toLocaleString('en-IN')}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          id={`waiter-view-bill-${order.id}`}
                          onClick={() => setInvoiceOrder(order)}
                          className="px-3 py-1.5 bg-white hover:bg-[#F5F2EA] text-[#5C5E4E] border border-[#E5E1D5] rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>View Bill</span>
                        </button>

                        {isReady && (
                          <button
                            id={`waiter-pickup-btn-${order.id}`}
                            onClick={() => updateFoodOrderStatus(order.id, 'Picked Up', waiterName)}
                            className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#C09B2B] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Pick Up from Pass</span>
                          </button>
                        )}

                        {isPickedUp && (
                          <button
                            id={`waiter-delivered-btn-${order.id}`}
                            onClick={() => updateFoodOrderStatus(order.id, 'Delivered', waiterName)}
                            className="px-4 py-1.5 bg-[#4F6D4F] hover:bg-[#3D553D] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Delivered to Guest</span>
                          </button>
                        )}

                        {isPreparing && (
                          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            Chef Preparing...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Restaurant Floor Table Map */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base font-bold text-[#1C1C1A]">Restaurant Table Status</h3>
              <span className="text-[11px] text-[#8A8E71]">Floor Plan</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {tables.map((tbl) => (
                <div
                  key={tbl.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    tbl.status === 'Occupied'
                      ? 'border-[#D4AF37]/50 bg-[#FDFCF8]'
                      : tbl.status === 'Reserved'
                      ? 'border-[#5C5E4E]/30 bg-stone-50'
                      : 'border-[#E5E1D5] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-[#1C1C1A]">{tbl.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        tbl.status === 'Occupied'
                          ? 'bg-[#D4AF37]'
                          : tbl.status === 'Reserved'
                          ? 'bg-blue-500'
                          : 'bg-[#4F6D4F]'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-[#8A8E71] mt-0.5">{tbl.zone}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-[#5C5E4E]">{tbl.seats} Seats</span>
                    <span
                      className={`font-semibold ${
                        tbl.status === 'Occupied'
                          ? 'text-[#9E7D1B]'
                          : tbl.status === 'Reserved'
                          ? 'text-blue-700'
                          : 'text-[#4F6D4F]'
                      }`}
                    >
                      {tbl.status}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setOrderTarget(tbl.name);
                      setOrderType('Restaurant Table');
                      setShowNewOrderModal(true);
                    }}
                    className="w-full mt-2.5 py-1 text-[10px] font-semibold text-[#5C5E4E] bg-[#F5F2EA] hover:bg-[#EBE8DE] rounded-lg transition-colors cursor-pointer"
                  >
                    + Add Order
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Staff Shift Guide */}
          <div className="bg-[#1C1C1A] rounded-3xl p-6 text-white border border-[#33332D]">
            <h4 className="font-serif text-sm font-bold text-[#D4AF37] mb-2 flex items-center space-x-1.5">
              <Bell className="w-4 h-4" />
              <span>Waitstaff Service SOP</span>
            </h4>
            <ul className="text-xs text-[#E5E1D5] space-y-2 leading-relaxed">
              <li>• Always cross-check the food order slip against tray items before leaving the kitchen pass.</li>
              <li>• For in-room dining, ring the bell twice and announce: &quot;In-room dining service for Room [Number]&quot;.</li>
              <li>• Confirm guest name and provide the thermal or digital bill receipt for billing verification.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1C1A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E5E1D5] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D5]">
              <h3 className="font-serif text-lg font-bold text-[#1C1C1A]">Take New Order (Waitstaff)</h3>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-[#8A8E71] hover:text-[#1C1C1A] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] mb-1">Order Destination</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as FoodOrderLocation)}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                  >
                    <option value="Restaurant Table">Restaurant Table</option>
                    <option value="Room Service">Room Service</option>
                    <option value="Pool Area">Pool Area</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] mb-1">Table / Room Number</label>
                  <input
                    type="text"
                    value={orderTarget}
                    onChange={(e) => setOrderTarget(e.target.value)}
                    placeholder="e.g. Table 4 or Room 204"
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5E4E] mb-1">Guest Name</label>
                <input
                  type="text"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5E4E] mb-1">Select Dishes</label>
                <div className="max-h-48 overflow-y-auto border border-[#E5E1D5] rounded-xl p-2 space-y-2 bg-[#FDFCF8]">
                  {INITIAL_FOOD_ITEMS.map((item) => {
                    const qty = selectedItems[item.id] || 0;
                    return (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-[#EBE8DE] last:border-b-0">
                        <div>
                          <p className="font-medium text-[#1C1C1A]">{item.name}</p>
                          <p className="text-[10px] text-[#8A8E71]">₹{item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => ({
                                ...prev,
                                [item.id]: Math.max(0, (prev[item.id] || 0) - 1),
                              }))
                            }
                            className="w-6 h-6 rounded bg-[#E5E1D5] text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-mono font-semibold">{qty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => ({
                                ...prev,
                                [item.id]: (prev[item.id] || 0) + 1,
                              }))
                            }
                            className="w-6 h-6 rounded bg-[#5C5E4E] text-white text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5E4E] mb-1">Special Waiter Instructions</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 border border-[#E5E1D5] rounded-xl text-xs text-[#5C5E4E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Send Ticket to Kitchen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
