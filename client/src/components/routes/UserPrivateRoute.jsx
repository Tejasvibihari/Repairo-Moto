import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const UserPrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.admin.isAuthenticated)
    console.log(isAuthenticated)

    return isAuthenticated ? children : <Navigate to="/user-signin" replace />;
};

export default UserPrivateRoute;
