import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User, School, Clock3, Coffee } from 'lucide-react';

const Setup = () => {
    // Toggle state
    const [setupMode, setSetupMode] = useState('teachers'); // 'teachers' or 'class'

    // Form states (simplified)
    const [teacherForm, setTeacherForm] = useState({ name: '', subject: '', periods: '', duration: '', start: '', end: '', break: '', lunch: '' });
    const [classForm, setClassForm] = useState({ className: '', start: '', end: '', break: '', lunch: '', periodsPerDay: '', duration: '' });

    // Inside the Setup component:
    const handleTeacherChange = (e) => {
        const { id, value } = e.target;
        // We map the UI 'id' (like tName) to the state key (like name)
        const keyMap = { tName: 'name', tSubj: 'subject', tPer: 'periods', tDur: 'duration' };
        setTeacherForm(prev => ({ ...prev, [keyMap[id] || id]: value }));
    };

    const handleClassChange = (e) => {
        const { id, value } = e.target;
        const keyMap = { cName: 'className', cPer: 'periodsPerDay', cDur: 'duration' };
        setClassForm(prev => ({ ...prev, [keyMap[id] || id]: value }));
    };

    // Common UI components (can be extracted to separate files later)
    const FormField = ({ id, label, icon: Icon, description, children }) => (
        <div className="space-y-1.5">
            <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
                {label}
            </label>
            {description && <p className="text-xs text-gray-500 pb-1">{description}</p>}
            {children}
        </div>
    );

    const Input = (props) => (
        <input {...props} className={`block w-full px-4 py-2.5 border border-gray-200 rounded-xl sm:text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition ${props.className}`} />
    );

    const cardVariants = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">

            {/* Page Header */}
            <div className="border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                {/* Left Side: Titles */}
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Schedule Configuration</h1>
                    <p className="text-gray-600 mt-1.5 max-w-2xl">
                        Set up the base parameters for teachers and classes before generating your timetables.
                    </p>
                </div>

                {/* Right Side: Smaller Mode Switcher */}
                <div className="flex items-center border border-gray-100 rounded-xl p-1 bg-gray-50 w-fit shadow-inner">
                    {['teachers', 'class'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setSetupMode(mode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition ${setupMode === mode
                                ? 'bg-white text-emerald-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {mode === 'teachers' ? <User className="w-3.5 h-3.5" /> : <School className="w-3.5 h-3.5" />}
                            {mode === 'teachers' ? 'Teachers' : 'Classes'}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* <motion.div key={setupMode} initial="initial" animate="animate" exit="initial" variants={cardVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"> */}
                <motion.div key={setupMode} initial="initial" animate="animate" exit="initial" variants={cardVariants} className="d-flex justify-center">

                    {/* TEACHER SETUP MODE */}
                    {setupMode === 'teachers' && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-8 w-full">
                            {/* Header - Now inline to save space */}
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-950">Teacher Profile & Constraints</h3>
                                </div>
                                <p className="text-xs text-gray-400 hidden md:block">Configure work hours and load</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
                                {/* Primary Info - Row 1 (Spans all 3 columns on large screens) */}
                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField id="tName" label="Teacher Name">
                                        <Input id="tName" placeholder="Dr. Smith" value={teacherForm.name} onChange={handleTeacherChange} />
                                    </FormField>

                                    <FormField id="tSubj" label="Subject Name">
                                        <Input id="tSubj" placeholder="Quantum Physics" value={teacherForm.subject} onChange={handleTeacherChange} />
                                    </FormField>

                                    <FormField id="tPer" label="Periods Assigned">
                                        <Input id="tPer" type="number" placeholder="20" />
                                    </FormField>
                                </div>

                                {/* Wrapper to ensure horizontal alignment across both sections */}
                                <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-x-8 items-end">

                                    {/* Timing Section (Occupies 2/3 of the row) */}
                                    <div className="lg:col-span-2">
                                        <FormField
                                            label={
                                                <div className="flex items-center justify-start gap-3 w-full">
                                                    <div className="flex items-center gap-2">
                                                        <span>Daily Availability Timings</span>
                                                    </div>
                                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 whitespace-nowrap">
                                                        Work Day
                                                    </span>
                                                </div>
                                            }
                                            icon={Clock3}
                                        >
                                            <div className="flex gap-3 items-center">
                                                <Input type="time" defaultValue="08:00" className="flex-1" />
                                                <span className="text-gray-300 font-medium">to</span>
                                                <Input type="time" defaultValue="16:00" className="flex-1" />
                                            </div>
                                        </FormField>
                                    </div>

                                    {/* Durations Section (Occupies 1/3 of the row) */}
                                    <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                                        <FormField id="tDur" label={<div className="flex items-baseline gap-1"><span>Period</span><span className="text-[10px] text-gray-400">(min)</span></div>}>
                                            <Input id="tDur" type="number" placeholder="45" />
                                        </FormField>

                                        <FormField id="bDur" label={<div className="flex items-baseline gap-1"><span>Break</span><span className="text-[10px] text-gray-400">(min)</span></div>}>
                                            <Input id="bDur" type="number" placeholder="15" />
                                        </FormField>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions - Clean and Wide */}
                            <div className="pt-4 flex items-center gap-4">
                                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all active:scale-[0.98]">
                                    <Plus className="w-4 h-4" />
                                    Create Teacher Profile
                                </button>
                                <button className="px-6 py-3 rounded-xl font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                                    Clear Form
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CLASS SETUP MODE */}
                    {setupMode === 'class' && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-8 w-full">
                            {/* Header - Inline to match Teacher mode */}
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-50 text-teal-700 p-2 rounded-lg">
                                        <School className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-950">Add Class Schedule</h3>
                                </div>
                                <p className="text-xs text-gray-400 hidden md:block">Define class timing and break structure</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6 items-end">
                                {/* Row 1: Primary Info (Full Width) */}
                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField id="cName" label="Class Name">
                                        <Input id="cName" placeholder="Grade 10-A" />
                                    </FormField>

                                    <FormField id="cPer" label="Periods / Day">
                                        <Input id="cPer" type="number" placeholder="8" />
                                    </FormField>

                                    <FormField
                                        id="cDur"
                                        label={
                                            <div className="flex items-baseline gap-1">
                                                <span>Period Duration</span>
                                                <span className="text-[10px] text-gray-400">(min)</span>
                                            </div>
                                        }
                                    >
                                        <Input id="cDur" type="number" placeholder="40" />
                                    </FormField>
                                </div>

                                {/* Row 2: Timings & Breaks */}
                                <div className="lg:col-span-2">
                                    <FormField label="Class Day Timings" icon={Clock3}>
                                        <div className="flex gap-3 items-center">
                                            <Input type="time" defaultValue="08:30" className="flex-1" />
                                            <span className="text-gray-300 font-medium">to</span>
                                            <Input type="time" defaultValue="15:30" className="flex-1" />
                                        </div>
                                    </FormField>
                                </div>

                                <div className="lg:col-span-1">
                                    <FormField
                                        label={
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-semibold text-gray-900">Scheduled Breaks</span>
                                                <div className="flex gap-1.5">
                                                    <span className="text-[9px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                                        Class
                                                    </span>
                                                    <span className="text-[9px] uppercase tracking-wider font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                                                        Global
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                        icon={Coffee}
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Class-Specific Break Duration */}
                                            <div className="space-y-1">
                                                <div className="relative flex items-center">
                                                    <Input
                                                        type="number"
                                                        defaultValue="15"
                                                        className="pr-8 border-amber-200 focus:ring-amber-500"
                                                    />
                                                    <span className="absolute right-2.5 text-[10px] font-semibold text-amber-500 pointer-events-none">
                                                        min
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-amber-600 font-medium px-1 flex justify-between">
                                                    <span>Quick Break</span>
                                                </p>
                                            </div>

                                            {/* School-Wide Lunch Duration */}
                                            <div className="space-y-1">
                                                <div className="relative flex items-center">
                                                    <Input
                                                        type="number"
                                                        defaultValue="45"
                                                        className="pr-8 border-teal-200 focus:ring-teal-500"
                                                    />
                                                    <span className="absolute right-2.5 text-[10px] font-semibold text-teal-500 pointer-events-none">
                                                        min
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-teal-600 font-medium px-1">
                                                    School Lunch
                                                </p>
                                            </div>
                                        </div>
                                    </FormField>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="pt-4 flex items-center gap-4">
                                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-all active:scale-[0.98]">
                                    <Plus className="w-4 h-4" />
                                    Add Class Schedule
                                </button>
                                <button className="px-6 py-3 rounded-xl font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                                    Reset Fields
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Setup;