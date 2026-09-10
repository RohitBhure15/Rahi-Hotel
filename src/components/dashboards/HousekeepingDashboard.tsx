import React, { useState } from 'react';
import {
  Sparkle,
  Bed,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Shirt,
  Wrench,
  Search,
  Filter,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { RoomStatus, HousekeepingTask } from '../../types';

export const HousekeepingDashboard: React.FC = () => {
  const {
    rooms,
    updateRoomStatus,
    housekeepingTasks,
    updateHousekeepingStatus,
    submitMaintenance,
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'tasks' | 'rooms' | 'laundry' | 'maint'>('tasks');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');

  // New maintenance issue form
  const [maintRoom, setMaintRoom] = useState('204');
  const [maintProblem, setMaintProblem] = useState('Bathroom faucet dripping or low water pressure');
  const [maintPriority, setMaintPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [maintSuccess, setMaintSuccess] = useState(false);

  // Laundry sample state
  const [laundryItems, setLaundryItems] = useState([
    { id: 'L-101', room: '204', items: '4 Towels, 2 Bed sheets, 2 Pillow covers', status: 'Washing', sentAt: '09:30 AM' },
    { id: 'L-102', room: '302', items: '2 Bathrobes, 4 Hand towels', status: 'Delivered', sentAt: 'Yesterday' },
    { id: 'L-103', room: 'Villa 1', items: '6 Towels, 4 Duvet covers, 4 Pillows', status: 'Sent', sentAt: '11:15 AM' },
  ]);

  const pendingTasks = housekeepingTasks.filter((t) => t.status === 'Pending');
  const inProgressTasks = housekeepingTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = housekeepingTasks.filter((t) => t.status === 'Clean / Completed');

  const handleReportMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    submitMaintenance({
      roomNumber: maintRoom,
      problem: maintProblem,
      priority: maintPriority,
    });
    setMaintSuccess(true);
    setTimeout(() => setMaintSuccess(false), 3000);
  };

  const updateLaundryStatus = (id: string, newStatus: string) => {
    setLaundryItems((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D5] mb-8">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-[#5C5E4E] text-[#D4AF37]">
              <Sparkle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1A]">
                Housekeeping & Facilities Operations
              </h2>
              <p className="text-xs text-[#8A8E71] mt-0.5">
                Room sanitation schedules, guest amenity requests, linen laundry, and room clearance.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="bg-[#F5F2EA] p-1.5 rounded-2xl border border-[#E5E1D5] flex items-center space-x-1 text-xs">
          {[
            { key: 'tasks', label: 'Cleaning Tasks', count: pendingTasks.length + inProgressTasks.length },
            { key: 'rooms', label: 'Room Cleanliness Matrix', count: rooms.length },
            { key: 'laundry', label: 'Linen & Laundry', count: laundryItems.length },
            { key: 'maint', label: 'Report Defect', count: null },
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
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#47493D] text-white' : 'bg-[#E5E1D5] text-[#33332D]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Tasks Queue */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D5]">
              <h3 className="font-serif font-bold text-[#1C1C1A] text-sm flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
                <span>Pending Cleaning Queue ({pendingTasks.length})</span>
              </h3>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center bg-[#F9F8F3] rounded-2xl border border-[#E5E1D5] text-[#8A8E71] text-xs">
                No pending requests. All rooms queued are being serviced.
              </div>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-[#E5E1D5] p-5 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-[#5C5E4E] text-sm">
                        Room {task.roomNumber}
                      </span>
                      <p className="font-semibold text-[#1C1C1A] text-xs mt-0.5">{task.type}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        task.priority === 'Urgent'
                          ? 'bg-[#FCF3F3] text-[#A64D4D] border border-[#A64D4D]/30'
                          : 'bg-[#F5F2EA] text-[#5C5E4E] border border-[#5C5E4E]/30'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  {task.instructions && (
                    <p className="text-[11px] text-[#8A8E71] italic bg-[#F9F8F3] p-2.5 rounded-xl border border-[#EBE8DE]">
                      "{task.instructions}"
                    </p>
                  )}

                  <button
                    onClick={() => updateHousekeepingStatus(task.id, 'In Progress')}
                    className="w-full py-2.5 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-medium shadow-2xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Assign Attendant & Start Cleaning</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* In Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D5]">
              <h3 className="font-serif font-bold text-[#1C1C1A] text-sm flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5C5E4E]" />
                <span>Cleaning In Progress ({inProgressTasks.length})</span>
              </h3>
            </div>

            {inProgressTasks.length === 0 ? (
              <div className="p-8 text-center bg-[#F9F8F3] rounded-2xl border border-[#E5E1D5] text-[#8A8E71] text-xs">
                No active cleanings in progress right now.
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-[#8A8E71]/40 p-5 shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-[#5C5E4E] text-sm">
                        Room {task.roomNumber}
                      </span>
                      <p className="font-semibold text-[#1C1C1A] text-xs mt-0.5">{task.type}</p>
                      <p className="text-[10px] text-[#8A8E71]">Attendant: {task.assignedStaff || 'Staff Member'}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F2EA] text-[#5C5E4E] border border-[#5C5E4E]/30">
                      In Progress
                    </span>
                  </div>

                  <button
                    onClick={() => updateHousekeepingStatus(task.id, 'Clean / Completed')}
                    className="w-full py-2.5 bg-[#4F6D4F] hover:bg-[#3D563D] text-white rounded-xl text-xs font-medium shadow-2xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Clean & Available for Guests ✨</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Completed History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D5]">
              <h3 className="font-serif font-bold text-[#1C1C1A] text-sm flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F6D4F]" />
                <span>Sanitized & Ready ({completedTasks.length})</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-[#E5E1D5] p-3.5 text-xs text-[#33332D] flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <span className="font-semibold text-[#1C1C1A]">Room {task.roomNumber}</span>
                    <p className="text-[11px] text-[#8A8E71]">{task.type}</p>
                  </div>
                  <span className="text-[10px] text-[#4F6D4F] font-bold bg-[#F2F4F2] px-2.5 py-0.5 rounded-full border border-[#4F6D4F]/20">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Room Cleanliness Grid */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-[#1C1C1A]">
              Quick Housekeeping Status Toggles
            </h3>
            <div className="flex space-x-2 text-xs">
              <button
                onClick={() => setSelectedFloor('all')}
                className={`px-3 py-1 rounded-xl transition-colors ${selectedFloor === 'all' ? 'bg-[#5C5E4E] text-white' : 'bg-[#F5F2EA] text-[#5C5E4E]'}`}
              >
                All Floors
              </button>
              {[1, 2, 3].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`px-3 py-1 rounded-xl transition-colors ${selectedFloor === f ? 'bg-[#5C5E4E] text-white' : 'bg-[#F5F2EA] text-[#5C5E4E]'}`}
                >
                  Floor {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {rooms
              .filter((r) => selectedFloor === 'all' || r.floor === selectedFloor)
              .map((room) => (
                <div
                  key={room.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                    room.status === 'cleaning'
                      ? 'bg-[#FDF9EE] border-[#D4AF37]/50'
                      : room.status === 'available'
                      ? 'bg-[#F2F4F2] border-[#4F6D4F]/30'
                      : 'bg-white border-[#E5E1D5]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-[#1C1C1A]">Room {room.number}</span>
                    <span className="text-[10px] text-[#8A8E71] font-semibold">{room.floor}F</span>
                  </div>
                  <p className="text-[11px] text-[#8A8E71] truncate">{room.type}</p>

                  <select
                    value={room.status}
                    onChange={(e) => updateRoomStatus(room.number, e.target.value as RoomStatus)}
                    className="w-full text-[10px] py-1 px-1 bg-white border border-[#E5E1D5] rounded-lg font-semibold text-[#33332D]"
                  >
                    <option value="available">Clean / Available</option>
                    <option value="cleaning">Needs Cleaning</option>
                    <option value="occupied">Occupied (Guest)</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Laundry Tracking */}
      {activeTab === 'laundry' && (
        <div className="bg-white rounded-3xl border border-[#E5E1D5] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#EBE8DE] flex items-center justify-between">
            <h3 className="font-serif font-bold text-[#1C1C1A] text-base">
              Linen, Bedding & Guest Laundry Tracker
            </h3>
            <span className="text-xs text-[#8A8E71]">Commercial Laundry Unit • Building C</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#F9F8F3] border-b border-[#E5E1D5] text-[#5C5E4E] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Lot ID</th>
                <th className="p-3.5">Room</th>
                <th className="p-3.5">Linen Bundle Details</th>
                <th className="p-3.5">Sent Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8DE] text-[#33332D]">
              {laundryItems.map((l) => (
                <tr key={l.id} className="hover:bg-[#FDFCF8]">
                  <td className="p-3.5 font-mono font-bold text-[#5C5E4E]">{l.id}</td>
                  <td className="p-3.5 font-semibold text-[#1C1C1A]">Room {l.room}</td>
                  <td className="p-3.5">{l.items}</td>
                  <td className="p-3.5 text-[#8A8E71]">{l.sentAt}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'Delivered'
                          ? 'bg-[#F2F4F2] text-[#4F6D4F] border border-[#4F6D4F]/20'
                          : l.status === 'Washing'
                          ? 'bg-[#F5F2EA] text-[#5C5E4E] border border-[#5C5E4E]/20'
                          : 'bg-[#FDF9EE] text-[#D4AF37] border border-[#D4AF37]/30'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    {l.status !== 'Delivered' && (
                      <button
                        onClick={() => updateLaundryStatus(l.id, l.status === 'Sent' ? 'Washing' : 'Delivered')}
                        className="px-3 py-1 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-lg text-[11px] font-medium transition-colors"
                      >
                        {l.status === 'Sent' ? 'Mark Washing' : 'Mark Delivered'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Report Maintenance Defect */}
      {activeTab === 'maint' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#EBE8DE] mb-4">
            <div className="p-2.5 bg-[#FCF3F3] text-[#A64D4D] rounded-xl">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#1C1C1A]">Report Room Defect</h4>
              <p className="text-[11px] text-[#8A8E71]">Notifies Maintenance Engineering directly</p>
            </div>
          </div>

          {maintSuccess ? (
            <div className="py-6 text-center text-[#4F6D4F] text-xs font-semibold">
              Defect reported successfully! Work order created.
            </div>
          ) : (
            <form onSubmit={handleReportMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#1C1C1A] font-semibold mb-1">Room Number</label>
                <input
                  type="text"
                  value={maintRoom}
                  onChange={(e) => setMaintRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl bg-white text-[#33332D]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1C1C1A] font-semibold mb-1">Problem Description</label>
                <textarea
                  rows={3}
                  value={maintProblem}
                  onChange={(e) => setMaintProblem(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E1D5] rounded-xl bg-white text-[#33332D]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1C1C1A] font-semibold mb-1">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setMaintPriority(p)}
                      className={`p-1.5 rounded-xl border text-center font-medium ${
                        maintPriority === p ? 'bg-[#5C5E4E] text-white font-bold' : 'border-[#E5E1D5] text-[#8A8E71]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#A64D4D] hover:bg-[#8F3F3F] text-white font-medium rounded-xl text-xs shadow-2xs transition-colors"
              >
                Submit Maintenance Work Order
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
