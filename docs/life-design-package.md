# Life page design package

> **Pivot, Oct 20 2026 (same day, after the video gate):** Marcus chose an autoplay intro over a scroll-scrubbed hero. The dive (take 1, Cinema Studio 3.0, 6 s) now plays once on load, then the existing sticker board pops out of the frozen last frame, which is the board's surface. Phones and reduced motion land directly on the ending frame; a visitor who already dived this session lands directly too. Sections 4 to 8 below describe the scroll version and are kept as reference for copy and tone only; the build is `src/components/life/dive-intro.tsx` plus the board. Five sea die-cut stickers were added (fish, turtle, crab, snorkel, surfboard) with bubbles in the sticker voice. Later the same day: the taped note became a dive slate (white plastic, cord, pencil; CSS only, board/sheet.tsx), the access card on the lanyard became a waterproof phone pouch with Marcus's profile on the screen (public/lanyard/pouch-front.jpg and pouch-back.jpg, composed from Higgsfield pouch art plus an HTML render of the screen; the texture must be opaque and edge to edge because the lanyard paints it into the card's atlas), and the six emoji stickers became die-cuts (helmet, dumbbell, crane, clapperboard, grad cap, robot). Arriving from Work or Stack lands directly on the sea floor; only a fresh load plays the dive. A Work intro (crane descent into a hold, light coming on in a bright office, landing on a desk) was built and tested the same evening, then scrapped by Marcus: the Work page is back to its committed state and the two shots (jobs 5d1b6dd0 and e727d734) stay in his Higgsfield gallery. The shared component src/components/intro/video-intro.tsx remains, surface mode only.

Written Oct 20, 2026, before any video credits moved. Every line of copy below ships verbatim. Band ranges are starting points, validated by the flick test in the build.

## 1. Brand premise

One word: **in**. The camera goes into the sea, the proof goes into shipped products, the visitor's one action is going into his inbox. Marcus corrected the tone on Oct 20: he is not "a madman", he is relaxed and easy to have around, and the copy must sound like that. "Work like a madman" and "Live like one too" are retired; nothing on the site uses them.

## 2. Palette (direction now, exact values sampled from the approved footage after the gate)

```css
:root {
  --canvas: #071a1f;        /* deep sea ink, tinted toward the footage, never pure black */
  --panel: #0d2a30;         /* raised surfaces */
  --accent: #4fd8cc;        /* turquoise light from the water, CTA and rare emphasis only */
  --accent-hover: #7ae6dc;
  --accent-muted: rgba(79, 216, 204, 0.18);  /* borders, glows, bubbles */
  --text-primary: #f2efe8;  /* the site's cream, kept */
  --text-secondary: #a9b8b6;
}
```

Work and Stack keep their own materials (cream paper, black sky). Life becomes the sea. The Life | Work | Stack switch gets a "sea" look: a glass chip over footage, like the Stack readout but turquoise-edged.

## 3. Type trio

Barlow Condensed 600/700 (display, already site-wide), Geist 400/500 (body), Roboto Mono 400/500 (labels and the depth readout). All three already load in layout.tsx. Nothing new to fetch.

## 4. Band map (hero height 400vh, one 6-second shot)

| Band | Range (start) | Footage moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.22 | Calm dawn surface from above, the drop just beginning | **Hey, I'm Marcus.** / I build products with code. | Drift-down, opens settled with the one-time load ramp |
| 2 | 0.26 to 0.50 | Falling faster, glints rushing up toward the lens | **Work like a madman.** | Approach-from-depth (the surface rushes closer, so do the words) |
| 3 | 0.54 to 0.74 | The splash, droplets on the lens, a beat of blur | **Live like one too.** | Word-punch with overshoot on "too" (the impact) |
| 4 | 0.80 to 1.00 | Underwater, settling onto sunlit sand under caustic light | **All in. Every time.** / Full-stack developer at Supercompany, building trale.ai. Right now from Thailand. / [Email me ↗] [See the work →] | Word-by-word rise into a staged settle: headline, then subline, then the CTA row |

Captions live in the left third (the calm lane planned into the frame). The action lane is centre-right and stays clear. Band 4 is text-safe anywhere because the ending is full-bleed texture.

## 5. Static-hero copy block (phones, portrait tablets, reduced motion)

Poster: the ending frame (sand and caustics). Headline: **Hey, I'm Marcus. All in, every time.** Subline: I build products with code. Full-stack at Supercompany, building trale.ai. Right now from Thailand. CTA: Email me ↗. Secondary: See the work →.

## 6. Below the fold (settles into a real website; everything funnels to Email)

The signature element: **the page has a depth.** A mono readout in the hero corner counts metres as you scroll (0.0 m at the surface, 12.0 m at the settle), delta-gated at 10Hz. Every section below is labelled by its depth, so scrolling reads as going deeper, not past stacked sections.

1. **−14 m · Now.** The 60-second filter: role and proof immediately, real work with live links.
   - Kicker: Now
   - Headline: **Three things I've shipped. Two still running.**
   - Rows (a ledger, not cards): trale.ai, Production, Thousands of users, link. lerret.app, Live and for sale, Solo build, link. personaforge.me, Built, shipped, sold.
   - Line under: Open source and the full graveyard are on the Work page. [See the work →]

2. **−18 m · How I work.** Answers the objections buyers actually voice ("thought he was farther along than he really was", "has done it before", "a basic shell ready quickly").
   - Headline: **You'll always know where it actually is.**
   - Three short rows: **Done it before.** Platforms, AI tools, automation. The shell is up fast, the time goes on the part that's yours. / **Honest status.** You hear where it really stands, not where I wish it stood. / **Finishes.** I ship. Ask the people at Supercompany, or the person who bought personaforge.

3. **−22 m · Off the clock.** The one interactive moment: a press-and-hold **"Hold to go deeper."** Progress builds while held, eases back on early release, and completing it lights the strip in sequence. Reduced motion gets the lit state instantly.
   - Headline (revealed): **Same engine, different outlets.**
   - Strip: the real marathon photo (public/home/marathon-photo.jpg) with "First marathon, done." / "Muay thai, most mornings." / "Thailand, for now." plus the local time there, the way the Norway clock works today.
   - Footnote in mono: Work like a madman. Live like one too.

4. **−26 m · Questions people actually ask.**
   - Are you available? Yes, for the right thing. Email and ask.
   - Remote? Always. Norway on paper, Thailand right now, your timezone when it matters.
   - What do you charge? Depends on the thing. Tell me what it is and I'll give you a number, not a range.
   - Will you finish? Yes. See −18 m.

5. **−30 m · The one call to action.**
   - Line: Need something built? I read every email.
   - Links in the display face: marcruud@gmail.com (mailto), LinkedIn, GitHub.
   - Form handling: no form. The mailto link is the honest version; a visitor's message opens in their own mail app addressed to Marcus.

6. **Footer.** The existing site footer, plus one mono line: Hero footage generated with Higgsfield. (Real person, generated visuals: said plainly rather than implied.)

## 7. Vector layer plan

- A self-drawing depth line down the left margin, drawn by scroll from the hero's end to the final CTA, with a tick and the depth label at each section. Reduced motion shows it fully drawn.
- Bubbles at whisper level in the settle band and the −22 m section: six to eight small circles rising on a 7 to 11 second loop with negative delays, paused off-screen and on hidden tabs via the body.paused rule.
- One fixed background environment layer behind everything below the hero: the ending frame's caustic light at low opacity, drifting on a 60 second cycle.

## 8. Engineering list (React component inside the Next.js site)

Blob fetch with the streamed loading ring and the poster-first race; dt-normalized lerp in a rAF loop that rests; gated seeks with the error escape; delta-gated DOM writes; bands paced in vh and validated by the flick test (120, 240, 360px); the four-layer legibility system with the worst-frame audit at 3.5:1; the five static-hero gates kept live with change listeners, identical in CSS and JS; complete without the video; reduced motion honoured live in both directions; the quality floor. Video served from public/home/hero-scrub.mp4, poster and ending frames beside it, raws and review files outside public/. The route transition's "blueprint" material for "/" becomes the sea material. The old board components stay in the repo untouched until the video gate passes; nothing is shown or wired until then.

## 9. Copy gate

Every viewer-facing line above ships verbatim. Before anyone sees the page: zero em dashes, zero of the stock words (leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions), and the body-copy sweep for AI tells. "Work like a madman. Live like one too." and "All in. Every time." are designed devices and stay.
