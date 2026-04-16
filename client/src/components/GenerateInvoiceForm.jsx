import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../service/axiosClient';
import AlertSnackBar from './ui/AlertSnackBar';

const GenerateInvoiceForm = () => {
    const [loading, setLoading] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

    const [orderData, setOrderData] = useState({});
    const [partsAndServices, setPartsAndServices] = useState([]);
    const [customerDetails, setCustomerDetails] = useState({});
    const [fromDetails] = useState({
        companyName: "Repairo Moto",
        address: "123 Mechanic Street, Workshop Area",
        city: "New Delhi",
        pin: "110001",
        contactNo: "011-12345678",
        email: "contact@expressbikeservice.com",
        gstNo: "27AADCB2230M1ZT"
    });
    const [invoiceDetails, setInvoiceDetails] = useState({
        invoiceDate: new Date().toISOString().slice(0, 10)
    });
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [totalDiscountType, setTotalDiscountType] = useState("percentage");

    // GST state (rates as percentages)
    const [sgstRate, setSgstRate] = useState(9);
    const [cgstRate, setCgstRate] = useState(9);

    const { id } = useParams();

    useEffect(() => {
        const getOrderDetail = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/api/admin/order/employee/getorderbyid/${id}`);
                const data = response.data;
                setOrderData(data);

                setCustomerDetails({
                    name: data.name || '',
                    contactNo: data.contactNo || '',
                    city: data.city || '',
                    vehicleDetails: `${data.selectedBrand || ''} ${data.selectedModel || ''} (${data.cc || ''})`
                });

                const servicesProvided = data.serviceProvided?.map(service => ({
                    type: 'service',
                    name: service.serviceName,
                    quantity: service.quantity,
                    price: service.price,
                    discountPrice: service.discountPrice || 0,
                    discountType: 'amount'
                })) || [];

                const parts = data.partsUsed?.map(part => ({
                    type: 'part',
                    name: part.partName,
                    quantity: part.quantity,
                    price: part.price,
                    discountPrice: part.discountPrice,
                    discountType: part.discountType || 'amount'
                })) || [];

                setPartsAndServices([...parts, ...servicesProvided]);

                setTotalDiscount(data?.total?.discount || 0);
                setTotalDiscountType(data?.total?.discountType || 'percentage');

                if (data?.total?.sgstRate) setSgstRate(data.total.sgstRate);
                if (data?.total?.cgstRate) setCgstRate(data.total.cgstRate);

                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };
        getOrderDetail();
    }, [id]);

    // Subtotal = sum of (unit price * quantity) before any discounts
    const calculateSubtotal = () => {
        return partsAndServices.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };

    // Total after item-level discounts (still exclusive of tax conceptually, but will be used to apply overall discount)
    const calculateTotalAfterItemDiscounts = () => {
        return partsAndServices.reduce((total, item) => {
            const priceAfterDiscount =
                item.discountType === 'percentage'
                    ? item.price - (item.price * item.discountPrice / 100)
                    : item.price - item.discountPrice;
            return total + (priceAfterDiscount * item.quantity);
        }, 0);
    };

    // Overall discount amount (applied to the after-item-discounts total)
    const calculateOverallDiscount = () => {
        const base = calculateTotalAfterItemDiscounts();
        if (totalDiscountType === 'percentage') {
            return (base * totalDiscount) / 100;
        } else {
            return totalDiscount;
        }
    };

    // Final total (inclusive of GST) = after-item-discounts - overall discount
    const calculateTotalInclusive = () => {
        const afterItemDiscounts = calculateTotalAfterItemDiscounts();
        const overallDiscount = calculateOverallDiscount();
        return Math.max(afterItemDiscounts - overallDiscount, 0);
    };

    // Base amount (taxable value) derived from inclusive total
    const calculateBaseAmount = () => {
        const total = calculateTotalInclusive();
        const totalTaxRate = (sgstRate + cgstRate) / 100;
        if (totalTaxRate === 0) return total;
        return total / (1 + totalTaxRate);
    };

    // SGST amount
    const calculateSGST = () => {
        return (calculateBaseAmount() * sgstRate) / 100;
    };

    // CGST amount
    const calculateCGST = () => {
        return (calculateBaseAmount() * cgstRate) / 100;
    };

    const handleInvoiceDetailsChange = (e) => {
        const { name, value } = e.target;
        setInvoiceDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomerDetailsChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...partsAndServices];
        updatedItems[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) : value;
        setPartsAndServices(updatedItems);
    };

    const addItem = (type) => {
        setPartsAndServices([
            ...partsAndServices,
            {
                type,
                name: '',
                quantity: 1,
                price: 0,
                discountPrice: 0,
                discountType: 'amount'
            }
        ]);
    };

    const removeItem = (index) => {
        const updatedItems = [...partsAndServices];
        updatedItems.splice(index, 1);
        setPartsAndServices(updatedItems);
    };

    const handleSaveInvoice = async () => {
        try {
            setLoading(true);
            const subtotal = calculateSubtotal();
            const afterItemDiscounts = calculateTotalAfterItemDiscounts();
            const overallDiscount = calculateOverallDiscount();
            const totalInclusive = calculateTotalInclusive();
            const baseAmount = calculateBaseAmount();
            const sgstAmount = calculateSGST();
            const cgstAmount = calculateCGST();

            const response = await axiosClient.put(`api/admin/order/${id}/update-order/generate-invoice`, {
                invoiceDetails,
                partsAndServices,
                total: {
                    subTotal: subtotal,
                    discount: overallDiscount,
                    discountType: totalDiscountType,
                    sgst: sgstAmount,
                    cgst: cgstAmount,
                    sgstRate: sgstRate,
                    cgstRate: cgstRate,
                    baseAmount: baseAmount,
                    total: totalInclusive,
                    finalPayable: totalInclusive,
                    referralDiscount: 0
                }
            });
            console.log(response.message);
            setSnackBarMessage("Invoice saved successfully!");
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            setLoading(false);
        } catch (error) {
            setSnackBarMessage(error.message);
            setSnackBarSeverity("error");
            setSnackBarOpen(true);
            setLoading(false);
            console.log(error);
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackBarOpen(false);
    };

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />
            <div className="bg-gray-50 min-h-screen p-4">
                <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary text-white p-6">
                        <h1 className="text-3xl font-bold text-center">Invoice Generator</h1>
                        <p className="text-center opacity-90">Create and customize invoice for your customers</p>
                    </div>

                    {/* Form Section */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="flex flex-col gap-6">
                                {/* Invoice Details */}
                                <div className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500">
                                    <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                        Invoice Details
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Id</label>
                                            <input
                                                type="text"
                                                name="invoiceNumber"
                                                value={orderData.orderId || ''}
                                                readOnly
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                                            <input
                                                type="date"
                                                name="invoiceDate"
                                                value={invoiceDetails.invoiceDate}
                                                onChange={handleInvoiceDetailsChange}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* From Details (Business Info) */}
                                <div className="bg-purple-50 p-5 rounded-xl border-l-4 border-purple-500">
                                    <h2 className="text-xl font-semibold mb-4 text-purple-600 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                        From (Business Details)
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                            <input
                                                type="text"
                                                value={fromDetails.companyName}
                                                readOnly
                                                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <input
                                                type="text"
                                                value={fromDetails.address}
                                                readOnly
                                                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    value={fromDetails.city}
                                                    readOnly
                                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
                                                <input
                                                    type="text"
                                                    value={fromDetails.pin}
                                                    readOnly
                                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                                                <input
                                                    type="text"
                                                    value={fromDetails.contactNo}
                                                    readOnly
                                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="text"
                                                    value={fromDetails.email}
                                                    readOnly
                                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
                                            <input
                                                type="text"
                                                value={fromDetails.gstNo}
                                                readOnly
                                                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 p-5 rounded-xl border-l-4 border-green-500">
                                <h2 className="text-xl font-semibold mb-4 text-green-600 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    To (Customer Details)
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={customerDetails.name}
                                            onChange={handleCustomerDetailsChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                                        <input
                                            type="text"
                                            name="contactNo"
                                            value={customerDetails.contactNo}
                                            onChange={handleCustomerDetailsChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={customerDetails.city}
                                            onChange={handleCustomerDetailsChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Details</label>
                                        <input
                                            type="text"
                                            name="vehicleDetails"
                                            value={customerDetails.vehicleDetails}
                                            onChange={handleCustomerDetailsChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parts & Services Section */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Parts & Services</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => addItem('part')}
                                        className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-lg text-sm flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Add Part
                                    </button>
                                    <button
                                        onClick={() => addItem('service')}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Add Service
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-100 text-left">
                                                <th className="p-3 text-gray-600 font-semibold rounded-l-lg">Type</th>
                                                <th className="p-3 text-gray-600 font-semibold">Description</th>
                                                <th className="p-3 text-gray-600 font-semibold">Quantity</th>
                                                <th className="p-3 text-gray-600 font-semibold">Unit Price (₹)</th>
                                                <th className="p-3 text-gray-600 font-semibold">Discount</th>
                                                <th className="p-3 text-gray-600 font-semibold">Amount (₹)</th>
                                                <th className="p-3 text-gray-600 font-semibold rounded-r-lg">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {partsAndServices.map((item, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="p-3 border-b border-gray-200">
                                                        <select
                                                            value={item.type}
                                                            onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                        >
                                                            <option value="part">Part</option>
                                                            <option value="service">Service</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200">
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                            placeholder={item.type === 'part' ? "Part name" : "Service description"}
                                                        />
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                            min="1"
                                                        />
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200">
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200">
                                                        <div className="flex gap-2 items-center">
                                                            <input
                                                                type="number"
                                                                value={item.discountPrice || 0}
                                                                onChange={(e) => handleItemChange(index, 'discountPrice', e.target.value)}
                                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                            <select
                                                                value={item.discountType || 'amount'}
                                                                onChange={(e) => handleItemChange(index, 'discountType', e.target.value)}
                                                                className="p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                            >
                                                                <option value="amount">₹</option>
                                                                <option value="percentage">%</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200 font-medium">
                                                        ₹{(
                                                            item.discountType === 'percentage'
                                                                ? (item.price - (item.price * item.discountPrice / 100)) * item.quantity
                                                                : (item.price - item.discountPrice) * item.quantity
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="p-3 border-b border-gray-200">
                                                        <button
                                                            onClick={() => removeItem(index)}
                                                            className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Totals with Inclusive GST Breakdown */}
                        <div className="mb-8 flex justify-end">
                            <div className="w-full md:w-96 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-600">Subtotal (before discounts):</span>
                                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-600">After item discounts:</span>
                                    <span className="font-medium">₹{calculateTotalAfterItemDiscounts().toFixed(2)}</span>
                                </div>

                                {/* Overall Discount */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-600">Overall Discount:</span>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            value={totalDiscount}
                                            onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
                                            className="w-24 text-right p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="0"
                                        />
                                        <select
                                            value={totalDiscountType}
                                            onChange={(e) => setTotalDiscountType(e.target.value)}
                                            className="p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        >
                                            <option value="amount">₹</option>
                                            <option value="percentage">%</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-600">Total (incl. GST):</span>
                                    <span className="font-medium">₹{calculateTotalInclusive().toFixed(2)}</span>
                                </div>

                                {/* GST Details */}
                                <div className="flex justify-between py-2 border-b border-gray-200 text-sm text-gray-500">
                                    <span>Taxable Value:</span>
                                    <span>₹{calculateBaseAmount().toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-600">SGST ({sgstRate}%):</span>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            value={sgstRate}
                                            onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)}
                                            className="w-16 text-right p-1 border border-gray-300 rounded"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                        />
                                        <span className="w-20 text-right">₹{calculateSGST().toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="font-medium text-gray-600">CGST ({cgstRate}%):</span>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            value={cgstRate}
                                            onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)}
                                            className="w-16 text-right p-1 border border-gray-300 rounded"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                        />
                                        <span className="w-20 text-right">₹{calculateCGST().toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between py-3 text-lg font-bold">
                                    <span className="text-gray-700">Amount Payable:</span>
                                    <span className="text-primary">₹{calculateTotalInclusive().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={handleSaveInvoice}
                                className={`bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-2 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                        </svg>
                                        Please wait...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-2"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z" />
                                        </svg>
                                        Save Invoice
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GenerateInvoiceForm;