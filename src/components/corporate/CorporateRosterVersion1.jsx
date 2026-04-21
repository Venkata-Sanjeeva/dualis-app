import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, ShieldAlert, Zap, CalendarDays, Clock, Plus, Trash2, Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import axios from 'axios';
import LeaveModal from './LeaveModal';

const cn = (...inputs) => twMerge(clsx(inputs));
const API_URL = process.env.REACT_APP_API_URL;

// --- Sub-components ---
const PremiumCard = ({ children, className, title, icon: Icon, description, titleClassName }) => (
    <div className={cn("bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden", className)}>
        {(title || Icon) && (
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {Icon && <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Icon size={18} /></div>}
                    <div>
                        <h3 className={cn("font-bold text-slate-900", titleClassName)}>{title}</h3>
                        {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
                    </div>
                </div>
            </div>
        )}
        <div className="p-8">{children}</div>
    </div>
);

const InputField = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <input
            {...props}
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm font-medium"
        />
    </div>
);

const CorporateRosterVersion1 = () => {
    const today = new Date();
    // --- State ---
    const [rosterStartDate, setRosterStartDate] = useState(format(today, 'yyyy-MM-dd'));
    const [rosterEndDate, setRosterEndDate] = useState(format(today.setDate(today.getDate() + 7), 'yyyy-MM-dd')); // Default to 1 week later
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]); // IDs
    const [seniorEmployees, setSeniorEmployees] = useState([]); // IDs

    const [constraints, setConstraints] = useState({
        daysPerEmployee: '',
        offDaysPerRotation: '',
        includeWeekends: false,
        requireSeniorOnShift: false
    });

    const [shifts, setShifts] = useState([
        { id: '1', name: 'Morning', start: '08:00', end: '16:00', active: true },
        { id: '2', name: 'Afternoon', start: '16:00', end: '00:00', active: true },
        { id: '3', name: 'Night', start: '00:00', end: '08:00', active: false }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [currentEmpForLeave, setCurrentEmpForLeave] = useState(null);

    const isValid = selectedEmployees.length > 0 && constraints.daysPerEmployee !== '' && constraints.offDaysPerRotation !== '' && (!constraints.requireSeniorOnShift || seniorEmployees.length > 0);

    // validate senior staff array if the senior staff checkbox is checked and the employees aren't selected
    useEffect(() => {
        if (constraints.requireSeniorOnShift && selectedEmployees.length === 0) {
            // Show an error or take some action
            console.error("Senior staff is required but not selected.");
        }
    }, [constraints.requireSeniorOnShift, selectedEmployees]);

    useEffect(() => {
        const fetchEmployees = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${API_URL}/employees/v1/read/all`, {
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

    // --- Actions ---
    const addCustomShift = () => {
        const newShift = { id: Date.now().toString(), name: 'New Shift', start: '09:00', end: '17:00', active: true };
        setShifts([...shifts, newShift]);
    };

    const updateShift = (id, field, value) => {
        setShifts(shifts.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const toggleSenior = (id) => {
        setSeniorEmployees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleGenerateSchedule = async () => {
        setIsGenerating(true);
        
        // Construct the payload based on your states
        const payload = {
            startDate: rosterStartDate,
            endDate: rosterEndDate,
            employeeIds: selectedEmployees,
            seniors: seniorEmployees,
            shifts: shifts.filter(s => s.active),
            constraints
        };

        console.log("Generating with payload:", payload);

        try {
            // Simulate or call your generation API
            await axios.post(`${API_URL}/roster/v1/create`, payload, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // await new Promise(resolve => setTimeout(resolve, 2000)); // Demo delay
            console.log("Schedule Generated:", payload);
            alert("Roster generated successfully!");
        } catch (err) {
            console.error("Generation failed", err);
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
            const res = await axios.post(`${API_URL}/leaves/v1/create/multiple`, leaveRequests, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.status === 201) setIsLeaveModalOpen(false);
        } catch (err) {
            console.error("Sync failed:", err);
        }
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-[#F8FAFF] p-6 lg:p-12">
            {isLoading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
                    <p className="text-slate-600 font-bold animate-pulse">Initializing Roster Engine...</p>
                </div>
            )}

            <div className={cn("max-w-7xl mx-auto space-y-8 transition-opacity duration-300", isGenerating && "opacity-70 pointer-events-none")}>
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Roster Engine</h1>
                        <p className="text-slate-500 font-medium">Configure team rotations and shift constraints.</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGenerateSchedule}
                        disabled={!isValid || isGenerating}
                        className={cn(
                            "px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg transition-all min-w-[200px] justify-center",
                            isValid && !isGenerating ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Zap size={18} />
                                <span>Generate Schedule</span>
                            </>
                        )}
                    </motion.button>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Side */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        
                        <PremiumCard title="Personnel Assignment" icon={Users} description={`${selectedEmployees.length} active in roster`}>
                            {availableEmployees.length === 0 && !isLoading ? (
                                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                    <p className="text-slate-400 text-sm">No employees found in database.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {availableEmployees.map(emp => {
                                        const isSelected = selectedEmployees.includes(emp.empId);
                                        return (
                                            <motion.div 
                                                layout
                                                key={emp.empId}
                                                onClick={() => setSelectedEmployees(prev => isSelected ? prev.filter(id => id !== emp.empId) : [...prev, emp.empId])}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-2 relative",
                                                    isSelected ? "border-blue-600 bg-blue-50/50" : "border-slate-50 hover:border-slate-200 bg-white"
                                                )}
                                            >
                                                {/* ... Card Content ... */}
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold", isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-bold truncate">{emp.name}</p>
                                                        <p className="text-[9px] text-slate-400 uppercase font-bold">{emp.designation || 'Staff'}</p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentEmpForLeave(emp);
                                                            setIsLeaveModalOpen(true);
                                                        }}
                                                        className="absolute top-2 right-2 p-1 bg-white rounded-md text-blue-600 shadow-sm border border-blue-100 transition-colors"
                                                    >
                                                        <Calendar size={12} />
                                                    </button>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </PremiumCard>

                        {/* 2. Dynamic Shifts */}
                        <PremiumCard 
                            title="Shift Configuration" 
                            icon={Clock}
                            description="Customize shift timings or add custom slots"
                        >
                            <div className="space-y-4">
                                {shifts.map((shift) => (
                                    <div key={shift.id} className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input 
                                            type="checkbox"
                                            checked={shift.active}
                                            onChange={(e) => updateShift(shift.id, 'active', e.target.checked)}
                                            className="w-5 h-5 accent-blue-600"
                                        />
                                        <input 
                                            value={shift.name}
                                            onChange={(e) => updateShift(shift.id, 'name', e.target.value)}
                                            className="bg-transparent font-bold text-sm focus:outline-none border-b border-transparent focus:border-blue-300 min-w-[100px]"
                                        />
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                                            <Clock size={14} className="text-slate-400" />
                                            <input type="time" value={shift.start} onChange={(e) => updateShift(shift.id, 'start', e.target.value)} className="text-xs font-medium outline-none" />
                                            <span className="text-slate-300">-</span>
                                            <input type="time" value={shift.end} onChange={(e) => updateShift(shift.id, 'end', e.target.value)} className="text-xs font-medium outline-none" />
                                        </div>
                                        <button 
                                            onClick={() => setShifts(shifts.filter(s => s.id !== shift.id))}
                                            className="ml-auto p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={addCustomShift}
                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:bg-slate-50 hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Add Custom Shift
                                </button>
                            </div>
                        </PremiumCard>
                    </div>

                    {/* Right Side */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        
                        {/* Dates & Timeframe */}
                        <PremiumCard title="Roster Period" icon={CalendarDays} className="bg-slate-900 text-white" titleClassName="text-white">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
                                    <input 
                                        type="date" 
                                        value={rosterStartDate} 
                                        onChange={(e) => setRosterStartDate(e.target.value)}
                                        className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End Date</label>
                                    <input 
                                        type="date" 
                                        value={rosterEndDate} 
                                        onChange={(e) => setRosterEndDate(e.target.value)}
                                        className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                            </div>
                        </PremiumCard>

                        {/* Senior Staff Selection */}
                        <PremiumCard title="Senior Personnel" icon={ShieldAlert}>
                            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {selectedEmployees.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Select employees to assign seniority...</p>
                                ) : (
                                    availableEmployees.filter(e => selectedEmployees.includes(e.empId)).map(emp => (
                                        <label key={emp.empId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                                            <span className="text-xs font-bold text-slate-700">{emp.name}</span>
                                            <input 
                                                type="checkbox" 
                                                checked={seniorEmployees.includes(emp.empId)}
                                                onChange={() => toggleSenior(emp.empId)}
                                                className="w-4 h-4 rounded accent-blue-600"
                                            />
                                        </label>
                                    ))
                                )}
                            </div>
                        </PremiumCard>

                        {/* Constraints */}
                        <PremiumCard title="Core Rules" icon={Zap}>
                            <div className="space-y-5">
                                <InputField 
                                    label="Days per Employee" 
                                    type="number" 
                                    value={constraints.daysPerEmployee}
                                    onChange={(e) => setConstraints({...constraints, daysPerEmployee: e.target.value})}
                                />

                                <InputField 
                                    label="Off Days per Rotation" 
                                    type="number" 
                                    value={constraints.offDaysPerRotation}
                                    onChange={(e) => setConstraints({...constraints, offDaysPerRotation: e.target.value})}
                                />

                                <div className="pt-4 space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={constraints.includeWeekends}
                                            onChange={(e) => setConstraints({...constraints, includeWeekends: e.target.checked})}
                                            className="w-5 h-5 accent-blue-600"
                                        />
                                        <span className="text-xs font-bold text-slate-600">Include Weekends</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={constraints.requireSeniorOnShift}
                                            onChange={(e) => setConstraints({...constraints, requireSeniorOnShift: e.target.checked})}
                                            className="w-5 h-5 accent-blue-600"
                                        />
                                        <span className="text-xs font-bold text-slate-600">Ensure Senior Presence</span>
                                    </label>
                                </div>
                            </div>
                        </PremiumCard>
                    </div>
                </div>
            </div>

            {/* Leave Modal Integration */}
            {isLeaveModalOpen && currentEmpForLeave && (
                <LeaveModal
                    isOpen={isLeaveModalOpen}
                    employee={currentEmpForLeave}
                    // Passing the start date of the roster to the calendar popup
                    rosterDate={new Date(rosterStartDate)}
                    onClose={() => setIsLeaveModalOpen(false)}
                    onSave={handleSaveLeaves}
                />
            )}
        </div>
    );
};

export default CorporateRosterVersion1;