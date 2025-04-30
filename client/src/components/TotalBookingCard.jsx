import { Calendar } from "lucide-react";
import MetricCard from "./ui/MetricCard";

// TotalBookings card component
const TotalBookingsCard = ({ totalBookings = 1245 }) => {
    return (
        <MetricCard
            title="Total Bookings"
            value={totalBookings.toLocaleString()}
            icon={<Calendar size={24} />}
            gradientFrom="#4338ca"
            gradientTo="#6366f1"
        />
    );
};

export default TotalBookingsCard;