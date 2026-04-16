import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { CalendarDays, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const LeaveModal = ({ employee, rosterDate, onClose, onSave }) => {

    const [selectedDates, setSelectedDates] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch existing leaves from Backend on Mount
    useEffect(() => {
        const fetchExistingLeaves = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${API_URL}/leaves/month/read/all/${employee.empId}?year=${format(rosterDate, 'yyyy')}&month=${format(rosterDate, 'MM')}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                // Assuming response.data.data is a list of LeaveResponse objects
                // We extract the date strings and convert them to JS Date objects
                const datesFromDB = response.data.data.map(leave => parseISO(leave.leaveDate));
                setSelectedDates(datesFromDB);
            } catch (err) {
                console.error("Error fetching leaves:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (employee?.empId) {
            fetchExistingLeaves();
        }
    }, [employee]);

    const toggleDate = (date) => {
        const exists = selectedDates.find(d => isSameDay(d, date));
        if (exists) {
            setSelectedDates(prev => prev.filter(d => !isSameDay(d, date)));
        } else {
            setSelectedDates(prev => [...prev, date]);
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
                <div className="px-6 text-center">
                    <span className="text-sm font-extrabold text-gray-900 tracking-tight">
                        {format(rosterDate, 'MMMM yyyy')}
                    </span>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <Calendar
                                // 1. Set the initial view to the roster month
                                activeStartDate={rosterDate}

                                // 2. Disable the "Prev" and "Next" buttons
                                showNavigation={false}

                                // 3. Disable dates that don't belong to this month
                                tileDisabled={({ date }) =>
                                    date.getMonth() !== rosterDate.getMonth()
                                }

                                onClickDay={toggleDate}
                                tileClassName={({ date }) =>
                                    selectedDates.find(d => isSameDay(d, date)) ? 'selected-date-tile' : null
                                }
                            />
                        )}
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