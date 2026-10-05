// Utils/firebaseVerify.js
//
// Verifies a Firebase Auth ID token (the one the app gets after Phone Number Verification) WITHOUT the
// firebase-admin SDK and without a service-account file: Firebase ID tokens are plain RS256 JWTs signed
// with Google's public certificates, so we only need the project id (FIREBASE_PROJECT_ID).
import axios from "axios";
import jwt from "jsonwebtoken";

const CERT_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
let cache = { certs: null, expires: 0 };

export async function getGoogleCerts() {
    if (cache.certs && Date.now() < cache.expires) return cache.certs;
    const res = await axios.get(CERT_URL, { timeout: 8000 });
    const maxAge = /max-age=(\d+)/.exec(res.headers?.["cache-control"] || "")?.[1];
    cache = { certs: res.data, expires: Date.now() + (maxAge ? Number(maxAge) : 3600) * 1000 };
    return cache.certs;
}

// test hook
export const _setCertCache = (certs) => { cache = { certs, expires: Date.now() + 3600_000 }; };

/** @returns {Promise<{uid: string, phone: string}>} throws on anything wrong with the token */
export async function verifyFirebasePhoneToken(idToken) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error("FIREBASE_PROJECT_ID is not set on the server");

    const kid = jwt.decode(idToken, { complete: true })?.header?.kid;
    if (!kid) throw new Error("Malformed token");

    let certs = await getGoogleCerts();
    if (!certs[kid]) { cache.expires = 0; certs = await getGoogleCerts(); }   // key rotation
    if (!certs[kid]) throw new Error("Unknown signing key");

    const claims = jwt.verify(idToken, certs[kid], {
        algorithms: ["RS256"],
        audience: projectId,
        issuer: `https://securetoken.google.com/${projectId}`,
    });
    if (!claims.sub) throw new Error("Token has no subject");
    if (claims.firebase?.sign_in_provider !== "phone") throw new Error("Token is not from phone sign-in");
    if (!claims.phone_number) throw new Error("Token has no phone number");
    return { uid: claims.sub, phone: claims.phone_number };
}
