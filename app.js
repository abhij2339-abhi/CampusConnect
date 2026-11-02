// Categories
const CATEGORIES = [
  { name: 'All', icon: '✨' }, { name: 'Books', icon: '📚' },
  { name: 'Electronics', icon: '🎧' }, { name: 'Calculators', icon: '🧮' },
  { name: 'Stationery', icon: '✏️' }, { name: 'Cycles', icon: '🚲' }
];

// Sample products (demo ke liye). Baad mein sell page se asli products judenge.
const SEED = [
  { id: 1, title: 'Engineering Mathematics Book', category: 'Books', price: 250, condition: 'Good', emoji: '📘' },
  { id: 2, title: 'Casio fx-991EX Calculator', category: 'Calculators', price: 700, condition: 'Like new', emoji: '🧮' },
  { id: 3, title: 'Hero Sprint Cycle', category: 'Cycles', price: 3200, condition: 'Used', emoji: '🚲' },
  { id: 4, title: 'Boat Wired Earphones', category: 'Electronics', price: 300, condition: 'Good', emoji: '🎧' },
  { id: 5, title: 'Drawing Kit + Mini Drafter', category: 'Stationery', price: 350, condition: 'Like new', emoji: '📐' },
  { id: 6, title: 'Circuit Theory Notes', category: 'Books', price: 120, condition: 'Good', emoji: '📓' },
  { id: 7, title: 'Arduino Starter Kit', category: 'Electronics', price: 900, condition: 'Like new', emoji: '🔌' },
  { id: 8, title: 'Study Table Lamp', category: 'Electronics', price: 400, condition: 'Good', emoji: '💡' }
];

// Products ko localStorage se lo (browser ka chhota database)
function getProducts() {
  const data = localStorage.getItem('cc_products');
  if (!data) {
    localStorage.setItem('cc_products', JSON.stringify(SEED));
    return SEED;
  }
  return JSON.parse(data);
}

let activeCat = 'All';

function renderCategories() {
  const box = document.getElementById('categories');
  box.innerHTML = CATEGORIES.map(c =>
    `<button class="chip ${c.name === activeCat ? 'active' : ''}" data-cat="${c.name}">${c.icon} ${c.name}</button>`
  ).join('');
  box.querySelectorAll('.chip').forEach(btn => {
    btn.onclick = () => { activeCat = btn.dataset.cat; renderCategories(); renderProducts(); };
  });
}

function renderProducts() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const list = getProducts().filter(p =>
    (activeCat === 'All' || p.category === activeCat) &&
    p.title.toLowerCase().includes(q)
  );
  document.getElementById('productGrid').innerHTML = list.length
    ? list.map((p, i) => `
      <a href="product.html?id=${p.id}" class="card" style="animation-delay:${i * 0.06}s">
        <div class="thumb">${p.image ? `<img src="${p.image}" alt="">` : (p.emoji || '📦')}</div>
        <div class="card-body">
          <h3>${p.sold ? '🔴 ' : ''}${p.title}</h3>
          <span class="tag">${p.category} · ${p.condition}</span>
          <div class="price">₹${p.price}</div>
        </div>
      </a>`).join('')
    : '<p class="empty">Koi product nahi mila 😕</p>';
}

// Numbers ko 0 se count karke dikhana
function countUp(id, target) {
  const el = document.getElementById(id);
  let n = 0;
  const t = setInterval(() => {
    n++; el.textContent = n;
    if (n >= target) clearInterval(t);
  }, 80);
}

// Sirf homepage par chalao
if (document.getElementById('productGrid')) {
  renderCategories();
  renderProducts();
  countUp('statListings', getProducts().length);
  countUp('statCats', CATEGORIES.length - 1);

  document.getElementById('searchInput').addEventListener('input', renderProducts);
  document.getElementById('searchBtn').onclick = () =>
    document.getElementById('products').scrollIntoView();
}

// ===== AUTH (signup / login) =====
function getUsers() {
  return JSON.parse(localStorage.getItem('cc_users') || '[]');
}
function currentUser() {
  return JSON.parse(localStorage.getItem('cc_user') || 'null');
}
function logout() {
  localStorage.removeItem('cc_user');
  location.href = 'index.html';
}

// Navbar mein Login button ki jagah naam + Logout dikhana
function updateNav() {
  const link = document.getElementById('authLink');
  const u = currentUser();
  if (link && u) {
    link.textContent = 'Logout (' + u.name.split(' ')[0] + ')';
    link.href = '#';
    link.onclick = e => { e.preventDefault(); logout(); };
  }
}
updateNav();

