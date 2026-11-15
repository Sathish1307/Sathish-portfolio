document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const toast = $('#toast');
  let toastTimer;
  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // Mobile navigation
  const menuBtn = $('#menuBtn');
  const nav = $('#primaryNav');
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('#primaryNav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }));

  // Copy-to-clipboard controls
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const value = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      notify(`${value} copied to clipboard`);
    } catch {
      const input = document.createElement('textarea');
      input.value = value; document.body.appendChild(input); input.select();
      document.execCommand('copy'); input.remove();
      notify(`${value} copied`);
    }
  }));

  // Project archive filters
  $$('.filter-tab').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter-tab').forEach(b => b.classList.toggle('active', b === btn));
    const filter = btn.dataset.filter;
    $$('.proj-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.cat !== filter);
    });
  }));

  // Skill-to-experience matching
  const skillButtons = $$('.skill-btn');
  skillButtons.forEach(btn => btn.addEventListener('click', () => {
    const wasActive = btn.classList.contains('active');
    skillButtons.forEach(b => b.classList.remove('active'));
    $$('.matched-card').forEach(c => c.classList.remove('matched-card'));
    if (wasActive) {
      $('#matchCounter').textContent = 'Showing all tools';
      return;
    }
    btn.classList.add('active');
    const skill = btn.dataset.skill.toLowerCase();
    let count = 0;
    $$('[data-skills]').forEach(card => {
      const match = card.dataset.skills.toLowerCase().includes(skill);
      card.classList.toggle('matched-card', match);
      if (match) count++;
    });
    $('#matchCounter').textContent = `${count} matching experience${count === 1 ? '' : 's'}`;
    $('#matchCounter').scrollIntoView({behavior:'smooth', block:'nearest'});
  }));

  // Modal utilities
  const openModal = el => { if (el) { el.hidden = false; document.body.classList.add('modal-open'); } };
  const closeModal = el => { if (el) { el.hidden = true; if (!$$('.modal-overlay:not([hidden])').length) document.body.classList.remove('modal-open'); } };
  const specModal = $('#specModal');
  const projectSpecs = {
    'gim-rbs': {
      title:'Gradient-Index Modulated Regenerative Braking System',
      meta:'SEP 2026 · ESP32 · MPU6050 · IR2104 · IRFZ44N · ACS712 · KiCad',
      body:'<p><strong>Objective:</strong> Adapt regenerative braking commands according to downhill road gradient.</p><ul><li>MPU6050 provides slope estimation to the ESP32 controller.</li><li>ESP32 adjusts PWM braking commands based on the estimated gradient.</li><li>Three-phase MOSFET power stage uses three IR2104 half-bridge drivers and six IRFZ44N MOSFETs.</li><li>ACS712 is integrated for current sensing; PCB design completed in KiCad.</li></ul><p><strong>Focus areas:</strong> embedded control, gate-drive design, power-stage integration, sensing and PCB development.</p><p class=\"spec-demo-link\"><a class=\"watch-demo\" href=\"#gim-demo\">▶ Watch the simulation walkthrough</a></p>'
    },
    'lna-90nm': {
      title:'Low-Noise Amplifier using 90-nm CMOS Technology',
      meta:'JAN 2026 · RF CMOS · CADENCE VIRTUOSO · SIMULATION',
      body:'<p><strong>Objective:</strong> Design and evaluate an RF receiver low-noise amplifier.</p><ul><li>Developed and refined the LNA schematic in Cadence Virtuoso.</li><li>Performed S-parameter and noise analysis.</li><li>Achieved a simulated noise figure of <strong>0.245 dB</strong> under the evaluated simulation conditions.</li></ul><p><strong>Focus areas:</strong> transistor-level design, biasing, RF performance evaluation and iterative simulation.</p>'
    },
    'hairpin-bend': {
      title:'Smart Hairpin Bend Accident Prevention System',
      meta:'MAR 2026 · ESP32 · ULTRASONIC SENSORS · ESP-NOW',
      body:'<p><strong>Objective:</strong> Warn vehicles approaching a blind hairpin bend from opposite directions.</p><ul><li>Ultrasonic sensors detect approaching vehicles.</li><li>ESP-NOW enables wireless communication between the two units.</li><li>LCD and buzzer provide visual and audio alerts.</li><li>Vibration-based crash detection triggers emergency alerts.</li></ul><p><strong>Focus areas:</strong> embedded sensing, wireless communication and real-time alert systems.</p>'
    },
    'fuel-theft': {
      title:'Anti-Theft Fuel System',
      meta:'NOV 2025 · ARDUINO · VIBRATION SENSOR · RELAY',
      body:'<p><strong>Objective:</strong> Detect possible fuel tampering and activate an audible alert.</p><ul><li>Vibration sensor detects disturbance.</li><li>Debounce logic improves tamper-detection reliability.</li><li>Relay-controlled alarm provides local notification.</li><li>GSM remote notification was identified as a potential future enhancement.</li></ul><p><strong>Focus areas:</strong> embedded logic, sensor interfacing and relay control.</p>'
    }
  };
  function showSpec(key) {
    const item = projectSpecs[key];
    if (!item) return;
    $('#specTitle').textContent = item.title;
    $('#specMeta').textContent = item.meta;
    $('#specBody').innerHTML = item.body;
    openModal(specModal);
  }
  $$('[data-project]').forEach(btn => btn.addEventListener('click', () => showSpec(btn.dataset.project)));
  $('#closeSpecBtn')?.addEventListener('click', () => closeModal(specModal));
  const resumeModal = $('#resumeModal');
  $('#openResumeBtn')?.addEventListener('click', () => openModal(resumeModal));
  $('#closeResumeBtn')?.addEventListener('click', () => closeModal(resumeModal));
  const cmdModal = $('#cmdModal');
  $('#openCmdBtn')?.addEventListener('click', () => { openModal(cmdModal); $('#cmdInput')?.focus(); });
  $('#closeCmdBtn')?.addEventListener('click', () => closeModal(cmdModal));
  $$('.modal-overlay').forEach(overlay => overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay);
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal-overlay:not([hidden])').forEach(closeModal);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); openModal(cmdModal); $('#cmdInput')?.focus();
    }
  });


  // Navigation progress trace — visually tracks how far the page has been explored.
  const navProgress = $('#navProgress');
  const updateNavProgress = () => {
    if (!navProgress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    navProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };
  window.addEventListener('scroll', updateNavProgress, { passive: true });
  window.addEventListener('resize', updateNavProgress);
  updateNavProgress();

  // Modal link to the featured GIM-RBS video demonstration.
  $('#specBody')?.addEventListener('click', e => {
    const link = e.target.closest('.watch-demo');
    if (!link) return;
    e.preventDefault();
    closeModal(specModal);
    $('#gim-demo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => $('.gim-demo-video')?.focus(), 450);
  });

  // Command palette actions and quick search
  $$('#cmdList button').forEach(btn => btn.addEventListener('click', () => {
    const action = btn.dataset.action || '';
    closeModal(cmdModal);
    if (action.startsWith('goto:')) $(action.slice(5))?.scrollIntoView({behavior:'smooth'});
    else if (action.startsWith('spec:')) showSpec(action.slice(5));
    else if (action.startsWith('copy:')) {
      const value = action.slice(5);
      navigator.clipboard?.writeText(value).then(() => notify(`${value} copied`)).catch(() => notify(value));
    } else if (action === 'resume') openModal(resumeModal);
  }));
  $('#cmdInput')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('#cmdList li').forEach(li => li.hidden = !li.textContent.toLowerCase().includes(q));
  });

  // Interactive RF / PWM workbench. Curves are illustrative models, not measured data.
  const canvas = $('#benchCanvas');
  const ctx = canvas?.getContext('2d');
  let bench = 'lna';
  function drawPlot() {
    if (!ctx || !canvas) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(148,163,184,.17)'; ctx.lineWidth = 1;
    for (let x=0; x<=w; x+=64) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y=0; y<=h; y+=44) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace';
    ctx.fillText(bench === 'lna' ? 'RELATIVE RESPONSE' : 'PWM COMMAND PROFILE', 12, 18);
    ctx.beginPath(); ctx.lineWidth = 3; ctx.strokeStyle = '#38bdf8';
    for (let x=0; x<=w; x++) {
      const t=x/w;
      let y;
      if (bench === 'lna') {
        const f=Number($('#freqSlider')?.value || 2.4);
        const center=(f-1)/5;
        y= h*.68 - 105*Math.exp(-Math.pow((t-center)*5,2)) + 12*Math.sin(t*18);
      } else {
        const slope=Number($('#slopeSlider')?.value || 12);
        y=h*.78 - (slope/25)*h*.52*(.35+.65*Math.sin(t*Math.PI));
        y += 3*Math.sin(t*40);
      }
      if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.fillStyle='#f8fafc'; ctx.font='11px monospace';
    ctx.fillText('0', 10, h-8); ctx.fillText('TIME / FREQUENCY →', w-170, h-8);
  }
  $$('.wb-tab').forEach(btn => btn.addEventListener('click', () => {
    bench=btn.dataset.bench;
    $$('.wb-tab').forEach(b => { const active=b===btn; b.classList.toggle('active',active); b.setAttribute('aria-selected',String(active)); });
    $('#controls-lna').hidden=bench!=='lna';
    $('#controls-gim').hidden=bench!=='gim';
    $('#viewportTitle').textContent=bench==='lna'?'CADENCE VIRTUOSO // 90-NM CMOS LNA RESPONSE':'GIM-RBS // GRADIENT-ADAPTIVE PWM PROFILE';
    drawPlot();
  }));
  $('#freqSlider')?.addEventListener('input', e => {
    const f=Number(e.target.value);
    $('#freqVal').textContent=`${f.toFixed(2)} GHz`;
    // Display the documented design target; the plot is a conceptual interactive illustration.
    // S21 and S11 are not specified in the supplied resume, so no numerical values are displayed.
    drawPlot();
  });
  $('#slopeSlider')?.addEventListener('input', e => {
    const s=Number(e.target.value);
    $('#slopeVal').textContent=`${s}° Downhill`;
    $('#pwmReadout').textContent='Illustrative';
    $('#currReadout').textContent='Not reported';
    drawPlot();
  });
  drawPlot();

  // Scroll reveal and current navigation state
  const revealTargets = $$('.section, .hero-copy, .figure-stage, .proj-card, .exp-card, .comp-card, .tool-panel');
  revealTargets.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), {threshold:.08});
    revealTargets.forEach(el => revealObserver.observe(el));
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('#primaryNav a').forEach(a => a.classList.toggle('active', a.hash === `#${entry.target.id}`));
      }
    }), {rootMargin:'-35% 0px -55% 0px'});
    $$('main section[id]').forEach(section => sectionObserver.observe(section));
  } else revealTargets.forEach(el => el.classList.add('visible'));

  // Scroll journey: move the small flying scout through a curved path as the
  // visitor travels down the page. This is a floating character, not section nav.
  let lastScrollY = window.scrollY;
  let journeyTicking = false;
  const flightBot = $('#flightBot');
  const flightBotLabel = $('#flightBotLabel span');
  const journeyNames = {
    home: 'SCOUT // ONLINE',
    workbench: 'SCOUT // RF LAB',
    experience: 'SCOUT // FIELD LOG',
    work: 'SCOUT // PROJECT FILES',
    achievements: 'SCOUT // SIGNAL FOUND',
    toolkit: 'SCOUT // TOOLKIT',
    contact: 'SCOUT // TRANSMISSION'
  };
  function updateJourneyMotion() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    document.documentElement.style.setProperty('--page-progress', progress.toFixed(4));
    const heroDrift = Math.min(34, window.scrollY * .045);
    document.body.style.setProperty('--hero-drift', `${heroDrift}px`);
    if (flightBot) {
      // Three gentle sweeping passes across the viewport, with a descending arc.
      const sweep = (Math.sin(progress * Math.PI * 3 - Math.PI / 2) + 1) / 2;
      const x = 7 + sweep * (window.innerWidth < 760 ? 72 : 82);
      const y = 15 + progress * 65 + Math.sin(progress * Math.PI * 8) * 3.5;
      const direction = window.scrollY >= lastScrollY ? 1 : -1;
      flightBot.style.setProperty('--bot-x', `${Math.max(5, Math.min(93, x))}%`);
      flightBot.style.setProperty('--bot-y', `${Math.max(13, Math.min(84, y))}%`);
      flightBot.style.setProperty('--bot-lean', `${direction * (1.5 + Math.min(5, Math.abs(window.scrollY-lastScrollY)*.18))}deg`);
    }
    lastScrollY = window.scrollY;
    journeyTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!journeyTicking) { window.requestAnimationFrame(updateJourneyMotion); journeyTicking = true; }
  }, { passive:true });
  window.addEventListener('resize', updateJourneyMotion, {passive:true});
  updateJourneyMotion();

  if ('IntersectionObserver' in window && flightBotLabel) {
    const botObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (visible) flightBotLabel.textContent = journeyNames[visible.target.id] || 'SCOUT // EXPLORING';
    }, { rootMargin:'-32% 0px -48% 0px', threshold:[0,.2,.45,.7] });
    $$('main section[id]').forEach(section => botObserver.observe(section));
  }

  // Add responsive cursor-reactive surfaces to the portfolio's meaningful
  // content blocks. Their floating action tags identify what each card contains.
  const hoverTargets = $$('.proj-card, .exp-card, .comp-card, .tool-panel, .edu-box, .index-cell, .readout-box');
  hoverTargets.forEach((card, index) => {
    card.classList.add('hover-surface');
    let label = 'INSPECT NODE ↗';
    if (card.matches('.proj-card')) label = 'OPEN CASE FILE ↗';
    else if (card.matches('.exp-card')) label = 'FIELD EXPERIENCE ↗';
    else if (card.matches('.comp-card')) label = 'VIEW RECOGNITION ↗';
    else if (card.matches('.tool-panel')) label = 'SKILL NODE ↗';
    else if (card.matches('.edu-box')) label = 'CREDENTIAL ↗';
    else if (card.matches('.index-cell')) label = 'SIGNAL // ACTIVE';
    else if (card.matches('.readout-box')) label = 'LIVE READOUT';
    card.dataset.hoverLabel = label;
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
      const py = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
      card.style.setProperty('--mx', `${px.toFixed(1)}%`);
      card.style.setProperty('--my', `${py.toFixed(1)}%`);
      if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - .5;
        const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - .5;
        card.style.setProperty('--tilt-x', `${(-ny * 3).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(nx * 3).toFixed(2)}deg`);
      }
    }, {passive:true});
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });

  // Ambient PCB signal network: faint orthogonal traces with travelling electron pulses.
  // The canvas is decorative only and automatically stops for reduced-motion preferences.
  const circuitCanvas = $('#circuitCanvas');
  const circuitCtx = circuitCanvas?.getContext('2d');
  const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  let circuitW = 0, circuitH = 0, circuitDpr = 1, circuitFrame = 0, circuitRoutes = [];
  function buildCircuitRoutes() {
    if (!circuitW || !circuitH) return;
    const rand = (n) => { const x = Math.sin(n * 127.1 + 19.7) * 43758.5453; return x - Math.floor(x); };
    circuitRoutes = [];
    const count = Math.min(18, Math.max(9, Math.floor(circuitW / 92)));
    for (let i = 0; i < count; i++) {
      const x = (0.06 + rand(i + 1) * .88) * circuitW;
      const y = (0.08 + rand(i + 31) * .84) * circuitH;
      const dx = (rand(i + 57) > .5 ? 1 : -1) * (24 + rand(i + 91) * 95);
      const dy = (rand(i + 131) > .5 ? 1 : -1) * (22 + rand(i + 171) * 100);
      const points = [{x,y}, {x:x+dx,y}, {x:x+dx,y:y+dy}, {x:x+dx*1.35,y:y+dy}];
      const lengths = [];
      let total = 0;
      for (let k=1;k<points.length;k++) { const len=Math.hypot(points[k].x-points[k-1].x,points[k].y-points[k-1].y); lengths.push(len); total += len; }
      circuitRoutes.push({points,lengths,total,phase:rand(i+231),speed:.035+rand(i+271)*.055});
    }
  }
  function resizeCircuitCanvas() {
    if (!circuitCanvas || !circuitCtx) return;
    circuitDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    circuitW = window.innerWidth; circuitH = window.innerHeight;
    circuitCanvas.width = Math.round(circuitW * circuitDpr);
    circuitCanvas.height = Math.round(circuitH * circuitDpr);
    circuitCanvas.style.width = `${circuitW}px`;
    circuitCanvas.style.height = `${circuitH}px`;
    circuitCtx.setTransform(circuitDpr,0,0,circuitDpr,0,0);
    buildCircuitRoutes();
    if (reducedMotion) drawCircuitNetwork(0);
  }
  function pointOnRoute(route, progress) {
    let remaining = Math.max(0, Math.min(.999, progress)) * route.total;
    for (let i=0;i<route.lengths.length;i++) {
      const len = route.lengths[i];
      if (remaining <= len) {
        const a=route.points[i], b=route.points[i+1], t=len ? remaining/len : 0;
        return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
      }
      remaining -= len;
    }
    return route.points[route.points.length-1];
  }
  function drawCircuitNetwork(time) {
    if (!circuitCtx || !circuitCanvas) return;
    const ctx=circuitCtx;
    ctx.clearRect(0,0,circuitW,circuitH);
    circuitRoutes.forEach(route => {
      ctx.beginPath(); ctx.moveTo(route.points[0].x,route.points[0].y);
      route.points.slice(1).forEach(p => ctx.lineTo(p.x,p.y));
      ctx.strokeStyle='rgba(38,105,202,.16)'; ctx.lineWidth=1; ctx.stroke();
      const end=route.points[route.points.length-1];
      ctx.beginPath(); ctx.arc(end.x,end.y,2,0,Math.PI*2); ctx.fillStyle='rgba(38,105,202,.19)'; ctx.fill();
      const phase=(route.phase + time*route.speed/1000) % 1;
      const pulse=pointOnRoute(route,phase);
      ctx.beginPath(); ctx.arc(pulse.x,pulse.y,2.1,0,Math.PI*2);
      ctx.fillStyle='rgba(27,126,221,.62)'; ctx.shadowColor='rgba(45,135,255,.55)'; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
    });
  }
  function animateCircuit(time) {
    drawCircuitNetwork(time);
    if (!reducedMotion && !document.hidden) circuitFrame = requestAnimationFrame(animateCircuit);
  }
  if (circuitCanvas && circuitCtx) {
    resizeCircuitCanvas();
    window.addEventListener('resize', resizeCircuitCanvas, {passive:true});
    if (!reducedMotion) circuitFrame = requestAnimationFrame(animateCircuit);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(circuitFrame);
      else if (!reducedMotion) circuitFrame = requestAnimationFrame(animateCircuit);
    });
  }
});
