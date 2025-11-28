import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fuezuatlryjvqtwzxabb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXp1YXRscnlqdnF0d3p4YWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjgzMzQsImV4cCI6MjA3OTg0NDMzNH0._SxQK9Flc4564yVlMyzcIjjNcrC7FKt9trHP_-JisgI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);