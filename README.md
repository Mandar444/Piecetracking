# Eyewear Prescription Tracker

A simple local web-based system to create and track eyewear prescriptions by lens maker.

## Features

- Create prescriptions for `Single Vision` and `Progressive` lenses.
- Track custom tint, maker (`Vision RX`, `Nikon`, `Yash Optics`), and order status.
- Group orders by maker for transparent tracking.
- Product and product add-on fields for lens specifications.
- Separate tracking page at `track.html`.
- Printable compact prescription view designed for smaller print output.
- Local storage persistence in the browser.

## How to use

1. Open `index.html` in a browser.
2. Fill in the prescription form.
3. Save the prescription.
4. Use the print button to print a prescription.
5. Use the delete button to remove an order.

## Notes

- Orders are stored in browser local storage.
- If you need multi-user or server-backed storage later, this can be extended to a backend API.

## Supabase Setup

1. Copy `supabaseConfig.example.js` to `supabaseConfig.js`.
2. Replace the placeholder values with your Supabase project URL and anon key.
3. Do not commit `supabaseConfig.js` to GitHub.
4. The browser app can use `supabaseClient.js` to connect to Supabase.

### Supabase table schema

Create a `prescriptions` table with these columns:
- `order_id` text
- `customer_name` text
- `order_number` text
- `maker` text
- `lens_type` text
- `product` text
- `product_add_on` text
- `tint` text
- `right_sphere` text
- `left_sphere` text
- `right_cylinder` text
- `left_cylinder` text
- `right_add` text
- `left_add` text
- `pupillary_distance` text
- `status` text
- `notes` text
- `created_at` timestamptz

> Use only the publishable anon key in the browser. Never store your Supabase service role / secret key in client-side code.
