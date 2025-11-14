// client/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ionenfgrlrbnvxqbmnou.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbmVuZmdybHJibnZ4cWJtbm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODczMjAsImV4cCI6MjA3NzY2MzMyMH0.WHruea_4tHk0HTndocBUSJ4JhFFO_tD9tAoEf1hMjzk';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or ANON KEY missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);