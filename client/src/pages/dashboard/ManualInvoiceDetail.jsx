import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Pencil } from 'lucide-react';
import AlertSnackBar from '../../components/ui/AlertSnackBar';
import CircularLoading from '../../components/ui/CircularLoading';
import InvoiceSheet from '../../components/invoice/InvoiceSheet';
import { getManualInvoice } from '../../service/manualInvoiceApi';

export default function ManualInvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const sheetRef = useRef(null);
    const invoiceBase = location.pathname.startsWith('/employee/') ? '/employee/invoices' : '/manual-invoice';

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' });

    useEffect(() => {
        (async () => {
            try {
                const res = await getManualInvoice(id);
                setInvoice(res.data?.data || res.data);
            } catch {
                setSnack({ open: true, message: 'Could not load this invoice.', severity: 'error' });
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
                <button onClick={() => navigate(invoiceBase)} className="mt-3 text-amber-600 hover:underline">
                    Back to invoices
                </button>
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

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <button
                        onClick={() => navigate(invoiceBase)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
                    >
                        <ArrowLeft size={16} /> Back to invoices
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`${invoiceBase}/${id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Pencil size={16} /> Edit
                        </button>
                        <button
                            onClick={() => sheetRef.current?.print()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium"
                        >
                            <Printer size={16} /> Print / Save PDF
                        </button>
                    </div>
                </div>

                {/* Same layout as the mobile app, Console app and order invoice page */}
                <InvoiceSheet ref={sheetRef} invoice={invoice} order={invoice} />
            </div>
        </>
    );
}
