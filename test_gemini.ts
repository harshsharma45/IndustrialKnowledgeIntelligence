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

async function test() {
  try {
    console.log("Using API Key:", process.env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 10) + '...');
    const res = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'Hello',
    });
    console.log("SUCCESS:", res.text);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}

test();
