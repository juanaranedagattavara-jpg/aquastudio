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
  const base = "inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2";
  
  const variants = {
    primary: "bg-brand-bright text-brand-deep shadow-soft hover:bg-brand-bright/90 hover:shadow-xl focus-visible:ring-brand-bright",
    ghost: "border border-brand-pearl/60 text-brand-pearl hover:bg-brand-pearl/10 hover:border-brand-pearl focus-visible:ring-brand-pearl/50",
    link: "underline underline-offset-4 text-brand-bright hover:opacity-90 focus-visible:ring-brand-bright/40",
  } as const;

  const combinedClassName = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedClassName} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {(props as any).children}
      </a>
    );
  }
  
  return (
    <button 
      className={combinedClassName} 
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} 
    />
  );
}
