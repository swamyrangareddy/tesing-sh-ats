# =============================================
# Import Statements and Dependencies
# =============================================
from flask import Flask, request, jsonify, redirect, send_file, make_response  # Core Flask functionality
from flask_cors import CORS  # Handle Cross-Origin Resource Sharing
from pymongo import MongoClient  # MongoDB database driver
from bson import ObjectId  # MongoDB ObjectId handling
import os  # Operating system utilities
from dotenv import load_dotenv  # Environment variable management
from werkzeug.security import generate_password_hash, check_password_hash  # Password hashing utilities
import jwt  # JSON Web Token for authentication
from datetime import datetime, timedelta  # Date and time utilities
from functools import wraps  # Function decorator utilities

# File Processing Packages
from PyPDF2 import PdfReader  # PDF file reading
import docx2txt  # DOCX file text extraction
import io  # Input/output stream utilities
import base64  # Base64 encoding/decoding

# AI and Processing Packages
import google.generativeai as genai  # Google's Generative AI (Gemini) API
from sentence_transformers import SentenceTransformer  # Text embedding model
from sklearn.metrics.pairwise import cosine_similarity  # Calculate similarity between vectors

# Utility Packages
import json  # JSON data handling
import time  # Time-related functions
from waitress import serve  # Production WSGI server
from werkzeug.utils import secure_filename  # Secure file name handling
from concurrent.futures import ThreadPoolExecutor, as_completed  # Parallel processing
import traceback  # For printing exception stack trace

import re

# =============================================
# Utility Functions
# =============================================
def is_valid_email(email):
    """Validate email format using regex"""
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

# =============================================
# Environment Setup and Configuration
# =============================================
# Load environment variables
load_dotenv()

app = Flask(__name__)
# Configure CORS with additional options
CORS(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'SECRET_KEY')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', '/app/uploads')

# =============================================
# Database Connection Setup
# =============================================
# MongoDB connection
db = None
try:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Verify connection
    client.server_info()
    # print("Successfully connected to MongoDB")  # Comment out debug print
    db = client['ats_db']

    # Collections
    users_collection = db['users']
    jobs_collection = db['jobs']
    recruiters_collection = db['recruiters']
    resumes_collection = db['resumes']
    submissions_collection = db['submissions']
    public_applications_collection = db['public_applications']
except Exception as e:
    # print(f"Failed to connect to MongoDB: {str(e)}")  # Comment out debug print
    # print("Starting Flask server without MongoDB connection. Some features will be unavailable.")  # Comment out debug print
    pass

# =============================================
# AI Model Configuration
# =============================================
# Configure Gemini API
GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(
    'gemini-2.0-flash-exp',
    generation_config={
        "temperature": 0.1,
        "top_p": 0.95,
        "max_output_tokens": 2048,
    }
)

# =============================================
# Utility Functions
# =============================================
def extract_text_from_pdf(pdf_file):
    """Extract text from PDF file"""
    try:
        pdf_reader = PdfReader(io.BytesIO(pdf_file.read()))
        pdf_file.seek(0)  # Reset file pointer
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_text_from_docx(docx_file):
    """Extract text from DOCX file"""
    try:
        text = docx2txt.process(io.BytesIO(docx_file.read()))
        docx_file.seek(0)  # Reset file pointer
        return text.strip()
    except Exception as e:
        raise Exception(f"Error extracting text from DOCX: {str(e)}")

def extract_text_from_file(file):
    """Extract text from PDF or DOCX files with max length limit"""
    try:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext == '.pdf':
            text = extract_text_from_pdf(file)
        elif file_ext in ['.docx', '.doc']:
            text = extract_text_from_docx(file)
        else:
            raise ValueError("Unsupported file format. Please upload PDF or DOCX files only.")
        
        # Limit text length to 8000 characters
        max_text_length = 8000
        if len(text) > max_text_length:
            text = text[:max_text_length] + "... [text truncated]"
            
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from file: {str(e)}")

def extract_resume_info(text):
    """Extract resume information using Gemini AI with enhanced extraction"""
    try:
        # Initialize retry parameters
        max_retries = 2
        base_delay = 2
        retry_count = 0
        max_text_length = 8000
        resume_info = None
        valid_email = False

        # Truncate text if it exceeds max_text_length
        if len(text) > max_text_length:
            text = text[:max_text_length] + "... [text truncated]"

        # Generate detailed extraction prompt
        prompt = """Extract the following information from the resume text in JSON format:
        {
            "name": "Full name of the candidate",
            "email": "Email address",
            "phone_number": "Phone number with country code if available",
            "location": "Current location (City, State, Country)",
            "current_role": "Current or most recent job title",
            "current_company": "Current or most recent company",
            "total_experience": "Total years of experience (number)",
            "education": "Highest education qualification with major/specialization",
            "skills": "List all technical and professional skills (comma-separated)",
            "experience_details": [
                {
                    "title": "Job title",
                    "company": "Company name",
                    "duration": "Employment duration",
                    "responsibilities": "Key responsibilities and achievements"
                }
            ]
        }

        Requirements:
        1. Ensure all dates and durations are properly formatted
        2. Skills should be relevant and properly categorized
        3. Extract complete location information if available
        4. Include only factual information from the resume
        5. Format experience details chronologically
        6. Ensure education details include degree and major
        7. Phone number should include country code if available
        8. Email must be in valid format (name@domain.com)

        Resume Text:
        """ + text

        while retry_count < max_retries and not valid_email:
            try:
                if retry_count > 0:
                    time.sleep(base_delay * (2 ** (retry_count - 1)))

                # Generate response using Gemini
                response = model.generate_content(prompt)
                response_text = response.text.strip()
                
                # Clean and parse the response
                response_text = response_text.replace('```json', '').replace('```', '').strip()
                result = json.loads(response_text)
                
                # Validate essential fields
                if not result.get('email') or not is_valid_email(result.get('email', '')):
                    retry_count += 1
                    continue

                if not result.get('name'):
                    retry_count += 1
                    continue

                # If we reach here, we have a valid email
                valid_email = True
                
                # Process skills if they're in array format
                skills = result.get('skills', [])
                if isinstance(skills, list):
                    result['skills'] = ', '.join(skills)

                return result
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing error (attempt {retry_count + 1}): {str(e)}")
                retry_count += 1
            except Exception as e:
                print(f"Extraction error (attempt {retry_count + 1}): {str(e)}")
                retry_count += 1
        
        # If all retries failed, return default structure
        return {
            "name": "",
            "email": "",
            "phone_number": "",
            "location": "",
            "current_role": "",
            "current_company": "",
            "total_experience": "",
            "education": "",
            "skills": "",
            "experience_details": []
        }

    except Exception as e:
        print(f"Fatal error in extract_resume_info: {str(e)}")
        return {
            "name": "",
            "email": "",
            "phone_number": "",
            "location": "",
            "current_role": "",
            "current_company": "",
            "total_experience": "",
            "education": "",
            "skills": "",
            "experience_details": []
        }

