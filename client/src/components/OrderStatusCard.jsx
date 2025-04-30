import { Clock, Wrench, CheckCircle } from "lucide-react";
import MetricCard from "./ui/MetricCard";

const OrderStatusCard = ({ status, count = 0 }) => {
    let icon, gradientFrom, gradientTo;

    switch (status) {
        case "Pending":
            icon = <Clock size={24} />;
            gradientFrom = "#f59e0b";
            gradientTo = "#fbbf24";
            break;
        case "In Progress":
            icon = <Wrench size={24} />;
            gradientFrom = "#2563eb";
            gradientTo = "#3b82f6";
            break;
        case "Completed":
            icon = <CheckCircle size={24} />;
            gradientFrom = "#059669";
            gradientTo = "#10b981";
            break;
        default:
            icon = <Clock size={24} />;
            gradientFrom = "#6b7280";
            gradientTo = "#9ca3af";
    }

    return (
        <MetricCard
            title={`${status} Orders`}
            value={count.toLocaleString()}
            icon={icon}
            gradientFrom={gradientFrom}
            gradientTo={gradientTo}
        />
    );
};
export default OrderStatusCard;