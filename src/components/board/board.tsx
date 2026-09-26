import Image from "next/image";
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
import { CardDeck } from "./card-deck";
import { NorwayClock } from "./clock";
import { Emoji, Label, LogoChip, Polaroid, Sticker } from "./sticker";

/**
 * The home screen: a black sheet of graph paper with stickers scattered
 * around a stack of cards. Everything is draggable, nothing is required.
 */
export function Board() {
  return (
    <section aria-label="Sticker board" className="relative h-dvh overflow-hidden bg-black">
      <Canvas>
        <BubbleProvider>
      {/* Portrait, tucked behind the card stack */}
      <Sticker id="me" bubble="Yo. That's me. Developer, Data Science student, Norwegian." desktop={{ x: 50, y: 24, rotate: 0 }} mobile={{ x: 50, y: 17 }} z={5}>
        <div className="sticker-edge relative h-[clamp(120px,20vh,280px)] w-[clamp(120px,20vh,280px)] md:h-[clamp(160px,26vh,280px)] md:w-[clamp(160px,26vh,280px)] overflow-hidden rounded-[38%] !border-4" style={{ "--sticker-bg": "#000" } as React.CSSProperties}>
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

      {/* Card stack */}
      <div className="absolute left-1/2 top-[58%] z-20 -translate-x-1/2 -translate-y-1/2 md:top-[57%]">
        <CardDeck />
      </div>

      {/* Links */}
      <Sticker
        desktop={{ x: 29, y: 26, rotate: -10 }}
        mobile={{ x: 13, y: 13, rotate: -10 }}
        href="https://www.linkedin.com/in/marcus-ruud-25936a260/"
        label="LinkedIn"
      >
        <LogoChip bg="#0a66c2" color="#fff" size={60}>
          <FaLinkedinIn size={30} />
        </LogoChip>
      </Sticker>
      <Sticker
        desktop={{ x: 71, y: 20, rotate: 8 }}
        mobile={{ x: 86, y: 22, rotate: 8 }}
        href="https://github.com/vindusvisker"
        label="GitHub"
      >
        <LogoChip size={60}>
          <FaGithub size={34} />
        </LogoChip>
      </Sticker>
      <Sticker
        desktop={{ x: 76, y: 66, rotate: -6 }}
        mobile={{ x: 34, y: 92, rotate: -6 }}
        href="mailto:marcruud@gmail.com"
        label="Email Marcus"
      >
        <Label inverted>Email me!</Label>
      </Sticker>
      <Sticker desktop={{ x: 25, y: 66, rotate: 5 }} mobile={{ x: 76, y: 92, rotate: 5 }} href="/resume.pdf" label="Download CV">
        <Label inverted>CV ↗</Label>
      </Sticker>

      {/* Top pill */}
      <Sticker desktop={{ x: 63, y: 7, rotate: 2 }} mobile={{ x: 54, y: 31, rotate: -2 }} href="https://trale.ai" label="trale.ai">
        <Label>currently building trale.ai ↗</Label>
      </Sticker>

      {/* Stack */}
      <Sticker id="next" bubble="Next.js is the go-to. App Router, full-stack, ships everything I build." desktop={{ x: 12, y: 17, rotate: -8 }} mobile={{ x: 10, y: 90, rotate: -8 }}>
        <LogoChip>
          <SiNextdotjs size={36} />
        </LogoChip>
      </Sticker>
      <Sticker id="react" bubble="React on the UI layer, everywhere." desktop={{ x: 21, y: 42, rotate: 6 }}>
        <LogoChip color="#61dafb" bg="#111">
          <SiReact size={36} />
        </LogoChip>
      </Sticker>
      <Sticker id="ts" bubble="TypeScript. Always. On everything." desktop={{ x: 8, y: 58, rotate: -4 }} mobile={{ x: 90, y: 31, rotate: 6 }}>
        <LogoChip bg="#3178c6" color="#fff">
          <SiTypescript size={34} />
        </LogoChip>
      </Sticker>
      <Sticker id="supabase" bubble="Supabase wraps Postgres for me. Auth, realtime, storage, embeddings." desktop={{ x: 20, y: 76, rotate: 8 }}>
        <LogoChip color="#3ecf8e" bg="#111">
          <SiSupabase size={34} />
        </LogoChip>
      </Sticker>
      <Sticker id="tailwind" bubble="Tailwind handles the styling. I care a lot about how things feel." desktop={{ x: 30, y: 90, rotate: -6 }}>
        <LogoChip color="#38bdf8" bg="#111">
          <SiTailwindcss size={36} />
        </LogoChip>
      </Sticker>
      <Sticker id="postgres" bubble="PostgreSQL is the backbone. Always has been." desktop={{ x: 83, y: 30, rotate: 6 }}>
        <LogoChip color="#fff" bg="#336791">
          <SiPostgresql size={34} />
        </LogoChip>
      </Sticker>
      <Sticker id="vercel" bubble="Vercel ships it. Deploys, edge, done." desktop={{ x: 89, y: 56, rotate: -5 }}>
        <LogoChip bg="#000" color="#fff">
          <SiVercel size={30} />
        </LogoChip>
      </Sticker>
      <Sticker id="python" bubble="Python for the data science side. pandas, scikit-learn, Jupyter." desktop={{ x: 77, y: 80, rotate: 7 }}>
        <LogoChip color="#3776ab">
          <SiPython size={36} />
        </LogoChip>
      </Sticker>
      <Sticker id="bun" bubble="Bun. Fast runtime, fast installs. I stopped reaching for npm." desktop={{ x: 67, y: 93, rotate: -8 }}>
        <LogoChip bg="#fbf0df" color="#000">
          <SiBun size={36} />
        </LogoChip>
      </Sticker>

      <Sticker
        id="spotify"
        bubble={<SpotifyBubble />}
        desktop={{ x: 55, y: 91, rotate: 5 }}
        mobile={{ x: 56, y: 90, rotate: 5 }}
        label="Recently played on Spotify"
      >
        <LogoChip bg="#1db954" color="#000" size={60}>
          <SiSpotify size={36} />
        </LogoChip>
      </Sticker>

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
        desktop={{ x: 75, y: 47, rotate: 6 }}
        mobile={{ x: 13, y: 25, rotate: -6 }}
        label="Marathon photo"
      >
        <Polaroid src="/home/marathon-photo.jpg" alt="Marcus running his first marathon" caption="first marathon ✓" />
      </Sticker>
      <Sticker id="norway" bubble="Born and based in Norway. Cold, dark, great for shipping." desktop={{ x: 91, y: 13, rotate: 10 }}>
        <Emoji>🇳🇴</Emoji>
      </Sticker>
      <Sticker desktop={{ x: 12, y: 88, rotate: -3 }}>
        <Label>
          <NorwayClock />
        </Label>
      </Sticker>
      <Sticker id="movies" bubble="Movies when I'm not coding. Recommendations welcome." desktop={{ x: 9, y: 36, rotate: 6 }}>
        <Emoji>🎬</Emoji>
      </Sticker>
      <Sticker
        id="crane"
        bubble="Four years as a crane signalman before code. I was part of building the Johan Castberg oil tanker."
        desktop={{ x: 8, y: 74, rotate: -8 }}
        mobile={{ x: 90, y: 90, rotate: -8 }}
        label="Crane"
      >
        <Emoji>🏗️</Emoji>
      </Sticker>
      <Sticker id="gym" bubble="Exercise most days. The military discipline never really left." desktop={{ x: 41, y: 91, rotate: 4 }}>
        <Emoji>🏋️</Emoji>
      </Sticker>
      <Sticker id="agents" bubble="I teach AI agents to do my job, then spend even more time reviewing their work." desktop={{ x: 88, y: 88, rotate: -6 }}>
        <Emoji>🤖</Emoji>
      </Sticker>

        </BubbleProvider>
      </Canvas>

      <a
        href="#lately"
        className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 font-mono text-xs text-white/50 transition-colors hover:text-white md:block"
      >
        ↓ lately
      </a>
    </section>
  );
}
