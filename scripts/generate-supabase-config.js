const fs = require('fs');

// Try to load .env file if it exists (for local development/builds)
if (fs.existsSync('.env')) {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    envFile.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const firstEquals = trimmedLine.indexOf('=');
        if (firstEquals !== -1) {
          const key = trimmedLine.substring(0, firstEquals).trim();
          const value = trimmedLine.substring(firstEquals + 1).trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = value;
        }
      }
    });
  } catch (err) {
    console.warn('Could not read .env file:', err);
  }
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: SUPABASE_URL and SUPABASE_ANON_KEY are not set in environment variables.');
  if (fs.existsSync('supabaseConfig.js')) {
    console.log('supabaseConfig.js already exists. Keeping existing file.');
  } else {
    console.warn('Generating supabaseConfig.js with placeholder values. App will fall back to LocalStorage.');
    const placeholderConfig = `// Generated placeholders because environment variables were not set.
export const SUPABASE_URL = 'https://your-project-ref.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
`;
    fs.writeFileSync('supabaseConfig.js', placeholderConfig, 'utf8');
  }
  process.exit(0);
}

const config = `// Generated from environment variables during build.
export const SUPABASE_URL = '${supabaseUrl}';
export const SUPABASE_ANON_KEY = '${supabaseAnonKey}';
`;

fs.writeFileSync('supabaseConfig.js', config, 'utf8');
console.log('Generated supabaseConfig.js from environment variables.');

