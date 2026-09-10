import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Phone,
  Mail,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  XCircle,
  History,
  MoreVertical,
  Edit2,
  Eye,
  Building,
  RefreshCw,
  Copy,
  Check,
  Power,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { Employee, EmployeeRole, EmployeeStatus } from '../../types';

export const StaffManagement: React.FC = () => {
  const {
    employees,
    createEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    resetEmployeePassword,
    auditLogs,
    authUser,
  } = useHotel();

  const [subTab, setSubTab] = useState<'directory' | 'audit'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [tempPassModal, setTempPassModal] = useState<{ name: string; id: string; pass: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // New Employee Form
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<EmployeeRole>('CHEF');
  const [newEmpId, setNewEmpId] = useState(`EMP${Math.floor(1030 + Math.random() * 8000)}`);
  const [newDept, setNewDept] = useState('Kitchen & F&B');
  const [newShift, setNewShift] = useState('Morning (6 AM - 2 PM)');
  const [newPhone, setNewPhone] = useState('+91 98111 ');
  const [newEmail, setNewEmail] = useState('');
  const [newTempPass, setNewTempPass] = useState(`Aura@${Math.floor(1000 + Math.random() * 9000)}`);
  const [newStatus, setNewStatus] = useState<EmployeeStatus>('ACTIVE');
  const [hotelId, setHotelId] = useState('HOTEL001');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Department auto-suggestion on role change
  const handleRoleChange = (r: EmployeeRole) => {
    setNewRole(r);
    switch (r) {
      case 'CHEF':
        setNewDept('Kitchen & F&B');
        break;
      case 'WAITER':
        setNewDept('Dining & Room Service');
        break;
      case 'HOUSEKEEPING':
        setNewDept('Housekeeping');
        break;
      case 'RECEPTIONIST':
        setNewDept('Front Desk & Concierge');
        break;
      case 'MAINTENANCE':
        setNewDept('Engineering & Facilities');
        break;
      case 'MANAGER':
        setNewDept('General Management');
        break;
      case 'OWNER':
        setNewDept('Executive Ownership');
        break;
    }
  };

  const handleOpenAddModal = () => {
    const generated = `EMP${Math.floor(1030 + Math.random() * 8000)}`;
    const pass = `Aura@${Math.floor(1000 + Math.random() * 9000)}`;
    setNewEmpId(generated);
    setNewTempPass(pass);
    setNewFullName('');
    setNewEmail('');
    setNewPhone('+91 98111 ');
    setNewRole('CHEF');
    setNewDept('Kitchen & F&B');
    setNewShift('Morning (6 AM - 2 PM)');
    setNewStatus('ACTIVE');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) {
      setFormError('Full Name is required.');
      return;
    }

    setLoading(true);
    setFormError(null);
    const res = await createEmployee({
      employee_id: newEmpId,
      full_name: newFullName.trim(),
      role: newRole,
      department: newDept,
      shift: newShift,
      phone: newPhone,
      email: newEmail || `${newFullName.toLowerCase().replace(/\s+/g, '.')}@aurapalms.com`,
      temporary_password: newTempPass,
      status: newStatus,
      hotel_id: hotelId,
    });
    setLoading(false);

    if (res.success && res.employee) {
      setIsAddModalOpen(false);
      setTempPassModal({
        name: res.employee.full_name,
        id: res.employee.employee_id,
        pass: res.employee.temporary_password || newTempPass,
      });
    } else {
      setFormError(res.error || 'Failed to create employee account.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    setLoading(true);
    await updateEmployee(editingEmp.id, {
      full_name: editingEmp.full_name,
      role: editingEmp.role,
      department: editingEmp.department,
      shift: editingEmp.shift,
      phone: editingEmp.phone,
      email: editingEmp.email,
    });
    setLoading(false);
    setEditingEmp(null);
  };

  const handleResetPassword = async (emp: Employee) => {
    const confirm = window.confirm(
      `Are you sure you want to reset the password for ${emp.full_name} (${emp.employee_id})? A new temporary password will be issued.`
    );
    if (!confirm) return;

    const res = await resetEmployeePassword(emp.id);
    if (res.success && res.temporary_password) {
      setTempPassModal({
        name: emp.full_name,
        id: emp.employee_id,
        pass: res.temporary_password,
      });
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const isDisabling = emp.status === 'ACTIVE';
    const message = isDisabling
      ? `Disable account for ${emp.full_name}? They will be immediately blocked from logging in.`
      : `Re-enable account for ${emp.full_name}? They will be allowed to log in.`;
    if (!window.confirm(message)) return;

    await toggleEmployeeStatus(emp.id);
  };

  const handleCopyPassword = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Metrics
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const inactiveCount = employees.filter((e) => e.status === 'INACTIVE').length;
  const onDutyCount = employees.filter((e) => e.status === 'ACTIVE').length;

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    const matchQuery =
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.includes(searchQuery);

    const matchRole = roleFilter === 'ALL' || emp.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchQuery && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D5]">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#1C1C1A]">
              Staff Management & Role Administration
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#EBE8DE] text-[#5C5E4E] text-xs font-bold font-mono">
              HOTEL001
            </span>
          </div>
          <p className="text-xs text-[#8A8E71] mt-0.5">
            Provision staff accounts, enforce role-based access control, issue temporary passwords, and monitor system security.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="p-1 bg-[#F5F2EA] rounded-xl border border-[#E5E1D5] flex text-xs font-medium">
            <button
              onClick={() => setSubTab('directory')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                subTab === 'directory' ? 'bg-[#5C5E4E] text-white shadow-2xs font-bold' : 'text-[#5C5E4E]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Roster ({totalCount})</span>
            </button>
            <button
              onClick={() => setSubTab('audit')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                subTab === 'audit' ? 'bg-[#5C5E4E] text-white shadow-2xs font-bold' : 'text-[#5C5E4E]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Log ({auditLogs.length})</span>
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E1D5] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A8E71]">
            <span>Total Staff</span>
            <Users className="w-4 h-4 text-[#5C5E4E]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1C1C1A] mt-1">{totalCount}</p>
          <span className="text-[10px] text-[#5C5E4E] font-medium">Across 6 departments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E1D5] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#4F6D4F]">
            <span>Active Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-[#4F6D4F]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#4F6D4F] mt-1">{activeCount}</p>
          <span className="text-[10px] text-[#4F6D4F] font-medium">Permitted login access</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E1D5] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#A64D4D]">
            <span>Disabled / Blocked</span>
            <XCircle className="w-4 h-4 text-[#A64D4D]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#A64D4D] mt-1">{inactiveCount}</p>
          <span className="text-[10px] text-[#A64D4D] font-medium">Login denied by GM</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E1D5] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#D4AF37]">
            <span>On Duty Today</span>
            <Clock className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1C1C1A] mt-1">{onDutyCount}</p>
          <span className="text-[10px] text-[#8A8E71]">Active shifts logged</span>
        </div>
      </div>

      {/* Directory Tab */}
      {subTab === 'directory' && (
        <div className="bg-white rounded-3xl border border-[#E5E1D5] shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-[#EBE8DE] bg-[#F9F8F3] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#8A8E71] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, ID (e.g. EMP1024), phone..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E1D5] rounded-xl text-xs text-[#1C1C1A] placeholder-[#8A8E71] focus:outline-none focus:border-[#5C5E4E]"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-[#E5E1D5] rounded-xl text-xs text-[#1C1C1A] focus:outline-none focus:border-[#5C5E4E]"
              >
                <option value="ALL">All Roles</option>
                <option value="CHEF">Chef (Kitchen)</option>
                <option value="WAITER">Waiter (Dining)</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="HOUSEKEEPING">Housekeeping</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="MANAGER">Manager</option>
                <option value="OWNER">Owner</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-[#E5E1D5] rounded-xl text-xs text-[#1C1C1A] focus:outline-none focus:border-[#5C5E4E]"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Accounts</option>
                <option value="INACTIVE">Deactivated Accounts</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F2EA] text-[#5C5E4E] uppercase text-[10px] tracking-wider font-semibold border-b border-[#EBE8DE]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Department & Shift</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Security / Last Login</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE8DE]">
                {filteredEmployees.map((emp) => {
                  const isInactive = emp.status === 'INACTIVE';
                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-[#F9F8F3] transition-colors ${
                        isInactive ? 'bg-[#FFF9F9] opacity-80' : ''
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isInactive
                                ? 'bg-[#FBEAEA] text-[#A64D4D]'
                                : 'bg-[#EBE8DE] text-[#5C5E4E]'
                            }`}
                          >
                            {emp.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-[#1C1C1A]">{emp.full_name}</span>
                              {emp.first_login && (
                                <span className="px-1.5 py-0.5 rounded bg-[#FFF0D4] text-[#975A16] font-bold text-[9px]">
                                  Temp Pass
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-[#8A8E71]">
                              ID: {emp.employee_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                            emp.role === 'CHEF'
                              ? 'bg-[#FFF2E6] text-[#B85D19]'
                              : emp.role === 'WAITER'
                              ? 'bg-[#EBF5FB] text-[#2980B9]'
                              : emp.role === 'RECEPTIONIST'
                              ? 'bg-[#EBF7EE] text-[#27AE60]'
                              : emp.role === 'HOUSEKEEPING'
                              ? 'bg-[#F5EEF8] text-[#8E44AD]'
                              : emp.role === 'MAINTENANCE'
                              ? 'bg-[#FEF9E7] text-[#B7950B]'
                              : 'bg-[#EAECEE] text-[#2C3E50]'
                          }`}
                        >
                          {emp.role}
                        </span>
                      </td>

                      {/* Department & Shift */}
                      <td className="py-3.5 px-4 text-[#5C5E4E]">
                        <p className="font-medium text-[11px]">{emp.department}</p>
                        <p className="text-[#8A8E71] text-[10px]">{emp.shift}</p>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-[#5C5E4E]">
                        <p className="flex items-center space-x-1 text-[11px]">
                          <Phone className="w-3 h-3 text-[#8A8E71]" />
                          <span>{emp.phone}</span>
                        </p>
                        <p className="flex items-center space-x-1 text-[10px] text-[#8A8E71] mt-0.5">
                          <Mail className="w-3 h-3 text-[#8A8E71]" />
                          <span>{emp.email}</span>
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isInactive ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#FBEAEA] text-[#A64D4D] font-bold text-[10px] border border-[#F2C0C0]">
                            <XCircle className="w-3 h-3" />
                            <span>INACTIVE (Blocked)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#27AE60] font-bold text-[10px] border border-[#CDEEDB]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </td>

                      {/* Security / Last Login */}
                      <td className="py-3.5 px-4 text-[#8A8E71] text-[11px]">
                        <p>Last login: {emp.last_login || 'Never'}</p>
                        <p className="text-[10px]">Created: {emp.created_at}</p>
                      </td>

                      {/* Administrative Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => setEditingEmp(emp)}
                            className="p-1.5 rounded-lg hover:bg-[#EBE8DE] text-[#5C5E4E] transition-colors"
                            title="Edit employee details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleResetPassword(emp)}
                            className="p-1.5 rounded-lg hover:bg-[#EBE8DE] text-[#D4AF37] transition-colors"
                            title="Generate new temporary password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active / Inactive */}
                          <button
                            onClick={() => handleToggleStatus(emp)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isInactive
                                ? 'bg-[#EBF7EE] text-[#27AE60] hover:bg-[#D4EED8]'
                                : 'bg-[#FFF0F0] text-[#A64D4D] hover:bg-[#FBEAEA]'
                            }`}
                            title={isInactive ? 'Re-enable account' : 'Disable account (Block login)'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[#8A8E71]">
                      No employee records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {subTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-[#E5E1D5] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EBE8DE] bg-[#F9F8F3] flex justify-between items-center">
            <div>
              <h4 className="font-serif font-bold text-sm text-[#1C1C1A]">
                Authentication & Security Activity Stream
              </h4>
              <p className="text-xs text-[#8A8E71]">
                Real-time record of employee logins, account provisioning, and credential revisions.
              </p>
            </div>
            <span className="text-xs font-mono text-[#5C5E4E] bg-[#EBE8DE] px-2.5 py-1 rounded-lg">
              Total Events: {auditLogs.length}
            </span>
          </div>

          <div className="divide-y divide-[#EBE8DE]">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-[#F9F8F3] transition-colors flex items-start space-x-3 text-xs">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    log.type === 'login'
                      ? 'bg-[#EBF7EE] text-[#27AE60]'
                      : log.type === 'security'
                      ? 'bg-[#FBEAEA] text-[#A64D4D]'
                      : log.type === 'account'
                      ? 'bg-[#EBF5FB] text-[#2980B9]'
                      : 'bg-[#F5F2EA] text-[#5C5E4E]'
                  }`}
                >
                  {log.type === 'login' && <ShieldCheck className="w-4 h-4" />}
                  {log.type === 'security' && <ShieldAlert className="w-4 h-4" />}
                  {log.type === 'account' && <UserPlus className="w-4 h-4" />}
                  {log.type === 'operation' && <Briefcase className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#1C1C1A]">
                      {log.action} —{' '}
                      <span className="text-[#5C5E4E]">{log.employee_name}</span>{' '}
                      <span className="font-mono text-[10px] text-[#8A8E71]">({log.employee_id} • {log.role})</span>
                    </p>
                    <span className="text-[10px] text-[#8A8E71] shrink-0 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#5C5E4E] mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Add New Employee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5E1D5] shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#EBE8DE]">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1C1C1A]">Create Employee Account</h3>
                <p className="text-xs text-[#8A8E71]">Generates new staff login and temporary password.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8A8E71] hover:text-[#1C1C1A] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FBEAEA] border border-[#F2C0C0] text-xs text-[#A64D4D] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs focus:outline-none focus:border-[#5C5E4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                    Role *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => handleRoleChange(e.target.value as EmployeeRole)}
                    className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs focus:outline-none focus:border-[#5C5E4E]"
                  >
                    <option value="CHEF">Chef (Kitchen)</option>
                    <option value="WAITER">Waiter (Dining & Room Service)</option>
                    <option value="RECEPTIONIST">Receptionist (Front Desk)</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="MAINTENANCE">Maintenance Engineer</option>
                    <option value="MANAGER">Duty Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#5C5E4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs focus:outline-none focus:border-[#5C5E4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                    Shift
                  </label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs focus:outline-none focus:border-[#5C5E4E]"
                  >
                    <option value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</option>
                    <option value="General (9 AM - 6 PM)">General (9 AM - 6 PM)</option>
                    <option value="Evening (2 PM - 10 PM)">Evening (2 PM - 10 PM)</option>
                    <option value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs focus:outline-none focus:border-[#5C5E4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C5E4E] uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="employee@aurapalms.com"
                  className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs focus:outline-none focus:border-[#5C5E4E]"
                />
              </div>

              <div className="p-3 bg-[#F5F2EA] rounded-2xl border border-[#E5E1D5]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#5C5E4E]">Temporary System Password</span>
                  <button
                    type="button"
                    onClick={() => setNewTempPass(`Aura@${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="text-[10px] text-[#D4AF37] font-semibold flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newTempPass}
                  onChange={(e) => setNewTempPass(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E1D5] rounded-xl text-xs font-mono font-bold text-[#1C1C1A]"
                />
                <p className="text-[10px] text-[#8A8E71] mt-1.5">
                  🔐 Employee will be prompted to update this temporary password upon their first login.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#EBE8DE]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E1D5] rounded-xl text-xs font-medium text-[#5C5E4E] hover:bg-[#F9F8F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#5C5E4E] hover:bg-[#47493D] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create & Issue Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Employee */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E5E1D5] shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#EBE8DE]">
              <h3 className="font-serif font-bold text-lg text-[#1C1C1A]">Edit Employee Details</h3>
              <button onClick={() => setEditingEmp(null)} className="text-[#8A8E71] hover:text-[#1C1C1A]">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5C5E4E] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingEmp.full_name}
                  onChange={(e) => setEditingEmp({ ...editingEmp, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[#5C5E4E] font-semibold mb-1">Role</label>
                <select
                  value={editingEmp.role}
                  onChange={(e) => setEditingEmp({ ...editingEmp, role: e.target.value as EmployeeRole })}
                  className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl"
                >
                  <option value="CHEF">Chef</option>
                  <option value="WAITER">Waiter</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="HOUSEKEEPING">Housekeeping</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5C5E4E] font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={editingEmp.department}
                  onChange={(e) => setEditingEmp({ ...editingEmp, department: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[#5C5E4E] font-semibold mb-1">Shift</label>
                <input
                  type="text"
                  value={editingEmp.shift}
                  onChange={(e) => setEditingEmp({ ...editingEmp, shift: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[#5C5E4E] font-semibold mb-1">Phone</label>
                <input
                  type="text"
                  value={editingEmp.phone}
                  onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#EBE8DE]">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-3 py-1.5 border border-[#E5E1D5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#5C5E4E] text-white font-bold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Temporary Password Issued Notice */}
      {tempPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#D4AF37] shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] text-[#D4AF37] mx-auto flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1C1C1A]">Credentials Ready</h3>
            <p className="text-xs text-[#8A8E71] mt-1">
              Provide these temporary credentials to <strong>{tempPassModal.name}</strong> ({tempPassModal.id}).
            </p>

            <div className="my-4 p-4 rounded-2xl bg-[#F9F8F3] border border-[#E5E1D5] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8A8E71]">Employee ID / Login:</span>
                <span className="font-mono font-bold text-[#1C1C1A]">{tempPassModal.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8A8E71]">Temp Password:</span>
                <span className="font-mono font-bold text-[#D4AF37] bg-white px-2 py-0.5 rounded border border-[#E5E1D5]">
                  {tempPassModal.pass}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleCopyPassword(`Login: ${tempPassModal.id}\nPassword: ${tempPassModal.pass}`)}
                className="w-full py-2.5 px-4 bg-[#5C5E4E] hover:bg-[#47493D] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                onClick={() => setTempPassModal(null)}
                className="w-full py-2 text-xs font-medium text-[#8A8E71] hover:text-[#1C1C1A]"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
