import { useRef } from "react";
import ProductCard from "./ProductCard";

export default function ProductRail({ products, onQuickView, cardWidth = 260 }) {
  const scrollerRef = useRef(null);

  const scrollBy = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir * (cardWidth + 24) * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div ref={scrollerRef} className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2 snap-x snap-mandatory">
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0" style={{ width: cardWidth }}>
            <ProductCard product={p} onQuickView={onQuickView} />
          </div>
        ))}
      </div>
      <button onClick={() => scrollBy(-1)} className="arrow-btn absolute -left-4 top-1/3 -translate-y-1/2 hidden md:flex shadow-card" aria-label="Scroll left">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button onClick={() => scrollBy(1)} className="arrow-btn absolute -right-4 top-1/3 -translate-y-1/2 hidden md:flex shadow-card" aria-label="Scroll right">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
      </button>
    </div>
  );
}
