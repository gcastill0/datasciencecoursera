const express = require('express');
const cors = require('cors');
const { listLabs, loadLabById, loadDataFile } = require('./labService');
const { executeQuery, countByField } = require('./queryEngine');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/labs', (req, res) => {
  const labs = listLabs();
  res.json(labs);
});

app.get('/labs/:id', (req, res) => {
  const lab = loadLabById(req.params.id);
  if (!lab) {
    return res.status(404).json({ error: 'Lab not found' });
  }
  return res.json(lab);
});

app.post('/execute', (req, res) => {
  const { lab_id: labId, step_id: stepId, query } = req.body;

  if (!labId || !stepId) {
    return res.status(400).json({ error: 'lab_id and step_id are required' });
  }

  const lab = loadLabById(labId);
  if (!lab) {
    return res.status(404).json({ error: 'Lab not found' });
  }

  const step = (lab.steps || []).find((s) => s.id === stepId);
  if (!step) {
    return res.status(404).json({ error: 'Step not found' });
  }

  const rows = loadDataFile(lab.data);

  try {
    const result = executeQuery(rows, query || '');

    let isCorrect = false;
    let feedback = 'Try again.';

    if (step.expected?.query) {
      const expectedResult = executeQuery(rows, step.expected.query);
      isCorrect = JSON.stringify(result) === JSON.stringify(expectedResult);
      feedback = isCorrect
        ? 'Correct! Your query matches the expected result.'
        : 'Not quite. Your result does not match the expected filter.';
    } else if (step.expected?.type === 'aggregation') {
      const aggregated = countByField(result, step.expected.field);
      const matching = aggregated.filter((item) => item.count > Number(step.expected.threshold || 0));
      isCorrect = matching.length > 0;
      feedback = isCorrect
        ? `Correct! Found ${matching.length} value(s) over threshold.`
        : `No values found over threshold ${step.expected.threshold}.`;

      return res.json({
        result,
        aggregation: aggregated,
        matches: matching,
        isCorrect,
        feedback,
      });
    }

    return res.json({ result, isCorrect, feedback });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
