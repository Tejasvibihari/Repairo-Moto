import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { LoaderCircle, X } from 'lucide-react';
import { effectiveUnitPrice, formatMoney, toNumber } from '../../service/manualInvoiceApi';
import { serviceApi, formatDuration } from '../../service/serviceApi';

const MANUAL = '__manual__';

/**
 * Add / edit a single part or service line on a manual invoice.
 * `type` is either 'part' or 'service' and decides which name key the
 * saved object uses, so the payload matches the ManualInvoice schema.
 *
 * When adding a service, the saved services (Manage Services) are fetched
 * first and offered in a dropdown; "Other" lets the user type any name.
 */
export default function LineItemDialog({ open, onClose, onSave, type = 'part', editItem = null }) {
    const nameKey = type === 'part' ? 'partName' : 'serviceName';
    const label = type === 'part' ? 'Part' : 'Service';

    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [discountType, setDiscountType] = useState('flat');
    const [error, setError] = useState('');

    // Service catalogue (only used when adding a new service line)
    const usesCatalog = type === 'service' && !editItem;
    const [catalog, setCatalog] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [catalogError, setCatalogError] = useState('');
    const [choice, setChoice] = useState(''); // '' | service _id | MANUAL

    // Fetch the saved services every time the "Add Service" dialog opens.
    useEffect(() => {
        if (!open || !usesCatalog) return undefined;
        let cancelled = false;
        setCatalogLoading(true);
        setCatalogError('');
        serviceApi.list()
            .then((res) => {
                if (cancelled) return;
                const list = res.data?.services || [];
                setCatalog(list);
                // nothing saved yet -> go straight to manual entry
                setChoice(list.length ? '' : MANUAL);
            })
            .catch(() => {
                if (cancelled) return;
                setCatalog([]);
                setCatalogError('Could not load saved services. You can still enter one manually.');
                setChoice(MANUAL);
            })
            .finally(() => { if (!cancelled) setCatalogLoading(false); });
        return () => { cancelled = true; };
    }, [open, usesCatalog]);

    const handleChoice = (value) => {
        setChoice(value);
        setError('');
        if (value === MANUAL) {
            setName('');
            setPrice('');
            return;
        }
        const svc = catalog.find((s) => s._id === value);
        if (svc) {
            setName(svc.name);
            setPrice(String(svc.price ?? ''));
        } else {
            setName('');
            setPrice('');
        }
    };

    const selectedService = catalog.find((s) => s._id === choice);
    const showNameInput = !usesCatalog || choice === MANUAL;

    useEffect(() => {
        if (!open) return;
        if (editItem) {
            setName(editItem[nameKey] || '');
            setQuantity(String(editItem.quantity ?? 1));
            setPrice(String(editItem.price ?? ''));
            setDiscountPrice(editItem.discountPrice ? String(editItem.discountPrice) : '');
            setDiscountType(editItem.discountType || 'flat');
        } else {
            setName('');
            setQuantity('1');
            setPrice('');
            setDiscountPrice('');
            setDiscountType('flat');
            setChoice('');
        }
        setError('');
    }, [open, editItem, nameKey]);

    const draft = {
        quantity: toNumber(quantity),
        price: toNumber(price),
        discountPrice: toNumber(discountPrice),
        discountType,
    };
    const unit = effectiveUnitPrice(draft);
    const total = (toNumber(quantity) || 0) * unit;
    const showPreview = toNumber(price) > 0 && toNumber(quantity) > 0;

    const handleSave = () => {
        if (usesCatalog && !choice) {
            setError('Please select a service, or choose "Other" to enter one manually.');
            return;
        }
        if (!name.trim()) {
            setError(`Please enter a ${label.toLowerCase()} name.`);
            return;
        }
        if (toNumber(price) <= 0) {
            setError('Please enter a valid price.');
            return;
        }
        onSave({
            [nameKey]: name.trim(),
            quantity: toNumber(quantity) || 1,
            price: toNumber(price),
            discountPrice: toNumber(discountPrice),
            discountType: toNumber(discountPrice) > 0 ? discountType : undefined,
            effectivePrice: unit,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {editItem ? `Edit ${label}` : `Add ${label}`}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    {usesCatalog && (
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Select Service</label>
                            {catalogLoading ? (
                                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500">
                                    <LoaderCircle size={16} className="animate-spin text-amber-500" /> Loading services...
                                </div>
                            ) : (
                                <select
                                    value={choice}
                                    onChange={(e) => handleChoice(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">Select a service...</option>
                                    {catalog.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.name} — ₹{Number(s.price).toLocaleString('en-IN')}
                                        </option>
                                    ))}
                                    <option value={MANUAL}>Other (enter manually)</option>
                                </select>
                            )}
                            {selectedService && (
                                <p className="mt-1 text-xs text-gray-500">
                                    {selectedService.description ? `${selectedService.description} · ` : ''}
                                    Approx. {formatDuration(selectedService.estimatedMinutes)}
                                </p>
                            )}
                            {catalogError && <p className="mt-1 text-xs text-amber-700">{catalogError}</p>}
                        </div>
                    )}

                    {showNameInput && (
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">{label} Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={type === 'part' ? 'e.g. Brake Pad Set' : 'e.g. General Service'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Unit Price (₹)</label>
                            <input
                                type="number"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Discount (optional)</label>
                            <input
                                type="number"
                                min="0"
                                value={discountPrice}
                                onChange={(e) => setDiscountPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Discount Type</label>
                            <div className="flex gap-2">
                                {['flat', 'percent'].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setDiscountType(opt)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${discountType === opt
                                            ? 'bg-amber-500 text-white border-amber-500'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-amber-300'
                                            }`}
                                    >
                                        {opt === 'flat' ? '₹ Flat' : '% Percent'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {showPreview && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Effective unit price</span>
                                <span>{formatMoney(unit)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-800 mt-1">
                                <span>Line total</span>
                                <span>{formatMoney(total)}</span>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium"
                    >
                        {editItem ? 'Save Changes' : `Add ${label}`}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
