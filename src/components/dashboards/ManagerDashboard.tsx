import React, { useState } from 'react';
import {
  SlidersHorizontal,
  TrendingUp,
  Users,
  AlertTriangle,
  Package,
  CheckCircle2,
  Clock,
  Building,
  DollarSign,
  Bed,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Send,
  Star,
  Heart,
  Lightbulb,
  MessageSquare,
  Utensils,
  Filter,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { ComplaintStatus, StaffMember, SuggestionStatus } from '../../types';
import { StaffManagement } from '../staff/StaffManagement';

export const ManagerDashboard: React.FC = () => {
  const {
    rooms,
    bookings,
    complaints,
    updateComplaintStatus,
    inventory,
    updateInventoryQuantity,
    staff,
    foodOrders,
    employees,
    feedbackList,
    suggestions,
    updateSuggestionStatus,
    complaintStats,
    foodOrderStats,
    feedbackAnalytics,
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'feedback' | 'inventory' | 'staff'>('overview');
  const [complaintFilter, setComplaintFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [resolutionText, setResolutionText] = useState<{ [id: string]: string }>({});
  const [assigneeMap, setAssigneeMap] = useState<{ [id: string]: string }>({});
  const [statusSelectMap, setStatusSelectMap] = useState<{ [id: string]: ComplaintStatus }>({});
  const [suggestionResponseText, setSuggestionResponseText] = useState<{ [id: string]: string }>({});

  // Operational metrics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  const checkInsCount = bookings.filter((b) => b.status === 'Checked In').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const openComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed');
  const lowStockItems = inventory.filter((item) => item.quantity <= item.minThreshold);

  const handleUpdateComplaint = (id: string, newStatus: ComplaintStatus) => {
    const current = complaints.find((c) => c.id === id);
    const note = resolutionText[id] || current?.resolutionNote || (newStatus === 'Resolved' ? 'Resolved by duty manager' : '');
    const staffName = assigneeMap[id] || current?.assignedTo || 'Duty Manager';
    updateComplaintStatus(id, newStatus, staffName, note);
  };

  const handleUpdateSuggestion = (id: string, newStatus: SuggestionStatus) => {
    const note = suggestionResponseText[id] || '';
    updateSuggestionStatus(id, newStatus, note);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D5] mb-8">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-[#5C5E4E] text-white shadow-2xs">
              <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1A]">
                General Manager Operational Headquarters
              </h2>
              <p className="text-xs text-[#8A8E71] mt-0.5">
                Resort KPIs, guest resolution tickets, supply chain stock, and department oversight.
              </p>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="bg-[#F5F2EA] p-1.5 rounded-2xl border border-[#E5E1D5] flex flex-wrap items-center gap-1 text-xs">
          {[
            { key: 'overview', label: 'Operations KPI', count: null },
            { key: 'complaints', label: 'Complaints Desk', count: openComplaints.length },
            { key: 'feedback', label: 'Feedback & Ideas', count: suggestions.filter((s) => s.status === 'Pending').length },
            { key: 'inventory', label: 'Stock & Inventory', count: lowStockItems.length },
            { key: 'staff', label: 'Staff & Roles', count: employees?.length || staff.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === tab.key ? 'bg-[#5C5E4E] text-white shadow-2xs' : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 rounded-full font-bold ${
                    (tab.key === 'complaints' || tab.key === 'feedback') && tab.count > 0
                      ? 'bg-[#FBEAEA] text-[#A64D4D]'
                      : 'bg-[#E5E1D5] text-[#5C5E4E]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Operations Overview KPIs */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-[0.2em]">
                Occupancy Rate
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#1C1C1A]">{occupancyRate}%</span>
                <span className="text-xs text-[#4F6D4F] font-semibold flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  High Season
                </span>
              </div>
              <p className="text-[11px] text-[#8A8E71] mt-2">
                {occupiedRooms} of {totalRooms} rooms currently occupied
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-[0.2em]">
                Gross Bookings Revenue
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#5C5E4E]">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-[#8A8E71] mt-2">
                Room tariff + In-room dining + Wellness spa
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-[0.2em]">
                Active In-House Guests
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#1C1C1A]">{checkInsCount * 2}</span>
                <span className="text-xs text-[#8A8E71]">Across {checkInsCount} rooms</span>
              </div>
              <p className="text-[11px] text-[#8A8E71] mt-2">
                {foodOrders.length} active F&B orders processed today
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-[0.2em]">
                Pending Action Items
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#A64D4D]">
                  {openComplaints.length + lowStockItems.length}
                </span>
                <span className="text-xs text-[#A64D4D] font-semibold">Requires Review</span>
              </div>
              <p className="text-[11px] text-[#8A8E71] mt-2">
                {openComplaints.length} tickets, {lowStockItems.length} low inventory supplies
              </p>
            </div>
          </div>

          {/* Quick Action Tables: Complaints Priority & Low Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent Complaints */}
            <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#EBE8DE]">
                <h3 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-[#A64D4D]" />
                  <span>Open Guest Complaints ({openComplaints.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('complaints')}
                  className="text-xs text-[#5C5E4E] font-semibold hover:underline"
                >
                  Manage All Tickets →
                </button>
              </div>

              {openComplaints.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#4F6D4F]">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-[#4F6D4F]" />
                  No open complaints! Guests are completely satisfied.
                </div>
              ) : (
                <div className="space-y-3">
                  {openComplaints.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-4 rounded-2xl bg-[#F9F8F3] border border-[#E5E1D5] text-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-[#1C1C1A]">Room {comp.roomNumber}</strong>
                          <span className="text-[#8A8E71] ml-2">({comp.guestName})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-[#FBEAEA] text-[#A64D4D]">
                          {comp.priority}
                        </span>
                      </div>
                      <p className="text-[#5C5E4E] text-[11px]">{comp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Critical Inventory Restock Alerts */}
            <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#EBE8DE]">
                <h3 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
                  <Package className="w-4 h-4 text-[#D4AF37]" />
                  <span>Low Inventory Alerts ({lowStockItems.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs text-[#5C5E4E] font-semibold hover:underline"
                >
                  View Inventory →
                </button>
              </div>

              <div className="space-y-2.5">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#F9F8F3] border border-[#E5E1D5] text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[#1C1C1A]">{item.name}</p>
                      <p className="text-[10px] text-[#8A8E71]">Department: {item.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#A64D4D] font-bold">
                        {item.quantity} {item.unit} remaining
                      </span>
                      <span className="block text-[10px] text-[#8A8E71]">
                        Min threshold: {item.minThreshold} {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Full Complaints Management with Complete Lifecycle Controls */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl border border-[#E5E1D5] overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#EBE8DE] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-[#1C1C1A] text-lg flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-[#A64D4D]" />
                  <span>Guest Complaints Resolution & Dispatch Console</span>
                </h3>
                <p className="text-xs text-[#8A8E71]">
                  Assign responsible staff, transition tickets across lifecycle stages, view attached photos, and log official resolution notes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#8A8E71] font-semibold">Filter Status:</span>
                <select
                  value={complaintFilter}
                  onChange={(e) => setComplaintFilter(e.target.value)}
                  className="px-3 py-1.5 border border-[#E5E1D5] rounded-xl text-xs bg-[#F9F8F3] text-[#33332D] font-medium"
                >
                  <option value="all">All Statuses ({complaints.length})</option>
                  <option value="Pending">Pending ({complaintStats.pending})</option>
                  <option value="Assigned">Assigned ({complaintStats.assigned})</option>
                  <option value="In Progress">In Progress ({complaintStats.in_progress})</option>
                  <option value="Resolved">Resolved ({complaintStats.resolved})</option>
                  <option value="Closed">Closed ({complaintStats.closed})</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 border border-[#E5E1D5] rounded-xl text-xs bg-[#F9F8F3] text-[#33332D] font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="Room">Room</option>
                  <option value="Food">Food</option>
                  <option value="Staff">Staff</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="AC / Cooling">AC / Cooling</option>
                  <option value="Plumbing / Hot Water">Plumbing</option>
                  <option value="Wi-Fi / Internet">Wi-Fi</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Quick Lifecycle Count Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#EBE8DE]">
              <div className="bg-[#FCF3F3] p-2 rounded-xl text-center border border-[#F5D5D5]">
                <span className="text-[10px] text-[#A64D4D] uppercase font-bold block">Pending</span>
                <strong className="text-sm font-bold text-[#A64D4D]">{complaintStats.pending}</strong>
              </div>
              <div className="bg-[#FDF6E2] p-2 rounded-xl text-center border border-[#F1DFAB]">
                <span className="text-[10px] text-[#8A6D1B] uppercase font-bold block">Assigned</span>
                <strong className="text-sm font-bold text-[#8A6D1B]">{complaintStats.assigned}</strong>
              </div>
              <div className="bg-[#F5F2EA] p-2 rounded-xl text-center border border-[#E5E1D5]">
                <span className="text-[10px] text-[#5C5E4E] uppercase font-bold block">In Progress</span>
                <strong className="text-sm font-bold text-[#5C5E4E]">{complaintStats.in_progress}</strong>
              </div>
              <div className="bg-[#F2F4F2] p-2 rounded-xl text-center border border-[#D5E1D5]">
                <span className="text-[10px] text-[#4F6D4F] uppercase font-bold block">Resolved</span>
                <strong className="text-sm font-bold text-[#4F6D4F]">{complaintStats.resolved}</strong>
              </div>
              <div className="bg-[#FAF8F2] p-2 rounded-xl text-center border border-[#E5E1D5]">
                <span className="text-[10px] text-[#8A8E71] uppercase font-bold block">Closed</span>
                <strong className="text-sm font-bold text-[#8A8E71]">{complaintStats.closed}</strong>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#EBE8DE]">
            {complaints
              .filter((c) => (complaintFilter === 'all' ? true : c.status === complaintFilter))
              .filter((c) => (categoryFilter === 'all' ? true : c.category === categoryFilter))
              .map((comp) => {
                const selectedStatus = statusSelectMap[comp.id] || comp.status;

                return (
                  <div key={comp.id} className="p-5 text-xs space-y-3 hover:bg-[#FAF8F2]/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono font-bold text-[#5C5E4E] bg-[#F5F2EA] px-2 py-0.5 rounded-md">
                          {comp.id}
                        </span>
                        <span className="font-semibold text-[#1C1C1A]">Room {comp.roomNumber}</span>
                        <span className="text-[#8A8E71]">({comp.guestName})</span>
                        <span className="text-[#8A8E71]">•</span>
                        <span className="font-medium text-[#5C5E4E] px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#E5E1D5]">
                          {comp.category}
                        </span>
                        {comp.title && (
                          <span className="font-bold text-[#1C1C1A]">"{comp.title}"</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                            comp.priority === 'High'
                              ? 'bg-[#FBEAEA] text-[#A64D4D]'
                              : comp.priority === 'Medium'
                              ? 'bg-[#FDF6E2] text-[#8A6D1B]'
                              : 'bg-[#F5F2EA] text-[#5C5E4E]'
                          }`}
                        >
                          {comp.priority} Priority
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                            comp.status === 'Resolved' || comp.status === 'Closed'
                              ? 'bg-[#F2F4F2] text-[#4F6D4F] border border-[#4F6D4F]/20'
                              : comp.status === 'In Progress' || comp.status === 'Assigned'
                              ? 'bg-[#FDF6E2] text-[#8A6D1B] border border-[#8A6D1B]/20'
                              : 'bg-[#FCF3F3] text-[#A64D4D] border border-[#A64D4D]/20'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-[#33332D] bg-[#F9F8F3] p-3.5 rounded-2xl border border-[#E5E1D5]">
                      {comp.description}
                    </p>

                    {comp.imageUrl && (
                      <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-[#E5E1D5] w-fit">
                        <img
                          src={comp.imageUrl}
                          alt="Ticket photo"
                          className="h-16 w-16 object-cover rounded-lg border border-[#E5E1D5]"
                        />
                        <span className="text-[11px] text-[#8A8E71]">Guest uploaded attachment</span>
                      </div>
                    )}

                    {/* Operational Action Controls */}
                    <div className="bg-[#FAF8F2] p-3 rounded-2xl border border-[#E5E1D5] space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold uppercase text-[#8A8E71] mb-1">
                            Assign Staff
                          </label>
                          <select
                            value={assigneeMap[comp.id] !== undefined ? assigneeMap[comp.id] : (comp.assignedTo || '')}
                            onChange={(e) => setAssigneeMap({ ...assigneeMap, [comp.id]: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                          >
                            <option value="">Unassigned</option>
                            {employees && employees.length > 0 ? (
                              employees.map((emp) => (
                                <option key={emp.id} value={`${emp.full_name} (${emp.role})`}>
                                  {emp.full_name} - {emp.role}
                                </option>
                              ))
                            ) : (
                              staff.map((s) => (
                                <option key={s.id} value={`${s.name} (${s.role})`}>
                                  {s.name} - {s.role}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold uppercase text-[#8A8E71] mb-1">
                            Update Lifecycle Status
                          </label>
                          <select
                            value={selectedStatus}
                            onChange={(e) => setStatusSelectMap({ ...statusSelectMap, [comp.id]: e.target.value as ComplaintStatus })}
                            className="w-full px-2.5 py-1.5 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D] font-semibold"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold uppercase text-[#8A8E71] mb-1">
                            Resolution Note / Staff Log
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Filter cleared or parts replaced..."
                            value={resolutionText[comp.id] !== undefined ? resolutionText[comp.id] : (comp.resolutionNote || '')}
                            onChange={(e) => setResolutionText({ ...resolutionText, [comp.id]: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                          />
                        </div>

                        <div className="sm:col-span-2 pt-3 sm:pt-4">
                          <button
                            onClick={() => handleUpdateComplaint(comp.id, selectedStatus)}
                            className="w-full py-1.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl font-medium text-xs transition-colors flex items-center justify-center space-x-1 shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>

                      {comp.resolutionNote && (
                        <div className="text-[11px] text-[#4F6D4F] bg-[#F2F4F2] p-2 rounded-xl border border-[#D5E1D5]">
                          <strong>Current Note:</strong> {comp.resolutionNote}
                          {comp.assignedTo && <span> • Assigned: {comp.assignedTo}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 3: Guest Feedback & Suggestions Review */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Top Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-[0.2em]">
                Average Guest Score
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#D4AF37]">
                  {feedbackAnalytics.averageRating} ★
                </span>
                <span className="text-xs text-[#8A8E71]">out of 5.0</span>
              </div>
              <p className="text-[11px] text-[#8A8E71] mt-2">
                Based on {feedbackAnalytics.total} direct stay feedback responses
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-[0.2em]">
                Positive Sentiment
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#4F6D4F]">
                  {feedbackAnalytics.positiveCount}
                </span>
                <span className="text-xs text-[#4F6D4F] font-semibold">4★ and 5★</span>
              </div>
              <p className="text-[11px] text-[#8A8E71] mt-2">
                Delighted guests recommending resort services
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-[0.2em]">
                Improvement Suggestions
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-serif font-bold text-[#5C5E4E]">
                  {suggestions.length}
                </span>
                <span className="text-xs text-[#A64D4D] font-bold">
                  {suggestions.filter((s) => s.status === 'Pending').length} Pending
                </span>
              </div>
              <p className="text-[11px] text-[#8A8E71] mt-2">
                Guest proposals for amenities, activities & dining
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-[0.2em]">
                Rating Spread
              </span>
              <div className="flex items-center space-x-1 mt-2">
                {[5, 4, 3, 2, 1].map((r) => (
                  <div key={r} className="flex-1 text-center bg-[#FAF8F2] p-1 rounded-lg border border-[#E5E1D5]">
                    <span className="text-[10px] block font-bold text-[#1C1C1A]">{r}★</span>
                    <span className="text-[10px] text-[#8A8E71]">
                      {feedbackAnalytics.ratingDistribution[r as 1 | 2 | 3 | 4 | 5] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guest Feedback Column */}
            <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#EBE8DE]">
                <h3 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-[#A64D4D]" />
                  <span>Guest Stay Feedback ({feedbackList.length})</span>
                </h3>
                <span className="text-xs text-[#8A8E71] font-semibold">Latest Ratings</span>
              </div>

              {feedbackList.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8A8E71]">
                  No feedback submitted yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {feedbackList.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D5] text-xs space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-[#1C1C1A]">{f.guestName}</strong>
                          {f.roomNumber && <span className="text-[#8A8E71] ml-2">• Room {f.roomNumber}</span>}
                        </div>
                        <div className="flex items-center space-x-0.5 text-[#D4AF37]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= f.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-[#33332D] italic">"{f.comment}"</p>

                      {f.categories && (
                        <div className="flex flex-wrap gap-2 text-[10px] text-[#5C5E4E] pt-1 border-t border-[#EBE8DE]">
                          {f.categories.cleanliness && <span>Cleanliness: {f.categories.cleanliness}★</span>}
                          {f.categories.food && <span>Food: {f.categories.food}★</span>}
                          {f.categories.staff && <span>Staff: {f.categories.staff}★</span>}
                          {f.categories.amenities && <span>Amenities: {f.categories.amenities}★</span>}
                        </div>
                      )}
                      <div className="text-[10px] text-[#8A8E71]">{new Date(f.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guest Suggestions & Proposals Column */}
            <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#EBE8DE]">
                <h3 className="font-serif font-bold text-[#1C1C1A] text-base flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-[#D4AF37]" />
                  <span>Improvement Proposals ({suggestions.length})</span>
                </h3>
                <span className="text-xs text-[#8A8E71] font-semibold">Management Review</span>
              </div>

              {suggestions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8A8E71]">
                  No suggestions logged yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {suggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E5E1D5] text-xs space-y-2.5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-[#E5E1D5] text-[#5C5E4E] text-[10px] font-bold">
                            {sug.category}
                          </span>
                          <h5 className="font-bold text-[#1C1C1A] mt-1">{sug.title}</h5>
                          <p className="text-[11px] text-[#8A8E71]">From: {sug.guestName}</p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sug.status === 'Implemented'
                              ? 'bg-[#F2F4F2] text-[#4F6D4F] border border-[#4F6D4F]/20'
                              : sug.status === 'Planned'
                              ? 'bg-[#FDF6E2] text-[#8A6D1B] border border-[#8A6D1B]/20'
                              : sug.status === 'Under Review'
                              ? 'bg-[#F5F2EA] text-[#5C5E4E] border border-[#5C5E4E]/20'
                              : 'bg-[#FCF3F3] text-[#A64D4D] border border-[#A64D4D]/20'
                          }`}
                        >
                          {sug.status}
                        </span>
                      </div>

                      <p className="text-[#33332D]">{sug.description}</p>

                      {/* Management Status updater */}
                      <div className="pt-2 border-t border-[#EBE8DE] space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Manager response note..."
                            value={suggestionResponseText[sug.id] !== undefined ? suggestionResponseText[sug.id] : (sug.adminResponse || '')}
                            onChange={(e) => setSuggestionResponseText({ ...suggestionResponseText, [sug.id]: e.target.value })}
                            className="flex-1 px-2.5 py-1.5 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                          />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {(['Under Review', 'Planned', 'Implemented', 'Dismissed'] as SuggestionStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleUpdateSuggestion(sug.id, st)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                sug.status === st
                                  ? 'bg-[#5C5E4E] text-white shadow-2xs'
                                  : 'bg-white border border-[#E5E1D5] text-[#5C5E4E] hover:bg-[#F5F2EA]'
                              }`}
                            >
                              Set {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Inventory & Supplies Management */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-[#E5E1D5] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#EBE8DE] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-[#1C1C1A] text-base">
                Resort Stock & Supplies Inventory
              </h3>
              <p className="text-xs text-[#8A8E71]">
                Adjust quantities on hand. Threshold alerts automatically notify purchasing.
              </p>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#F9F8F3] border-b border-[#E5E1D5] text-[#8A8E71] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-bold">Item Name</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">In-Stock Quantity</th>
                <th className="p-4 font-bold">Safety Threshold</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 text-right font-bold">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8DE] text-[#33332D]">
              {inventory.map((item) => {
                const isLow = item.quantity <= item.minThreshold;

                return (
                  <tr key={item.id} className={isLow ? 'bg-[#FBEAEA]/30' : ''}>
                    <td className="p-4 font-semibold text-[#1C1C1A]">{item.name}</td>
                    <td className="p-4 text-[#8A8E71]">{item.category}</td>
                    <td className="p-4 font-bold text-[#1C1C1A]">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-4 text-[#8A8E71]">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          isLow ? 'bg-[#FBEAEA] text-[#A64D4D]' : 'bg-[#F2F4F2] text-[#4F6D4F]'
                        }`}
                      >
                        {isLow ? 'Low Stock Warning' : 'Adequate'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => updateInventoryQuantity(item.id, Math.max(0, item.quantity - 5))}
                        className="px-2.5 py-1.5 bg-[#F5F2EA] hover:bg-[#EBE8DE] rounded-lg text-[#5C5E4E] font-bold"
                        title="Deduct 5 units"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateInventoryQuantity(item.id, item.quantity + 20)}
                        className="px-3 py-1.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-lg text-[11px] font-medium"
                        title="Restock +20 units"
                      >
                        +20 Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Staff & Roles Management */}
      {activeTab === 'staff' && (
        <StaffManagement />
      )}
    </div>
  );
};
