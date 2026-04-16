import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldAlert, Zap, X, CalendarDays, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import axios from 'axios';
import LeaveModal from './LeaveModal';

// Helper for conditional classes
const cn = (...inputs) => twMerge(clsx(inputs));

// Mock Data (Replace with API calls)
const availableEmployees = [
    { id: 'emp1', name: 'EMP1', role: 'Developer', isSenior: true },
    { id: 'emp2', name: 'EMP2', role: 'Designer', isSenior: false },
    { id: 'emp3', name: 'EMP3', role: 'Project Manager', isSenior: true },
    { id: 'emp4', name: 'EMP4', role: 'QA Lead', isSenior: true },
    { id: 'emp5', name: 'EMP5', role: 'Support', isSenior: false },
    { id: 'emp6', name: 'EMP6', role: 'Content Writer', isSenior: false },
];

const availableMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

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
    const [selectedEmployees, setSelectedEmployees] = useState(['emp1', 'emp3', 'emp4']);
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

    // Derivations
    const shiftsArray = Object.entries(activeShifts);
    const isValid = selectedEmployees.length > 0 && selectedMonth && daysPerEmployee;

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
                    <Card>
                        <SectionHeader icon={Users} title="Participating Employees" description={`Total selected: ${selectedEmployees.length}`} />
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-gray-700">Select existing employees (search enabled):</p>

                            <div className="flex flex-wrap gap-2.5 border border-gray-100 p-4 rounded-xl bg-gray-50/50 min-h-16">
                                <AnimatePresence>
                                    {selectedEmployees.map(empId => {
                                        const emp = availableEmployees.find(e => e.id === empId);
                                        return (
                                            <motion.div key={empId} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-sm font-medium group"
                                            >
                                                {emp.name}
                                                {emp.isSenior && <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" title="Senior Staff" />}

                                                {/* --- ADD THIS BUTTON HERE --- */}
                                                <button
                                                    onClick={() => {
                                                        setCurrentEmpForLeave(emp);
                                                        setIsLeaveModalOpen(true);
                                                    }}
                                                    className="ml-1 p-1 hover:bg-indigo-100 rounded-md transition text-indigo-400 hover:text-indigo-600"
                                                    title="Set Leave Dates"
                                                >
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                </button>
                                                {/* ---------------------------- */}

                                                <button onClick={() => setSelectedEmployees(prev => prev.filter(id => id !== empId))}>
                                                    <X className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition" />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                {/* Simplified dropdown adder (replace with searchable multiselect for real use) */}
                                <select defaultValue="" onChange={e => { if (e.target.value && !selectedEmployees.includes(e.target.value)) setSelectedEmployees(p => [...p, e.target.value]); e.target.value = ""; }} className="border-gray-200 rounded-full text-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1">
                                    <option value="" disabled>+ Add Employee</option>
                                    {availableEmployees.filter(e => !selectedEmployees.includes(e.id)).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
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
                    onClose={() => setIsLeaveModalOpen(false)}
                    onSave={handleSaveLeaves}
                />
            )}
        </div>

        // <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gray-50/30 min-h-screen font-sans">

        //     {/* Unified Header */}
        //     <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-8">
        //         <div className="flex items-center gap-4">
        //             <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
        //                 <Briefcase className="w-6 h-6 text-white" />
        //             </div>
        //             <div>
        //                 <h1 className="text-2xl font-black text-gray-900 tracking-tight">Roster Generator</h1>
        //                 <p className="text-sm text-gray-500 font-medium">Corporate Operations Management</p>
        //             </div>
        //         </div>

        //         <motion.button
        //             onClick={handleCreateRoster}
        //             disabled={!isValid || isGenerating}
        //             whileHover={isValid ? { scale: 1.02 } : {}}
        //             whileTap={isValid ? { scale: 0.98 } : {}}
        //             className={cn(
        //                 "flex items-center gap-2.5 px-8 py-3.5 rounded-[1.25rem] font-bold text-sm transition-all shadow-xl",
        //                 isValid
        //                     ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
        //                     : "bg-gray-200 text-gray-400 cursor-not-allowed"
        //             )}
        //         >
        //             {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        //             {isGenerating ? 'Processing...' : 'Generate Roster'}
        //         </motion.button>
        //     </header>

        //     {/* THE SINGLE FORM CONTAINER */}
        //     <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-2xl shadow-gray-200/40 overflow-hidden">

        //         <div className="p-8 md:p-12 space-y-12">

        //             {/* Step 1: Timeframe Selection */}
        //             <section className="relative">
        //                 <div className="flex items-center gap-3 mb-8">
        //                     <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black">01</span>
        //                     <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Scheduling Period</h3>
        //                 </div>

        //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
        //                     <div className="space-y-2">
        //                         <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Target Month</label>
        //                         <select
        //                             value={selectedMonth}
        //                             onChange={e => setSelectedMonth(e.target.value)}
        //                             className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
        //                         >
        //                             {availableMonths.map(m => <option key={m}>{m}</option>)}
        //                         </select>
        //                     </div>
        //                     <div className="space-y-2">
        //                         <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Fiscal Year</label>
        //                         <input
        //                             type="number"
        //                             value={selectedYear}
        //                             onChange={e => setSelectedYear(e.target.value)}
        //                             className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
        //                         />
        //                     </div>
        //                 </div>
        //             </section>

        //             {/* Step 2: Workforce Allocation */}
        //             <section>
        //                 <div className="flex items-center justify-between mb-8">
        //                     <div className="flex items-center gap-3">
        //                         <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black">02</span>
        //                         <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Workforce Selection</h3>
        //                     </div>

        //                     <select
        //                         defaultValue=""
        //                         onChange={e => { if (e.target.value && !selectedEmployees.includes(e.target.value)) setSelectedEmployees(p => [...p, e.target.value]); e.target.value = ""; }}
        //                         className="text-[11px] font-black bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl hover:bg-indigo-100 cursor-pointer border-none"
        //                     >
        //                         <option value="" disabled>+ ADD STAFF</option>
        //                         {availableEmployees.filter(e => !selectedEmployees.includes(e.id)).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        //                     </select>
        //                 </div>

        //                 <div className="flex flex-wrap gap-3 min-h-[100px] p-6 border-2 border-dashed border-gray-100 rounded-3xl">
        //                     <AnimatePresence mode="popLayout">
        //                         {selectedEmployees.map(empId => {
        //                             const emp = availableEmployees.find(e => e.id === empId);
        //                             return (
        //                                 <motion.div
        //                                     key={empId}
        //                                     layout
        //                                     initial={{ opacity: 0, scale: 0.9 }}
        //                                     animate={{ opacity: 1, scale: 1 }}
        //                                     exit={{ opacity: 0, scale: 0.9 }}
        //                                     className="flex items-center gap-2 bg-white border border-gray-200 pl-3 pr-2 py-2 rounded-2xl shadow-sm group hover:border-indigo-300 transition-all"
        //                                 >
        //                                     <div className={cn("w-2 h-2 rounded-full", emp.isSenior ? "bg-amber-400" : "bg-indigo-400")} />
        //                                     <span className="text-xs font-bold text-gray-700">{emp.name}</span>
        //                                     {emp.isSenior && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
        //                                     <button onClick={() => setSelectedEmployees(p => p.filter(id => id !== empId))} className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
        //                                         <X className="w-3.5 h-3.5" />
        //                                     </button>
        //                                 </motion.div>
        //                             );
        //                         })}
        //                     </AnimatePresence>
        //                     {selectedEmployees.length === 0 && (
        //                         <div className="w-full flex flex-col items-center justify-center text-gray-300 italic py-4">
        //                             <Users className="w-8 h-8 mb-2 opacity-20" />
        //                             <p className="text-xs font-medium">No employees assigned to this cycle</p>
        //                         </div>
        //                     )}
        //                 </div>
        //             </section>

        //             {/* Step 3: Shift Logic & Constraints */}
        //             <section>
        //                 <div className="flex items-center gap-3 mb-8">
        //                     <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black">03</span>
        //                     <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Operational Rules</h3>
        //                 </div>

        //                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        //                     <div className="space-y-2">
        //                         <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Working Days</label>
        //                         <div className="relative">
        //                             <input type="number" value={daysPerEmployee} onChange={e => setDaysPerEmployee(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/10" />
        //                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">DAYS</span>
        //                         </div>
        //                     </div>

        //                     <div className="space-y-2">
        //                         <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Rotation Off-Days</label>
        //                         <div className="relative">
        //                             <input type="number" value={offDaysPerRotation} onChange={e => setOffDaysPerRotation(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/10" />
        //                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">PER CYCLE</span>
        //                         </div>
        //                     </div>

        //                     <div className="space-y-2">
        //                         <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Min. Rest Period</label>
        //                         <div className="relative">
        //                             <input type="number" value={consecutiveShiftGapHours} onChange={e => setConsecutiveShiftGapHours(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/10" />
        //                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">HOURS</span>
        //                         </div>
        //                     </div>
        //                 </div>

        //                 {/* Binary Toggles */}
        //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        //                     <label className={cn("flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer", includeWeekends ? "border-indigo-600 bg-indigo-50/30" : "border-gray-100 bg-white hover:border-gray-200")}>
        //                         <div className="flex flex-col">
        //                             <span className="font-bold text-gray-900 text-sm">Weekend Operations</span>
        //                             <span className="text-[11px] text-gray-500 font-medium">Include Sat/Sun in normal rotation</span>
        //                         </div>
        //                         <input type="checkbox" checked={includeWeekends} onChange={() => setIncludeWeekends(!includeWeekends)} className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-0" />
        //                     </label>

        //                     <label className={cn("flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer", requireSeniorOnShift ? "border-amber-400 bg-amber-50/30" : "border-gray-100 bg-white hover:border-gray-200")}>
        //                         <div className="flex flex-col">
        //                             <span className="font-bold text-gray-900 text-sm flex items-center gap-2">Senior Lead Required <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /></span>
        //                             <span className="text-[11px] text-gray-500 font-medium">Guarantee 1+ senior staff per shift</span>
        //                         </div>
        //                         <input type="checkbox" checked={requireSeniorOnShift} onChange={() => setRequireSeniorOnShift(!requireSeniorOnShift)} className="w-5 h-5 rounded-lg border-gray-300 text-amber-500 focus:ring-0" />
        //                     </label>
        //                 </div>
        //             </section>
        //         </div>

        //         {/* Form Footer */}
        //         <div className="bg-gray-950 p-6 flex items-center justify-center gap-4">
        //             <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold tracking-widest uppercase">
        //                 <ShieldCheck className="w-4 h-4 text-indigo-400" />
        //                 Compliance-Validated Engine
        //             </div>
        //         </div>
        //     </div>
        // </div>

        // <div className="max-w-7xl mx-auto p-6 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900">

        //     {/* Modern, Lean Header */}
        //     <header className="mb-8 flex items-center justify-between gap-6 px-4 pb-6 border-b border-slate-200">
        //         <div className="flex items-center gap-4">
        //             <div className="bg-slate-900 p-2.5 rounded-xl shadow-lg shadow-slate-200">
        //                 <Briefcase className="w-5 h-5 text-white" />
        //             </div>
        //             <div>
        //                 <h1 className="text-xl font-black text-slate-950 tracking-tight">Generate Corporate Roster</h1>
        //                 <p className="text-sm text-slate-500 font-medium leading-relaxed">Operational Workforce Management & Assignment Console</p>
        //             </div>
        //         </div>

        //         <motion.button
        //             onClick={handleCreateRoster}
        //             disabled={!isValid || isGenerating}
        //             whileHover={isValid ? { scale: 1.02 } : {}}
        //             whileTap={isValid ? { scale: 0.98 } : {}}
        //             className={cn(
        //                 "flex items-center gap-2.5 px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl",
        //                 isValid
        //                     ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
        //                     : "bg-slate-200 text-slate-400 cursor-not-allowed"
        //             )}
        //         >
        //             {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
        //             {isGenerating ? 'Processing...' : 'Run Algorithm'}
        //         </motion.button>
        //     </header>

        //     {/* THE SINGLE UNIFIED FORM CONTAINER */}
        //     <div className="bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-100/70 overflow-hidden">

        //         {/* 1. Main Configuration Bar */}
        //         <div className="flex flex-col lg:flex-row items-stretch border-b border-slate-100">

        //             {/* TIME PERIOD SECTION */}
        //             <div className="p-8 flex items-center gap-8 bg-slate-50/50 border-r border-slate-100 min-w-[320px]">
        //                 <div className="flex flex-col gap-1.5 flex-1">
        //                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Target Period</span>
        //                     <div className="flex items-center gap-3">
        //                         <select
        //                             value={selectedMonth}
        //                             onChange={e => setSelectedMonth(e.target.value)}
        //                             className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
        //                         >
        //                             {availableMonths.map(m => <option key={m}>{m}</option>)}
        //                         </select>
        //                         <input
        //                             type="number"
        //                             value={selectedYear}
        //                             onChange={e => setSelectedYear(e.target.value)}
        //                             className="w-24 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20"
        //                         />
        //                     </div>
        //                 </div>
        //             </div>

        //             {/* RULES SECTION (Compact Number Fields) */}
        //             <div className="p-8 flex-1 flex flex-wrap items-center gap-x-12 gap-y-6">
        //                 <div className="flex flex-col gap-1.5">
        //                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Roster Logic</span>
        //                     <div className="flex items-center gap-10">
        //                         <div className="flex items-center gap-2">
        //                             <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Assign Days</label>
        //                             <input
        //                                 type="number"
        //                                 value={daysPerEmployee}
        //                                 onChange={e => setDaysPerEmployee(e.target.value)}
        //                                 className="w-16 bg-slate-100 border-none rounded-lg px-2.5 py-2 text-sm font-black text-center text-indigo-600"
        //                             />
        //                         </div>
        //                         <div className="flex items-center gap-2">
        //                             <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Rest Gap</label>
        //                             <div className="flex items-center bg-slate-100 rounded-lg px-1.5 gap-1">
        //                                 <input
        //                                     type="number"
        //                                     value={consecutiveShiftGapHours}
        //                                     onChange={e => setConsecutiveShiftGapHours(e.target.value)}
        //                                     className="w-12 bg-transparent border-none py-2 text-sm font-black text-center text-indigo-600 outline-none"
        //                                 />
        //                                 <span className="text-[10px] font-bold text-slate-400 pr-1">HRS</span>
        //                             </div>
        //                         </div>
        //                     </div>
        //                 </div>

        //                 {/* LOGIC TOGGLES (MODERN SWITCHES) */}
        //                 <div className="flex items-center gap-8 border-l border-slate-100 pl-12 pt-4 lg:pt-0">
        //                     <label className="flex items-center gap-2 cursor-pointer group">
        //                         <div className="relative">
        //                             <input
        //                                 type="checkbox"
        //                                 checked={includeWeekends}
        //                                 onChange={() => setIncludeWeekends(!includeWeekends)}
        //                                 className="peer sr-only"
        //                             />
        //                             <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-indigo-600 transition-colors" />
        //                             <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
        //                         </div>
        //                         <span className="text-sm font-bold text-slate-800">Weekends</span>
        //                     </label>

        //                     <label className="flex items-center gap-2 cursor-pointer group">
        //                         <div className="relative">
        //                             <input
        //                                 type="checkbox"
        //                                 checked={requireSeniorOnShift}
        //                                 onChange={() => setRequireSeniorOnShift(!requireSeniorOnShift)}
        //                                 className="peer sr-only"
        //                             />
        //                             <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-amber-500 transition-colors" />
        //                             <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
        //                         </div>
        //                         <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
        //                             Senior Presence <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
        //                         </span>
        //                     </label>
        //                 </div>
        //             </div>
        //         </div>

        //         {/* 2. Workforce Management Area (Integrated) */}
        //         <div className="p-10 bg-white">
        //             <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        //                 <div className="flex items-center gap-4">
        //                     <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-inner">
        //                         <Users className="w-6 h-6 text-indigo-600" />
        //                     </div>
        //                     <div>
        //                         <h3 className="text-xl font-bold text-slate-950">Participating Workforce Allocation</h3>
        //                         <p className="text-sm text-indigo-600 font-semibold">{selectedEmployees.length} staff assigned to this rotation</p>
        //                     </div>
        //                 </div>

        //                 <div className="relative group">
        //                     <select
        //                         defaultValue=""
        //                         onChange={e => { if (e.target.value && !selectedEmployees.includes(e.target.value)) setSelectedEmployees(p => [...p, e.target.value]); e.target.value = ""; }}
        //                         className="appearance-none bg-slate-900 text-white text-[11px] font-black px-6 py-3 rounded-xl pr-12 cursor-pointer hover:bg-slate-800 transition-colors shadow-lg"
        //                     >
        //                         <option value="" disabled>+ ADD STAFF MEMBER</option>
        //                         {availableEmployees.filter(e => !selectedEmployees.includes(e.id)).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        //                     </select>
        //                     <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none group-hover:text-white" />
        //                 </div>
        //             </div>

        //             <div className="flex flex-wrap gap-3 p-1 min-h-[120px]">
        //                 <AnimatePresence>
        //                     {selectedEmployees.map(empId => {
        //                         const emp = availableEmployees.find(e => e.id === empId);
        //                         return (
        //                             <motion.div
        //                                 key={empId}
        //                                 layout
        //                                 initial={{ opacity: 0, y: 10 }}
        //                                 animate={{ opacity: 1, y: 0 }}
        //                                 exit={{ opacity: 0, scale: 0.9 }}
        //                                 className="flex items-center gap-3 bg-slate-50 border border-slate-100 pl-4 pr-3 py-2.5 rounded-xl group hover:border-indigo-300 hover:bg-white transition-all shadow-sm"
        //                             >
        //                                 <div className={cn("w-2 h-2 rounded-full", emp.isSenior ? "bg-amber-500" : "bg-indigo-500")} />
        //                                 <span className="text-sm font-bold text-slate-700">{emp.name}</span>
        //                                 {emp.isSenior && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
        //                                 <button
        //                                     onClick={() => setSelectedEmployees(p => p.filter(id => id !== empId))}
        //                                     className="ml-2 p-1 rounded-md hover:bg-red-50 hover:text-red-500 text-slate-300 transition-colors"
        //                                 >
        //                                     <X className="w-3.5 h-3.5" />
        //                                 </button>
        //                             </motion.div>
        //                         )
        //                     })}
        //                 </AnimatePresence>
        //                 {selectedEmployees.length === 0 && (
        //                     <div className="w-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        //                         <Users className="w-12 h-12 text-slate-200 mb-3" />
        //                         <div className="text-sm font-bold text-slate-400">No staff members allocated yet</div>
        //                         <p className="text-xs text-slate-400 mt-1">Assign staff using the search bar above to begin roster generation</p>
        //                     </div>
        //                 )}
        //             </div>
        //         </div>
        //     </div>
        // </div>
    );
};

export default CorporateRoster;