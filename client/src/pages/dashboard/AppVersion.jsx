import React, { useCallback, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import {
    Smartphone, Apple, Plus, Pencil, Trash2, X, AlertTriangle,
    ExternalLink, ShieldAlert, RefreshCw,
} from 'lucide-react';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import CircularLoading from '../../components/ui/CircularLoading';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import {
    APPS, PLATFORMS, appLabel, platformLabel, compareVersions, defaultStoreUrl,
    deleteAppVersion, isValidVersion, listAppVersions, upsertAppVersion,
} from '../../service/appVersionApi';

const EMPTY_FORM = {
    app: 'mobile',
    platform: 'android',
    latestVersion: '',
    minRequiredVersion: '',
    storeUrl: '',
    updateMessage: 'A new version is available.',
    forceUpdate: false,
};

const Labelled = ({ label, hint, children }) => (
    <div>
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
);

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500';

function VersionCard({ config, onEdit, onDelete }) {
    const Icon = config.platform === 'ios' ? Apple : Smartphone;
    const mismatch = compareVersions(config.minRequiredVersion, config.latestVersion) > 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 flex-shrink-0">
                        <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{appLabel(config.app)}</h3>
                        <p className="text-xs text-gray-500">{platformLabel(config.platform)}</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={onEdit} title="Edit" className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600">
                        <Pencil size={15} />
                    </button>
                    <button onClick={onDelete} title="Delete" className="p-2 rounded-lg border border-gray-200 text-red-500 hover:border-red-300 hover:bg-red-50">
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Live Version</p>
                    <p className="text-lg font-bold text-gray-900">{config.latestVersion}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Min Required</p>
                    <p className="text-lg font-bold text-gray-900">{config.minRequiredVersion}</p>
                </div>
            </div>

            {config.forceUpdate && (
                <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                    <ShieldAlert size={14} />
                    Force update is ON — every user is blocked until they update.
                </div>
            )}

            {mismatch && (
                <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                    Min required is higher than the live version, so everyone will be
                    force-updated to a build that isn&apos;t on the store yet.
                </div>
            )}

            <p className="text-sm text-gray-600 mb-3">{config.updateMessage}</p>

            {config.storeUrl && (
                <a
                    href={config.storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline break-all"
                >
                    <ExternalLink size={12} className="flex-shrink-0" /> {config.storeUrl}
                </a>
            )}

            {config.updatedAt && (
                <p className="text-xs text-gray-400 mt-3">
                    Updated {new Date(config.updatedAt).toLocaleString('en-IN')}
                </p>
            )}
        </div>
    );
}

export default function AppVersion() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);

    const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });

    const fetchConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await listAppVersions();
            setConfigs(Array.isArray(res.data) ? res.data : res.data?.data || []);
        } catch (error) {
            showSnack(error.response?.data?.message || 'Could not load version configs.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

    const openCreate = () => {
        setForm({ ...EMPTY_FORM, storeUrl: defaultStoreUrl('mobile', 'android') });
        setIsEditing(false);
        setErrors({});
        setDialogOpen(true);
    };

    const openEdit = (config) => {
        setForm({
            app: config.app,
            platform: config.platform,
            latestVersion: config.latestVersion || '',
            minRequiredVersion: config.minRequiredVersion || '',
            storeUrl: config.storeUrl || '',
            updateMessage: config.updateMessage || '',
            forceUpdate: Boolean(config.forceUpdate),
        });
        setIsEditing(true);
        setErrors({});
        setDialogOpen(true);
    };

    const setField = (key, value) => {
        setForm((f) => {
            const next = { ...f, [key]: value };
            // Prefill the store URL when the target changes, but never stomp on
            // a URL the admin already typed.
            if ((key === 'app' || key === 'platform') && !f.storeUrl) {
                next.storeUrl = defaultStoreUrl(next.app, next.platform);
            }
            return next;
        });
        setErrors((e) => ({ ...e, [key]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!isValidVersion(form.latestVersion)) next.latestVersion = 'Use a version like 1.4.0';
        if (!isValidVersion(form.minRequiredVersion)) next.minRequiredVersion = 'Use a version like 1.2.0';
        if (!form.storeUrl.trim()) next.storeUrl = 'Store URL is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const duplicate = !isEditing && configs.some(
        (c) => c.app === form.app && c.platform === form.platform,
    );

    // Warn rather than block: the server upserts on (app, platform), so a
    // min above the live version is legal but will lock everyone out.
    const versionWarning =
        isValidVersion(form.latestVersion) &&
        isValidVersion(form.minRequiredVersion) &&
        compareVersions(form.minRequiredVersion, form.latestVersion) > 0;

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            await upsertAppVersion({
                app: form.app,
                platform: form.platform,
                latestVersion: form.latestVersion.trim(),
                minRequiredVersion: form.minRequiredVersion.trim(),
                storeUrl: form.storeUrl.trim(),
                updateMessage: form.updateMessage.trim() || 'A new version is available.',
                forceUpdate: form.forceUpdate,
            });
            showSnack(`${appLabel(form.app)} (${platformLabel(form.platform)}) saved.`);
            setDialogOpen(false);
            fetchConfigs();
        } catch (error) {
            showSnack(error.response?.data?.message || 'Could not save the config.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteAppVersion(deleteTarget._id);
            showSnack('Config deleted.');
            fetchConfigs();
        } catch (error) {
            showSnack(error.response?.data?.message || 'Could not delete the config.', 'error');
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <>
            <AlertSnackBar
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
            />

            <ConfirmationModal
                isOpen={Boolean(deleteTarget)}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete version config"
                message={
                    deleteTarget
                        ? `Delete the ${appLabel(deleteTarget.app)} / ${platformLabel(deleteTarget.platform)} config? That app will stop receiving update prompts until it is set up again.`
                        : ''
                }
                confirmText="Delete"
                isDangerous
            />

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold">App Version</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Set the live store version after every release. Apps check this on launch
                            and prompt — or force — an update.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchConfigs}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <RefreshCw size={16} /> Refresh
                        </button>
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                            <Plus size={18} /> Add Config
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><CircularLoading /></div>
                    ) : configs.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-xl">
                            <Smartphone size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No version configs yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Until one exists, the apps get a 404 on launch and skip the update check.
                            </p>
                            <button onClick={openCreate} className="mt-3 text-amber-600 hover:underline">
                                Add the first one
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {configs.map((config) => (
                                <VersionCard
                                    key={config._id}
                                    config={config}
                                    onEdit={() => openEdit(config)}
                                    onDelete={() => setDeleteTarget(config)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {isEditing ? 'Edit Version Config' : 'Add Version Config'}
                        </h3>
                        <button onClick={() => setDialogOpen(false)} className="p-1 rounded hover:bg-gray-100">
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Labelled label="App">
                                <select
                                    value={form.app}
                                    onChange={(e) => setField('app', e.target.value)}
                                    disabled={isEditing}
                                    className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500`}
                                >
                                    {APPS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                                </select>
                            </Labelled>
                            <Labelled label="Platform">
                                <select
                                    value={form.platform}
                                    onChange={(e) => setField('platform', e.target.value)}
                                    disabled={isEditing}
                                    className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500`}
                                >
                                    {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </Labelled>
                        </div>

                        {isEditing && (
                            <p className="text-xs text-gray-400 -mt-2">
                                App and platform identify the config and can&apos;t be changed. Delete and re-add to move it.
                            </p>
                        )}

                        {duplicate && (
                            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                                A config already exists for this app and platform. Saving will overwrite it.
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Labelled label="Live Version" hint="What's on the store right now">
                                <input
                                    value={form.latestVersion}
                                    onChange={(e) => setField('latestVersion', e.target.value)}
                                    placeholder="1.4.0"
                                    className={inputClass}
                                />
                                {errors.latestVersion && <p className="text-xs text-red-600 mt-1">{errors.latestVersion}</p>}
                            </Labelled>
                            <Labelled label="Min Required" hint="Below this is force-updated">
                                <input
                                    value={form.minRequiredVersion}
                                    onChange={(e) => setField('minRequiredVersion', e.target.value)}
                                    placeholder="1.2.0"
                                    className={inputClass}
                                />
                                {errors.minRequiredVersion && <p className="text-xs text-red-600 mt-1">{errors.minRequiredVersion}</p>}
                            </Labelled>
                        </div>

                        {versionWarning && (
                            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                                Min required is above the live version — every user gets force-updated
                                to a build that isn&apos;t published yet, and none of them can get past it.
                            </div>
                        )}

                        <Labelled label="Store URL">
                            <input
                                value={form.storeUrl}
                                onChange={(e) => setField('storeUrl', e.target.value)}
                                placeholder="https://play.google.com/store/apps/details?id=..."
                                className={inputClass}
                            />
                            {errors.storeUrl && <p className="text-xs text-red-600 mt-1">{errors.storeUrl}</p>}
                        </Labelled>

                        <Labelled label="Update Message" hint="Shown in the update prompt inside the app">
                            <textarea
                                rows={3}
                                value={form.updateMessage}
                                onChange={(e) => setField('updateMessage', e.target.value)}
                                placeholder="A new version is available."
                                className={inputClass}
                            />
                        </Labelled>

                        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-amber-300">
                            <input
                                type="checkbox"
                                checked={form.forceUpdate}
                                onChange={(e) => setField('forceUpdate', e.target.checked)}
                                className="accent-amber-500 mt-0.5"
                            />
                            <span>
                                <span className="block text-sm font-medium text-gray-800">Force update</span>
                                <span className="block text-xs text-gray-500">
                                    Blocks every user regardless of their version — no &quot;Later&quot; option.
                                    Use for emergency rollouts only.
                                </span>
                            </span>
                        </label>

                        {form.forceUpdate && (
                            <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                                Nobody can use the app until they update. Make sure the new build is
                                actually live on the store before you save this.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setDialogOpen(false)}
                            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-medium flex items-center gap-2"
                        >
                            {saving ? <CircularLoading size={18} /> : 'Save Config'}
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
