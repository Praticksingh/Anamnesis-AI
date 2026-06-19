"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TimelineEvent = {
  year: string;
  label: string;
  title: string;
  note: string;
  side: "top" | "bottom";
  accent: string;
};

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: "753 BCE",
    label: "BCE",
    title: "Founding of Rome",
    note: "The Roman state begins its long rise from city to empire.",
    side: "top",
    accent: "from-amber-400/35 to-orange-500/10"
  },
  {
    year: "44 BCE",
    label: "BCE",
    title: "Assassination of Julius Caesar",
    note: "A political rupture that reshapes the Roman Republic.",
    side: "bottom",
    accent: "from-rose-400/35 to-fuchsia-500/10"
  },
  {
    year: "476 CE",
    label: "CE",
    title: "Fall of Western Rome",
    note: "A symbolic end point for the Western Roman Empire.",
    side: "top",
    accent: "from-cyan-400/35 to-blue-500/10"
  },
  {
    year: "1066 CE",
    label: "CE",
    title: "Norman Conquest",
    note: "England's political order changes after the Battle of Hastings.",
    side: "bottom",
    accent: "from-violet-400/35 to-fuchsia-500/10"
  },
  {
    year: "1492 CE",
    label: "CE",
    title: "Voyage Across the Atlantic",
    note: "A global era of exchange, colonization, and transformation begins.",
    side: "top",
    accent: "from-emerald-400/35 to-cyan-500/10"
  },
  {
    year: "1776 CE",
    label: "CE",
    title: "American Independence",
    note: "A modern republican experiment takes shape.",
    side: "bottom",
    accent: "from-sky-400/35 to-cyan-500/10"
  },
  {
    year: "1914 CE",
    label: "CE",
    title: "World War I",
    note: "Industrial warfare accelerates geopolitical change.",
    side: "top",
    accent: "from-cyan-400/35 to-blue-500/10"
  },
  {
    year: "1945 CE",
    label: "CE",
    title: "Postwar Reconstruction",
    note: "A new global order emerges after World War II.",
    side: "bottom",
    accent: "from-violet-400/35 to-fuchsia-500/10"
  },
  {
    year: "1969 CE",
    label: "CE",
    title: "Moon Landing",
    note: "Humanity reaches another world.",
    side: "top",
    accent: "from-cyan-400/35 to-emerald-500/10"
  },
  {
    year: "1989 CE",
    label: "CE",
    title: "Berlin Wall Falls",
    note: "The Cold War begins to unwind.",
    side: "bottom",
    accent: "from-rose-400/35 to-violet-500/10"
  },
  {
    year: "2008 CE",
    label: "CE",
    title: "Global Financial Crisis",
    note: "A systemic shock exposes the fragility of the modern economy.",
    side: "top",
    accent: "from-amber-400/35 to-rose-500/10"
  },
  {
    year: "2020 CE",
    label: "CE",
    title: "Remote Coordination Shift",
    note: "Digital systems become the default infrastructure for work and life.",
    side: "bottom",
    accent: "from-sky-400/35 to-cyan-500/10"
  }
];

function parseTimelineYear(value: string) {
  const [yearPart, eraPart] = value.split(" ");
  const year = Number(yearPart);
  if (Number.isNaN(year)) return 0;
  return eraPart === "BCE" ? -year : year;
}

