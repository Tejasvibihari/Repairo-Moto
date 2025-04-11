import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("authToken"); // Or use Redux/context

    return isAuthenticated ? children : <Navigate to="/admin-sign-in" replace />;
};

export default PrivateRoute;
