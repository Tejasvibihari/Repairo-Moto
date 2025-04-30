import { Wrench, Store, Truck, Users } from "lucide-react";
import MetricCard from "./ui/MetricCard";

// StaffCountCard component - For Mechanics/Vendors/Delivery Staff
const StaffCountCard = ({ type, count = 0 }) => {
    let icon, gradientFrom, gradientTo;

    switch (type) {
        case "Mechanics":
            icon = <Wrench size={24} />;
            gradientFrom = "#7c3aed";
            gradientTo = "#8b5cf6";
            break;
        case "Vendors":
            icon = <Store size={24} />;
            gradientFrom = "#ea580c";
            gradientTo = "#f97316";
            break;
        case "Delivery Staff":
            icon = <Truck size={24} />;
            gradientFrom = "#0891b2";
            gradientTo = "#06b6d4";
            break;
        default:
            icon = <Users size={24} />;
            gradientFrom = "#4b5563";
            gradientTo = "#6b7280";
    }

    return (
        <MetricCard
            title={`Total ${type}`}
            value={count.toLocaleString()}
            icon={icon}
            gradientFrom={gradientFrom}
            gradientTo={gradientTo}
        />
    );
};
export default StaffCountCard;