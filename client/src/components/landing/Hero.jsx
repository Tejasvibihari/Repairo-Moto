import React from 'react';
import Bike from './Bike';

export default function Hero() {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 hero h-screen'>
            <div className='flex flex-col space-y-6 items-start p-6 md:p-10 my-10 md:my-20 justify-center'>
                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary'>
                    Hassle-Free Bike Repairs at Your Doorstep
                </h1>
                <p className='text-base sm:text-lg md:text-xl text-white'>
                    Affordable, reliable, and fast bike repair services delivered where you are.
                </p>
                <button className="mt-4 bg-transparent border-primary border-3 text-white font-semibold px-6 py-3 hover:bg-primary/90 transition">
                    Book a Mechanic Now
                </button>
            </div>
            <div>
                <Bike />
            </div>
        </div>
    );
}
