/**
 * Automobile Showroom Management System (ASMS)
 * Module: Executive Dashboard
 * Live KPI computations, Vanilla Canvas API interactive charts, recent activity logs.
 */

document.addEventListener('DOMContentLoaded', () => {
  ASMS.checkAuth();
  ASMS.renderShell('dashboard');

  // Load Data
  const vehicles = ASMS.get(DB_KEYS.VEHICLES, []);
  const customers = ASMS.get(DB_KEYS.CUSTOMERS, []);
  const bookings = ASMS.get(DB_KEYS.BOOKINGS, []);
  const sales = ASMS.get(DB_KEYS.SALES, []);

  // Compute Metrics
  const totalVehiclesCount = vehicles.length;
  const totalStockUnits = vehicles.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const totalCustomersCount = customers.length;
  const totalBookingsCount = bookings.length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'Confirmed').length;
  const totalSalesRevenue = sales.reduce((sum, s) => sum + (Number(s.netTotal) || 0), 0);
  const totalCarsSold = sales.length;
  const lowStockCount = vehicles.filter(v => Number(v.stock) <= 2).length;

  // Populate Metric Cards
  document.getElementById('dash-total-vehicles').textContent = totalVehiclesCount;
  document.getElementById('dash-stock-units').textContent = `${totalStockUnits} Available Units`;

  document.getElementById('dash-total-customers').textContent = totalCustomersCount;
  document.getElementById('dash-customers-sub').textContent = `${customers.filter(c => c.type === 'Corporate').length} Corporate Accounts`;

  document.getElementById('dash-total-bookings').textContent = totalBookingsCount;
  document.getElementById('dash-bookings-sub').textContent = `${confirmedBookingsCount} Confirmed Deliveries`;

  document.getElementById('dash-total-sales').textContent = ASMS.formatCurrency(totalSalesRevenue);
  document.getElementById('dash-sales-sub').textContent = `${totalCarsSold} Invoiced (${ASMS.formatCompact(totalSalesRevenue)})`;

  // Low stock alert banner
  const alertContainer = document.getElementById('dash-low-stock-alert');
  if (alertContainer) {
    if (lowStockCount > 0) {
      alertContainer.style.display = 'flex';
      document.getElementById('low-stock-alert-text').textContent =
        `Inventory Alert: ${lowStockCount} vehicle model(s) have 2 or fewer units left in showroom stock.`;
    } else {
      alertContainer.style.display = 'none';
    }
  }

  // Render Recent Bookings Table
  const recentBookingsBody = document.getElementById('recent-bookings-body');
  if (recentBookingsBody) {
    const recentBks = bookings.slice(0, 4);
    if (recentBks.length === 0) {
      recentBookingsBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No recent bookings recorded.</td></tr>`;
    } else {
      recentBookingsBody.innerHTML = recentBks
        .map(b => {
          let badge = 'badge-neutral';
          if (b.status === 'Confirmed') badge = 'badge-info';
          else if (b.status === 'Completed') badge = 'badge-success';
          else if (b.status === 'Pending') badge = 'badge-warning';
          else if (b.status === 'Cancelled') badge = 'badge-danger';

          return `
          <tr>
            <td>
              <div style="font-weight: 700; color: var(--text-main); font-size: 0.85rem;">${b.customerName}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${b.id}</div>
            </td>
            <td>
              <div style="font-weight: 600; font-size: 0.85rem;">${b.vehicleName}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${ASMS.formatDate(b.bookingDate)}</div>
            </td>
            <td>
              <span style="font-weight: 700; color: var(--accent-emerald); font-size: 0.85rem;">${ASMS.formatCurrency(b.advanceAmount)}</span>
            </td>
            <td>
              <span class="badge ${badge}">${b.status}</span>
            </td>
          </tr>
        `;
        })
        .join('');
    }
  }

  // Render Recent Sales Table
  const recentSalesBody = document.getElementById('recent-sales-body');
  if (recentSalesBody) {
    const recentSl = sales.slice(0, 4);
    if (recentSl.length === 0) {
      recentSalesBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No recent sales invoices recorded.</td></tr>`;
    } else {
      recentSalesBody.innerHTML = recentSl
        .map(s => `
          <tr>
            <td>
              <div style="font-weight: 700; color: var(--primary); font-family: var(--font-heading); font-size: 0.85rem;">${s.id}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${ASMS.formatDate(s.saleDate)}</div>
            </td>
            <td>
              <div style="font-weight: 600; font-size: 0.85rem;">${s.customerName}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${s.vehicleName}</div>
            </td>
            <td>
              <div style="font-weight: 700; color: var(--text-main); font-size: 0.85rem;">${ASMS.formatCurrency(s.netTotal)}</div>
            </td>
            <td>
              <span class="badge ${s.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger'}">${s.paymentStatus}</span>
            </td>
          </tr>
        `)
        .join('');
    }
  }

  // Initialize Canvas Charts
  initSalesTrendChart(sales);
  initFuelDistributionChart(vehicles);
});

