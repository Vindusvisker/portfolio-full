import Link from "next/link";
import { Row } from "./row";

const lately = [
  {
    name: "trale.ai",
    note: "AI meeting intelligence platform at Supercompany",
    status: "Production",
    href: "https://trale.ai",
  },
  {
    name: "lerret.app",
    note: "Screenshot and device mockup editor",
    status: "Production",
    href: "https://lerret.app",
  },
  {
    name: "personaforge.me",
    note: "Persona card editor, built and sold",
    status: "Sold",
    href: "",
  },
];

const contact = [
  { label: "marcruud@gmail.com", href: "mailto:marcruud@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/marcus-ruud-25936a260/" },
  { label: "GitHub", href: "https://github.com/vindusvisker" },
  { label: "CV (PDF)", href: "/resume.pdf" },
];

/** Sparse, typographic run-down of recent work and how to reach me. */
export function Lately() {
  return (
    <section id="lately" className="mx-auto max-w-5xl scroll-mt-16 px-6 py-28 md:py-40">
      <div className="space-y-24 md:space-y-32">
        <Row label="Lately">
          <ul>
            {lately.map((item) => (
              <li key={item.name}>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border py-5 text-2xl leading-tight transition-colors hover:text-white md:text-4xl"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.note}</span>
                    <span className="ml-auto font-mono text-sm text-muted-foreground transition-colors group-hover:text-white">
                      ({item.status}) →
                    </span>
                  </a>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border py-5 text-2xl leading-tight md:text-4xl">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.note}</span>
                    <span className="ml-auto font-mono text-sm text-muted-foreground">({item.status})</span>
                  </div>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/projects"
                className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border py-5 text-2xl leading-tight transition-colors hover:text-white md:text-4xl"
              >
                <span className="font-medium">Open source</span>
                <span className="text-muted-foreground">Everything else lives on GitHub</span>
                <span className="ml-auto font-mono text-sm text-muted-foreground transition-colors group-hover:text-white">
                  →
                </span>
              </Link>
            </li>
          </ul>
        </Row>

        <Row label="Contact">
          <ul className="space-y-2 text-xl md:text-2xl">
            {contact.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target={item.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="underline decoration-border underline-offset-8 transition-colors hover:decoration-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </Row>
      </div>
    </section>
  );
}
