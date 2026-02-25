import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'http://10.28.28.97:8100',
  'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJpc3MiOiAic3VwYWJhc2UiLCAiaWF0IjogMTc3MTU0MzQ4OSwgImV4cCI6IDIwODY5MDM0ODksICJyb2xlIjogInNlcnZpY2Vfcm9sZSJ9.2WwzRXuU1ZKzUYFo4AJrYEs8pI7hg6zTqDIu2Xa0pNY'
);

async function run() {
  // First check if tables exist already
  const { data: up, error: upErr } = await sb.from('user_profiles').select('id').limit(1);
  console.log('user_profiles:', upErr ? 'DOES NOT EXIST - ' + upErr.message : 'EXISTS (' + (up || []).length + ' rows)');

  const { data: notif, error: nErr } = await sb.from('notifications').select('id').limit(1);
  console.log('notifications:', nErr ? 'DOES NOT EXIST - ' + nErr.message : 'EXISTS (' + (notif || []).length + ' rows)');

  // Check seo_clients columns
  const { data: clients, error: cErr } = await sb.from('seo_clients').select('id, business_name, owner_clerk_id, color').limit(1);
  console.log('seo_clients columns:', cErr ? 'MISSING COLUMNS - ' + cErr.message : 'OK (' + (clients || []).length + ' rows)');

  // Check if admin's domains are seeded
  const { data: allClients, error: acErr } = await sb.from('seo_clients').select('id, business_name, domain, active');
  if (acErr) {
    console.log('Cannot read seo_clients:', acErr.message);
  } else {
    console.log('Total clients in DB:', (allClients || []).length);
    (allClients || []).forEach(c => console.log('  -', c.domain, '|', c.business_name, '| active:', c.active));
  }
}

run().catch(e => console.error(e));
