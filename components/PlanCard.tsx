import React from "react";
import Button from "./Button";

type PlanCardProps = {
  title: string;
  price: string;
  period?: string;
  bullets: string[];
  ctaLabel: string;
  href?: string;
};

export default function PlanCard({ 
  title, 
  price, 
  period = "/mes", 
  bullets, 
  ctaLabel, 
  href = "#contacto" 
}: PlanCardProps) {
  return (
    <article className="rounded-3xl border border-brand-waves/30 bg-brand-aqua/20 backdrop-blur-sm p-8 shadow-soft transition-all duration-300 hover:shadow-xl hover:bg-brand-aqua/30 text-brand-pearl">
      <header className="mb-6">
        <h3 className="text-2xl font-semibold tracking-tight mb-3">{title}</h3>
        <p className="text-4xl font-bold">
          {price} 
          <span className="text-lg font-normal text-brand-pearl/70 ml-2">{period}</span>
        </p>
      </header>
      
      <ul role="list" className="mt-6 space-y-4 text-base text-brand-pearl/90">
        {bullets.map((bullet, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg className="h-5 w-5 text-brand-bright flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-8">
        <Button 
          variant="primary" 
          href={href} 
          className="w-full"
        >
          {ctaLabel}
        </Button>
      </div>
    </article>
  );
}
