import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

async function test() {
  try {
    const res = await embed({
      model: google.textEmbeddingModel('gemini-embedding-2'),
      value: 'Hello',
    });
    console.log("SUCCESS, embedding length:", res.embedding.length);
  } catch (e) {
    console.error("ERROR WITH gemini-embedding-2:", e.message);
  }

  try {
    const res = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: 'Hello',
    });
    console.log("SUCCESS with 004, embedding length:", res.embedding.length);
  } catch (e) {
    console.error("ERROR WITH text-embedding-004:", e.message);
  }
}

test();
