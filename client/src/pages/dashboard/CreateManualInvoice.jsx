import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    User, Bike, Package, Wrench, Plus, Pencil, Trash2,
    Receipt, CreditCard, Building2, ArrowLeft, Save,
} from 'lucide-react';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import CircularLoading from '../../components/ui/CircularLoading';
import LineItemDialog from '../../components/invoice/LineItemDialog';
import {
    calcTotals, createManualInvoice, formatMoney, getManualInvoice,
    lineTotal, PAYMENT_METHODS, toNumber, updateManualInvoice,
} from '../../service/manualInvoiceApi';

const SectionCard = ({ title, icon, children, action }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                {icon ? React.createElement(icon, { size: 18, className: 'text-amber-500' }) : null} {title}
            </h3>
            {action}
        </div>
        {children}
    </div>
);

const Field = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
        />
    </div>
);

const ItemRow = ({ item, nameKey, onEdit, onRemove }) => (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="min-w-0">
            <p className="font-medium text-gray-800 truncate">{item[nameKey]}</p>
            <p className="text-xs text-gray-500">
                {item.quantity} × {formatMoney(item.effectivePrice ?? item.price)}
                {toNumber(item.discountPrice) > 0 && (
                    <span className="ml-2 text-green-600">
                        ({item.discountType === 'percent' ? `${item.discountPrice}% off` : `${formatMoney(item.discountPrice)} off`})
                    </span>
                )}
            </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-semibold text-gray-800">{formatMoney(lineTotal(item))}</span>
            <button onClick={onEdit} className="p-1.5 rounded hover:bg-gray-200 text-gray-500">
                <Pencil size={15} />
            </button>
            <button onClick={onRemove} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                <Trash2 size={15} />
            </button>
        </div>
    </div>
);

