// InfiniteMenu from React Bits (reactbits.dev), JavaScript + CSS variant.
// Changes from the source: the icosahedron is subdivided twice (162 discs,
// so all 66 tools get a seat instead of the first 42), the render loop and
// pointer listeners are torn down on unmount, pointer math is relative to
// the canvas rather than the viewport, the atlas cell size is a prop, and
// the caption is rendered by the caller through `renderCaption`. Its styles
// live in globals.css under "Infinite menu".
import { useEffect, useRef, useState } from 'react';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';

const discVertShaderSource = `#version 300 es

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
out vec3 vWorldNormal;
out vec3 vWorldPos;
flat out int vInstanceId;

#define PI 3.141593

void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);

    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);

    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }

    worldPosition.xyz = radius * normalize(worldPosition.xyz);

    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vWorldNormal = normalize(worldPosition.xyz);
    vWorldPos = worldPosition.xyz;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
uniform vec3 uCameraPosition;

out vec4 outColor;

in vec2 vUvs;
in float vAlpha;
in vec3 vWorldNormal;
in vec3 vWorldPos;
flat in int vInstanceId;

// One key light, up and to the left of the camera. Shared with the body shader.
const vec3 LIGHT = normalize(vec3(-0.55, 0.75, 0.6));
const vec3 GLASS = vec3(0.95, 0.96, 1.0);

void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellsPerRow = uAtlasSize;
    int cellX = itemIndex % cellsPerRow;
    int cellY = itemIndex / cellsPerRow;
    vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;

    ivec2 texSize = textureSize(uTex, 0);
    float imageAspect = float(texSize.x) / float(texSize.y);
    float containerAspect = 1.0;

    float scale = max(imageAspect / containerAspect,
                     containerAspect / imageAspect);

    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = (st - 0.5) * scale + 0.5;

    st = clamp(st, 0.0, 1.0);

    st = st * cellSize + cellOffset;

    vec4 base = texture(uTex, st);

    // Glass: the tile sits on a glossy sphere, so it catches the key light as
    // a broad sheen plus a tight hot spot, and lightens at grazing angles.
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(uCameraPosition - vWorldPos);
    vec3 H = normalize(LIGHT + V);
    float NdH = max(dot(N, H), 0.);
    float sheen = pow(NdH, 14.) * 0.16;
    float spot = pow(NdH, 90.) * 0.32;
    float fresnel = pow(1. - max(dot(N, V), 0.), 3.) * 0.22;

    // Each disc is its own lens: a soft reflection up-left and a thin bright
    // arc along the upper rim, fading out toward the bottom.
    float lens = (1. - smoothstep(0.0, 0.34, length(vUvs - vec2(0.36, 0.7)))) * 0.07;
    float r = length(vUvs - 0.5) * 2.;
    float upper = smoothstep(-0.1, 0.8, (vUvs.y - 0.5) - (vUvs.x - 0.5) * 0.35);
    float arc = smoothstep(0.82, 0.93, r) * (1. - smoothstep(0.93, 1.0, r)) * upper * 0.26;
    float grade = 0.035 * (vUvs.y - 0.5);

    vec3 rgb = base.rgb + GLASS * (sheen + spot + fresnel + lens + arc + grade);
    outColor = vec4(rgb, base.a * vAlpha);
}
`;

const bodyVertShaderSource = `#version 300 es

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

in vec3 aPosition;

out vec3 vNormal;
out vec3 vWorldPos;

void main() {
    vec4 worldPosition = uWorldMatrix * vec4(aPosition, 1.);
    vWorldPos = worldPosition.xyz;
    vNormal = normalize(aPosition);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}
`;

const bodyFragShaderSource = `#version 300 es
precision highp float;

uniform vec3 uBodyColor;
uniform vec3 uRimColor;
uniform vec3 uCameraPosition;

in vec3 vNormal;
in vec3 vWorldPos;

out vec4 outColor;

const vec3 LIGHT = normalize(vec3(-0.55, 0.75, 0.6));

void main() {
    vec3 toCamera = normalize(uCameraPosition - vWorldPos);
    float rim = pow(1. - max(0., dot(vNormal, toCamera)), 3.);
    vec3 halfway = normalize(LIGHT + toCamera);
    float spec = pow(max(dot(vNormal, halfway), 0.), 20.) * 0.22;
    outColor = vec4(mix(uBodyColor, uRimColor, rim) + spec, 1.);
}
`;

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

class Face {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
}

