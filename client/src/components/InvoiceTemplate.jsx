import { useState, useEffect } from 'react';
import { Printer, Download } from 'lucide-react';
import axiosClient from '../service/axiosClient';
import { useParams } from 'react-router-dom';
const InvoiceTemplate = () => {
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        // Simulating data fetch from backend
        // In a real application, you would fetch this data from your API
        const getOrderDetail = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/api/admin/order/employee/getorderbyid/${id}`)
                const data = response.data;
                console.log(response)
                setInvoiceData(response.data)

                setLoading(false)
            } catch (error) {
                console.log(error)
            }
        }
        getOrderDetail()

        setLoading(false);
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Create a printable version by cloning the invoice div
        const invoiceElement = document.getElementById('invoice-container');
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoiceData._id.$oid}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Poppins', sans-serif;
            }
            
            body {
              background-color: white;
            }
            
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background-color: #fff;
              padding: 40px;
              position: relative;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 1px solid #e0e0e0;
            }
            
            .logo {
              width: 180px;
              height: auto;
            }
            
            .invoice-details {
              text-align: right;
            }
            
            .invoice-details h1 {
              color: #2c3e50;
              font-size: 28px;
              margin-bottom: 5px;
            }
            
            .invoice-details p {
              color: #7f8c8d;
              font-size: 14px;
            }
            
            .address-container {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            
            .address-box {
              width: 48%;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            
            .address-box h3 {
              color: #e2a731;
              font-size: 16px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .address-box p {
              color: #34495e;
              font-size: 14px;
              line-height: 1.6;
            }
            
            .vehicle-info {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            
            .vehicle-info h3 {
              color: #e2a731;
              font-size: 16px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .vehicle-info p {
              color: #34495e;
              font-size: 14px;
              margin-bottom: 5px;
            }
            
            .gst-info {
              background-color: #fef9ea;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 30px;
              border-left: 4px solid #e2a731;
            }
            
            .gst-info p {
              color: #8a6613;
              font-size: 14px;
              font-weight: 500;
            }
            
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            
            .invoice-table th {
              background-color: #e2a731;
              color: white;
              padding: 12px 15px;
              text-align: left;
              font-weight: 500;
            }
            
            .invoice-table tr:nth-child(even) {
              background-color: #fef9ea;
            }
            
            .invoice-table td {
              padding: 12px 15px;
              border-bottom: 1px solid #e0e0e0;
            }
            
            .total-container {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 30px;
            }
            
            .total-box {
              width: 320px;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              overflow: hidden;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 15px;
              border-bottom: 1px solid #e0e0e0;
            }
            
            .total-row:last-child {
              border-bottom: none;
              background-color: #e2a731;
              color: white;
            }
            
            .total-row .label {
              font-weight: 500;
            }
            
            .total-row:last-child .label,
            .total-row:last-child .value {
              font-weight: 600;
              font-size: 16px;
            }
            
            .services-list {
              margin-bottom: 30px;
            }
            
            .services-list h3 {
              color: #e2a731;
              margin-bottom: 10px;
              font-size: 16px;
            }
            
            .services-list ul {
              list-style-type: disc;
              padding-left: 20px;
            }
            
            .services-list li {
              color: #34495e;
              font-size: 14px;
              margin-bottom: 5px;
            }
            
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
            }
            
            .qr-code {
              width: 120px;
              height: 120px;
            }
            
            .terms {
              width: 70%;
            }
            
            .terms h4 {
              color: #e2a731;
              margin-bottom: 10px;
              font-size: 14px;
            }
            
            .terms p {
              color: #7f8c8d;
              font-size: 12px;
              line-height: 1.6;
            }
            
            .thank-you {
              text-align: center;
              margin-top: 30px;
              color: #e2a731;
              font-weight: 500;
            }
            
            .no-print {
              display: none;
            }
          </style>
        </head>
        <body>
          ${invoiceElement.innerHTML}
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();

        // Give the browser a moment to render the HTML before saving
        setTimeout(() => {
            printWindow.print();
            // Optional: close the window after printing
            // printWindow.close();
        }, 250);
    };

    // Format date from ISO string
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Generate invoice number using order ID
    const generateInvoiceNumber = (id) => {
        if (!id || !id.$oid) return 'INV-2025-0001';
        const shortId = id.$oid.slice(-6);
        return `INV-2025-${shortId}`;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading invoice...</div>;
    }

    if (!invoiceData) {
        return <div className="flex justify-center items-center h-screen">Invoice data not found</div>;
    }

    // Calculate total parts and service cost
    const calculateTotal = () => {
        let partsTotal = 0;
        let servicesTotal = 0;

        if (invoiceData.partsUsed && invoiceData.partsUsed.length > 0) {
            invoiceData.partsUsed.forEach(part => {
                partsTotal += (part.discountPrice || part.price) * part.quantity;
            });
        }

        if (invoiceData.serviceProvided && invoiceData.serviceProvided.length > 0) {
            invoiceData.serviceProvided.forEach(service => {
                servicesTotal += (service.discountPrice || service.price) * service.quantity;
            });
        }

        return {
            partsTotal,
            servicesTotal,
            subTotal: partsTotal + servicesTotal
        };
    };

    const totals = calculateTotal();
    const invoiceNumber = generateInvoiceNumber(invoiceData._id);
    const invoiceDate = formatDate(invoiceData.invoiceDate?.$date);
    const dueDate = new Date(invoiceData.invoiceDate?.$date);
    dueDate.setDate(dueDate.getDate() + 15);
    const formattedDueDate = formatDate(dueDate);

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="max-w-4xl mx-auto">


                <div id="invoice-container" className="bg-white shadow-lg rounded-lg p-8">
                    <div className="flex justify-between items-center border-b pb-6 mb-6">
                        <div className="flex items-center">
                            <img src="/logo/logo72.png" alt="Repairo Moto Service Center" className="h-20" />
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
                            <p className="text-gray-600">Invoice No: {invoiceNumber}</p>
                            <p className="text-gray-600">Date: {invoiceDate}</p>
                            <p className="text-gray-600">Due Date: {formattedDueDate}</p>
                        </div>
                    </div>

                    <div className="flex justify-between mb-6">
                        <div className="w-1/2 pr-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-yellow-600 uppercase font-medium mb-2 text-sm">From</h3>
                                <p className="text-gray-700">
                                    <strong>Repairo moto</strong><br />
                                    5c/12 Manna Singh Lane, Vivekanand Marg,<br />
                                    North S.K Puri, Boring Road, Patna - 13 India<br />
                                    Phone: +91 9229207021<br />
                                    Email: contact@repairomoto.in
                                </p>
                            </div>
                        </div>
                        <div className="w-1/2 pl-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-yellow-600 uppercase font-medium mb-2 text-sm">To</h3>
                                <p className="text-gray-700">
                                    <strong>{invoiceData.name}</strong><br />
                                    {invoiceData.city || 'City'}<br />
                                    India<br />
                                    Phone: {invoiceData.contactNo}<br />
                                </p>
                            </div>
                        </div>
                    </div>



                    <div className="bg-yellow-50 p-4 rounded-md mb-6 border-l-4 border-yellow-500">
                        <p className="text-yellow-800 font-medium">Order ID: {invoiceData._id}</p>
                        <p className="text-yellow-800 font-medium">Booking Time: {new Date(invoiceData.preferredTime).toLocaleString()}</p>
                    </div>

                    <h3 className="font-medium text-lg mb-2">Parts Used</h3>
                    <table className="w-full mb-6">
                        <thead>
                            <tr className="bg-yellow-500 text-white">
                                <th className="text-left py-3 px-4">No.</th>
                                <th className="text-left py-3 px-4">Item Description</th>
                                <th className="text-left py-3 px-4">Quantity</th>
                                <th className="text-left py-3 px-4">Unit Price</th>
                                <th className="text-left py-3 px-4">Discount</th>
                                <th className="text-left py-3 px-4">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.partsUsed && invoiceData.partsUsed.map((part, index) => {
                                const discountAmount = part.price - part.discountPrice;
                                const discountPercentage = ((discountAmount / part.price) * 100).toFixed(0);
                                const hasDiscount = discountAmount > 0;

                                return (
                                    <tr key={part._id.$oid} className={index % 2 === 1 ? 'bg-yellow-50' : ''}>
                                        <td className="border-b border-gray-200 py-3 px-4">{index + 1}</td>
                                        <td className="border-b border-gray-200 py-3 px-4">{part.partName}</td>
                                        <td className="border-b border-gray-200 py-3 px-4">{part.quantity}</td>
                                        <td className="border-b border-gray-200 py-3 px-4">₹{part.price.toFixed(2)}</td>
                                        <td className="border-b border-gray-200 py-3 px-4">
                                            {hasDiscount ? (
                                                invoiceData.total.discountType === 'percentage' ?
                                                    `${discountPercentage}%` :
                                                    `₹${discountAmount.toFixed(2)}`
                                            ) : '-'}
                                        </td>
                                        <td className="border-b border-gray-200 py-3 px-4">₹{(part.discountPrice * part.quantity).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <h3 className="font-medium text-lg mb-2">Services Provided</h3>
                    <table className="w-full mb-6">
                        <thead>
                            <tr className="bg-yellow-500 text-white">
                                <th className="text-left py-3 px-4">No.</th>
                                <th className="text-left py-3 px-4">Service Description</th>
                                <th className="text-left py-3 px-4">Quantity</th>
                                <th className="text-left py-3 px-4">Unit Price</th>
                                <th className="text-left py-3 px-4">Discount</th>
                                <th className="text-left py-3 px-4">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.serviceProvided && invoiceData.serviceProvided.map((service, index) => {
                                const discountAmount = service.price - (service.discountPrice || service.price);
                                const discountPercentage = ((discountAmount / service.price) * 100).toFixed(0);
                                const hasDiscount = discountAmount > 0;
                                const finalPrice = (service.discountPrice || service.price) * service.quantity;

                                return (
                                    <tr key={service._id.$oid} className={index % 2 === 1 ? 'bg-yellow-50' : ''}>
                                        <td className="border-b border-gray-200 py-3 px-4">{index + 1}</td>
                                        <td className="border-b border-gray-200 py-3 px-4">{service.serviceName}</td>
                                        <td className="border-b border-gray-200 py-3 px-4">{service.quantity}</td>
                                        <td className="border-b border-gray-200 py-3 px-4">₹{service.price.toFixed(2)}</td>
                                        <td className="border-b border-gray-200 py-3 px-4">
                                            {hasDiscount ? (
                                                invoiceData.total.discountType === 'percentage' ?
                                                    `${discountPercentage}%` :
                                                    `₹${discountAmount.toFixed(2)}`
                                            ) : '-'}
                                        </td>
                                        <td className="border-b border-gray-200 py-3 px-4">
                                            ₹{finalPrice.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="flex justify-end mb-6">
                        <div className="w-80 border border-gray-200 rounded-md overflow-hidden">
                            <div className="flex justify-between px-4 py-3 border-b border-gray-200">
                                <span className="font-medium">Subtotal:</span>
                                <span>₹{invoiceData.total.subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between px-4 py-3 border-b border-gray-200">
                                <span className="font-medium">Discount ({invoiceData.total.discount}%):</span>
                                <span>₹{(invoiceData.total.subTotal * (invoiceData.total.discount / 100)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between px-4 py-3 bg-yellow-500 text-white">
                                <span className="font-semibold">TOTAL:</span>
                                <span className="font-semibold">₹{invoiceData.total.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                        <h3 className="text-yellow-600 uppercase font-medium mb-2 text-sm">Vehicle Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-700"><strong>Brand:</strong> {invoiceData.selectedBrand}</p>
                                <p className="text-gray-700"><strong>Model:</strong> {invoiceData.selectedModel !== 'other' ? invoiceData.selectedModel : invoiceData.modelName}</p>
                            </div>
                            <div>
                                <p className="text-gray-700"><strong>CC Rating:</strong> {invoiceData.cc}</p>
                                <p className="text-gray-700"><strong>Mechanic:</strong> {invoiceData.assignedMechanic}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                        <h3 className="text-yellow-600 font-medium mb-2">Services Requested</h3>
                        <ul className="list-disc pl-6">
                            {invoiceData.services && invoiceData.services.map((service, index) => (
                                <li key={index} className="text-gray-700 mb-1">{service}</li>
                            ))}
                            {invoiceData.otherService && <li className="text-gray-700 mb-1">{invoiceData.otherService}</li>}
                        </ul>
                        <p className="text-gray-700 mt-2"><strong>Reported Issues:</strong> {invoiceData.issues}</p>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <div className="w-2/3">
                            <h4 className="text-yellow-600 font-medium mb-2">Terms & Conditions</h4>
                            <p className="text-gray-500 text-sm">
                                Payment is due within 15 days from the date of invoice. Late payment is subject to interest charges at 1.5% per month.
                                This invoice is computer-generated and doesn't require a signature.
                            </p>
                            <div className="text-center mt-6 text-yellow-600 font-medium">
                                Thank you for choosing Repairo Moto Service Center!
                            </div>
                        </div>
                        <img className="w-32 h-32" src="/paymentqr.jpeg" alt="Payment QR Code" />
                    </div>
                </div>
                <div className="flex justify-center mb-4 space-x-4 my-4">
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Printer className="mr-2 h-5 w-5" />
                        Print Invoice/Downlooad
                    </button>
                    {/* <button
                        onClick={handleDownload}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        <Download className="mr-2 h-5 w-5" />
                        Download PDF
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;