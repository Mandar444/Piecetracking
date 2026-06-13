import { insertPrescription, fetchPrescriptions, deletePrescription } from './supabaseClient.js';

const STORAGE_KEY = 'eyewearOrders';
const form = document.getElementById('order-form');
const ordersContainer = document.getElementById('ordersContainer');
const clearStorageButton = document.getElementById('clearStorage');
const messageBox = document.getElementById('messageBox');
const pdNearInput = document.getElementById('pupillaryDistanceNear');
const pdNearLabel = document.querySelector('label[for="pupillaryDistanceNear"]');

// Form elements selections
const orderNumberInput = document.getElementById('orderNumber');
const regenerateOrderNoBtn = document.getElementById('regenerate-order-no');
const frameModelSelect = document.getElementById('frameModel');
const frameColorSelect = document.getElementById('frameColor');
const frameColorContainer = document.getElementById('frame-color-container');
const customFrameRow = document.getElementById('custom-frame-row');
const customFrameInput = document.getElementById('customFrameName');
const makerSelect = document.getElementById('maker');
const productSelect = document.getElementById('product');
const customProductRow = document.getElementById('custom-product-row');
const customProductInput = document.getElementById('customProduct');
const priceInfoRow = document.getElementById('price-info-row');
const priceInfoDisplay = document.getElementById('price-info-display');

// Index selection selections
const lensIndexSelect = document.getElementById('lensIndex');
const indexRow = document.getElementById('index-row');

// ARC checkboxes selection
const coatingCbs = document.querySelectorAll('.coating-cb');
const coatingNone = document.getElementById('coatingNone');
const coatingBoth = document.getElementById('coatingBoth');
const productAddOnInput = document.getElementById('productAddOn');

// Tint elements selections
const tintTypeSelect = document.getElementById('tintType');
const customTintRow = document.getElementById('custom-tint-row');
const customTintColorInput = document.getElementById('customTintColor');

// Internal reference products mapping
const PRODUCTS_BY_MAKER = {
  "Vision RX": [
    {
      name: "Satin+ UV Budget RX SV",
      indexes: {
        "1.50": { wpl: 1330, crp: 2950 },
        "1.56": { wpl: 1530, crp: 3420 },
        "1.60": { wpl: 2430, crp: 6510 }
      }
    },
    {
      name: "Satin+ UV Budget SV",
      indexes: {
        "1.56": { wpl: 260, crp: 900 }
      }
    },
    {
      name: "CRIZAL ROCK",
      indexes: {
        "1.50": { wpl: 2210, crp: 5120 },
        "1.56": { wpl: 2410, crp: 5590 },
        "1.60": { wpl: 3310, crp: 8210 },
        "1.67": { wpl: 4500, crp: 10750 }
      }
    }
  ],
  "Nikon": [
    {
      name: "PRESIO FIRST 1.50 SCN",
      indexes: {
        "1.50": { wpl: 7650, crp: 22700 }
      }
    },
    {
      name: "NK FOCUS DIG 15T6G 1.50 ECC",
      indexes: {
        "1.50": { wpl: 6100, crp: 14400 }
      }
    },
    {
      name: "PRESIO FIRST 1.50 TGNS RUBY SCN",
      indexes: {
        "1.50": { wpl: 11650, crp: 31600 }
      }
    }
  ],
  "Yash Optics": []
};

