import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Filter,
  User,
  ShieldCheck,
  Zap,
  Droplet,
  Wifi,
  Key,
  Flame,
  Check,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { Complaint, ComplaintStatus, RoomStatus } from '../../types';

export const MaintenanceDashboard: React.FC = () => {
  const {
    rooms,
    complaints,
    updateComplaintStatus,
    submitComplaint,
    updateRoomStatus,
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'all' | 'Open' | 'In Progress' | 'Resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'AC' | 'Plumbing' | 'Electrical' | 'WiFi' | 'Other'>('All');
  const [technicianName, setTechnicianName] = useState('Vikash (IT & Facilities)');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // New ticket state
  const [newRoom, setNewRoom] = useState('301');
  const [newCategory, setNewCategory] = useState<'AC' | 'Plumbing' | 'Electrical' | 'WiFi' | 'Other'>('AC');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [newDesc, setNewDesc] = useState('');

  // Maintenance tickets are based on complaints relating to facility, room, hardware, or WiFi
  const maintenanceTickets = complaints.filter(
    (c) =>
      c.category === 'AC' ||
      c.category === 'Plumbing' ||
      c.category === 'Electrical' ||
      c.category === 'WiFi' ||
      c.category === 'Room' ||
      c.category === 'Other'
  );

  const filteredTickets = maintenanceTickets.filter((t) => {
    const matchesTab = activeTab === 'all' || t.status === activeTab;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesTab && matchesCategory;
  });

  const openTickets = maintenanceTickets.filter((t) => t.status === 'Open');
  const inProgressTickets = maintenanceTickets.filter((t) => t.status === 'In Progress');
  const resolvedTickets = maintenanceTickets.filter((t) => t.status === 'Resolved');
  const roomsInMaintenance = rooms.filter((r) => r.status === 'maintenance');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    submitComplaint({
      guestName: 'Facility Maintenance Call',
      roomNumber: newRoom,
      category: newCategory,
      priority: newPriority,
      description: newDesc,
      assignedTo: technicianName,
    });

    // Optionally set room to maintenance if High priority
    if (newPriority === 'High') {
      updateRoomStatus(newRoom, 'maintenance');
    }

    setNewDesc('');
    setShowNewTicketModal(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AC':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'Plumbing':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'Electrical':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'WiFi':
        return <Wifi className="w-4 h-4 text-purple-600" />;
      default:
        return <Wrench className="w-4 h-4 text-[#5C5E4E]" />;
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Console Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D5] mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-[#5C5E4E] text-[#D4AF37] shadow-2xs">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1C1C1A]/10 text-[#1C1C1A] text-[10px] font-bold uppercase tracking-wider border border-[#1C1C1A]/20">
                Staff Dashboard #7
              </span>
              <span className="text-xs text-[#8A8E71]">Engineering & Facility Repairs</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1A] mt-0.5">
              Maintenance & Engineering Center
            </h1>
            <p className="text-xs text-[#8A8E71] mt-0.5">
              Manage work orders, HVAC/plumbing repairs, preventive checks, and room hardware maintenance.
            </p>
          </div>
        </div>

        {/* Technician selector & New Ticket button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#E5E1D5] text-xs">
            <User className="w-3.5 h-3.5 text-[#5C5E4E]" />
            <span className="text-[#8A8E71]">Duty Tech:</span>
            <select
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              className="font-semibold text-[#1C1C1A] bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="Vikash (IT & Facilities)">Vikash (IT & Facilities)</option>
              <option value="Ramesh (Plumbing & HVAC)">Ramesh (Plumbing & HVAC)</option>
              <option value="Suresh (Electrical Lead)">Suresh (Electrical Lead)</option>
              <option value="Madan (Carpentry & Locks)">Madan (Carpentry & Locks)</option>
            </select>
          </div>

          <button
            id="maintenance-new-ticket-btn"
            onClick={() => setShowNewTicketModal(true)}
            className="px-4 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Create Repair Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A64D4D]">Open Work Orders</span>
            <AlertTriangle className="w-4 h-4 text-[#A64D4D]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#A64D4D] mt-2">{openTickets.length}</p>
          <p className="text-[11px] text-[#8A8E71] mt-1">Pending inspection</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E7D1B]">In Progress</span>
            <Clock className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1C1C1A] mt-2">{inProgressTickets.length}</p>
          <p className="text-[11px] text-[#5C5E4E] mt-1">Technician on site</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5E4E]">Rooms Under Maintenance</span>
            <Wrench className="w-4 h-4 text-[#5C5E4E]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1C1C1A] mt-2">{roomsInMaintenance.length}</p>
          <p className="text-[11px] text-[#8A8E71] mt-1">Locked out of inventory</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F6D4F]">Resolved & Cleared</span>
            <CheckCircle2 className="w-4 h-4 text-[#4F6D4F]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#4F6D4F] mt-2">{resolvedTickets.length}</p>
          <p className="text-[11px] text-[#8A8E71] mt-1">Repairs completed</p>
        </div>
      </div>

      {/* Main Layout: Tickets stream + Rooms Maintenance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Tickets Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center space-x-1.5 text-xs bg-[#F5F2EA] p-1 rounded-xl border border-[#E5E1D5]">
              {(['all', 'Open', 'In Progress', 'Resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-[#5C5E4E] text-white shadow-2xs'
                      : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
                  }`}
                >
                  {tab === 'all' ? 'All Tickets' : tab}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#8A8E71]">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-2.5 py-1 bg-white border border-[#E5E1D5] rounded-lg text-[#1C1C1A] text-xs focus:outline-hidden"
              >
                <option value="All">All Categories</option>
                <option value="AC">AC / HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="WiFi">WiFi / IT</option>
                <option value="Other">Other Repairs</option>
              </select>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E1D5] shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-[#4F6D4F] mx-auto mb-3" />
              <h4 className="font-serif text-lg font-bold text-[#1C1C1A]">No Work Orders Found</h4>
              <p className="text-xs text-[#8A8E71] mt-1">
                All maintenance tickets in this category are completed and in operational order.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const isOpen = ticket.status === 'Open';
                const isInProgress = ticket.status === 'In Progress';
                const isResolved = ticket.status === 'Resolved';

                return (
                  <div
                    key={ticket.id}
                    className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                      isOpen
                        ? 'border-[#A64D4D]/50 ring-1 ring-[#A64D4D]/20'
                        : isInProgress
                        ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/20'
                        : 'border-[#E5E1D5]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBE8DE]">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-[#F5F2EA] border border-[#E5E1D5]">
                          {getCategoryIcon(ticket.category)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-[#1C1C1A]">{ticket.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ticket.priority === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : ticket.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {ticket.priority} Priority
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isOpen
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isInProgress
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#5C5E4E] mt-0.5">
                            Room {ticket.roomNumber} • Category: {ticket.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-[#8A8E71]">
                        <Clock className="w-3 h-3 inline mr-1" />
                        <span>{ticket.createdAt}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="py-3">
                      <p className="text-xs text-[#33332D] leading-relaxed bg-[#FDFCF8] p-3 rounded-xl border border-[#EBE8DE]">
                        {ticket.description}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-xs text-[#8A8E71]">
                        <span>Reported by: <strong className="text-[#1C1C1A]">{ticket.guestName}</strong></span>
                        <span>Assigned Technician: <strong className="text-[#5C5E4E]">{ticket.assignedTo || technicianName}</strong></span>
                      </div>
                      {ticket.resolutionNote && (
                        <p className="text-xs text-[#4F6D4F] bg-emerald-50 p-2 rounded-lg border border-emerald-200 mt-2 font-medium">
                          ✓ Resolution Note: {ticket.resolutionNote}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-[#EBE8DE] flex items-center justify-end space-x-2">
                      {isOpen && (
                        <button
                          id={`start-repair-btn-${ticket.id}`}
                          onClick={() => updateComplaintStatus(ticket.id, 'In Progress', technicianName)}
                          className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#C09B2B] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Dispatch Technician (In Progress)</span>
                        </button>
                      )}

                      {(isOpen || isInProgress) && (
                        <button
                          id={`resolve-repair-btn-${ticket.id}`}
                          onClick={() => {
                            updateComplaintStatus(
                              ticket.id,
                              'Resolved',
                              technicianName,
                              `Repaired and verified by ${technicianName}. Equipment operational.`
                            );
                            // If room was in maintenance, restore to available
                            const room = rooms.find((r) => r.number === ticket.roomNumber);
                            if (room && room.status === 'maintenance') {
                              updateRoomStatus(ticket.roomNumber, 'available');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-[#4F6D4F] hover:bg-[#3D553D] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Repaired & Restore Room</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Room Status Sync & Preventive Maintenance */}
        <div className="space-y-6">
          {/* Room Hardware & Maintenance Control */}
          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
            <h3 className="font-serif text-base font-bold text-[#1C1C1A] mb-2">Room Maintenance Lock</h3>
            <p className="text-xs text-[#8A8E71] mb-4">
              Toggle room lock to take it out of inventory for emergency HVAC or plumbing overhaul.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {rooms.map((room) => {
                const isMaint = room.status === 'maintenance';

                return (
                  <div
                    key={room.number}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      isMaint
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-[#EBE8DE] bg-[#FDFCF8]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-[#1C1C1A]">Room {room.number}</span>
                      <p className="text-[10px] text-[#8A8E71]">{room.type}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isMaint
                            ? 'bg-rose-100 text-rose-800'
                            : room.status === 'occupied'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {room.status}
                      </span>

                      {isMaint ? (
                        <button
                          onClick={() => updateRoomStatus(room.number, 'available')}
                          className="px-2 py-1 bg-[#4F6D4F] text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-[#3D553D]"
                        >
                          Unlock (Ready)
                        </button>
                      ) : (
                        <button
                          onClick={() => updateRoomStatus(room.number, 'maintenance')}
                          className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-rose-700"
                        >
                          Lock (Maint.)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preventive Maintenance Calendar */}
          <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
            <h3 className="font-serif text-base font-bold text-[#1C1C1A] mb-3">Preventive Maintenance (PPM)</h3>
            <div className="space-y-2.5">
              {[
                { task: 'Infinity Pool Pump & Sand Filter Backwash', due: 'Today, 18:00', status: 'Due' },
                { task: 'Diesel Generator Backup Load Testing', due: 'Tomorrow, 10:00', status: 'Scheduled' },
                { task: 'Central RO Water Plant Micron Filter Replace', due: 'Sept 5', status: 'Scheduled' },
                { task: 'Solar Water Heating Thermostat Calibration', due: 'Sept 7', status: 'Scheduled' },
              ].map((ppm, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#F9F8F3] border border-[#EBE8DE] text-xs flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1C1C1A]">{ppm.task}</p>
                    <p className="text-[10px] text-[#8A8E71]">Due: {ppm.due}</p>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      ppm.status === 'Due' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {ppm.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Repair Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1C1A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E5E1D5] shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D5]">
              <h3 className="font-serif text-lg font-bold text-[#1C1C1A]">Create Engineering Ticket</h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-[#8A8E71] hover:text-[#1C1C1A] text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] mb-1">Target Room / Facility</label>
                  <select
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                  >
                    {rooms.map((r) => (
                      <option key={r.number} value={r.number}>
                        Room {r.number} ({r.type})
                      </option>
                    ))}
                    <option value="Pool Deck">Central Pool Deck</option>
                    <option value="Kitchen Area">Main Kitchen & Bakery</option>
                    <option value="Spa Pavilion">Ayurvedic Spa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                  >
                    <option value="AC">AC / HVAC</option>
                    <option value="Plumbing">Plumbing & Water</option>
                    <option value="Electrical">Electrical & Lighting</option>
                    <option value="WiFi">WiFi & IT</option>
                    <option value="Other">Carpentry / Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5E4E] mb-1">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        newPriority === p
                          ? p === 'High'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : p === 'Medium'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-stone-600 text-white shadow-2xs'
                          : 'bg-[#F5F2EA] text-[#5C5E4E] border border-[#E5E1D5]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5E4E] mb-1">Defect / Repair Details</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="e.g. Master bedroom split AC displaying E3 error code and low cooling."
                  className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl text-xs bg-white text-[#33332D]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 border border-[#E5E1D5] rounded-xl text-xs text-[#5C5E4E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Dispatch Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
