import axios from "axios";
import ButtonLoader from "../loaders/ButtonLoader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_AUTH_URL;

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const registerData = { email, name: firstName + " " + lastName, password };

        const apiUrl = API_URL + '/register/user';

        setIsSubmitting(true);
        axios.post(apiUrl, registerData)
            .then(response => {
                console.log("Registration successful:", response.data);
                navigate('/login');
            })
            .catch(error => {
                console.error("Registration failed:", error);
                // Optionally show error message to user
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-500 mb-8">Start managing your schedules today.</p>
                
                <form className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Work Email</label>
                        <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <input type="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all" onClick={handleSubmit}>
                        {isSubmitting ? <ButtonLoader appMode="corporate" /> : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;