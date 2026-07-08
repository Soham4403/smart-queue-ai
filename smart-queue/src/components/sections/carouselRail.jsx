import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SearchIcon } from "../ui/medicalIcons";

export default function CarouselRail({
  eyebrow,
  title,
  description,
  items = [],
  renderItem,
  className = "",
  loop = true,
  autoplay = true,
}) {
  const trackRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (reduceMotion || !autoplay || hovered || !loop || !trackRef.current) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;

      const firstCard = track.querySelector("[data-carousel-card]");
      if (!firstCard) return;

      const cardWidth = firstCard.getBoundingClientRect().width + 16;
      const maxScroll = track.scrollWidth - track.clientWidth - 8;
      const next = track.scrollLeft + cardWidth;

      if (next >= maxScroll) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3200);

    return () => window.clearInterval(timer);
  }, [autoplay, hovered, loop, reduceMotion]);

  const scrollByAmount = (direction) => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector("[data-carousel-card]");
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 16 : 340;
    track.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  };

  return (
    <section className={`px-6 py-14 ${className}`}>
      <div className="theme-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="theme-kicker">{eyebrow}</p>
            <h2 className="theme-heading mt-2 text-4xl font-black">{title}</h2>
            {description ? <p className="theme-copy mt-3 max-w-2xl leading-7">{description}</p> : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/12"
              aria-label="Previous carousel item"
            >
              <span className="text-xl leading-none">‹</span>
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/12"
              aria-label="Next carousel item"
            >
              <span className="text-xl leading-none">›</span>
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id || `${title}-${index}`}
              data-carousel-card
              whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
              className="min-w-72.5 max-w-72.5 flex-1"
            >
              {renderItem(item, index)}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
          <SearchIcon className="h-4 w-4 text-cyan-200" />
          Drag or use arrows to browse
        </div>
      </div>
    </section>
  );
}
