const { sql } = require('./database');

async function saveEvent(data) {
  const result = await sql.query`
    INSERT INTO events (companyName, industry, opportunities, goal)
    VALUES (${data.companyName}, ${data.industry}, ${data.opportunities}, ${data.goal});
    SELECT SCOPE_IDENTITY() AS id
  `;
  return result.recordset[0].id;
}

async function saveAttendees(eventId, attendees) {
  for (const attendee of attendees) {
    await sql.query`
      INSERT INTO attendees (eventId, name, role, priorities)
      VALUES (${eventId}, ${attendee.name}, ${attendee.role}, ${attendee.priorities})
    `;
  }
}

async function saveNotes(eventId, content) {
  await sql.query`
    INSERT INTO notes (eventId, content) VALUES (${eventId}, ${content})
  `;
}

async function saveGeneratedContent(eventId, type, content) {
  await sql.query`
    INSERT INTO generatedContent (eventId, type, content)
    VALUES (${eventId}, ${type}, ${content})
  `;
}

async function getEvent(id) {
  const event = await sql.query`SELECT * FROM events WHERE id = ${id}`;
  const attendees = await sql.query`SELECT * FROM attendees WHERE eventId = ${id}`;
  const notes = await sql.query`SELECT * FROM notes WHERE eventId = ${id}`;
  const content = await sql.query`SELECT * FROM generatedContent WHERE eventId = ${id}`;
  return {
    event: event.recordset[0],
    attendees: attendees.recordset,
    notes: notes.recordset,
    generatedContent: content.recordset
  };
}

module.exports = { saveEvent, saveAttendees, saveNotes, saveGeneratedContent, getEvent };