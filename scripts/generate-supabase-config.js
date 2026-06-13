const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set.');
  process.exit(1);
}

const config = `// Generated from environment variables during build.
export const SUPABASE_URL = '${supabaseUrl}';
export const SUPABASE_ANON_KEY = '${supabaseAnonKey}';
`;

fs.writeFileSync('supabaseConfig.js', config, 'utf8');
console.log('Generated supabaseConfig.js from environment variables.');
