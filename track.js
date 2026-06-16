import { fetchPrescriptions, deletePrescription, updatePrescriptionStatus } from './supabaseClient.js';

const STORAGE_KEY = 'eyewearOrders';
const ordersContainer = document.getElementById('ordersContainer');
const filterMaker = document.getElementById('filterMaker');
const filterLensType = document.getElementById('filterLensType');
const filterStatus = document.getElementById('filterStatus');
const filterSearch = document.getElementById('filterSearch');
const clearFiltersButton = document.getElementById('clearFilters');

function normalizeOrder(order) {
  return {
    id: order.order_id || order.id,
    customerName: order.customer_name || order.customerName,
    frameName: order.frame_name || order.frameName || '',
    orderNumber: order.order_number || order.orderNumber,
    maker: order.maker,
    lensType: order.lens_type || order.lensType,
    product: order.product,
    lensIndex: order.lens_index || order.lensIndex || '',
    productAddOn: order.product_add_on || order.productAddOn,
    tint: order.tint,
    rightSphere: order.right_sphere || order.rightSphere,
    leftSphere: order.left_sphere || order.leftSphere,
    rightCylinder: order.right_cylinder || order.rightCylinder,
    leftCylinder: order.left_cylinder || order.leftCylinder,
    rightAxis: order.right_axis || order.rightAxis || '',
    leftAxis: order.left_axis || order.leftAxis || '',
    rightAdd: order.right_add || order.rightAdd,
    leftAdd: order.left_add || order.leftAdd,
    pupillaryDistanceDist: order.pupillary_distance || order.pupillaryDistanceDist || order.pupillaryDistance,
    pupillaryDistanceNear: order.pupillary_distance_near || order.pupillaryDistanceNear,
    status: order.status,
    notes: order.notes,
    wpl: order.wpl,
    crp: order.crp,
    createdAt: order.created_at || order.createdAt,
  };
}

async function loadOrders() {
  try {
    const remoteOrders = await fetchPrescriptions();
    if (!Array.isArray(remoteOrders) || !remoteOrders.length) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const localOrders = JSON.parse(raw);
          if (Array.isArray(localOrders) && localOrders.length) {
            return localOrders;
          }
        } catch (parseError) {
          console.error('Invalid local order data', parseError);
        }
      }
    }
    return (remoteOrders || []).map(normalizeOrder);
  } catch (error) {
    console.warn('Supabase fetch failed, using local orders', error);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (parseError) {
      console.error('Invalid local order data', parseError);
      return [];
    }
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '-';
}

