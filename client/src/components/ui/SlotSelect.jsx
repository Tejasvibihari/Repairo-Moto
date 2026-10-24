import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { bookingSlotApi } from '../../service/bookingSlotApi';

const REASONS = {
    SLOT_PAST: 'passed',
    SLOT_FULL: 'full',
    STORE_CLOSED: 'closed',
    DAILY_LIMIT_REACHED: 'bookings full',
};

/**
 * Time picker for booking forms.
 *  - Admin has configured slots -> dropdown of the enabled slots for the chosen date
 *    (full / passed ones are shown but disabled).
 *  - No slots configured yet    -> falls back to the free-form time picker.
 *
 * `value` / `onChange` always work with the string the API stores, e.g. "08:00 AM".
 * `date` is the dayjs value from the date picker.
 */
export default function SlotSelect({ date, value, onChange, label = 'Preferred Time', required = true }) {
    // null = still finding out whether the admin has configured any slots
    const [enforced, setEnforced] = useState(null);
    const [day, setDay] = useState({ loading: false, slots: [], dateAvailability: null, error: '' });
    const [freeTime, setFreeTime] = useState(null);

    const ymd = date && dayjs(date).isValid() ? dayjs(date).format('YYYY-MM-DD') : '';

    useEffect(() => {
        let cancelled = false;
        bookingSlotApi.enabled()
            .then((res) => { if (!cancelled) setEnforced(!!res.data?.enforced); })
            .catch(() => { if (!cancelled) setEnforced(false); }); // never block booking if this fails
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (enforced !== true || !ymd) {
            setDay({ loading: false, slots: [], dateAvailability: null, error: '' });
            return undefined;
        }
        let cancelled = false;
        setDay((d) => ({ ...d, loading: true, error: '' }));
        bookingSlotApi.forDate(ymd)
            .then((res) => {
                if (cancelled) return;
                const data = res.data || {};
                const slots = data.slots || [];
                setDay({ loading: false, slots, dateAvailability: data.dateAvailability || null, error: '' });
                // A previously chosen slot may not exist / be free on the newly picked date.
                if (value && !slots.some((s) => s.value === value && s.available)) onChange('');
            })
            .catch(() => {
                if (!cancelled) setDay({ loading: false, slots: [], dateAvailability: null, error: 'Could not load time slots. Please try again.' });
            });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enforced, ymd]);

    useEffect(() => { if (!value) setFreeTime(null); }, [value]);

    // No slots set up -> the original free-form picker.
    if (enforced === false) {
        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['TimePicker']}>
                    <TimePicker
                        label={label}
                        value={freeTime}
                        onChange={(v) => { setFreeTime(v); onChange(v && v.isValid() ? v.format('hh:mm A') : ''); }}
                        slotProps={{ textField: { required } }}
                        className="w-full"
                    />
                </DemoContainer>
            </LocalizationProvider>
        );
    }

    const anyAvailable = day.slots.some((s) => s.available);
    const blocked = day.dateAvailability && !day.dateAvailability.available ? day.dateAvailability.message : '';
    let helper = '';
    if (day.error) helper = day.error;
    else if (!ymd) helper = 'Select a date first';
    else if (blocked) helper = blocked;
    else if (!day.loading && !day.slots.length) helper = 'No time slots are open for this date.';
    else if (!day.loading && !anyAvailable) helper = 'All slots are taken or have passed for this date.';

    return (
        <TextField
            select
            fullWidth
            required={required}
            label={label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={enforced === null || !ymd || day.loading || !anyAvailable}
            error={!!day.error}
            helperText={helper || undefined}
            sx={{ marginTop: '8px' }}
        >
            {day.slots.map((slot) => (
                <MenuItem key={slot._id} value={slot.value} disabled={!slot.available}>
                    {slot.displayLabel}
                    {slot.available && slot.remaining != null ? ` · ${slot.remaining} left` : ''}
                    {!slot.available ? ` · ${REASONS[slot.unavailableReason] || 'unavailable'}` : ''}
                </MenuItem>
            ))}
        </TextField>
    );
}
