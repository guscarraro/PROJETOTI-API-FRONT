
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtvzmocciujcfvgieuxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dnptb2NjaXVqY2Z2Z2lldXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMjk5NzMsImV4cCI6MjA0NTkwNTk3M30.mbFRk6IvQYOvNG95-HTYq9d_KjIG5rixeULgctdfQOY'; 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
