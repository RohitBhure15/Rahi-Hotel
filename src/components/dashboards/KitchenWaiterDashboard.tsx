import React, { useState } from 'react';
import {
  ChefHat,
  Utensils,
  Clock,
  CheckCircle2,
  Bell,
  MapPin,
  Flame,
  Bike,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { FoodOrder, FoodOrderStatus } from '../../types';

export const KitchenWaiterDashboard: React.FC = () => {
  const { foodOrders, updateFoodOrderStatus } = useHotel();

  const [viewMode, setViewMode] = useState<'kitchen' | 'waiter'>('kitchen');
  const [waiterName, setWaiterName] = useState('Rahul (Waiter #4)');

  const newOrders = foodOrders.filter((o) => o.status === 'New');
  const preparingOrders = foodOrders.filter((o) => o.status === 'Preparing');
  const readyOrders = foodOrders.filter((o) => o.status === 'Ready');
  const pickedUpOrders = foodOrders.filter((o) => o.status === 'Picked Up');
  const deliveredOrders = foodOrders.filter((o) => o.status === 'Delivered');

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D5] mb-8">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-[#5C5E4E] text-[#D4AF37]">
              {viewMode === 'kitchen' ? <ChefHat className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1A]">
                {viewMode === 'kitchen' ? 'Kitchen Display System (KDS)' : 'Waitstaff & Delivery Pass Console'}
              </h2>
              <p className="text-xs text-[#8A8E71] mt-0.5">
                {viewMode === 'kitchen'
                  ? 'Real-time order tickets, preparation queues, and pass alerts'
                  : 'Pickup ready orders, dispatch to rooms and tables, track fulfillment'}
              </p>
            </div>
          </div>
        </div>

        {/* Switch Kitchen / Waiter view */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#F5F2EA] p-1.5 rounded-2xl border border-[#E5E1D5] flex items-center space-x-1 text-xs">
            <button
              id="switch-to-kitchen-kds-btn"
              onClick={() => setViewMode('kitchen')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 ${
                viewMode === 'kitchen' ? 'bg-[#5C5E4E] text-white shadow-2xs' : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Kitchen Chef Pass</span>
              {newOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#A64D4D] animate-ping" />
              )}
            </button>
            <button
              id="switch-to-waiter-view-btn"
              onClick={() => setViewMode('waiter')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 ${
                viewMode === 'waiter' ? 'bg-[#5C5E4E] text-white shadow-2xs' : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
              }`}
            >
              <Bike className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Waitstaff Delivery</span>
              {readyOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <div className="bg-[#FCF3F3] border border-[#A64D4D]/20 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-[#A64D4D] block tracking-wider">New Orders</span>
          <span className="text-xl font-bold text-[#1C1C1A]">{newOrders.length}</span>
        </div>
        <div className="bg-[#FDF9EE] border border-[#D4AF37]/30 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-[#D4AF37] block tracking-wider">Preparing</span>
          <span className="text-xl font-bold text-[#1C1C1A]">{preparingOrders.length}</span>
        </div>
        <div className="bg-[#F2F4F2] border border-[#4F6D4F]/30 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-[#4F6D4F] block tracking-wider">Ready for Pick Up</span>
          <span className="text-xl font-bold text-[#1C1C1A]">{readyOrders.length}</span>
        </div>
        <div className="bg-[#F5F2EA] border border-[#8A8E71]/30 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-[#5C5E4E] block tracking-wider">On Delivery</span>
          <span className="text-xl font-bold text-[#1C1C1A]">{pickedUpOrders.length}</span>
        </div>
        <div className="bg-[#F9F8F3] border border-[#E5E1D5] p-3.5 rounded-2xl col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase text-[#8A8E71] block tracking-wider">Delivered Today</span>
          <span className="text-xl font-bold text-[#1C1C1A]">{deliveredOrders.length}</span>
        </div>
      </div>

      {/* Orders Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Col 1: New & Preparing (Kitchen responsibility) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D5]">
            <h3 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A64D4D] animate-pulse" />
              <span>1. Queue & Preparation ({newOrders.length + preparingOrders.length})</span>
            </h3>
          </div>

          {[...newOrders, ...preparingOrders].length === 0 ? (
            <div className="p-8 text-center bg-[#F9F8F3] rounded-2xl border border-[#E5E1D5] text-[#8A8E71] text-xs">
              No pending orders. Kitchen pass is clear!
            </div>
          ) : (
            [...newOrders, ...preparingOrders].map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E5E1D5] p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#5C5E4E] text-sm">{order.id}</span>
                    <p className="text-xs font-semibold text-[#1C1C1A] mt-0.5">
                      {order.orderLocation} • <strong className="text-[#5C5E4E]">{order.roomOrTableNumber}</strong>
                    </p>
                    <p className="text-[10px] text-[#8A8E71]">Guest: {order.guestName}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'New'
                        ? 'bg-[#FCF3F3] text-[#A64D4D] border border-[#A64D4D]/20'
                        : 'bg-[#FDF9EE] text-[#D4AF37] border border-[#D4AF37]/30'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="bg-[#F9F8F3] rounded-xl p-3 space-y-1.5 text-xs text-[#33332D] border border-[#EBE8DE]">
                  {order.items.map((line, idx) => (
                    <div key={idx} className="flex justify-between font-medium">
                      <span>
                        <strong className="text-[#1C1C1A]">{line.quantity}x</strong> {line.item.name}
                      </span>
                      <span className="text-[#8A8E71]">{line.item.prepTime}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <p className="text-[11px] text-[#A64D4D] italic pt-1.5 border-t border-[#E5E1D5]">
                      Note: "{order.notes}"
                    </p>
                  )}
                </div>

                {/* Chef Actions */}
                <div className="flex items-center space-x-2 pt-1">
                  {order.status === 'New' ? (
                    <button
                      onClick={() => updateFoodOrderStatus(order.id, 'Preparing')}
                      className="w-full py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-medium shadow-2xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Accept & Start Cooking</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => updateFoodOrderStatus(order.id, 'Ready')}
                      className="w-full py-2.5 bg-[#4F6D4F] hover:bg-[#3D563D] text-white rounded-xl text-xs font-medium shadow-2xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Ready at Pass Counter 🔔</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Col 2: Ready for Pickup & On Delivery (Waitstaff responsibility) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D5]">
            <h3 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F6D4F]" />
              <span>2. Delivery & Transit ({readyOrders.length + pickedUpOrders.length})</span>
            </h3>
          </div>

          {[...readyOrders, ...pickedUpOrders].length === 0 ? (
            <div className="p-8 text-center bg-[#F9F8F3] rounded-2xl border border-[#E5E1D5] text-[#8A8E71] text-xs">
              No orders ready for delivery at the moment.
            </div>
          ) : (
            [...readyOrders, ...pickedUpOrders].map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E5E1D5] p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#4F6D4F] text-sm">{order.id}</span>
                    <p className="text-xs font-semibold text-[#1C1C1A] mt-0.5">
                      Destination: <strong className="text-[#5C5E4E]">{order.roomOrTableNumber}</strong>
                    </p>
                    <p className="text-[10px] text-[#8A8E71]">{order.orderLocation}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'Ready'
                        ? 'bg-[#F2F4F2] text-[#4F6D4F] border border-[#4F6D4F]/20'
                        : 'bg-[#F5F2EA] text-[#5C5E4E] border border-[#5C5E4E]/20'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="bg-[#F9F8F3] rounded-xl p-3 text-xs text-[#33332D] border border-[#EBE8DE]">
                  <p className="font-semibold text-[#1C1C1A] mb-1">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} Items (₹{order.total}):
                  </p>
                  <p className="text-[11px] text-[#8A8E71] truncate">
                    {order.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
                  </p>
                </div>

                {/* Waiter Actions */}
                <div className="pt-1">
                  {order.status === 'Ready' ? (
                    <button
                      onClick={() => updateFoodOrderStatus(order.id, 'Picked Up', waiterName)}
                      className="w-full py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-medium shadow-2xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Bike className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Pick Up for Delivery ({waiterName.split(' ')[0]})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => updateFoodOrderStatus(order.id, 'Delivered', waiterName)}
                      className="w-full py-2.5 bg-[#4F6D4F] hover:bg-[#3D563D] text-white rounded-xl text-xs font-medium shadow-2xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Delivered to Guest ✅</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Col 3: Fulfilled & Delivered Archive */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D5]">
            <h3 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8A8E71]" />
              <span>3. Delivered Orders Log ({deliveredOrders.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {deliveredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E5E1D5] p-4 text-xs text-[#33332D] space-y-1.5 shadow-2xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#1C1C1A]">{order.id}</span>
                  <span className="text-[10px] text-[#4F6D4F] font-semibold bg-[#F2F4F2] px-2.5 py-0.5 rounded-full border border-[#4F6D4F]/20">
                    Delivered
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{order.roomOrTableNumber} ({order.guestName})</span>
                  <strong className="text-[#1C1C1A]">₹{order.total}</strong>
                </div>
                <p className="text-[10px] text-[#8A8E71]">
                  Waiter: {order.assignedWaiter || 'Waitstaff team'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
