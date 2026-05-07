const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDB, sql } = require('./database');
const { saveEvent, saveAttendees, saveNotes, saveGeneratedContent, getEvent } = require('./queries');
const { generateContent } = require('./foundry');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

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
    const prompt = `EBC event for ${event.companyName} (${event.industry}). Goal: ${event.goal}. Attendees: ${attendees.map(a => a.role).join(', ')}. Write: 1) 2 sentence narrative 2) 3 session titles for AI, security, cloud.`;
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

// Get insights data
app.get('/api/insights', async (req, res) => {
  try {
    const events = await sql.query`SELECT opportunities, goal, industry FROM events`;
    const attendees = await sql.query`SELECT role, priorities FROM attendees`;

    const keywords = ['AI', 'Security', 'Cloud', 'Data', 'Copilot'];
    const keywordCounts = {};
    keywords.forEach(k => keywordCounts[k] = 0);

    events.recordset.forEach(e => {
      const text = `${e.opportunities} ${e.goal}`.toLowerCase();
      keywords.forEach(k => {
        if (text.includes(k.toLowerCase())) keywordCounts[k]++;
      });
    });

    const roleCounts = {};
    attendees.recordset.forEach(a => {
      if (!a.role) return;
      const role = a.role.trim();
      if (!roleCounts[role]) roleCounts[role] = { role, keywords: {} };
      keywords.forEach(k => {
        if (!roleCounts[role].keywords[k]) roleCounts[role].keywords[k] = 0;
        if (a.priorities?.toLowerCase().includes(k.toLowerCase())) {
          roleCounts[role].keywords[k]++;
        }
      });
    });

    res.json({
      keywordCounts,
      roleInsights: Object.values(roleCounts),
      totalEvents: events.recordset.length,
      industries: [...new Set(events.recordset.map(e => e.industry).filter(Boolean))]
    });
  } catch (err) {
    console.error('Insights error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Query insights with AI
app.post('/api/insights-query', async (req, res) => {
  try {
    const { question, industry } = req.body;
    const prompt = `You are a Microsoft EBC advisor. Answer this question about Executive Briefing Centre trends: "${question}" ${industry ? `Focus on the ${industry} industry.` : ''} Keep your answer concise and practical.`;
    const content = await generateContent(prompt);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve React frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});