class Vertex {
  constructor(x, y, z) {
    this.position = vec3.fromValues(x, y, z);
    this.normal = vec3.create();
    this.uv = vec2.create();
  }
}

class Geometry {
  constructor() {
    this.vertices = [];
    this.faces = [];
  }

  addVertex(...args) {
    for (let i = 0; i < args.length; i += 3) {
      this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  addFace(...args) {
    for (let i = 0; i < args.length; i += 3) {
      this.faces.push(new Face(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  get lastVertex() {
    return this.vertices[this.vertices.length - 1];
  }

  subdivide(divisions = 1) {
    const midPointCache = {};
    let f = this.faces;

    for (let div = 0; div < divisions; ++div) {
      const newFaces = new Array(f.length * 4);

      f.forEach((face, ndx) => {
        const mAB = this.getMidPoint(face.a, face.b, midPointCache);
        const mBC = this.getMidPoint(face.b, face.c, midPointCache);
        const mCA = this.getMidPoint(face.c, face.a, midPointCache);

        const i = ndx * 4;
        newFaces[i + 0] = new Face(face.a, mAB, mCA);
        newFaces[i + 1] = new Face(face.b, mBC, mAB);
        newFaces[i + 2] = new Face(face.c, mCA, mBC);
        newFaces[i + 3] = new Face(mAB, mBC, mCA);
      });

      f = newFaces;
    }

    this.faces = f;
    return this;
  }

  spherize(radius = 1) {
    this.vertices.forEach(vertex => {
      vec3.normalize(vertex.normal, vertex.position);
      vec3.scale(vertex.position, vertex.normal, radius);
    });
    return this;
  }

  get data() {
    return {
      vertices: this.vertexData,
      indices: this.indexData,
      normals: this.normalData,
      uvs: this.uvData
    };
  }

  get vertexData() {
    return new Float32Array(this.vertices.flatMap(v => Array.from(v.position)));
  }

  get normalData() {
    return new Float32Array(this.vertices.flatMap(v => Array.from(v.normal)));
  }

  get uvData() {
    return new Float32Array(this.vertices.flatMap(v => Array.from(v.uv)));
  }

  get indexData() {
    return new Uint16Array(this.faces.flatMap(f => [f.a, f.b, f.c]));
  }

  getMidPoint(ndxA, ndxB, cache) {
    const cacheKey = ndxA < ndxB ? `k_${ndxB}_${ndxA}` : `k_${ndxA}_${ndxB}`;
    if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
      return cache[cacheKey];
    }
    const a = this.vertices[ndxA].position;
    const b = this.vertices[ndxB].position;
    const ndx = this.vertices.length;
    cache[cacheKey] = ndx;
    this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
    return ndx;
  }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = Math.sqrt(5) * 0.5 + 0.5;
    // prettier-ignore
    this.addVertex(
      -1, t, 0,   1, t, 0,   -1, -t, 0,   1, -t, 0,
      0, -1, t,   0, 1, t,   0, -1, -t,   0, 1, -t,
      t, 0, -1,   t, 0, 1,   -t, 0, -1,   -t, 0, 1
    ).addFace(
      0, 11, 5,   0, 5, 1,   0, 1, 7,   0, 7, 10,   0, 10, 11,
      1, 5, 9,   5, 11, 4,   11, 10, 2,   10, 7, 6,   7, 1, 8,
      3, 9, 4,   3, 4, 2,   3, 2, 6,   3, 6, 8,   3, 8, 9,
      4, 9, 5,   2, 4, 11,   6, 2, 10,   8, 6, 7,   9, 8, 1
    );
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super();
    steps = Math.max(4, steps);

    const alpha = (2 * Math.PI) / steps;

    this.addVertex(0, 0, 0);
    this.lastVertex.uv[0] = 0.5;
    this.lastVertex.uv[1] = 0.5;

    for (let i = 0; i < steps; ++i) {
      const x = Math.cos(alpha * i);
      const y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      this.lastVertex.uv[0] = x * 0.5 + 0.5;
      this.lastVertex.uv[1] = y * 0.5 + 0.5;

      if (i > 0) {
        this.addFace(0, i, i + 1);
      }
    }
    this.addFace(0, steps, 1);
  }
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl, shaderSources, transformFeedbackVaryings, attribLocations) {
  const program = gl.createProgram();

  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
    const shader = createShader(gl, type, shaderSources[ndx]);
    if (shader) gl.attachShader(program, shader);
  });

  if (transformFeedbackVaryings) {
    gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS);
  }

  if (attribLocations) {
    for (const attrib in attribLocations) {
      gl.bindAttribLocation(program, attribLocations[attrib], attrib);
    }
  }

  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) {
    return program;
  }

  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

function makeVertexArray(gl, bufLocNumElmPairs, indices) {
  const va = gl.createVertexArray();
  gl.bindVertexArray(va);

  for (const [buffer, loc, numElem] of bufLocNumElmPairs) {
    if (loc === -1) continue;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, numElem, gl.FLOAT, false, 0, 0);
  }

