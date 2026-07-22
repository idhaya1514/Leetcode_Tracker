const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cbhfjgnihkppdbwdqbmz.supabase.co';
const supabaseKey = 'sb_publishable_tTmhoJNmwL9ksTdoiMlAiQ_jT-T7zAk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUsers() {
  const { data: stdData, error: stdErr } = await supabase
    .from('students')
    .delete()
    .ilike('name', '%idhaya%');
    
  if (stdErr) console.error("Error deleting student:", stdErr);
  else console.log("Successfully deleted student idhaya:", stdData);

  const { data: stfData, error: stfErr } = await supabase
    .from('staffs')
    .delete()
    .ilike('name', '%arun%');
    
  if (stfErr) console.error("Error deleting staff:", stfErr);
  else console.log("Successfully deleted staff arun:", stfData);
}

deleteUsers();
