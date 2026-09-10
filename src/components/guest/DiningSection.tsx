import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  Star,
  MapPin,
  Check,
  ChefHat,
  ArrowRight,
  ArrowLeft,
  Receipt,
  Sparkles,
  Search,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { FoodCategory, FoodItem, FoodOrderLocation } from '../../types';
import { INITIAL_FOOD_ITEMS } from '../../data/mockData';
import diningImg from '../../assets/images/resort_restaurant_1788366840777.jpg';

export const DiningSection: React.FC = () => {
  const { placeFoodOrder, activeGuestRoom, setGuestTab, setInvoiceOrder, foodOrders, foodItems } = useHotel();

  const itemsList: FoodItem[] = foodItems && foodItems.length > 0 ? foodItems : INITIAL_FOOD_ITEMS;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ [itemId: string]: number }>({
    'food-1': 1, // Butter Paneer
    'food-3': 2, // Naan
    'food-8': 1, // Lassi
  });

  // Location selector
  const [orderLocation, setOrderLocation] = useState<FoodOrderLocation>('Room Service');
  const [locationDetail, setLocationDetail] = useState(`Room ${activeGuestRoom}`);
  const [specialNotes, setSpecialNotes] = useState('Medium spicy, serve hot with extra lemon wedges.');
  const [guestName, setGuestName] = useState('Rohit Bhure');
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // Keyboard shortcut: Backspace exits the order success receipt view
  useEffect(() => {
    if (!orderSuccessId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target?.tagName?.toLowerCase();
      const isTyping =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.isContentEditable;

      if ((e.key === 'Backspace' || e.key === 'Escape') && !isTyping) {
        e.preventDefault();
        setOrderSuccessId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orderSuccessId]);

  const categories = [
    'All',
    'Breakfast',
    'Starters',
    'Main Course',
    'Indian',
    'Chinese',
    'Italian',
    'South Indian',
    'Desserts',
    'Beverages',
    'Snacks',
    'Kids Menu',
  ];

  const filteredItems = itemsList.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const updateQuantity = (itemId: string, delta: number) => {
    const item = itemsList.find((f) => f.id === itemId);
    if (item && item.isAvailable === false && delta > 0) {
      return; // Do not allow adding unavailable items
    }
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  // Compute Cart lines & total
  const cartLines = Object.entries(cart)
    .map(([id, qty]) => {
      const item = itemsList.find((f) => f.id === id);
      return item ? { item, quantity: qty } : null;
    })
    .filter(Boolean) as { item: FoodItem; quantity: number }[];

  const cartTotal = cartLines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartLines.length === 0) return;

    const newOrder = placeFoodOrder({
      orderLocation,
      roomOrTableNumber: locationDetail,
      guestName,
      items: cartLines,
      total: cartTotal,
      notes: specialNotes,
    });

    setOrderSuccessId(newOrder.id);
    setCart({});
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Visual Dining Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-12 border border-[#E5E1D5] shadow-xs">
        <div className="relative h-64 sm:h-80">
          <img
            src={diningImg}
            alt="The Coastal Palm Gourmet Restaurant"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1C1A]/90 via-[#33332D]/75 to-transparent flex items-center p-6 sm:p-10">
            <div className="max-w-lg text-white">
              <span className="px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase border border-white/20">
                24/7 Culinary Destination
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
                Coastal Breeze Restaurant & In-Room Dining
              </h2>
              <p className="text-xs sm:text-sm text-[#E5E1D5] mt-2 leading-relaxed">
                Relish authentic Indian curries, hand-tossed wood-fired pizzas, gourmet burgers, and artisanal desserts delivered directly to your room, pool cabana, or private lawn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Category Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="font-serif text-2xl font-bold text-[#1C1C1A]">
            Resort Dining Menu
          </h3>
          <p className="text-xs text-[#8A8E71] mt-0.5">
            Select dishes below and choose your delivery location.
          </p>
        </div>

        {/* Category Pills & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-[#8A8E71] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E1D5] rounded-xl text-xs text-[#33332D] focus:outline-hidden focus:ring-2 focus:ring-[#5C5E4E]/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 bg-[#F5F2EA] p-1.5 rounded-2xl border border-[#E5E1D5]">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`dining-cat-${cat.toLowerCase()}-btn`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#5C5E4E] text-white shadow-2xs'
                    : 'text-[#5C5E4E] hover:text-[#1C1C1A] hover:bg-[#EBE8DE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout: Menu Grid + Cart Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Menu Items */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const qty = cart[item.id] || 0;
            const isAvailable = item.isAvailable !== false;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between ${
                  !isAvailable ? 'border-rose-200 bg-rose-50/15' : 'border-[#E5E1D5]'
                }`}
              >
                <div className="flex space-x-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className={`w-20 h-20 rounded-2xl object-cover bg-stone-100 ${
                        !isAvailable ? 'opacity-60 grayscale-30' : ''
                      }`}
                    />
                    <span
                      className={`absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                        item.isVeg ? 'bg-[#4F6D4F]' : 'bg-[#A64D4D]'
                      }`}
                      title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-semibold text-[#8A8E71] uppercase tracking-wider">
                        {item.category}
                      </span>

                      {/* Availability status tag */}
                      {isAvailable ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🟢 Available
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          🔴 Unavailable
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="font-semibold text-[#1C1C1A] text-sm truncate">
                        {item.name}
                      </h4>
                      {item.isChefSpecial && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200">
                          🔥 Chef Special
                        </span>
                      )}
                      {item.isRecommended && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200">
                          ⭐ Recommended
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-1 text-[11px] text-[#8A8E71]">
                      <span className="flex items-center text-[#D4AF37] font-semibold">
                        <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37] mr-0.5" />
                        {item.rating || 4.9}
                      </span>
                      <span>({item.reviewsCount || 30})</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-0.5 text-[#8A8E71]" />
                        {item.prepTime || '15 mins'}
                      </span>
                      {item.spiceLevel && item.spiceLevel !== 'None' && (
                        <>
                          <span>•</span>
                          <span className="text-rose-600 font-medium">🌶️ {item.spiceLevel}</span>
                        </>
                      )}
                    </div>

                    <p className="text-[11px] text-[#5C5E4E] mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.availableTimes && item.availableTimes.length > 0 && (
                      <div className="mt-1.5 text-[10px] text-[#8A8E71]">
                        <span>⏰ Timing: {item.availableTimes.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price and Quantity Stepper */}
                <div className="mt-4 pt-3 border-t border-[#EBE8DE] flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#1C1C1A]">
                      ₹{item.price}
                    </span>
                    {!isAvailable && (
                      <span className="ml-2 text-[10px] text-rose-600 font-semibold">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {!isAvailable ? (
                    <button
                      disabled
                      className="px-3 py-1.5 bg-stone-100 text-stone-400 rounded-xl text-xs font-semibold cursor-not-allowed border border-stone-200"
                    >
                      Sold Out
                    </button>
                  ) : qty > 0 ? (
                    <div className="flex items-center space-x-2 bg-[#F9F8F3] px-2 py-1 rounded-xl border border-[#E5E1D5]">
                      <button
                        id={`decrease-${item.id}-btn`}
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-[#EBE8DE] flex items-center justify-center text-[#5C5E4E] font-bold transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#1C1C1A] px-1">
                        {qty}
                      </span>
                      <button
                        id={`increase-${item.id}-btn`}
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-[#5C5E4E] text-white hover:bg-[#47493D] flex items-center justify-center font-bold transition-colors"
                      >
                        <Plus className="w-3 h-3 text-[#D4AF37]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`add-${item.id}-btn`}
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3.5 py-1.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Interactive Cart & Delivery Details */}
        <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-[#EBE8DE]">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-2xl bg-[#F5F2EA] text-[#5C5E4E]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#1C1C1A]">
                Your Food Order
              </h4>
            </div>
            <span className="text-xs font-bold text-[#5C5E4E] bg-[#F5F2EA] px-2.5 py-1 rounded-full border border-[#E5E1D5]">
              {cartLines.reduce((sum, l) => sum + l.quantity, 0)} items
            </span>
          </div>

          {orderSuccessId ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-[#F2F4F2] text-[#4F6D4F] rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h5 className="font-serif text-lg font-bold text-[#1C1C1A]">
                  Order #{orderSuccessId} Placed!
                </h5>
                <p className="text-xs text-[#5C5E4E] mt-1">
                  Sent to Kitchen. Our chefs are preparing your meal. Track live updates in My Stay.
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  id="view-food-bill-btn"
                  onClick={() => {
                    const placed = foodOrders.find((o) => o.id === orderSuccessId);
                    if (placed) {
                      setInvoiceOrder(placed);
                    }
                  }}
                  className="w-full py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>View Official Bill Receipt 🧾</span>
                </button>
                <button
                  id="track-order-in-mystay-btn"
                  onClick={() => setGuestTab('mystay')}
                  className="w-full py-2.5 border border-[#E5E1D5] hover:bg-[#F9F8F3] text-[#33332D] text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Track Order in My Stay
                </button>
                <button
                  id="exit-order-backspace-btn"
                  onClick={() => setOrderSuccessId(null)}
                  className="w-full py-2 border border-[#E5E1D5] hover:bg-[#F5F2EA] text-[#5C5E4E] text-xs font-medium rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  title="Exit to Menu (Backspace or Esc)"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#5C5E4E]" />
                  <span>Exit to Menu</span>
                  <span className="px-1.5 py-0.5 bg-white text-[#5C5E4E] text-[10px] font-mono font-bold rounded-md border border-[#E5E1D5]">
                    ⌫ Backspace
                  </span>
                </button>
              </div>
            </div>
          ) : cartLines.length === 0 ? (
            <div className="py-12 text-center text-[#8A8E71]">
              <Utensils className="w-10 h-10 mx-auto mb-2 text-[#8A8E71]/40" />
              <p className="text-xs font-medium text-[#1C1C1A]">Your cart is empty</p>
              <p className="text-[11px] text-[#8A8E71] mt-0.5">
                Add culinary delights from the menu to place an order.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
              {/* Cart line items */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cartLines.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-[#EBE8DE]"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-[#1C1C1A] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#8A8E71]">₹{item.price} each</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-[#F9F8F3] rounded-lg px-1.5 py-0.5 border border-[#E5E1D5]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-[#5C5E4E] hover:text-[#1C1C1A] font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-[#1C1C1A] text-[11px] px-1">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-[#5C5E4E] hover:text-[#1C1C1A] font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-[#1C1C1A] w-14 text-right">
                        ₹{item.price * quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Location Selector */}
              <div className="pt-2 border-t border-[#EBE8DE]">
                <label className="block text-[10px] font-bold text-[#8A8E71] uppercase tracking-[0.2em] mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5C5E4E]" />
                  <span>Select Order Location</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs mb-2">
                  {(['Room Service', 'Restaurant Table', 'Pool Area', 'Cafe', 'Lounge'] as FoodOrderLocation[]).map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => {
                        setOrderLocation(loc);
                        if (loc === 'Room Service') setLocationDetail(`Room ${activeGuestRoom}`);
                        else if (loc === 'Restaurant Table') setLocationDetail('Table 4');
                        else if (loc === 'Pool Area') setLocationDetail('Cabana 2');
                        else setLocationDetail(`${loc} Booth`);
                      }}
                      className={`py-1.5 px-2.5 rounded-xl text-[11px] font-medium border text-left transition-colors ${
                        orderLocation === loc
                          ? 'border-[#5C5E4E] bg-[#F5F2EA] text-[#5C5E4E] font-semibold'
                          : 'border-[#E5E1D5] text-[#5C5E4E] hover:bg-[#F9F8F3]'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-[#8A8E71] mb-0.5">Room / Table #</label>
                    <input
                      type="text"
                      id="order-location-detail"
                      value={locationDetail}
                      onChange={(e) => setLocationDetail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D] font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8A8E71] mb-0.5">Guest Name</label>
                    <input
                      type="text"
                      id="order-guest-name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D] font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-[10px] text-[#8A8E71] mb-0.5">Kitchen Instructions</label>
                  <input
                    type="text"
                    id="order-kitchen-notes"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Mild spice, no onions, extra napkins"
                    className="w-full px-2.5 py-1.5 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                  />
                </div>
              </div>

              {/* Total & Place Order Button */}
              <div className="pt-3 border-t border-[#EBE8DE]">
                <div className="flex justify-between items-center text-sm font-bold text-[#1C1C1A] mb-3">
                  <span>Cart Total:</span>
                  <span className="text-[#5C5E4E] text-base">₹{cartTotal}</span>
                </div>

                <button
                  type="submit"
                  id="place-food-order-btn"
                  className="w-full py-3 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors flex items-center justify-center space-x-2"
                >
                  <ChefHat className="w-4 h-4 text-[#D4AF37]" />
                  <span>PLACE ORDER (₹{cartTotal})</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
