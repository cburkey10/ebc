const axios = require('axios');
require('dotenv').config();

async function generateContent(prompt) {
  try {
    const response = await axios.post(
      `${process.env.FOUNDRY_ENDPOINT}/models/chat/completions?api-version=2024-05-01-preview`,
      {
        model: "Phi-4-mini-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300
      },
      {
        headers: {
          'api-key': process.env.FOUNDRY_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    let content = response.data.choices[0].message.content;
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return content;
  } catch (err) {
    console.error('Foundry error:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { generateContent };