export default function CreateManualInvoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);
    const [existing, setExisting] = useState(null);

    const [customer, setCustomer] = useState({ name: '', email: '', contactNo: '', address: '', city: '' });
    const [vehicle, setVehicle] = useState({ brand: '', model: '', modelName: '', cc: '', bs: '' });
    const [gstEnabled, setGstEnabled] = useState(false);
    const [business, setBusiness] = useState({
        gstin: '', businessName: '', businessAddress: '',
        businessCity: '', businessState: '', businessPincode: '',
    });

    const [parts, setParts] = useState([]);
    const [services, setServices] = useState([]);
    const [dialog, setDialog] = useState({ open: false, type: 'part', index: null });

    const [discount, setDiscount] = useState('');
    const [discountType, setDiscountType] = useState('flat');
    const [sgstRate, setSgstRate] = useState('9');
    const [cgstRate, setCgstRate] = useState('9');

    const [payMethod, setPayMethod] = useState('cash');
    const [rzpPaymentId, setRzpPaymentId] = useState('');
    const [rzpOrderId, setRzpOrderId] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [fullyPaid, setFullyPaid] = useState(true);

    const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });

    useEffect(() => {
        if (!isEditing) return;
        (async () => {
            try {
                const res = await getManualInvoice(id);
                const invoice = res.data?.data || res.data;
                setExisting(invoice);

                const cust = invoice.customerDetails || {};
                setCustomer({
                    name: cust.name || '', email: cust.email || '', contactNo: cust.contactNo || '',
                    address: cust.address || '', city: cust.city || '',
                });

                const veh = invoice.vehicleDetails || {};
                setVehicle({
                    brand: veh.brand || '', model: veh.model || '', modelName: veh.modelName || '',
                    cc: veh.cc || '', bs: veh.bs || '',
                });

                const bus = invoice.businessDetails || {};
                setGstEnabled(Boolean(bus.gstin));
                setBusiness({
                    gstin: bus.gstin || '', businessName: bus.businessName || '',
                    businessAddress: bus.businessAddress || '', businessCity: bus.businessCity || '',
                    businessState: bus.businessState || '', businessPincode: bus.businessPincode || '',
                });

                setParts(invoice.partsUsed || []);
                setServices(invoice.serviceProvided || []);

                const t = invoice.total || {};
                setDiscount(t.discount ? String(t.discount) : '');
                setDiscountType(t.discountType || 'flat');
                setSgstRate(String(t.sgstRate ?? 9));
                setCgstRate(String(t.cgstRate ?? 9));

                const pd = invoice.paymentDetails || {};
                setPayMethod(pd.method || 'cash');
                setRzpPaymentId(pd.razorpayPaymentId || '');
                setRzpOrderId(pd.razorpayOrderId || '');
                setAmountPaid(String(pd.amountPaid ?? t.totalAmountPaid ?? ''));
                setFullyPaid(invoice.status === 'paid');
            } catch (error) {
                showSnack(error.response?.data?.message || 'Could not load this invoice.', 'error');
            } finally {
                setFetching(false);
            }
        })();
    }, [id, isEditing]);

    const totals = useMemo(
        () => calcTotals({ parts, services, discount, discountType, sgstRate, cgstRate }),
        [parts, services, discount, discountType, sgstRate, cgstRate],
    );

    const balanceDue = Math.max(totals.finalPayable - toNumber(amountPaid), 0);

    const openDialog = (type, index = null) => setDialog({ open: true, type, index });
    const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

    const handleSaveItem = (item) => {
        const { type, index } = dialog;
        const setter = type === 'part' ? setParts : setServices;
        setter((list) => (index !== null ? list.map((x, i) => (i === index ? item : x)) : [...list, item]));
    };

    const editingItem = dialog.index !== null
        ? (dialog.type === 'part' ? parts : services)[dialog.index]
        : null;

    const handleSubmit = async () => {
        if (!customer.name.trim() || !customer.contactNo.trim()) {
            showSnack('Customer name and contact number are required.', 'warning');
            return;
        }
        if (parts.length === 0 && services.length === 0) {
            showSnack('Add at least one part or service.', 'warning');
            return;
        }
        if (totals.subTotal <= 0) {
            showSnack('Subtotal must be greater than zero.', 'warning');
            return;
        }

        const amountPaidNum = toNumber(amountPaid);
        const totalPaid = fullyPaid ? (amountPaidNum || totals.finalPayable) : amountPaidNum;

        if (fullyPaid && totalPaid <= 0) {
            showSnack('Amount paid must be greater than zero for a paid invoice.', 'warning');
            return;
        }

        const payload = {
            invoiceNumber: isEditing ? existing.invoiceNumber : `INV-${Date.now()}`,
            invoiceDate: isEditing ? existing.invoiceDate : new Date().toISOString(),
            customerDetails: {
                name: customer.name.trim(),
                email: customer.email.trim() || undefined,
                contactNo: customer.contactNo.trim(),
                address: customer.address.trim() || undefined,
                city: customer.city.trim() || undefined,
            },
            vehicleDetails: {
                brand: vehicle.brand.trim() || undefined,
                model: vehicle.model.trim() || undefined,
                modelName: vehicle.modelName.trim() || undefined,
                cc: vehicle.cc.trim() || undefined,
                bs: vehicle.bs.trim() || undefined,
            },
            partsUsed: parts,
            serviceProvided: services,
            total: { ...totals, totalAmountPaid: totalPaid },
            paymentDetails: {
                method: payMethod,
                razorpayPaymentId: rzpPaymentId.trim() || null,
                razorpayOrderId: rzpOrderId.trim() || null,
                amountPaid: totalPaid,
                walletAmountUsed: 0,
                totalSettled: totalPaid,
                paymentDate: fullyPaid ? new Date().toISOString() : null,
            },
            status: fullyPaid ? 'paid' : 'unpaid',
        };

        if (!payload.total.discountType) delete payload.total.discountType;

        if (gstEnabled) {
            const details = {
                gstin: business.gstin.trim().toUpperCase() || undefined,
                businessName: business.businessName.trim() || undefined,
                businessAddress: business.businessAddress.trim() || undefined,
                businessCity: business.businessCity.trim() || undefined,
                businessState: business.businessState.trim() || undefined,
                businessPincode: business.businessPincode.trim() || undefined,
            };
            Object.keys(details).forEach((k) => details[k] === undefined && delete details[k]);
            if (Object.keys(details).length > 0) payload.businessDetails = details;
        }

        [payload.customerDetails, payload.vehicleDetails].forEach((obj) => {
            Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
        });

        setLoading(true);
        try {
            const res = isEditing
                ? await updateManualInvoice(id, payload)
                : await createManualInvoice(payload);
            const saved = res.data?.data || res.data;
            showSnack(isEditing ? 'Invoice updated.' : `Invoice ${saved.invoiceNumber} created.`);
            setTimeout(() => navigate(`/manual-invoice/${saved._id}`), 800);
        } catch (error) {
            showSnack(error.response?.data?.message || 'Could not save the invoice.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-20">
                <CircularLoading />
            </div>
        );
    }

    return (
        <>
            <AlertSnackBar
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
            />

            <LineItemDialog
                open={dialog.open}
                onClose={closeDialog}
                onSave={handleSaveItem}
                type={dialog.type}
                editItem={editingItem}
            />

            <div className="max-w-6xl mx-auto px-4 py-6">
                <button
                    onClick={() => navigate('/manual-invoice')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft size={16} /> Back to invoices
                </button>

                <h1 className="text-2xl font-bold mb-1">
                    {isEditing ? `Edit Invoice ${existing?.invoiceNumber || ''}` : 'Create Manual Invoice'}
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    For walk-in, phone and off-app jobs. Customer bookings come in through the app and are billed from Manage Orders.
                </p>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <SectionCard title="Customer Details" icon={User}>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Name *" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} placeholder="Customer name" />
                                <Field label="Contact Number *" value={customer.contactNo} onChange={(v) => setCustomer({ ...customer, contactNo: v })} placeholder="10-digit mobile" />
                                <Field label="Email" value={customer.email} onChange={(v) => setCustomer({ ...customer, email: v })} placeholder="Optional" />
                                <Field label="City" value={customer.city} onChange={(v) => setCustomer({ ...customer, city: v })} placeholder="e.g. PATNA" />
                                <div className="md:col-span-2">
                                    <Field label="Address" value={customer.address} onChange={(v) => setCustomer({ ...customer, address: v })} placeholder="Optional" />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Vehicle Details" icon={Bike}>
                            <div className="grid md:grid-cols-3 gap-4">
                                <Field label="Brand" value={vehicle.brand} onChange={(v) => setVehicle({ ...vehicle, brand: v })} placeholder="e.g. Hero" />
                                <Field label="Model" value={vehicle.model} onChange={(v) => setVehicle({ ...vehicle, model: v })} placeholder="e.g. Splendor" />
                                <Field label="Model Name" value={vehicle.modelName} onChange={(v) => setVehicle({ ...vehicle, modelName: v })} placeholder="Optional" />
                                <Field label="CC" value={vehicle.cc} onChange={(v) => setVehicle({ ...vehicle, cc: v })} placeholder="e.g. 100" />
                                <Field label="BS Standard" value={vehicle.bs} onChange={(v) => setVehicle({ ...vehicle, bs: v })} placeholder="e.g. BS6" />
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Parts Used" icon={Package}
                            action={
                                <button onClick={() => openDialog('part')} className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700">
                                    <Plus size={16} /> Add Part
                                </button>
                            }
                        >
                            {parts.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No parts added</p>
                            ) : (
                                <div className="space-y-2">
                                    {parts.map((item, i) => (
                                        <ItemRow
                                            key={i}
                                            item={item}
                                            nameKey="partName"
                                            onEdit={() => openDialog('part', i)}
                                            onRemove={() => setParts((p) => p.filter((_, idx) => idx !== i))}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard
                            title="Services Provided" icon={Wrench}
                            action={
                                <button onClick={() => openDialog('service')} className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700">
                                    <Plus size={16} /> Add Service
                                </button>
                            }
                        >
                            {services.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No services added</p>
                            ) : (
                                <div className="space-y-2">
                                    {services.map((item, i) => (
                                        <ItemRow
                                            key={i}
                                            item={item}
                                            nameKey="serviceName"
                                            onEdit={() => openDialog('service', i)}
                                            onRemove={() => setServices((s) => s.filter((_, idx) => idx !== i))}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard
                            title="GST / Business Details" icon={Building2}
                            action={
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={gstEnabled}
                                        onChange={(e) => setGstEnabled(e.target.checked)}
                                        className="accent-amber-500"
                                    />
                                    GST invoice
                                </label>
                            }
                        >
                            {gstEnabled ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Field label="GSTIN" value={business.gstin} onChange={(v) => setBusiness({ ...business, gstin: v })} placeholder="e.g. 10AAAAA0000A1Z5" />
                                    <Field label="Business Name" value={business.businessName} onChange={(v) => setBusiness({ ...business, businessName: v })} />
                                    <Field label="Business Address" value={business.businessAddress} onChange={(v) => setBusiness({ ...business, businessAddress: v })} />
                                    <Field label="City" value={business.businessCity} onChange={(v) => setBusiness({ ...business, businessCity: v })} />
                                    <Field label="State" value={business.businessState} onChange={(v) => setBusiness({ ...business, businessState: v })} />
                                    <Field label="Pincode" value={business.businessPincode} onChange={(v) => setBusiness({ ...business, businessPincode: v })} />
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">Turn this on to bill a registered business and print their GSTIN on the invoice.</p>
                            )}
                        </SectionCard>
                    </div>

                    {/* Summary rail */}
                    <div className="space-y-6">
                        <SectionCard title="Billing Summary" icon={Receipt}>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Discount</label>
                                    <input
                                        type="number" min="0" value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Type</label>
                                    <select
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="flat">₹ Flat</option>
                                        <option value="percent">% Percent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">SGST %</label>
                                    <input
                                        type="number" min="0" max="100" value={sgstRate}
                                        onChange={(e) => setSgstRate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">CGST %</label>
                                    <input
                                        type="number" min="0" max="100" value={cgstRate}
                                        onChange={(e) => setCgstRate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatMoney(totals.subTotal)}</span></div>
                                {totals.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-{discountType === 'percent' ? `${totals.discount}%` : formatMoney(totals.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between"><span className="text-gray-500">Taxable Value</span><span>{formatMoney(totals.baseAmount)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">SGST ({totals.sgstRate}%)</span><span>{formatMoney(totals.sgst)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">CGST ({totals.cgstRate}%)</span><span>{formatMoney(totals.cgst)}</span></div>
                                <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-base">
                                    <span>Total Payable</span>
                                    <span className="text-amber-600">{formatMoney(totals.finalPayable)}</span>
                                </div>
                                <p className="text-xs text-gray-400 pt-1">GST is inclusive — tax is calculated out of the amount above.</p>
                            </div>
                        </SectionCard>

                        <SectionCard title="Payment" icon={CreditCard}>
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={fullyPaid}
                                        onChange={(e) => setFullyPaid(e.target.checked)}
                                        className="accent-amber-500"
                                    />
                                    Payment collected in full
                                </label>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Method</label>
                                    <select
                                        value={payMethod}
                                        onChange={(e) => setPayMethod(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        {PAYMENT_METHODS.map((m) => (
                                            <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Amount Paid (₹)</label>
                                    <input
                                        type="number" min="0" value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        placeholder={fullyPaid ? String(totals.finalPayable.toFixed(2)) : '0'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

                                {payMethod === 'razorpay' && (
                                    <>
                                        <Field label="Razorpay Payment ID" value={rzpPaymentId} onChange={setRzpPaymentId} placeholder="pay_xxx" />
                                        <Field label="Razorpay Order ID" value={rzpOrderId} onChange={setRzpOrderId} placeholder="order_xxx" />
                                    </>
                                )}

                                {!fullyPaid && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm flex justify-between">
                                        <span className="text-red-700">Balance due</span>
                                        <span className="font-semibold text-red-700">{formatMoney(balanceDue)}</span>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold flex items-center justify-center gap-2 transition"
                        >
                            {loading ? <CircularLoading size={20} /> : <><Save size={18} /> {isEditing ? 'Save Changes' : 'Create Invoice'}</>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
