import { useState } from 'react';

const GenerateInvoiceForm = () => {
    // Order data from the provided JSON
    const orderData = {
        "_id": {
            "$oid": "680fabdba62bb35a8b83f559"
        },
        "name": "Vrtika kumari",
        "contactNo": "6205731150",
        "city": "PATNA",
        "selectedBrand": "TVS",
        "selectedModel": "Apache",
        "modelName": "",
        "cc": "151CC to 180CC",
        "services": [
            "Servicing"
        ],
        "otherService": "",
        "preferredDate": {
            "$date": "2025-04-28T18:30:00.000Z"
        },
        "preferredTime": "2025-04-28T09:45:00.000Z",
        "estimatedBudget": "1000",
        "issues": "Oil Change Filter Change",
        "status": "Completed",
        "assignedMechanic": "Kitto Kumar",
        "mechanicId": {
            "$oid": "680e6839c5124a4363ca18dc"
        },
        "assignedVendor": "Tejasvi Kumar",
        "vendorId": {
            "$oid": "680e7deb021b127ce2e59cab"
        },
        "assignedDelivery": "Ankit Kumar",
        "deliveryId": {
            "$oid": "680e6863c5124a4363ca18e0"
        },
        "partsUsed": [
            {
                "partName": "Chain",
                "quantity": 1,
                "price": 10,
                "_id": {
                    "$oid": "680fcbde1fac8dd9a7239487"
                }
            },
            {
                "partName": "Chain",
                "quantity": 1,
                "price": 500,
                "_id": {
                    "$oid": "680fcbde1fac8dd9a7239488"
                }
            },
            {
                "partName": "Oil Filter",
                "quantity": 5,
                "price": 2000,
                "_id": {
                    "$oid": "680fcbde1fac8dd9a7239489"
                }
            },
            {
                "partName": "Kutta",
                "quantity": 10,
                "price": 25,
                "_id": {
                    "$oid": "680fcbde1fac8dd9a723948a"
                }
            }
        ],
        "createdAt": {
            "$date": "2025-04-28T16:24:59.759Z"
        },
        "updatedAt": {
            "$date": "2025-04-28T18:42:54.904Z"
        },
        "__v": 7
    };

    // State for the form
    const [fromDetails, setFromDetails] = useState({
        companyName: "Express Bike Service",
        address: "123 Mechanic Street, Workshop Area",
        city: "New Delhi",
        pin: "110001",
        contactNo: "011-12345678",
        email: "contact@expressbikeservice.com",
        gstNo: "27AADCB2230M1ZT"
    });

    const [invoiceDetails, setInvoiceDetails] = useState({
        invoiceNumber: "INV-" + Date.now().toString().slice(-6),
        invoiceDate: new Date().toISOString().slice(0, 10)
    });

    // State for editable customer details
    const [customerDetails, setCustomerDetails] = useState({
        name: orderData.name,
        contactNo: orderData.contactNo,
        city: orderData.city,
        vehicleDetails: `${orderData.selectedBrand} ${orderData.selectedModel} (${orderData.cc})`
    });

    // State for editable parts and services
    const [partsAndServices, setPartsAndServices] = useState([
        ...orderData.partsUsed.map(part => ({
            type: 'part',
            name: part.partName,
            quantity: part.quantity,
            price: part.price
        })),
        {
            type: 'service',
            name: `${orderData.services.join(", ")} - ${orderData.issues}`,
            quantity: 1,
            price: parseFloat(orderData.estimatedBudget)
        }
    ]);

    // State for form submission status
    const [formStatus, setFormStatus] = useState({
        saved: false,
        message: ''
    });

    // Calculate totals
    const calculateSubtotal = () => {
        return partsAndServices.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateGST = () => {
        return calculateSubtotal() * 0.18; // Assuming 18% GST
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateGST();
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    };

    // Handle form changes
    const handleFromDetailsChange = (e) => {
        const { name, value } = e.target;
        setFromDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInvoiceDetailsChange = (e) => {
        const { name, value } = e.target;
        setInvoiceDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCustomerDetailsChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle parts and services changes
    const handleItemChange = (index, field, value) => {
        const updatedItems = [...partsAndServices];
        updatedItems[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) : value;
        setPartsAndServices(updatedItems);
    };

    // Add new item (part or service)
    const addItem = (type) => {
        setPartsAndServices([
            ...partsAndServices,
            {
                type,
                name: '',
                quantity: 1,
                price: 0
            }
        ]);
    };

    // Remove item
    const removeItem = (index) => {
        const updatedItems = [...partsAndServices];
        updatedItems.splice(index, 1);
        setPartsAndServices(updatedItems);
    };

    // Save the invoice
    const saveInvoice = () => {
        // Here you would typically send the data to your backend
        console.log({
            fromDetails,
            invoiceDetails,
            customerDetails,
            partsAndServices,
            totals: {
                subtotal: calculateSubtotal(),
                gst: calculateGST(),
                total: calculateTotal()
            }
        });

        // Set success message
        setFormStatus({
            saved: true,
            message: 'Invoice saved successfully!'
        });

        // Reset the message after 3 seconds
        setTimeout(() => {
            setFormStatus({
                saved: false,
                message: ''
            });
        }, 3000);
    };

    return (
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
                        {/* From Section */}
                        {/* <div className="bg-primary bg-opacity-10 p-5 rounded-xl border-l-4 border-primary">
                            <h2 className="text-xl font-semibold mb-4 text-primary flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                From (Your Company Details)
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={fromDetails.companyName}
                                        onChange={handleFromDetailsChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={fromDetails.address}
                                        onChange={handleFromDetailsChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={fromDetails.city}
                                            onChange={handleFromDetailsChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                                        <input
                                            type="text"
                                            name="pin"
                                            value={fromDetails.pin}
                                            onChange={handleFromDetailsChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                                    <input
                                        type="text"
                                        name="contactNo"
                                        value={fromDetails.contactNo}
                                        onChange={handleFromDetailsChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={fromDetails.email}
                                        onChange={handleFromDetailsChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
                                    <input
                                        type="text"
                                        name="gstNo"
                                        value={fromDetails.gstNo}
                                        onChange={handleFromDetailsChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div> */}

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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                                        <input
                                            type="text"
                                            name="invoiceNumber"
                                            value={invoiceDetails.invoiceNumber}
                                            onChange={handleInvoiceDetailsChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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

                            {/* To Section (Editable Customer Details) */}
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
                                            <th className="p-3 text-gray-600 font-semibold">Discount Price (₹)</th>
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
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="p-3 border-b border-gray-200 font-medium">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
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

                    {/* Totals */}
                    <div className="mb-8 flex justify-end">
                        <div className="w-full md:w-72 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex justify-between py-3 border-b border-gray-200">
                                <span className="font-medium text-gray-600">Subtotal:</span>
                                <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-200">
                                <span className="font-medium text-gray-600">GST (18%):</span>
                                <span className="font-medium">₹{calculateGST().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-200">
                                <span className="font-medium text-gray-600">Discount:</span>
                                <input
                                    type="text"
                                    value=""
                                    // onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="00"
                                />
                            </div>
                            <div className="flex justify-between py-3 text-lg font-bold">
                                <span className="text-gray-700">Total:</span>
                                <span className="text-primary">₹{calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    {/* <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-500">
                                <p className="text-sm font-medium text-gray-500">Service Date</p>
                                <p className="text-lg font-medium text-purple-700">{formatDate(orderData.preferredDate.$date)}</p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500">
                                <p className="text-sm font-medium text-gray-500">Mechanic</p>
                                <p className="text-lg font-medium text-indigo-700">{orderData.assignedMechanic}</p>
                            </div>
                            <div className="bg-teal-50 p-4 rounded-xl border-l-4 border-teal-500">
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <p className="text-lg font-medium text-teal-700">{orderData.status}</p>
                            </div>
                        </div>
                    </div> */}
                    {/* Save Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={saveInvoice}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z" />
                            </svg>
                            Save Invoice
                        </button>
                    </div>

                    {/* Status Message */}
                    {formStatus.saved && (
                        <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {formStatus.message}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateInvoiceForm;