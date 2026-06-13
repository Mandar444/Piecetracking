const STORAGE_KEY = 'eyewearOrders';
const form = document.getElementById('order-form');
const ordersContainer = document.getElementById('ordersContainer');
const clearStorageButton = document.getElementById('clearStorage');

function loadOrders() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Invalid order data', error);
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
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
    ['PD', order.pupillaryDistance || '-'],
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

function renderOrders() {
  const orders = loadOrders();
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
              <th>PD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Right</td>
              <td>${order.rightSphere || '-'}</td>
              <td>${order.rightCylinder || '-'}</td>
              <td>${order.rightAdd || '-'}</td>
              <td rowspan="2">${order.pupillaryDistance || '-'}</td>
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

function removeOrder(id) {
  const orders = loadOrders().filter((order) => order.id !== id);
  saveOrders(orders);
  renderOrders();
}

form.addEventListener('submit', (event) => {
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
    pupillaryDistance: formData.get('pupillaryDistance').trim(),
    status: formData.get('status'),
    notes: formData.get('notes').trim(),
    createdAt: new Date().toISOString(),
  };

  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders);
  form.reset();
  renderOrders();
});

clearStorageButton.addEventListener('click', () => {
  if (confirm('Clear all saved prescriptions?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderOrders();
  }
});

renderOrders();
