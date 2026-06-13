import { insertPrescription, fetchPrescriptions, deletePrescription } from './supabaseClient.js';

const STORAGE_KEY = 'eyewearOrders';
const form = document.getElementById('order-form');
const ordersContainer = document.getElementById('ordersContainer');
const clearStorageButton = document.getElementById('clearStorage');
const messageBox = document.getElementById('messageBox');
const lensTypeSelect = document.getElementById('lensType');
const pdNearInput = document.getElementById('pupillaryDistanceNear');
const pdNearLabel = document.querySelector('label[for="pupillaryDistanceNear"]');

function showMessage(text, type = 'success') {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
  messageBox.classList.remove('hidden');
  window.clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = window.setTimeout(() => {
    messageBox.classList.add('hidden');
  }, 3500);
}

function normalizeOrder(order) {
  return {
    id: order.order_id || order.id,
    customerName: order.customer_name || order.customerName,
    orderNumber: order.order_number || order.orderNumber,
    maker: order.maker,
    lensType: order.lens_type || order.lensType,
    product: order.product,
    productAddOn: order.product_add_on || order.productAddOn,
    tint: order.tint,
    rightSphere: order.right_sphere || order.rightSphere,
    leftSphere: order.left_sphere || order.leftSphere,
    rightCylinder: order.right_cylinder || order.rightCylinder,
    leftCylinder: order.left_cylinder || order.leftCylinder,
    rightAdd: order.right_add || order.rightAdd,
    leftAdd: order.left_add || order.leftAdd,
    pupillaryDistanceDist: order.pupillary_distance || order.pupillaryDistanceDist || order.pupillaryDistance,
    pupillaryDistanceNear: order.pupillary_distance_near || order.pupillaryDistanceNear,
    status: order.status,
    notes: order.notes,
    createdAt: order.created_at || order.createdAt,
  };
}

async function loadOrders() {
  try {
    const remoteOrders = await fetchPrescriptions();
    return remoteOrders.map(normalizeOrder);
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

function updatePdFields() {
  const progressive = lensTypeSelect.value === 'Progressive';
  pdNearInput.required = progressive;
  pdNearInput.disabled = !progressive;
  pdNearInput.placeholder = progressive ? 'e.g. 56' : 'N/A';
  pdNearLabel.textContent = progressive ? 'PD (Near)' : 'PD (Near) - N/A';
  if (!progressive) {
    pdNearInput.value = '';
  }
}

function createOrderElement(order) {
  const template = document.getElementById('order-template');
  const orderCard = template.content.firstElementChild.cloneNode(true);

  const title = orderCard.querySelector('.order-title');
  const status = orderCard.querySelector('.order-status');
  const details = orderCard.querySelector('.order-details');
  const printButton = orderCard.querySelector('.print-btn');
  const deleteButton = orderCard.querySelector('.delete-btn');

  title.textContent = `${order.orderNumber} — ${order.customerName} (${order.maker})`;
  status.textContent = order.status;
  status.dataset.status = order.status;

  const fields = [
    ['Lens Type', order.lensType],
    ['Product', order.product || '-'],
    ['Product Add-On', order.productAddOn || '-'],
    ['Tint', order.tint || 'None'],
    ['R Sphere', order.rightSphere || '-'],
    ['L Sphere', order.leftSphere || '-'],
    ['R Cylinder', order.rightCylinder || '-'],
    ['L Cylinder', order.leftCylinder || '-'],
    ['R Add', order.rightAdd || '-'],
    ['L Add', order.leftAdd || '-'],
    ['PD (Dist)', order.pupillaryDistanceDist || '-'],
    ['PD (Near)', order.pupillaryDistanceNear || (order.lensType === 'Progressive' ? '-' : 'NA')],
    ['Notes', order.notes || '-'],
  ];

  fields.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'order-detail-item';
    item.innerHTML = `<strong>${label}:</strong> ${value}`;
    details.appendChild(item);
  });

  printButton.addEventListener('click', () => printPrescription(order));
  deleteButton.addEventListener('click', () => removeOrder(order.id));

  return orderCard;
}

