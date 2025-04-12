import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";// Example icon from react-icons
import { Copy, QrCode } from "lucide-react";
import AlertSnackBar from "./ui/AlertSnackBar";

const QRGenerator = ({ text }) => {
    const qrRef = useRef();
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity


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
    };
    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarOpen(false);
    }
    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />

            <div className="flex flex-col items-center mt-6 p-4 border shadow-sm rounded">
                <div className="font-nunito text-semibold text-center border-l-4 border-r-4 px-5 text-lg font-bold border-primary my-4">
                    QR Code
                </div>
                <div
                    ref={qrRef}
                    className="bg-white p-4 rounded-lg shadow-md w-[220px] h-[220px] flex items-center justify-center"
                >
                    {text ? (
                        <QRCodeCanvas value={text} size={200} />
                    ) : (
                        <QrCode size={100} className="text-gray-400 text-6xl" />
                    )}
                </div>
                <div className="relative p-2 bg-gray-200 my-4 rounded-md">
                    <div
                        className="absolute bottom-2 right-2 cursor-pointer text-gray-600 hover:text-gray-800"
                        onClick={() => {
                            navigator.clipboard.writeText(text);
                            setSnackBarMessage("Link Copied to Clipboard!")
                            setSnackBarSeverity('success')
                            setSnackBarOpen(true)

                        }}
                    >
                        <Copy size={20} />
                    </div>
                    {text}
                </div>

                <button
                    onClick={handleDownload}
                    className={`mt-4  text-white font-semibold px-6 py-2 rounded-lg transition ${text ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
                >
                    Download QR Code
                </button>
            </div>
        </>
    );
};

export default QRGenerator;
