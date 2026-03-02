import React from "react";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", style = {}, hover = false }) {
    return (
        <motion.div
            className={`glass-card ${hover ? 'hover-lift' : ''} ${className}`}
            style={style}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
}