  if (indices) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }

  gl.bindVertexArray(null);
  return va;
}

function resizeCanvasToDisplaySize(canvas) {
  const dpr = Math.min(2, window.devicePixelRatio);
  const displayWidth = Math.round(canvas.clientWidth * dpr);
  const displayHeight = Math.round(canvas.clientHeight * dpr);
  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
  return needResize;
}

function makeBuffer(gl, sizeOrData, usage) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buf;
}

function createAndSetupTexture(gl, minFilter, magFilter, wrapS, wrapT) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  return texture;
}

class ArcballControl {
  isPointerDown = false;
  orientation = quat.create();
  pointerRotation = quat.create();
  rotationVelocity = 0;
  rotationAxis = vec3.fromValues(1, 0, 0);
  snapDirection = vec3.fromValues(0, 0, -1);
  snapTargetDirection;
  EPSILON = 0.1;
  IDENTITY_QUAT = quat.create();

  constructor(canvas, updateCallback) {
    this.canvas = canvas;
    this.updateCallback = updateCallback || (() => null);

    this.pointerPos = vec2.create();
    this.previousPointerPos = vec2.create();
    this._rotationVelocity = 0;
    this._combinedQuat = quat.create();

    const local = e => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const onDown = e => {
      const [x, y] = local(e);
      vec2.set(this.pointerPos, x, y);
      vec2.copy(this.previousPointerPos, this.pointerPos);
      this.isPointerDown = true;
    };
    const onUp = () => {
      this.isPointerDown = false;
    };
    const onMove = e => {
      if (this.isPointerDown) {
        const [x, y] = local(e);
        vec2.set(this.pointerPos, x, y);
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);
    canvas.addEventListener('pointermove', onMove);

    canvas.style.touchAction = 'none';

    this.dispose = () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
      canvas.removeEventListener('pointermove', onMove);
    };
  }

  update(deltaTime, targetFrameDuration = 16) {
    const timeScale = deltaTime / targetFrameDuration + 0.00001;
    let angleFactor = timeScale;
    let snapRotation = quat.create();

    if (this.isPointerDown) {
      const INTENSITY = 0.3 * timeScale;
      const ANGLE_AMPLIFICATION = 5 / timeScale;

      const midPointerPos = vec2.sub(vec2.create(), this.pointerPos, this.previousPointerPos);
      vec2.scale(midPointerPos, midPointerPos, INTENSITY);

      if (vec2.sqrLen(midPointerPos) > this.EPSILON) {
        vec2.add(midPointerPos, this.previousPointerPos, midPointerPos);

        const p = this.#project(midPointerPos);
        const q = this.#project(this.previousPointerPos);
        const a = vec3.normalize(vec3.create(), p);
        const b = vec3.normalize(vec3.create(), q);

        vec2.copy(this.previousPointerPos, midPointerPos);

        angleFactor *= ANGLE_AMPLIFICATION;

        this.quatFromVectors(a, b, this.pointerRotation, angleFactor);
      } else {
        quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, INTENSITY);
      }
    } else {
      const INTENSITY = 0.1 * timeScale;
      quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, INTENSITY);

