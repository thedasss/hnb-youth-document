import QRCode from 'qrcode';
import page1 from './page-1.png';
import page2 from './page-2.png';
import page3 from './page-3.png';
import page4 from './page-4.png';

// State Management
const state = {
  activeTab: 'view-document',
  destMode: 'local', // 'local' | 'custom'
  localUrl: `${window.location.protocol}//192.168.1.2:3000`,
  customUrl: '',
  activeUrl: '',
  qrColor: '#002D62',
  currentPageIndex: 1,
  pages: [
    { num: 1, title: 'Overview & Benefits', src: page1 },
    { num: 2, title: 'Bank Value & Seylan Comparison', src: page2 },
    { num: 3, title: 'Commercial Bank Comparison & Marketing', src: page3 },
    { num: 4, title: 'Evaluation Matrix & Conclusion', src: page4 }
  ]
};

// Initialize current URL
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  state.localUrl = window.location.origin;
}
state.activeUrl = state.localUrl;

// DOM Elements
const tabBtns = document.querySelectorAll('.nav-tab');
const viewPanels = document.querySelectorAll('.view-panel');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const qrContainer = document.getElementById('qr-target-container');
const activeUrlDisplay = document.getElementById('active-url-display');
const destToggles = document.querySelectorAll('.toggle-opt');
const localUrlBox = document.getElementById('local-url-box');
const customUrlBox = document.getElementById('custom-url-box');
const customUrlInput = document.getElementById('custom-url-input');
const applyCustomUrlBtn = document.getElementById('btn-apply-custom-url');
const colorSwatches = document.querySelectorAll('.color-swatch');
const downloadPngBtn = document.getElementById('btn-download-qr-png');
const downloadSvgBtn = document.getElementById('btn-download-qr-svg');
const printStandBtn = document.getElementById('btn-print-stand');

// Modal Elements
const imageModal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const modalCaption = document.getElementById('modal-caption');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalPrevBtn = document.getElementById('modal-prev-btn');
const modalNextBtn = document.getElementById('modal-next-btn');

/* ==========================================================================
   QR CODE GENERATOR LOGIC
   ========================================================================== */

async function renderQRCode() {
  if (!qrContainer) return;
  qrContainer.innerHTML = '';

  try {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, state.activeUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: state.qrColor,
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    qrContainer.appendChild(canvas);
    if (activeUrlDisplay) {
      activeUrlDisplay.textContent = state.activeUrl;
    }
  } catch (err) {
    console.error('Error rendering QR code:', err);
    qrContainer.innerHTML = `<span style="color:red; font-size:12px;">Failed to generate QR code</span>`;
  }
}

// Download High-Res PNG
async function downloadQRPNG() {
  try {
    const dataUrl = await QRCode.toDataURL(state.activeUrl, {
      width: 1024,
      margin: 2,
      color: {
        dark: state.qrColor,
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    const link = document.createElement('a');
    link.download = `HNB_Youth_Document_QR_${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert('Failed to generate PNG: ' + err.message);
  }
}

// Download Vector SVG
async function downloadQRSVG() {
  try {
    const svgString = await QRCode.toString(state.activeUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: state.qrColor,
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `HNB_Youth_Document_QR_${Date.now()}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Failed to generate SVG: ' + err.message);
  }
}

/* ==========================================================================
   NAVIGATION & TABS
   ========================================================================== */

function switchTab(targetId) {
  state.activeTab = targetId;

  tabBtns.forEach(btn => {
    const isActive = btn.getAttribute('data-target') === targetId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  viewPanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === targetId);
  });

  if (targetId === 'view-qr') {
    renderQRCode();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    switchTab(target);
  });
});

/* ==========================================================================
   DESTINATION & COLOR CONTROLS
   ========================================================================== */

destToggles.forEach(btn => {
  btn.addEventListener('click', () => {
    destToggles.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const mode = btn.getAttribute('data-dest');
    state.destMode = mode;

    if (mode === 'local') {
      localUrlBox.classList.remove('hidden');
      customUrlBox.classList.add('hidden');
      state.activeUrl = state.localUrl;
      renderQRCode();
    } else {
      localUrlBox.classList.add('hidden');
      customUrlBox.classList.remove('hidden');
      if (state.customUrl.trim()) {
        state.activeUrl = state.customUrl.trim();
      }
      renderQRCode();
    }
  });
});

if (applyCustomUrlBtn && customUrlInput) {
  applyCustomUrlBtn.addEventListener('click', () => {
    const val = customUrlInput.value.trim();
    if (val) {
      state.customUrl = val;
      state.activeUrl = val;
      renderQRCode();
    } else {
      alert('Please enter a valid URL.');
    }
  });

  customUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      applyCustomUrlBtn.click();
    }
  });
}

colorSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    colorSwatches.forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    state.qrColor = swatch.getAttribute('data-color');
    renderQRCode();
  });
});

if (downloadPngBtn) downloadPngBtn.addEventListener('click', downloadQRPNG);
if (downloadSvgBtn) downloadSvgBtn.addEventListener('click', downloadQRSVG);
if (printStandBtn) printStandBtn.addEventListener('click', () => window.print());

/* ==========================================================================
   THEME TOGGLE (DARK / LIGHT)
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem('hnb-theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('hnb-theme', next);
  });
}

/* ==========================================================================
   ORIGINAL PAGES GALLERY & LIGHTBOX
   ========================================================================== */

function openModal(pageIndex) {
  state.currentPageIndex = pageIndex;
  const page = state.pages[pageIndex - 1];
  if (!page) return;

  modalImg.src = page.src;
  modalCaption.textContent = `Page ${page.num} of 4 — ${page.title}`;
  imageModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  imageModal.classList.add('hidden');
  document.body.style.overflow = '';
}

document.querySelectorAll('.page-card').forEach(card => {
  card.addEventListener('click', () => {
    const pageNum = parseInt(card.getAttribute('data-page'), 10);
    openModal(pageNum);
  });
});

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

imageModal.addEventListener('click', (e) => {
  if (e.target === imageModal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
    closeModal();
  }
  if (e.key === 'ArrowRight' && !imageModal.classList.contains('hidden')) {
    if (state.currentPageIndex < 4) openModal(state.currentPageIndex + 1);
  }
  if (e.key === 'ArrowLeft' && !imageModal.classList.contains('hidden')) {
    if (state.currentPageIndex > 1) openModal(state.currentPageIndex - 1);
  }
});

if (modalPrevBtn) {
  modalPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.currentPageIndex > 1) {
      openModal(state.currentPageIndex - 1);
    }
  });
}

if (modalNextBtn) {
  modalNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.currentPageIndex < 4) {
      openModal(state.currentPageIndex + 1);
    }
  });
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

initTheme();
renderQRCode();
console.log('HNB Youth Savings Account Portal & QR Generator initialized.');
