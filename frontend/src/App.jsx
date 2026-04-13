import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:3001';

function App() {
  const [labs, setLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState('');
  const [lab, setLab] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/labs`)
      .then((res) => res.json())
      .then((data) => {
        setLabs(data);
        if (data.length > 0) {
          setSelectedLabId(data[0].lab_id);
        }
      })
      .catch(() => {
        setFeedback('Could not load labs. Is backend running?');
      });
  }, []);

  useEffect(() => {
    if (!selectedLabId) return;

    fetch(`${API_BASE}/labs/${selectedLabId}`)
      .then((res) => res.json())
      .then((data) => {
        setLab(data);
        setCurrentStepIndex(0);
        setQuery('');
        setResult([]);
        setFeedback('Lab loaded. Enter a query to begin.');
        setIsCorrect(null);
      })
      .catch(() => {
        setFeedback('Could not load selected lab.');
      });
  }, [selectedLabId]);

  const currentStep = useMemo(() => {
    if (!lab || !lab.steps || lab.steps.length === 0) return null;
    return lab.steps[currentStepIndex];
  }, [lab, currentStepIndex]);

  const isLastStep = lab && lab.steps && currentStepIndex >= lab.steps.length - 1;

  async function runQuery() {
    if (!lab || !currentStep) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lab_id: lab.lab_id,
          step_id: currentStep.id,
          query,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback(data.error || 'Query execution failed.');
        setIsCorrect(false);
        setResult([]);
        return;
      }

      setResult(data.result || []);
      setFeedback(data.feedback || 'Done.');
      setIsCorrect(Boolean(data.isCorrect));
    } catch (error) {
      setFeedback('Failed to call backend execute endpoint.');
      setIsCorrect(false);
      setResult([]);
    } finally {
      setLoading(false);
    }
  }

  function nextStep() {
    if (!lab) return;
    if (currentStepIndex < lab.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setQuery('');
      setResult([]);
      setFeedback('Moved to next step.');
      setIsCorrect(null);
    }
  }

  return (
    <div className="app">
      <h1>Interactive Threat Hunting Lab</h1>

      <section className="panel">
        <label htmlFor="lab-select">Lab Selector</label>
        <select
          id="lab-select"
          value={selectedLabId}
          onChange={(e) => setSelectedLabId(e.target.value)}
        >
          {labs.map((l) => (
            <option key={l.lab_id} value={l.lab_id}>
              {l.title}
            </option>
          ))}
        </select>
      </section>

      <section className="panel">
        <h2>Instruction Panel</h2>
        {currentStep ? (
          <>
            <p>
              <strong>Step {currentStepIndex + 1}:</strong> {currentStep.instruction}
            </p>
            <small>ID: {currentStep.id}</small>
          </>
        ) : (
          <p>No step loaded.</p>
        )}
      </section>

      <section className="panel">
        <h2>Query Input Box</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Example: status=failed"
        />
        <button onClick={runQuery} disabled={loading || !currentStep}>
          {loading ? 'Running...' : 'Submit Query'}
        </button>
      </section>

      <section className="panel">
        <h2>Feedback Panel</h2>
        <p className={isCorrect == null ? '' : isCorrect ? 'ok' : 'bad'}>{feedback}</p>
        <button onClick={nextStep} disabled={!isCorrect || isLastStep}>
          Next Step
        </button>
        {isLastStep && <small>Last step reached.</small>}
      </section>

      <section className="panel">
        <h2>Results Table ({result.length} rows)</h2>
        {result.length === 0 ? (
          <p>No results yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>timestamp</th>
                <th>user</th>
                <th>src_ip</th>
                <th>status</th>
                <th>message</th>
              </tr>
            </thead>
            <tbody>
              {result.map((row, idx) => (
                <tr key={`${row.timestamp}-${idx}`} className={isCorrect ? 'highlight' : ''}>
                  <td>{row.timestamp}</td>
                  <td>{row.user}</td>
                  <td>{row.src_ip}</td>
                  <td>{row.status}</td>
                  <td>{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