/**
 * High-DPI Canvas Line & Area Chart for Monthly Sales & Bookings Trend
 */
function initSalesTrendChart(sales) {
  const canvas = document.getElementById('sales-trend-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // Months labels and realistic showroom monthly turnover (INR)
  const currentMonthSales = sales.reduce((sum, s) => sum + (Number(s.netTotal) || 0), 0);
  const labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const dataPoints = [3850000, 4620000, 5400000, 4150000, 4800000, currentMonthSales || 6490300];

  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const maxVal = Math.max(...dataPoints) * 1.15;

  // Grid Lines
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = padTop + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    // Y Axis Labels
    const val = maxVal - (maxVal / 4) * i;
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`₹${(val / 100000).toFixed(0)}L`, padLeft - 10, y);
  }

  // Calculate coordinates
  const coords = dataPoints.map((val, idx) => {
    const x = padLeft + (chartWidth / (dataPoints.length - 1)) * idx;
    const y = padTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val };
  });

  // Area Fill Gradient
  const grad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
  grad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
  grad.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);
  coords.forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.lineTo(coords[coords.length - 1].x, height - padBottom);
  ctx.lineTo(coords[0].x, height - padBottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line Stroke
  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);
  coords.forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Points & Labels
  coords.forEach((pt, idx) => {
    // Point circle
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3b82f6';
    ctx.stroke();

    // X Axis Label
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '600 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(labels[idx], pt.x, height - padBottom + 12);
  });
}

/**
 * High-DPI Canvas Donut Chart for Fuel Types Inventory Distribution
 */
function initFuelDistributionChart(vehicles) {
  const canvas = document.getElementById('fuel-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  // Aggregate fuel counts
  const fuelCounts = {};
  vehicles.forEach(v => {
    const f = v.fuelType || 'Petrol';
    fuelCounts[f] = (fuelCounts[f] || 0) + (Number(v.stock) || 1);
  });

  const total = Object.values(fuelCounts).reduce((a, b) => a + b, 0) || 1;

  const colors = {
    Petrol: '#f59e0b',
    Diesel: '#64748b',
    Electric: '#10b981',
    Hybrid: '#3b82f6',
    CNG: '#06b6d4'
  };

  const centerX = width / 2;
  const centerY = height / 2 - 15;
  const outerRadius = Math.min(centerX, centerY) - 15;
  const innerRadius = outerRadius * 0.62;

  let startAngle = -Math.PI / 2;

  const entries = Object.entries(fuelCounts);

  entries.forEach(([fuel, count]) => {
    const sliceAngle = (count / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = colors[fuel] || '#94a3b8';
    ctx.fill();

    startAngle = endAngle;
  });

  // Center Text (Total Units)
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
  ctx.font = '800 20px Space Grotesk, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${total}`, centerX, centerY - 8);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
  ctx.fillText('UNITS', centerX, centerY + 14);

  // Legend
  const legendContainer = document.getElementById('fuel-legend');
  if (legendContainer) {
    legendContainer.innerHTML = entries
      .map(([fuel, count]) => `
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem;">
          <div style="display: flex; align-items: center; gap: 0.45rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${colors[fuel] || '#94a3b8'};"></span>
            <span style="font-weight: 500; color: var(--text-secondary);">${fuel}</span>
          </div>
          <span style="font-weight: 700; color: var(--text-main);">${count} Units (${Math.round((count/total)*100)}%)</span>
        </div>
      `)
      .join('');
  }
}

// Redraw charts cleanly on window resize or theme change
let chartResizeDebounce;
function refreshCharts() {
  const sales = ASMS.get(DB_KEYS.SALES, []);
  const vehicles = ASMS.get(DB_KEYS.VEHICLES, []);
  initSalesTrendChart(sales);
  initFuelDistributionChart(vehicles);
}

window.addEventListener('resize', () => {
  clearTimeout(chartResizeDebounce);
  chartResizeDebounce = setTimeout(refreshCharts, 200);
});

window.addEventListener('themeChanged', () => {
  refreshCharts();
});
