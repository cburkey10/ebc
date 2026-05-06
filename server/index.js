const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sql } = require('./database');
const { saveEvent, saveAttendees, saveNotes, saveGeneratedContent, getEvent } = require('./queries');
const { generateContent } = require('./foundry');

const app = express();
app.use(cors());
app.use(express.json());

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM events ORDER BY createdAt DESC`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single event
app.get('/api/events/:id', async (req, res) => {
  try {
    const data = await getEvent(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save event
app.post('/api/events', async (req, res) => {
  try {
    const id = await saveEvent(req.body);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save attendees
app.post('/api/attendees', async (req, res) => {
  try {
    await saveAttendees(req.body.eventId, req.body.attendees);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate narrative
app.post('/api/generate-narrative', async (req, res) => {
  try {
    const { event, attendees } = req.body;
    const prompt = `Microsoft EBC event planning. Company: ${event.companyName}, Industry: ${event.industry}, Goal: ${event.goal}, Attendees: ${attendees.map(a => a.role).join(', ')}.

Write briefly:
1. A 3 sentence day narrative
2. 4 suggested sessions (one line each) covering AI, cybersecurity, cloud & data`;

    const content = await generateContent(prompt);
    await saveGeneratedContent(event.id, 'narrative', content);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate agenda email
app.post('/api/generate-agenda-email', async (req, res) => {
  try {
    const { event, attendees } = req.body;
    const prompt = `Write a short professional agenda email for a Microsoft Executive Briefing event.
Company: ${event.companyName}, Industry: ${event.industry}, Goal: ${event.goal}, Attendees: ${attendees.map(a => `${a.name} (${a.role})`).join(', ')}.
Include: brief welcome, 4 agenda items, closing. Keep it concise.`;

    const content = await generateContent(prompt);
    await saveGeneratedContent(event.id, 'agenda-email', content);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate follow-up email
app.post('/api/generate-email', async (req, res) => {
  try {
    const { event, notes } = req.body;
    const prompt = `Write a short professional follow-up email after a Microsoft Executive Briefing.
Company: ${event.companyName}, Notes: ${notes}.
Include: thanks, 3 key takeaways, next steps. Keep it concise.`;

    const content = await generateContent(prompt);
    await saveGeneratedContent(event.id, 'email', content);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});