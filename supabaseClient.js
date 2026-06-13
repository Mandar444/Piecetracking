import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function mapToDatabaseRecord(order) {
  return {
    order_id: order.id,
    customer_name: order.customerName,
    order_number: order.orderNumber,
    maker: order.maker,
    lens_type: order.lensType,
    product: order.product,
    product_add_on: order.productAddOn,
    tint: order.tint,
    right_sphere: order.rightSphere,
    left_sphere: order.leftSphere,
    right_cylinder: order.rightCylinder,
    left_cylinder: order.leftCylinder,
    right_add: order.rightAdd,
    left_add: order.leftAdd,
    pupillary_distance: order.pupillaryDistanceDist,
    pupillary_distance_near: order.pupillaryDistanceNear,
    status: order.status,
    notes: order.notes,
    created_at: order.createdAt,
  };
}

export async function insertPrescription(prescription) {
  const { data, error } = await supabase.from('prescriptions').insert([mapToDatabaseRecord(prescription)]);
  if (error) throw error;
  return data;
}

export async function fetchPrescriptions() {
  const { data, error } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function deletePrescription(orderId) {
  const { data, error } = await supabase.from('prescriptions').delete().eq('order_id', orderId);
  if (error) throw error;
  return data;
}