def validate_password(password):
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    return True, "Password is valid"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# =============================================
# Health Check Route
# =============================================
@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if the API is running"""
    return jsonify({'status': 'healthy'})

# =============================================
# Authentication Routes
# =============================================
@app.route('/api/auth/verify-token', methods=['GET'])
@token_required
def verify_token(current_user):
    """Verify JWT token and return user information"""
    return jsonify({
        'valid': True,
        'user': {
            'id': str(current_user['_id']),
            'username': current_user['username'],
            'email': current_user['email']
        }
    })

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        if db is None:
            return jsonify({'error': 'Database connection is not available. Please ensure MongoDB is installed and running.'}), 503
            
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        if not all(field in data for field in ['email', 'password', 'username']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate email format
        if not is_valid_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password
        is_valid, password_message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': password_message}), 400
        
        # Check if email or username already exists
        existing_email = users_collection.find_one({'email': data['email']})
        if existing_email:
            return jsonify({'error': f"The user with email {data['email']} already exists. Please try logging in or use a different email."}), 400
        
        if users_collection.find_one({'username': data['username']}):
            return jsonify({'error': 'Username already exists'}), 400
        
        hashed_password = generate_password_hash(data['password'])
        
        new_user = {
            'username': data['username'],
            'email': data['email'],
            'password': hashed_password,
            'created_at': datetime.utcnow()
        }
        
        result = users_collection.insert_one(new_user)
        
        return jsonify({
            'message': 'User created successfully',
            'user_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': 'An error occurred during signup. Please try again.'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token"""
    data = request.json
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    # Find user by username
    user = users_collection.find_one({'username': data['username']})
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    token = jwt.encode({
        'user_id': str(user['_id']),
        'username': user['username'],
        'email': user['email'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': str(user['_id']),
            'username': user['username'],
            'email': user['email']
        }
    })

# =============================================
# Recruiter Management Routes
# =============================================
@app.route('/api/recruiters', methods=['GET'])
@token_required
def get_recruiters(current_user):
    """Get all recruiters for the current user"""
    try:
        recruiters = list(recruiters_collection.find())
        for recruiter in recruiters:
            recruiter['_id'] = str(recruiter['_id'])
            recruiter['id'] = str(recruiter['_id'])
        return jsonify(recruiters)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recruiters', methods=['POST'])
