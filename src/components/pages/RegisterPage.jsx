const RegisterPage = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-500 mb-8">Start managing your schedules today.</p>
                
                <form className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" required/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Work Email</label>
                        <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" required/>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;