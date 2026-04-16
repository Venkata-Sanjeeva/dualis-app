import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldAlert, Zap, X, CalendarDays, Clock, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import axios from 'axios';
import LeaveModal from './LeaveModal';
import StatSkeleton from '../loaders/StatsSkeleton';

// Helper for conditional classes
const cn = (...inputs) => twMerge(clsx(inputs));

// const availableEmployees = [
//     { id: 'emp1', name: 'EMP1', role: 'Developer', isSenior: true },
//     { id: 'emp2', name: 'EMP2', role: 'Designer', isSenior: false },
//     { id: 'emp3', name: 'EMP3', role: 'Project Manager', isSenior: true },
//     { id: 'emp4', name: 'EMP4', role: 'QA Lead', isSenior: true },
//     { id: 'emp5', name: 'EMP5', role: 'Support', isSenior: false },
//     { id: 'emp6', name: 'EMP6', role: 'Content Writer', isSenior: false },
// ];

const availableMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getRosterDate = (monthName) => {
    const monthIndex = availableMonths.indexOf(monthName);
    const currentYear = new Date().getFullYear();
    // Create a date object for the 1st of that month
    return new Date(currentYear, monthIndex, 1);
};

// Reusable Components for consistency
export const Card = ({ children, className }) => (
    <div className={cn("bg-white p-6 rounded-2xl border border-gray-100 shadow-sm", className)}>
        {children}
    </div>
);

export const SectionHeader = ({ icon: Icon, title, description }) => (
    <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
        <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-xl font-semibold text-gray-950">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </div>
);

