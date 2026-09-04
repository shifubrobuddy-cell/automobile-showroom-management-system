/**
 * Automobile Showroom Management System (ASMS)
 * Module: Vehicle Booking & Pre-Orders
 * Handles booking creation, status updates, delivery schedules, and conversion to sales.
 */

document.addEventListener('DOMContentLoaded', () => {
  ASMS.checkAuth();
  ASMS.renderShell('bookings');

  // State
  let bookings = ASMS.get(DB_KEYS.BOOKINGS, []);
  let customers = ASMS.get(DB_KEYS.CUSTOMERS, []);
  let vehicles = ASMS.get(DB_KEYS.VEHICLES, []);
  let filteredBookings = [...bookings];
  let currentPage = 1;
  const itemsPerPage = 8;
  let editingBookingId = null;

  // DOM Elements
  const tableBody = document.getElementById('bookings-table-body');
  const searchInput = document.getElementById('search-bookings');
  const statusFilter = document.getElementById('filter-booking-status');
  const paginationContainer = document.getElementById('pagination-container');
  const addBtn = document.getElementById('btn-add-booking');
  const exportBtn = document.getElementById('btn-export-bookings');

  // Stats
  const statTotalBookings = document.getElementById('stat-total-bookings');
  const statConfirmedBookings = document.getElementById('stat-confirmed-bookings');
  const statPendingBookings = document.getElementById('stat-pending-bookings');
  const statAdvancesCollected = document.getElementById('stat-advances-collected');

  // Booking Modal
  const bookingModal = document.getElementById('booking-modal');
  const modalTitle = document.getElementById('modal-title');
  const bookingForm = document.getElementById('booking-form');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  const customerSelect = document.getElementById('booking-customer');
  const vehicleSelect = document.getElementById('booking-vehicle');
  const vehiclePriceNote = document.getElementById('vehicle-price-hint');

  // Populate Dropdowns
  function populateDropdowns() {
    customers = ASMS.get(DB_KEYS.CUSTOMERS, []);
    vehicles = ASMS.get(DB_KEYS.VEHICLES, []);

    // Customers
    customerSelect.innerHTML = '<option value="">-- Select Registered Customer --</option>';
    customers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.mobile}) - ${c.type}`;
      customerSelect.appendChild(opt);
    });

    // Vehicles
    vehicleSelect.innerHTML = '<option value="">-- Select Available Vehicle --</option>';
    vehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      const stockText = Number(v.stock) <= 0 ? ' [OUT OF STOCK]' : ` [Stock: ${v.stock}]`;
      opt.textContent = `${v.name} (${v.brand}) - ${ASMS.formatCurrency(v.price)}${stockText}`;
      opt.dataset.price = v.price;
      opt.dataset.name = v.name;
      opt.dataset.stock = v.stock;
      vehicleSelect.appendChild(opt);
    });
  }

  // Update Stats
  function updateStats() {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const totalAdvances = bookings.reduce((sum, b) => sum + (Number(b.advanceAmount) || 0), 0);

    if (statTotalBookings) statTotalBookings.textContent = total;
    if (statConfirmedBookings) statConfirmedBookings.textContent = `${confirmed} Confirmed`;
    if (statPendingBookings) statPendingBookings.textContent = `${pending} Pending`;
    if (statAdvancesCollected) statAdvancesCollected.textContent = ASMS.formatCurrency(totalAdvances);
  }

  // Vehicle select event to display price hint
  vehicleSelect.addEventListener('change', () => {
    const selectedOpt = vehicleSelect.options[vehicleSelect.selectedIndex];
    if (selectedOpt && selectedOpt.dataset.price) {
      vehiclePriceNote.textContent = `Ex-Showroom Price: ${ASMS.formatCurrency(selectedOpt.dataset.price)} | Available: ${selectedOpt.dataset.stock} Units`;
    } else {
      vehiclePriceNote.textContent = '';
    }
  });

  // Filter Logic
  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    filteredBookings = bookings.filter(b => {
      const matchSearch =
        !query ||
        b.id.toLowerCase().includes(query) ||
        b.customerName.toLowerCase().includes(query) ||
        b.vehicleName.toLowerCase().includes(query) ||
        (b.customerPhone && b.customerPhone.includes(query));

      const matchStatus = !selectedStatus || b.status === selectedStatus;
      return matchSearch && matchStatus;
    });

    currentPage = 1;
    renderTable();
  }

  // Render Table
  function renderTable() {
    tableBody.innerHTML = '';

    if (filteredBookings.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <div class="empty-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div class="empty-title">No Bookings Found</div>
              <div class="empty-description">Create a new vehicle pre-order or adjust your active filters.</div>
            </div>
          </td>
        </tr>
      `;
      renderPagination(0);
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

    paginatedItems.forEach(b => {
      // Badge styling
      let badgeClass = 'badge-neutral';
      if (b.status === 'Confirmed') badgeClass = 'badge-info';
      else if (b.status === 'Pending') badgeClass = 'badge-warning';
      else if (b.status === 'Completed') badgeClass = 'badge-success';
      else if (b.status === 'Cancelled') badgeClass = 'badge-danger';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="primary-cell">
          <div style="font-weight: 700; color: var(--text-main);">${b.id}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${ASMS.formatDate(b.bookingDate)}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${b.customerName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${b.customerPhone || ''}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${b.vehicleName}</div>
          <div style="font-size: 0.75rem; color: var(--primary); font-weight: 700;">${ASMS.formatCurrency(b.vehiclePrice)}</div>
        </td>
        <td>
          <span style="font-weight: 700; color: var(--accent-emerald);">${ASMS.formatCurrency(b.advanceAmount)}</span>
        </td>
        <td>
          <span style="font-size: 0.8125rem; color: var(--text-secondary);">${ASMS.formatDate(b.deliveryDate) || 'Flexible'}</span>
        </td>
        <td>
          <span class="badge ${badgeClass}">${b.status}</span>
        </td>
        <td style="max-width: 180px; font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${b.notes || 'None'}
        </td>
        <td style="text-align: right;">
          <div style="display: flex; justify-content: flex-end; gap: 0.35rem;">
            ${b.status !== 'Completed' && b.status !== 'Cancelled' ? `
              <button class="btn btn-success btn-sm" title="Convert Booking to Completed Sale" onclick="window.convertToSale('${b.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <span>Sale</span>
              </button>
            ` : ''}
            <button class="btn btn-secondary btn-sm" title="Edit Booking" onclick="window.editBooking('${b.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
            </button>
            <button class="btn btn-danger btn-sm" title="Delete Booking" onclick="window.deleteBooking('${b.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderPagination(filteredBookings.length);
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
        Showing <strong>${start}</strong> to <strong>${end}</strong> of <strong>${totalItems}</strong> bookings
      </div>
      <div class="pagination-controls">
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changeBookingPage(${currentPage - 1})">
          Previous
        </button>
        ${Array.from({ length: totalPages }, (_, i) => i + 1)
          .map(
            page => `
            <button class="page-btn ${page === currentPage ? 'active' : ''}" onclick="window.changeBookingPage(${page})">
              ${page}
            </button>
          `
          )
          .join('')}
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changeBookingPage(${currentPage + 1})">
          Next
        </button>
      </div>
    `;
  }

  // Open Add Modal
  function openAddModal() {
    editingBookingId = null;
    modalTitle.textContent = 'Create New Vehicle Booking';
    bookingForm.reset();
    populateDropdowns();
    document.getElementById('booking-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('booking-delivery-date').value = '';
    document.getElementById('booking-advance').value = '50000';
    document.getElementById('booking-status').value = 'Confirmed';
    vehiclePriceNote.textContent = '';
    bookingModal.classList.add('active');
  }

  // Open Edit Modal
  window.editBooking = function(id) {
    const b = bookings.find(item => item.id === id);
    if (!b) return;

    editingBookingId = id;
    modalTitle.textContent = `Edit Booking ${b.id}`;
    populateDropdowns();

    customerSelect.value = b.customerId;
    vehicleSelect.value = b.vehicleId;
    document.getElementById('booking-date').value = b.bookingDate || '';
    document.getElementById('booking-delivery-date').value = b.deliveryDate || '';
    document.getElementById('booking-advance').value = b.advanceAmount || 0;
    document.getElementById('booking-status').value = b.status || 'Confirmed';
    document.getElementById('booking-notes').value = b.notes || '';

    vehiclePriceNote.textContent = `Vehicle: ${b.vehicleName} | Ex-Showroom: ${ASMS.formatCurrency(b.vehiclePrice)}`;
    bookingModal.classList.add('active');
  };

  // Convert to Sale Action
  window.convertToSale = function(bookingId) {
    const b = bookings.find(item => item.id === bookingId);
    if (!b) return;

    ASMS.confirm(
      'Convert Booking to Sale',
      `Proceed to record sale for "${b.vehicleName}" booked by "${b.customerName}"? You will be redirected to the Sales Management module with pre-filled details.`,
      () => {
        // Save pending sale bridge object in sessionStorage
        sessionStorage.setItem('asms_bridge_sale', JSON.stringify({
          bookingId: b.id,
          customerId: b.customerId,
          vehicleId: b.vehicleId,
          advancePaid: b.advanceAmount
        }));
        window.location.href = './sales.html?bridge=1';
      }
    );
  };

  // Close Form Modal
  function closeFormModal() {
    bookingModal.classList.remove('active');
    editingBookingId = null;
    bookingForm.reset();
  }

  // Delete Booking
  window.deleteBooking = function(id) {
    const b = bookings.find(item => item.id === id);
    if (!b) return;

    ASMS.confirm(
      'Delete Booking',
      `Are you sure you want to remove booking "${b.id}" for ${b.customerName}?`,
      () => {
        bookings = bookings.filter(item => item.id !== id);
        ASMS.set(DB_KEYS.BOOKINGS, bookings);
        ASMS.toast(`Booking ${b.id} deleted.`, 'success');
        updateStats();
        applyFilters();
      }
    );
  };

  // Submit Booking Form
  bookingForm.addEventListener('submit', e => {
    e.preventDefault();

    const customerId = customerSelect.value;
    const vehicleId = vehicleSelect.value;
    const bookingDate = document.getElementById('booking-date').value;
    const deliveryDate = document.getElementById('booking-delivery-date').value;
    const advanceAmount = parseFloat(document.getElementById('booking-advance').value);
    const status = document.getElementById('booking-status').value;
    const notes = document.getElementById('booking-notes').value.trim();

    if (!customerId || !vehicleId || !bookingDate || isNaN(advanceAmount)) {
      ASMS.toast('Please select a customer, vehicle, booking date, and valid advance amount.', 'error');
      return;
    }

    const selectedCust = customers.find(c => c.id === customerId);
    const selectedVeh = vehicles.find(v => v.id === vehicleId);

    if (!selectedCust || !selectedVeh) {
      ASMS.toast('Selected customer or vehicle record not found.', 'error');
      return;
    }

    if (editingBookingId) {
      const idx = bookings.findIndex(b => b.id === editingBookingId);
      if (idx !== -1) {
        bookings[idx] = {
          ...bookings[idx],
          customerId,
          customerName: selectedCust.name,
          customerPhone: selectedCust.mobile,
          vehicleId,
          vehicleName: selectedVeh.name,
          vehiclePrice: selectedVeh.price,
          bookingDate,
          deliveryDate,
          advanceAmount,
          status,
          notes
        };
        ASMS.set(DB_KEYS.BOOKINGS, bookings);
        ASMS.toast(`Booking ${editingBookingId} updated successfully.`, 'success');
      }
    } else {
      const newBooking = {
        id: ASMS.generateId('BK'),
        customerId,
        customerName: selectedCust.name,
        customerPhone: selectedCust.mobile,
        vehicleId,
        vehicleName: selectedVeh.name,
        vehiclePrice: selectedVeh.price,
        bookingDate,
        deliveryDate,
        advanceAmount,
        status,
        notes
      };
      bookings.unshift(newBooking);
      ASMS.set(DB_KEYS.BOOKINGS, bookings);
      ASMS.toast(`New Booking ${newBooking.id} created for ${selectedCust.name}!`, 'success');
    }

    closeFormModal();
    updateStats();
    applyFilters();
  });

  // Global Page Switcher
  window.changeBookingPage = function(page) {
    currentPage = page;
    renderTable();
  };

  // Export to CSV
  exportBtn.addEventListener('click', () => {
    const exportData = bookings.map(b => ({
      Booking_ID: b.id,
      Customer_Name: b.customerName,
      Customer_Phone: b.customerPhone || '',
      Vehicle_Model: b.vehicleName,
      Vehicle_Price: b.vehiclePrice,
      Advance_Paid: b.advanceAmount,
      Booking_Date: b.bookingDate,
      Delivery_Date: b.deliveryDate || '',
      Status: b.status,
      Notes: b.notes || ''
    }));
    ASMS.exportToCSV(`Vehicle_Bookings_${new Date().toISOString().slice(0, 10)}`, exportData);
  });

  // Event Listeners
  addBtn.addEventListener('click', openAddModal);
  modalCloseBtn.addEventListener('click', closeFormModal);
  modalCancelBtn.addEventListener('click', closeFormModal);

  bookingModal.addEventListener('click', e => {
    if (e.target === bookingModal) closeFormModal();
  });

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);

  // Init
  updateStats();
  applyFilters();
});
