import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  Vector3,
  Vector4,
} from "three";

/* Шёлковая ткань первого экрана.

   Одно полотно (плоскость с частой сеткой), которое настоящим образом
   выгибается в глубину: вершины сдвигаются по высоте складок, камера
   перспективная, поэтому складки дают параллакс, а не нарисованы.

   Высота складок = несколько длинных диагональных волн (сквозняк)
   + вмятина под курсором + расходящиеся от него волны («провели рукой»).
   Свет считается по этой же высоте в каждом пикселе.

   Цвет — только палитра сайта: тени в сторону navy, основа pink,
   свет pink-soft, блик peach. Белого и чужих оттенков нет.
   Край полотна — мягкая неровная маска, прямоугольника не видно. */

const RIPPLES = 6;
const SPAN = 4; // высота полотна в условных единицах складок

const hex = (h) =>
  new Vector3(
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255,
  );

const HEIGHT_GLSL = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform float uPress;
  uniform vec4 uRipples[${RIPPLES}];

  float clothHeight(vec2 p) {
    float t = uTime;
    // складки идут почти вертикально, как у висящей драпировки:
    // s — поперёк складок, l — вдоль. Поперечная координата плавает,
    // поэтому складки сходятся и расходятся, а не лежат гребёнкой
    vec2 across = vec2(0.94, 0.34);
    vec2 along = vec2(-0.34, 0.94);
    float l = dot(p, along);
    float s = dot(p, across)
      + 0.55 * sin(l * 0.75 + t * 0.19)
      + 0.22 * sin(l * 1.9 - t * 0.14 + p.x * 0.6);
    float h = 0.0;
    // sin(x + k·sin x) — несимметричная волна: пологий подъём, крутой спад
    float f1 = s * 2.6 + t * 0.34;
    float f2 = s * 4.9 - t * 0.27 + 1.3 + 0.4 * sin(l * 0.9);
    float f3 = s * 8.7 + l * 0.7 + t * 0.45;
    h += 0.42 * sin(f1 + 0.55 * sin(f1));
    h += 0.20 * sin(f2 + 0.50 * sin(f2));
    h += 0.07 * sin(f3);
    // общий вздох полотна от сквозняка
    h += 0.34 * sin(dot(p, vec2(0.35, 0.94)) * 1.05 + t * 0.42)
       * sin(dot(p, vec2(0.9, -0.2)) * 0.7 - t * 0.23 + 0.8);

    // вмятина под курсором
    vec2 d = p - uPointer;
    h -= uPress * 0.42 * exp(-dot(d, d) / 0.55);

    // волны, которые расходятся от следа курсора
    for (int i = 0; i < ${RIPPLES}; i++) {
      vec4 r = uRipples[i];
      float age = t - r.z;
      if (r.w > 0.0 && age > 0.0 && age < 4.0) {
        float w = length(p - r.xy) - 1.5 * age;
        h += r.w * 0.19 * exp(-w * w * 3.2) * cos(w * 4.6) * exp(-age * 1.05);
      }
    }
    return h;
  }
