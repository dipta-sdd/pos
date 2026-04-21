import { SVGProps } from "react";

interface ProductPlaceholderIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function ProductPlaceholderIcon({
  className = "",
  ...props
}: ProductPlaceholderIconProps) {
  return (
    <svg
      className={`text-gray-400 dark:text-gray-600 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      strokeLinejoin="round"
      // The text-gray-400 and dark:text-gray-600 classes make it responsive to the theme.
      // currentColor ensures the stroke uses the text color.
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Outer Box representing the product container */}
      <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />

      {/* Barcode area representing POS/Retail aspect */}
      <path d="M8 7v4" />
      <path d="M10 7v4" strokeWidth="2" />
      <path d="M13 7v4" />
      <path d="M15 7v4" strokeWidth="2" />
      <path d="M17 7v4" />

      {/* Image Placeholder area (mountain and sun) representing missing product photo */}
      <circle cx="8.5" cy="14.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
