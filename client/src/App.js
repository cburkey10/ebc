import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

const API = '';

// HOME PAGE
function Home() {
  const navigate = useNavigate();
  return (
    <div className="home">
      <h1>Envisioning Excellence</h1>
      <p className="subtitle">Microsoft Executive Briefing Planner</p>
      <div className="home-buttons">
        <button className="home-btn" onClick={() => navigate('/plan')}>Plan</button>
        <button className="home-btn" onClick={() => navigate('/followup')}>Follow Up</button>
      </div>
      <button className="ideas-btn" onClick={() => navigate('/ideas')}>💡 Get Ideas for your next EBC</button>
    </div>
  );
}

// PLAN - PAGE 1: EVENT DETAILS
function PlanDetails() {
  const navigate = useNavigate();
  const [event, setEvent] = React.useState({ companyName: '', industry: '', opportunities: '', goal: '' });
  const [attendees, setAttendees] = React.useState([{ name: '', role: '', priorities: '' }]);
  const [loading, setLoading] = React.useState(false);

  const addAttendee = () => setAttendees([...attendees, { name: '', role: '', priorities: '' }]);
  const updateAttendee = (i, field, value) => {
    const updated = [...attendees];
    updated[i][field] = value;
    setAttendees(updated);
  };

  const saveEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      const data = await res.json();
      await fetch(`${API}/api/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: data.id, attendees })
      });
      navigate('/plan/narrative', { state: { eventId: data.id, event, attendees } });
    } catch (err) {
      alert('Error saving event. Check server is running.');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      <h1>Plan an EBC</h1>

      <div className="card">
        <h2>Event Details</h2>
        <input placeholder="Company Name" value={event.companyName} onChange={e => setEvent({...event, companyName: e.target.value})} />
        <input placeholder="Industry" value={event.industry} onChange={e => setEvent({...event, industry: e.target.value})} />
        <textarea placeholder="Current opportunities / challenges" value={event.opportunities} onChange={e => setEvent({...event, opportunities: e.target.value})} />
        <textarea placeholder="Key goal of the day" value={event.goal} onChange={e => setEvent({...event, goal: e.target.value})} />
      </div>

      <div className="card">
        <h2>Attendees</h2>
        {attendees.map((a, i) => (
          <div key={i} className="attendee">
            <input placeholder="Name" value={a.name} onChange={e => updateAttendee(i, 'name', e.target.value)} />
            <input placeholder="Role" value={a.role} onChange={e => updateAttendee(i, 'role', e.target.value)} />
            <input placeholder="What's important to them" value={a.priorities} onChange={e => updateAttendee(i, 'priorities', e.target.value)} />
          </div>
        ))}
        <button className="secondary" onClick={addAttendee}>+ Add Attendee</button>
      </div>

      <button className="primary full" onClick={saveEvent} disabled={loading}>
        {loading ? 'Saving...' : 'Save Event Details →'}
      </button>
    </div>
  );
}

// PLAN - PAGE 2: NARRATIVE
function PlanNarrative() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const [narrative, setNarrative] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const generateNarrative = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/generate-narrative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: { ...state.event, id: state.eventId }, attendees: state.attendees })
      });
      const data = await res.json();
      setNarrative(data.content);
    } catch (err) {
      alert('Error generating narrative. Check server is running.');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/plan')}>← Back</button>
      <h1>Briefing Narrative</h1>
      <div className="card">
        <h2>Day Narrative & Sessions</h2>
        <p className="hint">Generate a compelling narrative and session ideas for the day.</p>
        <button className="primary" onClick={generateNarrative} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Narrative with AI'}
        </button>
        {narrative && (
          <>
            <textarea readOnly value={narrative} rows={12} className="output" />
            <button className="secondary" onClick={() => navigator.clipboard.writeText(narrative)}>Copy to Clipboard</button>
          </>
        )}
      </div>
      <button className="primary full" onClick={() => navigate('/plan/email', { state })}>
        Next: Prep Agenda Email →
      </button>
    </div>
  );
}

// PLAN - PAGE 3: AGENDA EMAIL
function PlanEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const generateEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/generate-agenda-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: { ...state.event, id: state.eventId }, attendees: state.attendees })
      });
      const data = await res.json();
      setEmail(data.content);
    } catch (err) {
      alert('Error generating email. Check server is running.');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/plan/narrative', { state })}>← Back</button>
      <h1>Prep Agenda Email</h1>
      <div className="card">
        <h2>Customer Facing Agenda Email</h2>
        <p className="hint">AI will generate a professional agenda email based on attendee priorities and industry insights.</p>
        <button className="primary" onClick={generateEmail} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Agenda Email with AI'}
        </button>
        {email && (
          <>
            <textarea readOnly value={email} rows={12} className="output" />
            <button className="secondary" onClick={() => navigator.clipboard.writeText(email)}>Copy to Clipboard</button>
          </>
        )}
      </div>
      <button className="secondary full" onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  );
}

// FOLLOW UP - PAGE 1: SELECT CUSTOMER
function FollowUpSelect() {
  const navigate = useNavigate();
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    fetch(`${API}/api/events`)
      .then(r => r.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  }, []);

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      <h1>Follow Up</h1>
      <div className="card">
        <h2>Select Customer</h2>
        <p className="hint">Choose the customer you'd like to write a follow-up email for.</p>
        <div className="customer-list">
          {events.length === 0 && <p>No events found. Plan an EBC first.</p>}
          {events.map(e => (
            <button key={e.id} className="customer-btn" onClick={() => navigate('/followup/notes', { state: { event: e } })}>
              {e.companyName} — {e.industry}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// FOLLOW UP - PAGE 2: NOTES & EMAIL
function FollowUpNotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const [notes, setNotes] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const generateEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/generate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: state.event, notes })
      });
      const data = await res.json();
      setEmail(data.content);
    } catch (err) {
      alert('Error generating email. Check server is running.');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/followup')}>← Back</button>
      <h1>Follow Up — {state.event?.companyName}</h1>
      <div className="card">
        <h2>Notes from the Day</h2>
        <textarea
          placeholder="Summarise what was discussed, key takeaways, decisions made, next steps..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={8}
        />
        <button className="primary" onClick={generateEmail} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Follow-Up Email with AI'}
        </button>
        {email && (
          <>
            <textarea readOnly value={email} rows={12} className="output" />
            <button className="secondary" onClick={() => navigator.clipboard.writeText(email)}>Copy to Clipboard</button>
          </>
        )}
      </div>
    </div>
  );
}

// GET IDEAS PAGE
function GetIdeas() {
  const navigate = useNavigate();
  const [insights, setInsights] = React.useState(null);
  const [question, setQuestion] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [chartLoading, setChartLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${API}/api/insights`)
      .then(r => r.json())
      .then(data => { setInsights(data); setChartLoading(false); })
      .catch(() => setChartLoading(false));
  }, []);

  const askAI = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/insights-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, industry })
      });
      const data = await res.json();
      setAnswer(data.content);
    } catch (err) {
      alert('Error querying AI.');
    }
    setLoading(false);
  };

  const keywords = ['AI', 'Security', 'Cloud', 'Data', 'Copilot'];
  const colors = ['#0078d4', '#d13438', '#107c10', '#8764b8', '#038387'];
  const maxCount = insights ? Math.max(...Object.values(insights.keywordCounts), 1) : 1;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      <h1>Get Ideas for Your Next EBC</h1>
      <p className="hint" style={{marginBottom: '20px'}}>Based on {insights?.totalEvents || 0} EBCs in your database</p>

      <div className="card">
        <h2>What Customers Are Interested In</h2>
        {chartLoading ? <p>Loading...</p> : (
          <div className="chart">
            {keywords.map((k, i) => (
              <div key={k} className="chart-row">
                <div className="chart-label">{k}</div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${((insights?.keywordCounts[k] || 0) / maxCount) * 100}%`,
                      background: colors[i]
                    }}
                  />
                  <span className="chart-count">{insights?.keywordCounts[k] || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>What Different Roles Care About</h2>
        {chartLoading ? <p>Loading...</p> : (
          <div className="role-grid">
            {insights?.roleInsights?.length === 0 && <p>No attendee data yet.</p>}
            {insights?.roleInsights?.map((r, i) => (
              <div key={i} className="role-card">
                <h3>{r.role}</h3>
                <div className="role-bars">
                  {keywords.map((k, j) => r.keywords[k] > 0 && (
                    <div key={k} className="role-tag" style={{background: colors[j]}}>
                      {k}: {r.keywords[k]}
                    </div>
                  ))}
                  {Object.values(r.keywords).every(v => v === 0) && (
                    <p style={{fontSize: '12px', color: '#666'}}>No keyword matches yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Ask About EBC Trends</h2>
        <p className="hint">Ask anything about what works well for specific industries or roles.</p>
        {insights?.industries?.length > 0 && (
          <select value={industry} onChange={e => setIndustry(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd'}}>
            <option value="">All industries</option>
            {insights.industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        )}
        <textarea
          placeholder="e.g. What topics resonate most with CTOs in retail? What should I focus on for a financial services EBC?"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={4}
        />
        <button className="primary" onClick={askAI} disabled={loading || !question}>
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
        {answer && (
          <>
            <textarea readOnly value={answer} rows={8} className="output" />
            <button className="secondary" onClick={() => navigator.clipboard.writeText(answer)}>Copy</button>
          </>
        )}
      </div>
    </div>
  );
}

// APP ROUTER
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<PlanDetails />} />
        <Route path="/plan/narrative" element={<PlanNarrative />} />
        <Route path="/plan/email" element={<PlanEmail />} />
        <Route path="/followup" element={<FollowUpSelect />} />
        <Route path="/followup/notes" element={<FollowUpNotes />} />
        <Route path="/ideas" element={<GetIdeas />} />
      </Routes>
    </Router>
  );
}