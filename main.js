const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [];
let mouse = { x: -9999, y: -9999 };
let animating = false;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const count = Math.floor((W * H) / 14000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.5 + 0.1,
      hue: Math.random() < 0.7 ? 190 : 165,
    });
  }
}

function drawBg() {
  ctx.clearRect(0, 0, W, H);

  const grad = ctx.createRadialGradient(W * 0.5, H * 0.1, 0, W * 0.5, H * 0.1, W * 0.7);
  grad.addColorStop(0, 'rgba(33,118,174,0.10)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
  mouseGrad.addColorStop(0, 'rgba(0,229,204,0.07)');
  mouseGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = mouseGrad;
  ctx.fillRect(0, 0, W, H);

  for (const p of particles) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repel = dist < 120 ? (1 - dist / 120) : 0;

    p.x += p.vx + (dx / dist || 0) * repel * 0.4;
    p.y += p.vy + (dy / dist || 0) * repel * 0.4;

    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 80) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(33,118,174,${0.15 * (1 - d / 80)})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
  }
}

function loop() {
  drawBg();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => { resize(); createParticles(); });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

resize();
createParticles();
loop();

let osmosisRan = false;

function triggerOsmosis() {
  if (osmosisRan) { resetOsmosis(); return; }
  osmosisRan = true;
  const btn = document.getElementById('osmosis-btn');
  btn.textContent = '↺ Reset';

  const waterRight = document.getElementById('water-right');
  const riseIndicator = document.getElementById('rise-indicator');
  waterRight.classList.add('rising');
  riseIndicator.classList.add('visible');
}

function resetOsmosis() {
  osmosisRan = false;
  const btn = document.getElementById('osmosis-btn');
  btn.textContent = '▶ Run Demo';

  const waterRight = document.getElementById('water-right');
  const riseIndicator = document.getElementById('rise-indicator');
  waterRight.classList.remove('rising');
  riseIndicator.classList.remove('visible');
}

let roRan = false;

function triggerRO() {
  if (roRan) { resetRO(); return; }
  roRan = true;
  const btn = document.getElementById('ro-btn');
  btn.textContent = '↺ Reset';

  const plunger = document.getElementById('syringe-plunger');
  const body = document.querySelector('.syringe-body');
  const filtrate = document.getElementById('filtrate-zone');

  plunger.classList.add('pushed');
  body.classList.add('pressurized');

  setTimeout(() => {
    filtrate.classList.add('filled');
  }, 500);
}

function resetRO() {
  roRan = false;
  const btn = document.getElementById('ro-btn');
  btn.textContent = '▶ Apply Pressure';

  const plunger = document.getElementById('syringe-plunger');
  const body = document.querySelector('.syringe-body');
  const filtrate = document.getElementById('filtrate-zone');

  plunger.classList.remove('pushed');
  body.classList.remove('pressurized');
  filtrate.classList.remove('filled');
}

function animateCountUp(el, target, suffix) {
  const start = performance.now();
  const duration = 1600;
  const isFloat = target !== Math.floor(target);

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = (suffix === 'mm' ? '~' : '') + value + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      animateCountUp(el, target, suffix);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => statObserver.observe(el));

const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.e-bar').forEach(bar => bar.classList.add('animated'));
      entry.target.querySelectorAll('.solar-bar').forEach(bar => bar.classList.add('animated'));
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.energy-bar-container, .solar-bar-viz').forEach(el => barObserver.observe(el));

const panelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.panel, .strategy-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  panelObserver.observe(el);
});

document.querySelectorAll('.strategy-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});
