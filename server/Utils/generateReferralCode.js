export const generateReferralCode = (firstName, phone) => {
    // Take the first 4 letters of the firstname and convert to uppercase
    const firstFourLetters = firstName.slice(0, 4).toUpperCase();
    // Take the last 4 digits from the phone number
    const last4Digits = phone.slice(-4);
    // Generate a random 2-digit number
    const randomDigits = Math.floor(Math.random() * 90) + 10;
    // Combine all parts to create the referral code
    return `${firstFourLetters}${last4Digits}${randomDigits}`;
};
