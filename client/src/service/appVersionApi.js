import axiosClient from './axiosClient';

const BASE = '/api/app-version';

/**
 * One config per (app, platform) pair. `mobile` is the customer app,
 * `console` is the admin/employee app — they ship as separate store
 * listings with their own version numbers, so they are force-updated
 * independently.
 */

export const listAppVersions = () => axiosClient.get(`${BASE}/all`);

export const upsertAppVersion = (payload) => axiosClient.post(BASE, payload);

export const deleteAppVersion = (id) => axiosClient.delete(`${BASE}/${id}`);

export const APPS = [
    { value: 'mobile', label: 'Customer App' },
    { value: 'console', label: 'Console (Admin / Employee)' },
];

export const PLATFORMS = [
    { value: 'android', label: 'Android' },
    { value: 'ios', label: 'iOS' },
];

export const appLabel = (value) => APPS.find((a) => a.value === value)?.label || value;
export const platformLabel = (value) => PLATFORMS.find((p) => p.value === value)?.label || value;

/** Matches "1", "1.4", "1.4.0" — the shapes the store and the app actually use. */
export const isValidVersion = (value) => /^\d+(\.\d+){0,2}$/.test(String(value || '').trim());

/**
 * Returns -1, 0 or 1. Pads missing segments with zero so "1.4" and "1.4.0"
 * compare equal, which is how the app's own launch check treats them.
 */
export const compareVersions = (a, b) => {
    const left = String(a || '').split('.').map(Number);
    const right = String(b || '').split('.').map(Number);
    const len = Math.max(left.length, right.length);

    for (let i = 0; i < len; i += 1) {
        const l = left[i] || 0;
        const r = right[i] || 0;
        if (l > r) return 1;
        if (l < r) return -1;
    }
    return 0;
};

export const defaultStoreUrl = (app, platform) => {
    if (platform === 'ios') return '';
    return app === 'mobile'
        ? 'https://play.google.com/store/apps/details?id=com.roottechnology.repairoMotoApp'
        : '';
};