// Sirf login page par chalega
if (document.getElementById('loginForm')) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Login / Signup tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.tab === 'login';
      loginForm.style.display = isLogin ? 'block' : 'none';
      signupForm.style.display = isLogin ? 'none' : 'block';
    };
  });

  function showMsg(id, text, ok) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'ok' : 'err');
  }

  // Signup
  signupForm.onsubmit = e => {
    e.preventDefault();
    const name = document.getElementById('suName').value.trim();
    const email = document.getElementById('suEmail').value.trim().toLowerCase();
    const phone = document.getElementById('suPhone').value.trim();
    const pass = document.getElementById('suPass').value;

    if (!name || !email || !phone || !pass) return showMsg('signupMsg', 'Saari details bharo.');
    if (pass.length < 6) return showMsg('signupMsg', 'Password kam se kam 6 characters ka rakho.');
    const users = getUsers();
    if (users.find(u => u.email === email)) return showMsg('signupMsg', 'Ye email pehle se registered hai.');

    const user = { id: Date.now(), name, email, phone, pass };
    users.push(user);
    localStorage.setItem('cc_users', JSON.stringify(users));
    localStorage.setItem('cc_user', JSON.stringify(user));
    showMsg('signupMsg', 'Account ban gaya! Redirect ho raha hai...', true);
    setTimeout(() => location.href = 'index.html', 900);
  };

  // Login
  loginForm.onsubmit = e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;
    const user = getUsers().find(u => u.email === email && u.pass === pass);

    if (!user) return showMsg('loginMsg', 'Email ya password galat hai.');
    localStorage.setItem('cc_user', JSON.stringify(user));
    showMsg('loginMsg', 'Login ho gaya! Redirect ho raha hai...', true);
    setTimeout(() => location.href = 'index.html', 900);
  };
}

// ===== SELL PAGE =====
function initSell() {
  const user = currentUser();
  if (!user) {
    alert('Pehle login karo, phir product daal sakte ho.');
    location.href = 'login.html';
    return;
  }

  let imageData = '';
  const fileInput = document.getElementById('pImage');
  const preview = document.getElementById('preview');
  const msg = document.getElementById('sellMsg');

  function showMsg(text, ok) {
    msg.textContent = text;
    msg.className = 'msg ' + (ok ? 'ok' : 'err');
  }

  // Photo ko chhota karke save karna (taaki browser ki storage na bhare)
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 600 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        imageData = canvas.toDataURL('image/jpeg', 0.7);
        preview.src = imageData;
        preview.style.display = 'block';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  document.getElementById('sellForm').onsubmit = e => {
    e.preventDefault();
    const title = document.getElementById('pTitle').value.trim();
    const price = document.getElementById('pPrice').value;

    if (!title || price === '') return showMsg('Naam aur price zaroor bharo.');

    const product = {
      id: Date.now(),
      title,
      category: document.getElementById('pCategory').value,
      price: Number(price),
      condition: document.getElementById('pCondition').value,
      spot: document.getElementById('pSpot').value,
      description: document.getElementById('pDesc').value.trim(),
      image: imageData,
      sellerId: user.id,
      sellerName: user.name,
      sellerPhone: user.phone,
      sold: false
    };

    try {
      const list = getProducts();
      list.unshift(product);
      localStorage.setItem('cc_products', JSON.stringify(list));
      showMsg('Listing live ho gayi! 🎉', true);
      setTimeout(() => location.href = 'index.html', 900);
    } catch (err) {
      showMsg('Storage full ho gayi. Chhoti photo try karo.');
    }
  };
}

if (document.getElementById('sellForm')) initSell();


// ===== PRODUCT DETAIL PAGE =====
// Text ko safe banata hai (koi galat code na chal jaye)
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function initProduct() {
  const id = Number(new URLSearchParams(location.search).get('id'));
  const p = getProducts().find(x => x.id === id);
  const box = document.getElementById('productDetail');

  if (!p) {
    box.innerHTML = '<p class="empty">Product nahi mila 😕 <a href="index.html" class="grad">Home par jao</a></p>';
    return;
  }

  box.innerHTML = `
    <div class="detail-img">${p.image ? `<img src="${p.image}" alt="">` : (p.emoji || '📦')}</div>
    <div class="detail-info">
      ${p.sold ? '<span class="sold-badge">SOLD</span>' : ''}
      <h1>${esc(p.title)}</h1>
      <div class="detail-price">₹${esc(p.price)}</div>
      <div class="meta">
        <span class="pill">📂 ${esc(p.category)}</span>
        <span class="pill">✨ ${esc(p.condition)}</span>
        <span class="pill">📍 Meet at: ${esc(p.spot || 'Campus')}</span>
      </div>
      <p class="detail-desc">${esc(p.description || 'Seller ne koi description nahi di.')}</p>
      <div class="seller-box">Seller<b>${esc(p.sellerName || 'Campus Seller')}</b></div>
      <p class="msg" id="reqMsg"></p>
      <button class="btn wa" id="interestBtn" ${p.sold ? 'disabled' : ''}>
        ${p.sold ? 'Ye product sold ho chuka hai' : '💬 Interested – Seller se WhatsApp par baat karo'}
      </button>
    </div>`;

  const msg = document.getElementById('reqMsg');
  function showMsg(text, ok) {
    msg.textContent = text;
    msg.className = 'msg ' + (ok ? 'ok' : 'err');
  }

  document.getElementById('interestBtn').onclick = () => {
    const user = currentUser();
    if (!user) {
      alert('Pehle login karo, phir seller se connect kar paoge.');
      location.href = 'login.html';
      return;
    }
    if (user.id === p.sellerId) return showMsg('Ye tumhara apna product hai 😄');

    // Request ko save karo (dashboard mein dikhegi)
    const reqs = JSON.parse(localStorage.getItem('cc_requests') || '[]');
    if (!reqs.find(r => r.productId === p.id && r.buyerId === user.id)) {
      reqs.unshift({
        id: Date.now(),
        productId: p.id,
        productTitle: p.title,
        sellerId: p.sellerId || null,
        buyerId: user.id,
        buyerName: user.name,
        buyerPhone: user.phone,
        time: new Date().toLocaleString()
      });
      localStorage.setItem('cc_requests', JSON.stringify(reqs));
    }

    // WhatsApp kholo
    let phone = String(p.sellerPhone || '').replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;
    if (!phone) return showMsg('Request save ho gayi. (Demo product hai, seller ka number nahi hai.)', true);

    const text = `Hi ${p.sellerName || ''}, CampusConnect par maine aapka "${p.title}" (₹${p.price}) dekha. Kya ye abhi available hai?`;
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
    showMsg('Request bhej di gayi! ✅', true);
  };
}

