import React from 'react';

export default function Feature() {
    return (
        <>
            <div className='mt-10'>
                {/* Header Section */}
                <div className='flex flex-col gap-2'>
                    <h1 className='font-roboto text-secondary text-4xl  font-bold text-center'>
                        Our Featured Services
                    </h1>
                    <p className='text-center font-roboto font-semibold text-gray-600'>
                        We offer full service auto repair & maintenance
                    </p>
                </div>

                {/* Cards Section */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 px-6'>
                    {/* Card 1 */}
                    <div className='bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center'>
                        <img
                            src='/images/oil-change.png'
                            alt='Oil Change'
                            className='w-16 h-16 mb-4'
                        />
                        <h2 className='font-bold text-lg text-primary'>Oil Change</h2>
                        <p className='text-gray-600 text-sm'>
                            Keep your engine running smoothly with regular oil changes.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className='bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center'>
                        <img
                            src='/images/tire-repair.png'
                            alt='Tire Repair'
                            className='w-16 h-16 mb-4'
                        />
                        <h2 className='font-bold text-lg text-primary'>Tire Repair</h2>
                        <p className='text-gray-600 text-sm'>
                            Get your tires repaired or replaced for a safe ride.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className='bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center'>
                        <img
                            src='/images/battery-replacement.png'
                            alt='Battery Replacement'
                            className='w-16 h-16 mb-4'
                        />
                        <h2 className='font-bold text-lg text-primary'>Battery Replacement</h2>
                        <p className='text-gray-600 text-sm'>
                            Ensure your vehicle starts every time with a new battery.
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className='bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center'>
                        <img
                            src='/images/brake-service.png'
                            alt='Brake Service'
                            className='w-16 h-16 mb-4'
                        />
                        <h2 className='font-bold text-lg text-primary'>Brake Service</h2>
                        <p className='text-gray-600 text-sm'>
                            Stay safe with professional brake inspections and repairs.
                        </p>
                    </div>

                    {/* Card 5 */}
                    <div className='bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center'>
                        <img
                            src='/images/engine-repair.png'
                            alt='Engine Repair'
                            className='w-16 h-16 mb-4'
                        />
                        <h2 className='font-bold text-lg text-primary'>Engine Repair</h2>
                        <p className='text-gray-600 text-sm'>
                            Get expert engine diagnostics and repairs for optimal performance.
                        </p>
                    </div>

                    {/* Card 6 */}
                    <div className='bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center'>
                        <img
                            src='/images/ac-service.png'
                            alt='AC Service'
                            className='w-16 h-16 mb-4'
                        />
                        <h2 className='font-bold text-lg text-primary'>AC Service</h2>
                        <p className='text-gray-600 text-sm'>
                            Stay cool with professional air conditioning repairs and maintenance.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}