import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, QrCode, Download } from "lucide-react";
import AlertSnackBar from "./ui/AlertSnackBar";

const QRGenerator = ({ text }) => {
    const qrRef = useRef();
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

    const handleDownload = () => {
        const canvas = qrRef.current.querySelector("canvas");
        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");

        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${text}-qr-code.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        setSnackBarMessage("QR Code Downloaded!");
        setSnackBarSeverity('success');
        setSnackBarOpen(true);
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackBarOpen(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setSnackBarMessage("Link Copied to Clipboard!");
        setSnackBarSeverity('success');
        setSnackBarOpen(true);
    };

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />

            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-blue-50 text-primary font-bold px-4 py-2 rounded-full">
                        QR Code Generator
                    </div>
                </div>

                <div className="flex justify-center">
                    <div
                        ref={qrRef}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl"
                    >
                        {text ? (
                            <QRCodeCanvas
                                value={text}
                                size={200}
                                bgColor={"#ffffff"}
                                fgColor={"#000"}
                                level={"H"}
                                includeMargin={true}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 w-48 border-2 border-dashed border-primary rounded-lg">
                                <QrCode size={64} className="text-blue-300 mb-2" />
                                <p className="text-sm text-gray-400 text-center">Enter text to generate QR code</p>
                            </div>
                        )}
                    </div>
                </div>

                {text && (
                    <div className="mt-6 space-y-4">
                        <div className="relative flex items-center">
                            <div className="flex-1 bg-gray-50 p-3 pr-10 rounded-lg text-sm font-mono text-gray-700 truncate">
                                {text}
                            </div>
                            <button
                                onClick={handleCopy}
                                className="absolute right-2 p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                aria-label="Copy to clipboard"
                            >
                                <Copy size={18} />
                            </button>
                        </div>

                        <button
                            onClick={handleDownload}
                            disabled={!text}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${text
                                ? "bg-primary hover:bg-yellow-600 text-white cursor-pointer"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            <Download size={18} />
                            Download QR Code
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default QRGenerator;