# ATS Frontend - React Application

## Overview

This is the frontend application for the Applicant Tracking System (ATS) built with React.js. The application provides a modern, responsive interface for managing resumes, jobs, and candidate submissions.

## Tech Stack

- **React.js**: Frontend framework
- **Material-UI (MUI)**: UI component library
- **React Router**: Navigation and routing
- **Context API**: State management
- **Axios**: HTTP client
- **React Query**: Data fetching and caching
- **Formik & Yup**: Form handling and validation

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd ats-react-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://localhost:5000
```

## Development

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Production Build

1. Create a production build:
```bash
npm run build
```

2. The build files will be generated in the `build` directory

## Features

### Resume Management
- Batch upload resumes
- Resume parsing with AI
- Resume search by skills/email
- Resume preview and download
- ATS scoring system

### Job Management
- Create and manage job postings
- Track job status
- Match candidates to jobs

### Recruiter Management
- Add and manage recruiters
- Track recruiter information
- Assign submissions to recruiters

### Submission Management
- Track candidate submissions
- Update submission status
- Manage candidate information

### Dashboard
- Overview of system statistics
- Recent activities
- Quick actions

## Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/         # React context providers
├── pages/           # Page components
├── services/        # API service functions
├── utils/           # Utility functions
└── App.js           # Main application component
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the contents of the `build` directory to your web server

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_ENV`: Environment (development/production)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team. 