const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cbhfjgnihkppdbwdqbmz.supabase.co';
const supabaseKey = 'sb_publishable_tTmhoJNmwL9ksTdoiMlAiQ_jT-T7zAk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUsers() {
  const { data: stdData, error: stdErr } = await supabase
    .from('students')
    .delete()
    .eq('register_number', 'E23AI011');
    
  if (stdErr) console.error("Error deleting student by register_number:", stdErr);
  else console.log("Successfully deleted student E23AI011:", stdData);
}

deleteUsers();
