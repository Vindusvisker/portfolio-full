"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";

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

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () =>
    setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const testimonial = testimonials[current];

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="slide-enter text-lg font-bold">What others say</h2>
      <div className="mt-8 rounded-xl border border-border/50 bg-card p-8">
        <Quote size={24} className="text-primary/40" />
        <blockquote className="mt-4 text-sm leading-relaxed text-card-foreground">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">
              {testimonial.title || testimonial.handle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="rounded-md border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {current + 1} / {testimonials.length}
            </span>
            <button
              onClick={next}
              className="rounded-md border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
