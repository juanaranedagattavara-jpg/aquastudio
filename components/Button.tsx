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
    primary: "bg-gradient-to-r from-brand-aqua to-brand-bright text-black shadow-soft hover:from-brand-bright hover:to-brand-aqua hover:shadow-xl focus-visible:ring-brand-aqua",
    ghost: "border border-brand-aqua/40 text-brand-pearl hover:bg-brand-aqua/10 hover:border-brand-aqua focus-visible:ring-brand-aqua/50",
    link: "underline underline-offset-4 text-brand-aqua hover:opacity-90 focus-visible:ring-brand-aqua/40",
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
