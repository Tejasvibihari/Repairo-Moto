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
            <div className='grid grid-cols-4 gap-4'>
                <div className='col-span-3'>
                    <QrTable onGenerateQR={handleGenerateQR} />
                </div>
                <div>
                    <QRGenerator text={qrText} />
                </div>
            </div>
        </>
    )
}
