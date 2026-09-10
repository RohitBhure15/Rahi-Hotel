import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Heart,
  Send,
  Lightbulb,
  ThumbsUp,
  Award,
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { FeedbackCategory, SuggestionCategory } from '../../types';

export const FeedbackSection: React.FC = () => {
  const {
    feedbackList,
    feedbackAnalytics,
    submitFeedback,
    suggestions,
    submitSuggestion,
    activeGuestBooking,
    activeGuestRoom,
  } = useHotel();

  const [activeSubTab, setActiveSubTab] = useState<'feedback' | 'improve' | 'browse'>('feedback');

  // Feedback Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [guestName, setGuestName] = useState(activeGuestBooking?.guestName || 'Ananya Sharma');
  const [guestPhone, setGuestPhone] = useState(activeGuestBooking?.guestPhone || '+91 98200 44112');
  const [roomNumber, setRoomNumber] = useState(activeGuestRoom || '204');
  const [category, setCategory] = useState<FeedbackCategory>('Overall Experience');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [suggestionText, setSuggestionText] = useState('');
  const [bookingRef, setBookingRef] = useState(activeGuestBooking?.id || '#HTL10234');
  const [feedbackSuccessId, setFeedbackSuccessId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggestion Form State
  const [sugCategory, setSugCategory] = useState<SuggestionCategory>('Service');
  const [sugTitle, setSugTitle] = useState('');
  const [sugDetails, setSugDetails] = useState('');
  const [sugSuccessId, setSugSuccessId] = useState<string | null>(null);
  const [sugSubmitting, setSugSubmitting] = useState(false);

  // Filter for browsing reviews
  const [browseFilter, setBrowseFilter] = useState<'all' | '5star' | 'suggestions'>('all');

  const ratingLabels: { [key: number]: string } = {
    1: 'Needs Urgent Attention (1 Star)',
    2: 'Below Expectations (2 Stars)',
    3: 'Satisfactory / Average (3 Stars)',
    4: 'Very Good Experience (4 Stars)',
    5: 'Exceptional Luxury Hospitality (5 Stars)',
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await submitFeedback({
        hotel_id: 'HOTEL001',
        customer_name: guestName,
        customer_phone: guestPhone,
        room_number: roomNumber,
        booking_id: bookingRef || undefined,
        category,
        rating,
        title,
        message,
        suggestion: suggestionText.trim() || undefined,
      });

      setFeedbackSuccessId(created.id);
      setTitle('');
      setMessage('');
      setSuggestionText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugTitle.trim() || !sugDetails.trim()) return;

    setSugSubmitting(true);
    try {
      const created = await submitSuggestion({
        hotel_id: 'HOTEL001',
        customer_name: guestName,
        customer_phone: guestPhone,
        category: sugCategory,
        title: sugTitle,
        suggestion: sugDetails,
      });

      setSugSuccessId(created.id);
      setSugTitle('');
      setSugDetails('');
    } finally {
      setSugSubmitting(false);
    }
  };

  const filteredFeedbacks = feedbackList.filter((f) => {
    if (browseFilter === '5star') return f.rating === 5;
    if (browseFilter === 'suggestions') return Boolean(f.suggestion && f.suggestion.trim().length > 0);
    return true;
  });

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#5C5E4E]/10 border border-[#5C5E4E]/20 text-[#5C5E4E] text-xs font-semibold uppercase tracking-wider mb-3">
          <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Guest Voice & Continuous Hospitality Improvement</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1C1A]">
          Your Experience Shapes Our Sanctuary
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#5C5E4E] leading-relaxed">
          We pride ourselves on attentive, bespoke resort hospitality. Share your feedback, review your stay, or submit creative ideas to help us enhance every moment of your retreat.
        </p>

        {/* Tab switchers */}
        <div className="inline-flex items-center bg-[#F5F2EA] p-1.5 rounded-2xl border border-[#E5E1D5] mt-6 text-xs font-medium">
          <button
            id="tab-feedback-form-btn"
            onClick={() => setActiveSubTab('feedback')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'feedback'
                ? 'bg-[#5C5E4E] text-white shadow-xs font-semibold'
                : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Submit Feedback</span>
          </button>

          <button
            id="tab-improve-ideas-btn"
            onClick={() => setActiveSubTab('improve')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'improve'
                ? 'bg-[#5C5E4E] text-white shadow-xs font-semibold'
                : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Help Us Improve</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
              Ideas
            </span>
          </button>

          <button
            id="tab-guest-voices-btn"
            onClick={() => setActiveSubTab('browse')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'browse'
                ? 'bg-[#5C5E4E] text-white shadow-xs font-semibold'
                : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Guest Voices ({feedbackList.length})</span>
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs text-center">
          <div className="flex items-center justify-center space-x-1 text-[#D4AF37] mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <div className="text-2xl font-serif font-bold text-[#1C1C1A]">
            {feedbackAnalytics.averageRating} / 5.0
          </div>
          <div className="text-xs text-[#8A8E71] font-medium mt-0.5">
            Guest Satisfaction Score
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs text-center">
          <div className="text-2xl font-serif font-bold text-[#4F6D4F]">
            {feedbackAnalytics.total} Reviews
          </div>
          <div className="text-xs text-[#8A8E71] font-medium mt-0.5">
            Verified Guest Feedbacks
          </div>
          <div className="text-[10px] text-[#4F6D4F] font-semibold mt-1">
            {feedbackAnalytics.positiveCount} Positive (98%)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs text-center">
          <div className="text-2xl font-serif font-bold text-[#D4AF37]">
            {suggestions.length} Ideas
          </div>
          <div className="text-xs text-[#8A8E71] font-medium mt-0.5">
            Community Suggestions
          </div>
          <div className="text-[10px] text-[#5C5E4E] font-semibold mt-1">
            {suggestions.filter((s) => s.status === 'Implemented').length} Already Implemented
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs text-center">
          <div className="flex items-center justify-center space-x-1 text-[#5C5E4E] mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#1C1C1A]">100%</div>
          <div className="text-xs text-[#8A8E71] font-medium mt-0.5">
            Management Review Rate
          </div>
        </div>
      </div>

      {/* SubTab 1: Customer Feedback Submission */}
      {activeSubTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E1D5] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D5] mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1C1A]">
                  Guest Feedback & Rating
                </h2>
                <p className="text-xs text-[#8A8E71] mt-0.5">
                  Rate your culinary experience, accommodations, service speed, or entire stay.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-[#F5F2EA] text-[#5C5E4E]">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            {feedbackSuccessId ? (
              <div className="bg-[#EDF5ED] border border-[#C5DEC5] rounded-2xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#4F6D4F] mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-[#2A472A]">
                  Thank You for Your Valuable Feedback!
                </h3>
                <p className="text-xs text-[#4F6D4F] mt-1 max-w-md mx-auto">
                  Your review has been securely saved and dispatched to General Manager headquarters under Ticket ID:
                </p>
                <div className="inline-block mt-3 px-4 py-1.5 bg-white border border-[#C5DEC5] rounded-xl font-mono text-sm font-bold text-[#2A472A]">
                  {feedbackSuccessId}
                </div>
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setFeedbackSuccessId(null)}
                    className="px-4 py-2 rounded-xl bg-[#4F6D4F] text-white text-xs font-semibold hover:bg-[#3D553D] transition-colors"
                  >
                    Submit Another Feedback
                  </button>
                  <button
                    onClick={() => setActiveSubTab('browse')}
                    className="px-4 py-2 rounded-xl bg-white border border-[#C5DEC5] text-[#2A472A] text-xs font-semibold hover:bg-[#EDF5ED] transition-colors"
                  >
                    View Community Feedbacks
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                {/* Interactive Star Rating */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2">
                    Overall Experience Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        id={`star-rating-btn-${star}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1.5 focus:outline-hidden transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            (hoverRating || rating) >= star
                              ? 'text-[#D4AF37] fill-[#D4AF37]'
                              : 'text-[#E5E1D5]'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-xs font-semibold text-[#5C5E4E]">
                      {ratingLabels[hoverRating || rating]}
                    </span>
                  </div>
                </div>

                {/* Feedback Category */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-2">
                    Category of Feedback *
                  </label>
                  <select
                    id="feedback-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D5] bg-white text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                  >
                    <option value="Overall Experience">Overall Experience & Stay</option>
                    <option value="Room">Room Comfort, Bedding & Amenities</option>
                    <option value="Food">Restaurant & In-Room Dining</option>
                    <option value="Staff">Staff Courtesy & Hospitality</option>
                    <option value="Cleanliness">Cleanliness & Hygiene</option>
                    <option value="Service">Front Desk & Concierge Service</option>
                    <option value="Activities">Games, Sports & Swimming Pool</option>
                    <option value="Website">Website & Booking Experience</option>
                    <option value="Other">Other Observation</option>
                  </select>
                </div>

                {/* Guest Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5E4E] mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      id="feedback-guest-name-input"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      placeholder="e.g. Ananya Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5E4E] mb-1">
                      Room / Villa Number
                    </label>
                    <input
                      type="text"
                      id="feedback-room-number-input"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g. 204 or Villa 1"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5E4E] mb-1">
                      Booking Ref (Optional)
                    </label>
                    <input
                      type="text"
                      id="feedback-booking-ref-input"
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value)}
                      placeholder="#HTL10234"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-1.5">
                    Review Headline / Short Summary *
                  </label>
                  <input
                    type="text"
                    id="feedback-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Unforgettable Ocean Sunset & Heartfelt Service"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-1.5">
                    Detailed Experience *
                  </label>
                  <textarea
                    id="feedback-message-input"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Tell us what you loved, what made your stay memorable, or where we can sharpen our service..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                  />
                </div>

                {/* Optional Improvement Suggestion */}
                <div className="bg-[#FAF8F2] p-4 rounded-2xl border border-[#E5E1D5]">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#5C5E4E] mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Have an idea for how we can improve? (Optional)</span>
                  </div>
                  <p className="text-[11px] text-[#8A8E71] mb-2">
                    Suggestions automatically populate our management innovation roadmap for review.
                  </p>
                  <textarea
                    id="feedback-suggestion-input"
                    rows={2}
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder="e.g. Add complimentary yoga mats in seaside villas, or include vegan dessert options..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] bg-white text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-feedback-btn"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#5C5E4E] hover:bg-[#47493D] text-white font-medium text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isSubmitting ? 'Recording Feedback...' : 'Submit Feedback to Management'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Rating Distribution & Guest Promise */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <h3 className="font-serif text-lg font-bold text-[#1C1C1A] mb-4">
                Hospitality Rating Breakdown
              </h3>
              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = feedbackAnalytics.ratingDistribution[star as keyof typeof feedbackAnalytics.ratingDistribution] || 0;
                  const pct = feedbackAnalytics.total > 0 ? Math.round((count / feedbackAnalytics.total) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center space-x-3 text-xs">
                      <span className="w-12 font-medium text-[#1C1C1A] flex items-center">
                        {star} <Star className="w-3 h-3 ml-1 fill-[#D4AF37] text-[#D4AF37]" />
                      </span>
                      <div className="flex-1 h-2 bg-[#F5F2EA] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-[#8A8E71] font-mono text-[11px]">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-[#E5E1D5] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#1C1C1A]">Average Rating</div>
                  <div className="text-[11px] text-[#8A8E71]">Based on verified guest experiences</div>
                </div>
                <div className="text-2xl font-serif font-bold text-[#D4AF37]">
                  {feedbackAnalytics.averageRating}★
                </div>
              </div>
            </div>

            {/* Resort Feedback Policy */}
            <div className="bg-[#F5F2EA] p-6 rounded-3xl border border-[#E5E1D5]">
              <div className="flex items-center space-x-2.5 text-[#5C5E4E] mb-2 font-serif font-bold text-base">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                <span>The Hotel Rahi Guest Promise</span>
              </div>
              <ul className="space-y-2 text-xs text-[#5C5E4E] leading-relaxed">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4F6D4F] shrink-0 mt-0.5" />
                  <span>Every feedback ticket is personally reviewed by General Manager & Department Leads within 4 hours.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4F6D4F] shrink-0 mt-0.5" />
                  <span>If your rating is below 3 stars, our duty guest relations manager will reach out directly to resolve any concerns.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4F6D4F] shrink-0 mt-0.5" />
                  <span>Your suggestions directly fund our annual guest amenities upgrades.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Help Us Improve Idea Hub */}
      {activeSubTab === 'improve' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E1D5] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D5] mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1C1A]">
                  Help Us Improve Our Resort
                </h2>
                <p className="text-xs text-[#8A8E71] mt-0.5">
                  Propose a new guest activity, dining dish, eco initiative, or in-room convenience.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                <Lightbulb className="w-5 h-5" />
              </div>
            </div>

            {sugSuccessId ? (
              <div className="bg-[#F5F8F5] border border-[#C5DEC5] rounded-2xl p-6 text-center">
                <Sparkles className="w-12 h-12 text-[#4F6D4F] mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-[#2A472A]">
                  Suggestion Logged Successfully!
                </h3>
                <p className="text-xs text-[#4F6D4F] mt-1 max-w-md mx-auto">
                  Your idea has been assigned Ref ID <strong>{sugSuccessId}</strong> and queued for evaluation in our weekly Operations & Innovation committee.
                </p>
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setSugSuccessId(null)}
                    className="px-4 py-2 rounded-xl bg-[#4F6D4F] text-white text-xs font-semibold hover:bg-[#3D553D] transition-colors"
                  >
                    Propose Another Idea
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-1.5">
                    Improvement Category *
                  </label>
                  <select
                    id="sug-category-select"
                    value={sugCategory}
                    onChange={(e) => setSugCategory(e.target.value as SuggestionCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D5] bg-white text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                  >
                    <option value="Room">Room & Villa Comfort</option>
                    <option value="Food">Culinary & Dining Experience</option>
                    <option value="Service">Customer Service & Concierge</option>
                    <option value="Activities">Games, Sports & Recreation</option>
                    <option value="Facilities">Resort Grounds & Facilities</option>
                    <option value="Technology">Wi-Fi, App & Technology</option>
                    <option value="Other">Eco & General Innovations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-1.5">
                    Suggestion Headline *
                  </label>
                  <input
                    type="text"
                    id="sug-title-input"
                    value={sugTitle}
                    onChange={(e) => setSugTitle(e.target.value)}
                    required
                    placeholder="e.g. Sunset Kayaking Tours or Herbal Pillow Menu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1A] uppercase tracking-wider mb-1.5">
                    Explain Your Idea & How It Elevates Guest Stays *
                  </label>
                  <textarea
                    id="sug-details-input"
                    rows={4}
                    value={sugDetails}
                    onChange={(e) => setSugDetails(e.target.value)}
                    required
                    placeholder="Describe how this amenity or process will create a richer, more comfortable stay for guests..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A] focus:outline-hidden focus:border-[#5C5E4E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5E4E] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C5E4E] mb-1">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E1D5] text-xs text-[#1C1C1A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-suggestion-btn"
                  disabled={sugSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#5C5E4E] hover:bg-[#47493D] text-white font-medium text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <Lightbulb className="w-4 h-4 text-[#D4AF37]" />
                  <span>{sugSubmitting ? 'Submitting Idea...' : 'Submit Idea to Innovation Board'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Live Suggestion Board & Status Tracking */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1C1C1A]">
                    Live Suggestion Progress Tracker
                  </h3>
                  <p className="text-xs text-[#8A8E71]">
                    Real ideas submitted by guests and their implementation lifecycle.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#5C5E4E]/10 text-[#5C5E4E] font-bold">
                  {suggestions.length} Tracked
                </span>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {suggestions.map((sug) => {
                  const statusColors: { [key: string]: string } = {
                    New: 'bg-blue-50 text-blue-700 border-blue-200',
                    Reviewing: 'bg-amber-50 text-amber-700 border-amber-200',
                    Planned: 'bg-purple-50 text-purple-700 border-purple-200',
                    Implemented: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Rejected: 'bg-stone-100 text-stone-600 border-stone-200',
                  };
                  return (
                    <div
                      key={sug.id}
                      className="p-4 rounded-2xl border border-[#E5E1D5] bg-[#FAF8F2] space-y-2 hover:border-[#5C5E4E] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-[#8A8E71]">{sug.id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#E5E1D5] text-[#5C5E4E] font-medium">
                            {sug.category}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                            statusColors[sug.status] || 'bg-stone-50 text-stone-600'
                          }`}
                        >
                          {sug.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#1C1C1A]">{sug.title}</h4>
                      <p className="text-[11px] text-[#5C5E4E] leading-relaxed">
                        "{sug.suggestion}"
                      </p>

                      {sug.adminNotes && (
                        <div className="mt-2 p-2 rounded-xl bg-white border border-[#E5E1D5] text-[10px] text-[#2A472A]">
                          <strong>Management Update:</strong> {sug.adminNotes}
                        </div>
                      )}

                      <div className="text-[10px] text-[#8A8E71] flex items-center justify-between pt-1 border-t border-[#E5E1D5]/60">
                        <span>Submitted by {sug.customer_name}</span>
                        <span>{sug.created_at ? new Date(sug.created_at).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Community Voices & Reviews */}
      {activeSubTab === 'browse' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E1D5] shadow-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#5C5E4E]" />
              <span className="text-xs font-bold text-[#1C1C1A]">Filter Voices:</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              {[
                { key: 'all', label: `All Reviews (${feedbackList.length})` },
                { key: '5star', label: `5-Star Only (${feedbackList.filter((f) => f.rating === 5).length})` },
                { key: 'suggestions', label: `Reviews with Suggestions (${feedbackList.filter((f) => f.suggestion).length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setBrowseFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    browseFilter === tab.key
                      ? 'bg-[#5C5E4E] text-white shadow-2xs font-semibold'
                      : 'bg-[#F5F2EA] text-[#5C5E4E] hover:text-[#1C1C1A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeedbacks.map((f) => (
              <div
                key={f.id}
                className="bg-white p-6 rounded-3xl border border-[#E5E1D5] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1 text-[#D4AF37]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < f.rating ? 'fill-current text-[#D4AF37]' : 'text-[#E5E1D5]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F2EA] text-[#5C5E4E] font-medium border border-[#E5E1D5]">
                      {f.category}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#1C1C1A] mb-2 line-clamp-2">
                    {f.title}
                  </h3>

                  <p className="text-xs text-[#5C5E4E] leading-relaxed line-clamp-4">
                    "{f.message}"
                  </p>

                  {f.suggestion && (
                    <div className="mt-3 p-3 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D5] text-[11px] text-[#5C5E4E]">
                      <div className="flex items-center space-x-1.5 text-[#D4AF37] font-bold text-[10px] uppercase tracking-wider mb-1">
                        <Lightbulb className="w-3 h-3" />
                        <span>Guest Idea:</span>
                      </div>
                      "{f.suggestion}"
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E1D5] flex items-center justify-between text-[11px] text-[#8A8E71]">
                  <div>
                    <span className="font-bold text-[#1C1C1A]">{f.customer_name}</span>
                    {f.room_number && <span className="text-[10px] ml-1">({f.room_number})</span>}
                  </div>
                  <span>{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
