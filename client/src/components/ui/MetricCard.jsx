
const MetricCard = ({ title, value, icon, gradientFrom, gradientTo }) => {
    return (
        <div className={`rounded-lg shadow-lg p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}
            style={{
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            }}>
            {/* Abstract shapes - decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 bg-white -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-20 bg-white -ml-4 -mb-4"></div>

            <div className="flex items-center space-x-4 relative z-10">
                <div className="p-3 rounded-full bg-white/30 text-white backdrop-blur-sm">
                    {icon}
                </div>
                <div>
                    <h3 className="text-white/80 text-sm font-medium">{title}</h3>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default MetricCard;