/**
 * Signup moved to the mobile app, so /user-signup no longer exists on the web.
 * Referral QR codes and share links have to point somewhere that still works —
 * the Play Store listing, with the referral code carried through so it can be
 * picked up on install.
 *
 * Override the destination with VITE_APP_STORE_URL if the listing ever moves.
 */
const PLAY_STORE_URL =
    import.meta.env.VITE_APP_STORE_URL ||
    'https://play.google.com/store/apps/details?id=com.roottechnology.repairoMotoApp';

export const buildReferralUrl = (referralCode, accountType) => {
    if (!referralCode) return PLAY_STORE_URL;

    // Play Store passes the `referrer` param through to the app on install.
    const referrer = accountType
        ? `ref=${referralCode}&type=${accountType}`
        : `ref=${referralCode}`;

    return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(referrer)}`;
};

export default buildReferralUrl;
