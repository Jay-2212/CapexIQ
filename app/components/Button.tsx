"use client";

// Primary-action button with the one deliberately decorative motion in the product —
// a radial ripple from the click point, ~400ms, used only on primary actions
// (ux-product-spec.md §10). Suppressed to an instant cut under
// prefers-reduced-motion (audit F3) entirely via CSS (see app/globals.css) — no JS
// media-query branching needed since the ripple element's animation-duration is what
// collapses to 0, not its existence.

import { useState, type ButtonHTMLAttributes } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

let rippleIdCounter = 0;

export function Button({
  variant = "primary",
  className = "",
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  return (
    <button
      {...rest}
      className={`button button--${variant} ${className}`.trim()}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const ripple: Ripple = {
          id: rippleIdCounter++,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        setRipples((current) => [...current, ripple]);
        setTimeout(() => {
          setRipples((current) => current.filter((r) => r.id !== ripple.id));
        }, 400);
        onClick?.(event);
      }}
    >
      {rest.children}
      {variant === "primary" &&
        ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="button__ripple"
            style={{ left: ripple.x, top: ripple.y }}
            aria-hidden="true"
          />
        ))}
    </button>
  );
}
