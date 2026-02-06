"use client";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Card({ children, className, onClick }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={twMerge(
        "relative overflow-hidden rounded-[20px] bg-white p-5 shadow-sm border border-gray-100",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function Metric({ label, value, sub, color = "text-gray-900" }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className={`text-2xl font-black tracking-tight ${color}`}>{value}</h3>
      {sub && <p className="text-[11px] text-gray-500 mt-1 font-medium">{sub}</p>}
    </div>
  );
}
