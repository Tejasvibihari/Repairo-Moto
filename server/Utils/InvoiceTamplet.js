const generateInvoiceTemplate = (invoiceData) => {
    const { invoiceNumber, date, customerName, items, totalAmount } = invoiceData;

    return `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Template</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        body {
            background-color: #f8f9fa;
            padding: 40px 0;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
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

        @media print {
            body {
                background-color: white;
                padding: 0;
            }

            .invoice-container {
                box-shadow: none;
                border: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <img class="logo" src="http://localhost:5000/static/logo72.png" alt="Company Logo">
            <div class="invoice-details">
                <h1>INVOICE</h1>
                <p>Invoice No: INV-2025-0001</p>
                <p>Date: April 26, 2025</p>
                <p>Due Date: May 10, 2025</p>
            </div>
        </div>

        <div class="address-container">
            <div class="address-box">
                <h3>From</h3>
                <p>
                    <strong>Company Name</strong><br>
                    123 Business Street<br>
                    Business District, City 12345<br>
                    Country<br>
                    Phone: (123) 456-7890<br>
                    Email: accounts@company.com
                </p>
            </div>
            <div class="address-box">
                <h3>To</h3>
                <p>
                    <strong>Client Name</strong><br>
                    456 Client Avenue<br>
                    Client Area, City 67890<br>
                    Country<br>
                    Phone: (098) 765-4321<br>
                    Email: client@example.com
                </p>
            </div>
        </div>

        <div class="gst-info">
            <p>GST No: 29AADCB2230M1ZY</p>
        </div>

        <table class="invoice-table">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Item Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Web Design Services</td>
                    <td>1</td>
                    <td>₹15,000.00</td>
                    <td>₹15,000.00</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Hosting (Annual)</td>
                    <td>1</td>
                    <td>₹5,000.00</td>
                    <td>₹5,000.00</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Content Writing</td>
                    <td>10</td>
                    <td>₹800.00</td>
                    <td>₹8,000.00</td>
                </tr>
                <tr>
                    <td>4</td>
                    <td>SEO Services</td>
                    <td>1</td>
                    <td>₹12,000.00</td>
                    <td>₹12,000.00</td>
                </tr>
            </tbody>
        </table>

        <div class="total-container">
            <div class="total-box">
                <div class="total-row">
                    <span class="label">Subtotal:</span>
                    <span class="value">₹40,000.00</span>
                </div>
                <div class="total-row">
                    <span class="label">GST (18%):</span>
                    <span class="value">₹7,200.00</span>
                </div>
                <div class="total-row">
                    <span class="label">TOTAL:</span>
                    <span class="value">₹47,200.00</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="terms">
                <h4>Terms & Conditions</h4>
                <p>Payment is due within 15 days from the date of invoice. Late payment is subject to interest charges at 1.5% per month. This invoice is computer-generated and doesn't require a signature.</p>
                <div class="thank-you">Thank you for your business!</div>
            </div>
            <img class="qr-code" src="/api/placeholder/120/120" alt="Payment QR Code">
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = generateInvoiceTemplate;