// Dynamic frames catalog mapping
const FRAMES_CATALOG = {
  "Borderline": {
    "Gold": ["Green", "Rose", "RX"],
    "Gunmetal": ["Blue", "Purple", "RX"],
    "Matte Black": ["BlackFade", "Olive", "RX"]
  },
  "Coastline": {
    "Black Core": ["Purple", "RX"],
    "Black Shell": ["Black", "RX"],
    "Champagne": ["Orange", "RX"],
    "Havana": ["RX", "SkyBlue"],
    "Matte Black": ["RX", "Yellow"]
  },
  "Crossfire": {
    "Anthracite": ["BlackFade", "RX"],
    "Bronze": ["GreenFade", "RX"],
    "Gold": ["Brown", "RX"]
  },
  "Downtime": {
    "Black": ["Black", "RX"],
    "Black Shell": ["BlackFade", "RX"],
    "Havana": ["GreenFade", "RX"],
    "Navy": ["Brown", "RX"],
    "Smoke": ["Rose", "RX"]
  },
  "Fulton": {
    "Black": ["Orange", "RX"],
    "Black Shell": ["Black", "RX"],
    "Emerald": ["RX", "SkyBlue"],
    "Rust": ["Brown", "RX"],
    "Smoke": ["Olive", "RX"]
  },
  "Highline": {
    "Anthracite": ["Olive", "RX"],
    "Gold": ["BrownFade", "Peach", "RX"],
    "Silver": ["Purple", "RX"]
  },
  "Overture": {
    "Black": ["Black", "RX"],
    "Black Core": ["Green", "RX"],
    "Champagne": ["Brown", "RX"],
    "Navy": ["Black", "RX"],
    "Sage": ["BrownFade", "RX"]
  },
  "Paradox": {
    "Matte Anthracite": ["Orange", "Purple", "RX"],
    "Matte Gold": ["Green", "RX"],
    "Matte Olive": ["Brown", "RX"]
  },
  "Portola": {
    "Black Core": ["Black", "RX"],
    "Black": ["Purple", "RX"],
    "Concrete": ["Peach", "RX"],
    "Havana": ["Brown", "RX"],
    "Olive": ["Olive", "RX"]
  },
  "Prysm": {
    "Black Core": ["Black", "RX"],
    "Emerald": ["Black", "RX"],
    "Matte Black": ["Orange", "RX"],
    "Matte Smoke": ["Purple", "RX"],
    "Rust": ["Brown", "RX"]
  },
  "Runway": {
    "Matte Gold": ["Black", "Green Fade", "RX"],
    "Matte Gunmetal": ["RX", "SkyBlue"],
    "Olive": ["Green", "RX"]
  },
  "Sheer": {
    "Gold": ["Black", "Olive", "RX"],
    "Matte Black": ["Green", "Rose", "RX"],
    "Silver": ["Black", "RX"]
  },
  "Slowburn": {
    "Black": ["BlackFade", "RX"],
    "Gold": ["BrownFade", "RX"],
    "Gunmetal": ["GreenFade", "RX"]
  },
  "Split": {
    "Gold": ["Black", "Rose", "RX"],
    "Matte Black": ["Blue", "RX", "Yellow"],
    "Matte Silver": ["Blue", "RX"]
  },
  "Strand": {
    "Black": ["Black", "RX"],
    "Black G": ["Green", "RX"],
    "Havana": ["Peach", "RX"],
    "Olive": ["Brown", "RX"],
    "Wine": ["Black", "RX"]
  },
  "Strangelove": {
    "Anthracite": ["Orange", "Purple", "RX"],
    "Gold": ["Black", "RX"],
    "Silver": ["Olive", "RX"]
  },
  "Undertone": {
    "Anthracite": ["Rose", "RX"],
    "Gold": ["Black", "RX"],
    "Silver": ["Green", "RX"]
  },
  "Vapour": {
    "Black Shell": ["Blue", "RX"],
    "Black Shell G": ["Black", "RX"],
    "Emerald": ["Olive", "RX"],
    "Glass": ["GreenFade", "RX"],
    "Rust": ["BrownFade", "RX"]
  },
  "Velo": {
    "Black": ["Black", "Purple"],
    "Black Shell": ["Black"],
    "Cobalt": ["Brown"],
    "Ember": ["Yellow"],
    "Matte Black": ["Green"]
  },
  "Vondel": {
    "Black": ["Black", "RX"],
    "Black Shell": ["Rose", "RX"],
    "Champagne": ["Brown", "RX"],
    "Havana": ["Green", "RX"],
    "Teal": ["RX", "SkyBlue"]
  },
  "Wireframe": {
    "Bronze": ["Blue"],
    "Gold": ["Orange"],
    "Matte Black": ["BlackFade"],
    "Silver": ["Purple"]
  }
};

