const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

window.addEventListener('load', () => {
  setTimeout(() => $('#preloader')?.classList.add('hide'), 650);
});

// Split hero title into animated characters
$$('[data-split]').forEach((el) => {
  const text = el.textContent.trim();
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.style.setProperty('--i', i);
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(span);
  });
});

// Mobile nav
const navToggle = $('#navToggle');
const navMenu = $('#navMenu');
navToggle?.addEventListener('click', () => navMenu.classList.toggle('open'));
$$('.nav a').forEach((a) => a.addEventListener('click', () => navMenu.classList.remove('open')));

// Header state + progress + back-to-top
const header = $('#siteHeader');
const progress = $('#scrollProgress');
const backTop = $('#backTop');
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? (scrollY / max) * 100 : 0;
  progress.style.width = pct + '%';
  header.classList.toggle('scrolled', scrollY > 30);
  backTop.classList.toggle('show', scrollY > 700);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();
backTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

// Reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
$$('[data-reveal]').forEach((el) => revealObserver.observe(el));

// Cursor glow
const dot = $('#cursorDot');
const glow = $('#cursorGlow');
let mouseX = innerWidth / 2, mouseY = innerHeight / 2, glowX = mouseX, glowY = mouseY;
addEventListener('pointermove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (dot) { dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`; }
});
const cursorLoop = () => {
  glowX += (mouseX - glowX) * 0.13;
  glowY += (mouseY - glowY) * 0.13;
  if (glow) { glow.style.left = `${glowX}px`; glow.style.top = `${glowY}px`; }
  requestAnimationFrame(cursorLoop);
};
cursorLoop();
$$('a, button, [data-tilt]').forEach((el) => {
  el.addEventListener('mouseenter', () => glow?.classList.add('active'));
  el.addEventListener('mouseleave', () => glow?.classList.remove('active'));
});

// Magnetic buttons
$$('.magnetic').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

// 3D tilt cards with spotlight
$$('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -10;
    const ry = ((x / r.width) - 0.5) * 10;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    card.style.setProperty('--mx', `${(x / r.width) * 100}%`);
    card.style.setProperty('--my', `${(y / r.height) * 100}%`);
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

// Parallax floating KPI and hero wave
const floatEls = $$('[data-float]');
addEventListener('pointermove', (e) => {
  const x = (e.clientX / innerWidth - 0.5);
  const y = (e.clientY / innerHeight - 0.5);
  floatEls.forEach((el, i) => {
    el.style.transform = `translate(${x * (i ? -35 : 35)}px, ${y * (i ? 30 : -30)}px)`;
  });
});

// Animated counters when pricing comes into view
const animateNumber = (el, target, prefix = '', suffix = '') => {
  let start = 0;
  const duration = 1200;
  const startTime = performance.now();
  const tick = (now) => {
    const p = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.floor(start + (target - start) * eased);
    el.textContent = prefix + val.toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
let countersRun = false;
const priceObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersRun) {
    countersRun = true;
    $$('.price-card h3').forEach((el) => animateNumber(el, Number(el.textContent.replace(/[^0-9]/g, '')), '$'));
    priceObserver.disconnect();
  }
}, { threshold: 0.25 });
const pricing = $('#pricing');
if (pricing) priceObserver.observe(pricing);

// Cost calculator
const team = $('#teamRange'), hours = $('#hoursRange'), rate = $('#rateRange');
const teamV = $('#teamValue'), hoursV = $('#hoursValue'), rateV = $('#rateValue'), costV = $('#costValue');
let multiplier = 1;
function calcCost() {
  const t = +team.value, h = +hours.value, r = +rate.value;
  teamV.textContent = `${t} people`;
  hoursV.textContent = `${h} hrs`;
  rateV.textContent = `$${r}/hr`;
  const total = Math.round(t * h * r * 4.33 * multiplier);
  costV.textContent = `$${total.toLocaleString()}`;
}
[team, hours, rate].forEach((el) => el?.addEventListener('input', calcCost));
$$('.scenario-pills button').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.scenario-pills button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    multiplier = Number(btn.dataset.rate);
    calcCost();
  });
});
calcCost();

// FAQ accordion
$$('.faq-item button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const was = item.classList.contains('active');
    $$('.faq-item').forEach((el) => {
      el.classList.remove('active');
      $('button span', el).textContent = '+';
    });
    if (!was) {
      item.classList.add('active');
      $('button span', item).textContent = '−';
    }
  });
});

// Newsletter feedback
$('#newsletter')?.addEventListener('submit', (e) => {
  e.preventDefault();
  $('#formMsg').textContent = 'Thanks! Your automation notes are on the way.';
  e.currentTarget.reset();
});

// Canvas animated particles/orbs
const canvas = $('#orbCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: Math.min(90, Math.floor(innerWidth / 16)) }, (_, i) => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 2.2 + .5,
    vx: (Math.random() - .5) * .28,
    vy: (Math.random() - .5) * .28,
    a: Math.random() * .28 + .06,
    hue: Math.random() > .65 ? '255,90,49' : '255,255,255'
  }));
}
function drawCanvas() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const g = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 380);
  g.addColorStop(0, 'rgba(255,90,49,.10)');
  g.addColorStop(1, 'rgba(255,90,49,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  particles.forEach((p) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < -20) p.x = innerWidth + 20;
    if (p.x > innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = innerHeight + 20;
    if (p.y > innerHeight + 20) p.y = -20;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${p.a})`;
    ctx.fill();
  });
  requestAnimationFrame(drawCanvas);
}
addEventListener('resize', resizeCanvas);
resizeCanvas();
drawCanvas();
