import { motion } from 'framer-motion';
import {
    Users, Calendar, Clock, AlertCircle,
    ArrowUpRight, Plus, FileText, CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const cn = (...inputs) => twMerge(clsx(inputs));

const Dashboard = ({ appMode }) => {
    const isCorp = appMode === 'corporate';
    // const theme = isCorp ? 'blue' : 'emerald';

    const nav = useNavigate();

    const navigate = (url) => {
        nav(url);
    }

    const chartData = isCorp
        ? [
            { name: 'Mon', value: 12 }, { name: 'Tue', value: 15 },
            { name: 'Wed', value: 18 }, { name: 'Thu', value: 14 },
            { name: 'Fri', value: 20 }, { name: 'Sat', value: 8 },
        ]
        : [
            { name: 'P1', value: 95 }, { name: 'P2', value: 88 },
            { name: 'P3', value: 70 }, { name: 'P4', value: 92 },
            { name: 'P5', value: 45 }, { name: 'P6', value: 60 },
        ];

    // Mock Stats based on Mode
    const stats = isCorp
        ? [
            { label: 'Total Employees', value: '42', icon: Users, change: '+3 this month' },
            { label: 'Active Shifts', value: '3/4', icon: Clock, change: 'Morning, Afternoon, Night' },
            { label: 'Roster Coverage', value: '98%', icon: CheckCircle2, change: 'Standard gap maintained' },
            { label: 'Pending Leaves', value: '2', icon: AlertCircle, change: 'Requires approval', alert: true },
        ]
        : [
            { label: 'Total Teachers', value: '18', icon: Users, change: 'All subjects covered' },
            { label: 'Periods Today', value: '8/8', icon: Calendar, change: 'No unassigned slots' },
            { label: 'Lab Utilization', value: '75%', icon: Clock, change: 'High demand for Physics' },
            { label: 'Conflicts', value: '0', icon: AlertCircle, change: 'Schedule is clean', alert: false },
        ];

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">

            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
                        {isCorp ? 'Corporate Overview' : 'Academic Dashboard'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Welcome back, Admin. Here is what's happening in <span className={cn("font-semibold", isCorp ? "text-blue-600" : "text-emerald-600")}>
                            {isCorp ? 'CorpSync' : 'Schedula'}
                        </span> today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                        <FileText className="w-4 h-4" /> Export Report
                    </button>
                    <button className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition",
                        isCorp ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
                    )} onClick={() => {navigate(isCorp ? '/corporate/roster' : '/academic/setup')}}>
                        <Plus className="w-4 h-4" /> {isCorp ? 'Add Employee' : 'New Schedule'}
                    </button>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn(
                                "p-2.5 rounded-xl",
                                stat.alert ? "bg-red-50 text-red-600" : (isCorp ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600")
                            )}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <h4 className="text-2xl font-bold text-gray-950 mt-1">{stat.value}</h4>
                        <p className={cn("text-xs mt-2", stat.alert ? "text-red-500 font-medium" : "text-gray-400")}>
                            {stat.change}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* 3. Main Content Area */}
            {/* 3. Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Primary Chart Section (Occupies 2 columns) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">
                            {isCorp ? 'Weekly Shift Distribution' : 'Average Class Occupancy'}
                        </h3>
                        <div className="flex gap-2">
                            <span className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-medium",
                                isCorp ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                            )}>
                                Live Data
                            </span>
                        </div>
                    </div>

                    {/* The Chart Container - Increased height to 400px for better visibility */}
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={isCorp ? 45 : 55}>
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={isCorp ? '#2563eb' : '#059669'}
                                            fillOpacity={0.8}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Right: Notifications / Recent Activity */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Notifications</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className={cn("w-2 h-2 mt-1.5 rounded-full shrink-0", isCorp ? "bg-blue-500" : "bg-emerald-500")} />
                                    <div>
                                        <p className="text-sm text-gray-800 font-medium">
                                            {isCorp ? 'New roster generated for April' : 'Teacher Mapping updated for Grade 10'}
                                        </p>
                                        <p className="text-xs text-gray-400">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className={cn(
                            "w-full mt-4 py-2 text-sm font-semibold rounded-xl transition",
                            isCorp ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        )}>
                            View All
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;