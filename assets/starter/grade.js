// grade.js — "treated footage": run a hero video through a WebGL2 grading shader so
// AI-generated or stock clips stop looking like stock. Original implementation.
//
// Usage (in main.js):  import("./grade.js").then(m => m.initGrade(canvas, videoEl, LOOK))
// <video id="heroVideo" src="hero.mp4" muted loop playsinline autoplay hidden></video>
//
// Tune the LOOK per brand. Keep it subtle: if a visitor notices the effect, it's too much.
export const LOOKS = {
  film:   { lift: [0.02, 0.015, 0.03], gamma: [1.0, 1.0, 1.0], gain: [1.03, 1.0, 0.95], sat: 0.9,  contrast: 1.06, grain: 0.06, vignette: 0.35, halation: 0.25, aberration: 0.0015, tint: [1.0, 0.96, 0.9] },
  clinic: { lift: [0.04, 0.045, 0.05], gamma: [1.05, 1.05, 1.03], gain: [1.0, 1.0, 1.02], sat: 0.8, contrast: 0.98, grain: 0.02, vignette: 0.15, halation: 0.05, aberration: 0.0, tint: [0.98, 1.0, 1.02] },
  night:  { lift: [0.0, 0.01, 0.03], gamma: [0.95, 0.97, 1.0], gain: [1.05, 1.0, 0.9], sat: 1.05, contrast: 1.12, grain: 0.08, vignette: 0.5, halation: 0.4, aberration: 0.002, tint: [1.0, 0.92, 0.85] },
  print:  { lift: [0.06, 0.05, 0.04], gamma: [1.0, 1.0, 1.0], gain: [0.95, 0.93, 0.9], sat: 0.6, contrast: 1.15, grain: 0.1, vignette: 0.2, halation: 0.0, aberration: 0.0, tint: [1.0, 0.97, 0.92] },
};

const VERT = `#version 300 es
in vec2 p; out vec2 vUv;
void main(){ vUv = p * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uVideo; uniform vec2 uRes, uTex, uPointer;
uniform float uTime, uSat, uContrast, uGrain, uVignette, uHalation, uAberration;
uniform vec3 uLift, uGamma, uGain, uTint;

vec2 cover(vec2 uv){ // object-fit: cover
  float rs = uRes.x / uRes.y, rt = uTex.x / uTex.y;
  vec2 s = rs > rt ? vec2(1.0, rt / rs) : vec2(rs / rt, 1.0);
  return (uv - 0.5) * s + 0.5;
}
float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

void main(){
  vec2 uv = cover(vUv);
  uv += (uPointer - 0.5) * 0.008;                      // tiny pointer drift = depth
  vec2 d = (vUv - 0.5) * uAberration;                  // radial chromatic aberration
  vec3 c = vec3(texture(uVideo, uv + d).r, texture(uVideo, uv).g, texture(uVideo, uv - d).b);

  // halation: warm bloom from blurred highlights (cheap 8-tap)
  vec3 h = vec3(0.0);
  for (int i = 0; i < 8; i++) { float a = float(i) * 0.785; h += texture(uVideo, uv + vec2(cos(a), sin(a)) * 0.006).rgb; }
  h /= 8.0; h = max(h - 0.7, 0.0) * vec3(1.0, 0.45, 0.25);
  c += h * uHalation * 2.0;

  c = pow(max(c * uGain + uLift * (1.0 - c), 0.0), 1.0 / uGamma);   // lift / gamma / gain
  c = (c - 0.5) * uContrast + 0.5;
  c = mix(vec3(luma(c)), c, uSat) * uTint;

  float l = luma(c);                                    // grain weighted to mid-tones
  c += (hash(vUv * uRes + fract(uTime) * 100.0) - 0.5) * uGrain * (1.0 - abs(l - 0.5) * 2.0);

  vec2 v = vUv - 0.5; c *= 1.0 - dot(v, v) * uVignette * 2.0;
  o = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

export function initGrade(canvas, video, look = LOOKS.film) {
  const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false });
  if (!gl) return false; // caller keeps the <video>/poster visible
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  const U = (n) => gl.getUniformLocation(prog, n);
  const set = (l) => {
    gl.uniform3fv(U("uLift"), l.lift); gl.uniform3fv(U("uGamma"), l.gamma); gl.uniform3fv(U("uGain"), l.gain); gl.uniform3fv(U("uTint"), l.tint);
    gl.uniform1f(U("uSat"), l.sat); gl.uniform1f(U("uContrast"), l.contrast); gl.uniform1f(U("uGrain"), l.grain);
    gl.uniform1f(U("uVignette"), l.vignette); gl.uniform1f(U("uHalation"), l.halation); gl.uniform1f(U("uAberration"), l.aberration);
  };
  set(look);
  const pointer = [0.5, 0.5];
  addEventListener("pointermove", (e) => { pointer[0] = e.clientX / innerWidth; pointer[1] = e.clientY / innerHeight; });
  const resize = () => { const dpr = Math.min(devicePixelRatio, 1.5); canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; gl.viewport(0, 0, canvas.width, canvas.height); };
  addEventListener("resize", resize); resize();
  // observe the section, not the canvas (a pinned canvas can report "not visible" forever)
  let visible = true; new IntersectionObserver((es) => (visible = es.some((e) => e.isIntersecting))).observe(canvas.closest("section") || canvas);
  const t0 = performance.now();
  (function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || video.readyState < 2) return;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    gl.uniform2f(U("uRes"), canvas.width, canvas.height); gl.uniform2f(U("uTex"), video.videoWidth, video.videoHeight);
    gl.uniform2f(U("uPointer"), pointer[0], pointer[1]); gl.uniform1f(U("uTime"), (performance.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  })();
  return { setLook: set };
}
