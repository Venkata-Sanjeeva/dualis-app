import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, FileDown, Inbox } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = process.env.REACT_APP_API_URL;

const RosterDashboard = () => {
    const [rosters, setRosters] = useState([]);
    const [selectedRosterId, setSelectedRosterId] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRosters = async () => {
            try {
                const response = await axios.get(`${API_URL}/roster/read/all`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = response.data.data;
                console.log("Fetched Rosters:", data);
                setRosters(data);
            } catch (err) {
                console.error("Error fetching rosters", err);
            }
        };
        fetchRosters();
    }, []);

    const handleRosterSelect = async (id) => {
        setLoading(true);
        setSelectedRosterId(id);
        try {
            const response = await axios.get(`${API_URL}/roster/generate/${id}/chart`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = response.data.data;
            console.log("Fetched Roster Chart Data:", data);
            setChartData(data);
        } catch (err) {
            console.error("Error fetching chart", err);
        } finally {
            setLoading(false);
        }
    };

    // PDF Generation Logic
    const downloadPDF = () => {
        const doc = new jsPDF('landscape');
        const title = `Roster Schedule: ${chartData.rosterId}`;

        doc.setFontSize(18);
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        const tableHeaders = [['Employee', ...chartData.dates.map(d => d.split('-')[2])]];

        const tableRows = chartData.rows.map(row => {
            const rowData = [row.empName];
            chartData.dates.forEach(date => {
                const status = row.dayStatus[date];
                rowData.push(status === 'SHIFT' ? 'S' : status === 'LEAVE' ? 'L' : '-');
            });
            return rowData;
        });

        autoTable(doc, {
            startY: 30,
            head: tableHeaders,
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
            didParseCell: (data) => {
                if (data.cell.text[0] === 'L') data.cell.styles.textColor = [220, 38, 38];
                if (data.cell.text[0] === 'S') data.cell.styles.fontStyle = 'bold';
            }
        });

        doc.save(`Roster_${chartData.rosterId}.pdf`);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'SHIFT': return 'bg-indigo-600 text-white shadow-sm';
            case 'LEAVE': return 'bg-red-500 text-white';
            case 'WEEKEND_OFF': return 'bg-gray-100 text-gray-400';
            default: return 'bg-white border border-gray-100 text-transparent';
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-indigo-600" /> Roster Dashboard
                </h1>
                {chartData && (
                    <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <FileDown size={18} className="text-indigo-600" /> Export PDF
                    </button>
                )}
            </div>

            {/* Empty State / Roster Selection */}
            {rosters.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center"
                >
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Inbox size={48} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700">No rosters available</h2>
                    <p className="text-gray-500 mt-2 max-w-xs">It looks like there haven't been any rosters created for your profile yet.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {rosters.map((ros) => (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            key={ros.rosterId}
                            onClick={() => handleRosterSelect(ros.rosterId)}
                            className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedRosterId === ros.rosterId ? 'border-indigo-500 bg-white shadow-md' : 'border-transparent bg-white shadow-sm'
                                }`}
                        >
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{ros.rosterId}</p>
                            <h3 className="text-lg font-semibold text-gray-800">{ros.rosterMonth} {ros.rosterYear}</h3>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Chart Logic */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-sm text-gray-500 font-medium">Building your roster chart...</p>
                    </div>
                ) : chartData && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                    >
                        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                            <table className="w-full text-left border-collapse bg-white">
                                <thead>
                                    <tr className="bg-gray-50/80">
                                        {/* Sticky Employee Name Column */}
                                        <th className="p-4 sticky left-0 bg-gray-50 z-30 border-b border-gray-200 min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center gap-2 text-gray-700 font-bold uppercase text-xs tracking-wider">
                                                <Users size={16} className="text-indigo-600" /> Employee Name
                                            </div>
                                        </th>

                                        {/* Dynamic Date Headers */}
                                        {chartData.dates.map((date) => {
                                            const dateObj = new Date(date);
                                            const isMonday = dateObj.getDay() === 1;
                                            return (
                                                <th
                                                    key={date}
                                                    className={`p-3 text-center border-b border-gray-200 min-w-[45px] ${isMonday ? 'border-l-2 border-l-indigo-200 bg-indigo-50/30' : ''
                                                        }`}
                                                >
                                                    <span className="block text-xs font-extrabold text-gray-800">{date.split('-')[2]}</span>
                                                    <span className="text-[10px] uppercase text-gray-400 font-bold">
                                                        {dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                                                    </span>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                <tbody>
                                    {chartData.rows.map((row, idx) => (
                                        <tr key={idx} className="group hover:bg-indigo-50/20 transition-colors">
                                            {/* Sticky Employee Name Cell */}
                                            <td className="p-4 sticky left-0 bg-white font-semibold text-gray-700 border-b border-gray-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-indigo-50/50">
                                                {row.empName}
                                            </td>

                                            {/* Status Cells */}
                                            {chartData.dates.map((date) => {
                                                const status = row.dayStatus[date];
                                                const isMonday = new Date(date).getDay() === 1;

                                                return (
                                                    <td
                                                        key={date}
                                                        className={`p-1.5 border-b border-gray-50 text-center ${isMonday ? 'border-l-2 border-l-indigo-100' : ''
                                                            }`}
                                                    >
                                                        <div
                                                            className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center text-[10px] font-black transition-transform hover:scale-110 cursor-default ${getStatusStyle(status)}`}
                                                            title={`${row.empName} | ${date} | ${status}`}
                                                        >
                                                            {status === 'SHIFT' ? 'S' : status === 'LEAVE' ? 'L' : ''}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-6 text-xs font-semibold text-gray-500 border-t border-gray-100">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-indigo-600 rounded"></span> SHIFT (S)</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded"></span> LEAVE (L)</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-200 rounded"></span> WEEK OFF</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RosterDashboard;