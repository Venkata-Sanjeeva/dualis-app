import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Schooling Components
import Setup from './components/school/SchedulingSetup';
import TeacherMapping from './components/school/TeacherMapping';
import TimetableSheet from './components/school/TimetableSheet';

// Corporate Components
// import CorporateRoster from './components/corporate/CorporateRoster'
import Dashboard from './components/Dashboard';

import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/pages/LoginPage';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/pages/RegisterPage';
import TimetableCreator from './components/TimetableCreator';
import TimetablePreview from './components/TimetablePreview';
import EmployeesPage from './components/corporate/EmployeesPage';
import RosterChart from './components/corporate/RosterChart';
import CorporateRosterVersion1 from './components/corporate/CorporateRosterVersion1';

const App = () => {
    const [appMode, setAppMode] = useState('school');

    return (
        <Router>
            <div className={`min-h-screen transition-colors duration-500 ${
                appMode === 'corporate' ? 'bg-slate-50' : 'bg-emerald-50/30'
            }`}>
                
                {/* Navbar only shows if authenticated (optional check) */}
                <Navbar appMode={appMode} setAppMode={setAppMode} />
                
                <Routes>
                    {/* Public Routes */}
                    <Route path="/welcome" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/timetable-creator" element={<TimetableCreator />} />
                    <Route path="/timetable-preview" element={<TimetablePreview />} />

                    {/* Protected Global Route */}
                    <Route path="/" element={
                        <ProtectedRoute appMode={appMode}>
                            <Dashboard appMode={appMode} />
                        </ProtectedRoute>
                    } />

                    {/* Protected Schooling Routes */}
                    <Route path="/academic/*" element={
                        <ProtectedRoute appMode={appMode} requiredMode="school">
                            <Routes>
                                <Route path="setup" element={<Setup />} />
                                <Route path="mapping" element={<TeacherMapping />} />
                                <Route path="sheet" element={<TimetableSheet />} />
                            </Routes>
                        </ProtectedRoute>
                    } />

                    {/* Protected Corporate Routes */}
                    <Route path="/corporate/*" element={
                        <ProtectedRoute appMode={appMode} requiredMode="corporate">
                            <Routes>
                                <Route path="roster" element={<CorporateRosterVersion1 />} />
                                <Route path="employees" element={<EmployeesPage />} />
                                <Route path="chart" element={<RosterChart />} />
                            </Routes>
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
};

export default App;