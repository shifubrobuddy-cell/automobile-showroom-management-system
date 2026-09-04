/**
 * Automobile Showroom Management System (ASMS)
 * Module: Customer Management
 * Handles customer records, linked purchase history, active bookings, and contact management.
 */

document.addEventListener('DOMContentLoaded', () => {
  ASMS.checkAuth();
  ASMS.renderShell('customers');

  // State
  let customers = ASMS.get(DB_KEYS.CUSTOMERS, []);
  let sales = ASMS.get(DB_KEYS.SALES, []);
  let bookings = ASMS.get(DB_KEYS.BOOKINGS, []);
  let filteredCustomers = [...customers];
  let currentPage = 1;
  const itemsPerPage = 8;
  let editingCustomerId = null;

  // DOM Elements
  const tableBody = document.getElementById('customers-table-body');
  const searchInput = document.getElementById('search-customers');
  const typeFilter = document.getElementById('filter-customer-type');
  const paginationContainer = document.getElementById('pagination-container');
  const addBtn = document.getElementById('btn-add-customer');
  const exportBtn = document.getElementById('btn-export-customers');

  // Stats
  const statTotalCustomers = document.getElementById('stat-total-customers');
  const statIndividualCustomers = document.getElementById('stat-individual-customers');
  const statCorporateCustomers = document.getElementById('stat-corporate-customers');

  // Modals
  const customerModal = document.getElementById('customer-modal');
  const modalTitle = document.getElementById('modal-title');
  const customerForm = document.getElementById('customer-form');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  // Profile Modal
  const profileModal = document.getElementById('profile-modal');
  const profileCloseBtn = document.getElementById('profile-modal-close');
  const profileDetailsContainer = document.getElementById('profile-details-container');

  // Update Stats
  function updateStats() {
    if (statTotalCustomers) statTotalCustomers.textContent = customers.length;
    if (statIndividualCustomers) {
      statIndividualCustomers.textContent = customers.filter(c => c.type !== 'Corporate').length;
    }
    if (statCorporateCustomers) {
      statCorporateCustomers.textContent = customers.filter(c => c.type === 'Corporate').length;
    }
  }

  // Filter Logic
  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;

    filteredCustomers = customers.filter(c => {
      const matchSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.mobile.includes(query) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.address && c.address.toLowerCase().includes(query));

      const matchType = !selectedType || c.type === selectedType;
      return matchSearch && matchType;
    });

    currentPage = 1;
    renderTable();
  }

  // Render Table
  function renderTable() {
    tableBody.innerHTML = '';

    if (filteredCustomers.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <div class="empty-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
              </div>
              <div class="empty-title">No Customers Found</div>
              <div class="empty-description">Try adjusting your search criteria or register a new customer.</div>
            </div>
          </td>
        </tr>
      `;
      renderPagination(0);
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    paginatedItems.forEach(c => {
      // Find linked purchases
      const customerPurchases = sales.filter(s => s.customerId === c.id || s.customerName.toLowerCase() === c.name.toLowerCase());
      const customerBookings = bookings.filter(b => b.customerId === c.id || b.customerName.toLowerCase() === c.name.toLowerCase());

      const totalSpent = customerPurchases.reduce((sum, s) => sum + (Number(s.netTotal) || 0), 0);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="primary-cell">
          <div style="font-weight: 700; color: var(--text-main);">${c.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">ID: ${c.id}</div>
        </td>
        <td>
          <div style="font-weight: 600;">${c.mobile}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${c.email || 'No email provided'}</div>
        </td>
        <td>
          <span class="badge ${c.type === 'Corporate' ? 'badge-info' : 'badge-neutral'}">
            ${c.type || 'Individual'}
          </span>
        </td>
        <td>
          <div style="font-size: 0.8125rem; max-width: 220px; white-space: normal;">
            ${c.address || 'Address not specified'}
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0.15rem;">
            <span style="font-weight: 600; color: var(--text-main);">${customerPurchases.length} Purchase(s)</span>
            <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700;">${ASMS.formatCurrency(totalSpent)}</span>
          </div>
        </td>
        <td>
          <span style="font-size: 0.8125rem; color: var(--text-secondary);">${ASMS.formatDate(c.registeredDate)}</span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; justify-content: flex-end; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" title="View Customer Profile" onclick="window.viewCustomerProfile('${c.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="btn btn-secondary btn-sm" title="Edit Customer" onclick="window.editCustomer('${c.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
            </button>
            <button class="btn btn-danger btn-sm" title="Delete Customer" onclick="window.deleteCustomer('${c.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderPagination(filteredCustomers.length);
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
        Showing <strong>${start}</strong> to <strong>${end}</strong> of <strong>${totalItems}</strong> customers
      </div>
      <div class="pagination-controls">
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changeCustomerPage(${currentPage - 1})">
          Previous
        </button>
        ${Array.from({ length: totalPages }, (_, i) => i + 1)
          .map(
            page => `
            <button class="page-btn ${page === currentPage ? 'active' : ''}" onclick="window.changeCustomerPage(${page})">
              ${page}
            </button>
          `
          )
          .join('')}
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changeCustomerPage(${currentPage + 1})">
          Next
        </button>
      </div>
    `;
  }

  // Open Add Modal
  function openAddModal() {
    editingCustomerId = null;
    modalTitle.textContent = 'Register New Customer';
    customerForm.reset();
    document.getElementById('customer-id').value = '';
    customerModal.classList.add('active');
  }

  // Open Edit Modal
  window.editCustomer = function(id) {
    const c = customers.find(item => item.id === id);
    if (!c) return;

    editingCustomerId = id;
    modalTitle.textContent = `Edit Customer: ${c.name}`;
    document.getElementById('customer-id').value = c.id;
    document.getElementById('customer-name').value = c.name || '';
    document.getElementById('customer-mobile').value = c.mobile || '';
    document.getElementById('customer-email').value = c.email || '';
    document.getElementById('customer-type').value = c.type || 'Individual';
    document.getElementById('customer-address').value = c.address || '';

    customerModal.classList.add('active');
  };

  // View Customer Profile & Purchase History
  window.viewCustomerProfile = function(id) {
    const c = customers.find(item => item.id === id);
    if (!c) return;

    // Fetch linked history
    sales = ASMS.get(DB_KEYS.SALES, []);
    bookings = ASMS.get(DB_KEYS.BOOKINGS, []);

    const customerSales = sales.filter(s => s.customerId === c.id || s.customerName.toLowerCase() === c.name.toLowerCase());
    const customerBookings = bookings.filter(b => b.customerId === c.id || b.customerName.toLowerCase() === c.name.toLowerCase());

    const totalSpent = customerSales.reduce((sum, s) => sum + (Number(s.netTotal) || 0), 0);

    let salesRowsHtml = '';
    if (customerSales.length === 0) {
      salesRowsHtml = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1rem;">No purchase history found for this customer.</td></tr>`;
    } else {
      customerSales.forEach(s => {
        salesRowsHtml += `
          <tr>
            <td style="font-weight: 600;">${s.id}</td>
            <td>${s.vehicleName}</td>
            <td>${ASMS.formatDate(s.saleDate)}</td>
            <td style="font-weight: 700; color: var(--primary); text-align: right;">${ASMS.formatCurrency(s.netTotal)}</td>
          </tr>
        `;
      });
    }

    let bookingsRowsHtml = '';
    if (customerBookings.length === 0) {
      bookingsRowsHtml = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1rem;">No vehicle bookings found for this customer.</td></tr>`;
    } else {
      customerBookings.forEach(b => {
        bookingsRowsHtml += `
          <tr>
            <td style="font-weight: 600;">${b.id}</td>
            <td>${b.vehicleName}</td>
            <td>${ASMS.formatDate(b.bookingDate)}</td>
            <td><span class="badge ${b.status === 'Confirmed' ? 'badge-success' : b.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}">${b.status}</span></td>
          </tr>
        `;
      });
    }

    profileDetailsContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1.25rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
        <div style="width: 56px; height: 56px; border-radius: var(--radius-pill); background: linear-gradient(135deg, #2563eb, #38bdf8); color: #fff; font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; justify-content: center;">
          ${c.name[0]}
        </div>
        <div style="flex: 1;">
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.15rem;">${c.name}</h3>
          <div style="font-size: 0.8125rem; color: var(--text-muted);">
            Customer ID: <strong>${c.id}</strong> | Type: <strong>${c.type}</strong> | Registered: <strong>${ASMS.formatDate(c.registeredDate)}</strong>
          </div>
        </div>
        <div style="text-align: right; background: var(--bg-surface); padding: 0.5rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Lifetime Value</div>
          <div style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: var(--accent-emerald);">${ASMS.formatCurrency(totalSpent)}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Mobile Number</div>
          <div style="font-size: 0.9375rem; font-weight: 600; color: var(--text-main); margin-top: 0.15rem;">${c.mobile}</div>
        </div>
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Email Address</div>
          <div style="font-size: 0.9375rem; font-weight: 600; color: var(--text-main); margin-top: 0.15rem;">${c.email || 'None'}</div>
        </div>
        <div style="background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); grid-column: span 2;">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Residential / Office Address</div>
          <div style="font-size: 0.9375rem; color: var(--text-main); margin-top: 0.15rem;">${c.address || 'Address not recorded.'}</div>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main); display: flex; align-items: center; justify-content: space-between;">
          <span>Linked Purchase History (Invoices)</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">${customerSales.length} record(s)</span>
        </h4>
        <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
            <thead>
              <tr style="background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle);">
                <th style="padding: 0.5rem 0.75rem; text-align: left;">Invoice #</th>
                <th style="padding: 0.5rem 0.75rem; text-align: left;">Vehicle Purchased</th>
                <th style="padding: 0.5rem 0.75rem; text-align: left;">Date</th>
                <th style="padding: 0.5rem 0.75rem; text-align: right;">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              ${salesRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <h4 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main); display: flex; align-items: center; justify-content: space-between;">
          <span>Booking Records</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">${customerBookings.length} booking(s)</span>
        </h4>
        <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
            <thead>
              <tr style="background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle);">
                <th style="padding: 0.5rem 0.75rem; text-align: left;">Booking ID</th>
                <th style="padding: 0.5rem 0.75rem; text-align: left;">Vehicle Model</th>
                <th style="padding: 0.5rem 0.75rem; text-align: left;">Booking Date</th>
                <th style="padding: 0.5rem 0.75rem; text-align: left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${bookingsRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    profileModal.classList.add('active');
  };

  // Close Form Modal
  function closeFormModal() {
    customerModal.classList.remove('active');
    editingCustomerId = null;
    customerForm.reset();
  }

  // Delete Customer
  window.deleteCustomer = function(id) {
    const c = customers.find(item => item.id === id);
    if (!c) return;

    ASMS.confirm(
      'Delete Customer Record',
      `Are you sure you want to delete customer "${c.name}"? This action cannot be reversed.`,
      () => {
        customers = customers.filter(item => item.id !== id);
        ASMS.set(DB_KEYS.CUSTOMERS, customers);
        ASMS.toast(`Customer "${c.name}" deleted.`, 'success');
        updateStats();
        applyFilters();
      }
    );
  };

  // Form Submission
  customerForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const mobile = document.getElementById('customer-mobile').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const type = document.getElementById('customer-type').value;
    const address = document.getElementById('customer-address').value.trim();

    // Validation
    if (!name || !mobile) {
      ASMS.toast('Name and Mobile Number are required.', 'error');
      return;
    }

    if (!/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      ASMS.toast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ASMS.toast('Please enter a valid email address.', 'error');
      return;
    }

    if (editingCustomerId) {
      const index = customers.findIndex(c => c.id === editingCustomerId);
      if (index !== -1) {
        customers[index] = {
          ...customers[index],
          name,
          mobile,
          email,
          type,
          address
        };
        ASMS.set(DB_KEYS.CUSTOMERS, customers);
        ASMS.toast(`Customer "${name}" updated successfully.`, 'success');
      }
    } else {
      const newCustomer = {
        id: ASMS.generateId('CUST'),
        name,
        mobile,
        email,
        type,
        address,
        registeredDate: new Date().toISOString().slice(0, 10)
      };
      customers.unshift(newCustomer);
      ASMS.set(DB_KEYS.CUSTOMERS, customers);
      ASMS.toast(`Customer "${name}" registered successfully.`, 'success');
    }

    closeFormModal();
    updateStats();
    applyFilters();
  });

  // Global Page Switcher
  window.changeCustomerPage = function(page) {
    currentPage = page;
    renderTable();
  };

  // Export to CSV
  exportBtn.addEventListener('click', () => {
    const exportData = customers.map(c => ({
      ID: c.id,
      Name: c.name,
      Mobile: c.mobile,
      Email: c.email || '',
      Type: c.type,
      Address: c.address || '',
      Registration_Date: c.registeredDate
    }));
    ASMS.exportToCSV(`Customer_Directory_${new Date().toISOString().slice(0, 10)}`, exportData);
  });

  // Event Listeners
  addBtn.addEventListener('click', openAddModal);
  modalCloseBtn.addEventListener('click', closeFormModal);
  modalCancelBtn.addEventListener('click', closeFormModal);
  profileCloseBtn.addEventListener('click', () => profileModal.classList.remove('active'));

  customerModal.addEventListener('click', e => {
    if (e.target === customerModal) closeFormModal();
  });

  profileModal.addEventListener('click', e => {
    if (e.target === profileModal) profileModal.classList.remove('active');
  });

  searchInput.addEventListener('input', applyFilters);
  typeFilter.addEventListener('change', applyFilters);

  // Init
  updateStats();
  applyFilters();
});
