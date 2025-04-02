import { Download } from "lucide-react";
import { useState, useRef, MouseEvent, ReactNode } from "react";

type Ripple = {
  x: number;
  y: number;
  size: number;
  id: number;
};

export type ButtonWithRippleProps = {
    onClick?: () => void;
    children: ReactNode;
    className?: string;
  };
  
export const ButtonWithRipple = ({ onClick, children, className = "" }: ButtonWithRippleProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Call the original onClick handler
    onClick?.();

    // Create ripple effect
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`relative overflow-hidden bg-yellow-500 hover:bg-yellow-600 text-white ${className}`}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
            transform: "scale(0)",
            animation: "ripple 600ms linear",
          }}
        />
      ))}
      {children}
      
      {/* Add the animation to your global CSS or in a style tag */}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};
