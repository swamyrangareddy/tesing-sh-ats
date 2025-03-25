# =============================================
# Import Statements and Dependencies
# =============================================
from flask import Flask, request, jsonify, redirect, send_file, make_response
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
import re
import google.generativeai as genai
from PyPDF2 import PdfReader
import docx2txt
import docx
import io
import base64
import bcrypt
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import time

# =============================================
# Environment Setup and Configuration
# =============================================
# Load environment variables
load_dotenv()

app = Flask(__name__)
# Configure CORS with additional options
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'SECRET_KEY')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# =============================================
# Database Connection Setup
# =============================================
# MongoDB connection
db = None
try:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ats')
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Verify connection
    client.server_info()
    print("Successfully connected to MongoDB")
    db = client['ats_db']

    # Collections
    users_collection = db['users']
    jobs_collection = db['jobs']
    recruiters_collection = db['recruiters']
    resumes_collection = db['resumes']
    submissions_collection = db['submissions']
    public_applications_collection = db['public_applications']  # New collection for public job applications
except Exception as e:
    print(f"Failed to connect to MongoDB: {str(e)}")
    print("Starting Flask server without MongoDB connection. Some features will be unavailable.")

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
    """Extract text from PDF or DOCX files"""
    try:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext == '.pdf':
            return extract_text_from_pdf(file)
        elif file_ext in ['.docx', '.doc']:
            return extract_text_from_docx(file)
        else:
            raise ValueError("Unsupported file format. Please upload PDF or DOCX files only.")
    except Exception as e:
        raise Exception(f"Error extracting text from file: {str(e)}")

