# ATS React Application

A modern Applicant Tracking System (ATS) built with React and Material-UI, designed to streamline the recruitment process.

## Features

- 📄 Resume parsing and analysis
- 👥 Recruiter management
- 💼 Job posting and management
- 📊 Application tracking
- 🔍 Advanced search and filtering
- 📱 Responsive design

## Tech Stack

### Core
- React 18
- Material-UI v5
- React Router v6
- Axios for API requests

### UI Components
- Material Icons
- Framer Motion for animations
- React PDF viewer
- React Dropzone for file uploads

### State Management & Data Handling
- React Context API
- Local Storage for auth state
- JSON Web Tokens (JWT) for authentication

### Development Tools
- Create React App
- ESLint
- Prettier

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── services/         # API and other services
├── context/          # React context providers
├── utils/            # Utility functions
└── assets/           # Static assets
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with required environment variables:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_STORAGE_KEY`: Local storage key for auth (optional)

## Available Scripts

- `npm start`: Run development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License
