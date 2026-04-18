import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, ShieldAlert, Zap, X, CalendarDays, Clock,
    ChevronDown, Search, Filter, Info, UserPlus, CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import axios from 'axios';
import LeaveModal from './LeaveModal';

const cn = (...inputs) => twMerge(clsx(inputs));

const API_URL = process.env.REACT_APP_API_URL;
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// --- Sub-components ---
const PremiumCard = ({ children, className, title, icon: Icon, description }) => (
    <div className={cn("bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-indigo-500/5 overflow-hidden", className)}>
        {(title || Icon) && (
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                    {Icon && <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Icon size={20} /></div>}
                    <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{title}</h3>
                        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                    </div>
                </div>
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-gray-700 ml-1 flex items-center gap-1.5">
            {Icon && <Icon size={14} className="text-gray-400" />}
            {label}
        </label>
        <input
            {...props}
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm"
        />
    </div>
);

// --- Main Component ---
const CorporateRoster = () => {
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth() + 1] || 'January');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [constraints, setConstraints] = useState({
        daysPerEmployee: '',
        offDaysPerRotation: '',
        consecutiveShiftGapHours: 11,
        includeWeekends: false,
        requireSeniorOnShift: true
    });

    const [activeShifts, setActiveShifts] = useState({ General: true, Morning: false, Afternoon: true, Night: false });
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [currentEmpForLeave, setCurrentEmpForLeave] = useState(null);

    const isValid = selectedEmployees.length > 0 && constraints.daysPerEmployee !== '';

    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${API_URL}/employees/read/all`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setAvailableEmployees(res?.data?.data || []);
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleCreateRoster = async () => {
        if (!isValid) return;
        setIsGenerating(true);
        const payload = {
            requireSeniorOnShift: constraints.requireSeniorOnShift,
            base: { selectedEmployees, selectedMonth, selectedYear: String(selectedYear) },
            constraints: {
                ...constraints,
                daysPerEmployee: Number(constraints.daysPerEmployee),
                offDaysPerRotation: Number(constraints.offDaysPerRotation)
            },
            shifts: activeShifts
        };

        try {
            await axios.post(`${API_URL}/roster/create`, payload, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // Handle success (toast)
        } catch (err) {
            console.error('Generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveLeaves = async (empId, selectedDates) => {
        const leaveRequests = selectedDates.map(obj => ({
            empId,
            leaveDate: format(obj.leaveDate, 'yyyy-MM-dd')
        }));

        try {
            const res = await axios.post(`${API_URL}/leaves/create/multiple`, leaveRequests, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.status === 201) setIsLeaveModalOpen(false);
        } catch (err) {
            console.error("Sync failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-wider text-xs uppercase">
                            <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                            Scheduling Engine v2
                        </div>
                        <h1 className="text-4xl font-black text-slate-950 tracking-tight">Roster Configuration</h1>
                        <p className="text-slate-500 max-w-xl text-lg">Assign teams, define constraints, and generate optimized labor-compliant schedules.</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!isValid || isGenerating}
                        onClick={handleCreateRoster}
                        className={cn(
                            "flex items-center gap-3 px-10 py-4 rounded-2xl font-bold transition-all shadow-2xl",
                            isValid ? "bg-indigo-600 text-white shadow-indigo-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={20} />}
                        {isGenerating ? "Processing..." : "Generate Roster"}
                    </motion.button>
                </header>

                <div className="grid grid-cols-12 gap-8">

                    {/* Left: Configuration */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">

                        {/* Team Selection */}
                        <PremiumCard
                            title="Team Assignment"
                            icon={Users}
                            description={`${selectedEmployees.length} employees currently in rotation`}
                        >
                            <div className="space-y-6">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value && !selectedEmployees.includes(e.target.value)) {
                                                setSelectedEmployees([...selectedEmployees, e.target.value]);
                                            }
                                        }}
                                        className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer font-medium"
                                    >
                                        <option value="" disabled>Add employee to this roster...</option>
                                        {availableEmployees.filter(e => !selectedEmployees.includes(e.empId)).map(e => (
                                            <option key={e.empId} value={e.empId}>{e.name} — {e.designation || 'Staff'}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>

                                <div className="min-h-[280px] bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
                                    <AnimatePresence mode="popLayout">
                                        {selectedEmployees.length === 0 ? (
                                            <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                                                <UserPlus size={48} className="mb-4 text-slate-300" />
                                                <p className="font-semibold text-slate-500">Your rotation is empty</p>
                                                <p className="text-xs">Search and add employees to begin scheduling</p>
                                            </div>
                                        ) : (
                                            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {selectedEmployees.map(id => {
                                                    const emp = availableEmployees.find(e => e.empId === id);
                                                    if (!emp) return null;
                                                    return (
                                                        <motion.div
                                                            key={id}
                                                            layout
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white">
                                                                    {emp.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                                                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{emp.designation || 'Staff'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => { setCurrentEmpForLeave(emp); setIsLeaveModalOpen(true); }}
                                                                    className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg"
                                                                >
                                                                    <CalendarDays size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedEmployees(selectedEmployees.filter(x => x !== id))}
                                                                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </PremiumCard>

                        {/* Shifts */}
                        <PremiumCard title="Shift Patterns" icon={Clock}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(activeShifts).map(([name, active]) => (
                                    <button
                                        key={name}
                                        onClick={() => setActiveShifts(p => ({ ...p, [name]: !p[name] }))}
                                        className={cn(
                                            "p-5 rounded-2xl border-2 transition-all text-left relative",
                                            active ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-100 text-slate-900 hover:border-indigo-200"
                                        )}
                                    >
                                        <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", active ? "text-indigo-200" : "text-slate-400")}>Shift</p>
                                        <p className="font-black text-xl">{name}</p>
                                        {active && <CheckCircle2 size={16} className="absolute top-4 right-4 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </PremiumCard>
                    </div>

                    {/* Right: Constraints */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">

                        <PremiumCard title="Timeframe" icon={CalendarDays} className="bg-indigo-900 text-white" titleClassName="text-white">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-indigo-300 uppercase">Month</label>
                                        <select
                                            value={selectedMonth}
                                            onChange={e => setSelectedMonth(e.target.value)}
                                            className="w-full bg-white/10 border-none rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-white/20"
                                        >
                                            {months.map(m => <option key={m} className="text-black">{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-indigo-300 uppercase">Year</label>
                                        <input
                                            type="number"
                                            value={selectedYear}
                                            onChange={e => setSelectedYear(e.target.value)}
                                            className="w-full bg-white/10 border-none rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-white/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </PremiumCard>

                        <PremiumCard title="Core Constraints" icon={ShieldAlert}>
                            <div className="space-y-6">
                                <InputField
                                    label="Days per Employee"
                                    type="number"
                                    placeholder="e.g. 22"
                                    value={constraints.daysPerEmployee}
                                    onChange={e => setConstraints({ ...constraints, daysPerEmployee: e.target.value })}
                                />
                                <InputField
                                    label="Weekdays Off (Rotation)"
                                    type="number"
                                    value={constraints.offDaysPerRotation}
                                    onChange={e => setConstraints({ ...constraints, offDaysPerRotation: e.target.value })}
                                />
                                <div className="pt-4 space-y-4 border-t border-slate-100">
                                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={constraints.includeWeekends}
                                            onChange={() => setConstraints({ ...constraints, includeWeekends: !constraints.includeWeekends })}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Include Weekends</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={constraints.requireSeniorOnShift}
                                            onChange={() => setConstraints({ ...constraints, requireSeniorOnShift: !constraints.requireSeniorOnShift })}
                                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Require Senior Staff</span>
                                    </label>
                                </div>
                            </div>
                        </PremiumCard>
                    </div>

                </div>
            </div>

            {/* Modal Integration */}
            {isLeaveModalOpen && currentEmpForLeave && (
                <LeaveModal
                    employee={currentEmpForLeave}
                    rosterDate={new Date(selectedYear, months.indexOf(selectedMonth), 1)}
                    onClose={() => setIsLeaveModalOpen(false)}
                    onSave={handleSaveLeaves}
                />
            )}
        </div>
    );
};

export default CorporateRoster;