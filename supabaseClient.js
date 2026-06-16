import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig.js';

let supabaseInstance = null;

try {
  const isPlaceholderUrl = !SUPABASE_URL || SUPABASE_URL.includes('your-project-ref');
  const isPlaceholderKey = !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('your-anon-key');

  if (!isPlaceholderUrl && !isPlaceholderKey) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn('Supabase is not configured. Running in Local-Only mode.');
  }
} catch (e) {
  console.error('Failed to initialize Supabase client:', e);
}

export const supabase = supabaseInstance;


function mapToDatabaseRecord(order) {
  return {
    order_id: order.id,
    customer_name: order.customerName,
    frame_name: order.frameName,
    order_number: order.orderNumber,
    maker: order.maker,
    lens_type: order.lensType,
    product: order.product,
    lens_index: order.lensIndex,
    product_add_on: order.productAddOn,
    tint: order.tint,
    right_sphere: order.rightSphere,
    left_sphere: order.leftSphere,
    right_cylinder: order.rightCylinder,
    left_cylinder: order.leftCylinder,
    right_axis: order.rightAxis,
    left_axis: order.leftAxis,
    right_add: order.rightAdd,
    left_add: order.leftAdd,
    pupillary_distance: order.pupillaryDistanceDist,
    pupillary_distance_near: order.pupillaryDistanceNear,
    status: order.status,
    notes: order.notes,
    wpl: order.wpl,
    crp: order.crp,
    created_at: order.createdAt,
  };
}

export async function insertPrescription(prescription) {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data, error } = await supabase.from('prescriptions').insert([mapToDatabaseRecord(prescription)]);
  if (error) throw error;
  return data;
}

export async function fetchPrescriptions() {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data, error } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function deletePrescription(orderId) {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data, error } = await supabase.from('prescriptions').delete().eq('order_id', orderId);
  if (error) throw error;
  return data;
}

export async function updatePrescriptionStatus(orderId, status) {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data, error } = await supabase
    .from('prescriptions')
    .update({ status })
    .eq('order_id', orderId);
  if (error) throw error;
  return data;
}


