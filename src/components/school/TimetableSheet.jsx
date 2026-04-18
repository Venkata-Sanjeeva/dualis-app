import { CalendarDays, Printer } from 'lucide-react';

const TimetableSheet = ({ className }) => {

    // Real timetable data would be fetched from API
    const periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
    const timings = ['8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM'];

    const mockScheduleData = {
        P1: ['Math (Dr.S)', 'English (Ms.L)', 'Physics (Mr.P)', 'Math (Dr.S)', 'History (Ms.C)', 'Math (Dr.S)', 'Free'],
        P2: ['Physics (Mr.P)', 'Math (Dr.S)', 'English (Ms.L)', 'Physics (Mr.P)', 'English (Ms.L)', 'Physics (Mr.P)', 'Free'],
        // ... continue the pattern
    };

    // const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">

            {/* Page Header */}
            <div className="border-b border-gray-100 pb-6 mb-8 flex justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Final Timetable Sheet</h1>
                    <p className="text-emerald-700 font-bold mt-1.5 flex gap-2.5 items-center bg-emerald-50 px-3 py-1.5 rounded-full inline-flex text-sm">
                        <CalendarDays className="w-5 h-5" />
                        Class Name: {className || 'Grade 10-A'}
                    </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-700 shadow-md">
                    <Printer className="w-4 h-4" />
                    Print / Export PDF
                </button>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-inner bg-gray-50/50 p-1">
                <table className="min-w-full text-sm">
                    <thead className="border-b border-gray-100 bg-white">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">Period</th>
                            {timings.map(t => (
                                <th key={t} className="px-5 py-4 text-left font-medium text-gray-500 whitespace-nowrap">{t}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {periods.map(p => (
                            <tr key={p} className="hover:bg-gray-50 bg-white">
                                <td className="px-6 py-5 font-bold text-gray-950 bg-gray-50/80 sticky left-0 shadow-inner">{p}</td>
                                {mockScheduleData[p] ? mockScheduleData[p].map((cell, index) => (
                                    <td key={index} className="px-5 py-5 text-gray-700 border-l border-gray-100 min-w-40 font-medium">
                                        {cell.split(' (').length > 1 ? (
                                            <div>
                                                {cell.split(' (')[0]}
                                                <span className="block text-xs text-gray-500 mt-1">({cell.split(' (')[1]}</span>
                                            </div>
                                        ) : cell}
                                    </td>
                                )) : Array(timings.length).fill(null).map((_, i) => <td key={i} className="px-5 py-5 border-l border-gray-100">--</td>)}
                            </tr>
                        ))}

                        {/* LUNCH BREAK - (Matching Wireframe Row) */}
                        <tr className="bg-emerald-50 text-center">
                            <td colSpan={1} className="p-3"></td>
                            <td colSpan={timings.length} className="px-6 py-4 font-bold text-emerald-800 tracking-wider">
                                12:00 PM - 1:00 PM (LUNCH BREAK)
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TimetableSheet;