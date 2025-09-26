/* script.js - site interactions, form validation, lightbox, language toggle, shop functionality */

document.addEventListener('DOMContentLoaded', function () {
  // Update copyright year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Animated brand text loop
  const brandText = document.querySelector('.animated-text');
  if (brandText) {
    const styles = ['scale(1.05)', 'rotate(1deg)', 'scale(1.03)', 'rotate(-1deg)'];
    let i = 0;
    setInterval(() => {
      brandText.style.transform = styles[i % styles.length];
      brandText.style.transition = 'transform 0.4s ease';
      i++;
    }, 2000);
  }

  // Lightbox for gallery links
  document.querySelectorAll('.gallery-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const url = this.getAttribute('href');
      const caption = this.getAttribute('data-caption') || '';
      const img = document.getElementById('lightboxImage');
      const cap = document.getElementById('lightboxCaption');
      if (img && cap) {
        img.src = url;
        img.alt = caption;
        cap.textContent = caption;
        const modal = new bootstrap.Modal(document.getElementById('lightboxModal'));
        modal.show();
      }
    });
  });

  // Service modal details
  window.openServiceModal = function (e) {
    const serviceName = e.currentTarget.getAttribute('data-service') || 'Service';
    const titleEl = document.getElementById('serviceModalTitle');
    const bodyEl = document.getElementById('serviceModalBody');
    if (!titleEl || !bodyEl) return;
    titleEl.textContent = serviceName;
    bodyEl.innerHTML = `
      <p><strong>Process:</strong></p>
      <ol>
        <li>Initial diagnosis and estimate.</li>
        <li>Owner approval and part procurement (if needed).</li>
        <li>Repair / firmware / replacement.</li>
        <li>Testing and handover with short warranty.</li>
      </ol>
      <p><strong>Warranty:</strong> Parts warranty varies by service (typically 30-90 days). Keep receipt.</p>
      <p><em>Legal note:</em> IMEI/network services require confirmation of legality before proceeding.</p>
    `;
    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    modal.show();
  };

  // Contact form validation and submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.classList.add('was-validated');
        return;
      }
      const alertEl = document.getElementById('formAlert');
      alertEl.className = 'alert alert-info';
      alertEl.textContent = 'Sending...';
      alertEl.classList.remove('d-none');
      try {
        const endpoint = '/api/contact' in window ? '/api/contact' : '/contact.php';
        const resp = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(contactForm),
          credentials: 'same-origin'
        });
        if (resp.ok) {
          alertEl.className = 'alert alert-success';
          alertEl.textContent = 'Message sent. We will contact you shortly.';
          contactForm.reset();
          contactForm.classList.remove('was-validated');
          if (window.gtag) gtag('event', 'contact_form_submit', { 'method': 'website' });
        } else {
          throw new Error('Server returned an error');
        }
      } catch (err) {
        alertEl.className = 'alert alert-danger';
        alertEl.textContent = 'Unable to send message. Please try WhatsApp or call directly.';
      }
    });
  }

  // Shop functionality
  let cart = [];
  function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (cartItems && cartTotal) {
      cartItems.innerHTML = '';
      let total = 0;
      cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const li = document.createElement('li');
        li.innerHTML = `
          ${item.name} - PKR ${item.price} x ${item.quantity}
          <div>
            <button onclick="updateQuantity(${index}, -1)">-</button>
            <button onclick="updateQuantity(${index}, 1)">+</button>
          </div>
        `;
        cartItems.appendChild(li);
      });
      cartTotal.textContent = total.toFixed(2);
    }
  }

  window.addToCart = function (name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }
    updateCartDisplay();
    try { localStorage.setItem('cart', JSON.stringify(cart)); } catch(e) {}
  };

  window.updateQuantity = function (index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    updateCartDisplay();
    try { localStorage.setItem('cart', JSON.stringify(cart)); } catch(e) {}
  };

  // Checkout form submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!checkoutForm.checkValidity()) {
        checkoutForm.classList.add('was-validated');
        return;
      }
      const formData = new FormData(checkoutForm);
      let orderDetails = `Order Details:\n`;
      cart.forEach(item => {
        orderDetails += `${item.name} - PKR ${item.price} x ${item.quantity}\n`;
      });
      orderDetails += `Total: PKR ${document.getElementById('cart-total').textContent}\n`;
      formData.forEach((value, key) => {
        orderDetails += `${key}: ${value}\n`;
      });
      const whatsappUrl = `https://wa.me/923466523823?text=${encodeURIComponent(orderDetails)}`;
      window.open(whatsappUrl, '_blank');
      cart = [];
      updateCartDisplay();
      checkoutForm.reset();
      checkoutForm.classList.remove('was-validated');
    });
  }

  // Language toggle
  window.toggleLanguage = function (lang) {
    const strings = {
      en: {
        heroSub: "Mobile Repair & Software Services since 2010 — Fast, reliable, guaranteed."
      },
      ur: {
        heroSub: "2010 سے موبائل مرمت اور سافٹ ویئر خدمات — فوری، قابل اعتماد، گارنٹی کے ساتھ۔"
      }
    };
    const sub = document.querySelector('.hero-section .lead');
    if (sub && strings[lang]) sub.textContent = strings[lang].heroSub;
    try { localStorage.setItem('lm_lang', lang); } catch(e) {}
  };

  // Apply saved language and cart
  try {
    const savedLang = localStorage.getItem('lm_lang');
    if (savedLang) window.toggleLanguage(savedLang);
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCartDisplay();
    }
  } catch(e) {}
});