// ==============================
// THREE.JS — TRON PERSPECTIVE GRID + FLOATING 3D SCREENS
// Gold theme, holographic, luxury feel
// ==============================
(function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf0f9ff, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf0f9ff, 0.0022);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 80, 260);
    camera.lookAt(0, 0, 0);

    // ─────────────────────────────────────────────
    // 1.  TRON PERSPECTIVE GRID FLOOR
    // ─────────────────────────────────────────────
    const GRID_SIZE  = 800;
    const GRID_DIVS  = 40;
    const CELL_SIZE  = GRID_SIZE / GRID_DIVS;
    const gridLines  = [];

    const goldMat  = new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false });
    const gold2Mat = new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false });

    // Horizontal lines
    for (let i = 0; i <= GRID_DIVS; i++) {
        const z = -GRID_SIZE / 2 + i * CELL_SIZE;
        const isAccent = i % 5 === 0;
        const g = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-GRID_SIZE / 2, 0, z),
            new THREE.Vector3( GRID_SIZE / 2, 0, z)
        ]);
        scene.add(new THREE.Line(g, isAccent ? goldMat : gold2Mat));
    }
    // Vertical lines
    for (let i = 0; i <= GRID_DIVS; i++) {
        const x = -GRID_SIZE / 2 + i * CELL_SIZE;
        const isAccent = i % 5 === 0;
        const g = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, 0, -GRID_SIZE / 2),
            new THREE.Vector3(x, 0,  GRID_SIZE / 2)
        ]);
        scene.add(new THREE.Line(g, isAccent ? goldMat : gold2Mat));
    }

    // Tilt the grid to perspective floor
    const gridGroup = new THREE.Group();
    scene.children.forEach(c => { if (c.isLine) gridGroup.add(c); });
    // We add them directly to scene but tilt via camera angle

    // ─────────────────────────────────────────────
    // 2.  FLOATING HOLOGRAPHIC SCREENS (3D planes)
    // ─────────────────────────────────────────────
    function makeScreen(w, h, x, y, z, rotY, rotX = 0) {
        const group = new THREE.Group();

        // Screen border (wireframe frame)
        const edgeGeom = new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h));
        const edgeMat  = new THREE.LineBasicMaterial({
            color: 0x0284c7, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const frame = new THREE.LineSegments(edgeGeom, edgeMat);
        group.add(frame);

        // Screen face (translucent glowing panel)
        const panelGeom = new THREE.PlaneGeometry(w, h);
        const panelMat  = new THREE.MeshBasicMaterial({
            color: 0x0ea5e9, transparent: true, opacity: 0.04,
            blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
        });
        group.add(new THREE.Mesh(panelGeom, panelMat));

        // Inner divider lines (screen grid)
        const innerMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        // 3 horizontal lines
        for (let i = 1; i <= 3; i++) {
            const yPos = -h / 2 + i * (h / 4);
            const ig   = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-w / 2, yPos, 0), new THREE.Vector3(w / 2, yPos, 0)
            ]);
            group.add(new THREE.Line(ig, innerMat));
        }
        // 2 vertical lines
        for (let i = 1; i <= 2; i++) {
            const xPos = -w / 2 + i * (w / 3);
            const ig   = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(xPos, -h / 2, 0), new THREE.Vector3(xPos, h / 2, 0)
            ]);
            group.add(new THREE.Line(ig, innerMat));
        }

        group.position.set(x, y, z);
        group.rotation.y = rotY;
        group.rotation.x = rotX;
        return group;
    }

    // Main big screen — centre front
    const screen1 = makeScreen(200, 120, 0, 60, -60, 0);
    scene.add(screen1);

    // Left angled screen
    const screen2 = makeScreen(130, 80, -160, 50, -30, Math.PI / 5);
    scene.add(screen2);

    // Right angled screen
    const screen3 = makeScreen(130, 80, 160, 50, -30, -Math.PI / 5);
    scene.add(screen3);

    // Small floating top-left panel
    const screen4 = makeScreen(70, 50, -80, 120, -100, Math.PI / 7, -0.1);
    scene.add(screen4);

    // Small floating top-right panel
    const screen5 = makeScreen(70, 50, 80, 120, -100, -Math.PI / 7, -0.1);
    scene.add(screen5);

    const screens = [screen1, screen2, screen3, screen4, screen5];

    // ─────────────────────────────────────────────
    // 3.  GOLD PARTICLE DUST
    // ─────────────────────────────────────────────
    const DUST = 200;
    const dustPos = new Float32Array(DUST * 3);
    const dustVel = [];
    for (let i = 0; i < DUST; i++) {
        dustPos[i * 3]     = (Math.random() - 0.5) * 700;
        dustPos[i * 3 + 1] = Math.random() * 250;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 500 - 50;
        dustVel.push({
            x: (Math.random() - 0.5) * 0.15,
            y: Math.random() * 0.08 + 0.02
        });
    }
    const dustGeom = new THREE.BufferGeometry();
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat  = new THREE.PointsMaterial({
        size: 1.5, color: 0x0ea5e9, transparent: true, opacity: 0.35,
        blending: THREE.NormalBlending, depthWrite: false, sizeAttenuation: true
    });
    scene.add(new THREE.Points(dustGeom, dustMat));

    // ─────────────────────────────────────────────
    // 4.  MOUSE PARALLAX
    // ─────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth  - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ─────────────────────────────────────────────
    // 5.  ANIMATION LOOP
    // ─────────────────────────────────────────────
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Screens gently float up and down
        screen1.position.y = 60 + Math.sin(t * 0.6) * 8;
        screen2.position.y = 50 + Math.sin(t * 0.5 + 1) * 6;
        screen3.position.y = 50 + Math.sin(t * 0.55 + 2) * 6;
        screen4.position.y = 120 + Math.sin(t * 0.7 + 0.5) * 5;
        screen5.position.y = 120 + Math.sin(t * 0.65 + 1.5) * 5;

        // Screens gently pulse opacity
        const pulse = 0.5 + Math.sin(t * 1.2) * 0.2;
        screens.forEach((s, idx) => {
            s.children.forEach(child => {
                if (child.material && child.material.opacity !== undefined) {
                    if (child.type === 'LineSegments' && child.geometry.type === 'EdgesGeometry') {
                        child.material.opacity = 0.5 + Math.sin(t * 1.2 + idx) * 0.25;
                    }
                }
            });
        });

        // Gold dust particles drift upward and wrap
        const dp = dustGeom.attributes.position.array;
        for (let i = 0; i < DUST; i++) {
            dp[i * 3]     += dustVel[i].x;
            dp[i * 3 + 1] += dustVel[i].y;
            if (dp[i * 3 + 1] > 250) dp[i * 3 + 1] = 0;
        }
        dustGeom.attributes.position.needsUpdate = true;

        // Mouse parallax — smooth camera drift
        camera.position.x += (mouseX * 50 - camera.position.x) * 0.04;
        camera.position.y += (80 - mouseY * 30 - camera.position.y) * 0.04;
        camera.lookAt(0, 30, 0);

        renderer.render(scene, camera);
    }

    animate();
})();