async function renderOrders() {
  const orders = await loadOrders();
  ordersContainer.innerHTML = '';

  if (!orders.length) {
    const emptyState = document.createElement('p');
    emptyState.textContent = 'No prescriptions yet. Add a new order to start tracking.';
    ordersContainer.appendChild(emptyState);
    return;
  }

  const grouped = orders.reduce((acc, order) => {
    acc[order.maker] = acc[order.maker] || [];
    acc[order.maker].push(order);
    return acc;
  }, {});

  Object.keys(grouped).forEach((maker) => {
    const section = document.createElement('div');
    section.className = 'maker-section';
    const heading = document.createElement('h3');
    heading.textContent = maker;
    section.appendChild(heading);

    grouped[maker].forEach((order) => {
      const element = createOrderElement(order);
      section.appendChild(element);
    });

    ordersContainer.appendChild(section);
  });
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
            <td><strong>Maker</strong></td>
            <td>${order.maker}</td>
            <td><strong>Lens Type</strong></td>
            <td>${order.lensType}</td>
          </tr>
          <tr>
            <td><strong>Product</strong></td>
            <td>${order.product || '-'}</td>
            <td><strong>Add-On</strong></td>
            <td>${order.productAddOn || '-'}</td>
          </tr>
          <tr>
            <td><strong>Tint</strong></td>
            <td>${order.tint || 'None'}</td>
            <td><strong>Status</strong></td>
            <td>${order.status}</td>
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
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Right</td>
              <td>${order.rightSphere || '-'}</td>
              <td>${order.rightCylinder || '-'}</td>
              <td>${order.rightAdd || '-'}</td>
            </tr>
            <tr>
              <td>Left</td>
              <td>${order.leftSphere || '-'}</td>
              <td>${order.leftCylinder || '-'}</td>
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

async function removeOrder(id) {
  try {
    await deletePrescription(id);
    showMessage('Prescription deleted from Supabase.');
  } catch (error) {
    console.warn('Supabase delete failed, removing local copy instead', error);
    const orders = await loadOrders();
    const updated = orders.filter((order) => order.id !== id);
    saveOrders(updated);
    showMessage('Local cache updated after delete failure.', 'error');
  }
  await renderOrders();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  const order = {
    id: Date.now().toString(),
    customerName: formData.get('customerName').trim(),
    orderNumber: formData.get('orderNumber').trim(),
    maker: formData.get('maker'),
    lensType: formData.get('lensType'),
    product: formData.get('product').trim(),
    productAddOn: formData.get('productAddOn').trim(),
    tint: formData.get('tint').trim(),
    rightSphere: formData.get('rightSphere').trim(),
    leftSphere: formData.get('leftSphere').trim(),
    rightCylinder: formData.get('rightCylinder').trim(),
    leftCylinder: formData.get('leftCylinder').trim(),
    rightAdd: formData.get('rightAdd').trim(),
    leftAdd: formData.get('leftAdd').trim(),
    pupillaryDistanceDist: formData.get('pupillaryDistanceDist').trim(),
    pupillaryDistanceNear: formData.get('lensType') === 'Progressive'
      ? formData.get('pupillaryDistanceNear').trim()
      : 'NA',
    status: formData.get('status'),
    notes: formData.get('notes').trim(),
    createdAt: new Date().toISOString(),
  };

  const orders = await loadOrders();
  orders.unshift(order);
  saveOrders(orders);
  form.reset();
  updatePdFields();
  await renderOrders();

  try {
    await insertPrescription(order);
    showMessage('Saved to Supabase.');
    await renderOrders();
  } catch (error) {
    console.error('Supabase save failed', error);
    showMessage('Saved locally, but Supabase sync failed.', 'error');
  }
});

clearStorageButton.addEventListener('click', () => {
  if (confirm('Clear local cache?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderOrders();
    showMessage('Local cache cleared.', 'success');
  }
});

lensTypeSelect.addEventListener('change', updatePdFields);
updatePdFields();

renderOrders();
