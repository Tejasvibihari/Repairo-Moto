import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

export default function Bike() {
    // Responsive Bike Model
    const BikeModel = () => {
        const { scene } = useGLTF('./model/yamhabike.glb');
        const bikeRef = useRef();
        const [scale, setScale] = useState(2.5);
        useFrame(() => {
            if (bikeRef.current) {
                bikeRef.current.rotation.y += 0.001; // Adjust the rotation speed
            }
        });
        useEffect(() => {
            const handleResize = () => {
                if (window.innerWidth < 768) {
                    setScale(3.5); // Smaller scale for mobile
                } else {
                    setScale(2.5); // Default scale for desktop
                }
            };

            handleResize(); // Set initial scale
            window.addEventListener('resize', handleResize); // Update scale on resize

            return () => window.removeEventListener('resize', handleResize);
        }, []);

        return <primitive ref={bikeRef} object={scene} scale={scale} position={[0, -2, 0]} />;
    };

    return (
        <div className="w-full md:h-full h-50">
            <Canvas shadows>
                {/* Lighting */}
                <ambientLight intensity={7} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <directionalLight position={[-10, 5, 0]} intensity={0.8} castShadow />
                <spotLight position={[0, 20, 0]} angle={0.5} penumbra={1} intensity={2} castShadow />

                {/* Model */}
                <BikeModel />

                {/* Controls */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 2}
                />
            </Canvas>
        </div>
    );
}
