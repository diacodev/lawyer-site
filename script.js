/* ═══════════════════════════════════════
   CINEMATIC DARK — Interactions
   ═══════════════════════════════════════ */
(() => {
'use strict';

const $  = (s,c=document) => c.querySelector(s);
const $$ = (s,c=document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine   = matchMedia('(pointer: fine)').matches;

/* ─── 1. WEBGL SHADER BACKGROUND ─── */
(() => {
  const canvas = $('#gl');
  if (!canvas || reduce) return;

  const gl = canvas.getContext('webgl', { antialias: false, alpha: true });
  if (!gl) return;

  const vs = `
    attribute vec2 p;
    void main(){ gl_Position = vec4(p,0.,1.); }
  `;

  const fs = `
    precision highp float;
    uniform vec2 u_res;
    uniform vec2 u_mouse;
    uniform float u_t;

    // hash + noise
    float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float n(vec2 p){
      vec2 i=floor(p); vec2 f=fract(p);
      vec2 u=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),u.x),
                 mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);
    }
    float fbm(vec2 p){
      float v=0.; float a=.5;
      for(int i=0;i<5;i++){
        v+=a*n(p); p*=2.03; a*=.5;
      }
      return v;
    }

    void main(){
      vec2 uv = gl_FragCoord.xy/u_res.xy;
      vec2 asp = vec2(u_res.x/u_res.y, 1.);
      vec2 st = (gl_FragCoord.xy - .5*u_res.xy)/min(u_res.x,u_res.y);
      vec2 m = (u_mouse - .5*u_res.xy)/min(u_res.x,u_res.y);

      // distorted noise field
      float t = u_t * .06;
      vec2 q = st*1.4 + vec2(t, t*.7);
      float f1 = fbm(q + m*0.4);
      float f2 = fbm(q*1.6 - m*0.3 + f1);

      // gold veins
      float veins = smoothstep(.55,.9, f1*f2*1.8);
      vec3 gold = vec3(.79,.66,.42);
      vec3 deep = vec3(.02,.02,.03);

      // dark base
      vec3 col = deep;

      // add drifting nebula
      vec3 nebula = mix(vec3(.04,.03,.06), gold*.6, veins);
      col += nebula * (0.5 + 0.5*f2);

      // vignette
      float vig = 1. - smoothstep(.4,1.4,length(st));
      col *= .35 + .65*vig;

      // subtle mouse glow
      float mg = exp(-length(st - m)*3.5);
      col += gold * mg * .18;

      gl_FragColor = vec4(col, 1.);
    }
  `;

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1, 1,-1, -1,1, 1,1
  ]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes   = gl.getUniformLocation(prog, 'u_res');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  const uT     = gl.getUniformLocation(prog, 'u_t');

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    mouse.x = mouse.tx = canvas.width  / 2;
    mouse.y = mouse.ty = canvas.height / 2;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', e => {
    const dpr = canvas.width / window.innerWidth;
    mouse.tx = e.clientX * dpr;
    mouse.ty = (window.innerHeight - e.clientY) * dpr;
  });

  const start = performance.now();
  function frame(){
    const t = (performance.now() - start) / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;

    gl.uniform1f(uT, t);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ─── 2. CUSTOM CURSOR ─── */
(() => {
  if (!fine || reduce) return;
  const cur = $('#cursor');
  if (!cur) return;
  cur.classList.add('ready');
  cur.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';

  const dot  = cur.querySelector('.cursor-dot');
  const ring = cur.querySelector('.cursor-ring');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
  });

  const loop = () => {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-cursor="hover"], a, button, .exp-card, .ch, .contact-tel');
    cur.classList.toggle('hover', !!t);
  });
  document.addEventListener('mouseout', e => {
    const t = e.target.closest('[data-cursor="hover"], a, button, .exp-card, .ch, .contact-tel');
    if (t) cur.classList.remove('hover');
  });
})();

/* ─── 3. LOADER ─── */
(() => {
  const loader = $('#loader');
  const pctEl  = $('#loadPct');
  const barEl  = loader?.querySelector('.loader-line span');
  if (!loader) return;

  let p = 0;
  const step = () => {
    p += Math.random() * 7 + 3;
    if (p > 100) p = 100;
    if (pctEl) pctEl.textContent = Math.floor(p);
    if (barEl) barEl.style.width = p + '%';
    if (p < 100) {
      setTimeout(step, 70 + Math.random() * 100);
    } else {
      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.remove('loading');
        // trigger hero
        $('#hero .hero-title')?.classList.add('in');
        $$('[data-reveal]').forEach(el => el.classList.add('in'));
      }, 400);
    }
  };
  setTimeout(step, 250);
})();

/* ─── 4. NAV ─── */
(() => {
  const nav = $('#nav');
  const bar = $('#scrollBar');
  const onScroll = () => {
    const y = window.scrollY;
    nav?.classList.toggle('on', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (y / h * 100) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ─── 5. MOBILE MENU ─── */
(() => {
  const b = $('#burger');
  const m = $('#menu');
  b?.addEventListener('click', () => {
    b.classList.toggle('open');
    m?.classList.toggle('open');
    document.body.style.overflow = m?.classList.contains('open') ? 'hidden' : '';
  });
  $$('[data-menu]').forEach(a => a.addEventListener('click', () => {
    b?.classList.remove('open');
    m?.classList.remove('open');
    document.body.style.overflow = '';
  }));
})();

/* ─── 6. MAGNETIC BUTTONS ─── */
(() => {
  if (!fine || reduce) return;
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

/* ─── 7. SECTION REVEAL ─── */
(() => {
  if (reduce) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  $$('[data-reveal], .hero-title, .manifesto-title').forEach(el => io.observe(el));
})();

/* ─── 8. EXPERTISE HORIZONTAL DRAG ─── */
(() => {
  const el = $('#expScroll');
  if (!el) return;
  let down = false, sx = 0, sl = 0;

  el.addEventListener('mousedown', e => {
    down = true;
    el.classList.add('dragging');
    sx = e.pageX;
    sl = el.scrollLeft;
  });
  window.addEventListener('mouseup', () => {
    down = false;
    el.classList.remove('dragging');
  });
  el.addEventListener('mousemove', e => {
    if (!down) return;
    e.preventDefault();
    el.scrollLeft = sl - (e.pageX - sx) * 1.5;
  });
  // touch
  el.addEventListener('touchstart', e => {
    down = true; sx = e.touches[0].pageX; sl = el.scrollLeft;
  }, { passive: true });
  el.addEventListener('touchend', () => { down = false; });
  el.addEventListener('touchmove', e => {
    if (!down) return;
    el.scrollLeft = sl - (e.touches[0].pageX - sx);
  }, { passive: true });
})();

/* ─── 9. CARD MOUSE GLOW ─── */
(() => {
  if (!fine) return;
  $$('.exp-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });
})();

/* ─── 10. SMOOTH ANCHORS ─── */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    const y = t.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

})();