def extract_resume_info(text):
    """Extract resume information using Gemini AI with enhanced retry logic"""
    try:
        # Initialize retry parameters
        max_retries = 3
        base_delay = 2  # Base delay in seconds
        retry_count = 0
        resume_info = None
        last_error = None
        extraction_stats = {
            'attempts': 0,
            'errors': [],
            'validation_failures': []
        }

        def validate_extracted_info(info):
            """Validate extracted information"""
            validation_errors = []
            
            # Check email format
            email = info.get('email', '').strip()
            if not email:
                validation_errors.append('missing_email')
            elif not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                validation_errors.append('invalid_email_format')
            
            # Check other critical fields
            if not info.get('name', '').strip():
                validation_errors.append('missing_name')
            
            # Validate skills format
            skills = info.get('skills', [])
            if isinstance(skills, str):
                skills = [s.strip() for s in skills.split(',') if s.strip()]
            if not skills:
                validation_errors.append('missing_skills')
            
            return validation_errors

        while retry_count < max_retries:
            try:
                extraction_stats['attempts'] += 1
                
                # Calculate exponential backoff delay
                if retry_count > 0:
                    delay = base_delay * (2 ** (retry_count - 1))  # Exponential backoff
                    time.sleep(delay)
                
                # Generate prompt with more specific instructions
                prompt = """Extract the following information from the resume text in JSON format:
                - name (string): Full name of the candidate
                - email (string): Email address (MUST be in valid format: name@domain.com)
                - phone_number (string): Phone number with country code if available
                - category (string): Specific job category based on skills and experience
                - experience (number): Total years of experience
                - education (string): Highest education qualification with major/specialization
                - current_role (string): Current or most recent job title
                - current_company (string): Current or most recent company
                - location (string): Current location (City, State/Country)
                - experience_details (array): Detailed work history
                - skills (array): All technical and soft skills

                Requirements:
                1. Email MUST be a valid format (name@domain.com)
                2. Do not return 'N/A' or placeholder values
                3. Leave field empty if information is not found
                4. Skills should be specific and relevant
                5. Ensure consistent formatting

                Return only the JSON object, no other text.
                """
                
                response = model.generate_content(prompt + "\n\nResume Text:\n" + text)
                response_text = response.text.strip()
                response_text = response_text.replace('```json', '').replace('```', '').strip()
                
                # Parse and validate JSON
                result = json.loads(response_text)
                
                # Validate extracted information
                validation_errors = validate_extracted_info(result)
                
                if validation_errors:
                    extraction_stats['validation_failures'].append({
                        'attempt': retry_count + 1,
                        'errors': validation_errors
                    })
                    retry_count += 1
                    continue
                
                # Success - store the result and break
                resume_info = result
                break
                
            except json.JSONDecodeError as e:
                last_error = f"JSON parsing error: {str(e)}"
                extraction_stats['errors'].append({
                    'attempt': retry_count + 1,
                    'error_type': 'json_decode',
                    'message': str(e)
                })
            except Exception as e:
                last_error = f"Extraction error: {str(e)}"
                extraction_stats['errors'].append({
                    'attempt': retry_count + 1,
                    'error_type': 'general',
                    'message': str(e)
                })
            
            retry_count += 1
        
        # If all retries failed
        if not resume_info:
            print(f"Resume extraction failed after {retry_count} attempts: {last_error}")
            print("Extraction stats:", json.dumps(extraction_stats, indent=2))
            
            # Return default values with extraction stats
            return {
                "name": "",
                "email": "",
                "phone_number": "",
                "category": "",
                "experience": 0,
                "education": "",
                "current_role": "",
                "current_company": "",
                "location": "",
                "experience_details": [],
                "skills": [],
                "extraction_stats": extraction_stats
            }
        
        # Process successful extraction
        # Convert skills array to comma-separated string if it's an array
        if isinstance(resume_info.get('skills'), list):
            resume_info['skills'] = ', '.join(resume_info['skills'])
        
        # Add extraction statistics
        resume_info['extraction_stats'] = extraction_stats
        
        return resume_info
        
    except Exception as e:
        print(f"Fatal error in extract_resume_info: {str(e)}")
        # Return default values with error information
        return {
            "name": "",
            "email": "",
            "phone_number": "",
            "category": "",
            "experience": 0,
            "education": "",
            "current_role": "",
            "current_company": "",
            "location": "",
            "experience_details": [],
            "skills": "",
            "extraction_error": str(e)
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
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password
        is_valid, password_message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': password_message}), 400
        
        # Check if email or username already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'Email already exists'}), 400
        
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
        recruiters = list(recruiters_collection.find({'user_id': str(current_user['_id'])}))
        for recruiter in recruiters:
            recruiter['_id'] = str(recruiter['_id'])
            recruiter['id'] = str(recruiter['_id'])  # Add id field for frontend compatibility
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
    if not re.match(r"[^@]+@[^@]+\.[^@]+", recruiter['email']):
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
    
    # Validate email format if provided
    if data.get('email') and not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate country code format if provided
    if data.get('country_code') and not re.match(r"^\+\d{1,4}$", data['country_code']):
        return jsonify({'error': 'Invalid country code format. Use format: +XX'}), 400
    
    try:
        result = recruiters_collection.update_one(
            {
                '_id': ObjectId(recruiter_id),
                'user_id': str(current_user['_id'])
            },
            {'$set': data}
        )
        if result.modified_count == 0:
            return jsonify({'error': 'Recruiter not found or unauthorized'}), 404
        
        updated_recruiter = recruiters_collection.find_one({
            '_id': ObjectId(recruiter_id),
            'user_id': str(current_user['_id'])
        })
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
            '_id': ObjectId(recruiter_id),
            'user_id': str(current_user['_id'])
        })
        if result.deleted_count == 0:
            return jsonify({'error': 'Recruiter not found or unauthorized'}), 404
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
    submissions = list(submissions_collection.find({'user_id': str(current_user['_id'])}))
    for submission in submissions:
        submission['_id'] = str(submission['_id'])
    return jsonify(submissions)

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
            {
                '_id': ObjectId(submission_id),
                'user_id': str(current_user['_id'])
            },
            {'$set': data}
        )
        if result.modified_count == 0:
            return jsonify({'error': 'Submission not found or unauthorized'}), 404
        
        updated_submission = submissions_collection.find_one({
            '_id': ObjectId(submission_id),
            'user_id': str(current_user['_id'])
        })
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
            '_id': ObjectId(submission_id),
            'user_id': str(current_user['_id'])
        })
        if result.deleted_count == 0:
            return jsonify({'error': 'Submission not found or unauthorized'}), 404
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
        resumes = list(resumes_collection.find({'user_id': str(current_user['_id'])}))
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
    """Upload and process multiple resumes"""
    results = []
    total_files = 0

    try:
        # Check if files are present
        if 'file' not in request.files:
            return jsonify({
                'status': 'error', 
                'error': 'No files provided',
                'total_files': 0,
                'results': []
            }), 400

        files = request.files.getlist('file')
        total_files = len(files)

        # Validate file types
        valid_extensions = ['.pdf', '.docx', '.doc']
        for file in files:
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in valid_extensions:
                results.append({
                    'filename': file.filename,
                    'status': 'error',
                    'message': f'Invalid file format. Allowed: {", ".join(valid_extensions)}'
                })
                continue

            try:
                # Extract text from file
                resume_text = extract_text_from_file(file)
                
                # Extract resume information
                resume_info = extract_resume_info(resume_text)
                
                # Store file data
                file.seek(0)
                file_data = base64.b64encode(file.read()).decode('utf-8')
                
                # Create resume document
                resume = {
                    'user_id': str(current_user['_id']),
                    'filename': file.filename,
                    'content_type': file.content_type,
                    'file_data': file_data,
                    'text_content': resume_text,
                    **resume_info,
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
                
                # Insert resume
                result = resumes_collection.insert_one(resume)
                
                results.append({
                    'filename': file.filename,
                    'status': 'success',
                    'id': str(result.inserted_id),
                    'extracted_data': {
                        'name': resume_info.get('name', 'N/A'),
                        'email': resume_info.get('email', 'N/A'),
                        'skills': resume_info.get('skills', 'N/A')
                    }
                })
            
            except Exception as e:
                results.append({
                    'filename': file.filename,
                    'status': 'error',
                    'message': str(e)
                })

        return jsonify({
            'status': 'success',
            'total_files': total_files,
            'results': results,
            'successful_uploads': len([r for r in results if r['status'] == 'success']),
            'failed_uploads': len([r for r in results if r['status'] == 'error'])
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'total_files': total_files,
            'results': results
        }), 500

@app.route('/api/resumes/<resume_id>/preview', methods=['GET'])
@token_required
def preview_resume(current_user, resume_id):
    """Preview a resume file"""
    try:
        # Find the resume
        resume = resumes_collection.find_one({
            '_id': ObjectId(resume_id),
            'user_id': str(current_user['_id'])
        })
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404

        # Get file data and content type
        file_data = base64.b64decode(resume['file_data'])
        content_type = resume['content_type']
        
        # Create response with file data
        response = make_response(file_data)
        response.headers['Content-Type'] = content_type
        response.headers['Content-Disposition'] = f'inline; filename={resume["filename"]}'
        
        return response

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes/<resume_id>/download', methods=['GET'])
@token_required
def download_resume(current_user, resume_id):
    """Download a resume file"""
    try:
        # Find the resume
        resume = resumes_collection.find_one({
            '_id': ObjectId(resume_id),
            'user_id': str(current_user['_id'])
        })
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404

        # Get file data and content type
        file_data = base64.b64decode(resume['file_data'])
        content_type = resume['content_type']
        
        # Create response with file data
        response = make_response(file_data)
        response.headers['Content-Type'] = content_type
        response.headers['Content-Disposition'] = f'attachment; filename={resume["filename"]}'
        
        return response

    except Exception as e:
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

@app.route('/api/resumes/<resume_id>', methods=['DELETE'])
@token_required
def delete_resume(current_user, resume_id):
    """Delete a resume"""
    try:
        result = resumes_collection.delete_one({
            '_id': ObjectId(resume_id),
            'user_id': str(current_user['_id'])
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Resume not found or unauthorized'}), 404
            
        return jsonify({'message': 'Resume deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        max_retries = 3
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
        jobs = list(jobs_collection.find({'user_id': str(current_user['_id'])}))
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
    """Submit an application for a public job"""
    try:
        print(f"Received application for job with shareable link: {shareable_link}")  # Debug log
        
        # Find the job
        job = jobs_collection.find_one({'shareable_link': shareable_link})
        if not job:
            print(f"Job not found for shareable link: {shareable_link}")  # Debug log
            return jsonify({'error': 'Job not found'}), 404

        # Get form data
        candidate_name = request.form.get('name')
        candidate_email = request.form.get('email')
        candidate_phone = request.form.get('phone')
        linkedin_url = request.form.get('linkedin_url')
        candidate_state = request.form.get('state')
        candidate_country = request.form.get('country')
        pay_rate = request.form.get('expected_pay_rate')
        resume_file = request.files.get('resume')

        print(f"Received form data: name={candidate_name}, email={candidate_email}")  # Debug log

        # Validate required fields
        required_fields = {
            'name': candidate_name,
            'email': candidate_email,
            'state': candidate_state,
            'country': candidate_country,
            'expected_pay_rate': pay_rate
        }

        missing_fields = [field for field, value in required_fields.items() if not value]
        if missing_fields:
            print(f"Missing required fields: {missing_fields}")  # Debug log
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Process resume file if provided
        resume_id = None
        if resume_file:
            try:
                print("Processing resume file...")  # Debug log
                # Extract text from resume
                resume_text = extract_text_from_file(resume_file)
                
                # Extract resume information
                resume_info = extract_resume_info(resume_text)
                
                # Store file data
                resume_file.seek(0)
                resume_data = base64.b64encode(resume_file.read()).decode('utf-8')
                
                # Create resume document
                resume = {
                    'filename': resume_file.filename,
                    'content_type': resume_file.content_type,
                    'file_data': resume_data,
                    'text_content': resume_text,
                    **resume_info,
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
                
                # Insert resume
                resume_result = resumes_collection.insert_one(resume)
                resume_id = str(resume_result.inserted_id)
                print(f"Resume processed successfully with ID: {resume_id}")  # Debug log
            except Exception as e:
                print(f"Error processing resume: {str(e)}")  # Debug log
                return jsonify({'error': f'Failed to process resume file: {str(e)}'}), 400

        # Create public application document
        public_application = {
            'job_id': str(job['_id']),
            'job_title': job['title'],
            'company': job['client'],
            'candidate_name': candidate_name,
            'candidate_email': candidate_email,
            'candidate_phone': candidate_phone,
            'linkedin_url': linkedin_url,
            'candidate_state': candidate_state,
            'candidate_country': candidate_country,
            'pay_rate': pay_rate,
            'resume_id': resume_id,
            'application_status': 'New',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        print("Creating public application document...")  # Debug log
        # Insert public application
        public_result = public_applications_collection.insert_one(public_application)
        public_application['_id'] = str(public_result.inserted_id)
        public_application['id'] = str(public_result.inserted_id)

        # Create submission document for internal tracking
        submission = {
            'job_id': str(job['_id']),
            'user_id': str(job['user_id']),
            'candidate_name': candidate_name,
            'candidate_email': candidate_email,
            'candidate_phone': candidate_phone,
            'linkedin_url': linkedin_url,
            'candidate_state': candidate_state,
            'candidate_country': candidate_country,
            'pay_rate': pay_rate,
            'status': 'Submitted',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        if resume_id:
            submission['resume_id'] = resume_id

        print("Creating submission document...")  # Debug log
        # Insert submission
        result = submissions_collection.insert_one(submission)
        submission['_id'] = str(result.inserted_id)
        submission['id'] = str(result.inserted_id)

        print("Application submitted successfully")  # Debug log
        return jsonify({
            'message': 'Application submitted successfully',
            'application': public_application,
            'submission': submission
        }), 201

    except Exception as e:
        print(f"Error submitting application: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs/<job_id>', methods=['PUT'])
@token_required
def update_job(current_user, job_id):
    """Update an existing job"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if 'title' in data and not data['title']:
            return jsonify({'error': 'Job title cannot be empty'}), 400
        
        # Remove _id from data if present
        if '_id' in data:
            del data['_id']
        
        # Add updated_at timestamp
        data['updated_at'] = datetime.utcnow()
        
        # Ensure status is one of the allowed values
        if 'status' in data:
            if data['status'] not in ['open', 'closed']:
                return jsonify({'error': 'Invalid status value. Must be either "open" or "closed"'}), 400
        
        # Update the job
        result = jobs_collection.update_one(
            {
                '_id': ObjectId(job_id),
                'user_id': str(current_user['_id'])
            },
            {'$set': data}
        )
        
        if result.modified_count == 0:
            # Check if job exists
            job = jobs_collection.find_one({
                '_id': ObjectId(job_id),
                'user_id': str(current_user['_id'])
            })
            if not job:
                return jsonify({'error': 'Job not found'}), 404
            return jsonify({'error': 'No changes were made to the job'}), 400
        
        # Fetch and return the updated job
        updated_job = jobs_collection.find_one({
            '_id': ObjectId(job_id),
            'user_id': str(current_user['_id'])
        })
        
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
        submissions = submissions_collection.find_one({
            'job_id': job_id,
            'user_id': str(current_user['_id'])
        })
        
        if submissions:
            return jsonify({
                'error': 'Cannot delete job with existing submissions. Please delete the submissions first.'
            }), 400
        
        result = jobs_collection.delete_one({
            '_id': ObjectId(job_id),
            'user_id': str(current_user['_id'])
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Job not found or unauthorized'}), 404
            
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

# =============================================
# Application Entry Point
# =============================================
if __name__ == '__main__':
    app.run(debug=True, port=5000) 