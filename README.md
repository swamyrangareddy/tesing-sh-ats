# ATS (Applicant Tracking System) Application

This is a full-stack Applicant Tracking System built with React.js for the frontend and Flask for the backend.

## Tech Stack

### Frontend
- **React.js**: A JavaScript library for building user interfaces
- **Material-UI (MUI)**: React components that implement Google's Material Design
- **React Router**: For handling navigation and routing
- **Context API**: For state management and authentication
- **Axios**: For making HTTP requests to the backend

### Backend
- **Flask**: A lightweight WSGI web application framework
- **MongoDB**: NoSQL database for storing resumes and user data
- **PyMongo**: MongoDB driver for Python
- **JWT (JSON Web Tokens)**: For authentication and authorization
- **Google Gemini AI**: For resume parsing and information extraction
- **python-dotenv**: For managing environment variables
- **Flask-CORS**: For handling Cross-Origin Resource Sharing
- **PyPDF2**: For PDF file processing
- **python-docx**: For DOCX file processing

## Project Structure

```
ats-react-app/              # Frontend React application
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── pages/           # Page components
│   ├── services/        # API service functions
│   └── utils/           # Utility functions
└── public/              # Static files

backend/                  # Flask backend application
├── app.py              # Main application file
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
└── .env               # Environment variables
```

## Setup

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
.\venv\Scripts\activate
```
- Unix/MacOS:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the MongoDB connection string and other variables as needed

5. Run the Flask application:
```bash
python app.py
```

The server will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ats-react-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Features

- User Authentication (Login/Register)
- Resume Upload and Parsing
- Resume Search by Skills and Email
- Resume Management
- Job Posting and Management
- Application Tracking
- Dashboard with Analytics
- Resume Download
- Responsive Design

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Resumes
- `GET /api/resumes` - Get all resumes
- `POST /api/resumes` - Upload a new resume
- `GET /api/resumes/<resume_id>` - Get resume details
- `GET /api/resumes/<resume_id>/download` - Download resume
- `POST /api/resumes/search` - Search resumes

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/<job_id>` - Update a job
- `DELETE /api/jobs/<job_id>` - Delete a job

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
GOOGLE_API_KEY=your_google_api_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# ATS Backend - Production Deployment Guide

## Overview

This is the backend service for the Applicant Tracking System (ATS) built with Flask and MongoDB. The service provides APIs for resume management, job posting, candidate tracking, and AI-powered resume analysis.

## Tech Stack

- **Flask**: Web framework
- **MongoDB**: Database
- **PyMongo**: MongoDB driver
- **JWT**: Authentication
- **Google Gemini AI**: Resume parsing
- **Gunicorn**: Production WSGI server
- **Waitress**: Alternative WSGI server
- **PyPDF2 & python-docx**: Document processing
- **sentence-transformers**: Text analysis
- **scikit-learn**: Machine learning utilities

## Prerequisites

- Python 3.8 or higher
- MongoDB 4.4 or higher
- Virtual environment (recommended)

## Installation

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```
MONGO_URI=your_mongodb_uri
SECRET_KEY=your_secret_key
GOOGLE_API_KEY=your_gemini_api_key
```

## Development Setup

1. Start MongoDB service
2. Run the development server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## Production Deployment

1. Make the start script executable:
```bash
chmod +x start.sh
```

2. Start the production server:
```bash
./start.sh
```

The server will start using Gunicorn with the following configuration:
- Binds to all interfaces on port 5000
- Uses multiple worker processes based on CPU cores
- Includes proper logging and error handling
- Implements production-grade security settings

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-token` - Verify JWT token

### Resume Management
- `GET /api/resumes` - List all resumes
- `POST /api/resumes` - Upload new resume(s)
- `GET /api/resumes/<id>` - Get resume details
- `DELETE /api/resumes/<id>` - Delete resume
- `GET /api/resumes/<id>/preview` - Preview resume
- `GET /api/resumes/<id>/download` - Download resume
- `POST /api/resumes/<id>/reprocess` - Reprocess resume with AI

### Job Management
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/<id>` - Update job
- `DELETE /api/jobs/<id>` - Delete job

### Recruiter Management
- `GET /api/recruiters` - List all recruiters
- `POST /api/recruiters` - Add new recruiter
- `PUT /api/recruiters/<id>` - Update recruiter
- `DELETE /api/recruiters/<id>` - Delete recruiter

### Submission Management
- `GET /api/submissions` - List all submissions
- `POST /api/submissions` - Create new submission
- `PUT /api/submissions/<id>` - Update submission
- `DELETE /api/submissions/<id>` - Delete submission

### ATS Features
- `POST /api/resumes/search` - Search resumes by skills/email
- `POST /api/ats-score` - Calculate ATS scores for resumes

## Monitoring

- Access logs are written to stdout
- Error logs are written to stderr
- Log level is set to 'info'

## Security Considerations

1. Ensure your MongoDB instance is properly secured
2. Use HTTPS in production
3. Set appropriate CORS settings for your domain
4. Keep all dependencies updated
5. Use environment variables for sensitive data

## Scaling

The application is configured to scale horizontally:
- Worker processes are automatically scaled based on CPU cores
- Connection pooling is enabled
- Timeout and keepalive settings are optimized for production

## Troubleshooting

1. Check logs for errors:
```bash
tail -f /var/log/ats_backend.log
```

2. Monitor worker processes:
```bash
ps aux | grep gunicorn
```

3. Common issues:
   - Port conflicts: Change the port in gunicorn_config.py
   - Memory issues: Adjust worker_connections in gunicorn_config.py
   - Database connection issues: Check MongoDB connection string and network

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 