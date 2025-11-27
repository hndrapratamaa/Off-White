// --- DATA CONFIG ---
const PRODUCTS = [
    { id: '1', name: 'INSTALL TEAM TEE', price: 65, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', description: 'Heavyweight cotton.' },
    { id: '2', name: 'MECHANIC HOODIE', price: 145, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800', description: '14oz Fleece.' },
    { id: '3', name: 'CONCRETE CAP', price: 50, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800', description: 'Unstructured 6-panel.' },
    { id: '4', name: 'SITE VEST', price: 180, image: 'https://images.unsplash.com/photo-1551488852-d81a4d53e253?auto=format&fit=crop&q=80&w=800', description: 'High visibility.' }
];

const PROJECTS = [
    { id: 'p1', title: 'SUNSHINE COURT', location: 'Hamptons, NY', year: '2023', image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200' },
    { id: 'p2', title: 'THE WORKSHOP', location: 'New York, NY', year: '2022', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200' },
];

const MENU_ITEMS = [
    { label: 'Shop', path: 'shop' },
    { label: 'Saw', path: 'projects' },
    { label: 'Design', path: 'about' },
    { label: 'Archive', path: 'shop' },
];

// --- STATE MANAGEMENT ---
let cart = [];
let isMenuOpen = false;

// --- DOM ELEMENTS ---
const app = document.getElementById('app');
const menuBtn = document.getElementById('btn-menu');
const menuText = document.getElementById('menu-text');
const dropdownMenu = document.getElementById('dropdown-menu');
const menuLinksContainer = document.getElementById('menu-links');
const cartBtn = document.getElementById('btn-cart');
const cartCountEl = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const closeCartBtn = document.getElementById('btn-close-cart');

// --- SVG & TEMPLATES ---
const getCrossSvg = () => `
    <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 text-black mix-blend-multiply">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke" />
    </svg>
`;

const getFooterHtml = () => `
    <footer class="bg-off-white text-black relative z-30 px-[10px] lg:px-[20px] w-full mt-auto">
      <div class="border-x-2 border-black bg-off-white">
        <div class="px-[10px] py-[25px] relative border-b-2 border-black text-center">
            <span class="inline-block text-[10px] md:text-xs font-mono uppercase">
                © NEW YORK SUNSHINE. 2025
            </span>
        </div>
      </div>
    </footer>
`;

// --- PHYSICS ENGINE (MATTER.JS) ---
// Ini fitur baru biar ada bola jatuh kayak di referensi
function initPhysics() {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint;

    // Create engine
    const engine = Engine.create();
    const world = engine.world;

    // Create renderer
    const container = document.getElementById('canvas-container');
    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            background: 'transparent', // Penting biar tembus pandang
            wireframes: false,
            pixelRatio: window.devicePixelRatio
        }
    });

    // Create borders (Walls)
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, wallOptions);
    const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, wallOptions);
    const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, wallOptions);
    
    Composite.add(world, [ground, leftWall, rightWall]);

    // Add Tennis Balls
    const tennisBallTexture = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Tennis_ball.svg/2048px-Tennis_ball.svg.png'; // Contoh URL PNG
    
    function addBall() {
        const size = 30 + Math.random() * 20; // Random size
        const ball = Bodies.circle(
            Math.random() * window.innerWidth, 
            -Math.random() * 500, // Mulai dari atas layar
            size, 
            {
                restitution: 0.9, // Mantul banget (bouncy)
                friction: 0.005,
                render: {
                    fillStyle: '#ccff00', // Warna kuning NYS
                    // Kalau mau pake gambar asli, uncomment baris bawah:
                    // sprite: { texture: tennisBallTexture, xScale: size/1024, yScale: size/1024 }
                }
            }
        );
        Composite.add(world, ball);
    }

    // Spawn 15 balls
    for (let i = 0; i < 15; i++) {
        setTimeout(addBall, i * 200);
    }

    // Add Mouse Interaction (Biar bisa dilempar-lempar)
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    Composite.add(world, mouseConstraint);

    // Keep the mouse in sync with rendering
    render.mouse = mouse;

    // Run the engine
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Handle Resize
    window.addEventListener('resize', () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
        Matter.Body.setPosition(rightWall, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
    });
}

// --- ROUTING & RENDERING ---
function routeTo(page) {
    window.scrollTo(0, 0);
    if (page === 'home') renderHome();
    else if (page === 'shop') renderShop();
    else if (page === 'projects') renderProjects();
    else if (page === 'about') renderAbout();
}

