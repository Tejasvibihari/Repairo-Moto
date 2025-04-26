import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const EmployeePrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.employeeAuth.isAuthenticated)
    console.log(isAuthenticated)

    return isAuthenticated ? children : <Navigate to="/employee-sign-in" replace />;
};

export default EmployeePrivateRoute;
