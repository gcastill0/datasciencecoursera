# Interactive Threat Hunting Lab (Local MVP)

A minimal full-stack local application for running guided threat hunting labs using local YAML lab definitions and JSON log data.

## Project structure

```
/project-root
  /frontend
  /backend
  /labs
    threat-hunt-bruteforce.yaml
  /data
    auth_logs.json
```

## Prerequisites

- Node.js 18+ recommended
- npm

## Install

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Run

### 1) Start backend

```bash
cd backend
node server.js
```

Backend will run on `http://localhost:3001`.

### 2) Start frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`.

## How to use

1. Open the frontend in your browser.
2. Select a lab from **Lab Selector**.
3. Read the current step instruction.
4. Enter a query (examples: `status=failed`, `src_ip=203.0.113.50`, `contains(message,"failed")`).
5. Submit query to view results and correctness feedback.
6. Click **Next Step** when correct to progress.

## API endpoints

- `GET /labs` - list available labs
- `GET /labs/:id` - fetch one lab definition
- `POST /execute` - execute user query and validate step result

### Execute payload

```json
{
  "lab_id": "threat-hunt-bruteforce",
  "step_id": "step1",
  "query": "status=failed"
}
```

### Query syntax

- `field=value`
- `field!=value`
- `contains(field,"value")`

## Notes

- Data is loaded from local JSON files.
- No database is used; processing is in-memory.
- New labs can be added by placing new YAML files in `/labs` that point to a JSON file in `/data`.