function renderHome() {
    app.innerHTML = `
        <div class="min-h-[calc(100vh-140px)] bg-off-white flex flex-col pt-10">
            <!-- Header Besar -->
            <div class="px-[10px] lg:px-[20px] w-full z-20 relative pointer-events-none">
                <div class="w-full border-x-2 border-t-2 border-black bg-off-white/80 backdrop-blur-sm">
                    <div class="px-[10px] lg:px-[1em] pt-[20px] pb-[40px]">
                        <h1 class="font-title uppercase text-[10vw] leading-[0.85] tracking-[-0.05em] text-white text-stroke-2 select-none break-words">
                            New York <br class="block" />
                            Sunshine Design <br class="block" /> 
                            INC.
                        </h1>
                    </div>
                </div>
            </div>

            <!-- Grid Menu -->
            <div class="px-[10px] lg:px-[20px] w-full z-20 relative">
                <div class="border-2 border-black bg-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px]">
                    ${['Shop', 'Saw', 'Design', 'Archive'].map(item => `
                        <div onclick="routeTo('${item === 'Saw' ? 'projects' : item === 'Design' ? 'about' : 'shop'}')" 
                             class="relative bg-off-white hover:bg-nys-yellow transition-colors duration-200 min-h-[150px] lg:min-h-[25vh] flex flex-col justify-start overflow-hidden cursor-pointer group">
                            ${getCrossSvg()}
                            <div class="flex items-start justify-start w-full h-full relative p-[0.5em] z-20">
                                <span class="font-title text-[30px] md:text-[40px] uppercase tracking-[-0.05em] leading-[0.8] text-black">
                                ${item}
                                <span class="block w-3 h-3 bg-nys-yellow rounded-full border border-black mt-2"></span>
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${getFooterHtml()}
            
            <!-- Big S Logo -->
            <div class="w-full h-[300px] border-t-2 border-black mt-10 relative overflow-hidden flex items-center justify-center">
                 <span class="font-title text-[400px] leading-none text-off-white text-stroke-2 opacity-50 select-none">S</span>
            </div>
        </div>
    `;
}

function renderShop() {
    const productsHtml = PRODUCTS.map(product => `
        <div class="bg-white relative group flex flex-col justify-between h-full hover:bg-off-white transition-colors border-b-2 border-black">
            ${getCrossSvg()}
            <div class="relative w-full aspect-[3/4] border-b-2 border-black bg-gray-50 overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" loading="lazy" />
            </div>
            <div class="p-3 flex flex-col flex-1 gap-4 z-30 relative">
                <div>
                    <h3 class="font-mono font-bold uppercase text-xs leading-tight tracking-tight mb-2">${product.name}</h3>
                    <span class="font-mono text-xs font-bold bg-black text-white px-2 py-1 inline-block">$${product.price}</span>
                </div>
                <button onclick="addToCart('${product.id}')" class="mt-auto w-full bg-white hover:bg-black hover:text-white text-black border-2 border-black py-2 font-mono font-bold uppercase text-[10px] tracking-wider transition-colors">
                    Add To Cart
                </button>
            </div>
        </div>
    `).join('');

    app.innerHTML = `
        <div class="min-h-screen bg-off-white pb-20 flex flex-col w-full">
            <div class="px-[10px] lg:px-[20px] mb-8 w-full mt-8">
                <div class="border-2 border-black bg-white p-4">
                    <h1 class="font-title text-6xl uppercase tracking-tighter leading-[0.8]">Shop</h1>
                </div>
            </div>
            <div class="px-[10px] lg:px-[20px] mb-[20px] flex-1 w-full">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-black border-2 border-black">
                    ${productsHtml}
                </div>
            </div>
            ${getFooterHtml()}
        </div>
    `;
}

// (Fungsi renderProjects dan renderAbout sama seperti sebelumnya, disederhanakan)
function renderProjects() {
     app.innerHTML = `<div class="p-10 font-title text-4xl">PROJECTS PAGE (SAW)</div>`;
}
function renderAbout() {
     app.innerHTML = `<div class="p-10 font-title text-4xl">DESIGN / ABOUT PAGE</div>`;
}

// --- LOGIC CART & MENU ---
function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    menuText.innerText = isMenuOpen ? "CLOSE" : "MENU";
    dropdownMenu.classList.toggle('hidden', !isMenuOpen);
    
    if (isMenuOpen && menuLinksContainer.innerHTML === '') {
        menuLinksContainer.innerHTML = MENU_ITEMS.map(item => `
            <div onclick="routeTo('${item.path}'); toggleMenu();" 
                 class="bg-white hover:bg-nys-yellow cursor-pointer p-3 border-b border-black last:border-0">
                <span class="font-mono text-xs font-bold uppercase">${item.label}</span>
            </div>
        `).join('');
    }
}

function toggleCart(open) {
    if (open) {
        cartSidebar.classList.remove('translate-x-full');
        cartOverlay.classList.remove('hidden');
        renderCartItems();
    } else {
        cartSidebar.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
    }
}

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    updateCartCount();
    toggleCart(true);
}

function updateCartCount() {
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);
    cartCountEl.innerText = `(${count})`;
    cartCountEl.classList.toggle('opacity-0', count === 0);
}

function renderCartItems() {
    // Logic render cart items sederhana
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="flex justify-between border-b border-black pb-2">
            <span>${item.name} (${item.quantity})</span>
            <span>$${item.price * item.quantity}</span>
        </div>
    `).join('');
    cartTotalEl.innerText = '$' + cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
}

// --- EVENT LISTENERS ---
menuBtn.addEventListener('click', toggleMenu);
cartBtn.addEventListener('click', () => toggleCart(true));
closeCartBtn.addEventListener('click', () => toggleCart(false));
cartOverlay.addEventListener('click', () => toggleCart(false));

// --- INIT ---
renderHome();
window.onload = initPhysics; // Jalanin physics pas load