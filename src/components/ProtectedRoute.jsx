import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, appMode, requiredMode }) => {
    const token = localStorage.getItem('token'); // Or wherever you store your JSON token
    const location = useLocation();

    // 1. Check if authenticated
    if (!token) {
        // Redirect to a landing/login page if no token is found
        return <Navigate to="/welcome" state={{ from: location }} replace />;
    }

    // 2. Check if the user is in the correct mode for this route
    // If they try to access a /corporate route while in 'school' mode, redirect to home
    if (requiredMode && appMode !== requiredMode) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;