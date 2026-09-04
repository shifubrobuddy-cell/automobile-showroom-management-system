/**
 * Automobile Showroom Management System (ASMS)
 * Module: Sales & Invoice Billing Management
 * Handles recording sales, auto-decrementing inventory stock, and generating printable tax invoices.
 */

document.addEventListener('DOMContentLoaded', () => {
  ASMS.checkAuth();
  ASMS.renderShell('sales');

  // State
  let sales = ASMS.get(DB_KEYS.SALES, []);
  let customers = ASMS.get(DB_KEYS.CUSTOMERS, []);
  let vehicles = ASMS.get(DB_KEYS.VEHICLES, []);
  let bookings = ASMS.get(DB_KEYS.BOOKINGS, []);
  let filteredSales = [...sales];
  let currentPage = 1;
  const itemsPerPage = 8;

  // DOM Elements
  const tableBody = document.getElementById('sales-table-body');
  const searchInput = document.getElementById('search-sales');
  const paymentFilter = document.getElementById('filter-payment-status');
  const paginationContainer = document.getElementById('pagination-container');
  const addBtn = document.getElementById('btn-new-sale');
  const exportBtn = document.getElementById('btn-export-sales');

  // Stats
  const statTotalRevenue = document.getElementById('stat-total-revenue');
  const statTotalCarsSold = document.getElementById('stat-cars-sold');
  const statAvgTicket = document.getElementById('stat-avg-ticket');
  const statPendingPayments = document.getElementById('stat-pending-payments');

  // Sales Form Modal
  const saleModal = document.getElementById('sale-modal');
  const modalTitle = document.getElementById('modal-title');
  const saleForm = document.getElementById('sale-form');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  const customerSelect = document.getElementById('sale-customer');
  const vehicleSelect = document.getElementById('sale-vehicle');
  const basePriceInput = document.getElementById('sale-base-price');
  const discountInput = document.getElementById('sale-discount');
  const taxPercentInput = document.getElementById('sale-tax-percent');
  const taxAmountInput = document.getElementById('sale-tax-amount');
  const netTotalInput = document.getElementById('sale-net-total');
  const stockAlertHint = document.getElementById('sale-stock-hint');

  // Invoice Modal
  const invoiceModal = document.getElementById('invoice-modal');
  const invoiceCloseBtn = document.getElementById('invoice-close-btn');
  const invoiceContainer = document.getElementById('invoice-render-area');

  // Populate Customer and Vehicle Dropdowns
  function populateDropdowns() {
    customers = ASMS.get(DB_KEYS.CUSTOMERS, []);
    vehicles = ASMS.get(DB_KEYS.VEHICLES, []);

    // Customers
    customerSelect.innerHTML = '<option value="">-- Select Customer --</option>';
    customers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.mobile}) - ${c.type}`;
      customerSelect.appendChild(opt);
    });

    // Vehicles (with stock check)
    vehicleSelect.innerHTML = '<option value="">-- Select Vehicle to Sell --</option>';
    vehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      const stockNum = Number(v.stock) || 0;
      const stockMsg = stockNum <= 0 ? ' [OUT OF STOCK]' : ` [Stock: ${stockNum}]`;
      opt.textContent = `${v.name} (${v.brand}) - ${ASMS.formatCurrency(v.price)}${stockMsg}`;
      opt.dataset.price = v.price;
      opt.dataset.stock = stockNum;
      opt.dataset.fuel = v.fuelType || '';
      if (stockNum <= 0) {
        opt.disabled = true;
      }
      vehicleSelect.appendChild(opt);
    });
  }

  // Update Top Stats
  function updateStats() {
    const totalRev = sales.reduce((sum, s) => sum + (Number(s.netTotal) || 0), 0);
    const carsSold = sales.length;
    const avgTicket = carsSold > 0 ? totalRev / carsSold : 0;
    const pendingSales = sales.filter(s => s.paymentStatus !== 'Paid').length;

    if (statTotalRevenue) statTotalRevenue.textContent = ASMS.formatCurrency(totalRev);
    if (statTotalCarsSold) statTotalCarsSold.textContent = `${carsSold} Units`;
    if (statAvgTicket) statAvgTicket.textContent = ASMS.formatCurrency(avgTicket);
    if (statPendingPayments) statPendingPayments.textContent = `${pendingSales} Unpaid`;
  }

  // Recalculate Totals
  function recalculateSale() {
    const base = parseFloat(basePriceInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;
    const taxRate = parseFloat(taxPercentInput.value) || 0;

    const taxableAmount = Math.max(0, base - discount);
    const taxAmount = Math.round((taxableAmount * taxRate) / 100);
    const netTotal = Math.round(taxableAmount + taxAmount);

    taxAmountInput.value = taxAmount;
    netTotalInput.value = netTotal;
  }

  // Vehicle change listener
  vehicleSelect.addEventListener('change', () => {
    const opt = vehicleSelect.options[vehicleSelect.selectedIndex];
    if (opt && opt.dataset.price) {
      basePriceInput.value = opt.dataset.price;
      const stock = parseInt(opt.dataset.stock, 10);
      const fuel = (opt.dataset.fuel || '').toLowerCase();

      // EVs get 5% GST, other passenger vehicles get 18% standard
      if (fuel.includes('electric')) {
        taxPercentInput.value = '5';
      } else {
        taxPercentInput.value = '18';
      }

      if (stock <= 2) {
        stockAlertHint.innerHTML = `<span style="color: var(--accent-amber); font-weight: 600;">⚠ Low Stock Alert: Only ${stock} unit(s) remaining in showroom inventory!</span>`;
      } else {
        stockAlertHint.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 600;">✓ In Stock: ${stock} unit(s) available for immediate delivery.</span>`;
      }
      recalculateSale();
    } else {
      stockAlertHint.innerHTML = '';
    }
  });

  basePriceInput.addEventListener('input', recalculateSale);
  discountInput.addEventListener('input', recalculateSale);
  taxPercentInput.addEventListener('input', recalculateSale);

  // Filter & Search
  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedPay = paymentFilter.value;

    filteredSales = sales.filter(s => {
      const matchSearch =
        !query ||
        s.id.toLowerCase().includes(query) ||
        s.customerName.toLowerCase().includes(query) ||
        s.vehicleName.toLowerCase().includes(query) ||
        (s.customerMobile && s.customerMobile.includes(query)) ||
        (s.salesExecutive && s.salesExecutive.toLowerCase().includes(query));

      const matchPay = !selectedPay || s.paymentStatus === selectedPay;
      return matchSearch && matchPay;
    });

    currentPage = 1;
    renderTable();
  }

  // Render Table
  function renderTable() {
    tableBody.innerHTML = '';

    if (filteredSales.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <div class="empty-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
              </div>
              <div class="empty-title">No Sales Invoices Found</div>
              <div class="empty-description">Record your first automobile sale or adjust your active search filters.</div>
            </div>
          </td>
        </tr>
      `;
      renderPagination(0);
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredSales.slice(startIndex, startIndex + itemsPerPage);

    paginatedItems.forEach(s => {
      const isPaid = s.paymentStatus === 'Paid';
      const isPending = s.paymentStatus === 'Pending';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="primary-cell">
          <div style="font-weight: 700; color: var(--text-main); font-family: var(--font-heading);">${s.id}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${ASMS.formatDate(s.saleDate)}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${s.customerName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${s.customerMobile || ''}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${s.vehicleName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${s.vehicleBrand || ''} | VIN: ${s.vehicleVin || 'N/A'}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem;">${ASMS.formatCurrency(s.netTotal)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">Base: ${ASMS.formatCurrency(s.basePrice)}</div>
        </td>
        <td>
          <span style="font-size: 0.8125rem; font-weight: 500;">${s.paymentMethod || 'Direct Payment'}</span>
        </td>
        <td>
          <span class="badge ${isPaid ? 'badge-success' : isPending ? 'badge-danger' : 'badge-warning'}">
            ${s.paymentStatus || 'Paid'}
          </span>
        </td>
        <td>
          <span style="font-size: 0.8125rem; color: var(--text-secondary);">${s.salesExecutive || 'Admin'}</span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; justify-content: flex-end; gap: 0.4rem;">
            <button class="btn btn-primary btn-sm" title="View & Print Tax Invoice" onclick="window.viewInvoice('${s.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
              <span>Invoice</span>
            </button>
            <button class="btn btn-danger btn-sm" title="Delete Sale" onclick="window.deleteSale('${s.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderPagination(filteredSales.length);
  }

  // Render Pagination
  function renderPagination(totalItems) {
    if (!paginationContainer) return;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    let start = (currentPage - 1) * itemsPerPage + 1;
    let end = Math.min(currentPage * itemsPerPage, totalItems);
    if (totalItems === 0) { start = 0; end = 0; }

    paginationContainer.innerHTML = `
      <div style="font-size: 0.8125rem; color: var(--text-muted);">
        Showing <strong>${start}</strong> to <strong>${end}</strong> of <strong>${totalItems}</strong> invoices
      </div>
      <div class="pagination-controls">
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changeSalePage(${currentPage - 1})">
          Previous
        </button>
        ${Array.from({ length: totalPages }, (_, i) => i + 1)
          .map(
            page => `
            <button class="page-btn ${page === currentPage ? 'active' : ''}" onclick="window.changeSalePage(${page})">
              ${page}
            </button>
          `
          )
          .join('')}
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changeSalePage(${currentPage + 1})">
          Next
        </button>
      </div>
    `;
  }

  // Open Sale Modal
  function openSaleModal() {
    modalTitle.textContent = 'Record Completed Automobile Sale';
    saleForm.reset();
    populateDropdowns();
    document.getElementById('sale-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('sale-discount').value = '0';
    document.getElementById('sale-tax-percent').value = '18';
    document.getElementById('sale-tax-amount').value = '0';
    document.getElementById('sale-net-total').value = '0';
    document.getElementById('sale-payment-method').value = 'Bank Transfer (RTGS)';
    document.getElementById('sale-payment-status').value = 'Paid';
    document.getElementById('sale-executive').value = 'Amit Verma';
    stockAlertHint.innerHTML = '';
    saleModal.classList.add('active');
  }

  // Check if bridged from Booking module
  function checkBridgeFromBooking() {
    const bridgeStr = sessionStorage.getItem('asms_bridge_sale');
    if (bridgeStr) {
      try {
        const bridgeData = JSON.parse(bridgeStr);
        sessionStorage.removeItem('asms_bridge_sale');

        openSaleModal();
        customerSelect.value = bridgeData.customerId;
        vehicleSelect.value = bridgeData.vehicleId;

        // Trigger change event to load prices
        const event = new Event('change');
        vehicleSelect.dispatchEvent(event);

        if (bridgeData.advancePaid) {
          document.getElementById('sale-remarks').value = `Converted from Booking #${bridgeData.bookingId}. Advance already collected: ${ASMS.formatCurrency(bridgeData.advancePaid)}.`;
        }

        // Mark associated booking as Completed
        if (bridgeData.bookingId) {
          const bIdx = bookings.findIndex(b => b.id === bridgeData.bookingId);
          if (bIdx !== -1) {
            bookings[bIdx].status = 'Completed';
            ASMS.set(DB_KEYS.BOOKINGS, bookings);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  // View & Print Tax Invoice
  window.viewInvoice = function(saleId) {
    const s = sales.find(item => item.id === saleId);
    if (!s) return;

    // Find linked vehicle details
    const veh = vehicles.find(v => v.id === s.vehicleId) || {};

    invoiceContainer.innerHTML = `
      <div class="invoice-container">
        <div class="invoice-header">
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem;">
              <div style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${ASMS.getLogoSvg(38, 'inv')}
              </div>
              <div>
                <span class="invoice-dealership-name" style="letter-spacing: 0.04em;">APEX MOTORS</span>
                <div style="font-size: 0.7rem; font-weight: 600; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;">Executive Dealership Network</div>
              </div>
            </div>
            <div class="invoice-dealership-details">
              <strong>Authorized Automobile Dealership &amp; Showroom</strong><br>
              Survey No. 45/2, Airport Road, Viman Nagar, Pune - 411014<br>
              GSTIN: 27AABCA1234F1Z8 | Contact: +91 20 2680 9900<br>
              Email: billing@apexmotors.in | Web: www.apexmotors.in
            </div>
          </div>
          <div class="invoice-badge-title">
            <h2>TAX INVOICE</h2>
            <div style="font-weight: 700; color: #0f172a; margin-top: 0.25rem;">INVOICE #: ${s.id}</div>
            <div style="font-size: 0.8125rem; color: #64748b;">DATE: ${ASMS.formatDate(s.saleDate)}</div>
            <div style="margin-top: 0.5rem;">
              <span class="badge badge-success" style="font-size: 0.8125rem; padding: 0.25rem 0.75rem;">${s.paymentStatus.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div class="invoice-meta-grid">
          <div class="invoice-meta-block">
            <h4>Billed To (Customer Details)</h4>
            <div style="font-weight: 700; font-size: 1rem; color: #0f172a;">${s.customerName}</div>
            <div style="color: #475569; margin-top: 0.2rem;">Phone: <strong>${s.customerMobile || 'N/A'}</strong></div>
            <div style="color: #475569;">Email: ${s.customerEmail || 'N/A'}</div>
            <div style="color: #475569; margin-top: 0.2rem;">Address: ${s.customerAddress || 'Pune, Maharashtra'}</div>
          </div>

          <div class="invoice-meta-block">
            <h4>Vehicle &amp; Delivery Particulars</h4>
            <div style="color: #475569;">Vehicle Name: <strong style="color: #0f172a;">${s.vehicleName}</strong></div>
            <div style="color: #475569;">VIN / Chassis No: <strong>${s.vehicleVin || 'MAT623490P2K89102'}</strong></div>
            <div style="color: #475569;">Fuel Powertrain: <strong>${veh.fuelType || 'Petrol'}</strong></div>
            <div style="color: #475569;">Exterior Colour: <strong>${veh.colour || 'Standard'}</strong></div>
            <div style="color: #475569;">Salesperson: <strong>${s.salesExecutive || 'Amit Verma'}</strong></div>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Description of Goods / Services</th>
              <th>HSN / SAC</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                <div style="font-weight: 700; color: #0f172a;">${s.vehicleName}</div>
                <div style="font-size: 0.75rem; color: #64748b;">Complete Automobile Delivery with Ex-Showroom Documentation</div>
              </td>
              <td>8703</td>
              <td style="text-align: right;">${ASMS.formatCurrency(s.basePrice)}</td>
              <td style="text-align: right; font-weight: 600;">${ASMS.formatCurrency(s.basePrice)}</td>
            </tr>
            ${s.discount > 0 ? `
              <tr>
                <td>2</td>
                <td>Special Dealership Promotional Discount</td>
                <td>-</td>
                <td style="text-align: right; color: #dc2626;">-${ASMS.formatCurrency(s.discount)}</td>
                <td style="text-align: right; color: #dc2626; font-weight: 600;">-${ASMS.formatCurrency(s.discount)}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        <div class="invoice-totals">
          <div class="invoice-total-row">
            <span>Subtotal (Net Taxable):</span>
            <span>${ASMS.formatCurrency(Math.max(0, s.basePrice - s.discount))}</span>
          </div>
          <div class="invoice-total-row">
            <span>GST / Automobile Cess (${s.taxPercent || 18}%):</span>
            <span>${ASMS.formatCurrency(s.taxAmount || 0)}</span>
          </div>
          <div class="invoice-total-row">
            <span>Payment Mode:</span>
            <span>${s.paymentMethod || 'RTGS / Cheque'}</span>
          </div>
          <div class="invoice-total-row grand-total">
            <span>TOTAL ON-ROAD AMOUNT:</span>
            <span style="color: #2563eb;">${ASMS.formatCurrency(s.netTotal)}</span>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 0.875rem; border-radius: 6px; font-size: 0.75rem; color: #64748b; margin-bottom: 2rem;">
          <strong>Terms &amp; Conditions:</strong>
          <ol style="margin-top: 0.3rem; padding-left: 1.2rem; line-height: 1.4;">
            <li>Vehicles once delivered cannot be returned or refunded.</li>
            <li>Warranty, roadside assistance, and battery/powertrain support governed by manufacturer policy.</li>
            <li>Subject to Pune jurisdiction only.</li>
          </ol>
        </div>

        <div class="invoice-signatures">
          <div class="signature-line">
            Customer Signature &amp; Acknowledgement
          </div>
          <div class="signature-line">
            For Apex Motors (Authorized Signatory)
          </div>
        </div>
      </div>
    `;

    invoiceModal.classList.add('active');
  };

  // Close Form Modal
  function closeFormModal() {
    saleModal.classList.remove('active');
    saleForm.reset();
  }

  // Delete Sale
  window.deleteSale = function(id) {
    const s = sales.find(item => item.id === id);
    if (!s) return;

    ASMS.confirm(
      'Delete Sales Record',
      `Delete invoice ${s.id} for "${s.vehicleName}"? Note: Vehicle stock will NOT be automatically re-incremented.`,
      () => {
        sales = sales.filter(item => item.id !== id);
        ASMS.set(DB_KEYS.SALES, sales);
        ASMS.toast(`Invoice ${s.id} removed from sales log.`, 'success');
        updateStats();
        applyFilters();
      }
    );
  };

  // Form Submit: Record Sale + Auto Decrement Stock
  saleForm.addEventListener('submit', e => {
    e.preventDefault();

    const customerId = customerSelect.value;
    const vehicleId = vehicleSelect.value;
    const saleDate = document.getElementById('sale-date').value;
    const basePrice = parseFloat(basePriceInput.value);
    const discount = parseFloat(discountInput.value) || 0;
    const taxPercent = parseFloat(taxPercentInput.value) || 0;
    const taxAmount = parseFloat(taxAmountInput.value) || 0;
    const netTotal = parseFloat(netTotalInput.value);
    const paymentMethod = document.getElementById('sale-payment-method').value;
    const paymentStatus = document.getElementById('sale-payment-status').value;
    const salesExecutive = document.getElementById('sale-executive').value.trim() || 'Admin';
    const remarks = document.getElementById('sale-remarks').value.trim();

    if (!customerId || !vehicleId || isNaN(basePrice) || isNaN(netTotal) || netTotal <= 0) {
      ASMS.toast('Please select a customer and vehicle, and verify the pricing totals.', 'error');
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!customer || !vehicle) {
      ASMS.toast('Selected customer or vehicle record missing.', 'error');
      return;
    }

    // Check stock availability
    if (Number(vehicle.stock) <= 0) {
      ASMS.toast(`Cannot complete sale: "${vehicle.name}" is currently OUT OF STOCK!`, 'error');
      return;
    }

    // CRITICAL: Auto decrement vehicle stock
    vehicle.stock = Math.max(0, Number(vehicle.stock) - 1);
    const vIdx = vehicles.findIndex(v => v.id === vehicleId);
    if (vIdx !== -1) {
      vehicles[vIdx].stock = vehicle.stock;
      ASMS.set(DB_KEYS.VEHICLES, vehicles);
    }

    // Create Sale Invoice Record
    const newInvoiceId = `INV-${new Date().getFullYear()}-${String(sales.length + 101).padStart(3, '0')}`;
    const newSale = {
      id: newInvoiceId,
      customerId,
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerEmail: customer.email,
      customerAddress: customer.address,
      vehicleId,
      vehicleName: vehicle.name,
      vehicleBrand: vehicle.brand,
      vehicleVin: vehicle.vin,
      saleDate,
      basePrice,
      discount,
      taxPercent,
      taxAmount,
      netTotal,
      paymentMethod,
      paymentStatus,
      salesExecutive,
      remarks
    };

    sales.unshift(newSale);
    ASMS.set(DB_KEYS.SALES, sales);

    ASMS.toast(`Sale recorded! Invoice ${newInvoiceId} generated and vehicle stock decremented to ${vehicle.stock} unit(s).`, 'success');

    closeFormModal();
    updateStats();
    applyFilters();

    // Auto open printable invoice for convenience
    setTimeout(() => {
      window.viewInvoice(newInvoiceId);
    }, 400);
  });

  // Global Page Switcher
  window.changeSalePage = function(page) {
    currentPage = page;
    renderTable();
  };

  // Export to CSV
  exportBtn.addEventListener('click', () => {
    const exportData = sales.map(s => ({
      Invoice_No: s.id,
      Date: s.saleDate,
      Customer_Name: s.customerName,
      Customer_Mobile: s.customerMobile || '',
      Vehicle: s.vehicleName,
      VIN_Chassis: s.vehicleVin || '',
      Base_Price: s.basePrice,
      Discount: s.discount,
      Tax_Amount: s.taxAmount,
      Net_Total: s.netTotal,
      Payment_Method: s.paymentMethod,
      Payment_Status: s.paymentStatus,
      Sales_Executive: s.salesExecutive
    }));
    ASMS.exportToCSV(`Sales_Revenue_Report_${new Date().toISOString().slice(0, 10)}`, exportData);
  });

  // Event Listeners
  addBtn.addEventListener('click', openSaleModal);
  modalCloseBtn.addEventListener('click', closeFormModal);
  modalCancelBtn.addEventListener('click', closeFormModal);
  invoiceCloseBtn.addEventListener('click', () => invoiceModal.classList.remove('active'));

  saleModal.addEventListener('click', e => {
    if (e.target === saleModal) closeFormModal();
  });

  invoiceModal.addEventListener('click', e => {
    if (e.target === invoiceModal) invoiceModal.classList.remove('active');
  });

  searchInput.addEventListener('input', applyFilters);
  paymentFilter.addEventListener('change', applyFilters);

  // Init
  updateStats();
  applyFilters();
  checkBridgeFromBooking();
});
