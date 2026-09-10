import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle, ThumbsUp, Send, User } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export const ReviewsSection: React.FC = () => {
  const { reviews, submitReview, activeGuestBooking, activeGuestRoom } = useHotel();

  const [guestName, setGuestName] = useState(activeGuestBooking?.guestName || 'Rohit Bhure');
  const [roomType, setRoomType] = useState(activeGuestBooking?.roomType || 'Deluxe Room');
  const [overallRating, setOverallRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [food, setFood] = useState(5);
  const [staff, setStaff] = useState(5);
  const [location, setLocation] = useState(5);
  const [comment, setComment] = useState('Outstanding beachfront villa with pristine pool and exemplary hospitality.');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview({
      guestName,
      stayDate: 'Recent Stay',
      roomType,
      overallRating,
      roomRating: overallRating,
      foodRating: food,
      cleanlinessRating: cleanliness,
      staffRating: staff,
      facilitiesRating: location,
      categories: {
        cleanliness,
        food,
        staff,
        location,
      },
      comment,
    });
    setSubmitted(true);
  };

  const renderInteractiveStars = (
    value: number,
    onChange: (val: number) => void
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            className="p-1 text-[#D4AF37] hover:scale-110 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#E5E1D5]'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A8E71]">
          Guest Testimonials
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1C1A] mt-1">
          Experiences Shared by Our Guests
        </h2>
        <p className="text-sm text-[#8A8E71] mt-2">
          Read genuine reviews from travelers around the world or submit your feedback on your stay.
        </p>
      </div>

      {/* Aggregate Rating Scorecard */}
      <div className="bg-[#F9F8F3] rounded-3xl border border-[#E5E1D5] p-6 sm:p-8 mb-12 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          <div className="md:col-span-2 text-center md:text-left border-b md:border-b-0 md:border-r border-[#E5E1D5] pb-6 md:pb-0 md:pr-8">
            <span className="font-serif text-5xl sm:text-6xl font-bold text-[#1C1C1A]">4.9</span>
            <span className="text-lg text-[#8A8E71] font-light"> / 5.0</span>
            <div className="flex items-center justify-center md:justify-start space-x-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            <p className="text-xs text-[#8A8E71]">Based on 1,280+ verified guest reviews</p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-[#1C1C1A] mb-1">
                <span>Cleanliness</span>
                <span className="text-[#5C5E4E]">4.9 / 5</span>
              </div>
              <div className="w-full bg-[#E5E1D5] h-2 rounded-full overflow-hidden">
                <div className="bg-[#5C5E4E] h-full rounded-full" style={{ width: '98%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#1C1C1A] mb-1">
                <span>Food & Dining</span>
                <span className="text-[#5C5E4E]">4.8 / 5</span>
              </div>
              <div className="w-full bg-[#E5E1D5] h-2 rounded-full overflow-hidden">
                <div className="bg-[#5C5E4E] h-full rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#1C1C1A] mb-1">
                <span>Staff & Hospitality</span>
                <span className="text-[#5C5E4E]">5.0 / 5</span>
              </div>
              <div className="w-full bg-[#E5E1D5] h-2 rounded-full overflow-hidden">
                <div className="bg-[#5C5E4E] h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#1C1C1A] mb-1">
                <span>Location & Vibe</span>
                <span className="text-[#5C5E4E]">4.9 / 5</span>
              </div>
              <div className="w-full bg-[#E5E1D5] h-2 rounded-full overflow-hidden">
                <div className="bg-[#5C5E4E] h-full rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid + Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Existing Reviews */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#1C1C1A] mb-4">
            Recent Verified Reviews
          </h3>

          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-[#1C1C1A] text-sm">{rev.guestName}</h4>
                  <p className="text-[11px] text-[#8A8E71]">
                    Stayed in {rev.roomType} • {rev.createdAt}
                  </p>
                </div>

                <div className="flex items-center space-x-1 bg-[#F9F8F3] px-2.5 py-1 rounded-full border border-[#E5E1D5]">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-xs font-bold text-[#5C5E4E]">{rev.overallRating}.0</span>
                </div>
              </div>

              <p className="text-xs text-[#33332D] leading-relaxed italic">
                "{rev.comment}"
              </p>

              <div className="flex items-center space-x-4 text-[11px] text-[#8A8E71] pt-1">
                <span>Cleanliness: {rev.categories?.cleanliness ?? rev.cleanlinessRating ?? 5}/5</span>
                <span>Food: {rev.categories?.food ?? rev.foodRating ?? 5}/5</span>
                <span>Staff: {rev.categories?.staff ?? rev.staffRating ?? 5}/5</span>
              </div>

              {rev.managerReply && (
                <div className="mt-3 p-3 bg-[#F9F8F3] border-l-2 border-[#5C5E4E] rounded-r-2xl text-xs text-[#33332D]">
                  <strong className="text-[#5C5E4E] block text-[10px] uppercase tracking-[0.2em] mb-0.5">
                    Resort General Manager Reply:
                  </strong>
                  <p className="text-[#5C5E4E]">{rev.managerReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Col: Submit Review Form */}
        <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs sticky top-24">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#EBE8DE] mb-4">
            <div className="p-2.5 rounded-2xl bg-[#F5F2EA] text-[#5C5E4E]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#1C1C1A]">Write a Review</h4>
              <p className="text-[11px] text-[#8A8E71]">Share your feedback with us</p>
            </div>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-[#F2F4F2] text-[#4F6D4F] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 stroke-[3]" />
              </div>
              <h5 className="font-serif font-bold text-[#1C1C1A]">Review Submitted!</h5>
              <p className="text-xs text-[#5C5E4E]">
                Thank you for your generous feedback. Your review will help future guests.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 border border-[#E5E1D5] rounded-xl text-xs text-[#5C5E4E] hover:bg-[#F9F8F3]"
              >
                Write Another Review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#1C1C1A] font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl bg-white text-[#33332D]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1C1C1A] font-semibold mb-1">Room Category</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl bg-[#F9F8F3] text-[#33332D]"
                >
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Premium Room">Premium Room</option>
                  <option value="Grand Suite">Grand Suite</option>
                  <option value="Family Room">Family Room</option>
                  <option value="Plunge Pool Villa">Plunge Pool Villa</option>
                  <option value="Presidential Suite">Presidential Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1C1C1A] font-semibold mb-1">Overall Rating</label>
                {renderInteractiveStars(overallRating, setOverallRating)}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EBE8DE]">
                <div>
                  <label className="block text-[#8A8E71] mb-0.5 text-[11px]">Cleanliness</label>
                  {renderInteractiveStars(cleanliness, setCleanliness)}
                </div>
                <div>
                  <label className="block text-[#8A8E71] mb-0.5 text-[11px]">Food & Dining</label>
                  {renderInteractiveStars(food, setFood)}
                </div>
                <div>
                  <label className="block text-[#8A8E71] mb-0.5 text-[11px]">Staff Hospitality</label>
                  {renderInteractiveStars(staff, setStaff)}
                </div>
                <div>
                  <label className="block text-[#8A8E71] mb-0.5 text-[11px]">Resort Location</label>
                  {renderInteractiveStars(location, setLocation)}
                </div>
              </div>

              <div>
                <label className="block text-[#1C1C1A] font-semibold mb-1">Your Review</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl bg-white text-[#33332D]"
                  required
                />
              </div>

              <button
                type="submit"
                id="submit-review-btn"
                className="w-full py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white font-medium rounded-xl shadow-2xs transition-colors"
              >
                Publish Review
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
