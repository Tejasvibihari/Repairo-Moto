import { ContactRound, HandCoins, House, Images, Rss, Store, Wrench } from 'lucide-react';
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-secondary text-white py-8">
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 md:w-7xl mx-auto p-10'>
                <div className='flex items-center justify-center'>
                    <img src='./logo/logo72.png' className='p-10 w-lg' />
                </div>
                <div>
                    <h2 className='text-lg font-bold text-primary border-l-4 border-primary pl-2'>Important Links</h2>
                    <ul className='mt-4 font-inter text-semibold flex flex-col space-y-3'>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><House className='mr-2' size={20} />Home</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Store className='mr-2' size={20} />About</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Wrench className='mr-2' size={20} />Services</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><ContactRound className='mr-2' size={20} /> Contact</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Rss className='mr-2' size={20} /> Blog</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Images className='mr-2' size={20} /> Gallery</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><HandCoins className='mr-2' size={20} /> Referral & Earning</li>
                    </ul>
                </div>
                <div>
                    <h2 className='text-lg font-bold text-primary border-l-4 border-primary pl-2'>Our Services</h2>
                    <ul className='mt-4 font-inter text-semibold flex flex-col space-y-3'>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><House className='mr-2' size={20} />Servicing</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Store className='mr-2' size={20} />Repairing</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Wrench className='mr-2' size={20} />Full Engine</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><ContactRound className='mr-2' size={20} /> Inspection</li>
                        {/* <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Rss className='mr-2' size={20} /> Blog</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Images className='mr-2' size={20} /> Gallery</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><HandCoins className='mr-2' size={20} /> Referral & Earning</li> */}
                    </ul>
                </div>
                <div>
                    <h2 className='text-lg font-bold text-primary border-l-4 border-primary pl-2'>Contact Us</h2>
                    <ul className='mt-4 font-inter text-semibold flex flex-col space-y-3'>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><House className='mr-2' size={20} />Servicing</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Store className='mr-2' size={20} />Repairing</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Wrench className='mr-2' size={20} />Full Engine</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><ContactRound className='mr-2' size={20} /> Inspection</li>
                        {/* <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Rss className='mr-2' size={20} /> Blog</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><Images className='mr-2' size={20} /> Gallery</li>
                        <li className='font-inter font-semibold flex flex-row items-center justify-start cursor-pointer'><HandCoins className='mr-2' size={20} /> Referral & Earning</li> */}
                    </ul>
                </div>
                <div></div>
                <div></div>
            </div>
        </footer>
    );
}