export default function InfiniteTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const orderedEvents = useMemo(() => {
    return [...TIMELINE_EVENTS].sort((left, right) => {
      const leftYear = parseTimelineYear(left.year);
      const rightYear = parseTimelineYear(right.year);
      return leftYear - rightYear;
    });
  }, []);

  const loopEvents = useMemo(() => [...orderedEvents, ...orderedEvents], [orderedEvents]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const findClosestIndex = () => {
      const cards = scroller.querySelectorAll<HTMLElement>("[data-timeline-item]");
      if (!cards.length) return;

      const centerX = scroller.scrollLeft + scroller.clientWidth / 2;
      let nearestIndex = activeIndex;
      let nearestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card) => {
        const index = Number(card.dataset.index);
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - centerX);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index % TIMELINE_EVENTS.length;
        }
      });

      setActiveIndex(nearestIndex);
    };

    const onScroll = () => {
      window.requestAnimationFrame(findClosestIndex);
    };

    const onWheel = (event: WheelEvent) => {
      if (!scroller) return;
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        scroller.scrollLeft += event.deltaY;
      }
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("wheel", onWheel, { passive: false });
    findClosestIndex();

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", onWheel);
    };
  }, [activeIndex]);

  return (
    <section className="relative z-10 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-0 py-10">
        <div className="relative overflow-hidden border-y border-white/5 bg-slate-950/35">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30" />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-slate-950 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-slate-950 to-transparent" />
          <div className="timeline-axis pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent blur-sm" />

          <div
            ref={scrollRef}
            className="timeline-scroll relative snap-x snap-mandatory overflow-x-auto overflow-y-hidden px-6 py-14"
            onMouseLeave={() => {
              setHoveredIndex(null);
            }}
          >
            <div className="relative h-[26rem] min-w-max px-12">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />

              <div className="absolute left-0 right-0 top-[calc(50%-1.6rem)] flex items-end justify-between px-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                <span>BCE</span>
                <span>CE</span>
              </div>

              <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 items-center gap-0">
                {loopEvents.map((event, index) => {
                  const actualIndex = index % TIMELINE_EVENTS.length;
                  const isActive = actualIndex === activeIndex;
                  const isHovered = actualIndex === hoveredIndex;

                  return (
                    <div
                      key={`${event.year}-${index}`}
                      data-timeline-item
                      data-index={index}
                      className="relative flex h-[20rem] w-[13rem] shrink-0 snap-center items-center justify-center px-2"
                    >
                      <div
                        className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black bg-slate-950 shadow-[0_0_0_5px_rgba(34,211,238,0.05)] transition-all duration-300 ${
                          isActive || isHovered ? "scale-125 bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]" : ""
                        }`}
                        onMouseEnter={() => setHoveredIndex(actualIndex)}
                      />

                      <div
                        className={`absolute left-1/2 top-1/2 h-[calc(100%-1.8rem)] w-px -translate-x-1/2 -translate-y-1/2 bg-white/10 ${
                          isActive || isHovered ? "bg-cyan-400/25" : ""
                        }`}
                      />

                      <div
                        className={`absolute left-1/2 -translate-x-1/2 ${
                          event.side === "top" ? "bottom-[52%] pb-5" : "top-[52%] pt-5"
                        }`}
                      >
                        <div className={`h-px w-6 bg-gradient-to-r ${event.accent} ${event.side === "top" ? "ml-auto" : ""}`} />
                        <div
                          className={`mt-3 w-[12rem] rounded-2xl border border-white/5 bg-slate-950/75 p-4 shadow-2xl transition-all duration-300 ${
                            isActive
                              ? "opacity-100 scale-105 translate-y-0 shadow-[0_0_36px_rgba(34,211,238,0.12)]"
                              : isHovered
                                ? "opacity-100 scale-100 translate-y-0 shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                                : "opacity-72 scale-95"
                          }`}
                          onMouseEnter={() => setHoveredIndex(actualIndex)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">
                              {event.year}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                              {event.label}
                            </span>
                          </div>
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isActive || isHovered ? "mt-3 max-h-32 opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <h3 className="text-sm font-bold text-white">{event.title}</h3>
                            <p className="mt-2 text-[11px] leading-5 text-slate-400">{event.note}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timeline-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 211, 238, 0.35) transparent;
          scroll-behavior: smooth;
        }

        .timeline-axis {
          background-size: 200% 100%;
          animation: axis-shimmer 7s linear infinite;
        }

        .timeline-scroll::-webkit-scrollbar {
          height: 8px;
        }

        .timeline-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .timeline-scroll::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.28);
          border-radius: 9999px;
        }

        @media (prefers-reduced-motion: reduce) {
          .timeline-scroll {
            scroll-behavior: auto;
          }

          .timeline-axis {
            animation: none;
          }
        }

        @keyframes axis-shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </section>
  );
}
