import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpenText, Menu, X, ChevronDown, LayoutGrid, Zap,
    TableProperties, Briefcase, Building2, Users
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ appMode, setAppMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem('token');

    // 1. Generic Project Name Configuration
    const GENERIC_NAME = "Dualis"; // Set your generic name here
    const GENERIC_COLOR = "from-slate-600 to-slate-800"; // Neutral color for logged out

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/welcome');
        window.location.reload();
    };

    const handleModeSwitch = (newMode) => {
        const currentPath = location.pathname;
        if (currentPath.includes('/academic') && newMode === 'corporate') {
            alert("Please return to the Dashboard before switching to Corporate mode.");
            return;
        }
        if (currentPath.includes('/corporate') && newMode === 'school') {
            alert("Please return to the Dashboard before switching to Schooling mode.");
            return;
        }
        setAppMode(newMode);
    };

    const navLinks = appMode === 'corporate'
        ? [
            { name: 'Dashboard', icon: LayoutGrid, href: '/' },
            { name: 'Roster Planner', icon: Briefcase, href: '/corporate/roster' },
            { name: 'Employees', icon: Users, href: '/corporate/employees' },
        ]
        : [
            { name: 'Dashboard', icon: LayoutGrid, href: '/' },
            { name: 'Configure', icon: Zap, href: '/academic/setup' },
            { name: 'Mapping', icon: TableProperties, href: '/academic/mapping' },
        ];

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    <div className="flex items-center gap-8">
                        {/* --- DYNAMIC LOGO SECTION --- */}
                        <div 
                            onClick={() => navigate('/')} 
                            className="flex-shrink-0 flex items-center gap-2.5 group cursor-pointer"
                        >
                            <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                                !isLoggedIn ? 'bg-slate-800' : // Neutral icon background when logged out
                                appMode === 'corporate' ? 'bg-blue-600' : 'bg-emerald-600'
                            }`}>
                                {!isLoggedIn ? (
                                    <LayoutGrid className="w-5 h-5 text-white" /> // Neutral icon
                                ) : appMode === 'corporate' ? (
                                    <Building2 className="w-5 h-5 text-white" />
                                ) : (
                                    <BookOpenText className="w-5 h-5 text-white" />
                                )}
                            </div>
                            
                            <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r tracking-tight transition-all duration-500 ${
                                !isLoggedIn ? GENERIC_COLOR : 
                                appMode === 'corporate' ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-600'
                            }`}>
                                {/* Logic: Show Generic name if not logged in, otherwise show Mode name */}
                                {!isLoggedIn ? GENERIC_NAME : (appMode === 'corporate' ? 'CorpSync' : 'Schedula')}
                            </span>
                        </div>

                        {isLoggedIn && (
                            <>
                                {/* --- THE MODE TOGGLE --- */}
                                {/* Added 'flex' for all screens and 'mx-2' for some breathing room on mobile */}
                                <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 mx-2 sm:mx-0">
                                    <button
                                        onClick={() => handleModeSwitch('school')}
                                        className={`flex-1 px-2 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-all ${appMode === 'school' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        SCHOOLING
                                    </button>
                                    <button
                                        onClick={() => handleModeSwitch('corporate')}
                                        className={`flex-1 px-2 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-all ${appMode === 'corporate' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        CORPORATE
                                    </button>
                                </div>

                                <div className="hidden md:flex md:space-x-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.href} // Change 'href' to 'to'
                                            className="flex items-center gap-2 px-3 py-2 ...">
                                            <link.icon className="w-4 h-4" />
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Side: Auth State */}
                    <div className="flex items-center gap-4">
                        {!isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">Sign In</Link>
                                <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg transition-all">
                                    Get Started
                                </Link>
                            </div>
                        ) : (
                            <div className="relative">
                                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-sm">AD</div>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2.5 z-50">
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin Settings</button>
                                            <hr className="my-1.5 border-gray-100" />
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="flex items-center md:hidden">
                            <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 rounded-lg text-gray-600 hover:bg-gray-50">
                                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {/* Main Navigation Links */}
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.name}
                                </a>
                            ))}

                            {/* --- NEW: MOBILE PROFILE SECTION --- */}
                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                                        AD
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Admin User</p>
                                        <p className="text-xs text-gray-500">admin@schedula.com</p>
                                    </div>
                                </div>
                                <div className="space-y-1 mt-2">
                                    <a href="#profile" className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-emerald-50 rounded-xl">
                                        Admin Settings
                                    </a>
                                    <a href="#logout" className="block px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl">
                                        Sign out
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;