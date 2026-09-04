/**
 * Automobile Showroom Management System (ASMS)
 * Module: Vehicle Inventory Management
 * Handles CRUD operations, search, multi-filtering, stock validation, and CSV export.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure authentication
  ASMS.checkAuth();
  ASMS.renderShell('vehicles');

  // State
  let vehicles = ASMS.get(DB_KEYS.VEHICLES, []);
  let filteredVehicles = [...vehicles];
  let currentPage = 1;
  const itemsPerPage = 8;
  let editingVehicleId = null;

  // DOM Elements
  const tableBody = document.getElementById('vehicles-table-body');
  const searchInput = document.getElementById('search-vehicles');
  const brandFilter = document.getElementById('filter-brand');
  const fuelFilter = document.getElementById('filter-fuel');
  const stockFilter = document.getElementById('filter-stock');
  const sortSelect = document.getElementById('sort-vehicles');
  const paginationContainer = document.getElementById('pagination-container');
  const addBtn = document.getElementById('btn-add-vehicle');
  const exportBtn = document.getElementById('btn-export-vehicles');

  // Stat summary counters
  const totalVehiclesCountEl = document.getElementById('stat-total-models');
  const totalStockUnitsEl = document.getElementById('stat-total-units');
  const lowStockCountEl = document.getElementById('stat-low-stock');
  const totalValuationEl = document.getElementById('stat-total-val');

  // Modal Elements
  const vehicleModal = document.getElementById('vehicle-modal');
  const modalTitle = document.getElementById('modal-title');
  const vehicleForm = document.getElementById('vehicle-form');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  // View Details Modal
  const viewModal = document.getElementById('view-vehicle-modal');
  const viewCloseBtn = document.getElementById('view-modal-close');
  const viewDetailsContainer = document.getElementById('view-details-container');

  // Populate dynamic brand filter dropdown from data
  function populateBrandOptions() {
    const brands = [...new Set(vehicles.map(v => v.brand))].sort();
    const currentVal = brandFilter.value;
    brandFilter.innerHTML = '<option value="">All Brands</option>';
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      if (b === currentVal) opt.selected = true;
      brandFilter.appendChild(opt);
    });
  }

  // Update Top Stats
  function updateStats() {
    const totalModels = vehicles.length;
    const totalUnits = vehicles.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    const lowStock = vehicles.filter(v => Number(v.stock) <= 2).length;
    const totalValuation = vehicles.reduce((sum, v) => sum + (Number(v.price || 0) * Number(v.stock || 0)), 0);

    if (totalVehiclesCountEl) totalVehiclesCountEl.textContent = totalModels;
    if (totalStockUnitsEl) totalStockUnitsEl.textContent = `${totalUnits} Units`;
    if (lowStockCountEl) lowStockCountEl.textContent = `${lowStock} Models`;
    if (totalValuationEl) totalValuationEl.textContent = ASMS.formatCurrency(totalValuation);
  }

  // Filter & Sort Logic
  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedBrand = brandFilter.value;
    const selectedFuel = fuelFilter.value;
    const selectedStock = stockFilter.value;
    const sortBy = sortSelect.value;

    filteredVehicles = vehicles.filter(v => {
      // Search match
      const matchSearch =
        !query ||
        v.name.toLowerCase().includes(query) ||
        v.brand.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        (v.vin && v.vin.toLowerCase().includes(query));

      // Brand filter
      const matchBrand = !selectedBrand || v.brand === selectedBrand;

      // Fuel filter
      const matchFuel = !selectedFuel || v.fuelType === selectedFuel;

      // Stock filter
      let matchStock = true;
      if (selectedStock === 'in_stock') matchStock = Number(v.stock) > 2;
      else if (selectedStock === 'low_stock') matchStock = Number(v.stock) > 0 && Number(v.stock) <= 2;
      else if (selectedStock === 'out_stock') matchStock = Number(v.stock) <= 0;

      return matchSearch && matchBrand && matchFuel && matchStock;
    });

    // Sort
    if (sortBy === 'price_asc') {
      filteredVehicles.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price_desc') {
      filteredVehicles.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'stock_desc') {
      filteredVehicles.sort((a, b) => Number(b.stock) - Number(a.stock));
    } else if (sortBy === 'year_desc') {
      filteredVehicles.sort((a, b) => Number(b.year) - Number(a.year));
    } else {
      // Name asc
      filteredVehicles.sort((a, b) => a.name.localeCompare(b.name));
    }

    currentPage = 1;
    renderTable();
  }

  // Render Table & Pagination
  function renderTable() {
    tableBody.innerHTML = '';

    if (filteredVehicles.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <div class="empty-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <div class="empty-title">No Vehicles Found</div>
              <div class="empty-description">Try adjusting your search terms or filters to locate vehicle records.</div>
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('search-vehicles').value=''; document.getElementById('filter-brand').value=''; document.getElementById('filter-fuel').value=''; document.getElementById('filter-stock').value=''; window.resetVehicleFilters();">Clear All Filters</button>
            </div>
          </td>
        </tr>
      `;
      renderPagination(0);
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

    paginatedItems.forEach(v => {
      const tr = document.createElement('tr');

      // Fuel badge class
      const fuelLower = (v.fuelType || 'petrol').toLowerCase();
      let fuelClass = 'fuel-petrol';
      if (fuelLower.includes('diesel')) fuelClass = 'fuel-diesel';
      else if (fuelLower.includes('electric')) fuelClass = 'fuel-electric';
      else if (fuelLower.includes('hybrid')) fuelClass = 'fuel-hybrid';
      else if (fuelLower.includes('cng')) fuelClass = 'fuel-cng';

      // Stock badge
      const stockNum = Number(v.stock);
      let stockBadge = '';
      if (stockNum <= 0) {
        stockBadge = `<span class="badge badge-danger">Out of Stock (0)</span>`;
      } else if (stockNum <= 2) {
        stockBadge = `<span class="badge badge-warning">Low Stock (${stockNum})</span>`;
      } else {
        stockBadge = `<span class="badge badge-success">In Stock (${stockNum})</span>`;
      }

      tr.innerHTML = `
        <td class="primary-cell">
          <div style="font-weight: 700; color: var(--text-main);">${v.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${v.vin || 'VIN: Not specified'}</div>
        </td>
        <td>
          <span style="font-weight: 600;">${v.brand}</span>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${v.model || ''}</div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${getColorHex(v.colour)}; border: 1px solid rgba(0,0,0,0.15);"></span>
            <span>${v.colour}</span>
          </div>
        </td>
        <td>
          <span class="fuel-badge ${fuelClass}">${v.fuelType}</span>
        </td>
        <td>
          <span style="font-weight: 600;">${v.year}</span>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--primary);">${ASMS.formatCurrency(v.price)}</div>
        </td>
        <td>
          ${stockBadge}
        </td>
        <td style="text-align: right;">
          <div style="display: flex; justify-content: flex-end; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" title="View Details" onclick="window.viewVehicle('${v.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="btn btn-secondary btn-sm" title="Edit Vehicle" onclick="window.editVehicle('${v.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
            </button>
            <button class="btn btn-danger btn-sm" title="Delete Vehicle" onclick="window.deleteVehicle('${v.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderPagination(filteredVehicles.length);
  }

  // Color mapper helper for swatch dots
  function getColorHex(colorName) {
    if (!colorName) return '#94a3b8';
    const lower = colorName.toLowerCase();
    if (lower.includes('black')) return '#18181b';
    if (lower.includes('white') || lower.includes('pearl')) return '#f8fafc';
    if (lower.includes('blue')) return '#2563eb';
    if (lower.includes('red')) return '#dc2626';
    if (lower.includes('grey') || lower.includes('gray') || lower.includes('graphite')) return '#64748b';
    if (lower.includes('khaki') || lower.includes('green') || lower.includes('olive')) return '#4d7c0f';
    if (lower.includes('silver')) return '#cbd5e1';
    return '#94a3b8';
  }

  // Render Pagination Controls
  function renderPagination(totalItems) {
    if (!paginationContainer) return;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    let start = (currentPage - 1) * itemsPerPage + 1;
    let end = Math.min(currentPage * itemsPerPage, totalItems);
    if (totalItems === 0) { start = 0; end = 0; }

    paginationContainer.innerHTML = `
      <div style="font-size: 0.8125rem; color: var(--text-muted);">
        Showing <strong>${start}</strong> to <strong>${end}</strong> of <strong>${totalItems}</strong> vehicles
      </div>
      <div class="pagination-controls">
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changeVehiclePage(${currentPage - 1})">
          Previous
        </button>
        ${Array.from({ length: totalPages }, (_, i) => i + 1)
          .map(
            page => `
            <button class="page-btn ${page === currentPage ? 'active' : ''}" onclick="window.changeVehiclePage(${page})">
              ${page}
            </button>
          `
          )
          .join('')}
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changeVehiclePage(${currentPage + 1})">
          Next
        </button>
      </div>
    `;
  }

  // Open Modal for Add
  function openAddModal() {
    editingVehicleId = null;
    modalTitle.textContent = 'Add New Vehicle to Inventory';
    vehicleForm.reset();
    document.getElementById('vehicle-id').value = '';
    document.getElementById('vehicle-year').value = new Date().getFullYear();
    document.getElementById('vehicle-stock').value = '1';
    vehicleModal.classList.add('active');
  }

  // Open Modal for Edit
  window.editVehicle = function(id) {
    const v = vehicles.find(item => item.id === id);
    if (!v) return;

    editingVehicleId = id;
    modalTitle.textContent = `Edit Vehicle: ${v.name}`;
    document.getElementById('vehicle-id').value = v.id;
    document.getElementById('vehicle-name').value = v.name || '';
    document.getElementById('vehicle-brand').value = v.brand || '';
    document.getElementById('vehicle-model').value = v.model || '';
    document.getElementById('vehicle-colour').value = v.colour || '';
    document.getElementById('vehicle-fuel').value = v.fuelType || 'Petrol';
    document.getElementById('vehicle-price').value = v.price || '';
    document.getElementById('vehicle-year').value = v.year || new Date().getFullYear();
    document.getElementById('vehicle-stock').value = v.stock ?? 0;
    document.getElementById('vehicle-category').value = v.category || 'SUV';
    document.getElementById('vehicle-vin').value = v.vin || '';

    vehicleModal.classList.add('active');
  };

  // View Vehicle Detail Modal
  window.viewVehicle = function(id) {
    const v = vehicles.find(item => item.id === id);
    if (!v) return;

    viewDetailsContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1.25rem;">
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--text-main);">${v.name}</h3>
          <div style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.2rem;">ID: ${v.id} | VIN: ${v.vin || 'N/A'}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--primary);">${ASMS.formatCurrency(v.price)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Ex-Showroom Price</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Brand &amp; Make</div>
          <div style="font-size: 0.9375rem; font-weight: 600; color: var(--text-main); margin-top: 0.15rem;">${v.brand}</div>
        </div>
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Model / Variant</div>
          <div style="font-size: 0.9375rem; font-weight: 600; color: var(--text-main); margin-top: 0.15rem;">${v.model}</div>
        </div>
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Exterior Shade</div>
          <div style="font-size: 0.9375rem; font-weight: 600; color: var(--text-main); margin-top: 0.15rem;">${v.colour}</div>
        </div>
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Fuel Powertrain</div>
          <div style="font-size: 0.9375rem; font-weight: 600; color: var(--text-main); margin-top: 0.15rem;">${v.fuelType}</div>
        </div>
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Manufacturing Year</div>
          <div style="font-size: 0.9375rem; font-weight: 600; color: var(--text-main); margin-top: 0.15rem;">${v.year}</div>
        </div>
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Available Stock Units</div>
          <div style="font-size: 0.9375rem; font-weight: 700; color: ${Number(v.stock) <= 2 ? 'var(--accent-amber)' : 'var(--accent-emerald)'}; margin-top: 0.15rem;">
            ${v.stock} Units ${Number(v.stock) <= 2 ? '(Low Stock Alert)' : ''}
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('view-vehicle-modal').classList.remove('active')">Close</button>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('view-vehicle-modal').classList.remove('active'); window.editVehicle('${v.id}')">Edit Vehicle</button>
      </div>
    `;

    viewModal.classList.add('active');
  };

  // Close Form Modal
  function closeFormModal() {
    vehicleModal.classList.remove('active');
    editingVehicleId = null;
    vehicleForm.reset();
  }

  // Delete Vehicle
  window.deleteVehicle = function(id) {
    const v = vehicles.find(item => item.id === id);
    if (!v) return;

    ASMS.confirm(
      'Delete Vehicle Record',
      `Are you sure you want to remove "${v.name}" from the inventory? This cannot be undone.`,
      () => {
        vehicles = vehicles.filter(item => item.id !== id);
        ASMS.set(DB_KEYS.VEHICLES, vehicles);
        ASMS.toast(`Vehicle "${v.name}" removed successfully.`, 'success');
        populateBrandOptions();
        updateStats();
        applyFilters();
      }
    );
  };

  // Handle Form Submission (Add / Edit)
  vehicleForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('vehicle-name').value.trim();
    const brand = document.getElementById('vehicle-brand').value.trim();
    const model = document.getElementById('vehicle-model').value.trim();
    const colour = document.getElementById('vehicle-colour').value.trim();
    const fuelType = document.getElementById('vehicle-fuel').value;
    const price = parseFloat(document.getElementById('vehicle-price').value);
    const year = parseInt(document.getElementById('vehicle-year').value, 10);
    const stock = parseInt(document.getElementById('vehicle-stock').value, 10);
    const category = document.getElementById('vehicle-category').value;
    const vin = document.getElementById('vehicle-vin').value.trim() || `VIN-${Date.now().toString().slice(-8)}`;

    // Validations
    if (!name || !brand || !model || !colour || isNaN(price) || isNaN(year) || isNaN(stock)) {
      ASMS.toast('Please fill out all required fields correctly.', 'error');
      return;
    }

    if (price <= 0) {
      ASMS.toast('Price must be a valid positive amount.', 'error');
      return;
    }

    if (stock < 0) {
      ASMS.toast('Stock quantity cannot be negative.', 'error');
      return;
    }

    if (editingVehicleId) {
      // Update existing
      const index = vehicles.findIndex(v => v.id === editingVehicleId);
      if (index !== -1) {
        vehicles[index] = {
          ...vehicles[index],
          name,
          brand,
          model,
          colour,
          fuelType,
          price,
          year,
          stock,
          category,
          vin
        };
        ASMS.set(DB_KEYS.VEHICLES, vehicles);
        ASMS.toast(`Vehicle "${name}" updated successfully.`, 'success');
      }
    } else {
      // Add new
      const newVehicle = {
        id: ASMS.generateId('VEH'),
        name,
        brand,
        model,
        colour,
        fuelType,
        price,
        year,
        stock,
        category,
        vin
      };
      vehicles.unshift(newVehicle);
      ASMS.set(DB_KEYS.VEHICLES, vehicles);
      ASMS.toast(`Vehicle "${name}" added to inventory.`, 'success');
    }

    closeFormModal();
    populateBrandOptions();
    updateStats();
    applyFilters();
  });

  // Global Page Switcher
  window.changeVehiclePage = function(page) {
    currentPage = page;
    renderTable();
  };

  // Clear filters helper
  window.resetVehicleFilters = function() {
    applyFilters();
  };

  // Export to CSV
  exportBtn.addEventListener('click', () => {
    const exportData = vehicles.map(v => ({
      ID: v.id,
      Name: v.name,
      Brand: v.brand,
      Model: v.model,
      Colour: v.colour,
      Fuel_Type: v.fuelType,
      Year: v.year,
      Ex_Showroom_Price: v.price,
      Stock_Units: v.stock,
      Category: v.category,
      Chassis_VIN: v.vin
    }));
    ASMS.exportToCSV(`Vehicle_Inventory_${new Date().toISOString().slice(0, 10)}`, exportData);
  });

  // Event Listeners
  addBtn.addEventListener('click', openAddModal);
  modalCloseBtn.addEventListener('click', closeFormModal);
  modalCancelBtn.addEventListener('click', closeFormModal);
  viewCloseBtn.addEventListener('click', () => viewModal.classList.remove('active'));

  vehicleModal.addEventListener('click', e => {
    if (e.target === vehicleModal) closeFormModal();
  });

  viewModal.addEventListener('click', e => {
    if (e.target === viewModal) viewModal.classList.remove('active');
  });

  searchInput.addEventListener('input', applyFilters);
  brandFilter.addEventListener('change', applyFilters);
  fuelFilter.addEventListener('change', applyFilters);
  stockFilter.addEventListener('change', applyFilters);
  sortSelect.addEventListener('change', applyFilters);

  // Initialize
  populateBrandOptions();
  updateStats();
  applyFilters();
});
