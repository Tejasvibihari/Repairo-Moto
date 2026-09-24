import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Pencil } from 'lucide-react';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import CircularLoading from '../../components/ui/CircularLoading';
import {
    formatMoney, getAdminSettings, getManualInvoice, lineTotal, toNumber,
} from '../../service/manualInvoiceApi';

const Line = ({ label, value, bold }) => (
    <div className={`flex justify-between py-1 ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
        <span>{label}</span>
        <span>{value}</span>
    </div>
);

export default function ManualInvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' });

    useEffect(() => {
        (async () => {
            try {
                const [invRes, settingsRes] = await Promise.allSettled([
                    getManualInvoice(id),
                    getAdminSettings(),
                ]);

                if (invRes.status === 'fulfilled') {
                    setInvoice(invRes.value.data?.data || invRes.value.data);
                } else {
                    setSnack({ open: true, message: 'Could not load this invoice.', severity: 'error' });
                }

                if (settingsRes.status === 'fulfilled') {
                    setCompany(settingsRes.value.data?.data || settingsRes.value.data);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return <div className="flex items-center justify-center py-20"><CircularLoading /></div>;
    }

    if (!invoice) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">Invoice not found.</p>
                <button onClick={() => navigate('/manual-invoice')} className="mt-3 text-amber-600 hover:underline">
                    Back to invoices
                </button>
            </div>
        );
    }

    const t = invoice.total || {};
    const pd = invoice.paymentDetails || {};
    const items = [
        ...(invoice.partsUsed || []).map((p) => ({ ...p, label: p.partName, kind: 'Part' })),
        ...(invoice.serviceProvided || []).map((s) => ({ ...s, label: s.serviceName, kind: 'Service' })),
    ];
    const paid = toNumber(pd.amountPaid);
    const payable = toNumber(t.finalPayable ?? t.total);
    const balanceDue = Math.max(payable - paid, 0);

    return (
        <>
            <AlertSnackBar
                open={snack.open}
                message={snack.message}
                severity={snack.severity}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
            />

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-sheet, #invoice-sheet * { visibility: visible; }
                    #invoice-sheet { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 no-print">
                    <button
                        onClick={() => navigate('/manual-invoice')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
                    >
                        <ArrowLeft size={16} /> Back to invoices
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/manual-invoice/${id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Pencil size={16} /> Edit
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium"
                        >
                            <Printer size={16} /> Print / Save PDF
                        </button>
                    </div>
                </div>

                <div id="invoice-sheet" className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between gap-6 pb-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{company?.companyName || 'Repairo Moto'}</h2>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                                {company?.address}
                                {company?.city ? `\n${company.city} ${company.pin || ''}` : ''}
                            </p>
                            {company?.contactNo && <p className="text-sm text-gray-600">Phone: {company.contactNo}</p>}
                            {company?.email && <p className="text-sm text-gray-600">{company.email}</p>}
                            {company?.gstNo && <p className="text-sm text-gray-600">GSTIN: {company.gstNo}</p>}
                        </div>
                        <div className="text-right">
                            <h3 className="text-2xl font-bold text-amber-600">TAX INVOICE</h3>
                            <p className="text-sm text-gray-700 mt-2">No. <span className="font-semibold">{invoice.invoiceNumber}</span></p>
                            <p className="text-sm text-gray-700">
                                Date: {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN') : '-'}
                            </p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-semibold uppercase ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>

                    {/* Bill to / vehicle */}
                    <div className="grid md:grid-cols-2 gap-6 py-6 border-b border-gray-200">
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bill To</h4>
                            <p className="font-medium text-gray-900">{invoice.customerDetails?.name}</p>
                            <p className="text-sm text-gray-600">{invoice.customerDetails?.contactNo}</p>
                            {invoice.customerDetails?.email && <p className="text-sm text-gray-600">{invoice.customerDetails.email}</p>}
                            {invoice.customerDetails?.address && <p className="text-sm text-gray-600">{invoice.customerDetails.address}</p>}
                            {invoice.customerDetails?.city && <p className="text-sm text-gray-600">{invoice.customerDetails.city}</p>}

                            {invoice.businessDetails?.gstin && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-sm font-medium text-gray-800">{invoice.businessDetails.businessName}</p>
                                    <p className="text-sm text-gray-600">GSTIN: {invoice.businessDetails.gstin}</p>
                                    <p className="text-sm text-gray-600">
                                        {[invoice.businessDetails.businessAddress, invoice.businessDetails.businessCity,
                                        invoice.businessDetails.businessState, invoice.businessDetails.businessPincode]
                                            .filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Vehicle</h4>
                            <p className="font-medium text-gray-900">
                                {[invoice.vehicleDetails?.brand, invoice.vehicleDetails?.model].filter(Boolean).join(' ') || '-'}
                            </p>
                            {invoice.vehicleDetails?.modelName && <p className="text-sm text-gray-600">{invoice.vehicleDetails.modelName}</p>}
                            <p className="text-sm text-gray-600">
                                {[invoice.vehicleDetails?.cc && `${invoice.vehicleDetails.cc}cc`, invoice.vehicleDetails?.bs]
                                    .filter(Boolean).join(' • ')}
                            </p>
                        </div>
                    </div>

                    {/* Items */}
                    <table className="w-full text-sm my-6">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-500">
                                <th className="text-left py-2">#</th>
                                <th className="text-left py-2">Description</th>
                                <th className="text-left py-2">Type</th>
                                <th className="text-right py-2">Qty</th>
                                <th className="text-right py-2">Rate</th>
                                <th className="text-right py-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    <td className="py-2 text-gray-500">{i + 1}</td>
                                    <td className="py-2 text-gray-900">{item.label}</td>
                                    <td className="py-2 text-gray-500">{item.kind}</td>
                                    <td className="py-2 text-right">{item.quantity}</td>
                                    <td className="py-2 text-right">{formatMoney(item.effectivePrice ?? item.price)}</td>
                                    <td className="py-2 text-right font-medium">{formatMoney(lineTotal(item))}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-80 text-sm">
                            <Line label="Subtotal" value={formatMoney(t.subTotal)} />
                            {toNumber(t.discount) > 0 && (
                                <Line
                                    label={`Discount${t.discountType === 'percent' ? ` (${t.discount}%)` : ''}`}
                                    value={`-${t.discountType === 'percent' ? formatMoney(toNumber(t.subTotal) * toNumber(t.discount) / 100) : formatMoney(t.discount)}`}
                                />
                            )}
                            <Line label="Taxable Value" value={formatMoney(t.baseAmount)} />
                            <Line label={`SGST (${t.sgstRate || 0}%)`} value={formatMoney(t.sgst)} />
                            <Line label={`CGST (${t.cgstRate || 0}%)`} value={formatMoney(t.cgst)} />
                            <div className="border-t border-gray-300 mt-2 pt-2">
                                <Line label="Total Payable" value={formatMoney(payable)} bold />
                                <Line label={`Paid (${(pd.method || 'cash').replace('_', ' ')})`} value={formatMoney(paid)} />
                                {balanceDue > 0 && (
                                    <div className="flex justify-between py-1 font-semibold text-red-600">
                                        <span>Balance Due</span>
                                        <span>{formatMoney(balanceDue)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment details on unpaid invoices */}
                    {balanceDue > 0 && (company?.upiId || company?.bankAccountNumber) && (
                        <div className="mt-6 pt-6 border-t border-gray-200 text-sm">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pay Balance To</h4>
                            {company.upiId && <p className="text-gray-700">UPI: {company.upiId} ({company.upiPayeeName || company.companyName})</p>}
                            {company.bankAccountNumber && (
                                <p className="text-gray-700">
                                    {company.bankName} • A/c {company.bankAccountNumber} • IFSC {company.bankIFSC}
                                    {company.bankAccountName ? ` • ${company.bankAccountName}` : ''}
                                </p>
                            )}
                        </div>
                    )}

                    <p className="mt-8 text-xs text-gray-400 text-center">
                        This is a computer-generated invoice and does not require a signature.
                    </p>
                </div>
            </div>
        </>
    );
}
