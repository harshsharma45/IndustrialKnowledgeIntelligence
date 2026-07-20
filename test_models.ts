import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2];
  }
});

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log("MODELS:", data.models.map(m => m.name).join(', '));
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}

listModels();
