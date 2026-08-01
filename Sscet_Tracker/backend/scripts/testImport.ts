import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function test() {
  const csvContent = `Student Name,Register Number,Admission Number
John Doe,TEST01,ADM-001
Jane Doe,TEST02,ADM-002`;

  const tmpPath = path.join(__dirname, 'test.csv');
  fs.writeFileSync(tmpPath, csvContent);

  const form = new FormData();
  form.append('file', fs.createReadStream(tmpPath), 'test.csv');

  try {
    const res = await fetch('http://127.0.0.1:3000/api/import/students', {
      method: 'POST',
      body: form
    });
    
    const text = await res.text();
    console.log('Response:', res.status, text);
  } catch (e) {
    console.error(e);
  } finally {
    fs.unlinkSync(tmpPath);
  }
}

test();
