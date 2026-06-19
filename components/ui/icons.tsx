import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function MaleIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      {...props}
    >
      <circle cx="10" cy="14" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5L20 4m0 0h-5m5 0v5" />
    </svg>
  );
}

export function FemaleIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      {...props}
    >
      <circle cx="12" cy="9" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13v7m-3-3h6" />
    </svg>
  );
}
