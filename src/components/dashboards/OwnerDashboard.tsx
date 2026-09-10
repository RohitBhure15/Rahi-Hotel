import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Building,
  Award,
  ArrowUpRight,
  PieChart as PieIcon,
  Percent,
  DollarSign,
  FileSpreadsheet,
  AlertTriangle,
  Utensils,
  CheckCircle2,
  Heart,
  Star,
  Lightbulb,
  Database,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useHotel } from '../../context/HotelContext';
import { DatabaseExplorer } from '../database/DatabaseExplorer';

export const OwnerDashboard: React.FC = () => {
  const {
    bookings,
    rooms,
    foodOrders,
    reviews,
    complaints,
    suggestions,
    complaintStats,
    foodOrderStats,
    feedbackAnalytics,
  } = useHotel();

  const [activeView, setActiveView] = useState<'finance' | 'database'>('finance');
  const [dateRange, setDateRange] = useState<'30days' | 'quarter' | 'year'>('30days');

  // Financial aggregates
  const totalRoomRevenue = bookings.reduce((sum, b) => sum + b.roomCharges, 0);
  const totalFoodRevenue = bookings.reduce((sum, b) => sum + b.foodCharges, 0);
  const totalSpaRevenue = bookings.reduce((sum, b) => sum + b.spaCharges, 0);
  const totalTaxes = bookings.reduce((sum, b) => sum + b.taxes, 0);
  const grossRevenue = totalRoomRevenue + totalFoodRevenue + totalSpaRevenue + totalTaxes;

  // Operating costs estimate (~42% in luxury hospitality)
  const operatingCosts = Math.round(grossRevenue * 0.42);
  const netProfit = grossRevenue - operatingCosts;
  const netMargin = Math.round((netProfit / grossRevenue) * 100) || 58;

  // ADR (Average Daily Rate) and RevPAR
  const totalOccupiedNights = bookings.reduce((sum, b) => sum + b.nights, 0);
  const adr = Math.round(totalRoomRevenue / (totalOccupiedNights || 1));
  const revPar = Math.round(totalRoomRevenue / (rooms.length * 30));

  // Chart datasets
  const monthlyRevenueData = [
    { month: 'Apr', rooms: 840000, food: 220000, spa: 95000 },
    { month: 'May', rooms: 920000, food: 250000, spa: 110000 },
    { month: 'Jun', rooms: 780000, food: 190000, spa: 85000 },
    { month: 'Jul', rooms: 1150000, food: 310000, spa: 145000 },
    { month: 'Aug', rooms: 1320000, food: 390000, spa: 180000 },
    { month: 'Sep', rooms: 1540000, food: 440000, spa: 210000 },
  ];

  const occupancyTrendData = [
    { day: 'Mon', rate: 76 },
    { day: 'Tue', rate: 82 },
    { day: 'Wed', rate: 85 },
    { day: 'Thu', rate: 91 },
    { day: 'Fri', rate: 98 },
    { day: 'Sat', rate: 100 },
    { day: 'Sun', rate: 94 },
  ];

  const revenuePieData = [
    { name: 'Room Bookings', value: totalRoomRevenue || 65000, color: '#5C5E4E' }, // olive primary
    { name: 'F&B Dining', value: totalFoodRevenue || 18000, color: '#D4AF37' }, // gold accent
    { name: 'Spa & Wellness', value: totalSpaRevenue || 12000, color: '#8A8E71' }, // sage secondary
    { name: 'Activities & Other', value: 8500, color: '#4F6D4F' }, // muted green
  ];

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Booking ID,Guest Name,Room Number,Room Type,Nights,Total (INR),Status,Payment Method\n';

    bookings.forEach((b) => {
      csvContent += `${b.id},"${b.guestName}",${b.roomNumber},"${b.roomType}",${b.nights},${b.totalAmount},"${b.status}","${b.paymentMethod}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aura_Palms_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D5] mb-8">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-[#5C5E4E] text-[#D4AF37]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1A]">
                Resort Executive & Investor Intelligence
              </h2>
              <p className="text-xs text-[#8A8E71] mt-0.5">
                Financial analytics, departmental revenue contribution, occupancy yield, and exportable reports.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#F5F2EA] p-1 rounded-2xl border border-[#E5E1D5] flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveView('finance')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeView === 'finance' ? 'bg-[#5C5E4E] text-white shadow-2xs' : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
              }`}
            >
              Executive Financials
            </button>
            <button
              onClick={() => setActiveView('database')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 ${
                activeView === 'database' ? 'bg-[#5C5E4E] text-white shadow-2xs' : 'text-[#5C5E4E] hover:text-[#1C1C1A]'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>MySQL Database</span>
            </button>
          </div>

          {activeView === 'finance' && (
            <>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3.5 py-2 bg-white border border-[#E5E1D5] rounded-xl text-xs font-semibold text-[#33332D] shadow-2xs"
              >
                <option value="30days">Last 30 Days</option>
                <option value="quarter">Current Quarter (Q3)</option>
                <option value="year">Fiscal Year 2026</option>
              </select>

              <button
                id="export-financial-csv-btn"
                onClick={handleExportCSV}
                className="px-4 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-medium flex items-center space-x-2 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Export CSV Folio</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeView === 'database' ? (
        <DatabaseExplorer />
      ) : (
        <>
          {/* Top 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-wider">
            Gross Bookings Revenue
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-serif font-bold text-[#1C1C1A]">
              ₹{(grossRevenue * 32).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1 text-xs text-[#4F6D4F] font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs last cycle</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-wider">
            Estimated Net Operating Profit
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-serif font-bold text-[#5C5E4E]">
              ₹{(netProfit * 32).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-[#8A8E71] mt-2">
            Net Margin: <strong className="text-[#4F6D4F]">{netMargin}%</strong> after resort OPEX
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-wider">
            ADR (Average Daily Rate)
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-serif font-bold text-[#1C1C1A]">
              ₹{adr.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-[#8A8E71] mt-2">
            Average realization per occupied room/night
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#8A8E71] block tracking-wider">
            RevPAR (Revenue Per Room)
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-serif font-bold text-[#1C1C1A]">
              ₹{Math.max(4800, revPar).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-[#8A8E71] mt-2">
            Benchmarked against luxury South Goa competitive set
          </p>
        </div>
      </div>

      {/* Operational Health & Service Quality Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FAF8F2] p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8A8E71] tracking-wider">
              Issue Resolution Index
            </span>
            <AlertTriangle className="w-4 h-4 text-[#A64D4D]" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-serif font-bold text-[#1C1C1A]">
              {complaintStats.total > 0
                ? `${Math.round((complaintStats.resolved / complaintStats.total) * 100)}%`
                : '100%'}
            </span>
            <span className="text-xs text-[#4F6D4F] font-semibold">Resolved Rate</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#5C5E4E]">
            <span>{complaintStats.pending} Pending</span>
            <span>{complaintStats.in_progress} In-Progress</span>
            <span>{complaintStats.total} Total</span>
          </div>
        </div>

        <div className="bg-[#FAF8F2] p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8A8E71] tracking-wider">
              F&B Orders Velocity
            </span>
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-serif font-bold text-[#1C1C1A]">
              {foodOrderStats.total}
            </span>
            <span className="text-xs text-[#8A8E71]">Orders Today</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#5C5E4E]">
            <span>{foodOrderStats.preparing + foodOrderStats.new} In Kitchen</span>
            <span className="text-[#4F6D4F] font-semibold">{foodOrderStats.delivered} Delivered</span>
          </div>
        </div>

        <div className="bg-[#FAF8F2] p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8A8E71] tracking-wider">
              Guest Satisfaction Score
            </span>
            <Heart className="w-4 h-4 text-[#A64D4D]" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-serif font-bold text-[#D4AF37]">
              {feedbackAnalytics.averageRating} ★
            </span>
            <span className="text-xs text-[#4F6D4F] font-semibold">
              {feedbackAnalytics.positiveCount} Positive (85%+)
            </span>
          </div>
          <p className="text-[11px] text-[#8A8E71] mt-2">
            Derived from {feedbackAnalytics.total} direct verified guest stays
          </p>
        </div>

        <div className="bg-[#FAF8F2] p-5 rounded-3xl border border-[#E5E1D5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8A8E71] tracking-wider">
              Guest Innovation Pipeline
            </span>
            <Lightbulb className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-serif font-bold text-[#5C5E4E]">
              {suggestions.length}
            </span>
            <span className="text-xs text-[#8A8E71]">Guest Ideas</span>
          </div>
          <p className="text-[11px] text-[#8A8E71] mt-2">
            {suggestions.filter((s) => s.status === 'Implemented' || s.status === 'Planned').length} in active development roadmap
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Revenue Trend - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-serif font-bold text-[#1C1C1A] text-base">
                Departmental Revenue Streams (INR)
              </h3>
              <p className="text-xs text-[#8A8E71]">Rooms accommodation, dining, and spa treatments</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <XAxis dataKey="month" stroke="#8A8E71" fontSize={11} />
                <YAxis stroke="#8A8E71" fontSize={11} tickFormatter={(val) => `₹${val / 100000}L`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#1C1C1A', color: '#FDFCF8', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="rooms" name="Rooms Revenue" fill="#5C5E4E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="food" name="F&B Dining" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spa" name="Spa & Wellness" fill="#8A8E71" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Share Breakdown Donut */}
        <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-[#1C1C1A] text-base">
              Revenue Mix
            </h3>
            <p className="text-xs text-[#8A8E71]">Contribution by operational department</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenuePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {revenuePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#1C1C1A', color: '#FDFCF8', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {revenuePieData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-[#33332D]">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <strong className="text-[#1C1C1A]">₹{item.value.toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Occupancy Trend & Room Type Profitability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trend */}
        <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-serif font-bold text-[#1C1C1A] text-base">
                Weekly Occupancy Velocity (%)
              </h3>
              <p className="text-xs text-[#8A8E71]">Peak weekend vs midweek booking curves</p>
            </div>
            <span className="text-xs font-bold text-[#4F6D4F] bg-[#F2F4F2] px-3 py-1 rounded-full border border-[#4F6D4F]/20">
              Avg: 89.4%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyTrendData}>
                <XAxis dataKey="day" stroke="#8A8E71" fontSize={11} />
                <YAxis stroke="#8A8E71" fontSize={11} domain={[60, 100]} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Occupancy']}
                  contentStyle={{ backgroundColor: '#1C1C1A', color: '#FDFCF8', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#5C5E4E"
                  strokeWidth={3}
                  dot={{ fill: '#5C5E4E', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Performance Matrix */}
        <div className="bg-white rounded-3xl border border-[#E5E1D5] p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-serif font-bold text-[#1C1C1A] text-base">
                Room Category Yield & Ratings
              </h3>
              <p className="text-xs text-[#8A8E71]">Revenue efficiency and satisfaction index</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F9F8F3] text-[#5C5E4E] font-semibold uppercase text-[10px] tracking-wider border-b border-[#E5E1D5]">
                <tr>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Tariff / Night</th>
                  <th className="py-3 px-3">Avg Occupancy</th>
                  <th className="py-3 px-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE8DE] text-[#33332D]">
                <tr className="hover:bg-[#FDFCF8]">
                  <td className="py-3 px-3 font-semibold text-[#1C1C1A]">Deluxe Room</td>
                  <td className="py-3 px-3">₹3,500</td>
                  <td className="py-3 px-3">94%</td>
                  <td className="py-3 px-3 text-right text-[#D4AF37] font-bold">4.8 ★</td>
                </tr>
                <tr className="hover:bg-[#FDFCF8]">
                  <td className="py-3 px-3 font-semibold text-[#1C1C1A]">Premium Ocean View</td>
                  <td className="py-3 px-3">₹5,200</td>
                  <td className="py-3 px-3">91%</td>
                  <td className="py-3 px-3 text-right text-[#D4AF37] font-bold">4.9 ★</td>
                </tr>
                <tr className="hover:bg-[#FDFCF8]">
                  <td className="py-3 px-3 font-semibold text-[#1C1C1A]">Grand Sunset Suite</td>
                  <td className="py-3 px-3">₹7,800</td>
                  <td className="py-3 px-3">88%</td>
                  <td className="py-3 px-3 text-right text-[#D4AF37] font-bold">5.0 ★</td>
                </tr>
                <tr className="hover:bg-[#FDFCF8]">
                  <td className="py-3 px-3 font-semibold text-[#1C1C1A]">Family Ocean Suite</td>
                  <td className="py-3 px-3">₹9,500</td>
                  <td className="py-3 px-3">86%</td>
                  <td className="py-3 px-3 text-right text-[#D4AF37] font-bold">4.9 ★</td>
                </tr>
                <tr className="hover:bg-[#FDFCF8]">
                  <td className="py-3 px-3 font-semibold text-[#1C1C1A]">Plunge Pool Beachfront Villa</td>
                  <td className="py-3 px-3">₹14,000</td>
                  <td className="py-3 px-3">96%</td>
                  <td className="py-3 px-3 text-right text-[#D4AF37] font-bold">5.0 ★</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};
