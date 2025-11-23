"use client";

import { useRouter } from "next/navigation";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const router = useRouter();
  
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div
      className={`flex items-center gap-2 cursor-pointer group ${className}`}
      onClick={() => router.push("/")}
    >
      {/* Logo SVG */}
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background circle with gradient */}
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="url(#logoGradient)"
            className="group-hover:opacity-90 transition-opacity"
          />
          
          {/* Kubernetes-style hexagon/container icon */}
          <path
            d="M32 12L48 22V42L32 52L16 42V22L32 12Z"
            fill="white"
            fillOpacity="0.9"
            className="group-hover:fill-opacity-100 transition-all"
          />
          
          {/* Inner container boxes */}
          <rect x="24" y="26" width="6" height="6" fill="url(#logoGradient)" rx="1" />
          <rect x="34" y="26" width="6" height="6" fill="url(#logoGradient)" rx="1" />
          <rect x="24" y="34" width="6" height="6" fill="url(#logoGradient)" rx="1" />
          <rect x="34" y="34" width="6" height="6" fill="url(#logoGradient)" rx="1" />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--primary) / 0.8)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <span
          className={`${textSizes[size]} font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity`}
        >
          Kuberns
        </span>
      )}
    </div>
  );
}