function printPrescription(order) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html>
    <head>
      <title>Prescription ${order.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 10px; color: #222; font-size: 9px; }
        h1 { margin: 0 0 6px; font-size: 18px; }
        h2 { margin: 12px 0 8px; font-size: 11px; }
        .section { margin-bottom: 10px; }
        .summary-table,
        .details-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .summary-table td,
        .details-table th,
        .details-table td { border: 1px solid #888; padding: 5px; }
        .summary-table td { padding: 4px 6px; }
        .details-table th { background: #f3f4f8; text-align: left; font-weight: 600; }
        .notes-box { border: 1px solid #888; border-radius: 6px; padding: 8px; min-height: 45px; }
        .footer { margin-top: 12px; color: #555; font-size: 8.5px; }
      </style>
    </head>
    <body>
      <h1>Prescription</h1>
      <div class="section">
        <table class="summary-table">
          <tr>
            <td><strong>Customer</strong></td>
            <td>${order.customerName}</td>
            <td><strong>Order #</strong></td>
            <td>${order.orderNumber}</td>
          </tr>
          <tr>
            <td><strong>Frame Name</strong></td>
            <td>${order.frameName || '-'}</td>
            <td><strong>Lens Maker</strong></td>
            <td>${order.maker}</td>
          </tr>
          <tr>
            <td><strong>Lens Type</strong></td>
            <td>${order.lensType}</td>
            <td><strong>Product</strong></td>
            <td>${order.product || '-'}${order.lensIndex ? ` (${order.lensIndex} Index)` : ''}</td>
          </tr>
          <tr>
            <td><strong>Add-On</strong></td>
            <td>${order.productAddOn || '-'}</td>
            <td><strong>Tint</strong></td>
            <td>${order.tint || 'Clear'}</td>
          </tr>
          <tr>
            <td><strong>PD Dist</strong></td>
            <td>${order.pupillaryDistanceDist || '-'}</td>
            <td><strong>PD Near</strong></td>
            <td>${order.pupillaryDistanceNear || (order.lensType === 'Progressive' ? '-' : 'NA')}</td>
          </tr>
        </table>
      </div>
      <div class="section">
        <h2>Prescription Details</h2>
        <table class="details-table">
          <thead>
            <tr>
              <th>Eye</th>
              <th>Sphere</th>
              <th>Cylinder</th>
              <th>Axis</th>
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Right</td>
              <td>${order.rightSphere || '-'}</td>
              <td>${order.rightCylinder || '-'}</td>
              <td>${order.rightAxis || '-'}</td>
              <td>${order.rightAdd || '-'}</td>
            </tr>
            <tr>
              <td>Left</td>
              <td>${order.leftSphere || '-'}</td>
              <td>${order.leftCylinder || '-'}</td>
              <td>${order.leftAxis || '-'}</td>
              <td>${order.leftAdd || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="section">
        <h2>Notes</h2>
        <div class="notes-box">${order.notes || 'No additional notes.'}</div>
      </div>
      <div class="footer">
        <p>Generated by Unscene</p>
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

async function getFilteredOrders() {
  const orders = await loadOrders();
  const makerValue = filterMaker.value;
  const lensTypeValue = filterLensType.value;
  const statusValue = filterStatus.value;
  const searchValue = filterSearch.value.trim().toLowerCase();

  return orders.filter((order) => {
    if (makerValue !== 'All' && order.maker !== makerValue) {
      return false;
    }
    if (lensTypeValue !== 'All' && order.lensType !== lensTypeValue) {
      return false;
    }
    if (statusValue !== 'All' && order.status !== statusValue) {
      return false;
    }
    if (searchValue) {
      const combined = `${order.customerName} ${order.orderNumber} ${order.product} ${order.productAddOn}`.toLowerCase();
      return combined.includes(searchValue);
    }
    return true;
  });
}

async function removeOrder(id) {
  try {
    await deletePrescription(id);
  } catch (error) {
    console.warn('Supabase delete failed', error);
  }
  const orders = await loadOrders();
  const updated = orders.filter((order) => order.id !== id);
  saveOrders(updated);
  await renderOrders();
}

async function updateOrderStatus(id, newStatus) {
  try {
    await updatePrescriptionStatus(id, newStatus);
  } catch (error) {
    console.warn('Supabase status update failed', error);
  }
  const orders = await loadOrders();
  const updated = orders.map((order) => {
    if (order.id === id) {
      return { ...order, status: newStatus };
    }
    return order;
  });
  saveOrders(updated);
  await renderOrders();
}

function createTableElement(ordersList, isSentTable) {
  const table = document.createElement('table');
  table.className = 'tracking-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Order #</th>
        <th>Customer</th>
        <th>Frame</th>
        <th>Lens</th>
        <th>Product</th>
        <th>Add-On</th>
        <th>Tint</th>
        <th>Status</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  
  ordersList.forEach((order) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.orderNumber}</td>
      <td>${order.customerName}</td>
      <td>${order.frameName || '-'}</td>
      <td>${order.lensType}</td>
      <td>
        ${order.product || '-'}
        ${order.lensIndex ? ` (${order.lensIndex} Index)` : ''}
        ${(order.wpl || order.crp) ? `<br/><span class="price-info-card">WPL: ₹${order.wpl || '-'} | CRP: ₹${order.crp || '-'}</span>` : ''}
      </td>
      <td>${order.productAddOn || '-'}</td>
      <td>${order.tint || '-'}</td>
      <td><span class="order-status" data-status="${order.status}">${order.status}</span></td>
      <td>${formatDate(order.createdAt)}</td>
      <td class="action-cell"></td>
    `;
    
    const actionCell = row.querySelector('.action-cell');
    
    // Print button
    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print';
    printBtn.className = 'print-btn';
    printBtn.addEventListener('click', () => printPrescription(order));
    actionCell.appendChild(printBtn);
    
    // "With Us" button (only for Sent orders)
    if (isSentTable) {
      const withUsBtn = document.createElement('button');
      withUsBtn.textContent = 'With Us';
      withUsBtn.className = 'with-us-btn';
      withUsBtn.addEventListener('click', () => updateOrderStatus(order.id, 'Delivered'));
      actionCell.appendChild(withUsBtn);
    }
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => removeOrder(order.id));
    actionCell.appendChild(deleteBtn);
    
    tbody.appendChild(row);
  });
  
  return table;
}

async function renderOrders() {
  const orders = await getFilteredOrders();
  ordersContainer.innerHTML = '';

  const selectedMaker = filterMaker.value;
  const makersToRender = selectedMaker === 'All' ? ['Vision RX', 'Nikon', 'Yash Optics'] : [selectedMaker];

  if (!orders.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'no-records';
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = '20px';
    emptyState.style.color = 'var(--muted)';
    emptyState.textContent = 'No prescriptions found matching the filters.';
    ordersContainer.appendChild(emptyState);
    return;
  }

  makersToRender.forEach((maker) => {
    const makerOrders = orders.filter(o => o.maker === maker);
    
    // Skip rendering this maker section entirely if there are no matching orders for this maker
    if (makerOrders.length === 0) return;

    const section = document.createElement('div');
    section.className = 'maker-section';
    
    const heading = document.createElement('h3');
    heading.textContent = maker;
    section.appendChild(heading);

    // Filter Sent vs Delivered
    const sentOrders = makerOrders.filter(o => o.status !== 'Delivered');
    const deliveredOrders = makerOrders.filter(o => o.status === 'Delivered');

    // 1. Sent Subsection
    const sentSection = document.createElement('div');
    sentSection.className = 'status-sub-section';
    const sentHeader = document.createElement('h4');
    sentHeader.textContent = 'Sent';
    sentSection.appendChild(sentHeader);
    
    if (sentOrders.length > 0) {
      sentSection.appendChild(createTableElement(sentOrders, true));
    } else {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'empty-status-msg';
      emptyMsg.textContent = 'No sent prescriptions.';
      sentSection.appendChild(emptyMsg);
    }
    section.appendChild(sentSection);

    // 2. Delivered Subsection
    const deliveredSection = document.createElement('div');
    deliveredSection.className = 'status-sub-section';
    const deliveredHeader = document.createElement('h4');
    deliveredHeader.textContent = 'Delivered';
    deliveredSection.appendChild(deliveredHeader);
    
    if (deliveredOrders.length > 0) {
      deliveredSection.appendChild(createTableElement(deliveredOrders, false));
    } else {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'empty-status-msg';
      emptyMsg.textContent = 'No delivered prescriptions.';
      deliveredSection.appendChild(emptyMsg);
    }
    section.appendChild(deliveredSection);

    ordersContainer.appendChild(section);
  });
}

renderOrders();
filterMaker.addEventListener('change', renderOrders);
filterLensType.addEventListener('change', renderOrders);
filterStatus.addEventListener('change', renderOrders);
filterSearch.addEventListener('input', renderOrders);
clearFiltersButton.addEventListener('click', () => {
  filterMaker.value = 'All';
  filterLensType.value = 'All';
  filterStatus.value = 'All';
  filterSearch.value = '';
  renderOrders();
});
