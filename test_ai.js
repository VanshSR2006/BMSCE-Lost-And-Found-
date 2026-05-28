// test_ai.js
// Simple script to invoke Gemini 1.5 Flash on a sample image and print the JSON output.
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure you have set GEMINI_API_KEY env var before running.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Set GEMINI_API_KEY env var');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Load sample image (must exist in project root)
const imagePath = 'sample.jpg';
if (!fs.existsSync(imagePath)) {
  console.log('sample.jpg not found. Downloading placeholder image...');
  const https = require('https');
  const file = fs.createWriteStream(imagePath);
  // Using picsum.photos for a random image
  https.get('https://picsum.photos/800/600', (res) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Placeholder image downloaded.');
      // Continue after download
      runAnalysis();
    });
  }).on('error', (e) => {
    console.error('Failed to download placeholder image:', e);
    process.exit(1);
  });
} else {
  runAnalysis();
}

function runAnalysis() {
const imageData = fs.readFileSync(imagePath);
const base64 = imageData.toString('base64');

const prompt = `You are an expert visual analyst. Analyze the provided image of a lost or found item and extract its details.

Return ONLY a raw JSON object with EXACTLY these keys:
- "title": a concise, clear title/name of the item (e.g., "Blue Hydro Flask Water Bottle")
- "description": a detailed description of visible features, colors, brands, and condition
- "category": one of the predefined categories: "wallet", "id-card", "bottle", "stationery", "electronics", "other"

If any field cannot be determined, set its value to an empty string. Do NOT include any explanatory text, markdown, or placeholders.

Example of correct output:
{ "title": "Blue Hydro Flask Water Bottle", "description": "A blue, 500ml hydro flask with a silver lid, slightly scratched", "category": "bottle" }

Analyze the image and return ONLY the JSON.`;

(async () => {
  try {
    const result = await model.generateContent({
      contents: [
        prompt,
        { inlineData: { mimeType: 'image/jpeg', data: base64 } }
      ],
      generationConfig: { responseMimeType: 'application/json' }
    });
    const text = result.response.text();
    // Extract JSON object from any surrounding text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON object found in response');
      console.log('Raw response:', text);
    } else {
      const jsonString = jsonMatch[0];
      console.log('Extracted JSON string:', jsonString);
      try {
        const parsed = JSON.parse(jsonString);
        console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error('Failed to parse extracted JSON:', e);
        console.log('Extracted string:', jsonString);
      }
    }
  } catch (err) {
    console.error('Error during generation:', err);
  }
})();
