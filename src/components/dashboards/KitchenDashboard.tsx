import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  AlertCircle,
  Bell,
  UtensilsCrossed,
  Layers,
  Thermometer,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { FoodOrderStatus } from '../../types';
import { MenuEditor } from './MenuEditor';

export const KitchenDashboard: React.FC = () => {
  const { foodOrders, updateFoodOrderStatus, inventory, foodItems } = useHotel();

  const [kitchenTab, setKitchenTab] = useState<'kds' | 'menu'>('kds');
  const [activeStation, setActiveStation] = useState<'All' | 'Curry & Rice' | 'Tandoor & Breads' | 'Beverages'>('All');
  const [kitchenChef, setKitchenChef] = useState('Chef Arun (Head Chef)');

  const newOrders = foodOrders.filter((o) => o.status === 'New');
  const preparingOrders = foodOrders.filter((o) => o.status === 'Preparing');
  const readyOrders = foodOrders.filter((o) => o.status === 'Ready');
  const completedOrders = foodOrders.filter((o) => o.status === 'Delivered');

  const kitchenInventory = inventory.filter(
    (i) => i.category === 'Food & Beverage' || i.category === 'Kitchen'
  );

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D5] mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-[#5C5E4E] text-[#D4AF37] shadow-2xs">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#A64D4D]/10 text-[#A64D4D] text-[10px] font-bold uppercase tracking-wider border border-[#A64D4D]/20">
                Staff Dashboard #5
              </span>
              <span className="text-xs text-[#8A8E71]">Kitchen & Culinary Management</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1A] mt-0.5">
              Chef Pass & Food Operations Console
            </h1>
            <p className="text-xs text-[#8A8E71] mt-0.5">
              Live kitchen display tickets, hot-plate pass, food inventory, and real-time menu catalog management.
            </p>
          </div>
        </div>

        {/* Chef Station Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5E1D5] text-xs">
            <ChefHat className="w-3.5 h-3.5 text-[#5C5E4E]" />
            <span className="text-[#8A8E71]">On Duty:</span>
            <select
              value={kitchenChef}
              onChange={(e) => setKitchenChef(e.target.value)}
              className="font-semibold text-[#1C1C1A] bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="Chef Arun (Head Chef)">Chef Arun (Head Chef)</option>
              <option value="Sous Chef Manoj">Sous Chef Manoj</option>
              <option value="Chef Sanjeev (Tandoor)">Chef Sanjeev (Tandoor)</option>
            </select>
          </div>

          {kitchenTab === 'kds' && (
            <div className="flex items-center space-x-1.5 text-xs bg-[#F5F2EA] p-1 rounded-xl border border-[#E5E1D5]">
              {(['All', 'Curry & Rice', 'Tandoor & Breads', 'Beverages'] as const).map((station) => (
                <button
                  key={station}
                  onClick={() => setActiveStation(station)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeStation === station
                      ? 'bg-[#5C5E4E] text-white shadow-2xs'
                      : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
                  }`}
                >
                  {station}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Mode Tabs (KDS vs Menu Editor) */}
      <div className="flex items-center space-x-2 mb-8 bg-[#F5F2EA] p-1.5 rounded-2xl border border-[#E5E1D5] w-fit">
        <button
          id="chef-kds-tab-btn"
          onClick={() => setKitchenTab('kds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            kitchenTab === 'kds'
              ? 'bg-[#5C5E4E] text-white shadow-xs'
              : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>🍳 Kitchen Display (KDS) & Tickets</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              kitchenTab === 'kds' ? 'bg-white/20 text-white' : 'bg-[#E5E1D5] text-[#5C5E4E]'
            }`}
          >
            {newOrders.length + preparingOrders.length} active
          </span>
        </button>

        <button
          id="chef-menu-editor-tab-btn"
          onClick={() => setKitchenTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            kitchenTab === 'menu'
              ? 'bg-[#5C5E4E] text-white shadow-xs'
              : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>📖 Menu Management & Editor</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              kitchenTab === 'menu' ? 'bg-white/20 text-white' : 'bg-[#E5E1D5] text-[#5C5E4E]'
            }`}
          >
            {foodItems.length} dishes
          </span>
        </button>
      </div>

      {/* Mode View: Menu Editor */}
      {kitchenTab === 'menu' && <MenuEditor />}

      {/* Mode View: KDS & Kitchen Tickets */}
      {kitchenTab === 'kds' && (
        <>
          {/* KPI Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A64D4D]">New Orders to Fire</span>
            {newOrders.length > 0 ? (
              <span className="w-2.5 h-2.5 rounded-full bg-[#A64D4D] animate-ping" />
            ) : (
              <Clock className="w-4 h-4 text-[#8A8E71]" />
            )}
          </div>
          <p className="font-serif text-3xl font-bold text-[#A64D4D] mt-2">{newOrders.length}</p>
          <p className="text-[11px] text-[#8A8E71] mt-1">Pending chef acceptance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E7D1B]">On the Stove / Wok</span>
            <Flame className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1C1C1A] mt-2">{preparingOrders.length}</p>
          <p className="text-[11px] text-[#5C5E4E] mt-1">Actively cooking in kitchen</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F6D4F]">At Hot-Plate Pass</span>
            <CheckCircle2 className="w-4 h-4 text-[#4F6D4F]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#4F6D4F] mt-2">{readyOrders.length}</p>
          <p className="text-[11px] text-[#8A8E71] mt-1">Waiting for waiter pickup</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8E71]">Avg Prep Time</span>
            <Thermometer className="w-4 h-4 text-[#5C5E4E]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1C1C1A] mt-2">18 mins</p>
          <p className="text-[11px] text-[#4F6D4F] mt-1">Within standard 25m SLA</p>
        </div>
      </div>

      {/* Main KDS Grid: Left: Active Tickets, Right: Ingredients & Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Cooking Tickets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-serif text-lg font-bold text-[#1C1C1A]">Kitchen Tickets Stream</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#E5E1D5] text-[#5C5E4E] text-xs font-semibold">
                {newOrders.length + preparingOrders.length} active
              </span>
            </div>
            <p className="text-xs text-[#8A8E71]">Auto-updated live queue</p>
          </div>

          {newOrders.length === 0 && preparingOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E1D5] shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-[#4F6D4F] mx-auto mb-3" />
              <h4 className="font-serif text-lg font-bold text-[#1C1C1A]">All Tickets Cleared!</h4>
              <p className="text-xs text-[#8A8E71] mt-1">
                The kitchen pass is clear. No active tickets waiting on the stove right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Combine New and Preparing */}
              {[...newOrders, ...preparingOrders].map((order) => {
                const isNew = order.status === 'New';
                const isPrep = order.status === 'Preparing';

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all bg-white shadow-xs ${
                      isNew
                        ? 'border-[#A64D4D] ring-2 ring-[#A64D4D]/20'
                        : 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30'
                    }`}
                  >
                    <div>
                      {/* Ticket Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#EBE8DE]">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm font-bold text-[#1C1C1A]">{order.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isNew
                                  ? 'bg-[#A64D4D]/10 text-[#A64D4D] border border-[#A64D4D]/30 animate-pulse'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {isNew ? '🔥 NEW TICKET' : '🍳 PREPARING'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#5C5E4E] mt-1">
                            Destination: {order.roomOrTableNumber} ({order.orderLocation})
                          </p>
                        </div>
                        <div className="text-right text-[11px] text-[#8A8E71]">
                          <Clock className="w-3.5 h-3.5 inline mr-1" />
                          <span>{order.createdAt}</span>
                        </div>
                      </div>

                      {/* Guest Info */}
                      <div className="pt-2.5 pb-1 text-xs text-[#8A8E71]">
                        Guest: <span className="font-medium text-[#1C1C1A]">{order.guestName}</span>
                      </div>

                      {/* Items to Cook */}
                      <div className="mt-2 space-y-2 bg-[#F9F8F3] p-3 rounded-xl border border-[#EBE8DE]">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs">
                            <div>
                              <span className="font-bold text-[#1C1C1A] mr-1.5">{it.quantity}x</span>
                              <span className="text-[#33332D] font-medium">{it.item.name}</span>
                              <p className="text-[10px] text-[#8A8E71] ml-5">{it.item.category}</p>
                            </div>
                            <span className="text-[10px] text-[#8A8E71] font-mono">{it.item.prepTime}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-[#A64D4D]">
                          <strong>Prep Note:</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="mt-4 pt-3 border-t border-[#EBE8DE]">
                      {isNew ? (
                        <button
                          id={`start-prep-btn-${order.id}`}
                          onClick={() => updateFoodOrderStatus(order.id, 'Preparing')}
                          className="w-full py-2 bg-[#A64D4D] hover:bg-[#8F3E3E] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-2xs transition-all cursor-pointer"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Start Cooking Order</span>
                        </button>
                      ) : (
                        <button
                          id={`mark-ready-btn-${order.id}`}
                          onClick={() => updateFoodOrderStatus(order.id, 'Ready')}
                          className="w-full py-2 bg-[#4F6D4F] hover:bg-[#3D553D] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-2xs transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Ready at Waiter Pass</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Orders Ready at Pass */}
          {readyOrders.length > 0 && (
            <div className="mt-8 bg-white p-5 rounded-2xl border border-[#D4AF37]/50 shadow-xs">
              <div className="flex items-center space-x-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <h4 className="font-serif text-sm font-bold text-[#1C1C1A]">Plated & Ready for Waitstaff Pickup</h4>
              </div>
              <div className="space-y-2">
                {readyOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-xs py-2 border-b border-[#EBE8DE] last:border-b-0">
                    <div>
                      <span className="font-bold text-[#1C1C1A]">{o.id}</span> • {o.roomOrTableNumber} ({o.guestName})
                      <p className="text-[10px] text-[#8A8E71]">
                        {o.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#9E7D1B] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Awaiting Waitstaff
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Stations & Kitchen Inventory Status */}
        <div className="space-y-6">
          {/* Station Workloads */}
          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
            <h3 className="font-serif text-base font-bold text-[#1C1C1A] mb-4">Kitchen Stations</h3>
            <div className="space-y-3">
              {[
                { name: 'Curry & Gravy Station', chef: 'Chef Manoj', load: 'Moderate', color: 'text-amber-700 bg-amber-50' },
                { name: 'Tandoor & Charcoal Oven', chef: 'Chef Sanjeev', load: 'High', color: 'text-rose-700 bg-rose-50' },
                { name: 'Continental & Salads', chef: 'Chef Anita', load: 'Low', color: 'text-emerald-700 bg-emerald-50' },
                { name: 'Beverages & Mocktail Bar', chef: 'Bartender Kiran', load: 'Normal', color: 'text-blue-700 bg-blue-50' },
              ].map((st, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#F9F8F3] border border-[#EBE8DE] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#1C1C1A]">{st.name}</p>
                    <p className="text-[10px] text-[#8A8E71]">Lead: {st.chef}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>
                    {st.load}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pantry & Perishables Inventory */}
          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base font-bold text-[#1C1C1A]">Key Pantry Stock</h3>
              <span className="text-[11px] text-[#8A8E71]">Storage Status</span>
            </div>

            <div className="space-y-2.5">
              {[
                { item: 'Fresh Malai Paneer', stock: '8.5 kg', status: 'Healthy' },
                { item: 'Basmati Biryani Rice', stock: '24 kg', status: 'Healthy' },
                { item: 'Tandoori Spices Blend', stock: '3.2 kg', status: 'Healthy' },
                { item: 'Organic Butter & Ghee', stock: '5.0 kg', status: 'Healthy' },
                { item: 'Fresh Mint & Coriander', stock: '1.2 kg', status: 'Reorder Soon' },
              ].map((inv, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#EBE8DE] last:border-b-0">
                  <span className="text-[#33332D] font-medium">{inv.item}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[#5C5E4E]">{inv.stock}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        inv.status === 'Healthy'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Hygiene SOP */}
          <div className="bg-[#1C1C1A] rounded-3xl p-6 text-white border border-[#33332D]">
            <h4 className="font-serif text-sm font-bold text-[#D4AF37] mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>HACCP Food Safety Protocol</span>
            </h4>
            <ul className="text-xs text-[#E5E1D5] space-y-1.5 leading-relaxed">
              <li>• Maintain hot holding temp at 65°C+ for gravies & curries.</li>
              <li>• Sanitize prep knives and color-coded chopping boards between tasks.</li>
              <li>• Always plate with fresh garnish and clean rim wipe before pass bell.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};
