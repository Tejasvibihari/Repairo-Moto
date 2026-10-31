import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { LoaderCircle, X } from 'lucide-react';
import { effectiveUnitPrice, formatMoney, toNumber } from '../../service/manualInvoiceApi';
import { serviceApi, formatDuration } from '../../service/serviceApi';
import { htmlToLine } from '../../utils/richText';

/**
 * Add / edit a single part or service line on a manual invoice.
 * `type` is either 'part' or 'service' and decides which name key the
 * saved object uses, so the payload matches the ManualInvoice schema.
 *
 * When adding a service, the saved services (Manage Services) are fetched
 * first and offered as checkboxes, so several can be added at once (each
 * becomes its own line, quantity 1, at its saved price). "Other" lets the
 * user type any service name instead.
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
    const [selectedIds, setSelectedIds] = useState([]); // ticked saved services
    const [manual, setManual] = useState(false);          // "Other (enter manually)"

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
                setSelectedIds([]);
                setManual(!list.length);
            })
            .catch(() => {
                if (cancelled) return;
                setCatalog([]);
                setCatalogError('Could not load saved services. You can still enter one manually.');
                setSelectedIds([]);
                setManual(true);
            })
            .finally(() => { if (!cancelled) setCatalogLoading(false); });
        return () => { cancelled = true; };
    }, [open, usesCatalog]);

    const selectedServices = catalog.filter((svc) => selectedIds.includes(svc._id));
    const multi = usesCatalog && selectedServices.length > 1;
    const showNameInput = !usesCatalog || manual;
    // quantity / price / discount are edited for one line at a time
    const showDetails = !usesCatalog || manual || selectedServices.length === 1;

    const toggleService = (svc) => {
        setError('');
        setManual(false);
        const next = selectedIds.includes(svc._id)
            ? selectedIds.filter((id) => id !== svc._id)
            : [...selectedIds, svc._id];
        setSelectedIds(next);
        if (next.length === 1) {
            const only = catalog.find((c) => c._id === next[0]);
            setName(only?.name || '');
            setPrice(String(only?.price ?? ''));
        } else {
            setName('');
            setPrice('');
        }
    };

    const toggleManual = () => {
        setError('');
        if (manual) {
            setManual(false);
        } else {
            // "Other" is used on its own, so clear the ticked services
            setManual(true);
            setSelectedIds([]);
        }
        setName('');
        setPrice('');
    };

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
            setSelectedIds([]);
            setManual(false);
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
        if (usesCatalog && !manual && selectedServices.length === 0) {
            setError('Please select at least one service, or choose "Other" to enter one manually.');
            return;
        }
        // Several saved services ticked -> add each as its own line (qty 1, saved price)
        if (multi) {
            selectedServices.forEach((svc) => {
                const unitPrice = toNumber(svc.price);
                onSave({
                    [nameKey]: svc.name,
                    quantity: 1,
                    price: unitPrice,
                    discountPrice: 0,
                    discountType: undefined,
                    effectivePrice: unitPrice,
                });
            });
            onClose();
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
                            <label className="block text-sm text-gray-600 mb-1">
                                Select Services <span className="text-gray-400">(tick one or more)</span>
                            </label>
                            {catalogLoading ? (
                                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500">
                                    <LoaderCircle size={16} className="animate-spin text-amber-500" /> Loading services...
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                                    {catalog.map((svc) => {
                                        const checked = selectedIds.includes(svc._id);
                                        return (
                                            <label
                                                key={svc._id}
                                                className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-amber-50 ${checked ? 'bg-amber-50' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleService(svc)}
                                                    className="mt-1 h-4 w-4 accent-amber-500"
                                                />
                                                <span className="flex-1">
                                                    <span className="block text-sm font-medium text-gray-800">{svc.name}</span>
                                                    <span className="line-clamp-2 block text-xs text-gray-500">
                                                        {svc.description ? `${htmlToLine(svc.description)} · ` : ''}Approx. {formatDuration(svc.estimatedMinutes)}
                                                    </span>
                                                </span>
                                                <span className="text-sm font-semibold text-gray-800">₹{Number(svc.price).toLocaleString('en-IN')}</span>
                                            </label>
                                        );
                                    })}
                                    <label className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-amber-50 ${manual ? 'bg-amber-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={manual}
                                            onChange={toggleManual}
                                            className="mt-1 h-4 w-4 accent-amber-500"
                                        />
                                        <span className="flex-1">
                                            <span className="block text-sm font-medium text-gray-800">Other (enter manually)</span>
                                            <span className="block text-xs text-gray-500">Type your own service name and price</span>
                                        </span>
                                    </label>
                                </div>
                            )}
                            {multi && (
                                <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm">
                                    <div className="flex justify-between font-semibold text-gray-800">
                                        <span>{selectedServices.length} services selected</span>
                                        <span>{formatMoney(selectedServices.reduce((sum, svc) => sum + toNumber(svc.price), 0))}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Each is added as a separate line (quantity 1). Edit a line afterwards to change its quantity or add a discount.
                                    </p>
                                </div>
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

                    {showDetails && (<>
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
                    </>)}

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
                        {editItem ? 'Save Changes' : multi ? `Add ${selectedServices.length} Services` : `Add ${label}`}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