if (document.getElementById('productDetail')) initProduct();


// ===== DASHBOARD =====
function initDashboard() {
  const user = currentUser();
  if (!user) {
    alert('Pehle login karo.');
    location.href = 'login.html';
    return;
  }
  document.getElementById('dashName').textContent = user.name.split(' ')[0];

  const saveProducts = list => localStorage.setItem('cc_products', JSON.stringify(list));
  const getReqs = () => JSON.parse(localStorage.getItem('cc_requests') || '[]');

  function render() {
    const mine = getProducts().filter(p => p.sellerId === user.id);
    const reqs = getReqs();
    const received = reqs.filter(r => r.sellerId === user.id);
    const sent = reqs.filter(r => r.buyerId === user.id);

    document.getElementById('dsListings').textContent = mine.length;
    document.getElementById('dsReceived').textContent = received.length;
    document.getElementById('dsSent').textContent = sent.length;

    // Meri listings
    document.getElementById('myListings').innerHTML = mine.length
      ? mine.map(p => `
        <div class="item">
          <div class="item-thumb">${p.image ? `<img src="${p.image}" alt="">` : (p.emoji || '📦')}</div>
          <div class="item-info">
            <b>${esc(p.title)}</b>
            <span>₹${esc(p.price)} · ${esc(p.category)} · ${p.sold ? '🔴 Sold' : '🟢 Available'}</span>
          </div>
          <div class="item-actions">
            <a class="mini" href="product.html?id=${p.id}">View</a>
            <button class="mini" data-action="toggle" data-id="${p.id}">${p.sold ? 'Available karo' : 'Sold mark karo'}</button>
            <button class="mini danger" data-action="delete" data-id="${p.id}">Delete</button>
          </div>
        </div>`).join('')
      : '<p class="dash-empty">Abhi koi listing nahi hai. <a href="sell.html" class="grad">Pehla product daalo</a></p>';

    // Mujhe aayi requests
    document.getElementById('receivedReqs').innerHTML = received.length
      ? received.map(r => {
          let ph = String(r.buyerPhone || '').replace(/\D/g, '');
          if (ph.length === 10) ph = '91' + ph;
          const text = encodeURIComponent(`Hi ${r.buyerName}, aapne CampusConnect par "${r.productTitle}" mein interest dikhaya tha. Kab aur kahan mil sakte hain?`);
          return `
          <div class="item">
            <div class="item-info">
              <b>${esc(r.buyerName)} ko "${esc(r.productTitle)}" chahiye</b>
              <span>📞 ${esc(r.buyerPhone)} · ${esc(r.time)}</span>
            </div>
            <div class="item-actions">
              <a class="mini green" target="_blank" href="https://wa.me/${ph}?text=${text}">WhatsApp karo</a>
            </div>
          </div>`;
        }).join('')
      : '<p class="dash-empty">Abhi tak koi request nahi aayi.</p>';

    // Meri bheji hui requests
    document.getElementById('sentReqs').innerHTML = sent.length
      ? sent.map(r => `
        <div class="item">
          <div class="item-info">
            <b>${esc(r.productTitle)}</b>
            <span>${esc(r.time)}</span>
          </div>
          <div class="item-actions">
            <a class="mini" href="product.html?id=${r.productId}">Product dekho</a>
          </div>
        </div>`).join('')
      : '<p class="dash-empty">Tumne abhi kisi product mein interest nahi dikhaya.</p>';
  }

  // Sold mark karna / Delete (ek hi jagah se sab buttons sambhalte hain)
  document.getElementById('myListings').addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    let list = getProducts();

    if (btn.dataset.action === 'toggle') {
      list = list.map(p => p.id === id ? { ...p, sold: !p.sold } : p);
    } else if (btn.dataset.action === 'delete') {
      if (!confirm('Ye listing delete kar dein?')) return;
      list = list.filter(p => p.id !== id);
    }
    saveProducts(list);
    render();
  });

  render();
}

if (document.getElementById('myListings')) initDashboard();