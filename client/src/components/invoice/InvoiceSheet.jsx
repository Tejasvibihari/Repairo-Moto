import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';
import { buildInvoiceHTML, buildUpiString, getAmountDue } from '../../utils/invoiceHtml';

/**
 * The one invoice view used across the web dashboard.
 *
 * It renders the SAME paginated HTML that the mobile app and the Console app
 * turn into a PDF (utils/invoiceHtml.js), inside an iframe so the invoice's
 * own CSS can't leak into — or be affected by — the dashboard's Tailwind styles.
 * Call ref.print() to open the browser's print dialog ("Save as PDF").
 *
 * Props
 *   invoice : invoice data (use invoiceFromOrder() for a raw order document)
 *   order   : the order, for orderId + mechanics (defaults to the invoice itself)
 */
const InvoiceSheet = forwardRef(function InvoiceSheet({ invoice, order }, ref) {
    const iframeRef = useRef(null);
    const [height, setHeight] = useState(1200);

    const html = useMemo(() => {
        if (!invoice) return '';
        const source = order || invoice;
        const qrSvg = renderToStaticMarkup(
            <QRCodeSVG value={buildUpiString(getAmountDue(invoice, source))} size={128} level="M" marginSize={2} />
        );
        return buildInvoiceHTML(invoice, source, {
            qrSvg,
            logoDataUri: `${window.location.origin}/logo/logo72.png`,
            pageWidth: '210mm',
            pageHeight: '297mm',
            screenPreview: true,
        });
    }, [invoice, order]);

    const fitToContent = () => {
        const doc = iframeRef.current?.contentDocument;
        if (doc?.documentElement) setHeight(doc.documentElement.scrollHeight);
    };

    useImperativeHandle(ref, () => ({
        print: () => {
            const win = iframeRef.current?.contentWindow;
            if (!win) return;
            win.focus();
            win.print();
        },
    }));

    if (!invoice) return null;

    return (
        <div className="overflow-x-auto rounded-lg">
            <iframe
                ref={iframeRef}
                title={`Invoice ${invoice.invoiceNumber ?? ''}`}
                srcDoc={html}
                onLoad={fitToContent}
                style={{ width: '100%', minWidth: '800px', height, border: 0, display: 'block' }}
            />
        </div>
    );
});

export default InvoiceSheet;
