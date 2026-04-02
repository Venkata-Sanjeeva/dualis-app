import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, User, CheckCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherMapping = () => {
    // Use real IDs for keys
    const classes = ['Class A', 'Class B', 'Class C', 'Class D', 'Class E'];
    const teachers = ['Teacher 1', 'Teacher 2', 'Teacher 3', 'Teacher 4', 'Teacher 5'];

    const [selectedClass, setSelectedClass] = useState(null); // String name
    const [selectedTeachers, setSelectedTeachers] = useState([]); // Array of strings
    const [generationStatus, setGenerationStatus] = useState(null); // null, 'generating', 'done'

    const nav = useNavigate();

    const handleToggleClass = (clsName) => {
        setSelectedClass(clsName === selectedClass ? null : clsName);
    };

    const handleToggleTeacher = (tName) => {
        setSelectedTeachers(prev =>
            prev.includes(tName) ? prev.filter(t => t !== tName) : [...prev, tName]
        );
    };

    const generateSheet = () => {
        if (!selectedClass || selectedTeachers.length === 0) return;
        setGenerationStatus('generating');
        console.log('Generating Sheet for:', { selectedClass, selectedTeachers });
        setTimeout(() => setGenerationStatus('done'), 1500); // Mimic delay
        nav('/academic/sheet'); // Navigate to the generated sheet page
    };

    const MultiSelectCard = ({ title, icon: Icon, description, children }) => (
        <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg"><Icon className="w-6 h-6" /></div>
                <div>
                    <h3 className="text-xl font-bold text-gray-950">{title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );

    const SelectableTag = ({ label, isSelected, onToggle }) => (
        <button
            onClick={onToggle}
            className={`px-4 py-2 rounded-xl text-sm border flex items-center gap-2 group transition-all duration-150 ${isSelected
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-inner'
                    : 'bg-white text-gray-800 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
                }`}
        >
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-white border-white' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            </div>
            {label}
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">

            {/* Page Header */}
            <div className="border-b border-gray-100 pb-6 mb-8 flex justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Map Teachers to Class</h1>
                    <p className="text-gray-600 mt-1.5 max-w-2xl">
                        Select a class and assign all necessary teachers to build its unique timetable.
                    </p>
                </div>
                <motion.button
                    onClick={generateSheet}
                    disabled={!selectedClass || selectedTeachers.length === 0}
                    animate={(selectedClass && selectedTeachers.length > 0) ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
                    className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white transition shadow-md whitespace-nowrap ${selectedClass && selectedTeachers.length > 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    {generationStatus === 'generating'
                        ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full" />
                        : <Zap className="w-5 h-5" />}
                    {generationStatus === 'generating' ? 'Mapping...' : generationStatus === 'done' ? 'Sheet Ready!' : 'Generate Sheet'}
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* SELECT CLASS - Single Choice */}
                <MultiSelectCard
                    title="Select Class"
                    icon={School}
                    description="Should select only one class at a time."
                >
                    {/* Validation Message (Matching Wireframe Error) */}
                    <AnimatePresence>
                        {!selectedClass && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-600 bg-red-50 p-2 rounded-md font-medium">
                                * Please select a class to proceed.
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <div className="flex flex-wrap gap-2.5 pt-2">
                        {classes.map(clsName => (
                            <SelectableTag
                                key={clsName}
                                label={clsName}
                                isSelected={selectedClass === clsName}
                                onToggle={() => handleToggleClass(clsName)}
                            />
                        ))}
                    </div>
                </MultiSelectCard>

                {/* SELECT TEACHERS - Multiple Choice */}
                <MultiSelectCard
                    title="Select Teachers"
                    icon={User}
                    description={`Selected: ${selectedTeachers.length} to map.`}
                >
                    <div className="flex flex-wrap gap-2.5 pt-2">
                        {teachers.map(tName => (
                            <SelectableTag
                                key={tName}
                                label={tName}
                                isSelected={selectedTeachers.includes(tName)}
                                onToggle={() => handleToggleTeacher(tName)}
                            />
                        ))}
                    </div>
                </MultiSelectCard>
            </div>
        </div>
    );
};

export default TeacherMapping;