      if (this.snapTargetDirection) {
        const SNAPPING_INTENSITY = 0.2;
        const a = this.snapTargetDirection;
        const b = this.snapDirection;
        const sqrDist = vec3.squaredDistance(a, b);
        const distanceFactor = Math.max(0.1, 1 - sqrDist * 10);
        angleFactor *= SNAPPING_INTENSITY * distanceFactor;
        this.quatFromVectors(a, b, snapRotation, angleFactor);
      }
    }

    const combinedQuat = quat.multiply(quat.create(), snapRotation, this.pointerRotation);
    this.orientation = quat.multiply(quat.create(), combinedQuat, this.orientation);
    quat.normalize(this.orientation, this.orientation);

    const RA_INTENSITY = 0.8 * timeScale;
    quat.slerp(this._combinedQuat, this._combinedQuat, combinedQuat, RA_INTENSITY);
    quat.normalize(this._combinedQuat, this._combinedQuat);

    const rad = Math.acos(this._combinedQuat[3]) * 2.0;
    const s = Math.sin(rad / 2.0);
    let rv = 0;
    if (s > 0.000001) {
      rv = rad / (2 * Math.PI);
      this.rotationAxis[0] = this._combinedQuat[0] / s;
      this.rotationAxis[1] = this._combinedQuat[1] / s;
      this.rotationAxis[2] = this._combinedQuat[2] / s;
    }

    const RV_INTENSITY = 0.5 * timeScale;
    this._rotationVelocity += (rv - this._rotationVelocity) * RV_INTENSITY;
    this.rotationVelocity = this._rotationVelocity / timeScale;

    this.updateCallback(deltaTime);
  }

  quatFromVectors(a, b, out, angleFactor = 1) {
    const axis = vec3.cross(vec3.create(), a, b);
    vec3.normalize(axis, axis);
    const d = Math.max(-1, Math.min(1, vec3.dot(a, b)));
    const angle = Math.acos(d) * angleFactor;
    quat.setAxisAngle(out, axis, angle);
    return { q: out, axis, angle };
  }

  #project(pos) {
    const r = 2;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const s = Math.max(w, h) - 1;

    const x = (2 * pos[0] - w - 1) / s;
    const y = (2 * pos[1] - h - 1) / s;
    let z = 0;
    const xySq = x * x + y * y;
    const rSq = r * r;

    if (xySq <= rSq / 2.0) {
      z = Math.sqrt(rSq - xySq);
    } else {
      z = rSq / Math.sqrt(xySq);
    }
    return vec3.fromValues(-x, y, z);
  }
}

class InfiniteGridMenu {
  TARGET_FRAME_DURATION = 1000 / 60;
  SPHERE_RADIUS = 2;

  #time = 0;
  #deltaTime = 0;
  #deltaFrames = 0;
  #frames = 0;
  #raf = 0;
  #disposed = false;

  camera = {
    matrix: mat4.create(),
    near: 0.1,
    far: 40,
    fov: Math.PI / 4,
    aspect: 1,
    position: vec3.fromValues(0, 0, 3),
    up: vec3.fromValues(0, 1, 0),
    matrices: {
      view: mat4.create(),
      projection: mat4.create(),
      inversProjection: mat4.create()
    }
  };

  nearestVertexIndex = null;
  smoothRotationVelocity = 0;
  scaleFactor = 1.0;
  movementActive = false;
  /** Vertex the snap is pinned to after an arrow step, until it faces the camera. */
  lockedVertex = null;
  #lockedAt = 0;
  #step = null;

  constructor(canvas, items, onActiveItemChange, onMovementChange, onInit = null, scale = 1.0, options = {}) {
    this.canvas = canvas;
    this.items = items || [];
    this.onActiveItemChange = onActiveItemChange || (() => {});
    this.onMovementChange = onMovementChange || (() => {});
    this.scaleFactor = scale;
    this.subdivisions = options.subdivisions ?? 2;
    this.cellSize = options.cellSize ?? 256;
    this.visible = options.visible ?? 0.35;
    // Opaque sphere just inside the discs so nothing behind the canvas shows through the gaps.
    this.body = options.body ?? null;
    this.camera.position[2] = 3 * scale;
    this.#init(onInit);
  }

  resize() {
    this.viewportSize = vec2.set(this.viewportSize || vec2.create(), this.canvas.clientWidth, this.canvas.clientHeight);

    const gl = this.gl;
    const needsResize = resizeCanvasToDisplaySize(gl.canvas);
    if (needsResize) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    this.#updateProjectionMatrix(gl);
  }

