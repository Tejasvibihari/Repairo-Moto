import { DollarSign } from "lucide-react";
import MetricCard from "./ui/MetricCard";

// TotalRevenueCard component
const TotalRevenueCard = ({ revenue = 125750 }) => {
    const formattedRevenue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(revenue);

    return (
        <MetricCard
            title="Total Revenue"
            value={formattedRevenue}
            icon={<DollarSign size={24} />}
            gradientFrom="#047857"
            gradientTo="#34d399"
        />
    );
};
export default TotalRevenueCard;