@token_required
def create_recruiter(current_user):
    """Create a new recruiter"""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    recruiter = {
        'name': data.get('name'),
        'email': data.get('email'),
        'company': data.get('company'),
        'phone': data.get('phone'),
        'country_code': data.get('country_code'),
        'user_id': str(current_user['_id']),
        'created_at': datetime.utcnow()
    }
    
    # Validate required fields
    if not recruiter['name'] or not recruiter['email']:
        return jsonify({'error': 'Name and email are required fields'}), 400
    
    # Validate email format
    if not is_valid_email(recruiter['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate country code format if provided
    if recruiter['country_code'] and not re.match(r"^\+\d{1,4}$", recruiter['country_code']):
        return jsonify({'error': 'Invalid country code format. Use format: +XX'}), 400
    
    result = recruiters_collection.insert_one(recruiter)
    recruiter['_id'] = str(result.inserted_id)
    return jsonify(recruiter), 201

@app.route('/api/recruiters/<recruiter_id>', methods=['PUT'])
@token_required
def update_recruiter(current_user, recruiter_id):
    """Update an existing recruiter"""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        result = recruiters_collection.update_one(
            {'_id': ObjectId(recruiter_id)},
            {'$set': data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Recruiter not found'}), 404
        
        updated_recruiter = recruiters_collection.find_one({'_id': ObjectId(recruiter_id)})
        updated_recruiter['_id'] = str(updated_recruiter['_id'])
        return jsonify(updated_recruiter)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/recruiters/<recruiter_id>', methods=['DELETE'])
@token_required
def delete_recruiter(current_user, recruiter_id):
    """Delete a recruiter"""
    try:
        result = recruiters_collection.delete_one({
            '_id': ObjectId(recruiter_id)
        })
        if result.deleted_count == 0:
            return jsonify({'error': 'Recruiter not found'}), 404
        return jsonify({'message': 'Recruiter deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# =============================================
# Submission Management Routes
# =============================================
@app.route('/api/submissions', methods=['GET'])
@token_required
def get_submissions(current_user):
    """Get all submissions for the current user"""
    try:
        print(f"Fetching submissions for user: {current_user['_id']}")  # Debug log
        
        # Get all submissions for the current user
        submissions = list(submissions_collection.find())
        print(f"Found {len(submissions)} submissions")  # Debug log
        
        # Convert ObjectId to string and clean up response
        for submission in submissions:
            # Convert ObjectId to string
            submission['_id'] = str(submission['_id'])
            submission['id'] = str(submission['_id'])
            
            # Ensure all required fields exist with default values
            submission.setdefault('candidate_name', '')
            submission.setdefault('candidate_email', '')
            submission.setdefault('candidate_phone', '')
            submission.setdefault('candidate_city', '')
            submission.setdefault('candidate_state', '')
            submission.setdefault('candidate_country', '')
            submission.setdefault('status', 'Submitted')
            submission.setdefault('created_at', datetime.utcnow())
            submission.setdefault('updated_at', datetime.utcnow())
            
            # Remove any binary data or non-serializable fields
            if 'file_data' in submission:
                del submission['file_data']
            if 'resume_data' in submission:
                del submission['resume_data']
            if 'text_content' in submission:
                del submission['text_content']
            
            # Convert datetime objects to ISO format strings
            if 'created_at' in submission:
                if isinstance(submission['created_at'], datetime):
                    submission['created_at'] = submission['created_at'].isoformat()
                elif isinstance(submission['created_at'], str):
                    submission['created_at'] = datetime.fromisoformat(submission['created_at']).isoformat()
            if 'updated_at' in submission:
                if isinstance(submission['updated_at'], datetime):
                    submission['updated_at'] = submission['updated_at'].isoformat()
                elif isinstance(submission['updated_at'], str):
                    submission['updated_at'] = datetime.fromisoformat(submission['updated_at']).isoformat()
        
        print("Submissions processed successfully")  # Debug log
        return jsonify(submissions)
    except Exception as e:
        print(f"Error in get_submissions: {str(e)}")  # Error log
        return jsonify({'error': str(e)}), 500

@app.route('/api/submissions', methods=['POST'])
@token_required
def create_submission(current_user):
    """Create a new submission"""
    try:
        # Get form data
        job_id = request.form.get('job_id')
        recruiter_id = request.form.get('recruiter_id')
        candidate_name = request.form.get('candidate_name')
        candidate_email = request.form.get('candidate_email')
        candidate_phone = request.form.get('candidate_phone')
        candidate_city = request.form.get('candidate_city')
        candidate_state = request.form.get('candidate_state')
        candidate_country = request.form.get('candidate_country')
        visa = request.form.get('visa')
        pay_rate = request.form.get('pay_rate')
        status = request.form.get('status', 'Submitted')
        notes = request.form.get('notes', '')

        # Validate required fields
        required_fields = {
            'job_id': job_id,
            'recruiter_id': recruiter_id,
            'candidate_name': candidate_name,
            'candidate_email': candidate_email,
            'candidate_city': candidate_city,
            'candidate_state': candidate_state,
            'candidate_country': candidate_country,
            'visa': visa,
            'pay_rate': pay_rate
        }

        for field, value in required_fields.items():
            if not value:
                return jsonify({'error': f'{field.replace("_", " ").title()} is required'}), 400

        # Create submission document
        submission = {
            'job_id': job_id,
            'recruiter_id': recruiter_id,
            'user_id': str(current_user['_id']),
            'candidate_name': candidate_name,
            'candidate_email': candidate_email,
            'candidate_phone': candidate_phone,
            'candidate_city': candidate_city,
            'candidate_state': candidate_state,
            'candidate_country': candidate_country,
            'visa': visa,
            'pay_rate': pay_rate,
            'status': status,
            'notes': notes,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        # Insert submission
        result = submissions_collection.insert_one(submission)
        submission['_id'] = str(result.inserted_id)
        submission['id'] = str(result.inserted_id)

        return jsonify({
            'message': 'Submission created successfully',
            'submission': submission
        }), 201

    except Exception as e:
        print(f"Error creating submission: {str(e)}")
        return jsonify({'error': f'Error creating submission: {str(e)}'}), 500

@app.route('/api/submissions/<submission_id>', methods=['PUT'])
@token_required
def update_submission(current_user, submission_id):
    """Update an existing submission"""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        result = submissions_collection.update_one(
            {'_id': ObjectId(submission_id)},
            {'$set': data}
        )
        if result.modified_count == 0:
            return jsonify({'error': 'Submission not found'}), 404
        
        updated_submission = submissions_collection.find_one({'_id': ObjectId(submission_id)})
        updated_submission['_id'] = str(updated_submission['_id'])
        return jsonify(updated_submission)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/submissions/<submission_id>', methods=['DELETE'])
@token_required
def delete_submission(current_user, submission_id):
    """Delete a submission"""
    try:
        result = submissions_collection.delete_one({
            '_id': ObjectId(submission_id)
        })
        if result.deleted_count == 0:
            return jsonify({'error': 'Submission not found'}), 404
        return jsonify({'message': 'Submission deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# =============================================
# Resume Management Routes
# =============================================
@app.route('/api/resumes', methods=['GET'])
@token_required
def get_resumes(current_user):
    """Get all resumes for the current user"""
    try:
        resumes = list(resumes_collection.find())
        # Convert ObjectId to string and clean up response
        for resume in resumes:
            resume['_id'] = str(resume['_id'])
            # Remove large binary data from list response
            if 'file_data' in resume:
                del resume['file_data']
            if 'text_content' in resume:
                del resume['text_content']
        
        return jsonify({
            'resumes': resumes,
            'message': 'Resumes fetched successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes', methods=['POST'])
@token_required
def upload_resume(current_user):
    """Upload and process multiple resumes in parallel with optimized failure handling"""
    results = []
    failed_files = []
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        files = request.files.getlist('file')
        if not files or files[0].filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Initialize Gemini model
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        model = genai.GenerativeModel(
            'gemini-2.0-flash-exp',
            generation_config={
                "temperature": 0.1,
                "top_p": 0.95,
                "max_output_tokens": 2048,
            }
        )

        # First pass: Validate all files and collect valid ones
        valid_files = []
        for file in files:
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in ['.pdf', '.docx', '.doc']:
                results.append({
                    'status': 'error',
                    'error': 'invalid_format',
                    'filename': file.filename,
                    'message': 'Invalid file format. Please upload PDF or DOCX files only.'
                })
                continue
            valid_files.append(file)

        if not valid_files:
            return jsonify({
                'total_files': len(files),
                'results': results,
                'message': 'No valid files to process'
            })

        # Process files in parallel with optimized ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=3) as executor:
            # Submit all files for processing
            future_to_file = {
                executor.submit(process_single_resume, file, model, current_user): file 
                for file in valid_files
            }

            # Process results as they complete with timeout
            for future in as_completed(future_to_file, timeout=300):  # 5 minutes timeout
                file = future_to_file[future]
                try:
                    result = future.result(timeout=60)  # 1 minute timeout per file
                    if result.get('status') == 'error':
                        failed_files.append((file, result))
                    else:
                        results.append(result)
                except TimeoutError:
                    failed_files.append((file, {
                        'status': 'error',
                        'error': 'timeout',
                        'filename': file.filename,
                        'message': 'Processing timeout'
                    }))
                except Exception as e:
                    failed_files.append((file, {
                        'status': 'error',
                        'error': 'processing_failed',
                        'filename': file.filename,
                        'message': str(e)
                    }))

        # Quick retry for failed files with reduced retry attempts
        if failed_files:
            retry_results = []
            with ThreadPoolExecutor(max_workers=3) as executor:
                for file, error in failed_files:
                    # Only retry if it's not a format error
                    if error.get('error') not in ['invalid_format']:
                        future = executor.submit(process_single_resume, file, model, current_user)
                        try:
                            result = future.result(timeout=30)  # 30 seconds timeout for retry
                            retry_results.append(result)
                        except Exception:
                            retry_results.append(error)
                    else:
                        retry_results.append(error)
            
            # Update results with retry outcomes
            results.extend(retry_results)

        # Log summary of results
        successful = len([r for r in results if r.get('status') == 'success'])
        failed = len([r for r in results if r.get('status') == 'error'])
        print(f"Resume upload summary: {successful} successful, {failed} failed out of {len(files)} total files")
        
        return jsonify({
            'total_files': len(files),
            'successful': successful,
            'failed': failed,
            'results': results,
            'message': f'Processed {len(files)} files. {successful} successful, {failed} failed.'
        })

    except Exception as e:
        print(f"Error in upload_resume: {str(e)}")
        return jsonify({
            'error': 'upload_failed',
            'message': str(e)
        }), 500

def process_single_resume(file, model, current_user):
    """Process a single resume file with optimized retry logic"""
    max_retries = 2  
    retry_count = 0
    resume_info = None
    valid_email = False
    error_logged = False  # Flag to track if error has been logged

    while retry_count < max_retries and not valid_email:
        try:
            # Extract text from file
            resume_text = extract_text_from_file(file)
            if not resume_text:
                if not error_logged:
                    # print(f"Failed to extract text from file: {file.filename}")  # Comment out debug print
                    error_logged = True
                return {
                    'status': 'error',
                    'error': 'text_extraction_failed',
                    'filename': file.filename,
                    'message': 'Failed to extract text from file'
                }

            # Extract resume information using Gemini
            resume_info = extract_resume_info(resume_text)
            email = resume_info.get('email', '').strip()

            # Validate email format
            if email and is_valid_email(email):
                # Check if email already exists
                existing_resume = resumes_collection.find_one({
                    'user_id': str(current_user['_id']),
                    'email': email
                })

                # Prepare resume data
                file.seek(0)
                file_data = base64.b64encode(file.read()).decode('utf-8')
                
                resume_data = {
                    'user_id': str(current_user['_id']),
                    'filename': file.filename,
                    'content_type': file.content_type,
                    'file_data': file_data,
                    'text_content': resume_text,
                    'name': resume_info.get('name', ''),
                    'email': email,
                    'phone_number': resume_info.get('phone_number', ''),
                    'job_title': resume_info.get('current_role', ''),
                    'current_job': resume_info.get('current_company', ''),
                    'skills': resume_info.get('skills', ''),
                    'location': resume_info.get('location', ''),
                    'linkedin': resume_info.get('linkedin', ''),
                    'education': resume_info.get('education', ''),
                    'resume_summary': resume_info.get('professional_summary_resume', ''),
                    'experience': resume_info.get('experience_details', []),
                    'category': resume_info.get('category', ''),
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow(),
                    'extraction_retries': retry_count
                }

                if existing_resume:
                    # Update existing resume
                    resumes_collection.update_one(
                        {'_id': existing_resume['_id']},
                        {'$set': resume_data}
                    )
                    return {
                        'status': 'success',
                        'id': str(existing_resume['_id']),
                        'filename': file.filename,
                        'name': resume_info.get('name', ''),
                        'email': email,
                        'skills': resume_info.get('skills', ''),
                        'retries': retry_count,
                        'message': 'Resume updated successfully'
                    }
                else:
                    # Insert new resume
                    result = resumes_collection.insert_one(resume_data)
                    return {
                        'status': 'success',
                        'id': str(result.inserted_id),
                        'filename': file.filename,
                        'name': resume_info.get('name', ''),
                        'email': email,
                        'skills': resume_info.get('skills', ''),
                        'retries': retry_count,
                        'message': 'Resume uploaded successfully'
                    }
            else:
                retry_count += 1
                if retry_count == max_retries and not error_logged:
                    # print(f"Failed to extract valid email from {file.filename} after {max_retries} attempts")  # Comment out debug print
                    error_logged = True
                    return {
                        'status': 'error',
                        'error': 'invalid_email',
                        'filename': file.filename,
                        'message': 'Failed to extract valid email after multiple attempts'
                    }
                time.sleep(2)  # Reduced wait time from 5 to 2 seconds

        except Exception as e:
            retry_count += 1
            if retry_count == max_retries and not error_logged:
                # print(f"Error processing resume {file.filename}: {str(e)}")  # Comment out debug print
                error_logged = True
                return {
                    'status': 'error',
                    'error': 'info_extraction_failed',
                    'filename': file.filename,
                    'message': str(e)
                }
            time.sleep(2)  # Reduced wait time from 5 to 2 seconds

    if not error_logged:
        # print(f"Failed to process resume {file.filename} after maximum retries")  # Comment out debug print
        return {
            'status': 'error',
            'error': 'processing_failed',
            'filename': file.filename,
            'message': 'Failed to process resume after maximum retries'
        }

@app.route('/api/resumes/<resume_id>/preview', methods=['GET'])
@token_required
def preview_resume(current_user, resume_id):
    """Preview a resume file"""
    try:
        # Find the resume
        resume = resumes_collection.find_one({
            '_id': ObjectId(resume_id)
        })
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404

        # Get file data
        if 'file_data' not in resume:
            return jsonify({'error': 'Resume file data not found'}), 404

        try:
            file_data = base64.b64decode(resume['file_data'])
        except Exception as e:
            # print(f"Error decoding file data: {str(e)}")  # Comment out debug print
            return jsonify({'error': 'Invalid file data'}), 500

        if not file_data:
            return jsonify({'error': 'Empty file data'}), 404

        # Get content type from filename or default to PDF
        content_type = 'application/pdf'
        if resume.get('file_name', '').lower().endswith('.docx'):
            content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif resume.get('file_name', '').lower().endswith('.doc'):
            content_type = 'application/msword'
        
        # Create response with file data
        response = make_response(file_data)
        response.headers['Content-Type'] = content_type
        response.headers['Content-Disposition'] = f'inline; filename={resume.get("file_name", "resume.pdf")}'
        
        return response

    except Exception as e:
        # print(f"Error in preview_resume: {str(e)}")  # Comment out debug print
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/<resume_id>/download', methods=['GET'])
@token_required
def download_resume(current_user, resume_id):
    """Download a resume file"""
    try:
        # Find the resume
        resume = resumes_collection.find_one({
            '_id': ObjectId(resume_id)
        })
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404

        # Get file data
        if 'file_data' not in resume:
            return jsonify({'error': 'Resume file data not found'}), 404

        try:
            file_data = base64.b64decode(resume['file_data'])
        except Exception as e:
            # print(f"Error decoding file data: {str(e)}")  # Comment out debug print
            return jsonify({'error': 'Invalid file data'}), 500

        if not file_data:
            return jsonify({'error': 'Empty file data'}), 404

        # Get content type from filename or default to PDF
        content_type = 'application/pdf'
        if resume.get('file_name', '').lower().endswith('.docx'):
            content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif resume.get('file_name', '').lower().endswith('.doc'):
            content_type = 'application/msword'
        
        # Create response with file data
        response = make_response(file_data)
        response.headers['Content-Type'] = content_type
        response.headers['Content-Disposition'] = f'attachment; filename={resume.get("file_name", "resume.pdf")}'
        
        return response

    except Exception as e:
        # print(f"Error in download_resume: {str(e)}")  # Comment out debug print
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/<resume_id>', methods=['GET'])
@token_required
def get_resume(current_user, resume_id):
    """Get details of a specific resume"""
    try:
        resume = resumes_collection.find_one({
            '_id': ObjectId(resume_id),
            'user_id': str(current_user['_id'])
        })
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        resume['_id'] = str(resume['_id'])
        resume['id'] = str(resume['_id'])
        
        return jsonify(resume)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/<resume_id>', methods=['DELETE', 'OPTIONS'])
def delete_resume(resume_id):
    """Delete a resume"""
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'DELETE')
        return response

    try:
        # Find the resume first to check if it exists
        resume = resumes_collection.find_one({'_id': ObjectId(resume_id)})
        if not resume:
            response = jsonify({'error': 'Resume not found'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 404
            
        # Delete the resume
        result = resumes_collection.delete_one({'_id': ObjectId(resume_id)})
        
        if result.deleted_count == 0:
            response = jsonify({'error': 'Failed to delete resume'})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 500
            
        response = jsonify({'message': 'Resume deleted successfully'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        # print(f"Error deleting resume: {str(e)}")  # Comment out debug print
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.route('/api/resumes/<resume_id>/reprocess', methods=['POST'])
@token_required
def reprocess_resume(current_user, resume_id):
    """Reprocess a resume to extract information from stored text content"""
    try:
        # Find the resume
        resume = resumes_collection.find_one({
            '_id': ObjectId(resume_id),
            'user_id': str(current_user['_id'])
        })
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404

        # Get the stored text content
        text_content = resume.get('text_content')
        if not text_content:
            return jsonify({
                'status': 'error',
                'error': 'text_content_missing',
                'message': 'No text content found for reprocessing'
            }), 400

        # Extract resume information using Gemini with retry
        max_retries = 2
        retry_count = 0
        resume_info = None
        
        while retry_count < max_retries and not resume_info:
            try:
                resume_info = extract_resume_info(text_content)
                if not resume_info.get('email'):  # If email extraction failed
                    retry_count += 1
                    if retry_count == max_retries:
                        return jsonify({
                            'status': 'error',
                            'error': 'email_extraction_failed',
                            'message': 'Failed to extract email after multiple attempts'
                        }), 400
                    continue
            except Exception as e:
                retry_count += 1
                if retry_count == max_retries:
                    return jsonify({
                        'status': 'error',
                        'error': 'info_extraction_failed',
                        'message': str(e)
                    }), 400
                continue
        
        # Update resume with new extracted information
        update_data = {
            'name': resume_info.get('name', ''),
            'email': resume_info.get('email', ''),
            'phone_number': resume_info.get('phone_number', ''),
            'job_title': resume_info.get('current_role', ''),
            'current_job': resume_info.get('current_company', ''),
            'skills': resume_info.get('skills', ''),
            'location': resume_info.get('location', ''),
            'resume_summary': resume_info.get('education', ''),
            'experience': resume_info.get('experience_details', []),
            'category': resume_info.get('category', ''),
            'updated_at': datetime.utcnow(),
            'extraction_retries': retry_count
        }
        
        result = resumes_collection.update_one(
            {'_id': ObjectId(resume_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({
                'status': 'warning',
                'message': 'No changes were made to the resume'
            })
        
        return jsonify({
            'status': 'success',
            'message': 'Resume information updated successfully',
            'retries': retry_count
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': 'processing_failed',
            'message': str(e)
        }), 500

# =============================================
# Resume Search Routes
# =============================================
@app.route('/api/resumes/search', methods=['POST'])
@token_required
def search_resumes(current_user):
    """Search resumes by skills or email"""
    try:
        data = request.get_json()
        if not data or 'search_term' not in data or 'search_type' not in data:
            return jsonify({'error': 'Missing search parameters'}), 400

        search_term = data['search_term'].strip()
        search_type = data['search_type']

        if not search_term:
            return jsonify({'error': 'Search term cannot be empty'}), 400

        query = {'user_id': str(current_user['_id'])}

        if search_type == 'skills':
            # Split skills by comma and clean up
            skills = [skill.strip() for skill in search_term.split(',') if skill.strip()]
            if not skills:
                return jsonify({'error': 'No valid skills provided'}), 400

            # Create a case-insensitive regex pattern for each skill
            skill_patterns = [{'skills': {'$regex': skill, '$options': 'i'}} for skill in skills]
            query['$or'] = skill_patterns

        elif search_type == 'email':
            # Split emails by space and clean up
            emails = [email.strip() for email in search_term.split() if email.strip()]
            if not emails:
                return jsonify({'error': 'No valid emails provided'}), 400

            # Create a case-insensitive regex pattern for each email
            email_patterns = [{'email': {'$regex': email, '$options': 'i'}} for email in emails]
            query['$or'] = email_patterns

        else:
            return jsonify({'error': 'Invalid search type'}), 400

        # Execute the search
        resumes = list(resumes_collection.find(query))
        
        # Process results
        for resume in resumes:
            resume['_id'] = str(resume['_id'])
            resume['id'] = str(resume['_id'])
            # Remove file data from response
            if 'file_data' in resume:
                del resume['file_data']
            if 'text_content' in resume:
                del resume['text_content']

        return jsonify({
            'resumes': resumes,
            'message': f'Found {len(resumes)} matching resumes'
        })

    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/search/email', methods=['GET'])
@token_required
def search_resumes_by_email(current_user):
    """Search resumes by email with partial matching"""
    try:
        email = request.args.get('email', '').lower()
        if not email:
            return jsonify([]), 200

        # Find resumes with partial email match
        resumes = list(resumes_collection.find({
            'user_id': str(current_user['_id']),
            'email': {'$regex': email, '$options': 'i'}
        }))

        # Process results
        for resume in resumes:
            resume['_id'] = str(resume['_id'])
            resume['id'] = str(resume['_id'])
            # Remove file data from response
            if 'file_data' in resume:
                del resume['file_data']

        return jsonify(resumes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================
# Job Management Routes
# =============================================
@app.route('/api/jobs', methods=['GET'])
@token_required
def get_jobs(current_user):
    """Get all jobs for the current user"""
    try:
        jobs = list(jobs_collection.find())
        for job in jobs:
            job['_id'] = str(job['_id'])
            # Convert ObjectId to string for the job id
            job['id'] = str(job['_id'])  # Add id field for frontend compatibility
        return jsonify(jobs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['POST'])
@token_required
def create_job(current_user):
    """Create a new job posting"""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    if not data.get('title'):
        return jsonify({'error': 'Job title is required'}), 400
    
    # Generate unique URLs for the job
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    job_url = f"job-{timestamp}-{data['title'].lower().replace(' ', '-')}"
    shareable_link = f"share-{timestamp}-{data['title'].lower().replace(' ', '-')}"
    
    job = {
        'title': data.get('title'),
        'location': data.get('location', ''),
        'bill_rate': data.get('bill_rate', ''),
        'visas': data.get('visas', ''),
        'description': data.get('description', ''),
        'client': data.get('client', ''),
        'url': job_url,
        'shareable_link': shareable_link,
        'user_id': str(current_user['_id']),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    try:
        result = jobs_collection.insert_one(job)
        job['_id'] = str(result.inserted_id)
        job['id'] = str(result.inserted_id)
        return jsonify(job), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs/share/<shareable_link>', methods=['GET'])
def get_public_job(shareable_link):
    """Get public job details by shareable link"""
    try:
        job = jobs_collection.find_one({'shareable_link': shareable_link})
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Only return necessary fields for public view
        public_job = {
            'id': str(job['_id']),
            'title': job['title'],
            'company': job['client'],
            'location': job['location'],
            'description': job['description'],
            'bill_rate': job['bill_rate'],
            'visas': job['visas']
        }
        
        return jsonify(public_job)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs/share/<shareable_link>/apply', methods=['POST'])
def apply_for_public_job(shareable_link):
    try:
        # Get the job by shareable link
        job = jobs_collection.find_one({'shareable_link': shareable_link})
        if not job:
            return jsonify({'error': 'Job not found'}), 404

        # Get resume_data from the form
        resume_data = json.loads(request.form.get('resume_data', '{}'))
        resume_id = request.form.get('resume_id')

        if not resume_id:
            return jsonify({'error': 'Resume ID is required'}), 400

        # Update the resume with new information
        update_data = {
            'name': resume_data.get('name'),
            'email': resume_data.get('email'),
            'phone_number': resume_data.get('phone_number'),
            'location': resume_data.get('location'),
            'skills': resume_data.get('skills'),
            'education': resume_data.get('education'),
            'experience_details': resume_data.get('experience_details', []),
            'linkedin': resume_data.get('linkedin'),
            'updated_at': datetime.utcnow()
        }

        # Update the resume in the database
        result = resumes_collection.update_one(
            {'_id': ObjectId(resume_id)},
            {'$set': update_data}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Resume not found'}), 404

        # Create new public application
        new_application = {
            'job_id': job['_id'],
            'resume_id': resume_id,
            'name': resume_data.get('name'),
            'email': resume_data.get('email'),
            'phone': resume_data.get('phone_number'),
            'linkedin_url': resume_data.get('linkedin'),
            'state': request.form.get('state'),
            'city': request.form.get('city'),
            'country': request.form.get('country'),
            'visa_type': request.form.get('visa_type'),
            'status': 'Submitted',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        result = public_applications_collection.insert_one(new_application)
        new_application['_id'] = str(result.inserted_id)
        new_application['id'] = str(result.inserted_id)

        return jsonify({
            'message': 'Application submitted successfully',
            'application_id': new_application['id']
        }), 201

    except Exception as e:
        print(f"Error in apply_for_public_job: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/public_applications', methods=['GET'])
@token_required
def get_public_applications(current_user):
    try:
        print("=== Debug: get_public_applications ===")
        print(f"Current user ID: {current_user['_id']}")
        
        # Get all jobs created by the current user
        user_jobs = list(jobs_collection.find({'user_id': str(current_user['_id'])}, {'_id': 1}))
        job_ids = [str(job['_id']) for job in user_jobs]
        print(f"Found {len(job_ids)} jobs for user")
        print(f"Job IDs: {job_ids}")
        
        # Get all public applications and convert cursor to list
        all_applications = list(public_applications_collection.find())
        print(f"Total applications in DB: {len(all_applications)}")
        
        # Get applications for user's jobs
        applications = list(public_applications_collection.find({'job_id': {'$in': job_ids}}))
        print(f"Applications matching user's jobs: {len(applications)}")
        
        # Debug: Print raw application data
        for app in applications:
            print(f"Application: job_id={app.get('job_id')}, name={app.get('name')}")
        
        # Format the response
        result = []
        for app in applications:
            try:
                job = jobs_collection.find_one({'_id': ObjectId(app['job_id'])})
                if job:
                    result.append({
                        'id': str(app['_id']),
                        'job_id': str(app['job_id']),
                        'job_title': job.get('title', 'Unknown Job'),
                        'company_name': job.get('client', 'Unknown Company'),
                        'name': app.get('name', ''),
                        'email': app.get('email', ''),
                        'phone': app.get('phone', ''),
                        'linkedin_url': app.get('linkedin_url', ''),
                        'state': app.get('state', ''),
                        'country': app.get('country', ''),
                        'expected_pay_rate': app.get('expected_pay_rate', ''),
                        'status': app.get('status', 'pending'),
                        'resume_path': app.get('resume_path', ''),
                        'created_at': app['created_at'].isoformat() if app.get('created_at') else None,
                        'updated_at': app['updated_at'].isoformat() if app.get('updated_at') else None
                    })
            except Exception as e:
                print(f"Error processing application {app.get('_id')}: {str(e)}")
                continue
        
        print(f"Returning {len(result)} formatted applications")
        return jsonify(result)
    except Exception as e:
        print(f"Error in get_public_applications: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/public_applications/<application_id>/resume', methods=['GET'])
@token_required
def download_public_resume(current_user, application_id):
    try:
        # Get the application
        application = public_applications_collection.find_one({'_id': ObjectId(application_id)})
        if not application:
            return jsonify({'error': 'Application not found'}), 404
            
        # Verify the user has access to this application
        job = jobs_collection.find_one({
            '_id': ObjectId(application['job_id']),
            'user_id': str(current_user['_id'])
        })
        
        if not job:
            return jsonify({'error': 'Unauthorized'}), 403
            
        if not os.path.exists(application['resume_path']):
            return jsonify({'error': 'Resume file not found'}), 404

        # Get the original filename from the path
        original_filename = os.path.basename(application['resume_path'])
        
        # Send the file
        return send_file(
            application['resume_path'],
            as_attachment=True,
            download_name=original_filename
        )

    except Exception as e:
        print(f"Error in download_public_resume: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs/<job_id>', methods=['PUT'])
@token_required
def update_job(current_user, job_id):
    """Update an existing job"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Remove _id from data if present
        if '_id' in data:
            del data['_id']
        
        # Add updated_at timestamp
        data['updated_at'] = datetime.utcnow()
        
        # Ensure status is one of the allowed values
        if 'status' in data:
            if data['status'] not in ['open', 'closed']:
                return jsonify({'error': 'Invalid status value. Must be either "open" or "closed"'}), 400
        
        # Update the job without user_id check
        result = jobs_collection.update_one(
            {'_id': ObjectId(job_id)},
            {'$set': data}
        )
        
        if result.modified_count == 0:
            # Check if job exists
            job = jobs_collection.find_one({'_id': ObjectId(job_id)})
            if not job:
                return jsonify({'error': 'Job not found'}), 404
            return jsonify({'error': 'No changes were made to the job'}), 400
        
        # Fetch and return the updated job
        updated_job = jobs_collection.find_one({'_id': ObjectId(job_id)})
        
        if updated_job:
            updated_job['_id'] = str(updated_job['_id'])
            updated_job['id'] = str(updated_job['_id'])
            return jsonify(updated_job)
        else:
            return jsonify({'error': 'Failed to fetch updated job'}), 500
            
    except Exception as e:
        print(f"Error updating job: {str(e)}")
        return jsonify({'error': f'Error updating job: {str(e)}'}), 500

@app.route('/api/jobs/<job_id>', methods=['DELETE'])
@token_required
def delete_job(current_user, job_id):
    """Delete a job"""
    try:
        # First check if there are any submissions linked to this job
        submissions = submissions_collection.find_one({'job_id': job_id})
        
        if submissions:
            return jsonify({
                'error': 'Cannot delete job with existing submissions. Please delete the submissions first.'
            }), 400
        
        result = jobs_collection.delete_one({'_id': ObjectId(job_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Job not found'}), 404
            
        return jsonify({'message': 'Job deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# =============================================
# ATS (Applicant Tracking System) Routes
# =============================================
def extract_skills_gemini(text):
    """Extract skills from text using Gemini AI"""
    try:
        prompt = """
        Extract a comprehensive list of technical and professional skills from this text. 
        Format the output as a comma-separated list of skills.
        Include both hard skills (technical skills, tools, programming languages, frameworks) 
        and soft skills (leadership, communication, etc.).
        
        Important:
        1. Each skill should be a single word or phrase (e.g., "Python", "Project Management")
        2. Do not include descriptions or explanations
        3. Remove any duplicate skills
        4. Skills should be properly capitalized
        
        Text:
        """ + text

        response = model.generate_content(prompt)
        skills = response.text.strip()
        
        # Clean up the skills list
        skills = re.sub(r'["\']', '', skills)  # Remove quotes
        skills = re.sub(r'\s*,\s*', ',', skills)  # Normalize spaces around commas
        skills = re.sub(r'\s+', ' ', skills)  # Normalize other whitespace
        
        # Split into individual skills, clean each one, and remove duplicates
        skill_list = [skill.strip() for skill in skills.split(',') if skill.strip()]
        skill_list = list(dict.fromkeys(skill_list))  # Remove duplicates while preserving order
        
        # Join back into a comma-separated string
        return skill_list

    except Exception as e:
        print(f"Error extracting skills: {str(e)}")
        return []

def batch_embed(texts):
    """Batch process embeddings with caching"""
    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode(texts)
        return embeddings
    except Exception as e:
        print(f"Error in batch embedding: {str(e)}")
        return None

def calculate_resume_scores(job_description, resumes, target_percentage):
    """Calculate ATS scores for resumes"""
    try:
        # Extract required skills from job description
        required_skills = extract_skills_gemini(job_description)
        if not required_skills:
            return [], "Failed to extract skills from job description"

        matching_resumes = []
        for resume in resumes:
            # Get resume skills
            resume_skills = resume.get('skills', '').split(',')
            resume_skills = [skill.strip() for skill in resume_skills if skill.strip()]

            # Calculate matches
            matched_skills = [skill for skill in resume_skills if any(
                req.lower() in skill.lower() or skill.lower() in req.lower()
                for req in required_skills
            )]
            match_percentage = (len(matched_skills) / len(required_skills)) * 100 if required_skills else 0

            if match_percentage >= target_percentage:
                matching_resumes.append({
                    'id': str(resume['_id']),
                    'name': resume.get('name', ''),
                    'email': resume.get('email', ''),
                    'phone_number': resume.get('phone_number', ''),
                    'match_percentage': round(match_percentage, 2),
                    'skills': resume.get('skills', ''),
                    'category': resume.get('category', 'Unknown'),
                    'matched_skills': matched_skills,
                    'required_skills': required_skills
                })

        # Sort by match percentage
        matching_resumes.sort(key=lambda x: x['match_percentage'], reverse=True)
        return matching_resumes, None

    except Exception as e:
        print(f"Error calculating resume scores: {str(e)}")
        return [], str(e)

@app.route('/api/ats-score', methods=['POST'])
@token_required
def ats_score(current_user):
    """Calculate ATS scores for resumes matching a job description"""
    try:
        data = request.get_json()
        if not data or 'job_description' not in data:
            return jsonify({'error': 'Job description is required'}), 400
        
        job_description = data['job_description']
        match_threshold = float(data.get('match_threshold', 70))
        
        # Get all resumes for the current user
        resumes = list(resumes_collection.find({'user_id': str(current_user['_id'])}))
        if not resumes:
            return jsonify({
                'results': [],
                'message': 'No resumes found in the database',
                'matching_resumes': 0,
                'total_resumes': 0
            })
        
        # Calculate scores
        matching_resumes, error = calculate_resume_scores(job_description, resumes, match_threshold)
        if error:
            return jsonify({'error': error}), 500
        
        return jsonify({
            'results': matching_resumes,
            'message': f'Found {len(matching_resumes)} matching resumes out of {len(resumes)} total resumes',
            'matching_resumes': len(matching_resumes),
            'total_resumes': len(resumes)
        })
        
    except Exception as e:
        print(f"Error in ats_score: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/public_applications/<application_id>', methods=['DELETE'])
@token_required
def delete_public_application(current_user, application_id):
    """Delete a public application"""
    try:
        # First get the application to verify ownership
        application = public_applications_collection.find_one({'_id': ObjectId(application_id)})
        if not application:
            return jsonify({'error': 'Application not found'}), 404
            
        # Verify the job belongs to the current user
        job = jobs_collection.find_one({
            '_id': ObjectId(application['job_id']),
            'user_id': str(current_user['_id'])
        })
        
        if not job:
            return jsonify({'error': 'Unauthorized'}), 403
            
        # Delete the application
        result = public_applications_collection.delete_one({'_id': ObjectId(application_id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Failed to delete application'}), 500
            
        return jsonify({'message': 'Application deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/count', methods=['GET'])
@token_required
def get_resumes_count(current_user):
    """Get the total count of resumes in the collection and last modified timestamp"""
    try:
        # Get the most recent updated_at timestamp from the collection
        last_modified = resumes_collection.find_one(
            sort=[('updated_at', -1)],
            projection={'updated_at': 1}
        )
        
        count = resumes_collection.count_documents({})
        return jsonify({
            'count': count,
            'last_modified': last_modified['updated_at'].isoformat() if last_modified and 'updated_at' in last_modified else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================
# Public Routes
# =============================================
@app.route('/api/public/recruiters', methods=['GET'])
@token_required
def get_public_recruiters(current_user):
    """Get all recruiters from all users"""
    try:
        recruiters = list(recruiters_collection.find({}))
        for recruiter in recruiters:
            recruiter['_id'] = str(recruiter['_id'])
            recruiter['id'] = str(recruiter['_id'])
        return jsonify(recruiters)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/public/jobs', methods=['GET'])
@token_required
def get_public_jobs(current_user):
    """Get all jobs from all users"""
    try:
        jobs = list(jobs_collection.find({}))
        for job in jobs:
            job['_id'] = str(job['_id'])
            job['id'] = str(job['_id'])
        return jsonify(jobs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/public/submissions', methods=['GET'])
@token_required
def get_public_submissions(current_user):
    """Get all submissions from all users"""
    try:
        submissions = list(submissions_collection.find({}))
        for submission in submissions:
            submission['_id'] = str(submission['_id'])
            submission['id'] = str(submission['_id'])
            # Remove sensitive data
            if 'file_data' in submission:
                del submission['file_data']
            if 'resume_data' in submission:
                del submission['resume_data']
            if 'text_content' in submission:
                del submission['text_content']
        return jsonify(submissions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/public/resumes', methods=['GET'])
@token_required
def get_public_resumes(current_user):
    """Get all resumes from all users"""
    try:
        resumes = list(resumes_collection.find({}))
        for resume in resumes:
            resume['_id'] = str(resume['_id'])
            resume['id'] = str(resume['_id'])
            # Remove sensitive data
            if 'file_data' in resume:
                del resume['file_data']
            if 'text_content' in resume:
                del resume['text_content']
        return jsonify(resumes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    """Check if the file extension is allowed"""
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/process-and-store-resume', methods=['POST', 'OPTIONS'])
def process_and_store_resume():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        # print("Received request to process resume")  # Comment out debug print
        
        # Check if resume file is present
        if 'resume' not in request.files:
            # print("No resume file in request")  # Comment out debug print
            return jsonify({'error': 'No resume file provided'}), 400

        resume_file = request.files['resume']
        if resume_file.filename == '':
            # print("Empty filename")  # Comment out debug print
            return jsonify({'error': 'No selected file'}), 400

        # print(f"Processing file: {resume_file.filename}")  # Comment out debug print

        # Validate file type
        if not allowed_file(resume_file.filename):
            # print(f"Invalid file type: {resume_file.filename}")  # Comment out debug print
            return jsonify({'error': 'Invalid file type. Please upload a PDF or DOCX file'}), 400

        try:
            # Extract text from resume
            text_content = extract_text_from_file(resume_file)
            if not text_content:
                # print("Could not extract text from resume")  # Comment out debug print
                return jsonify({'error': 'Could not extract text from resume'}), 400
        except Exception as e:
            # print(f"Text extraction error: {str(e)}")  # Comment out debug print
            return jsonify({'error': f'Failed to extract text from resume: {str(e)}'}), 400

        try:
            # Extract information using enhanced extraction
            resume_data = extract_resume_info(text_content)
            if not resume_data.get('email'):
                # print("Could not extract email from resume")  # Comment out debug print
                return jsonify({'error': 'Could not extract email from resume'}), 400
        except Exception as e:
            # print(f"Info extraction error: {str(e)}")  # Comment out debug print
            return jsonify({'error': f'Failed to extract information from resume: {str(e)}'}), 400

        try:
            # Convert file to base64 for storage
            resume_file.seek(0)
            file_data = base64.b64encode(resume_file.read()).decode('utf-8')
        except Exception as e:
            # print(f"File conversion error: {str(e)}")  # Comment out debug print
            return jsonify({'error': f'Failed to process resume file: {str(e)}'}), 400

        try:
            # Check if resume with this email already exists
            existing_resume = resumes_collection.find_one({'email': resume_data['email']}) if resume_data.get('email') else None
            
            # Prepare document for MongoDB - store data at root level
            resume_doc = {
                'file_name': secure_filename(resume_file.filename),
                'file_data': file_data,
                'text_content': text_content,
                'name': resume_data.get('name', ''),
                'email': resume_data.get('email', ''),
                'phone_number': resume_data.get('phone_number', ''),
                'linkedin': resume_data.get('linkedin', ''),
                'job_title': resume_data.get('job_title', ''),
                'location': resume_data.get('location', ''),
                'current_role': resume_data.get('current_role', ''),
                'current_company': resume_data.get('current_company', ''),
                'total_experience': resume_data.get('total_experience', ''),
                'skills': resume_data.get('skills', ''),
                'education': resume_data.get('education', ''),
                'visa': resume_data.get('visa', ''),
                'resume_summary': resume_data.get('professional_profile', ''),
                'experience': resume_data.get('experience_details', []),
                'category': resume_data.get('category', ''),
                'updated_at': datetime.utcnow()
            }

            # If email exists, update the existing document, otherwise insert new
            if existing_resume and resume_data.get('email'):
                # Keep existing values if new values are empty
                for key in resume_doc:
                    if key not in ['file_name', 'file_data', 'text_content', 'updated_at'] and not resume_doc[key]:
                        resume_doc[key] = existing_resume.get(key, '')
                
                # Update existing resume
                result = resumes_collection.update_one(
                    {'email': resume_data['email']},
                    {'$set': resume_doc}
                )
                resume_id = str(existing_resume['_id'])
                # print(f"Updated existing resume for email: {resume_data['email']}")  # Comment out debug print
            else:
                # Insert new resume
                resume_doc['created_at'] = datetime.utcnow()
                result = resumes_collection.insert_one(resume_doc)
                resume_id = str(result.inserted_id)
                # print(f"Inserted new resume with ID: {resume_id}")  # Comment out debug print

            # Return the processed information
            return jsonify({
                'resume_id': resume_id,
                'name': resume_doc['name'],
                'email': resume_doc['email'],
                'phone_number': resume_doc['phone_number'],
                'location': resume_doc['location'],
                'job_title': resume_doc['job_title'],
                'current_role': resume_doc['current_role'],
                'current_company': resume_doc['current_company'],
                'total_experience': resume_doc['total_experience'],
                'education': resume_doc['education'],
                'resume_summary': resume_doc['resume_summary'],
                'skills': resume_doc['skills'],
                'experience_details': resume_doc['experience'],
                'visa': resume_doc['visa'],
                'linkedin': resume_doc['linkedin']
            })
        except Exception as e:
            # print(f"Database error: {str(e)}")  # Comment out debug print
            return jsonify({'error': f'Failed to store resume in database: {str(e)}'}), 500

    except Exception as e:
        # print(f"Unexpected error processing resume: {str(e)}")  # Comment out debug print
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/api/extract-skills', methods=['POST'])
@token_required
def extract_skills(current_user):
    """Extract skills from job description"""
    try:
        data = request.get_json()
        if not data or 'job_description' not in data:
            return jsonify({'error': 'Job description is required'}), 400
        
        job_description = data['job_description']
        skills = extract_skills_gemini(job_description)
        
        return jsonify({
            'skills': skills,
            'message': f'Successfully extracted {len(skills)} skills'
        })
        
    except Exception as e:
        print(f"Error in extract_skills: {str(e)}")
        return jsonify({'error': str(e)}), 500

# =============================================
# Application Entry Point
# =============================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
