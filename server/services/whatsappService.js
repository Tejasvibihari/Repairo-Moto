// services/whatsappService.js
//
// WhatsApp sending for attendance alerts.
//
// STATUS: provider not connected yet. Until WHATSAPP_API_URL + WHATSAPP_API_TOKEN are set
// (and the request in `callProvider` is filled in) nothing is sent — every call just logs and
// returns { skipped: true }. The controller line that triggers this is commented out too.
//
// TO GO LIVE (when you get the API):
//   1. Add WHATSAPP_API_URL and WHATSAPP_API_TOKEN to server/.env
//   2. Fill in `callProvider` below for your provider's request format
//   3. Uncomment the import + the one-line call in Controllers/attendanceController.js
//
// Never throws: a WhatsApp failure must never fail the attendance request.
import AttendanceSettings from "../Models/attendanceSettings.js";
import {
    attendanceVars,
    buildAttendanceMessage,
    buildAttendanceParams,
    resolveWhatsAppRecipients,
} from "../Utils/attendanceUtils.js";

const isConfigured = () => !!(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN);

/**
 * The ONLY place that talks to the provider — replace the body when the API arrives.
 * @param {{to: string, message: string, params: string[]}} msg
 *   to      digits with country code, no "+"  (e.g. "919876543210")
 *   message full text (use this for providers that accept free text)
 *   params  ordered values for providers that use pre-approved templates ({{1}}, {{2}} ...)
 */
async function callProvider({ to, message, params }) { // eslint-disable-line no-unused-vars
    // Example only — adjust to your provider (this is the Meta WhatsApp Cloud API shape):
    //
    // const { data } = await axios.post(
    //     process.env.WHATSAPP_API_URL,
    //     { messaging_product: "whatsapp", to, type: "text", text: { body: message } },
    //     { headers: { Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}` } }
    // );
    // return data;
    //
    // Business-initiated messages usually need an approved template instead:
    //   { messaging_product: "whatsapp", to, type: "template",
    //     template: { name: "attendance_marked", language: { code: "en" },
    //                 components: [{ type: "body", parameters: params.map((p) => ({ type: "text", text: p })) }] } }
    throw new Error("WhatsApp provider request not implemented — fill in callProvider().");
}

/** Send one message. Returns { to, sent, skipped?, error? } — never throws. */
export async function sendWhatsAppMessage({ to, message, params = [] }) {
    if (!isConfigured()) {
        console.log(`[whatsapp] provider not configured — skipped message to ${to}`);
        return { to, sent: false, skipped: true };
    }
    try {
        await callProvider({ to, message, params });
        return { to, sent: true };
    } catch (err) {
        console.error(`[whatsapp] send to ${to} failed:`, err.response?.data || err.message);
        return { to, sent: false, error: err.message };
    }
}

/**
 * Tell everyone on the list that `employee` marked attendance.
 * Recipients = the employee (if admin left that on) + every active number the admin added.
 */
export async function sendAttendanceWhatsApp(employee, record) {
    try {
        const settings = await AttendanceSettings.findOne().lean();
        if (settings && settings.whatsappEnabled === false) return [];

        const recipients = resolveWhatsAppRecipients(employee, settings);
        if (!recipients.length) return [];

        const vars = attendanceVars(employee, record);
        const message = buildAttendanceMessage(vars);
        const params = buildAttendanceParams(vars);

        return await Promise.all(recipients.map((to) => sendWhatsAppMessage({ to, message, params })));
    } catch (err) {
        console.error("[whatsapp] attendance alert failed:", err.message);
        return [];
    }
}
