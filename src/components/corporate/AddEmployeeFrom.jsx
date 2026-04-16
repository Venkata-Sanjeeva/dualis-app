import { useState } from 'react';
import {
    UserPlus, Mail,
    Fingerprint, ShieldCheck,
    Building2
} from 'lucide-react';
import { Button } from 'bootstrap';
import axios from 'axios';
import ButtonLoader from '../loaders/ButtonLoader';

const API_URL = process.env.REACT_APP_API_URL;

const AddEmployeeForm = () => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        designation: 'Engineer', // Default matching your likely Enum
        department: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const employeeData = {
            name: form.firstName + " " + form.lastName,
            email: form.email,
            designation: form.designation
        };

        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/employees/create`, employeeData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log("Employee created successfully:", response.data);

        } catch (err) {
            console.error("Creation failed", err);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm";
    const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400";

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl mx-auto">
            {/* Form Header */}
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Add New Employee</h2>
                        <p className="text-blue-100 text-xs">Onboard a new member to CorpSync</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* First Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">First Name</label>
                        <div className="relative">
                            <Fingerprint className={iconClass} />
                            <input
                                type="text" required className={inputClass} placeholder="John"
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Last Name</label>
                        <div className="relative">
                            <Fingerprint className={iconClass} />
                            <input
                                type="text" required className={inputClass} placeholder="Doe"
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className={iconClass} />
                            <input
                                type="email" required className={inputClass} placeholder="john.doe@corpsync.com"
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Role (Select) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Designation / Role</label>
                        <div className="relative">
                            <ShieldCheck className={iconClass} />
                            <input
                                type="text" className={inputClass} placeholder="Jr. Software Engineer"
                                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Department */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Department</label>
                        <div className="relative">
                            <Building2 className={iconClass} />
                            <input
                                type="text" className={inputClass} placeholder="Engineering"
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    {loading ? <ButtonLoader appMode="corporate" message="Adding Employee..." /> : "Add Employee"}
                </button>
            </form>
        </div>
    );
};

export default AddEmployeeForm;