// Dynamic frame dropdown populate and cascade logic
function initializeFrameDropdowns() {
  if (!frameModelSelect) return;
  
  frameModelSelect.innerHTML = '';
  
  // Populate Models
  const models = Object.keys(FRAMES_CATALOG).sort();
  models.forEach(model => {
    const opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    frameModelSelect.appendChild(opt);
  });
  
  // Add Custom Option
  const optCustom = document.createElement('option');
  optCustom.value = 'custom';
  optCustom.textContent = 'Other / Custom Frame...';
  frameModelSelect.appendChild(optCustom);
  
  // Default to first model
  if (models.length > 0) {
    frameModelSelect.value = models[0];
  } else {
    frameModelSelect.value = 'custom';
  }
  
  updateFrameFields();
}

function updateFrameFields() {
  const model = frameModelSelect.value;
  const isCustom = model === 'custom';
  
  if (isCustom) {
    frameColorContainer.classList.add('hidden');
    customFrameRow.classList.remove('hidden');
    customFrameInput.required = true;
    
    frameColorSelect.required = false;
  } else {
    frameColorContainer.classList.remove('hidden');
    customFrameRow.classList.add('hidden');
    customFrameInput.required = false;
    customFrameInput.value = '';
    
    frameColorSelect.required = true;
    
    // Populate Colors
    frameColorSelect.innerHTML = '';
    const colorsObj = FRAMES_CATALOG[model] || {};
    const colors = Object.keys(colorsObj);
    colors.forEach(color => {
      const opt = document.createElement('option');
      opt.value = color;
      opt.textContent = color;
      frameColorSelect.appendChild(opt);
    });
    
    if (colors.length > 0) {
      frameColorSelect.value = colors[0];
    }
  }
}


