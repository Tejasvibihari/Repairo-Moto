import React, { useState } from 'react'
import Heading from '../../components/ui/Heading'
import QrTable from '../../components/QrTable'
import QRGenerator from '../../components/QRGenerator'

export default function EmployeeManageQr() {
    const [qrText, setQrText] = useState("");
    const handleGenerateQR = (text) => {
        setQrText(text);
    };
    return (
        <>
            <Heading heading={"Manage Qr"} />
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 col-span-1">
                    <QrTable onGenerateQR={handleGenerateQR} />
                </div>
                <div className="col-span-1">
                    <QRGenerator text={qrText} />
                </div>
            </div>
        </>
    )
}