  run(time = 0) {
    if (this.#disposed) return;
    this.#deltaTime = Math.min(32, time - this.#time);
    this.#time = time;
    this.#deltaFrames = this.#deltaTime / this.TARGET_FRAME_DURATION;
    this.#frames += this.#deltaFrames;

    this.#animate(this.#deltaTime);
    this.#render();

    this.#raf = requestAnimationFrame(t => this.run(t));
  }

  dispose() {
    this.#disposed = true;
    cancelAnimationFrame(this.#raf);
    this.control?.dispose();
    this.canvas.removeEventListener("pointerdown", this.onCanvasDown);
    const gl = this.gl;
    if (gl) {
      gl.deleteTexture(this.tex);
      gl.deleteProgram(this.discProgram);
      if (this.bodyProgram) gl.deleteProgram(this.bodyProgram);
    }
  }

  #init(onInit) {
    this.gl = this.canvas.getContext('webgl2', { antialias: true, alpha: true });
    const gl = this.gl;
    if (!gl) {
      throw new Error('No WebGL 2 context!');
    }

    this.viewportSize = vec2.fromValues(this.canvas.clientWidth, this.canvas.clientHeight);
    this.drawBufferSize = vec2.clone(this.viewportSize);

    this.discProgram = createProgram(gl, [discVertShaderSource, discFragShaderSource], null, {
      aModelPosition: 0,
      aModelNormal: 1,
      aModelUvs: 2,
      aInstanceMatrix: 3
    });

    this.discLocations = {
      aModelPosition: gl.getAttribLocation(this.discProgram, 'aModelPosition'),
      aModelUvs: gl.getAttribLocation(this.discProgram, 'aModelUvs'),
      aInstanceMatrix: gl.getAttribLocation(this.discProgram, 'aInstanceMatrix'),
      uWorldMatrix: gl.getUniformLocation(this.discProgram, 'uWorldMatrix'),
      uViewMatrix: gl.getUniformLocation(this.discProgram, 'uViewMatrix'),
      uProjectionMatrix: gl.getUniformLocation(this.discProgram, 'uProjectionMatrix'),
      uCameraPosition: gl.getUniformLocation(this.discProgram, 'uCameraPosition'),
      uScaleFactor: gl.getUniformLocation(this.discProgram, 'uScaleFactor'),
      uRotationAxisVelocity: gl.getUniformLocation(this.discProgram, 'uRotationAxisVelocity'),
      uTex: gl.getUniformLocation(this.discProgram, 'uTex'),
      uFrames: gl.getUniformLocation(this.discProgram, 'uFrames'),
      uItemCount: gl.getUniformLocation(this.discProgram, 'uItemCount'),
      uAtlasSize: gl.getUniformLocation(this.discProgram, 'uAtlasSize')
    };

    this.discGeo = new DiscGeometry(56, 1);
    this.discBuffers = this.discGeo.data;
    this.discVAO = makeVertexArray(
      gl,
      [
        [makeBuffer(gl, this.discBuffers.vertices, gl.STATIC_DRAW), this.discLocations.aModelPosition, 3],
        [makeBuffer(gl, this.discBuffers.uvs, gl.STATIC_DRAW), this.discLocations.aModelUvs, 2]
      ],
      this.discBuffers.indices
    );

    if (this.body) this.#initBody();

    this.icoGeo = new IcosahedronGeometry();
    this.icoGeo.subdivide(this.subdivisions).spherize(this.SPHERE_RADIUS);
    this.instancePositions = this.icoGeo.vertices.map(v => v.position);
    this.DISC_INSTANCE_COUNT = this.icoGeo.vertices.length;
    this.#initDiscInstances(this.DISC_INSTANCE_COUNT);

    this.worldMatrix = mat4.create();
    this.#initTexture();

    this.control = new ArcballControl(this.canvas, deltaTime => this.#onControlUpdate(deltaTime));
    this.onCanvasDown = () => {
      if (!this.#step) this.lockedVertex = null;
    };
    this.canvas.addEventListener("pointerdown", this.onCanvasDown);

    this.#updateCameraMatrix();
    this.#updateProjectionMatrix(gl);
    this.resize();

    if (onInit) onInit(this);
  }

  #initBody() {
    const gl = this.gl;
    this.bodyProgram = createProgram(gl, [bodyVertShaderSource, bodyFragShaderSource], null, { aPosition: 0 });
    this.bodyLocations = {
      uWorldMatrix: gl.getUniformLocation(this.bodyProgram, 'uWorldMatrix'),
      uViewMatrix: gl.getUniformLocation(this.bodyProgram, 'uViewMatrix'),
      uProjectionMatrix: gl.getUniformLocation(this.bodyProgram, 'uProjectionMatrix'),
      uCameraPosition: gl.getUniformLocation(this.bodyProgram, 'uCameraPosition'),
      uBodyColor: gl.getUniformLocation(this.bodyProgram, 'uBodyColor'),
      uRimColor: gl.getUniformLocation(this.bodyProgram, 'uRimColor')
    };
    const geo = new IcosahedronGeometry().subdivide(3).spherize(this.SPHERE_RADIUS * (this.body.radius ?? 0.7));
    const data = geo.data;
    this.bodyIndexCount = data.indices.length;
    this.bodyVAO = makeVertexArray(gl, [[makeBuffer(gl, data.vertices, gl.STATIC_DRAW), 0, 3]], data.indices);
    this.bodyColor = hexToRgb(this.body.color ?? '#0a0a0a');
    this.bodyRim = hexToRgb(this.body.rim ?? this.body.color ?? '#0a0a0a');
  }

    #initTexture() {
    const gl = this.gl;
    this.tex = createAndSetupTexture(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

    const itemCount = Math.max(1, this.items.length);
    this.atlasSize = Math.ceil(Math.sqrt(itemCount));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = this.cellSize;

    canvas.width = this.atlasSize * cellSize;
    canvas.height = this.atlasSize * cellSize;

    Promise.all(
      this.items.map(
        item =>
          new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = item.image;
          })
      )
    ).then(images => {
      if (this.#disposed) return;
      images.forEach((img, i) => {
        if (!img) return;
        const x = (i % this.atlasSize) * cellSize;
        const y = Math.floor(i / this.atlasSize) * cellSize;
        ctx.drawImage(img, x, y, cellSize, cellSize);
      });

      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
  }

  #initDiscInstances(count) {
    const gl = this.gl;
    this.discInstances = {
      matricesArray: new Float32Array(count * 16),
      matrices: [],
      buffer: gl.createBuffer()
    };
    for (let i = 0; i < count; ++i) {
      const instanceMatrixArray = new Float32Array(this.discInstances.matricesArray.buffer, i * 16 * 4, 16);
      instanceMatrixArray.set(mat4.create());
      this.discInstances.matrices.push(instanceMatrixArray);
    }
    gl.bindVertexArray(this.discVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.discInstances.matricesArray.byteLength, gl.DYNAMIC_DRAW);
    const mat4AttribSlotCount = 4;
    const bytesPerMatrix = 16 * 4;
    for (let j = 0; j < mat4AttribSlotCount; ++j) {
      const loc = this.discLocations.aInstanceMatrix + j;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, j * 4 * 4);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  #animate(deltaTime) {
    const gl = this.gl;
    this.#driveStep();
    this.control.update(deltaTime, this.TARGET_FRAME_DURATION);

    let positions = this.instancePositions.map(p => vec3.transformQuat(vec3.create(), p, this.control.orientation));
    // Disc radius as a share of the sphere radius. Vertex spacing after two subdivisions is about 0.26 R, so 0.25 overlaps; 0.215 leaves a hairline of body between neighbours.
    const scale = 0.215;
    const SCALE_INTENSITY = 0.6;
    positions.forEach((p, ndx) => {
      const s = (Math.abs(p[2]) / this.SPHERE_RADIUS) * SCALE_INTENSITY + (1 - SCALE_INTENSITY);
      const finalScale = s * scale;
      const matrix = mat4.create();
      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), p)));
      mat4.multiply(matrix, matrix, mat4.targetTo(mat4.create(), [0, 0, 0], p, [0, 1, 0]));
      mat4.multiply(matrix, matrix, mat4.fromScaling(mat4.create(), [finalScale, finalScale, finalScale]));
      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), [0, 0, -this.SPHERE_RADIUS]));

      mat4.copy(this.discInstances.matrices[ndx], matrix);
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.discInstances.matricesArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.smoothRotationVelocity = this.control.rotationVelocity;
  }

  #render() {
    const gl = this.gl;
    gl.useProgram(this.discProgram);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this.bodyProgram) {
      gl.useProgram(this.bodyProgram);
      gl.disable(gl.CULL_FACE);
      gl.uniformMatrix4fv(this.bodyLocations.uWorldMatrix, false, this.worldMatrix);
      gl.uniformMatrix4fv(this.bodyLocations.uViewMatrix, false, this.camera.matrices.view);
      gl.uniformMatrix4fv(this.bodyLocations.uProjectionMatrix, false, this.camera.matrices.projection);
      gl.uniform3f(this.bodyLocations.uCameraPosition, this.camera.position[0], this.camera.position[1], this.camera.position[2]);
      gl.uniform3fv(this.bodyLocations.uBodyColor, this.bodyColor);
      gl.uniform3fv(this.bodyLocations.uRimColor, this.bodyRim);
      gl.bindVertexArray(this.bodyVAO);
      gl.drawElements(gl.TRIANGLES, this.bodyIndexCount, gl.UNSIGNED_SHORT, 0);
      gl.useProgram(this.discProgram);
      gl.enable(gl.CULL_FACE);
    }

    gl.uniformMatrix4fv(this.discLocations.uWorldMatrix, false, this.worldMatrix);
    gl.uniformMatrix4fv(this.discLocations.uViewMatrix, false, this.camera.matrices.view);
    gl.uniformMatrix4fv(this.discLocations.uProjectionMatrix, false, this.camera.matrices.projection);
    gl.uniform3f(
      this.discLocations.uCameraPosition,
      this.camera.position[0],
      this.camera.position[1],
      this.camera.position[2]
    );
    gl.uniform4f(
      this.discLocations.uRotationAxisVelocity,
      this.control.rotationAxis[0],
      this.control.rotationAxis[1],
      this.control.rotationAxis[2],
      this.smoothRotationVelocity * 1.1
    );

    gl.uniform1i(this.discLocations.uItemCount, this.items.length);
    gl.uniform1i(this.discLocations.uAtlasSize, this.atlasSize);

    gl.uniform1f(this.discLocations.uFrames, this.#frames);
    gl.uniform1f(this.discLocations.uScaleFactor, this.scaleFactor);
    gl.uniform1i(this.discLocations.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);

    gl.bindVertexArray(this.discVAO);
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      this.discBuffers.indices.length,
      gl.UNSIGNED_SHORT,
      0,
      this.DISC_INSTANCE_COUNT
    );
  }

  #updateCameraMatrix() {
    mat4.targetTo(this.camera.matrix, this.camera.position, [0, 0, 0], this.camera.up);
    mat4.invert(this.camera.matrices.view, this.camera.matrix);
  }

  #updateProjectionMatrix(gl) {
    this.camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const v = this.visible;
    const visible = typeof v === "number" ? v : this.camera.aspect > 1 ? v.landscape : v.portrait;
    const height = this.SPHERE_RADIUS * visible;
    const distance = this.camera.position[2];
    if (this.camera.aspect > 1) {
      this.camera.fov = 2 * Math.atan(height / distance);
    } else {
      this.camera.fov = 2 * Math.atan(height / this.camera.aspect / distance);
    }
    mat4.perspective(
      this.camera.matrices.projection,
      this.camera.fov,
      this.camera.aspect,
      this.camera.near,
      this.camera.far
    );
    mat4.invert(this.camera.matrices.inversProjection, this.camera.matrices.projection);
  }

  #onControlUpdate(deltaTime) {
    const timeScale = deltaTime / this.TARGET_FRAME_DURATION + 0.0001;
    let damping = 5 / timeScale;
    let cameraTargetZ = 3 * this.scaleFactor;

    const isMoving = this.control.isPointerDown || Math.abs(this.smoothRotationVelocity) > 0.01;

    if (isMoving !== this.movementActive) {
      this.movementActive = isMoving;
      this.onMovementChange(isMoving);
    }

    if (!this.control.isPointerDown) {
      let nearestVertexIndex = this.#findNearestVertexIndex();
      if (this.lockedVertex !== null) {
        nearestVertexIndex = this.lockedVertex;
        const dir = vec3.normalize(vec3.create(), this.#getVertexWorldPosition(this.lockedVertex));
        const settled = vec3.dot(dir, this.control.snapDirection) > 0.9995;
        if (settled || performance.now() - this.#lockedAt > 6000) this.lockedVertex = null;
      }
      const itemIndex = nearestVertexIndex % Math.max(1, this.items.length);
      this.onActiveItemChange(itemIndex);
      const snapDirection = vec3.normalize(vec3.create(), this.#getVertexWorldPosition(nearestVertexIndex));
      this.control.snapTargetDirection = snapDirection;
    } else {
      cameraTargetZ += this.control.rotationVelocity * 80 + 2.5;
      damping = 7 / timeScale;
    }

    this.camera.position[2] += (cameraTargetZ - this.camera.position[2]) / damping;
    this.#updateCameraMatrix();
  }

  /**
   * Step to the next (1) or previous (-1) tool in list order. Picks the disc
   * showing that tool that is closest to the front, then plays a pointer
   * drag toward it: hold, pull, release, and let the snap finish the job.
   */
  step(direction) {
    if (this.control.isPointerDown || this.#step) return;
    const count = Math.max(1, this.items.length);
    const current = (this.lockedVertex ?? this.#findNearestVertexIndex()) % count;
    const target = (current + direction + count) % count;

    // Discs render on the opposite side of their vertex, so negate to get screen space.
    let best = -1;
    let bestZ = -Infinity;
    for (let i = target; i < this.instancePositions.length; i += count) {
      const r = vec3.transformQuat(vec3.create(), this.instancePositions[i], this.control.orientation);
      if (-r[2] > bestZ) {
        bestZ = -r[2];
        best = i;
      }
    }
    if (best < 0) return;
    const r = vec3.negate(vec3.create(), vec3.transformQuat(vec3.create(), this.instancePositions[best], this.control.orientation));

    this.lockedVertex = best;
    this.#lockedAt = performance.now();
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    // Drag from the centre toward the disc's side of the screen (screen y points down),
    // further for discs that sit further round the sphere.
    const angle = Math.acos(Math.max(-1, Math.min(1, r[2] / this.SPHERE_RADIUS)));
    const len = Math.hypot(r[0], r[1]) || 1;
    const dir = [-r[0] / len, r[1] / len];
    const travel = Math.max(w, h) * Math.min(0.2, Math.max(0.05, (angle / 0.28) * 0.06));
    this.#step = {
      start: performance.now(),
      from: [w / 2, h / 2],
      to: [w / 2 + dir[0] * travel, h / 2 + dir[1] * travel],
      hold: 90,
      drag: 240 + 200 * (angle / Math.PI),
      down: false
    };
  }

  #driveStep() {
    const s = this.#step;
    if (!s) return;
    const c = this.control;
    const t = performance.now() - s.start;
    if (!s.down) {
      c.isPointerDown = true;
      vec2.set(c.pointerPos, s.from[0], s.from[1]);
      vec2.copy(c.previousPointerPos, c.pointerPos);
      this.canvas.classList.add('is-dragging');
      s.down = true;
      return;
    }
    if (t < s.hold) return;
    const k = Math.min(1, (t - s.hold) / s.drag);
    const e = 1 - Math.pow(1 - k, 3);
    vec2.set(c.pointerPos, s.from[0] + (s.to[0] - s.from[0]) * e, s.from[1] + (s.to[1] - s.from[1]) * e);
    if (k >= 1) {
      c.isPointerDown = false;
      // Drop most of the fling so the snap, not momentum, decides where it lands.
      quat.slerp(c.pointerRotation, c.pointerRotation, c.IDENTITY_QUAT, 0.6);
      this.canvas.classList.remove('is-dragging');
      this.#step = null;
    }
  }

  #findNearestVertexIndex() {
    const n = this.control.snapDirection;
    const inversOrientation = quat.conjugate(quat.create(), this.control.orientation);
    const nt = vec3.transformQuat(vec3.create(), n, inversOrientation);

    let maxD = -1;
    let nearestVertexIndex;
    for (let i = 0; i < this.instancePositions.length; ++i) {
      const d = vec3.dot(nt, this.instancePositions[i]);
      if (d > maxD) {
        maxD = d;
        nearestVertexIndex = i;
      }
    }
    return nearestVertexIndex;
  }

  #getVertexWorldPosition(index) {
    const nearestVertexPos = this.instancePositions[index];
    return vec3.transformQuat(vec3.create(), nearestVertexPos, this.control.orientation);
  }
}