// Generates a serial-based order number (e.g. UNC001, UNC002)
async function updateNextOrderNumber() {
  try {
    const orders = await loadOrders();
    let maxNum = 0;
    orders.forEach(order => {
      const match = order.orderNumber && order.orderNumber.toLowerCase().match(/^unc(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(3, '0');
    if (orderNumberInput) {
      orderNumberInput.value = `UNC${padded}`;
    }
  } catch (err) {
    console.error('Failed to calculate serial order number:', err);
    if (orderNumberInput) {
      orderNumberInput.value = 'UNC001';
    }
  }
}

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

function updatePdFields() {
  const lensTypeProgressiveRadio = document.getElementById('lensTypeProgressive');
  const progressive = lensTypeProgressiveRadio && lensTypeProgressiveRadio.checked;
  pdNearInput.required = progressive;
  pdNearInput.disabled = !progressive;
  pdNearInput.placeholder = progressive ? 'e.g. 56' : 'N/A';
  pdNearLabel.textContent = progressive ? 'PD (Near)' : 'PD (Near) - N/A';
  if (!progressive) {
    pdNearInput.value = '';
  }
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
    ['Frame Name', order.frameName || '-'],
    ['Lens Type', order.lensType],
    ['Product', order.product ? `${order.product}${order.lensIndex ? ` (${order.lensIndex} Index)` : ''}` : '-'],
    ['Product Add-On', order.productAddOn || '-'],
    ['Tint', order.tint || 'Clear'],
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

  if (order.wpl || order.crp) {
    fields.push(['Price Info (Ref)', `WPL: ₹${order.wpl || '-'} | CRP: ₹${order.crp || '-'}`]);
  }

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

function updateProductDropdown() {
  const maker = makerSelect.value;
  const products = PRODUCTS_BY_MAKER[maker] || [];
  
  productSelect.innerHTML = '';
  
  products.forEach((prod) => {
    const opt = document.createElement('option');
    opt.value = prod.name;
    // Nikon product names in capital letters only
    if (maker === 'Nikon') {
      opt.textContent = prod.name.toUpperCase();
      opt.value = prod.name.toUpperCase();
    } else {
      opt.textContent = prod.name;
    }
    productSelect.appendChild(opt);
  });
  
  // Always add custom option
  const optCustom = document.createElement('option');
  optCustom.value = 'custom';
  optCustom.textContent = 'Other / Custom Product...';
  productSelect.appendChild(optCustom);
  
  // Set default selection
  if (products.length > 0) {
    productSelect.value = products[0].name;
  } else {
    productSelect.value = 'custom';
  }
  
  updateProductFields();
}

function updateProductFields() {
  const maker = makerSelect.value;
  const isCustom = productSelect.value === 'custom';
  
  if (isCustom) {
    customProductRow.classList.remove('hidden');
    customProductInput.required = true;
    indexRow.classList.add('hidden');
    priceInfoRow.classList.add('hidden');
  } else {
    customProductRow.classList.add('hidden');
    customProductInput.required = false;
    customProductInput.value = '';
    indexRow.classList.remove('hidden');
    
    // Find selected product
    const products = PRODUCTS_BY_MAKER[maker] || [];
    const selectedProd = products.find(p => p.name.toUpperCase() === productSelect.value.toUpperCase());
    
    lensIndexSelect.innerHTML = '';
    if (selectedProd && selectedProd.indexes) {
      const indexes = Object.keys(selectedProd.indexes);
      indexes.forEach(idx => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = idx;
        lensIndexSelect.appendChild(opt);
      });
    }
    
    updatePriceDisplay();
  }
}

function updatePriceDisplay() {
  const maker = makerSelect.value;
  const productVal = productSelect.value;
  const indexVal = lensIndexSelect.value;
  
  if (productVal === 'custom' || !indexVal) {
    priceInfoRow.classList.add('hidden');
    return;
  }
  
  const products = PRODUCTS_BY_MAKER[maker] || [];
  const selectedProd = products.find(p => p.name.toUpperCase() === productVal.toUpperCase());
  
  if (selectedProd && selectedProd.indexes && selectedProd.indexes[indexVal]) {
    const priceInfo = selectedProd.indexes[indexVal];
    priceInfoRow.classList.remove('hidden');
    priceInfoDisplay.innerHTML = `
      <span class="price-tag cost">WPL (Cost): ₹${priceInfo.wpl}</span>
      <span class="price-tag retail">CRP (Retail): ₹${priceInfo.crp}</span>
    `;
  } else {
    priceInfoRow.classList.add('hidden');
  }
}

// Hook up event listeners for products & index selections
makerSelect.addEventListener('change', () => {
  const maker = makerSelect.value;
  // Default Single Vision for Vision RX, Progressive for Nikon and others
  if (maker === 'Vision RX') {
    document.getElementById('lensTypeSingle').checked = true;
  } else {
    document.getElementById('lensTypeProgressive').checked = true;
  }
  updatePdFields();
  updateProductDropdown();
});

productSelect.addEventListener('change', updateProductFields);
lensIndexSelect.addEventListener('change', updatePriceDisplay);

frameModelSelect.addEventListener('change', updateFrameFields);

// ARC Coating checkboxes handling
coatingCbs.forEach(cb => {
  cb.addEventListener('change', () => {
    if (cb.value === 'None') {
      if (cb.checked) {
        coatingCbs.forEach(other => {
          if (other !== cb) other.checked = false;
        });
      }
    } else {
      if (cb.checked) {
        document.getElementById('coatingNone').checked = false;
      }
    }
    // Compile values into hidden input
    const checkedVals = Array.from(coatingCbs)
      .filter(c => c.checked)
      .map(c => c.value);
    
    if (checkedVals.length === 0) {
      productAddOnInput.value = 'None';
    } else {
      productAddOnInput.value = checkedVals.join(', ');
    }
  });
});

function updateTintFields() {
  const isCustom = tintTypeSelect.value === 'Custom';
  if (isCustom) {
    customTintRow.classList.remove('hidden');
    customTintColorInput.required = true;
  } else {
    customTintRow.classList.add('hidden');
    customTintColorInput.required = false;
    customTintColorInput.value = '';
  }
}

tintTypeSelect.addEventListener('change', updateTintFields);

regenerateOrderNoBtn.addEventListener('click', async () => {
  await updateNextOrderNumber();
});

// Watch for lens type changes in radio buttons
document.querySelectorAll('input[name="lensType"]').forEach(radio => {
  radio.addEventListener('change', updatePdFields);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  const maker = formData.get('maker');
  const frameModel = formData.get('frameModel');
  let frameName = '';
  if (frameModel === 'custom') {
    frameName = formData.get('customFrameName').trim();
  } else {
    const frameColor = formData.get('frameColor');
    frameName = `${frameModel} ${frameColor}`;
  }
  const productVal = formData.get('product');
  const lensIndex = indexRow.classList.contains('hidden') ? '' : formData.get('lensIndex');
  const lensTypeVal = form.querySelector('input[name="lensType"]:checked').value;
  
  let finalProduct = productVal;
  let wpl = null;
  let crp = null;
  
  if (productVal === 'custom') {
    finalProduct = formData.get('customProduct').trim();
  } else {
    const products = PRODUCTS_BY_MAKER[maker] || [];
    const selectedProd = products.find(p => p.name.toUpperCase() === productVal.toUpperCase());
    if (selectedProd && selectedProd.indexes && selectedProd.indexes[lensIndex]) {
      const pInfo = selectedProd.indexes[lensIndex];
      wpl = pInfo.wpl;
      crp = pInfo.crp;
    }
  }

  const tintType = formData.get('tintType');
  let finalTint = tintType;
  if (tintType === 'Custom') {
    finalTint = formData.get('customTintColor').trim();
  }

  const order = {
    id: Date.now().toString(),
    customerName: formData.get('customerName').trim(),
    frameName: frameName,
    orderNumber: formData.get('orderNumber').trim(),
    maker: maker,
    lensType: lensTypeVal,
    product: finalProduct,
    lensIndex: lensIndex,
    productAddOn: formData.get('productAddOn').trim(),
    tint: finalTint,
    rightSphere: formData.get('rightSphere').trim(),
    leftSphere: formData.get('leftSphere').trim(),
    rightCylinder: formData.get('rightCylinder').trim(),
    leftCylinder: formData.get('leftCylinder').trim(),
    rightAdd: formData.get('rightAdd').trim(),
    leftAdd: formData.get('leftAdd').trim(),
    pupillaryDistanceDist: formData.get('pupillaryDistanceDist').trim(),
    pupillaryDistanceNear: lensTypeVal === 'Progressive'
      ? formData.get('pupillaryDistanceNear').trim()
      : 'NA',
    status: 'Ordered', // Default status upon creation
    notes: formData.get('notes').trim(),
    wpl: wpl,
    crp: crp,
    createdAt: new Date().toISOString(),
  };

  const orders = await loadOrders();
  orders.unshift(order);
  saveOrders(orders);
  
  // Reset form and defaults
  form.reset();
  initializeFrameDropdowns();
  await updateNextOrderNumber();
  
  // Re-apply maker-specific lens type default
  if (makerSelect.value === 'Vision RX') {
    document.getElementById('lensTypeSingle').checked = true;
  } else {
    document.getElementById('lensTypeProgressive').checked = true;
  }
  
  // Re-apply coating default checkbox and compile
  coatingCbs.forEach(cb => {
    cb.checked = (cb.value === "Both Side ARC Coating");
  });
  productAddOnInput.value = "Both Side ARC Coating";

  updateProductDropdown();
  updatePdFields();
  updateTintFields();

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

updatePdFields();

// Populate dropdown and generate order number on load
updateNextOrderNumber();
updateProductDropdown();
updateTintFields();
initializeFrameDropdowns();

renderOrders();

