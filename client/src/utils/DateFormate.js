export const formatDate = (date) => {
    if (!date) return "Invalid Date";

    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatTime = (date) => {
    if (!date) return "Invalid Date";
    const formattedTime = new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Ensures 12-hour format with AM/PM
    });

    return `${formattedTime}`;
};