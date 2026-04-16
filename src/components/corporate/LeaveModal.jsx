import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay } from 'date-fns';
import { CalendarDays, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-calendar/dist/Calendar.css';

const LeaveModal = ({ employee, onClose, onSave }) => {
    const [selectedDates, setSelectedDates] = useState([]);

    const toggleDate = (date) => {
        const exists = selectedDates.find(d => isSameDay(d, date));
        if (exists) {
            setSelectedDates(prev => prev.filter(d => !isSameDay(d, date)));
        } else {
            setSelectedDates(prev => [...prev, date].sort((a, b) => a - b));
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Set Leave Dates</h3>
                            <p className="text-xs text-indigo-600 font-medium">{employee.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition shadow-sm">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Calendar Body */}
                <div className="p-6">
                    <div className="custom-calendar-container">
                        <Calendar
                            onClickDay={toggleDate}
                            tileClassName={({ date }) => {
                                if (selectedDates.find(d => isSameDay(d, date))) {
                                    return 'selected-date-tile';
                                }
                                return null;
                            }}
                        />
                    </div>

                    {/* Selected Summary Area */}
                    <div className="mt-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Selected ({selectedDates.length})</p>
                        <div className="flex flex-wrap gap-2 min-h-8">
                            <AnimatePresence>
                                {selectedDates.map(date => (
                                    <motion.span
                                        key={date.toISOString()}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100"
                                    >
                                        {format(date, 'MMM dd')}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => toggleDate(date)} />
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        disabled={selectedDates.length === 0}
                        onClick={() => onSave(employee.empId, selectedDates)}
                        className="flex-1 bg-indigo-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Selection
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LeaveModal;