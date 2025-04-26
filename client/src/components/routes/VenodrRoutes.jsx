import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const VendorPrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.vendorAuth.isAuthenticated)
    return isAuthenticated ? children : <Navigate to="/vendor/sign-in" replace />;
};

export default VendorPrivateRoute;
