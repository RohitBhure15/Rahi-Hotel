import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Flame,
  Star,
  Clock,
  AlertCircle,
  Tag,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  Utensils,
  Leaf,
  ShieldAlert,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { FoodCategory, FoodItem, MealAvailability, SpiceLevel } from '../../types';

const CATEGORIES: FoodCategory[] = [
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

const MEAL_TIMES: MealAvailability[] = ['Breakfast', 'Lunch', 'Dinner', 'All Day'];
const SPICE_LEVELS: SpiceLevel[] = ['None', 'Mild', 'Medium', 'Spicy', 'Extra Spicy'];
const COMMON_ALLERGENS = ['Dairy', 'Gluten', 'Nuts', 'Peanuts', 'Soy', 'Egg', 'Shellfish', 'Mustard', 'Sesame'];

// Curated image presets for easy photo assignment by chef
const IMAGE_PRESETS = [
  { label: 'Paneer Butter Masala', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dal Makhani', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tandoori / Naan', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { label: 'Artisan Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
  { label: 'Paneer Tikka / Kebab', url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Crispy Dosa', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
  { label: 'Breakfast Platter', url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80' },
  { label: 'Wok Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80' },
  { label: 'Saffron Lassi', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80' },
  { label: 'Indian Desserts / Gulab Jamun', url: 'https://images.unsplash.com/photo-1605197148560-637996c141d0?auto=format&fit=crop&w=800&q=80' },
  { label: 'Toasted Sandwich', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
  { label: 'Kids Meal / Pasta', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
];

export const MenuEditor: React.FC = () => {
  const {
    foodItems,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    toggleFoodItemAvailability,
    updateFoodItemPrice,
    reloadMenu,
  } = useHotel();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Quick price editing modal/popover state
  const [quickPriceEditId, setQuickPriceEditId] = useState<string | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Delete confirmation
  const [itemToDelete, setItemToDelete] = useState<FoodItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<FoodCategory>('Main Course');
  const [formPrice, setFormPrice] = useState<number>(250);
  const [formPrepTime, setFormPrepTime] = useState('15 mins');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formIsVeg, setFormIsVeg] = useState(true);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsChefSpecial, setFormIsChefSpecial] = useState(false);
  const [formIsRecommended, setFormIsRecommended] = useState(false);
  const [formSpiceLevel, setFormSpiceLevel] = useState<SpiceLevel>('Medium');
  const [formAvailableTimes, setFormAvailableTimes] = useState<MealAvailability[]>(['Lunch', 'Dinner']);
  const [formAllergens, setFormAllergens] = useState<string[]>([]);
  const [formIngredientsInput, setFormIngredientsInput] = useState<string>('');
  const [customAllergenInput, setCustomAllergenInput] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Open modal for Adding a new item
  const openAddModal = () => {
    setEditingItemId(null);
    setFormName('');
    setFormCategory('Main Course');
    setFormPrice(280);
    setFormPrepTime('15 mins');
    setFormDescription('');
    setFormImage(IMAGE_PRESETS[0].url);
    setFormIsVeg(true);
    setFormIsAvailable(true);
    setFormIsChefSpecial(false);
    setFormIsRecommended(false);
    setFormSpiceLevel('Medium');
    setFormAvailableTimes(['Lunch', 'Dinner']);
    setFormAllergens(['Dairy']);
    setFormIngredientsInput('');
    setIsModalOpen(true);
  };

  // Open modal for Editing existing item
  const openEditModal = (item: FoodItem) => {
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormPrepTime(item.prepTime || '15 mins');
    setFormDescription(item.description || '');
    setFormImage(item.image || IMAGE_PRESETS[0].url);
    setFormIsVeg(item.isVeg !== undefined ? item.isVeg : true);
    setFormIsAvailable(item.isAvailable !== false);
    setFormIsChefSpecial(Boolean(item.isChefSpecial));
    setFormIsRecommended(Boolean(item.isRecommended));
    setFormSpiceLevel(item.spiceLevel || 'Medium');
    setFormAvailableTimes(item.availableTimes && item.availableTimes.length > 0 ? item.availableTimes : ['Lunch', 'Dinner']);
    setFormAllergens(item.allergens || []);
    setFormIngredientsInput((item.ingredients || []).join(', '));
    setIsModalOpen(true);
  };

  // Save Form (Add or Edit)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    setIsSaving(true);
    const parsedIngredients = formIngredientsInput
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const itemPayload = {
      name: formName.trim(),
      category: formCategory,
      price: Number(formPrice),
      rating: 4.9,
      reviewsCount: 42,
      isVeg: formIsVeg,
      prepTime: formPrepTime.trim() || '15 mins',
      description: formDescription.trim(),
      image: formImage.trim() || IMAGE_PRESETS[0].url,
      isAvailable: formIsAvailable,
      isChefSpecial: formIsChefSpecial,
      isRecommended: formIsRecommended,
      availableTimes: formAvailableTimes,
      spiceLevel: formSpiceLevel,
      allergens: formAllergens,
      ingredients: parsedIngredients,
    };

    try {
      if (editingItemId) {
        await updateFoodItem(editingItemId, itemPayload);
        showNotification(`✅ "${itemPayload.name}" updated successfully! Customer menu updated.`);
      } else {
        await addFoodItem(itemPayload);
        showNotification(`🎉 "${itemPayload.name}" added to menu catalog!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showNotification('⚠️ Error saving item. Please check network.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Price Save
  const handleSaveQuickPrice = async (itemId: string) => {
    const val = Number(quickPriceValue);
    if (isNaN(val) || val <= 0) {
      setQuickPriceEditId(null);
      return;
    }
    const item = foodItems.find((f) => f.id === itemId);
    await updateFoodItemPrice(itemId, val);
    showNotification(`💰 Price for "${item?.name}" updated to ₹${val}! Saved to database.`);
    setQuickPriceEditId(null);
  };

  // Quick Availability Toggle
  const handleToggleAvailability = async (item: FoodItem) => {
    const nextStatus = !item.isAvailable;
    await toggleFoodItemAvailability(item.id);
    showNotification(
      nextStatus
        ? `🟢 "${item.name}" is now Available for ordering!`
        : `🔴 "${item.name}" marked as Sold Out / Unavailable.`
    );
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    await deleteFoodItem(itemToDelete.id);
    showNotification(`🗑️ Removed "${itemToDelete.name}" from menu.`);
    setItemToDelete(null);
  };

  // Filter food items
  const filteredItems = foodItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (availabilityFilter === 'available' && item.isAvailable === false) return false;
    if (availabilityFilter === 'unavailable' && item.isAvailable !== false) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const availableCount = foodItems.filter((f) => f.isAvailable !== false).length;
  const unavailableCount = foodItems.filter((f) => f.isAvailable === false).length;
  const chefSpecialCount = foodItems.filter((f) => f.isChefSpecial).length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1C1A] text-[#F9F8F3] px-5 py-3 rounded-2xl shadow-xl border border-[#D4AF37]/50 flex items-center space-x-3 animate-fade-in">
          <Utensils className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-xs font-semibold">{feedbackMessage}</span>
        </div>
      )}

      {/* Top Bar Summary & Add Button */}
      <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Menu Management
              </span>
              <span className="text-xs text-[#8A8E71]">Real-Time Database Sync</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1C1C1A] mt-1">
              Food Menu & Price Catalog Editor
            </h2>
            <p className="text-xs text-[#5C5E4E] mt-0.5 max-w-2xl">
              Add new food dishes, edit pricing, toggle availability between 🟢 Available and 🔴 Unavailable, set meal-time availability, and update chef recommendations. All changes reflect immediately on customer dining menus.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              id="reload-menu-btn"
              onClick={reloadMenu}
              className="p-2.5 rounded-2xl border border-[#E5E1D5] text-[#5C5E4E] hover:bg-[#F5F2EA] transition-colors flex items-center space-x-1.5 text-xs font-medium cursor-pointer"
              title="Refresh menu from MySQL database"
            >
              <RefreshCw className="w-4 h-4 text-[#5C5E4E]" />
              <span className="hidden sm:inline">Sync DB</span>
            </button>

            <button
              id="add-food-item-btn"
              onClick={openAddModal}
              className="px-4 py-2.5 bg-[#4F6D4F] hover:bg-[#3E573E] text-white rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add New Food Item</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#EBE8DE]">
          <div className="bg-[#F9F8F3] p-3.5 rounded-2xl border border-[#EBE8DE]">
            <span className="text-[11px] font-semibold text-[#8A8E71]">Total Food Catalog</span>
            <p className="font-serif text-2xl font-bold text-[#1C1C1A] mt-0.5">{foodItems.length} dishes</p>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800">🟢 Available Now</span>
            <p className="font-serif text-2xl font-bold text-emerald-800 mt-0.5">{availableCount} active</p>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-800">🔴 Sold Out / Off-Menu</span>
            <p className="font-serif text-2xl font-bold text-rose-800 mt-0.5">{unavailableCount} items</p>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800">🔥 Chef Curated</span>
            <p className="font-serif text-2xl font-bold text-amber-800 mt-0.5">{chefSpecialCount} specials</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-[#E5E1D5] p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8A8E71] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-food-menu-input"
              type="text"
              placeholder="Search dish name, description, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F9F8F3] rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A] placeholder-[#8A8E71] focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A8E71] hover:text-[#1C1C1A]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Availability Status Filter */}
          <div className="flex items-center space-x-1.5 text-xs bg-[#F5F2EA] p-1 rounded-xl border border-[#E5E1D5] shrink-0">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                availabilityFilter === 'all'
                  ? 'bg-white text-[#1C1C1A] shadow-2xs font-semibold'
                  : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
              }`}
            >
              All Items ({foodItems.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                availabilityFilter === 'available'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'text-emerald-800 hover:text-emerald-900'
              }`}
            >
              <span>🟢 Available</span>
              <span>({availableCount})</span>
            </button>
            <button
              onClick={() => setAvailabilityFilter('unavailable')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                availabilityFilter === 'unavailable'
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'text-rose-800 hover:text-rose-900'
              }`}
            >
              <span>🔴 Sold Out</span>
              <span>({unavailableCount})</span>
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-[#5C5E4E] text-white shadow-2xs font-semibold'
                : 'bg-[#F9F8F3] text-[#5C5E4E] hover:bg-[#EBE8DE] border border-[#E5E1D5]'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#5C5E4E] text-white shadow-2xs font-semibold'
                  : 'bg-[#F9F8F3] text-[#5C5E4E] hover:bg-[#EBE8DE] border border-[#E5E1D5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Catalog Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E1D5] shadow-xs">
          <Utensils className="w-12 h-12 text-[#8A8E71] mx-auto mb-3" />
          <h4 className="font-serif text-lg font-bold text-[#1C1C1A]">No Menu Items Found</h4>
          <p className="text-xs text-[#8A8E71] mt-1">
            Try adjusting your search query or category filter, or click "Add New Food Item" above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isAvailable = item.isAvailable !== false;
            const isEditingPrice = quickPriceEditId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  !isAvailable ? 'border-rose-200 bg-rose-50/15 opacity-90' : 'border-[#E5E1D5] hover:border-[#D4AF37]/50'
                }`}
              >
                <div>
                  {/* Top Item Info */}
                  <div className="flex space-x-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className={`w-24 h-24 rounded-2xl object-cover bg-stone-100 ${
                          !isAvailable ? 'grayscale-40' : ''
                        }`}
                      />
                      <span
                        className={`absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                          item.isVeg ? 'bg-[#4F6D4F]' : 'bg-[#A64D4D]'
                        }`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-[#8A8E71] uppercase tracking-wider">
                          {item.category}
                        </span>

                        {/* Badges */}
                        <div className="flex items-center space-x-1">
                          {item.isChefSpecial && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200 flex items-center space-x-0.5">
                              <Flame className="w-2.5 h-2.5 text-amber-600" />
                              <span>Special</span>
                            </span>
                          )}
                          {item.isRecommended && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200 flex items-center space-x-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>Best</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-serif text-base font-bold text-[#1C1C1A] truncate">
                        {item.name}
                      </h3>

                      <p className="text-[11px] text-[#5C5E4E] mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                        <span className="flex items-center text-[#5C5E4E] bg-[#F9F8F3] px-1.5 py-0.5 rounded-md border border-[#E5E1D5]">
                          <Clock className="w-2.5 h-2.5 mr-1 text-[#8A8E71]" />
                          {item.prepTime || '15 mins'}
                        </span>

                        {item.spiceLevel && item.spiceLevel !== 'None' && (
                          <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md border border-rose-200 font-semibold">
                            🌶️ {item.spiceLevel}
                          </span>
                        )}

                        {item.availableTimes && item.availableTimes.length > 0 && (
                          <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-md font-medium">
                            ⏰ {item.availableTimes.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ingredients & Allergens preview */}
                  {((item.ingredients && item.ingredients.length > 0) || (item.allergens && item.allergens.length > 0)) && (
                    <div className="mt-3 pt-2.5 border-t border-[#EBE8DE] text-[10px] space-y-1">
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="text-[#5C5E4E] truncate">
                          <strong className="text-[#1C1C1A]">Ingredients:</strong> {item.ingredients.join(', ')}
                        </div>
                      )}
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="text-amber-800 flex items-center space-x-1">
                          <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate"><strong>Allergens:</strong> {item.allergens.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Interactive Controls (Price editing + Availability Toggle + Actions) */}
                <div className="mt-4 pt-3 border-t border-[#EBE8DE] flex flex-wrap items-center justify-between gap-2">
                  {/* Price display / Inline quick editor */}
                  <div className="flex items-center space-x-2">
                    {isEditingPrice ? (
                      <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-[#D4AF37] shadow-xs">
                        <span className="text-xs font-bold text-[#1C1C1A] pl-1">₹</span>
                        <input
                          id={`quick-price-input-${item.id}`}
                          type="number"
                          autoFocus
                          value={quickPriceValue}
                          onChange={(e) => setQuickPriceValue(e.target.value)}
                          className="w-16 px-1 py-0.5 text-xs font-bold text-[#1C1C1A] border-b border-[#5C5E4E] focus:outline-hidden"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveQuickPrice(item.id);
                            if (e.key === 'Escape') setQuickPriceEditId(null);
                          }}
                        />
                        <button
                          id={`save-quick-price-${item.id}`}
                          onClick={() => handleSaveQuickPrice(item.id)}
                          className="p-1 rounded-lg bg-[#4F6D4F] text-white hover:bg-[#3E573E]"
                          title="Save price"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setQuickPriceEditId(null)}
                          className="p-1 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5">
                        <span className="font-serif text-lg font-bold text-[#1C1C1A]">
                          ₹{item.price}
                        </span>
                        <button
                          id={`edit-price-btn-${item.id}`}
                          onClick={() => {
                            setQuickPriceEditId(item.id);
                            setQuickPriceValue(String(item.price));
                          }}
                          className="px-2 py-0.5 rounded-lg bg-[#F5F2EA] text-[#5C5E4E] hover:bg-[#EBE8DE] text-[10px] font-bold border border-[#E5E1D5] cursor-pointer"
                          title="Click to quickly edit price"
                        >
                          Edit Price
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Availability Toggle Button + Edit/Delete Icons */}
                  <div className="flex items-center space-x-2">
                    {/* One-click Availability Switch */}
                    <button
                      id={`toggle-avail-btn-${item.id}`}
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs ${
                        isAvailable
                          ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                          : 'bg-rose-100/90 text-rose-900 border border-rose-300 hover:bg-rose-200'
                      }`}
                      title="Click to toggle availability on customer dining menu"
                    >
                      <span>{isAvailable ? '🟢 Available' : '🔴 Unavailable'}</span>
                    </button>

                    {/* Full Edit Modal trigger */}
                    <button
                      id={`edit-item-btn-${item.id}`}
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-xl border border-[#E5E1D5] text-[#5C5E4E] hover:bg-[#F5F2EA] transition-colors cursor-pointer"
                      title="Edit dish details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Item trigger */}
                    <button
                      id={`delete-item-btn-${item.id}`}
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E1D5] shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2 rounded-2xl bg-rose-50">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1C1C1A]">Remove Dish from Menu?</h3>
            </div>
            <p className="text-xs text-[#5C5E4E] leading-relaxed">
              Are you sure you want to remove <strong>"{itemToDelete.name}"</strong> (₹{itemToDelete.price}) from the kitchen menu catalog? This dish will no longer appear on guest dining room service.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C5E4E] hover:bg-[#F5F2EA] border border-[#E5E1D5]"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-food-btn"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Yes, Remove Dish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Food Item Full Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#E5E1D5] shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE8DE]">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-[#5C5E4E] text-[#D4AF37]">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1C1A]">
                    {editingItemId ? 'Edit Food Item Details' : 'Add New Food Item'}
                  </h3>
                  <p className="text-xs text-[#8A8E71]">
                    Chef Dashboard • Master Menu Catalog
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#8A8E71] hover:bg-[#F5F2EA] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Dish Name and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1">
                    Food Item Name *
                  </label>
                  <input
                    id="form-food-name"
                    type="text"
                    required
                    placeholder="e.g. Paneer Butter Masala"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-[#1C1C1A] focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1">
                    Category *
                  </label>
                  <select
                    id="form-food-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as FoodCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-[#1C1C1A] focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, Prep Time, Spice Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1">
                    Price in INR (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">₹</span>
                    <input
                      id="form-food-price"
                      type="number"
                      required
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-[#1C1C1A] font-bold focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1">
                    Preparation Time *
                  </label>
                  <input
                    id="form-food-prep-time"
                    type="text"
                    placeholder="e.g. 15 mins"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-[#1C1C1A] focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1">
                    Spice Level 🌶️
                  </label>
                  <select
                    id="form-food-spice-level"
                    value={formSpiceLevel}
                    onChange={(e) => setFormSpiceLevel(e.target.value as SpiceLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-[#1C1C1A] focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
                  >
                    {SPICE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL & Quick Presets */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1">
                  Food Image URL
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={formImage || IMAGE_PRESETS[0].url}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-[#E5E1D5] shrink-0"
                  />
                  <input
                    id="form-food-image-url"
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-[#1C1C1A] focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
                  />
                </div>

                {/* Quick image preset chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#8A8E71]">Quick Presets:</span>
                  {IMAGE_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormImage(preset.url)}
                      className="px-2 py-0.5 bg-[#F5F2EA] hover:bg-[#EBE8DE] text-[10px] text-[#5C5E4E] rounded-md border border-[#E5E1D5]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1">
                  Description & Culinary Notes
                </label>
                <textarea
                  id="form-food-desc"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the flavors, texture, authentic preparation method..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-[#1C1C1A] focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
                />
              </div>

              {/* Dietary and Toggles (Veg/NonVeg, Availability, Chef Special, Recommended) */}
              <div className="p-3.5 rounded-2xl bg-[#F9F8F3] border border-[#EBE8DE] grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="form-food-is-veg"
                    type="checkbox"
                    checked={formIsVeg}
                    onChange={(e) => setFormIsVeg(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4F6D4F] focus:ring-0"
                  />
                  <span className="font-semibold text-[#1C1C1A]">
                    {formIsVeg ? '🌱 Vegetarian' : '🍗 Non-Vegetarian'}
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="form-food-is-available"
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                  />
                  <span className="font-semibold text-[#1C1C1A]">
                    {formIsAvailable ? '🟢 Available' : '🔴 Unavailable'}
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="form-food-chef-special"
                    type="checkbox"
                    checked={formIsChefSpecial}
                    onChange={(e) => setFormIsChefSpecial(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-0"
                  />
                  <span className="font-semibold text-amber-900">🔥 Chef Special</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="form-food-recommended"
                    type="checkbox"
                    checked={formIsRecommended}
                    onChange={(e) => setFormIsRecommended(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-0"
                  />
                  <span className="font-semibold text-amber-900">⭐ Recommended</span>
                </label>
              </div>

              {/* Meal Times Availability (Breakfast, Lunch, Dinner, All Day) */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1.5">
                  Meal Slot Availability (Breakfast / Lunch / Dinner)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {MEAL_TIMES.map((time) => {
                    const active = formAvailableTimes.includes(time);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setFormAvailableTimes(formAvailableTimes.filter((t) => t !== time));
                          } else {
                            setFormAvailableTimes([...formAvailableTimes, time]);
                          }
                        }}
                        className={`px-3 py-1 rounded-xl font-medium border text-xs transition-all ${
                          active
                            ? 'bg-[#5C5E4E] text-white border-[#5C5E4E]'
                            : 'bg-white text-[#5C5E4E] border-[#E5E1D5] hover:bg-[#F5F2EA]'
                        }`}
                      >
                        {active ? '✓ ' : ''}{time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allergens selection */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1.5">
                  Allergens Warning 🥜
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {COMMON_ALLERGENS.map((allergen) => {
                    const selected = formAllergens.includes(allergen);
                    return (
                      <button
                        key={allergen}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setFormAllergens(formAllergens.filter((a) => a !== allergen));
                          } else {
                            setFormAllergens([...formAllergens, allergen]);
                          }
                        }}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] border transition-all ${
                          selected
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                            : 'bg-[#F9F8F3] text-[#5C5E4E] border-[#E5E1D5] hover:bg-[#EBE8DE]'
                        }`}
                      >
                        {selected ? '✓ ' : ''}{allergen}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ingredients input */}
              <div>
                <label className="block text-[11px] font-bold text-[#1C1C1A] mb-1">
                  Ingredients (comma separated) 🧾
                </label>
                <input
                  id="form-food-ingredients"
                  type="text"
                  placeholder="e.g. Fresh Paneer, Butter, Cashews, Tomatoes, Kasuri Methi, Cream"
                  value={formIngredientsInput}
                  onChange={(e) => setFormIngredientsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F8F3] border border-[#E5E1D5] text-[#1C1C1A] focus:outline-hidden focus:ring-1 focus:ring-[#5C5E4E]"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-[#EBE8DE] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#5C5E4E] hover:bg-[#F5F2EA] border border-[#E5E1D5]"
                >
                  Cancel
                </button>
                <button
                  id="save-food-item-submit-btn"
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#4F6D4F] hover:bg-[#3E573E] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-2"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                      <span>{editingItemId ? 'Save Changes' : 'Create Food Item'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
