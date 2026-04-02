import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-3xl shadow-xl border border-gray-100">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Access Restricted</h2>
                    <p className="mt-3 text-gray-500">
                        Please sign in to access the Schedula or CorpSync dashboards.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <Link to="/login" className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                        Sign In <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/register" className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                        Create an Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;