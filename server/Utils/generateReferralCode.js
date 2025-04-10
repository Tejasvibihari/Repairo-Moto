export const generateReferralCode = (firstName, phone) => {
    // Take the letter of the firstname and convert it to uppercase
    const firstLetter = firstName.charAt(0).toUpperCase();
    // Take the last 4 digit from phone number
    const last4Digits = phone.slice(-4);
    // Generate a random 2 digit number
    const randomDigits = Math.floor(Math.random() * 90) + 10;
    // Combine all the parts to create the referral code
    return `${firstLetter}${last4Digits}${randomDigits}`;
}