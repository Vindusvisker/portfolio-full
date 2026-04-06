"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useRef, useState } from "react";
import { Autoplay, EffectCreative, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperRef } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { BlurFade } from "./ui/blur-fade";

const testimonials = [
  {
    quote:
      "Marcus and his team delivered impressive results with their LinkedIn and email automation services. I'm very satisfied and highly recommend their expertise.",
    name: "Mathias Warg",
    handle: "@mathiaswarg",
  },
  {
    quote:
      "Marcus and his team at Solvify have been great to work with on our outbound communications. They've worked within our budget and helped us devise and run the kinds of experiments that are so crucial for us at this early stage.",
    name: "Jackie Peters",
    handle: "@jackiepeters",
  },
  {
    quote:
      "Marcus has been a fantastic addition to our team at Trale AI. His ability to take ownership of tasks and execute them independently has been a huge asset. His structured approach and problem-solving mindset make a real difference.",
    name: "Brede Y. S. Kristensen",
    title: "Trale AI",
  },
  {
    quote:
      "Working with Marcus has been great. He jumped into the team, took responsibility from day one, and delivered value immediately. His proactive attitude and execution skills make him stand out.",
    name: "Samuel Nuri",
    handle: "@samuelnuri",
  },
  {
    quote:
      "I've known Marcus since our military days, and his drive, discipline, and leadership have always stood out. He pushes himself beyond limits and brings that same relentless mindset into his work.",
    name: "Lars Fredrik Sloveren",
    handle: "@larssloveren",
  },
  {
    quote:
      "Marcus taught me a lot about automation and outbound sales. He has a rare ability to both execute and educate at a high level. Working with him, even for a short time, was incredibly valuable.",
    name: "Christian Egeland",
    handle: "@christianegeland",
  },
  {
    quote:
      "Marcus is the guy who gets things done. Whether it's coding, business, or strategy — if he sets his mind to something, he'll execute at full force.",
    name: "Isak Heltne",
    handle: "@isakheltne",
  },
  {
    quote:
      "Marcus is not only incredibly driven but also one of the most caring and open-minded people I know. He's always eager to meet new people, connect, and create meaningful relationships.",
    name: "Martine Gjerdsbakk",
    handle: "@martinegjerdsbakk",
  },
  {
    quote:
      "I worked with Marcus for over 2 years, and he's one of the most reliable and structured people I know. Whether it's in tech or logistics, he brings a level of precision that makes a real difference.",
    name: "Marit Johansen",
    handle: "@maritjohansen",
  },
  {
    quote:
      "Marcus created a fantastic outbound marketing course that helped me get more leads. His ability to break down complex topics into actionable steps is remarkable.",
    name: "Harshith H",
    handle: "@harshithh",
  },
];

const CARD_COLORS = [
  "oklch(0.95 0.02 230)",  // creamy blue
  "oklch(0.95 0.02 80)",   // creamy beige
  "oklch(0.95 0.02 145)",  // creamy green
  "oklch(0.95 0.02 90)",   // creamy yellow
  "oklch(0.95 0.02 320)",  // creamy lavender
  "oklch(0.95 0.02 25)",   // creamy peach
];

export function Testimonials() {
  const swiperRef = useRef<SwiperRef>(null);
  const [selected, setSelected] = useState(0);

  return (
    <section className="mt-8 mx-auto max-w-3xl px-6">
      <BlurFade delay={0.05} inView>
        <style>{`
          .testimonial-swiper {
            padding-bottom: 0 !important;
          }
          .testimonial-swiper .swiper-slide {
            border-radius: 12px;
            overflow: hidden;
          }
          .testimonial-swiper .swiper-pagination {
            display: none;
          }
        `}</style>
        <Swiper
          ref={swiperRef}
          effect="creative"
          grabCursor
          loop
          centeredSlides
          autoplay={{ delay: 5000, disableOnInteraction: true }}
          creativeEffect={{
            prev: {
              shadow: true,
              origin: "left center",
              translate: ["-5%", 0, -200],
              rotate: [0, 100, 0],
            },
            next: {
              origin: "right center",
              translate: ["5%", 0, -200],
              rotate: [0, -100, 0],
            },
          }}
          modules={[EffectCreative, Pagination, Autoplay]}
          className="testimonial-swiper"
          onSlideChange={(swiper) => setSelected(swiper.realIndex)}
        >
          {testimonials.map((testimonial, i) => (
            <SwiperSlide key={i}>
              <div
                className="flex flex-col justify-center px-8 py-6 border border-border/50"
                style={{
                  backgroundColor: CARD_COLORS[i % CARD_COLORS.length],
                  minHeight: 220,
                }}
              >
                <blockquote className="text-lg leading-relaxed text-neutral-800">
                  <Quote size={20} className="opacity-20 inline-block mr-1 -mt-1" aria-hidden="true" />
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-4">
                  <p className="text-base font-medium text-neutral-900">{testimonial.name}</p>
                  <p className="text-xs text-neutral-500">
                    {testimonial.title || testimonial.handle}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </BlurFade>
      <BlurFade delay={0.1} inView>
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); swiperRef.current?.swiper.slidePrev(); }}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border/50 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer active:scale-[0.98]"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs tabular-nums text-muted-foreground">
            {selected + 1} / {testimonials.length}
          </span>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); swiperRef.current?.swiper.slideNext(); }}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border/50 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer active:scale-[0.98]"
            aria-label="Next testimonial"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </BlurFade>
    </section>
  );
}
