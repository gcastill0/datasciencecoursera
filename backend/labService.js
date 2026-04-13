const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const LABS_DIR = path.join(__dirname, '..', 'labs');
const DATA_DIR = path.join(__dirname, '..', 'data');

function listLabs() {
  const files = fs.readdirSync(LABS_DIR).filter((name) => name.endsWith('.yaml') || name.endsWith('.yml'));

  return files.map((file) => {
    const lab = loadLabByFilename(file);
    return {
      lab_id: lab.lab_id,
      title: lab.title,
      file,
    };
  });
}

function loadLabById(labId) {
  const files = fs.readdirSync(LABS_DIR).filter((name) => name.endsWith('.yaml') || name.endsWith('.yml'));

  for (const file of files) {
    const lab = loadLabByFilename(file);
    if (lab.lab_id === labId) {
      return lab;
    }
  }

  return null;
}

function loadLabByFilename(filename) {
  const fullPath = path.join(LABS_DIR, filename);
  const content = fs.readFileSync(fullPath, 'utf8');
  return yaml.load(content);
}

function loadDataFile(filename) {
  const fullPath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(content);
}

module.exports = {
  listLabs,
  loadLabById,
  loadDataFile,
};