// ==============================
// NAVIGATION — Active Link & Scroll
// ==============================
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => navMenu.classList.toggle('open'));
navLinks.forEach(link => link.addEventListener('click', () => navMenu.classList.remove('open')));

window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    sections.forEach(section => {
        const top    = section.offsetTop - 120;
        const height = section.offsetHeight;
        const id     = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(l => l.classList.remove('active'));
            const active = document.querySelector(`.nav-link[href="#${id}"]`);
            if (active) active.classList.add('active');
        }
    });
});

// ==============================
// SCROLL FADE-UP ANIMATIONS
// ==============================
const animatables = document.querySelectorAll(
    '.glass-card, .section-title, .about-text, .about-img-wrapper, .filter-btns, .contact-info, .contact-form-wrapper, .timeline-heading'
);
animatables.forEach(el => el.classList.add('fade-up'));

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// ==============================
// PROJECT FILTER
// ==============================
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        projectCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeInUp 0.4s ease both';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ==============================
// CONTACT FORM (Simulated)
// ==============================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
            btn.disabled = false;
            contactForm.reset();
        }, 3000);
    });
}

// ==============================
// STAGGERED CARD ANIMATIONS
// ==============================
document.querySelectorAll('.skills-grid .skill-card').forEach((c, i) => {
    c.style.transitionDelay = `${i * 0.08}s`;
});
document.querySelectorAll('.projects-grid .project-card').forEach((c, i) => {
    c.style.transitionDelay = `${i * 0.07}s`;
});
