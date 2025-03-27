# ATS Backend Service

A Flask-based backend service for the ATS (Applicant Tracking System) application, providing resume parsing, job management, and recruitment process automation.

## Features

- 🔐 JWT Authentication
- 📄 Resume parsing with AI
- 💾 Database integration
- 📧 Email notifications
- 🔍 Full-text search
- 📊 Analytics and reporting

## Tech Stack

### Core
- Python 3.8+
- Flask
- MongoDB

### AI & ML
- Google Gemini AI for resume parsing
- NLTK for text processing
- PyPDF2 for PDF handling

### Security
- JWT for authentication
- Bcrypt for password hashing
- CORS support

### File Processing
- python-docx for Word documents
- PyPDF2 for PDF files
- python-magic for file type detection

## Project Structure

```
backend/
├── app.py              # Main application file
├── requirements.txt    # Project dependencies
├── .env                # Environment variables
└── README.md           # Project documentation
```

## Dependencies

### Main Dependencies
```
Flask==2.0.1
SQLAlchemy==1.4.23
psycopg2-binary==2.9.1
PyJWT==2.1.0
bcrypt==3.2.0
python-dotenv==0.19.0
google-generativeai==1.0.0
PyPDF2==3.0.0
python-docx==0.8.11
python-magic==0.4.24
waitress==2.0.0
```

### Development Dependencies
```
pytest==6.2.5
black==21.7b0
flake8==3.9.2
```

## Getting Started

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/ats_db
   JWT_SECRET_KEY=your-secret-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. Initialize the database:
   ```bash
   flask db upgrade
   ```

5. Run the development server:
   ```bash
   python app.py
   ```

## API Endpoints

### Authentication
- POST /api/auth/signup
- POST /api/auth/login

### Resumes
- POST /api/resumes/upload
- GET /api/resumes
- GET /api/resumes/{id}
- DELETE /api/resumes/{id}

### Jobs
- POST /api/jobs
- GET /api/jobs
- PUT /api/jobs/{id}
- DELETE /api/jobs/{id}

### Recruiters
- POST /api/recruiters
- GET /api/recruiters
- PUT /api/recruiters/{id}
- DELETE /api/recruiters/{id}

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `GEMINI_API_KEY`: Google Gemini AI API key
- `SMTP_HOST`: Email server host (optional)
- `SMTP_PORT`: Email server port (optional)
- `SMTP_USER`: Email username (optional)
- `SMTP_PASSWORD`: Email password (optional)

## Development

### Code Style
- Follow PEP 8 guidelines
- Use Black for code formatting
- Run Flake8 for linting

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
flask db migrate -m "Migration message"
flask db upgrade
```

## Deployment

1. Set up a PostgreSQL database
2. Configure environment variables
3. Install production dependencies
4. Run with a production server (e.g., Waitress)
   ```bash
   waitress-serve --port=5000 app:app
   ```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

## License

MIT License
