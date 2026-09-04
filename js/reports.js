/**
 * Automobile Showroom Management System (ASMS)
 * Module: Executive Reports & Business Intelligence
 * Generates Inventory, Customer, Booking, and Sales reports with date filters, CSV export, and print formatting.
 */

document.addEventListener('DOMContentLoaded', () => {
  ASMS.checkAuth();
  ASMS.renderShell('reports');

  // State
  let activeReportType = 'sales'; // 'sales', 'inventory', 'customers', 'bookings'
  let dateRangeType = 'all'; // 'all', 'this_month', 'last_30', 'custom'

  // Data
  let sales = ASMS.get(DB_KEYS.SALES, []);
  let vehicles = ASMS.get(DB_KEYS.VEHICLES, []);
  let customers = ASMS.get(DB_KEYS.CUSTOMERS, []);
  let bookings = ASMS.get(DB_KEYS.BOOKINGS, []);

  // DOM Elements
  const reportTypeSelect = document.getElementById('report-type-select');
  const dateRangeSelect = document.getElementById('report-date-range');
  const customDateGroup = document.getElementById('custom-date-group');
  const customDateStart = document.getElementById('report-date-start');
  const customDateEnd = document.getElementById('report-date-end');
  const applyDateBtn = document.getElementById('btn-apply-dates');
  const exportBtn = document.getElementById('btn-export-report');
  const printBtn = document.getElementById('btn-print-report');

  const reportKpiContainer = document.getElementById('report-kpis');
  const reportTitleEl = document.getElementById('report-display-title');
  const reportSubtitleEl = document.getElementById('report-display-subtitle');
  const reportTableHead = document.getElementById('report-table-head');
  const reportTableBody = document.getElementById('report-table-body');

  // Date Filtering Helper
  function isWithinDateRange(dateString) {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();

    if (dateRangeType === 'all') return true;

    if (dateRangeType === 'this_month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }

    if (dateRangeType === 'last_30') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return d >= past30 && d <= now;
    }

    if (dateRangeType === 'custom') {
      const start = customDateStart.value ? new Date(customDateStart.value) : null;
      const end = customDateEnd.value ? new Date(customDateEnd.value) : null;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    }

    return true;
  }

  // Refresh and Render Current Report
  function renderReport() {
    // Refresh latest data from localStorage
    sales = ASMS.get(DB_KEYS.SALES, []);
    vehicles = ASMS.get(DB_KEYS.VEHICLES, []);
    customers = ASMS.get(DB_KEYS.CUSTOMERS, []);
    bookings = ASMS.get(DB_KEYS.BOOKINGS, []);

    if (activeReportType === 'sales') {
      renderSalesReport();
    } else if (activeReportType === 'inventory') {
      renderInventoryReport();
    } else if (activeReportType === 'customers') {
      renderCustomersReport();
    } else if (activeReportType === 'bookings') {
      renderBookingsReport();
    }
  }

  // 1. Sales & Financial Revenue Report
  function renderSalesReport() {
    const filtered = sales.filter(s => isWithinDateRange(s.saleDate));
    const totalRev = filtered.reduce((sum, s) => sum + (Number(s.netTotal) || 0), 0);
    const totalBase = filtered.reduce((sum, s) => sum + (Number(s.basePrice) || 0), 0);
    const totalTax = filtered.reduce((sum, s) => sum + (Number(s.taxAmount) || 0), 0);
    const totalDiscount = filtered.reduce((sum, s) => sum + (Number(s.discount) || 0), 0);

    reportTitleEl.textContent = 'Sales Revenue & Billing Report';
    reportSubtitleEl.textContent = `Generated on ${new Date().toLocaleDateString('en-GB')} | Scope: ${dateRangeSelect.options[dateRangeSelect.selectedIndex].text}`;

    reportKpiContainer.innerHTML = `
      <div class="stat-card" style="--card-accent: var(--primary);">
        <div class="stat-info">
          <span class="stat-label">Net Realized Revenue</span>
          <span class="stat-value" style="color: var(--primary);">${ASMS.formatCurrency(totalRev)}</span>
          <span class="stat-subtext positive">${filtered.length} Vehicles Invoiced</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent-emerald);">
        <div class="stat-info">
          <span class="stat-label">Total Ex-Showroom Volume</span>
          <span class="stat-value">${ASMS.formatCurrency(totalBase)}</span>
          <span class="stat-subtext">Before Taxes &amp; Discounts</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent-amber);">
        <div class="stat-info">
          <span class="stat-label">Tax / GST Collected</span>
          <span class="stat-value">${ASMS.formatCurrency(totalTax)}</span>
          <span class="stat-subtext">Automobile Cess &amp; GST</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent-rose);">
        <div class="stat-info">
          <span class="stat-label">Total Discounts Given</span>
          <span class="stat-value">${ASMS.formatCurrency(totalDiscount)}</span>
          <span class="stat-subtext">Promotional Reductions</span>
        </div>
      </div>
    `;

    reportTableHead.innerHTML = `
      <tr>
        <th>Invoice No</th>
        <th>Date</th>
        <th>Customer Name</th>
        <th>Vehicle Model</th>
        <th>Payment Mode</th>
        <th style="text-align: right;">Base Price</th>
        <th style="text-align: right;">GST</th>
        <th style="text-align: right;">Net Invoiced</th>
        <th>Status</th>
      </tr>
    `;

    if (filtered.length === 0) {
      reportTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-muted);">No sales records found for the selected date timeframe.</td></tr>`;
      return;
    }

    reportTableBody.innerHTML = filtered
      .map(
        s => `
        <tr>
          <td style="font-weight: 700; font-family: var(--font-heading); color: var(--primary);">${s.id}</td>
          <td>${ASMS.formatDate(s.saleDate)}</td>
          <td style="font-weight: 600;">${s.customerName}</td>
          <td>${s.vehicleName}</td>
          <td>${s.paymentMethod}</td>
          <td style="text-align: right;">${ASMS.formatCurrency(s.basePrice)}</td>
          <td style="text-align: right;">${ASMS.formatCurrency(s.taxAmount)}</td>
          <td style="text-align: right; font-weight: 700; color: var(--text-main);">${ASMS.formatCurrency(s.netTotal)}</td>
          <td><span class="badge ${s.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'}">${s.paymentStatus}</span></td>
        </tr>
      `
      )
      .join('');
  }

  // 2. Vehicle Inventory Stock Report
  function renderInventoryReport() {
    const totalModels = vehicles.length;
    const totalStock = vehicles.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const totalValuation = vehicles.reduce((sum, v) => sum + (Number(v.price) * Number(v.stock)), 0);
    const lowStockCount = vehicles.filter(v => Number(v.stock) <= 2).length;

    reportTitleEl.textContent = 'Vehicle Stock & Inventory Valuation Report';
    reportSubtitleEl.textContent = `Current Real-Time Showroom Stock Audit (${totalStock} Total Units Available)`;

    reportKpiContainer.innerHTML = `
      <div class="stat-card" style="--card-accent: var(--primary);">
        <div class="stat-info">
          <span class="stat-label">Total Stock Valuation</span>
          <span class="stat-value" style="color: var(--primary);">${ASMS.formatCurrency(totalValuation)}</span>
          <span class="stat-subtext">Capital Tied in Inventory</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent-emerald);">
        <div class="stat-info">
          <span class="stat-label">Stocked Units</span>
          <span class="stat-value">${totalStock} Units</span>
          <span class="stat-subtext positive">Across ${totalModels} Distinct Models</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent-amber);">
        <div class="stat-info">
          <span class="stat-label">Low Stock Warnings</span>
          <span class="stat-value" style="color: var(--accent-amber);">${lowStockCount} Models</span>
          <span class="stat-subtext warning">&le; 2 Units Remaining</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent);">
        <div class="stat-info">
          <span class="stat-label">Average Unit Price</span>
          <span class="stat-value">${ASMS.formatCurrency(totalModels > 0 ? totalValuation / totalStock : 0)}</span>
          <span class="stat-subtext">Ex-Showroom Basis</span>
        </div>
      </div>
    `;

    reportTableHead.innerHTML = `
      <tr>
        <th>Vehicle ID</th>
        <th>Vehicle Name</th>
        <th>Brand</th>
        <th>Fuel Type</th>
        <th>Year</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: center;">Stock Status</th>
        <th style="text-align: right;">Total Asset Value</th>
      </tr>
    `;

    reportTableBody.innerHTML = vehicles
      .map(v => {
        const stockNum = Number(v.stock);
        const assetVal = Number(v.price) * stockNum;
        let badge = `<span class="badge badge-success">In Stock (${stockNum})</span>`;
        if (stockNum <= 0) badge = `<span class="badge badge-danger">Out of Stock</span>`;
        else if (stockNum <= 2) badge = `<span class="badge badge-warning">Low Stock (${stockNum})</span>`;

        return `
        <tr>
          <td style="font-weight: 600;">${v.id}</td>
          <td style="font-weight: 700; color: var(--text-main);">${v.name}</td>
          <td>${v.brand}</td>
          <td>${v.fuelType}</td>
          <td>${v.year}</td>
          <td style="text-align: right;">${ASMS.formatCurrency(v.price)}</td>
          <td style="text-align: center;">${badge}</td>
          <td style="text-align: right; font-weight: 700; color: var(--primary);">${ASMS.formatCurrency(assetVal)}</td>
        </tr>
      `;
      })
      .join('');
  }

  // 3. Customer Directory & Demographics Report
  function renderCustomersReport() {
    const filtered = customers.filter(c => isWithinDateRange(c.registeredDate));
    const totalCount = filtered.length;
    const corporateCount = filtered.filter(c => c.type === 'Corporate').length;
    const individualCount = totalCount - corporateCount;

    // Calculate total spend
    let totalCustomerSpend = 0;
    filtered.forEach(c => {
      const custSales = sales.filter(s => s.customerId === c.id || s.customerName.toLowerCase() === c.name.toLowerCase());
      totalCustomerSpend += custSales.reduce((sum, s) => sum + Number(s.netTotal), 0);
    });

    reportTitleEl.textContent = 'Customer Directory & Account Demographics';
    reportSubtitleEl.textContent = `Comprehensive Registry of Commercial & Retail Buyers (${totalCount} Records)`;

    reportKpiContainer.innerHTML = `
      <div class="stat-card" style="--card-accent: var(--primary);">
        <div class="stat-info">
          <span class="stat-label">Total Accounts</span>
          <span class="stat-value">${totalCount}</span>
          <span class="stat-subtext positive">Active CRM Database</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent-emerald);">
        <div class="stat-info">
          <span class="stat-label">Retail / Individual</span>
          <span class="stat-value">${individualCount}</span>
          <span class="stat-subtext">Private Automobile Owners</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent);">
        <div class="stat-info">
          <span class="stat-label">Corporate Clients</span>
          <span class="stat-value">${corporateCount}</span>
          <span class="stat-subtext">Fleet &amp; Business Buyers</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent-amber);">
        <div class="stat-info">
          <span class="stat-label">Cumulative Spend</span>
          <span class="stat-value">${ASMS.formatCurrency(totalCustomerSpend)}</span>
          <span class="stat-subtext">Total Lifetime Invoiced</span>
        </div>
      </div>
    `;

    reportTableHead.innerHTML = `
      <tr>
        <th>Customer ID</th>
        <th>Full Name</th>
        <th>Contact Number</th>
        <th>Email Address</th>
        <th>Account Type</th>
        <th>Registered Date</th>
        <th style="text-align: right;">Total Purchases</th>
      </tr>
    `;

    if (filtered.length === 0) {
      reportTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No customer records match this timeframe.</td></tr>`;
      return;
    }

    reportTableBody.innerHTML = filtered
      .map(c => {
        const custSales = sales.filter(s => s.customerId === c.id || s.customerName.toLowerCase() === c.name.toLowerCase());
        const totalSpent = custSales.reduce((sum, s) => sum + Number(s.netTotal), 0);

        return `
        <tr>
          <td style="font-weight: 600;">${c.id}</td>
          <td style="font-weight: 700; color: var(--text-main);">${c.name}</td>
          <td>${c.mobile}</td>
          <td>${c.email || '-'}</td>
          <td><span class="badge ${c.type === 'Corporate' ? 'badge-info' : 'badge-neutral'}">${c.type}</span></td>
          <td>${ASMS.formatDate(c.registeredDate)}</td>
          <td style="text-align: right; font-weight: 700; color: var(--primary);">${ASMS.formatCurrency(totalSpent)}</td>
        </tr>
      `;
      })
      .join('');
  }

  // 4. Vehicle Bookings Report
  function renderBookingsReport() {
    const filtered = bookings.filter(b => isWithinDateRange(b.bookingDate));
    const totalBookings = filtered.length;
    const confirmedCount = filtered.filter(b => b.status === 'Confirmed').length;
    const pendingCount = filtered.filter(b => b.status === 'Pending').length;
    const totalAdvances = filtered.reduce((sum, b) => sum + (Number(b.advanceAmount) || 0), 0);

    reportTitleEl.textContent = 'Vehicle Bookings & Pre-Order Performance';
    reportSubtitleEl.textContent = `Order Fulfillment Pipeline & Advance Deposits Audit`;

    reportKpiContainer.innerHTML = `
      <div class="stat-card" style="--card-accent: var(--primary);">
        <div class="stat-info">
          <span class="stat-label">Total Pre-Orders</span>
          <span class="stat-value">${totalBookings}</span>
          <span class="stat-subtext">Total Booking Volume</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent-emerald);">
        <div class="stat-info">
          <span class="stat-label">Confirmed Pipeline</span>
          <span class="stat-value">${confirmedCount}</span>
          <span class="stat-subtext positive">Awaiting Delivery</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent-amber);">
        <div class="stat-info">
          <span class="stat-label">Pending Approval</span>
          <span class="stat-value">${pendingCount}</span>
          <span class="stat-subtext warning">Loan / Verification</span>
        </div>
      </div>
      <div class="stat-card" style="--card-accent: var(--accent);">
        <div class="stat-info">
          <span class="stat-label">Advances Held</span>
          <span class="stat-value">${ASMS.formatCurrency(totalAdvances)}</span>
          <span class="stat-subtext">Booking Deposits Collected</span>
        </div>
      </div>
    `;

    reportTableHead.innerHTML = `
      <tr>
        <th>Booking ID</th>
        <th>Booking Date</th>
        <th>Customer</th>
        <th>Vehicle Name</th>
        <th style="text-align: right;">Vehicle Price</th>
        <th style="text-align: right;">Advance Paid</th>
        <th>Expected Delivery</th>
        <th>Status</th>
      </tr>
    `;

    if (filtered.length === 0) {
      reportTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">No bookings recorded in this timeframe.</td></tr>`;
      return;
    }

    reportTableBody.innerHTML = filtered
      .map(b => {
        let badge = 'badge-neutral';
        if (b.status === 'Confirmed') badge = 'badge-info';
        else if (b.status === 'Completed') badge = 'badge-success';
        else if (b.status === 'Pending') badge = 'badge-warning';
        else if (b.status === 'Cancelled') badge = 'badge-danger';

        return `
        <tr>
          <td style="font-weight: 700; color: var(--primary);">${b.id}</td>
          <td>${ASMS.formatDate(b.bookingDate)}</td>
          <td style="font-weight: 600;">${b.customerName}</td>
          <td>${b.vehicleName}</td>
          <td style="text-align: right;">${ASMS.formatCurrency(b.vehiclePrice)}</td>
          <td style="text-align: right; font-weight: 700; color: var(--accent-emerald);">${ASMS.formatCurrency(b.advanceAmount)}</td>
          <td>${ASMS.formatDate(b.deliveryDate) || 'Flexible'}</td>
          <td><span class="badge ${badge}">${b.status}</span></td>
        </tr>
      `;
      })
      .join('');
  }

  // Export current report to CSV
  exportBtn.addEventListener('click', () => {
    let exportData = [];
    const dateStamp = new Date().toISOString().slice(0, 10);

    if (activeReportType === 'sales') {
      const filtered = sales.filter(s => isWithinDateRange(s.saleDate));
      exportData = filtered.map(s => ({
        Invoice_No: s.id,
        Date: s.saleDate,
        Customer: s.customerName,
        Phone: s.customerMobile,
        Vehicle: s.vehicleName,
        Payment_Method: s.paymentMethod,
        Base_Price: s.basePrice,
        Discount: s.discount,
        Tax_Amount: s.taxAmount,
        Net_Total: s.netTotal,
        Payment_Status: s.paymentStatus
      }));
      ASMS.exportToCSV(`Sales_Revenue_Report_${dateStamp}`, exportData);
    } else if (activeReportType === 'inventory') {
      exportData = vehicles.map(v => ({
        ID: v.id,
        Name: v.name,
        Brand: v.brand,
        Model: v.model,
        Fuel: v.fuelType,
        Year: v.year,
        Unit_Price: v.price,
        Stock_Units: v.stock,
        Total_Asset_Value: Number(v.price) * Number(v.stock)
      }));
      ASMS.exportToCSV(`Vehicle_Inventory_Audit_${dateStamp}`, exportData);
    } else if (activeReportType === 'customers') {
      const filtered = customers.filter(c => isWithinDateRange(c.registeredDate));
      exportData = filtered.map(c => ({
        Customer_ID: c.id,
        Name: c.name,
        Mobile: c.mobile,
        Email: c.email || '',
        Type: c.type,
        Address: c.address || '',
        Registration_Date: c.registeredDate
      }));
      ASMS.exportToCSV(`Customer_Directory_Report_${dateStamp}`, exportData);
    } else if (activeReportType === 'bookings') {
      const filtered = bookings.filter(b => isWithinDateRange(b.bookingDate));
      exportData = filtered.map(b => ({
        Booking_ID: b.id,
        Date: b.bookingDate,
        Customer: b.customerName,
        Vehicle: b.vehicleName,
        Price: b.vehiclePrice,
        Advance: b.advanceAmount,
        Delivery_Date: b.deliveryDate || '',
        Status: b.status
      }));
      ASMS.exportToCSV(`Vehicle_Bookings_Report_${dateStamp}`, exportData);
    }
  });

  // Print Report Action
  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Report Type Change
  reportTypeSelect.addEventListener('change', () => {
    activeReportType = reportTypeSelect.value;
    renderReport();
  });

  // Date Range Change
  dateRangeSelect.addEventListener('change', () => {
    dateRangeType = dateRangeSelect.value;
    if (dateRangeType === 'custom') {
      customDateGroup.style.display = 'flex';
    } else {
      customDateGroup.style.display = 'none';
      renderReport();
    }
  });

  // Apply custom dates button
  applyDateBtn.addEventListener('click', () => {
    renderReport();
  });

  // Initial load
  renderReport();
});