`;

const VERT = /* glsl */ `
  ${HEIGHT_GLSL}
  uniform float uDepth;
  varying vec2 vUv;
  varying float vH;

  void main() {
    vUv = uv;
    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0) * ${SPAN.toFixed(1)};
    vH = clothHeight(p);
    vec3 pos = position;
    pos.z += vH * uDepth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  ${HEIGHT_GLSL}
  uniform vec3 uNavy;
  uniform vec3 uPink;
  uniform vec3 uSoft;
  uniform vec3 uPeach;
  varying vec2 vUv;
  varying float vH;

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * ${SPAN.toFixed(1)};

    // нормаль по высоте складок: наклон берём из соседних пикселей,
    // поэтому высота считается один раз на пиксель
    float h0 = clothHeight(p);
    vec2 slope = vec2(dFdx(h0) / dFdx(p.x), dFdy(h0) / dFdy(p.y));
    vec3 n = normalize(vec3(-slope * 0.72, 1.0));

    vec3 L = normalize(vec3(-0.45, 0.62, 0.64));
    vec3 V = vec3(0.0, 0.0, 1.0);
    float diff = dot(n, L);
    float spec = pow(max(dot(n, normalize(L + V)), 0.0), 15.0);
    float sheen = pow(1.0 - n.z, 1.6);

    // тень → основа → свет → блик, всё внутри розовой гаммы
    vec3 shadow = mix(uPink, uNavy, 0.26);
    float tone = smoothstep(-0.1, 0.95, diff);
    vec3 col = mix(shadow, uPink, smoothstep(0.0, 0.5, tone));
    col = mix(col, uSoft, smoothstep(0.45, 0.8, tone));
    col = mix(col, uPeach, clamp(spec * 0.85 + sheen * 0.3, 0.0, 1.0));

    // мягкий неровный край
    vec2 c = (vUv - 0.5) * 2.0;
    float a = atan(c.y, c.x);
    float edge = 0.90
      + 0.035 * sin(2.0 * a + 1.1 + uTime * 0.16)
      + 0.025 * sin(3.0 * a + 2.3 - uTime * 0.12)
      + 0.020 * h0;
    float alpha = 1.0 - smoothstep(edge - 0.13, edge, length(c));

    gl_FragColor = vec4(col, alpha);
  }
`;

export default function createCloth(canvas, { mobile }) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !mobile,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const FOV = 30;
  const CAM_Z = 6;
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 20);
  camera.position.z = CAM_Z;
  // полотно ровно закрывает кадр на плоскости z = 0
  const viewH = 2 * Math.tan((FOV * Math.PI) / 360) * CAM_Z;

  const ripples = Array.from({ length: RIPPLES }, () => new Vector4(0, 0, -10, 0));
  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uDepth: { value: 0.16 },
    uPointer: { value: new Vector2(0, 0) },
    uPress: { value: 0 },
    uRipples: { value: ripples },
    uNavy: { value: hex("#011c47") },
    uPink: { value: hex("#de8c98") },
    uSoft: { value: hex("#e9a9b5") },
    uPeach: { value: hex("#f2c4ce") },
  };

  // на телефоне сетка вдвое реже
  const geometry = mobile
    ? new PlaneGeometry(1, 1, 72, 56)
    : new PlaneGeometry(1, 1, 150, 110);
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
  });
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);

  // курсор: цель и сглаженное положение в единицах складок
  const target = new Vector2(0, 0);
  const prev = new Vector2(0, 0);
  let active = false;
  let hasPrev = false;
  let travelled = 0;
  let lastRipple = -1;
  let rippleIndex = 0;
  let now = 0;

  return {
    resize(w, h, dpr) {
      // ткань гладкая, ей хватает плотности 1.5 — так кадр вдвое легче
      renderer.setPixelRatio(Math.min(dpr, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uAspect.value = w / h;
      mesh.scale.set(viewH * (w / h), viewH, 1);
    },

    pointer(u, v, isActive) {
      const inside = u > -0.1 && u < 1.1 && v > -0.1 && v < 1.1;
      active = isActive && inside;
      if (!active) {
        hasPrev = false;
        return;
      }
      target.set((u - 0.5) * uniforms.uAspect.value * SPAN, (0.5 - v) * SPAN);
      if (hasPrev) {
        travelled += target.distanceTo(prev);
        // след: новая волна каждые ~полшага и не чаще 7 раз в секунду
        if (travelled > 0.45 && now - lastRipple > 0.14) {
          ripples[rippleIndex].set(
            target.x,
            target.y,
            now,
            Math.min(1, 0.45 + travelled * 0.5),
          );
          rippleIndex = (rippleIndex + 1) % RIPPLES;
          lastRipple = now;
          travelled = 0;
        }
      } else {
        uniforms.uPointer.value.copy(target);
      }
      prev.copy(target);
      hasPrev = true;
    },

    frame(t, dt) {
      now = t;
      uniforms.uTime.value = t;
      const k = 1 - Math.exp(-dt * 7);
      uniforms.uPointer.value.lerp(target, k);
      uniforms.uPress.value +=
        ((active ? 1 : 0) - uniforms.uPress.value) * (1 - Math.exp(-dt * 4));
      renderer.render(scene, camera);
    },

    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
