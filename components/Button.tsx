import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "link";
  href?: string;
};

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "ghost" | "link";
  href: string;
};

type Props = ButtonProps | LinkProps;

export default function Button({ 
  variant = "primary", 
  className = "", 
  href,
  ...props 
}: Props) {
  const base = "inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-semibold transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 relative overflow-hidden group";
  
        const variants = {
          primary: "bg-gradient-to-r from-brand-bright to-brand-accent text-white shadow-2xl hover:shadow-brand-bright/25 hover:shadow-2xl hover:scale-105 focus-visible:ring-brand-bright before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
          ghost: "border-2 border-brand-waves/60 text-brand-pearl hover:bg-brand-waves/20 hover:border-brand-waves hover:shadow-lg hover:scale-105 focus-visible:ring-brand-waves/50 backdrop-blur-sm",
          link: "underline underline-offset-4 text-brand-bright hover:opacity-90 hover:scale-105 focus-visible:ring-brand-bright/40 transition-transform duration-300",
        } as const;

  const combinedClassName = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedClassName} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <span className="relative z-10">{(props as any).children}</span>
      </a>
    );
  }
  
  return (
    <button 
      className={combinedClassName} 
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} 
    >
      <span className="relative z-10">{(props as any).children}</span>
    </button>
  );
}
