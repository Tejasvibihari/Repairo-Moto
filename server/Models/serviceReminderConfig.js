import mongoose from 'mongoose';

// Singleton (same pattern as AdminSettings): one document that controls the
// automatic "time for your next service" reminders.
//
// Template placeholders (replaced when the reminder is sent):
//   {{name}}            customer first name
//   {{bike}}            "Brand Model" of the serviced bike
//   {{lastServiceDate}} date the last service was completed, e.g. "12 Aug 2026"
//   {{days}}            days since that service
const serviceReminderConfigSchema = new mongoose.Schema({
    // Off by default so deploying this never messages customers by surprise.
    enabled: { type: Boolean, default: false },

    // Days after a completed service before the reminder fires. Admin can
    // override this per order (Order.followUp.remindAfterDays).
    defaultDelayDays: { type: Number, default: 45, min: 1, max: 730 },

    // Shortcut chips shown in the admin UI (30 / 45 / 60 …).
    presetDays: { type: [Number], default: [30, 45, 60, 90] },

    title: { type: String, trim: true, default: '🏍️ Time for your bike service' },
    body: {
        type: String,
        trim: true,
        default: 'Hi {{name}}, it has been {{days}} days since your {{bike}} was serviced. Book a quick check-up to keep it running smoothly.',
    },

    // Reminders only go out between sendFromHour and sendUntilHour (IST) so
    // nobody is pushed at night. A reminder that comes due overnight simply
    // waits for the next morning.
    sendFromHour: { type: Number, default: 10, min: 0, max: 23 },
    sendUntilHour: { type: Number, default: 20, min: 1, max: 24 },

    // Skip the reminder if the customer has already booked again since.
    skipIfRebooked: { type: Boolean, default: true },

    // Only services completed on/after this moment get an automatic reminder.
    // Set automatically the first time `enabled` is switched on, so existing
    // history is not blasted.
    enabledSince: { type: Date, default: null },
}, { timestamps: true });

const ServiceReminderConfig = mongoose.model('ServiceReminderConfig', serviceReminderConfigSchema);
export default ServiceReminderConfig;
