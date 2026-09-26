"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ROUTE_REVEAL_EVENT, routeCovered } from "@/components/route-transition";

/** Seconds the sphere takes to grow in */
const INTRO = 0.9;
/** Ease out with a little overshoot, like something set down on the sheet */
const backOut = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

export interface ReelItem {
  src: string;
  alt: string;
}

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/*
 * A glass sphere with the project reel refracted inside it. u_p goes from 0
 * (sphere) to 1 (flat frame): the mask morphs from a circle to a rectangle
 * and the lens distortion, fringing and rim fade out.
 */
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_p;
uniform float u_dpr;
uniform float u_radius;
uniform vec2 u_rect;
uniform float u_rectR;
uniform sampler2D u_texA;
uniform sampler2D u_texB;
uniform float u_aspA;
uniform float u_aspB;
uniform float u_mix;
varying vec2 v_uv;

float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdRRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec2 cover(vec2 uv, float texAsp, float frameAsp) {
  vec2 c = uv - 0.5;
  if (texAsp > frameAsp) c.x *= frameAsp / texAsp; else c.y *= texAsp / frameAsp;
  return c + 0.5;
}

vec3 reel(vec2 uv) {
  float frameAsp = u_rect.x / u_rect.y;
  vec3 a = texture2D(u_texA, cover(uv, u_aspA, frameAsp)).rgb;
  vec3 b = texture2D(u_texB, cover(uv, u_aspB, frameAsp)).rgb;
  return mix(a, b, u_mix);
}

