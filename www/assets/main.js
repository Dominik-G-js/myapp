// Minimal frontend script for demo
document.addEventListener('DOMContentLoaded', function(){
  // Hero reveal animation
  const hero = document.querySelector('.hero');
  if (hero) {
    const onVisible = () => hero.classList.add('is-visible');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { onVisible(); io.disconnect(); } });
      }, {threshold: 0.2});
      io.observe(hero);
    } else {
      onVisible();
    }
  }

  // Quickview modal
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-quickview]');
    if (!el) return;
    e.preventDefault();
    const id = el.getAttribute('data-quickview');
    // fetch product info from a small endpoint? We'll build inline modal from DOM
    const card = document.querySelector(`.product-card [data-quickview="${id}"]`);
    const title = card ? card.closest('.product-card').querySelector('.product-title').innerText : 'Produkt';
    const price = card ? card.closest('.product-card').querySelector('.price').innerText : '';
    openQuickview(title, price);
  });

  function openQuickview(title, price) {
    let modal = document.querySelector('.qv-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'qv-modal';
      modal.innerHTML = `<div class="qv-box"><button class="qv-close">×</button><div class="qv-body"></div></div>`;
      document.body.appendChild(modal);
      modal.querySelector('.qv-close').addEventListener('click', () => modal.remove());
    }
    modal.querySelector('.qv-body').innerHTML = `<h3>${title}</h3><p class="price">${price}</p>`;
  }

  // Enhanced quickview: read data attributes from product-card
  document.querySelectorAll('[data-quickview]').forEach(el => {
    el.addEventListener('click', function(e){
      e.preventDefault();
      const card = this.closest('.product-card');
      if (!card) return;
      const title = card.getAttribute('data-title');
      const price = card.getAttribute('data-price');
      const desc = card.getAttribute('data-desc');
      const img = card.getAttribute('data-img');
      const addUrl = card.getAttribute('data-add-url');
      let modal = document.querySelector('.qv-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.className = 'qv-modal';
        modal.innerHTML = `<div class="qv-box"><button class="qv-close">×</button><div class="qv-body"></div></div>`;
        document.body.appendChild(modal);
        modal.querySelector('.qv-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.remove();
        });
      }
      modal.querySelector('.qv-body').innerHTML = `
        <div class="quickview-content">
          <div class="quickview-image">
            <img src="${img}" alt="${title}" loading="lazy">
          </div>
          <div class="quickview-details">
            <h3>${title}</h3>
            <p class="quickview-description">${desc}</p>
            <div class="quickview-price">${price}</div>
            <div class="quickview-actions">
              <a class="btn btn-primary ajax-add" href="#" data-add-url="${addUrl}">
                🛒 Přidat do košíku
              </a>
              <a class="btn btn-secondary" href="/eshop/product/detail?id=${card.getAttribute('data-id')}">
                📖 Zobrazit detail
              </a>
            </div>
          </div>
        </div>`;
    });
  });

  // AJAX add to cart from quickview
  document.body.addEventListener('click', function(e){
    const btn = e.target.closest('.ajax-add');
    if (!btn) return;
    e.preventDefault();
    const url = btn.getAttribute('data-add-url');
    
    // Extract product ID from URL
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const id = urlParams.get('id');
    
    console.log('Adding to cart:', {url, id}); // DEBUG
    
    // Try Nette endpoint first (send X-Requested-With). If it doesn't return JSON, fall back to simple PHP endpoint.
    const tryNette = () => {
      // Create form data for POST
      const formData = new FormData();
      formData.append('id', id);
      
      console.log('Trying Nette endpoint:', url); // DEBUG
      
      return fetch(url, {
        method: 'POST', 
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: formData
      })
        .then(r => r.text().then(text => ({ok: r.ok, text})))
        .then(({ok, text}) => {
          console.log('Nette response:', {ok, text}); // DEBUG
          try {
            const data = JSON.parse(text);
            return data;
          } catch (e) {
            // not JSON -> signal failure
            console.log('Not JSON response, trying fallback'); // DEBUG
            return null;
          }
        }).catch((err) => {
          console.log('Nette request failed:', err); // DEBUG
          return null;
        });
    };

    tryNette().then(data => {
      if (data && data.success) {
        const el = document.querySelector('.site-header .cart-count');
        if (el) el.textContent = data.count;
        const modal = document.querySelector('.qv-modal'); if (modal) modal.remove();
        showToast('Produkt přidán do košíku');
        return;
      }
             // fallback to php endpoint
       const ajaxUrl = '/add-to-cart.php';
       const formData = new FormData();
       formData.append('id', id);
       fetch(ajaxUrl, {
         method: 'POST', 
         headers: {'X-Requested-With': 'XMLHttpRequest'},
         body: formData
       })
         .then(r => r.json())
         .then(data => {
           if (data.success) {
             const el = document.querySelector('.site-header .cart-count');
             if (el) el.textContent = data.count;
             const modal = document.querySelector('.qv-modal'); if (modal) modal.remove();
             showToast('Produkt přidán do košíku');
           }
         });
    });
  });

  // Intercept product add form submissions (detail page) and send to fallback via AJAX
  document.addEventListener('submit', function(e){
    const form = e.target;
    if (form && form.tagName === 'FORM' && form.getAttribute('action') && form.getAttribute('action').includes('/eshop/product/add')) {
      e.preventDefault();
      const formData = new FormData(form);
      const id = formData.get('id');
      const qty = parseInt(formData.get('qty') || '1', 10) || 1; // získej množství z formuláře
      
      // Try Nette endpoint first
      const url = form.getAttribute('action');
      const netteFormData = new FormData();
      netteFormData.append('id', id);
      netteFormData.append('qty', qty); // poslat i qty
      
      fetch(url, {
        method: 'POST', 
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: netteFormData
      })
        .then(r => r.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            return null;
          }
        }))
        .then(data => {
          if (data && data.success) {
            const el = document.querySelector('.site-header .cart-count');
            if (el) el.textContent = data.count;
            showToast('Produkt přidán do košíku');
            return;
          }
          // fallback to php endpoint
          const fallbackFormData = new FormData();
          fallbackFormData.append('id', id);
          fallbackFormData.append('qty', qty); // poslat i qty ve fallbacku
          return fetch('/add-to-cart.php', {
            method: 'POST', 
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            body: fallbackFormData
          }).then(r => r.json());
        })
        .then(data => {
          if (data && data.success) {
            const el = document.querySelector('.site-header .cart-count');
            if (el) el.textContent = data.count;
            showToast('Produkt přidán do košíku');
          }
        });
    }
  });

  // Pixel perfect toast
  function showToast(msg, type = 'success'){
    let t = document.querySelector('.site-toast');
    if (!t) { 
      t = document.createElement('div'); 
      t.className = 'site-toast'; 
      document.body.appendChild(t); 
    }
    
    t.textContent = msg;
    t.className = `site-toast ${type}`;
    
    // Force reflow for smooth animation
    t.offsetHeight;
    
    t.classList.add('show');
    
    setTimeout(() => {
      t.classList.remove('show');
    }, 3000);
  }

  // Cart drawer open/close and populate
  const cartToggle = document.querySelector('.cart-toggle');
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartClose = document.querySelector('.cart-drawer-close');
  const cartItemsNode = document.querySelector('.cart-items');
  const cartTotalNode = document.querySelector('.cart-total');

  function openDrawer() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    
    // Add staggered animation delay
    setTimeout(() => {
      fetch('/eshop/cart/summary')
        .then(r => r.json())
        .then(data => {
          cartItemsNode.innerHTML = '';
          data.items.forEach((it, index) => {
            const div = document.createElement('div');
            div.className = 'item';
            div.style.animationDelay = `${index * 0.1}s`;
            div.innerHTML = `
              <div style="flex:1">
                <div class="name">${it.name}</div>
                <div class="meta">${it.qty} × ${it.price} Kč</div>
              </div>
              <div class="sum">${it.sum} Kč</div>
              <div>
                <a href="#" class="remove-item" data-id="${it.id}">
                  🗑️ odstranit
                </a>
              </div>`;
            cartItemsNode.appendChild(div);
          });
          cartTotalNode.textContent = 'Celkem: ' + data.total + ' Kč';
        });
    }, 150);
  }

  function closeDrawer() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
  }

  cartToggle?.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
  cartOverlay?.addEventListener('click', closeDrawer);
  cartClose?.addEventListener('click', closeDrawer);

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  navToggle?.addEventListener('click', () => {
    if (mainNav.style.display === 'block') {
      mainNav.style.display = '';
    } else {
      mainNav.style.display = 'block';
    }
  });

  // handle remove item from drawer
  document.body.addEventListener('click', function(e){
    const rem = e.target.closest('.remove-item');
    if (!rem) return;
    e.preventDefault();
    const id = rem.getAttribute('data-id');
    
    console.log('Removing from cart:', id); // DEBUG
    
    // Create form data for POST
    const formData = new FormData();
    formData.append('id', id);
    
    fetch(`/eshop/cart/remove`, {
      method: 'POST', 
      headers: {'X-Requested-With': 'XMLHttpRequest'},
      body: formData
    })
      .then(r => r.text().then(text => {
        console.log('Remove response:', {status: r.status, text}); // DEBUG
        try {
          return JSON.parse(text);
        } catch (e) {
          console.log('Remove response not JSON:', text); // DEBUG
          throw new Error('Not JSON response');
        }
      }))
      .then(data => {
        console.log('Remove success:', data); // DEBUG
        if (data.success) {
          // update drawer UI
          openDrawer();
          // update header count
          const el = document.querySelector('.site-header .cart-count');
          if (el) el.textContent = data.count;
        }
      })
      .catch(err => {
        console.error('Remove from cart failed:', err);
        // fallback: reload page
        window.location.reload();
      });
  });

  // Quantity controls
  document.body.addEventListener('click', function(e) {
    const qtyBtn = e.target.closest('.qty-btn');
    if (!qtyBtn) return;
    
    const action = qtyBtn.getAttribute('data-action');
    const input = qtyBtn.parentNode.querySelector('.qty-input');
    let value = parseInt(input.value) || 1;
    
    if (action === 'increase') {
      value = Math.min(value + 1, 99);
    } else if (action === 'decrease') {
      value = Math.max(value - 1, 1);
    }
    
    input.value = value;
    
    // Add animation
    qtyBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      qtyBtn.style.transform = '';
    }, 150);
  });

  // View controls for product grid
  document.body.addEventListener('click', function(e) {
    const viewBtn = e.target.closest('.view-btn');
    if (!viewBtn) return;
    
    const view = viewBtn.getAttribute('data-view');
    const grid = document.querySelector('.product-grid');
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    viewBtn.classList.add('active');
    
    // Update grid view
    if (view === 'list') {
      grid.style.gridTemplateColumns = '1fr';
      grid.classList.add('list-view');
    } else {
      grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
      grid.classList.remove('list-view');
    }
  });

  // Theme toggle: persist in localStorage and on <html data-theme>
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const rootEl = document.documentElement;
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      rootEl.setAttribute('data-theme', 'dark');
    }
  } catch (_) {}
  themeToggle?.addEventListener('click', () => {
    const isDark = rootEl.getAttribute('data-theme') === 'dark';
    const next = isDark ? '' : 'dark';
    if (next) rootEl.setAttribute('data-theme', next); else rootEl.removeAttribute('data-theme');
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (_) {}
  });

  // Flash sale countdown
  const countdownBox = document.querySelector('.flash-sales');
  if (countdownBox) {
    const targetTs = Number(countdownBox.getAttribute('data-countdown-target')) * 1000;
    const ddNode = document.querySelector('#flash-countdown [data-dd]');
    const hhNode = document.querySelector('#flash-countdown [data-hh]');
    const mmNode = document.querySelector('#flash-countdown [data-mm]');
    const ssNode = document.querySelector('#flash-countdown [data-ss]');
    function pad(n){ return String(n).padStart(2,'0'); }
    function tick(){
      const now = Date.now();
      let diff = Math.max(0, targetTs - now);
      const sec = Math.floor(diff / 1000) % 60;
      const min = Math.floor(diff / (1000*60)) % 60;
      const hr  = Math.floor(diff / (1000*60*60)) % 24;
      const day = Math.floor(diff / (1000*60*60*24));
      if (ddNode) ddNode.textContent = pad(day);
      if (hhNode) hhNode.textContent = pad(hr);
      if (mmNode) mmNode.textContent = pad(min);
      if (ssNode) ssNode.textContent = pad(sec);
    }
    tick();
    setInterval(tick, 1000);
  }
});



// Mark current page in nav for better orientation
try {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
    if (linkPath === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
} catch (_) {}


