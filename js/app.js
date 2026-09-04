/**
 * Automobile Showroom Management System (ASMS)
 * Shared Core Library: Database Engine (localStorage), Auth Guard, UI Shell, Toasts
 * BCA Mini Project - Academic Year 2026-27
 */

// --- Database Keys ---
const DB_KEYS = {
  VEHICLES: 'asms_vehicles',
  CUSTOMERS: 'asms_customers',
  BOOKINGS: 'asms_bookings',
  SALES: 'asms_sales',
  SESSION: 'asms_session',
  ADMIN: 'asms_admin',
  THEME: 'asms_theme'
};

// --- Initial Demo Seed Dataset ---
const SEED_DATA = {
  admin: {
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    role: 'Showroom Manager'
  },
  vehicles: [
    {
      id: 'VEH-101',
      name: 'Tata Safari Fearless Plus Dark Edition',
      brand: 'Tata',
      model: 'Safari 2.0L Kryotec AT',
      colour: 'Oberon Black',
      fuelType: 'Diesel',
      price: 2450000,
      year: 2025,
      stock: 4,
      category: 'SUV',
      vin: 'MAT623490P2K89102'
    },
    {
      id: 'VEH-102',
      name: 'Mahindra Thar ROXX AX7L 4WD',
      brand: 'Mahindra',
      model: 'Thar ROXX 2.2L mHawk',
      colour: 'Stealth Black',
      fuelType: 'Diesel',
      price: 1890000,
      year: 2025,
      stock: 2,
      category: 'SUV',
      vin: 'MA1TX7008N3B41092'
    },
    {
      id: 'VEH-103',
      name: 'Hyundai Creta SX (O) Turbo DCT',
      brand: 'Hyundai',
      model: 'Creta 1.5L Turbo GDi',
      colour: 'Ranger Khaki',
      fuelType: 'Petrol',
      price: 1640000,
      year: 2025,
      stock: 6,
      category: 'SUV',
      vin: 'MALC148AP0M562301'
    },
    {
      id: 'VEH-104',
      name: 'Toyota Fortuner 4x2 AT Diesel',
      brand: 'Toyota',
      model: 'Fortuner 2.8L GD',
      colour: 'Platinum White Pearl',
      fuelType: 'Diesel',
      price: 3380000,
      year: 2025,
      stock: 1, // Low stock alert test
      category: 'Luxury SUV',
      vin: 'MBJ11F870R5D99812'
    },
    {
      id: 'VEH-105',
      name: 'Honda City e:HEV ZX Hybrid',
      brand: 'Honda',
      model: 'City 1.5L Atkinson Cycle',
      colour: 'Meteoroid Grey Metallic',
      fuelType: 'Hybrid',
      price: 1850000,
      year: 2025,
      stock: 5,
      category: 'Sedan',
      vin: 'MAKGM668NP4C30219'
    },
    {
      id: 'VEH-106',
      name: 'Kia Seltos X-Line Matte Graphite',
      brand: 'Kia',
      model: 'Seltos 1.5L Turbo DCT',
      colour: 'Matte Graphite',
      fuelType: 'Petrol',
      price: 1720000,
      year: 2025,
      stock: 3,
      category: 'SUV',
      vin: 'MZDFE2145P9L34918'
    },
    {
      id: 'VEH-107',
      name: 'MG ZS EV Essence 50.3kWh',
      brand: 'MG',
      model: 'ZS EV Long Range',
      colour: 'Candy White',
      fuelType: 'Electric',
      price: 2080000,
      year: 2025,
      stock: 3,
      category: 'Electric SUV',
      vin: 'LSJDA2438N8A10982'
    },
    {
      id: 'VEH-108',
      name: 'Tata Nexon EV Empowered Plus',
      brand: 'Tata',
      model: 'Nexon EV 45kWh Long Range',
      colour: 'Pristine White Dual Tone',
      fuelType: 'Electric',
      price: 1590000,
      year: 2025,
      stock: 4,
      category: 'Electric SUV',
      vin: 'MAT401928N5K21034'
    }
  ],
  customers: [
    {
      id: 'CUST-201',
      name: 'Rajesh Sharma',
      mobile: '9822019485',
      email: 'rajesh.sharma@example.com',
      address: 'Plot 42, Koregaon Park, Pune, MH',
      type: 'Individual',
      registeredDate: '2025-01-15'
    },
    {
      id: 'CUST-202',
      name: 'Pooja Deshmukh',
      mobile: '9890123456',
      email: 'pooja.deshmukh@gmail.com',
      address: 'Flat 402, Rohan Viti, Baner Road, Pune, MH',
      type: 'Individual',
      registeredDate: '2025-02-04'
    },
    {
      id: 'CUST-203',
      name: 'Vikram Malhotra',
      mobile: '9765432109',
      email: 'vikram.malhotra@techcorp.in',
      address: 'Malhotra Infotech, Viman Nagar, Pune, MH',
      type: 'Corporate',
      registeredDate: '2025-02-18'
    },
    {
      id: 'CUST-204',
      name: 'Neha Kulkarni',
      mobile: '9123456780',
      email: 'neha.kulkarni@outlook.com',
      address: '12 Shivaji Nagar, Deccan Gymkhana, Pune, MH',
      type: 'Individual',
      registeredDate: '2025-03-01'
    },
    {
      id: 'CUST-205',
      name: 'Aditya Birla Logistics LLP',
      mobile: '9988776655',
      email: 'fleet@birlalogistics.com',
      address: 'Bandra-Kurla Complex (BKC), Mumbai, MH',
      type: 'Corporate',
      registeredDate: '2025-03-12'
    }
  ],
  bookings: [
    {
      id: 'BK-501',
      customerId: 'CUST-201',
      customerName: 'Rajesh Sharma',
      customerPhone: '9822019485',
      vehicleId: 'VEH-101',
      vehicleName: 'Tata Safari Fearless Plus Dark Edition',
      vehiclePrice: 2450000,
      bookingDate: '2025-03-10',
      deliveryDate: '2025-03-25',
      advanceAmount: 100000,
      status: 'Confirmed', // Pending, Confirmed, Cancelled, Completed
      notes: 'Customer requested ceramic coating and mud flaps accessories.'
    },
    {
      id: 'BK-502',
      customerId: 'CUST-204',
      customerName: 'Neha Kulkarni',
      customerPhone: '9123456780',
      vehicleId: 'VEH-103',
      vehicleName: 'Hyundai Creta SX (O) Turbo DCT',
      vehiclePrice: 1640000,
      bookingDate: '2025-03-14',
      deliveryDate: '2025-03-28',
      advanceAmount: 50000,
      status: 'Pending',
      notes: 'Financing loan approval in progress with HDFC Bank.'
    },
    {
      id: 'BK-503',
      customerId: 'CUST-203',
      customerName: 'Vikram Malhotra',
      customerPhone: '9765432109',
      vehicleId: 'VEH-106',
      vehicleName: 'Kia Seltos X-Line Matte Graphite',
      vehiclePrice: 1720000,
      bookingDate: '2025-03-05',
      deliveryDate: '2025-03-18',
      advanceAmount: 100000,
      status: 'Confirmed',
      notes: 'Corporate lease billing requested.'
    },
    {
      id: 'BK-504',
      customerId: 'CUST-202',
      customerName: 'Pooja Deshmukh',
      customerPhone: '9890123456',
      vehicleId: 'VEH-107',
      vehicleName: 'MG ZS EV Essence 50.3kWh',
      vehiclePrice: 2080000,
      bookingDate: '2025-02-20',
      deliveryDate: '2025-03-01',
      advanceAmount: 75000,
      status: 'Completed',
      notes: 'Completed delivery and converted to sale.'
    }
  ],
  sales: [
    {
      id: 'INV-2025-001',
      customerId: 'CUST-202',
      customerName: 'Pooja Deshmukh',
      customerMobile: '9890123456',
      customerEmail: 'pooja.deshmukh@gmail.com',
      customerAddress: 'Flat 402, Rohan Viti, Baner Road, Pune, MH',
      vehicleId: 'VEH-107',
      vehicleName: 'MG ZS EV Essence 50.3kWh',
      vehicleBrand: 'MG',
      vehicleVin: 'LSJDA2438N8A10982',
      saleDate: '2025-03-01',
      basePrice: 2080000,
      discount: 40000,
      taxPercent: 5, // 5% EV GST
      taxAmount: 102000,
      netTotal: 2142000,
      paymentMethod: 'Bank Transfer (RTGS)',
      paymentStatus: 'Paid',
      salesExecutive: 'Amit Verma',
      remarks: 'Fast home AC charger installation scheduled.'
    },
    {
      id: 'INV-2025-002',
      customerId: 'CUST-205',
      customerName: 'Aditya Birla Logistics LLP',
      customerMobile: '9988776655',
      customerEmail: 'fleet@birlalogistics.com',
      customerAddress: 'Bandra-Kurla Complex (BKC), Mumbai, MH',
      vehicleId: 'VEH-102',
      vehicleName: 'Mahindra Thar ROXX AX7L 4WD',
      vehicleBrand: 'Mahindra',
      vehicleVin: 'MA1TX7008N3B41092',
      saleDate: '2025-03-08',
      basePrice: 1890000,
      discount: 30000,
      taxPercent: 18,
      taxAmount: 334800,
      netTotal: 2194800,
      paymentMethod: 'Corporate Cheque',
      paymentStatus: 'Paid',
      salesExecutive: 'Sameer Sheikh',
      remarks: 'Corporate fleet executive escort delivery.'
    },
    {
      id: 'INV-2025-003',
      customerId: 'CUST-201',
      customerName: 'Rajesh Sharma',
      customerMobile: '9822019485',
      customerEmail: 'rajesh.sharma@example.com',
      customerAddress: 'Plot 42, Koregaon Park, Pune, MH',
      vehicleId: 'VEH-105',
      vehicleName: 'Honda City e:HEV ZX Hybrid',
      vehicleBrand: 'Honda',
      vehicleVin: 'MAKGM668NP4C30219',
      saleDate: '2025-02-14',
      basePrice: 1850000,
      discount: 25000,
      taxPercent: 18,
      taxAmount: 328500,
      netTotal: 2153500,
      paymentMethod: 'Car Loan (SBI)',
      paymentStatus: 'Paid',
      salesExecutive: 'Priya Joshi',
      remarks: 'Extended 5-year warranty included.'
    }
  ]
};

