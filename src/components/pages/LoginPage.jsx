import axios from 'axios';
import { Button } from 'bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonLoader from '../loaders/ButtonLoader';

const API_URL = process.env.REACT_APP_AUTH_URL;

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        axios.post(`${API_URL}/login`, { email, password })
            .then(response => {
                const data = response.data?.data || response.data; // Handle different response structures
                console.log("Login successful:", data);
                localStorage.setItem('token', data.token); // Store JWT token
                navigate('/'); // Redirect to dashboard
            })
            .catch(error => {
                console.error("Login failed:", error);
                // Optionally show error message to user
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500 mb-8">Please enter your details to sign in.</p>
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <input type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                        {isSubmitting ? <ButtonLoader appMode="corporate" message="Signing In..."/> : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;