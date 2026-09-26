import Image from "next/image";
import { getPulse } from "@/lib/github";
import { getRecentlyPlayed } from "@/lib/spotify";
import { visitsConfigured } from "@/lib/visits";
import {
  SiBun,
  SiSpotify,
  SiNextdotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { BubbleProvider } from "./bubbles";
import { Canvas } from "./canvas";
import { SpotifyBubble } from "./spotify-bubble";
import { VisitorCounter } from "./visitor-counter";
import { Sheet } from "./sheet";
import { NorwayClock } from "./clock";
import { Badge } from "./badge";
import { Konami } from "./konami";
import { Emoji, Keycaps, Label, LogoChip, Polaroid, Sticker, TrackChip } from "./sticker";

/**
 * The home screen: a blueprint with an ID badge hung off the top edge on the
 * left, a note taped to the right, and stickers around them. Everything is
 * draggable, nothing is required.
 */
export async function Board() {
  const [pulse, tracks] = await Promise.all([
    getPulse().catch(() => null),
    getRecentlyPlayed().catch(() => []),
  ]);
  const lastTrack = tracks[0] ?? null;

  return (
    <section
      aria-label="Sticker board"
      className="relative h-dvh overflow-hidden bg-[#1a3f8a]"
    >
      <Canvas>
        <BubbleProvider>
      {/* Phones get a flat portrait; desktops get the badge on a lanyard */}
      <Sticker id="me" bubble="Yo. That's me. Developer, Data Science student, Norwegian." desktop={{ x: 50, y: 15, rotate: 0 }} mobile={{ x: 50, y: 15 }} z={5} className="md:hidden">
        <div className="sticker-edge relative h-[clamp(120px,20vh,280px)] w-[clamp(120px,20vh,280px)] overflow-hidden rounded-[38%] !border-4" style={{ "--sticker-bg": "#000" } as React.CSSProperties}>
          <Image
            src="/profile.jpg"
            alt="Marcus Ruud"
            fill
            sizes="280px"
            className="object-cover"
            priority
            draggable={false}
          />
        </div>
      </Sticker>
      <Badge />

      {/* The note */}
      <div className="absolute left-1/2 top-[58%] z-20 -translate-x-1/2 -translate-y-1/2 md:left-[64%] md:top-[52%]">
        <Sheet />
      </div>

      {/* Links */}
      <Sticker
        desktop={{ x: 44, y: 16, rotate: -10 }}
        mobile={{ x: 12, y: 10, rotate: -10 }}
        href="https://www.linkedin.com/in/marcus-ruud-25936a260/"
        label="LinkedIn"
      >
        <LogoChip bg="#0a66c2" color="#fff" size={60}>
          <FaLinkedinIn size={30} />
        </LogoChip>
      </Sticker>
      <Sticker
        desktop={{ x: 88, y: 20, rotate: 8 }}
        mobile={{ x: 88, y: 11, rotate: 8 }}
        href="https://github.com/vindusvisker"
        label="GitHub"
      >
        <LogoChip size={60}>
          <FaGithub size={34} />
        </LogoChip>
      </Sticker>
      <Sticker
        desktop={{ x: 66, y: 87, rotate: -6 }}
        mobile={{ x: 30, y: 92, rotate: -6 }}
        href="mailto:marcruud@gmail.com"
        label="Email Marcus"
      >
        <Label inverted>Email me!</Label>
      </Sticker>
      <Sticker desktop={{ x: 50, y: 84, rotate: 5 }} mobile={{ x: 72, y: 92, rotate: 5 }} href="/resume.pdf" label="Download CV">
        <Label inverted>CV ↗</Label>
      </Sticker>
      <Sticker desktop={{ x: 92, y: 44, rotate: -4 }} href="https://lerret.app" label="lerret.app">
        <Label inverted>lerret.app ↗</Label>
      </Sticker>

      {/* Top pill */}
      <Sticker desktop={{ x: 60, y: 12, rotate: -2 }} mobile={{ x: 50, y: 26, rotate: -2 }} href="https://trale.ai" label="trale.ai">
        <Label>currently building trale.ai ↗</Label>
      </Sticker>

      {/* Stack */}
      <Sticker id="next" bubble="Next.js is the go-to. App Router, full-stack, ships everything I build." desktop={{ x: 43, y: 30, rotate: -8 }} mobile={{ x: 10, y: 93, rotate: -8 }}>
        <LogoChip>
          <SiNextdotjs size={36} />
        </LogoChip>
      </Sticker>
      <Sticker id="react" bubble="React on the UI layer, everywhere." desktop={{ x: 42, y: 46, rotate: 6 }}>
        <LogoChip color="#61dafb" bg="#111">
          <SiReact size={36} />
        </LogoChip>
      </Sticker>
      <Sticker id="ts" bubble="TypeScript. Always. On everything." desktop={{ x: 8, y: 84, rotate: -4 }} mobile={{ x: 88, y: 23, rotate: 6 }}>
        <LogoChip bg="#3178c6" color="#fff">
          <SiTypescript size={34} />
        </LogoChip>
      </Sticker>
      <Sticker id="supabase" bubble="Supabase wraps Postgres for me. Auth, realtime, storage, embeddings." desktop={{ x: 18, y: 91, rotate: 8 }}>
        <LogoChip color="#3ecf8e" bg="#111">
          <SiSupabase size={34} />
        </LogoChip>
      </Sticker>
      <Sticker id="tailwind" bubble="Tailwind handles the styling. I care a lot about how things feel." desktop={{ x: 28, y: 94, rotate: -6 }}>
        <LogoChip color="#38bdf8" bg="#111">
          <SiTailwindcss size={36} />
        </LogoChip>
      </Sticker>
      <Sticker id="postgres" bubble="PostgreSQL is the backbone. Always has been." desktop={{ x: 88, y: 34, rotate: 6 }}>
        <LogoChip color="#fff" bg="#336791">
          <SiPostgresql size={34} />
        </LogoChip>
      </Sticker>
      <Sticker id="vercel" bubble="Vercel ships it. Deploys, edge, done." desktop={{ x: 96, y: 66, rotate: -5 }}>
        <LogoChip bg="#000" color="#fff">
          <SiVercel size={30} />
        </LogoChip>
      </Sticker>
      <Sticker id="python" bubble="Python for the data science side. pandas, scikit-learn, Jupyter." desktop={{ x: 78, y: 92, rotate: 7 }}>
        <LogoChip color="#3776ab">
          <SiPython size={36} />
        </LogoChip>
      </Sticker>
      <Sticker id="bun" bubble="Bun. Fast runtime, fast installs. I stopped reaching for npm." desktop={{ x: 38, y: 93, rotate: -8 }}>
        <LogoChip bg="#fbf0df" color="#000">
          <SiBun size={36} />
        </LogoChip>
      </Sticker>

      <Sticker
        id="spotify"
        bubble={<SpotifyBubble />}
        desktop={{ x: 58, y: 94, rotate: 3 }}
        mobile={{ x: 52, y: 93, rotate: 5 }}
        label="Recently played on Spotify"
      >
        {lastTrack ? (
          <>
            <TrackChip
              className="hidden md:flex"
              title={lastTrack.title}
              artist={lastTrack.artist}
              art={lastTrack.albumImageUrl}
              icon={<SiSpotify size={20} />}
            />
            <LogoChip bg="#1db954" color="#000" size={60} className="md:hidden">
              <SiSpotify size={36} />
            </LogoChip>
          </>
        ) : (
          <LogoChip bg="#1db954" color="#000" size={60}>
            <SiSpotify size={36} />
          </LogoChip>
        )}
      </Sticker>

      {/* Live bits */}
      {pulse && (
        <Sticker
          id="pulse"
          bubble={
            <>
              <span className="grid grid-cols-3 gap-2 text-center">
                <span>
                  <span className="block text-2xl">{pulse.weekCommits}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-white/50">this week</span>
                </span>
                <span>
                  <span className="block text-2xl">{pulse.yearCommits.toLocaleString("en-US")}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-white/50">this year</span>
                </span>
                <span>
                  <span className="block text-2xl">{pulse.streak}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-white/50">day streak</span>
                </span>
              </span>
              <span className="mt-3 block text-sm font-normal text-white/60">
                Most of it is trale.ai, which lives in a private repo.
              </span>
            </>
          }
          desktop={{ x: 22, y: 75, rotate: -4 }}
          label="GitHub activity"
        >
          <Label>⚡ {pulse.weekCommits} commits this week</Label>
        </Sticker>
      )}
      {visitsConfigured && (
        <Sticker desktop={{ x: 40, y: 7, rotate: -2 }}>
          <Label>
            <VisitorCounter />
          </Label>
        </Sticker>
      )}

      {/* Bits of life */}
      <Sticker
        id="marathon"
        bubble={
          <>
            My first marathon. 4:46. Now training for a sub-4 in April.
            <a
              href="https://www.instagram.com/marcusruud_/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-sm font-bold text-white/60 underline decoration-2 underline-offset-4 transition-colors hover:text-white"
            >
              @marcusruud_ on Instagram ↗
            </a>
          </>
        }
        desktop={{ x: 86, y: 60, rotate: 6 }}
        mobile={{ x: 12, y: 24, rotate: -6 }}
        label="Marathon photo"
      >
        <Polaroid src="/home/marathon-photo.jpg" alt="Marcus running his first marathon" caption="first marathon ✓" />
      </Sticker>
      <Sticker
        id="quote"
        bubble={
          <>
            &ldquo;His ability to take ownership of tasks and execute them independently has been a huge asset.&rdquo;
            <span className="mt-3 block text-sm font-normal text-white/60">Brede Y. S. Kristensen, Trale AI</span>
          </>
        }
        desktop={{ x: 84, y: 76, rotate: 3 }}
        label="What people say"
      >
        <Label>★ said about me</Label>
      </Sticker>
      <Sticker id="norway" bubble="Born and based in Norway. Cold, dark, great for shipping." desktop={{ x: 83, y: 8, rotate: 10 }}>
        <Emoji>🇳🇴</Emoji>
      </Sticker>
      <Sticker desktop={{ x: 8, y: 94, rotate: -3 }}>
        <Label>
          <NorwayClock />
        </Label>
      </Sticker>
      <Sticker id="movies" bubble="Movies when I'm not coding. Recommendations welcome." desktop={{ x: 37, y: 62, rotate: 6 }}>
        <Emoji>🎬</Emoji>
      </Sticker>
      <Sticker id="school" bubble="Data Science at Noroff on the side. I wanted to understand what's happening under the hood of the AI tools I build every day." desktop={{ x: 75, y: 17, rotate: -6 }}>
        <Emoji>🎓</Emoji>
      </Sticker>
      <Sticker
        id="crane"
        bubble="Four years as a crane signalman before code. I was part of building the Johan Castberg oil tanker. Before that, the military. After, I ran Solvify, outbound automation for early-stage startups."
        desktop={{ x: 9, y: 70, rotate: -8 }}
        mobile={{ x: 90, y: 93, rotate: -8 }}
        label="Crane"
      >
        <Emoji>🏗️</Emoji>
      </Sticker>
      <Sticker
        id="cheat"
        bubble="An old cheat code. Click the board, then type it on your keyboard."
        desktop={{ x: 30, y: 84, rotate: -3 }}
        label="Cheat code"
      >
        <Keycaps keys={["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"]} />
      </Sticker>
      <Sticker id="gym" bubble="Exercise most days. The military discipline never really left." desktop={{ x: 48, y: 94, rotate: 4 }}>
        <Emoji>🏋️</Emoji>
      </Sticker>
      <Sticker id="agents" bubble="I teach AI agents to do my job, then spend even more time reviewing their work." desktop={{ x: 94, y: 88, rotate: -6 }}>
        <Emoji>🤖</Emoji>
      </Sticker>

        </BubbleProvider>
      </Canvas>
      <Konami />

    </section>
  );
}
