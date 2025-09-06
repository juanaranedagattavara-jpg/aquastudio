import React from "react";

export default function Section(props: React.ComponentProps<"section">) {
  const { className = "", ...rest } = props;
  return (
    <section 
      className={`py-20 md:py-32 ${className}`} 
      {...rest} 
    />
  );
}
