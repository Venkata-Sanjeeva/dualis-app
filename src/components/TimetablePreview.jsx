import React, { useState } from 'react';

const TimetablePreview = () => {
  // Sample Data Structure
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM"];

  const [schedule, setSchedule] = useState({
    "Monday-09:00 AM": { subject: "Mathematics", teacher: "Mr. Sharma", room: "101" },
    "Monday-11:00 AM": { subject: "Physics", teacher: "Dr. Rao", room: "Lab A" },
    "Tuesday-10:00 AM": { subject: "English", teacher: "Ms. Priya", room: "102" },
    "Wednesday-09:00 AM": { subject: "Computer Science", teacher: "Mr. Gupta", room: "IT Lab" },
    "Friday-02:00 PM": { subject: "History", teacher: "Mrs. Reddy", room: "105" },
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-indigo-600 p-4">
          <h2 className="text-white text-xl font-bold">Class Timetable Generator — Preview</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 border-b border-r text-gray-600 font-semibold w-32">Time / Day</th>
                {days.map(day => (
                  <th key={day} className="p-4 border-b text-gray-600 font-semibold">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-r border-b font-medium text-gray-500 bg-gray-50 text-sm">
                    {slot}
                  </td>
                  {days.map(day => {
                    const session = schedule[`${day}-${slot}`];
                    return (
                      <td key={`${day}-${slot}`} className="p-2 border-b min-w-[150px] h-24">
                        {session ? (
                          <div className="bg-indigo-100 border-l-4 border-indigo-500 p-2 rounded shadow-sm h-full flex flex-col justify-center">
                            <span className="font-bold text-indigo-900 text-sm">{session.subject}</span>
                            <span className="text-xs text-indigo-700 mt-1">👤 {session.teacher}</span>
                            <span className="text-[10px] text-gray-500 uppercase mt-1">📍 Room {session.room}</span>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-100 h-full rounded flex items-center justify-center text-gray-300 text-xs italic">
                            Empty Slot
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-800 text-sm">Input Logic Check</h4>
          <p className="text-xs text-blue-700 mt-2">The 'Empty Slots' represent areas where your algorithm needs to fill based on teacher availability.</p>
        </div>
      </div>
    </div>
  );
};

export default TimetablePreview;