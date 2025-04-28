export const IconCard = ({ icon, title, text }) => {
    return (
        <div className="flex flex-col items-center relative p-4">

            {/* Image Background */}
            <div className="absolute w-40 h-40">
                <img
                    src="/images/disc.png"
                    alt="Background Wheel"
                    className="w-full h-full object-contain opacity-10 animate-spin-slow"
                />
            </div>

            <div className="relative flex items-center justify-center mb-4">
             
                
                {/* Inner red circle with icon */}
                <div className="relative z-10 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    {icon}
                </div>
            </div>

            {/* Text Content */}
            <h3 className="text-lg font-semibold text-center">{title}</h3>
            <p className="text-gray-700 text-center">{text}</p>
        </div>
    );
};