// --- Storage API Helpers ---
const ASMS = {
  // Read item from localStorage with fallback
  get(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Storage Read Error:', e);
      return defaultValue;
    }
  },

  // Save item to localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage Write Error:', e);
      return false;
    }
  },

  // Initialize dataset on first run or upgrade seed version
  initDatabase() {
    const SEED_VERSION = 'v2.2_realistic_revenue';
    const currentVersion = localStorage.getItem('asms_seed_version');

    if (!localStorage.getItem(DB_KEYS.ADMIN)) {
      this.set(DB_KEYS.ADMIN, SEED_DATA.admin);
    }
    if (!localStorage.getItem(DB_KEYS.VEHICLES) || currentVersion !== SEED_VERSION) {
      this.set(DB_KEYS.VEHICLES, SEED_DATA.vehicles);
      this.set(DB_KEYS.CUSTOMERS, SEED_DATA.customers);
      this.set(DB_KEYS.BOOKINGS, SEED_DATA.bookings);
      this.set(DB_KEYS.SALES, SEED_DATA.sales);
      localStorage.setItem('asms_seed_version', SEED_VERSION);
    }
  },

  // Format compact numbers (Lakhs / Crores for realistic Indian financial display)
  formatCompact(num) {
    if (isNaN(num) || num === null) return '₹0';
    const n = Number(num);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return '₹' + n.toLocaleString('en-IN');
  },

  // Reset database back to fresh demo seed
  resetDatabase(silent = false) {
    this.set(DB_KEYS.ADMIN, SEED_DATA.admin);
    this.set(DB_KEYS.VEHICLES, SEED_DATA.vehicles);
    this.set(DB_KEYS.CUSTOMERS, SEED_DATA.customers);
    this.set(DB_KEYS.BOOKINGS, SEED_DATA.bookings);
    this.set(DB_KEYS.SALES, SEED_DATA.sales);
    localStorage.setItem('asms_seed_version', 'v2.2_realistic_revenue');
    if (!silent) {
      ASMS.toast('Database restored to clean, realistic demo records!', 'success');
      setTimeout(() => window.location.reload(), 600);
    }
  },

  // Auth session check
  checkAuth(isLoginPage = false) {
    const session = this.get(DB_KEYS.SESSION, null);
    if (isLoginPage) {
      if (session && session.isLoggedIn) {
        window.location.href = './dashboard.html';
      }
    } else {
      if (!session || !session.isLoggedIn) {
        window.location.href = './index.html';
      }
    }
  },

  // Perform Login
  login(username, password) {
    const admin = this.get(DB_KEYS.ADMIN, SEED_DATA.admin);
    if (username.trim().toLowerCase() === admin.username.toLowerCase() && password === admin.password) {
      const session = {
        isLoggedIn: true,
        username: admin.username,
        name: admin.name || 'Administrator',
        role: admin.role || 'Showroom Manager',
        loginTime: new Date().toISOString()
      };
      this.set(DB_KEYS.SESSION, session);
      return { success: true };
    }
    return { success: false, message: 'Invalid Username or Password. Use admin / admin123' };
  },

  // Logout
  logout() {
    localStorage.removeItem(DB_KEYS.SESSION);
    window.location.href = './index.html';
  },

  // Toast Notification System
  toast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Confirm Dialog Modal
  confirm(title, message, onConfirmCallback) {
    let modal = document.getElementById('asms-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'asms-confirm-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-container modal-sm">
          <div class="modal-header">
            <div class="modal-title" id="asms-confirm-title">Confirm Action</div>
            <button class="modal-close" id="asms-confirm-close">&times;</button>
          </div>
          <div class="modal-body">
            <p id="asms-confirm-msg" style="color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.5;"></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" id="asms-confirm-cancel">Cancel</button>
            <button class="btn btn-danger btn-sm" id="asms-confirm-proceed">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = document.getElementById('asms-confirm-title');
    const msgEl = document.getElementById('asms-confirm-msg');
    const proceedBtn = document.getElementById('asms-confirm-proceed');
    const cancelBtn = document.getElementById('asms-confirm-cancel');
    const closeBtn = document.getElementById('asms-confirm-close');

    titleEl.textContent = title;
    msgEl.textContent = message;

    const closeModal = () => {
      modal.classList.remove('active');
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    proceedBtn.onclick = () => {
      closeModal();
      if (typeof onConfirmCallback === 'function') {
        onConfirmCallback();
      }
    };

    modal.classList.add('active');
  },

  // Currency Formatter (e.g. ₹ 25,44,000)
  formatCurrency(num) {
    if (isNaN(num)) return '₹0';
    return '₹ ' + Number(num).toLocaleString('en-IN');
  },

  // Date Formatter
  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  },

  // Unique ID generator
  generateId(prefix = 'REC') {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${Date.now().toString().slice(-4)}${rand}`;
  },

  // Export any array of objects to CSV file
  exportToCSV(filename, rows) {
    if (!rows || !rows.length) {
      this.toast('No data available to export.', 'warning');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.toast(`Exported ${rows.length} rows to ${filename}.csv`, 'success');
    }
  },

  // Theme Initializer
  initTheme() {
    const savedTheme = localStorage.getItem(DB_KEYS.THEME) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeToggleIcon(savedTheme);
  },

  // Toggle Dark/Light Mode
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(DB_KEYS.THEME, next);
    this.updateThemeToggleIcon(next);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: next } }));
    this.toast(`Theme switched to ${next} mode`, 'info');
  },

  // Update theme toggle button icon
  updateThemeToggleIcon(theme) {
    const btn = document.getElementById('btn-theme-toggle');
    if (!btn) return;
    if (theme === 'light') {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;
      btn.setAttribute('title', 'Switch to Dark Mode (Currently Light)');
    } else {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;
      btn.setAttribute('title', 'Switch to Light Mode (Currently Dark)');
    }
  },

  // Professional Executive Automotive Brand Crest Logo
  getLogoSvg(size = 32, idPrefix = 'asms') {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" class="apex-logo-crest">
        <defs>
          <linearGradient id="${idPrefix}GradBg" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color="#1d4ed8"/>
            <stop offset="0.6" stop-color="#1e40af"/>
            <stop offset="1" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="${idPrefix}WingL" x1="24" y1="6" x2="8" y2="38" gradientUnits="userSpaceOnUse">
            <stop stop-color="#93c5fd"/>
            <stop offset="0.5" stop-color="#3b82f6"/>
            <stop offset="1" stop-color="#1d4ed8"/>
          </linearGradient>
          <linearGradient id="${idPrefix}WingR" x1="24" y1="6" x2="40" y2="38" gradientUnits="userSpaceOnUse">
            <stop stop-color="#60a5fa"/>
            <stop offset="0.5" stop-color="#2563eb"/>
            <stop offset="1" stop-color="#1e3a8a"/>
          </linearGradient>
          <linearGradient id="${idPrefix}Chrome" x1="24" y1="10" x2="24" y2="34" gradientUnits="userSpaceOnUse">
            <stop stop-color="#ffffff"/>
            <stop offset="0.75" stop-color="#e2e8f0"/>
            <stop offset="1" stop-color="#cbd5e1"/>
          </linearGradient>
          <filter id="${idPrefix}Glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#2563eb" flood-opacity="0.35"/>
          </filter>
        </defs>
        <path d="M24 4L41 11.5V26C41 35 33.5 41 24 44C14.5 41 7 35 7 26V11.5L24 4Z" fill="url(#${idPrefix}GradBg)" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>
        <path d="M24 8L10 14V25.5C10 32.5 15.5 37.2 24 40.2V8Z" fill="url(#${idPrefix}WingL)" opacity="0.95"/>
        <path d="M24 8L38 14V25.5C38 32.5 32.5 37.2 24 40.2V8Z" fill="url(#${idPrefix}WingR)"/>
        <path d="M24 11.5L32 30.5H27.5L24 22L20.5 30.5H16L24 11.5Z" fill="url(#${idPrefix}Chrome)" filter="url(#${idPrefix}Glow)"/>
        <polygon points="24,15.5 26.2,20.8 21.8,20.8" fill="#0f172a" opacity="0.45"/>
        <path d="M18.5 25H29.5" stroke="#ffffff" stroke-width="1.75" stroke-linecap="round"/>
        <path d="M24 5.5L39.5 12V14.5L24 8L8.5 14.5V12L24 5.5Z" fill="#ffffff" opacity="0.35"/>
      </svg>
    `;
  },

  // Render the persistent Shell (Sidebar + Header + Academic Project Info)
  renderShell(activePage) {
    this.initDatabase();
    this.initTheme();

    const session = this.get(DB_KEYS.SESSION, { name: 'Administrator', role: 'Showroom Manager' });
    const vehiclesCount = this.get(DB_KEYS.VEHICLES).length;
    const bookingsCount = this.get(DB_KEYS.BOOKINGS).length;

    // Sidebar DOM
    const sidebarHtml = `
      <aside class="app-sidebar" id="app-sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon-wrapper">
            ${this.getLogoSvg(34, 'side')}
          </div>
          <div class="brand-info">
            <span class="brand-name">APEX MOTORS</span>
            <span class="brand-tagline">Showroom Management</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">Operations</div>

          <a href="./dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}" id="nav-dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
            <span>Dashboard</span>
          </a>

          <a href="./vehicles.html" class="nav-item ${activePage === 'vehicles' ? 'active' : ''}" id="nav-vehicles">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>
            <span>Vehicles</span>
            <span class="nav-badge">${vehiclesCount}</span>
          </a>

          <a href="./customers.html" class="nav-item ${activePage === 'customers' ? 'active' : ''}" id="nav-customers">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Customers</span>
          </a>

          <a href="./bookings.html" class="nav-item ${activePage === 'bookings' ? 'active' : ''}" id="nav-bookings">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="m9 16 2 2 4-4"></path></svg>
            <span>Bookings</span>
            <span class="nav-badge">${bookingsCount}</span>
          </a>

          <a href="./sales.html" class="nav-item ${activePage === 'sales' ? 'active' : ''}" id="nav-sales">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
            <span>Sales & Invoices</span>
          </a>

          <div class="nav-section-title">Analytics</div>

          <a href="./reports.html" class="nav-item ${activePage === 'reports' ? 'active' : ''}" id="nav-reports">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            <span>Reports</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="academic-badge" onclick="ASMS.showAcademicModal()" style="cursor: pointer;" title="View Project Synopsis Information">
            <span class="title">BCA Mini Project (BCA23506)</span>
            <div class="meta">
              <strong>Dr P.A Inamdar University, Pune</strong><br>
              Ayan Yusuf Khan (77) &amp; Mohammad Ali Farid Sayyed (116)
            </div>
          </div>

          <div class="user-profile-pill">
            <div class="user-avatar-sm">
              ${session.name ? session.name[0] : 'A'}
            </div>
            <div class="user-details">
              <span class="user-name">${session.name || 'Admin'}</span>
              <span class="user-role">${session.role || 'Showroom Admin'}</span>
            </div>
            <button class="btn-logout-icon" title="Sign Out" onclick="ASMS.logout()" id="btn-sidebar-logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>
      <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="ASMS.toggleMobileSidebar()"></div>
    `;

    // Header DOM
    const titles = {
      dashboard: { title: 'Dashboard Overview', breadcrumb: 'Overview' },
      vehicles: { title: 'Vehicle Inventory Management', breadcrumb: 'Inventory / Vehicles' },
      customers: { title: 'Customer Relationship Management', breadcrumb: 'Directory / Customers' },
      bookings: { title: 'Vehicle Bookings & Pre-Orders', breadcrumb: 'Orders / Bookings' },
      sales: { title: 'Sales & Invoices Management', breadcrumb: 'Billing / Sales' },
      reports: { title: 'Executive Management Reports', breadcrumb: 'Analytics / Reports' }
    };

    const currentTitle = titles[activePage] || { title: 'Showroom System', breadcrumb: 'Overview' };

    const headerHtml = `
      <header class="app-header">
        <div class="header-left">
          <button class="mobile-nav-toggle" onclick="ASMS.toggleMobileSidebar()" id="mobile-menu-btn" title="Toggle Navigation">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div class="page-title-group">
            <h1>${currentTitle.title}</h1>
            <div class="breadcrumb">
              <span>Home</span>
              <span>/</span>
              <span class="current">${currentTitle.breadcrumb}</span>
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="live-clock" id="asms-live-clock" title="System Time">
            <div class="live-clock-dot"></div>
            <span id="clock-text">--:--:--</span>
          </div>

          <button class="header-btn" onclick="ASMS.showAcademicModal()" title="BCA Project Academic Synopsis Info" id="btn-project-info">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </button>

          <button class="header-btn" onclick="ASMS.confirmResetDatabase()" title="Reset / Reseed Demo Data" id="btn-reset-db">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
          </button>

          <button class="header-btn" onclick="ASMS.toggleTheme()" title="Toggle Dark/Light Mode" id="btn-theme-toggle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
          </button>

          <button class="btn btn-secondary btn-sm" onclick="ASMS.logout()" id="btn-header-logout" title="Sign Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Logout</span>
          </button>
        </div>
      </header>
    `;

    // Inject into container
    const layoutEl = document.querySelector('.app-layout');
    if (layoutEl) {
      layoutEl.insertAdjacentHTML('afterbegin', sidebarHtml);
      const mainEl = document.querySelector('.app-main');
      if (mainEl) {
        mainEl.insertAdjacentHTML('afterbegin', headerHtml);
      }
    }

    // Sync theme toggle button icon
    this.updateThemeToggleIcon(document.documentElement.getAttribute('data-theme') || 'dark');

    // Start live clock
    this.startClock();
  },

  // Toggle mobile navigation sidebar
  toggleMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar && backdrop) {
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active');
    }
  },

  // Real-time clock update
  startClock() {
    const update = () => {
      const el = document.getElementById('clock-text');
      if (el) {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      }
    };
    update();
    setInterval(update, 1000);
  },

  // Confirm database reset modal
  confirmResetDatabase() {
    this.confirm(
      'Reset Demo Database',
      'This will reset all vehicles, customer records, bookings, and sales back to the original demo dataset. Any custom changes will be overwritten. Do you want to proceed?',
      () => {
        this.resetDatabase(false);
      }
    );
  },

  // Show Academic Project Details Modal
  showAcademicModal() {
    let modal = document.getElementById('asms-academic-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'asms-academic-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-container modal-md">
          <div class="modal-header">
            <div class="modal-title">Project Synopsis &amp; Academic Details</div>
            <button class="modal-close" onclick="document.getElementById('asms-academic-modal').classList.remove('active')">&times;</button>
          </div>
          <div class="modal-body" style="line-height: 1.6; font-size: 0.9rem;">
            <div style="text-align: center; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem;">
              <h3 style="font-family: var(--font-heading); color: var(--primary); font-size: 1.2rem; font-weight: 700;">M.C.E Society's</h3>
              <h2 style="font-family: var(--font-heading); font-size: 1.3rem; margin: 0.2rem 0; font-weight: 800;">Dr P.A Inamdar University, Pune</h2>
              <p style="color: var(--text-muted); font-size: 0.85rem;">School of Commerce, Management and Computer Studies</p>
              <div style="display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: var(--primary-light); color: var(--primary); font-weight: 700; border-radius: var(--radius-pill); font-size: 0.8rem;">
                BCA23506: Mini Project (Academic Year 2026–27)
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div style="background: var(--bg-surface); padding: 0.875rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Project Title</div>
                <div style="font-weight: 700; color: var(--text-main); margin-top: 0.2rem;">Automobile Showroom Management System</div>
              </div>
              <div style="background: var(--bg-surface); padding: 0.875rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Curriculum Specification</div>
                <div style="font-weight: 700; color: var(--text-main); margin-top: 0.2rem;">BCA Mini Project (BCA23506)</div>
              </div>
            </div>

            <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700;">Project Developers</h4>
            <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1.25rem;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                <thead>
                  <tr style="background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle);">
                    <th style="padding: 0.5rem 0.875rem; text-align: left;">Roll No</th>
                    <th style="padding: 0.5rem 0.875rem; text-align: left;">Name</th>
                    <th style="padding: 0.5rem 0.875rem; text-align: left;">Class</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 0.6rem 0.875rem; font-weight: 600;">77</td>
                    <td style="padding: 0.6rem 0.875rem; font-weight: 600; color: var(--primary);">Ayan Yusuf Khan</td>
                    <td style="padding: 0.6rem 0.875rem;">BCA III</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.6rem 0.875rem; font-weight: 600;">116</td>
                    <td style="padding: 0.6rem 0.875rem; font-weight: 600; color: var(--primary);">Mohammad Ali Farid Sayyed</td>
                    <td style="padding: 0.6rem 0.875rem;">BCA III</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700;">Key Features Built</h4>
            <ul style="list-style: disc; padding-left: 1.25rem; color: var(--text-secondary); font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.25rem;">
              <li>7 Comprehensive Modules: Admin Auth, Dashboard, Vehicles, Customers, Bookings, Sales &amp; Reports</li>
              <li>Pure HTML5, CSS3, ES6+ Vanilla JavaScript - Zero external frameworks, 100% Vercel static ready</li>
              <li>Complete CRUD for Vehicles &amp; Customers with live search, filters, and CSV export</li>
              <li>Automated stock inventory decrement upon completed sales</li>
              <li>Commercial tax invoice generator with direct printable A4 invoice CSS</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary btn-sm" onclick="document.getElementById('asms-academic-modal').classList.remove('active')">Close</button>
          </div>
        </div>
      `;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
      document.body.appendChild(modal);
    }
    modal.classList.add('active');
  }
};

// Global Escape key listener to dismiss any active modal or mobile drawer
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.app-sidebar.mobile-open').forEach(s => s.classList.remove('mobile-open'));
    document.querySelectorAll('.sidebar-backdrop.active').forEach(b => b.classList.remove('active'));
  }
});

// Initialize theme immediately on script evaluation
ASMS.initTheme();
