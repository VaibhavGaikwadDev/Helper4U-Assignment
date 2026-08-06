# Smart Match Summary & Audio Prompt Engine

## Overview

This project is a mini full-stack application that matches an employer's requirement with suitable helper profiles using AI and MySQL.

The application accepts an employer's requirement as text or audio, extracts structured information using the Gemini API, searches matching helper profiles from a MySQL database, generates an AI-based match summary, and displays the results in a React frontend.

## Tech Stack

### Frontend

* React (Vite)
* Axios

### Backend

* Node.js
* Express.js
* Gemini API
* Multer

### Database

* MySQL

---

## Features

* Enter employer requirement as text.
* Upload an audio file.
* AI extracts structured tags such as:

  * Skill
  * Sub Skill
  * Timing
  * Urgency
* Searches matching helpers from MySQL.
* Generates a two-sentence AI summary explaining why each helper is a good match.
* Displays up to five matching helpers.

---

## Project Structure

```
backend/
frontend/
sql/
README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd smart-match-assignment
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=helper4u

GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Start the backend:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Database

Import the SQL file located in the `sql` folder into MySQL before running the application.

---

## API Endpoint

### POST `/api/match-helper`

Accepts:

* Employer requirement text
* Optional audio file

Returns:

* Extracted AI tags
* Matching helper profiles
* AI-generated match summaries

---

## AI Workflow

1. Employer enters text or uploads audio.
2. Gemini extracts structured criteria.
3. Backend searches MySQL for matching helpers.
4. Gemini generates a short match justification.
5. Results are returned to the frontend.

---

## Notes

* Uses parameterized SQL queries to prevent SQL injection.
* Uses asynchronous API calls with proper error handling.
* API keys and database credentials are stored in environment variables.

---

## Author

**Vaibhav Gaikwad**
