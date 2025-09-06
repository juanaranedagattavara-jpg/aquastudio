import React from "react";

type TProps = { 
  quote: string; 
  author: string; 
  role?: string; 
};

export default function Testimonial({ quote, author, role }: TProps) {
  return (
    <figure className="rounded-3xl border border-brand-waves/30 bg-brand-deep/40 backdrop-blur-sm p-8 shadow-soft transition-all duration-300 hover:shadow-xl hover:bg-brand-deep/60 text-brand-pearl">
      <blockquote className="text-lg italic leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="text-base text-brand-pearl/80">
        — <span className="font-semibold">{author}</span>{role ? `, ${role}` : ""}
      </figcaption>
    </figure>
  );
}
