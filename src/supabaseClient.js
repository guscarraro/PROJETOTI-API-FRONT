
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sakcwetcknulwugphhft.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNha2N3ZXRja251bHd1Z3BoaGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MDIzNDMsImV4cCI6MjA0ODM3ODM0M30.Qjm_-RaDZuUxkxmuJglZ-y5h-fM3PAqTzhnpIzfBgY0'; 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
