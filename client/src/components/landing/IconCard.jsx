export const IconCard = ({ icon, title, text }) => {
    return (
        <article className="flex flex-col items-center relative p-4" aria-label={title}>
            {/* Background Decorative Image */}
            <div className="absolute w-40 h-40" aria-hidden="true">
                <img
                    src="/images/disc.png"
                    alt="Decorative spinning disc"
                    className="w-full h-full object-contain opacity-10 animate-spin-slow"
                />
            </div>

            {/* Icon Container */}
            <div className="relative flex items-center justify-center mb-4">
                <div
                    className="relative z-10 w-16 h-16 bg-primary rounded-full flex items-center justify-center"
                    aria-hidden="true"
                >
                    {icon}
                </div>
            </div>

            {/* Textual Content */}
            <h3 className="text-lg font-semibold text-center">{title}</h3>
            <p className="text-gray-700 text-center">{text}</p>
        </article>
    );
};
