import { DollarSign, IndianRupee } from "lucide-react";
import MetricCard from "./ui/MetricCard";

// TotalRevenueCard component
const TotalRevenueCard = ({ revenue }) => {
    const formattedRevenue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(revenue);
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    return (
        <MetricCard
            title={`Total Revenue (${currentMonth})`}
            value={formattedRevenue}
            icon={<IndianRupee size={24} />}
            gradientFrom="#047857"
            gradientTo="#34d399"
        />
    );
};
export default TotalRevenueCard;