import { useEffect, useMemo, useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axiosClient from '../service/axiosClient';
import InvoiceSheet from './invoice/InvoiceSheet';
import { invoiceFromOrder } from '../utils/invoiceHtml';

/**
 * Order invoice page (/order/invoice/:id).
 * Uses the same invoice layout as the mobile app, the Console app and the
 * manual-invoice page — see utils/invoiceHtml.js.
 */
const InvoiceTemplate = () => {
  const { id } = useParams();
  const sheetRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/api/admin/order/employee/getorderbyid/${id}`);
        if (!cancelled) setOrder(response.data?.order || response.data?.data || response.data);
      } catch (error) {
        console.log(error);
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const invoice = useMemo(() => invoiceFromOrder(order), [order]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="flex justify-center items-center h-screen">Invoice data not found</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => sheetRef.current?.print()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Printer className="mr-2 h-5 w-5" />
            Print Invoice / Save as PDF
          </button>
        </div>
        <InvoiceSheet ref={sheetRef} invoice={invoice} order={invoice} />
      </div>
    </div>
  );
};

export default InvoiceTemplate;
