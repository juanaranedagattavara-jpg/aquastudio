import React from "react";

export default function MetricsChip({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-brand-bright/40 bg-brand-bright/10 px-4 py-2 text-sm font-medium text-brand-bright backdrop-blur-sm">
      {children}
    </span>
  );
}