void main() {
  vec2 px = (v_uv - 0.5) * u_res;
  float dC = sdCircle(px, u_radius);
  float dR = sdRRect(px, u_rect, u_rectR);
  float d = mix(dC, dR, u_p);
  float aa = 1.2 * u_dpr;
  float mask = 1.0 - smoothstep(-aa, aa, d);
  if (mask <= 0.002) { gl_FragColor = vec4(0.0); return; }

  // The sphere grows as the mask opens up, so it flattens out instead of
  // sitting as a ball inside the frame. Effects are gone by 85% scroll.
  float glass = 1.0 - smoothstep(0.0, 0.7, u_p);
  float q = 1.0 - u_p * 0.995;
  float Rs = u_radius * (1.0 + 0.15 * u_p) / (q * q);
  float dist = min(length(px) / Rs, 0.995);
  float z = sqrt(1.0 - dist * dist);
  vec2 n = px / Rs;

  vec2 uvSphere = px / (2.2 * u_radius) + 0.5;
  vec2 uvRect = px / (2.0 * u_rect) + 0.5;
  vec2 drift = vec2(sin(u_time * 0.21), cos(u_time * 0.17)) * 0.05 * glass;
  vec2 base = mix(uvSphere, uvRect, smoothstep(0.0, 1.0, u_p)) + drift;

  vec2 bend = n * (1.0 - z) * 0.42 * glass;
  vec3 col;
  col.r = reel(base - bend * 1.08).r;
  col.g = reel(base - bend).g;
  col.b = reel(base - bend * 0.92).b;

  // Oil-film iridescence on the rim: a thin-film rainbow keyed to the view
  // angle, so it stays put whatever picture is inside and drifts slowly.
  float film = pow(1.0 - z, 1.6) * glass;
  float ang = atan(n.y, n.x);
  float phase = film * 2.4 + 0.12 * sin(ang * 3.0 + u_time * 0.3) + u_time * 0.04;
  vec3 rainbow = 0.5 + 0.5 * cos(6.2831 * (phase + vec3(0.0, 0.33, 0.67)));
  col += rainbow * film * 0.6;

  // A faint dark edge so the sphere keeps its outline on a light page.
  float rim = pow(1.0 - z, 3.0) * glass;
  col = mix(col, vec3(0.06), rim * 0.7);
  vec2 hl = n - vec2(-0.38, 0.42);
  col += exp(-dot(hl, hl) * 12.0) * 0.45 * glass;
  float shade = smoothstep(-0.2, 1.0, -n.y) * 0.25 * glass;
  col *= 1.0 - shade;

  gl_FragColor = vec4(col, mask);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

/**
 * Pinned opener: a glass orb with the reel inside it, that unfolds into a
 * flat frame as you scroll, then the page carries on underneath.
 */
export function Reel({ items }: { items: [ReelItem, ReelItem, ReelItem] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const progress = useRef(0);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  useEffect(() => scrollYProgress.on("change", (v) => { progress.current = v; }), [scrollYProgress]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl) { setFailed(true); return; }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) { setFailed(true); return; }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFailed(true); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const U = {
      res: u("u_res"), time: u("u_time"), p: u("u_p"), dpr: u("u_dpr"), radius: u("u_radius"),
      rect: u("u_rect"), rectR: u("u_rectR"), texA: u("u_texA"), texB: u("u_texB"),
      aspA: u("u_aspA"), aspB: u("u_aspB"), mix: u("u_mix"),
    };
    gl.uniform1i(U.texA, 0);
    gl.uniform1i(U.texB, 1);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    const texs: WebGLTexture[] = [];
    const asp: number[] = [];
    let loaded = 0;
    const imgs = items.map((it, i) => {
      const img = new window.Image();
      img.onload = () => {
        const t = gl.createTexture();
        if (!t) return;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        texs[i] = t;
        asp[i] = img.naturalWidth / img.naturalHeight;
        loaded += 1;
      };
      img.src = it.src;
      return img;
    });

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The sphere grows in once its textures are ready. Arriving under a route
    // sheet, it waits for the sheet to lift so the two motions read as one.
    let introAt: number | null = null;
    let armed = false;
    const arm = () => {
      if (!armed && loaded >= items.length && !routeCovered()) {
        armed = true;
        introAt = performance.now();
      }
    };
    const onReveal = () => arm();
    window.addEventListener(ROUTE_REVEAL_EVENT, onReveal);
    const period = 1.8;
    const hold = 0.9;
    const t0 = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (loaded < items.length) return;
      arm();
      const box = wrap.current?.getBoundingClientRect();
      if (box && box.bottom < 0) return;

      const t = (now - t0) / 1000;
      let slot = 0;
      let fade = 0;
      if (!reduce) {
        slot = Math.floor(t / period) % items.length;
        const local = t % period;
        fade = local < hold ? 0 : (local - hold) / (period - hold);
        fade = fade * fade * (3.0 - 2.0 * fade);
      }
      const next = (slot + 1) % items.length;

      const W = canvas.width;
      const H = canvas.height;
      const margin = Math.max(20 * dpr, W * 0.06);
      let rw = W - margin * 2;
      let rh = rw * (10 / 16);
      const maxH = H - margin * 2;
      if (rh > maxH) { rh = maxH; rw = rh * (16 / 10); }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.res, W, H);
      gl.uniform1f(U.time, reduce ? 0 : t);
      gl.uniform1f(U.p, progress.current);
      gl.uniform1f(U.dpr, dpr);
      const intro = reduce ? 1 : introAt == null ? 0.001 : Math.max(0.001, backOut(Math.min(1, (now - introAt) / (INTRO * 1000))));
      gl.uniform1f(U.radius, Math.min(W, H) * 0.2 * intro);
      gl.uniform2f(U.rect, rw / 2, rh / 2);
      gl.uniform1f(U.rectR, 0.0);
      gl.uniform1f(U.aspA, asp[slot]);
      gl.uniform1f(U.aspB, asp[next]);
      gl.uniform1f(U.mix, fade);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texs[slot]);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texs[next]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(ROUTE_REVEAL_EVENT, onReveal);
      ro.disconnect();
      imgs.forEach((img) => { img.onload = null; });
      texs.forEach((t) => gl.deleteTexture(t));
      gl.deleteProgram(prog);
    };
  }, [items]);

  if (failed) {
    return (
      <div className="px-5 pb-16 pt-32 md:px-8">
        <div className="relative mx-auto aspect-[16/10] max-w-5xl overflow-hidden bg-black">
          <Image src={items[1].src} alt={items[1].alt} fill sizes="100vw" priority className="object-cover object-top" />
        </div>
      </div>
    );
  }

  return (
    <div ref={wrap} className="relative h-[150svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div
          aria-hidden="true"
          style={{ opacity: shadowOpacity }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[9vmin] w-[38vmin] -translate-x-1/2 translate-y-[17vmin] rounded-[100%] bg-[radial-gradient(closest-side,rgba(26,23,19,0.28),transparent)]"
        />
        <canvas ref={canvasRef} className="relative block h-full w-full" aria-hidden="true" />
        <ul className="sr-only">
          {items.map((it) => (
            <li key={it.src}>{it.alt}</li>
          ))}
        </ul>
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground">↓ scroll</p>
      </div>
    </div>
  );
}
