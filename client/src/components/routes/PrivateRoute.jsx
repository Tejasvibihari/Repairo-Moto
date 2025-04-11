import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.admin.isAuthenticated)
    console.log(isAuthenticated)

    return isAuthenticated ? children : <Navigate to="/admin-sign-in" replace />;
};

export default PrivateRoute;