const LabeledInput = ({ id, label, description, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
        </label>
        {description && (
            <p className="text-xs text-gray-500 mb-2">{description}</p>
        )}
        {children}
    </div>
);

const API_URL = process.env.REACT_APP_API_URL;

// --- MAIN COMPONENT ---
const CorporateRoster = () => {
    // 1. Initial Data (From your wireframe)
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('January');
    const [daysPerEmployee, setDaysPerEmployee] = useState('');
    const [offDaysPerRotation, setOffDaysPerRotation] = useState('');
    const [activeShifts, setActiveShifts] = useState({ General: true, Morning: false, Afternoon: true, Night: false });

    // 2. Added Necessary Data (Missing Constraints)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [includeWeekends, setIncludeWeekends] = useState(false);
    const [consecutiveShiftGapHours, setConsecutiveShiftGapHours] = useState(11); // standard
    const [requireSeniorOnShift, setRequireSeniorOnShift] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

    // Derivations
    const shiftsArray = Object.entries(activeShifts);
    const isValid = selectedEmployees.length > 0 && selectedMonth && daysPerEmployee;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingEmployees(true);

            const res = await axios.get(`${API_URL}/employees/read/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }).catch(err => {
                console.error('Error fetching employees:', err);
                setIsLoadingEmployees(false);
            }).finally(() => setIsLoadingEmployees(false));

            setAvailableEmployees(res?.data?.data || []);
        };

        fetchData();
    }, [isValid]);

    const handleToggleShift = (shiftName) => {
        setActiveShifts(prev => ({ ...prev, [shiftName]: !prev[shiftName] }));
    };

    const handleCreateRoster = () => {
        if (!isValid) return;
        setIsGenerating(true);
        // Combine all data for backend
        const configPayload = {
            base: { selectedEmployees, selectedMonth, selectedYear },
            constraints: { daysPerEmployee, offDaysPerRotation, includeWeekends, consecutiveShiftGapHours },
            shifts: activeShifts,
            goals: { requireSeniorOnShift }
        };

        console.log('Sending Configuration to Backend:', configPayload);
        // Mimic API delay
        setTimeout(() => setIsGenerating(false), 2000);
    };

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [currentEmpForLeave, setCurrentEmpForLeave] = useState(null);

    const handleSaveLeaves = async (empId, selectedDates) => {
        // 1. Transform dates to yyyy-MM-dd format for your EmployeeLeaveRequest DTO
        const leaveRequests = selectedDates.map(date => ({
            empId: empId,
            leaveDate: format(date, 'yyyy-MM-dd')
        }));

        try {
            // 2. Point to your /create/multiple endpoint
            const response = await axios.post(`${API_URL}/leaves/create/multiple`, leaveRequests, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 201) {
                console.log("Leaves synced to DB:", response.data.message);
                setIsLeaveModalOpen(false);
                // Optional: Show a success toast here
            }
        } catch (err) {
            console.error("Backend sync failed:", err.response?.data || err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 bg-gray-50/50 min-h-screen">

            {/* Page Header */}
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Generate Corporate Roster</h1>
                    <p className="text-gray-600 mt-1.5 max-w-2xl">
                        Configure the employee assignment parameters for the upcoming period. Our algorithm will generate a compliant and optimized schedule.
                    </p>
                </div>
                <motion.button
                    onClick={handleCreateRoster}
                    disabled={!isValid || isGenerating}
                    animate={isValid && !isGenerating ? { scale: [1, 1.05, 1] } : {}}
                    transition={isValid ? { repeat: Infinity, repeatDelay: 3, duration: 0.6 } : {}}
                    className={cn(
                        "flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white transition duration-200",
                        isValid ? "bg-indigo-600 hover:bg-indigo-700 shadow-md" : "bg-gray-300 cursor-not-allowed"
                    )}
                >
                    {isGenerating ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full" />
                    ) : (
                        <Zap className="w-5 h-5" />
                    )}
                    {isGenerating ? 'Generating...' : 'Create Roster'}
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Setup & Employees */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Section 1: Setup Period */}
                    <Card>
                        <SectionHeader icon={CalendarDays} title="Setup Period" description="Define the timeframe for this roster." />
                        <div className="grid grid-cols-2 gap-6">
                            <LabeledInput id="month" label="Select Month">
                                <select id="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition">
                                    {availableMonths.map(month => <option key={month}>{month}</option>)}
                                </select>
                            </LabeledInput>
                            <LabeledInput id="year" label="Select Year" description="Crucial for date sync.">
                                <input id="year" type="number" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="mt-1 block w-full px-3 py-2.5 text-base border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition sm:text-sm" />
                            </LabeledInput>
                        </div>
                    </Card>

                    {/* Section 2: Employees */}
                    <Card className="overflow-hidden border-none shadow-lg ring-1 ring-gray-200">
                        {/* Header Section */}
                        <div className="bg-gray-50/80 p-6 border-b border-gray-100">
                            <SectionHeader
                                icon={Users}
                                title="Select Employees"
                                description={`Manage the team for this roster (${selectedEmployees.length} assigned)`}
                            />

                            {/* Clean Search/Select Bar */}
                            <div className="mt-4 flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val && !selectedEmployees.includes(val)) {
                                                setSelectedEmployees(prev => [...prev, val]);
                                            }
                                        }}
                                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>Search or select employee to add...</option>
                                        {availableEmployees
                                            .filter(e => !selectedEmployees.includes(e.empId))
                                            .map(e => <option key={e.empId} value={e.empId}>{e.name}</option>)
                                        }
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6">
                            <div className="min-h-[200px]">
                                <AnimatePresence mode="popLayout">
                                    {selectedEmployees.length > 0 ? (
                                        <motion.div
                                            layout
                                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                                        >
                                            {selectedEmployees.map((empId) => {
                                                const emp = availableEmployees.find((e) => e.empId === empId);
                                                if (!emp) return null;

                                                return (
                                                    <motion.div
                                                        key={empId}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="group relative flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all"
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                                                {emp.name.charAt(0)}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-sm font-semibold text-gray-800 truncate">{emp.name}</p>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                                                    {emp.designation || 'Staff'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCurrentEmpForLeave(emp);
                                                                    setIsLeaveModalOpen(true);
                                                                }}
                                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                                title="Leave Management"
                                                            >
                                                                <CalendarDays className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedEmployees(prev => prev.filter(id => id !== empId))}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </motion.div>
                                    ) : (
                                        /* Empty State */
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-2xl"
                                        >
                                            <div className="p-3 bg-gray-50 rounded-full mb-3">
                                                <Users className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 text-sm font-medium">No employees selected for this roster</p>
                                            <p className="text-gray-400 text-xs mt-1">Use the search bar above to begin.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </Card>

                    {/* Section 3: Shift Allocation */}
                    <Card>
                        <SectionHeader icon={Clock} title="Shift Allocation" description="Define active shift patterns." />
                        <p className="text-sm font-medium text-gray-700 mb-4">Select Shifts to Assign:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {shiftsArray.map(([name, isActive]) => (
                                <button key={name} onClick={() => handleToggleShift(name)} className={cn("relative group p-4 rounded-xl border transition-all text-center", isActive ? "bg-indigo-600 border-indigo-600 text-white shadow-inner" : "bg-white border-gray-200 hover:border-indigo-300 text-gray-900")}>
                                    {isActive && <motion.div layoutId="shiftCheck" className="absolute top-2 right-2 bg-white/20 p-1 rounded-full"><ShieldAlert className="w-4 h-4 text-white" /></motion.div>}
                                    <span className="block font-semibold text-lg">{name}</span>
                                    <span className={cn("text-xs", isActive ? "text-indigo-100" : "text-gray-500")}>9AM - 5PM</span>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Mandatory Constraints */}
                <div className="space-y-8">

                    {/* Section 4: Hard Constraints */}
                    <Card className="border-red-100 bg-red-50/20">
                        <SectionHeader icon={ShieldAlert} title="Constraints" description="Essential data for a valid roster." />
                        <div className="space-y-5">
                            <LabeledInput id="daysPerEmp" label="No of days for employee to assign:">
                                <input id="daysPerEmp" type="number" placeholder="e.g. 20" value={daysPerEmployee} onChange={e => setDaysPerEmployee(e.target.value)} className="mt-1 block w-full px-3 py-2 border-gray-200 rounded-lg sm:text-sm focus:ring-red-300" />
                            </LabeledInput>

                            <LabeledInput id="offDays" label="No of weekdays off for each rotation:">
                                <input id="offDays" type="number" placeholder="e.g. 2" value={offDaysPerRotation} onChange={e => setOffDaysPerRotation(e.target.value)} className="mt-1 block w-full px-3 py-2 border-gray-200 rounded-lg sm:text-sm focus:ring-red-300" />
                            </LabeledInput>

                            {/* Added: Gap rule */}
                            <LabeledInput id="shiftGap" label="Minimum Rest Period (Hours):" description="Usually 11 hours (labor law standard)">
                                <input id="shiftGap" type="number" step="0.5" value={consecutiveShiftGapHours} onChange={e => setConsecutiveShiftGapHours(e.target.value)} className="mt-1 block w-full px-3 py-2 border-gray-200 rounded-lg sm:text-sm focus:ring-red-300" />
                            </LabeledInput>

                            {/* Added: Weekend rule */}
                            <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-100">
                                <input id="weekends" type="checkbox" checked={includeWeekends} onChange={() => setIncludeWeekends(!includeWeekends)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition" />
                                <label htmlFor="weekends" className="text-sm text-gray-700">Include Weekends in normal rotation?</label>
                            </div>
                        </div>
                    </Card>

                    {/* Section 5: Coverage Goals */}
                    <Card>
                        <SectionHeader icon={Zap} title="Coverage Goals" description="Optional optimization parameters." />
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <input id="requireSenior" type="checkbox" checked={requireSeniorOnShift} onChange={() => setRequireSeniorOnShift(!requireSeniorOnShift)} className="h-5 w-5 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition" />
                            <div className="text-sm">
                                <label htmlFor="requireSenior" className="font-medium text-gray-800">Ensure Senior Staff Presence</label>
                                <p className="text-gray-500 text-xs mt-0.5">Every shift must have at least one employee marked with a shield <ShieldAlert className="inline w-3 h-3 text-indigo-400" /> icon.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal Logic */}
            {isLeaveModalOpen && currentEmpForLeave && (
                <LeaveModal
                    employee={currentEmpForLeave}
                    rosterDate={getRosterDate(selectedMonth)}
                    onClose={() => setIsLeaveModalOpen(false)}
                    onSave={handleSaveLeaves}
                />
            )}
        </div>
    );
};

export default CorporateRoster;