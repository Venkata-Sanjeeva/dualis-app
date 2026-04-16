import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react';

import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; // Don't forget the CSS!
import { Card, SectionHeader } from './CorporateRoster';

const LeaveModal = ({ employee, onClose, onSave }) => {
    const [selectedDates, setSelectedDates] = useState([]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md shadow-2xl">
                <SectionHeader 
                    icon={CalendarDays} 
                    title={`Leaves for ${employee.name}`} 
                    description="Select dates this employee is unavailable." 
                />
                
                <div className="py-4">
                    {/* Multi-date picker logic goes here */}
                    <Calendar 
                        mode="multiple" 
                        selected={selectedDates} 
                        onSelect={setSelectedDates}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2 text-gray-600 font-medium">Cancel</button>
                    <button 
                        onClick={() => onSave(employee.id, selectedDates)}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                    >
                        Save Leaves
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default LeaveModal;