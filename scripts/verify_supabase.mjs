import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cfxdpkvimmukacwyzpje.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeGRwa3ZpbW11a2Fjd3l6cGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMzM0NTksImV4cCI6MjEwMjkwOTQ1OX0.2F4sdctztKpasRmuKS2I2QLVzd4C62CiM3jMWskfOxg";

async function verify() {
  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  const { data: cats, error: catErr } = await supabase.from('categories').select('name, slug');
  console.log(`Categories in Supabase: ${cats?.length} (Error: ${catErr?.message || 'none'})`);

  const { data: prods, error: prodErr } = await supabase.from('products').select('name, price, sale_price');
  console.log(`Products in Supabase: ${prods?.length} (Error: ${prodErr?.message || 'none'})`);

  const { data: props, error: propErr } = await supabase.from('properties').select('title, price_display');
  console.log(`Properties in Supabase: ${props?.length} (Error: ${propErr?.message || 'none'})`);

  const { data: books, error: bookErr } = await supabase.from('digital_books').select('title, author, file_format');
  console.log(`Digital Books in Supabase: ${books?.length} (Error: ${bookErr?.message || 'none'})`);

  const { data: courses, error: courseErr } = await supabase.from('courses').select('title, instructor, level');
  console.log(`Courses in Supabase: ${courses?.length} (Error: ${courseErr?.message || 'none'})`);
}

verify();