export default function InfiniteMenu({
  items = [],
  scale = 1.0,
  subdivisions = 2,
  cellSize = 256,
  visible = 0.35,
  body = null,
  className = '',
  renderCaption
}) {
  const canvasRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [supported, setSupported] = useState(true);
  const sketchRef = useRef(null);
  // Object form of `visible` is compared by value so a fresh literal does not rebuild the scene
  const bodyKey = body ? `${body.color}/${body.rim}/${body.radius}` : '';
  const visibleKey = typeof visible === "number" ? visible : `${visible.landscape}/${visible.portrait}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !items.length) return;
    let sketch;

    const handleActiveItem = index => {
      const item = items[index % items.length];
      setActiveItem(prev => (prev === item ? prev : item));
    };

    try {
      sketch = new InfiniteGridMenu(canvas, items, handleActiveItem, setIsMoving, sk => sk.run(), scale, {
        subdivisions,
        cellSize,
        visible,
        body
      });
      sketchRef.current = sketch;
    } catch {
      setSupported(false);
      return;
    }

    const handleResize = () => sketch.resize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas);
    handleResize();

    return () => {
      ro.disconnect();
      sketch.dispose();
      sketchRef.current = null;
    };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, scale, subdivisions, cellSize, visibleKey, bodyKey]);

  if (!supported) return null;

  return (
    <div className={`infinite-menu ${className}`}>
      <canvas className="infinite-menu__canvas" ref={canvasRef} aria-hidden="true" />
      {activeItem &&
        renderCaption &&
        renderCaption(activeItem, isMoving, {
          prev: () => sketchRef.current?.step(-1),
          next: () => sketchRef.current?.step(1)
        })}
    </div>
  );
}
