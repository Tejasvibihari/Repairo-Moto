// components/ui/ParallaxImage.jsx
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

export default function ParallaxImage({ src, alt, height = 500 }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <div ref={ref} className="overflow-hidden" style={{ height }}>
            <motion.img
                src={src}
                alt={alt}
                style={{ y }}
                className="w-full h-full object-cover"
            />
        </div>
    );
}
