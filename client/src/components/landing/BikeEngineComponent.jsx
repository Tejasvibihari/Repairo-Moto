import React from 'react';
import { Bike, Wrench, Zap, Cog, Fuel, Thermometer } from 'lucide-react';
// import Bike from './Bike';

const BikeEngineComponent = () => {
    const engineComponents = [
        {
            name: "Cylinder Block",
            description: "Core power unit",
            icon: Cog,
            techSpec: "High-performance"
        },
        {
            name: "Piston Assembly",
            description: "Movement converter",
            icon: Zap,
            techSpec: "Precision engineered"
        },
        {
            name: "Crankshaft",
            description: "Rotation generator",
            icon: Cog,
            techSpec: "Balanced rotation"
        },
        {
            name: "Valve Train",
            description: "Air flow control",
            icon: Wrench,
            techSpec: "Optimized flow"
        },
        {
            name: "Fuel Injection",
            description: "Fuel delivery system",
            icon: Fuel,
            techSpec: "Smart injection"
        },
        {
            name: "Cooling System",
            description: "Temperature control",
            icon: Thermometer,
            techSpec: "Thermal management"
        }
    ];

    // Random positioning offsets for each component
    const getRandomOffset = (index) => {
        const offsets = [
            { x: 8, y: -12 },
            { x: -15, y: 6 },
            { x: 12, y: -8 },
            { x: -8, y: 15 },
            { x: 10, y: -5 },
            { x: -12, y: 10 }
        ];
        return offsets[index] || { x: 0, y: 0 };
    };

    return (
        <>
            <style>
                {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out forwards;
            opacity: 0;
          }
          
          .hover-scale {
            transition: transform 0.3s ease;
          }
          
          .hover-scale:hover {
            transform: scale(1.02);
          }
          
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          
          .animate-pulse-custom {
            animation: pulse 3s ease-in-out infinite;
          }
          
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }
        `}
            </style>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center p-4 lg:p-6">
                <div className="max-w-7xl w-full">
                    {/* Main Container */}
                    <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 items-center">

                        {/* Left Side Components */}
                        <div className="space-y-4 lg:space-y-6 lg:text-right order-2 lg:order-1">
                            {engineComponents.slice(0, 3).map((component, index) => {
                                const offset = getRandomOffset(index);
                                const IconComponent = component.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group animate-fade-in hover-scale"
                                        style={{
                                            animationDelay: `${index * 0.2}s`,
                                            transform: `translate(${offset.x}px, ${offset.y}px)`,
                                        }}
                                    >
                                        <div
                                            className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 lg:p-6 hover:border-[#e2a731] transition-all duration-300 shadow-lg hover:shadow-xl animate-float relative overflow-hidden"
                                            style={{
                                                animationDelay: `${index * 0.8}s`,
                                                animationDuration: `${4 + index * 0.5}s`
                                            }}
                                        >
                                            {/* Futuristic background pattern */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#e2a731]/5 to-transparent opacity-50"></div>
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#e2a731]/10 to-transparent rounded-full blur-xl"></div>

                                            <div className="relative flex items-start gap-3 lg:gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#e2a731] to-[#c8941f] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <IconComponent size={20} className="text-white lg:w-6 lg:h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs lg:text-sm font-mono text-[#e2a731] mb-1 opacity-70 uppercase tracking-wider">
                                                        {component.techSpec}
                                                    </div>
                                                    <h3 className="text-lg lg:text-xl font-bold text-slate-700 mb-2 group-hover:text-[#e2a731] transition-colors font-mono">
                                                        {component.name}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm lg:text-base group-hover:text-slate-600 transition-colors leading-relaxed">
                                                        {component.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Center - Bike Engine */}
                        <div className="flex flex-col items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0">
                            <div className="relative">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-[#e2a731]/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>

                                {/* Engine Container */}
                                <div className="relative bg-gradient-to-br from-white to-slate-100 rounded-full p-6 lg:p-8 border-4 border-[#e2a731] shadow-2xl hover-scale">
                                    <div className="bg-gradient-to-br from-[#e2a731] to-[#c8941f] rounded-full p-4 lg:p-6 relative">
                                        <Bike
                                            size={80}
                                            className="text-white drop-shadow-2xl animate-pulse-custom lg:w-32 lg:h-32"
                                        />
                                        {/* <img src='logo/logo72.png'
                                            className="text-white drop-shadow-2xl animate-pulse-custom lg:w-32 lg:h-32"
                                        /> */}
                                        <div className="absolute inset-0 opacity-20">
                                            <div className="w-full h-full rounded-full border-2 border-dashed border-white/30"></div>
                                        </div>
                                    </div>
                                </div>


                                {/* Rotating Border */}
                                <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-[#e2a731] via-[#f5c650] to-[#e2a731] bg-clip-border animate-spin-slow opacity-70"></div>
                            </div>

                            {/* Engine Title */}
                            <div className="mt-6 lg:mt-8 text-center px-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Wrench className="text-[#e2a731] w-6 h-6 lg:w-8 lg:h-8" />
                                    <div className="text-xs lg:text-sm font-mono text-[#e2a731] uppercase tracking-[0.2em] opacity-80">
                                        Repairo Moto
                                    </div>
                                    <Wrench className="text-[#e2a731] w-6 h-6 lg:w-8 lg:h-8 scale-x-[-1]" />
                                </div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#e2a731] to-[#c8941f] bg-clip-text text-transparent mb-2 lg:mb-4 animate-fade-in font-mono">
                                    Motorcycle Engine
                                </h1>
                                {/* <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-700 mb-4 font-mono">
                                    Repair & Service Hub
                                </h2> */}
                                {/* <p className="text-slate-600 text-base lg:text-lg max-w-md mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.3s' }}>
                                    Precision engineered for performance and reliability. Expert diagnostics and repairs.
                                </p> */}
                            </div>
                        </div>

                        {/* Right Side Components */}
                        <div className="space-y-4 lg:space-y-6 lg:text-left order-3">
                            {engineComponents.slice(3, 6).map((component, index) => {
                                const offset = getRandomOffset(index + 3);
                                const IconComponent = component.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group animate-fade-in hover-scale"
                                        style={{
                                            animationDelay: `${(index + 3) * 0.2}s`,
                                            transform: `translate(${offset.x}px, ${offset.y}px)`,
                                        }}
                                    >
                                        <div
                                            className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 lg:p-6 hover:border-[#e2a731] transition-all duration-300 shadow-lg hover:shadow-xl animate-float relative overflow-hidden"
                                            style={{
                                                animationDelay: `${(index + 3) * 0.8}s`,
                                                animationDuration: `${4 + (index + 3) * 0.5}s`
                                            }}
                                        >
                                            {/* Futuristic background pattern */}
                                            <div className="absolute inset-0 bg-gradient-to-bl from-[#e2a731]/5 to-transparent opacity-50"></div>
                                            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#e2a731]/10 to-transparent rounded-full blur-xl"></div>

                                            <div className="relative flex items-start gap-3 lg:gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#e2a731] to-[#c8941f] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <IconComponent size={20} className="text-white lg:w-6 lg:h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs lg:text-sm font-mono text-[#e2a731] mb-1 opacity-70 uppercase tracking-wider">
                                                        {component.techSpec}
                                                    </div>
                                                    <h3 className="text-lg lg:text-xl font-bold text-slate-700 mb-2 group-hover:text-[#e2a731] transition-colors font-mono">
                                                        {component.name}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm lg:text-base group-hover:text-slate-600 transition-colors leading-relaxed">
                                                        {component.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Stats */}
                    <div className="mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-fade-in px-4" style={{ animationDelay: '1s' }}>
                        {[
                            { label: "Power Output", value: "150 HP", icon: Zap },
                            { label: "Torque", value: "120 Nm", icon: Cog },
                            { label: "Displacement", value: "1000cc", icon: Fuel },
                            { label: "Max RPM", value: "12,000", icon: Wrench }
                        ].map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-200 hover:border-[#e2a731] transition-all duration-300 hover-scale shadow-lg hover:shadow-xl animate-float relative overflow-hidden"
                                    style={{
                                        animationDelay: `${index * 0.3 + 2}s`,
                                        animationDuration: `${5 + index * 0.3}s`
                                    }}
                                >
                                    {/* Background pattern */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#e2a731]/5 to-transparent opacity-30"></div>

                                    <div className="relative">
                                        <div className="flex items-center justify-center mb-2">
                                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#e2a731] to-[#c8941f] rounded-lg flex items-center justify-center shadow-md">
                                                <IconComponent size={16} className="text-white lg:w-5 lg:h-5" />
                                            </div>
                                        </div>
                                        <div className="text-xl lg:text-2xl font-bold text-slate-700 mb-1 font-mono">{stat.value}</div>
                                        <div className="text-slate-500 text-xs lg:text-sm font-medium uppercase tracking-wide">{stat.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BikeEngineComponent;