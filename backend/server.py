from fastapi import FastAPI, APIRouter, HTTPException, Query, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import re
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# YouTube API Key
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', '')
YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

# Admin credentials (can be customized via environment variables)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'EduADLogin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'P1usD@pper@#stream')

# Emergent Auth URL for session validation
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ AUTO-CATEGORIZATION ============

CATEGORY_KEYWORDS = {
    'Computer Science': [
        'programming', 'computer', 'software', 'algorithm', 'data structure', 
        'machine learning', 'artificial intelligence', 'ai', 'ml', 'deep learning',
        'python', 'java', 'javascript', 'coding', 'web development', 'database',
        'neural network', 'nlp', 'computer vision', 'cybersecurity', 'operating system',
        'compiler', 'networking', 'cloud', 'devops', 'blockchain', 'cs229', 'cs183',
        'cs106', 'cs50', '6.001', '6.0001', 'mit ocw'
    ],
    'Mathematics': [
        'math', 'calculus', 'algebra', 'linear algebra', 'statistics', 'probability',
        'geometry', 'trigonometry', 'differential', 'integral', 'equation',
        'theorem', 'matrix', 'vector', 'numerical', 'discrete math', 'gilbert strang'
    ],
    'Physics': [
        'physics', 'quantum', 'mechanics', 'thermodynamics', 'electromagnetism',
        'relativity', 'particle', 'nuclear', 'optics', 'wave', 'energy',
        'motion', 'force', 'gravity', 'astrophysics', 'cosmology'
    ],
    'Chemistry': [
        'chemistry', 'chemical', 'organic', 'inorganic', 'biochemistry',
        'molecule', 'atom', 'reaction', 'compound', 'periodic table'
    ],
    'Biology': [
        'biology', 'genetics', 'evolution', 'cell', 'molecular biology',
        'anatomy', 'physiology', 'ecology', 'microbiology', 'neuroscience',
        'dna', 'rna', 'protein', 'organism'
    ],
    'Economics': [
        'economics', 'economy', 'finance', 'financial', 'market', 'trading',
        'investment', 'macroeconomics', 'microeconomics', 'monetary', 'fiscal',
        'stock', 'banking', 'accounting'
    ],
    'Psychology': [
        'psychology', 'psychological', 'mental', 'cognitive', 'behavior',
        'consciousness', 'emotion', 'personality', 'therapy', 'psychiatry',
        'wellbeing', 'well-being', 'happiness', 'mindfulness', 'paul bloom'
    ],
    'Philosophy': [
        'philosophy', 'philosophical', 'ethics', 'logic', 'metaphysics',
        'epistemology', 'morality', 'justice', 'existentialism', 'reasoning',
        'michael sandel'
    ],
    'History': [
        'history', 'historical', 'ancient', 'medieval', 'modern history',
        'civilization', 'war', 'revolution', 'empire', 'archaeology'
    ],
    'Political Science': [
        'political', 'politics', 'government', 'democracy', 'political thought',
        'political science', 'international relations', 'policy'
    ],
    'Engineering': [
        'engineering', 'mechanical', 'electrical', 'civil', 'aerospace',
        'robotics', 'automation', 'circuit', 'control system', 'manufacturing'
    ],
    'Business': [
        'business', 'management', 'marketing', 'entrepreneurship', 'strategy',
        'leadership', 'mba', 'startup', 'product management', 'consulting',
        'how to start', 'y combinator', 'yc', 'peter thiel', 'sam altman',
        'venture capital', 'founder', 'stanford cs183'
    ],
    'Literature': [
        'literature', 'writing', 'poetry', 'novel', 'shakespeare', 'drama',
        'fiction', 'narrative', 'literary', 'english literature'
    ],
}

def auto_categorize(title: str, description: str) -> str:
    """Auto-categorize course based on title and description keywords"""
    text = f"{title} {description}".lower()
    
    category_scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in text)
        if score > 0:
            category_scores[category] = score
    
    if category_scores:
        return max(category_scores, key=category_scores.get)
    
    return "General"

# ============ AUTH MODELS ============

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: str = ""
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ COURSE MODELS ============

class Module(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    videoId: str
    duration: str = ""
    position: int = 0
    thumbnail: str = ""

class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    playlistId: str
    thumbnail: str = ""
    channelTitle: str = ""
    channelId: str = ""
    university: str = "other"
    universityName: str = "Other"
    category: str = "General"
    year: int = Field(default_factory=lambda: datetime.now().year)
    duration: str = ""
    rating: int = 95
    quality: str = "HD"
    featured: bool = False
    isOriginal: bool = False
    modules: List[Module] = []
    videoCount: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CourseCreate(BaseModel):
    playlistUrl: str
    university: str = "other"
    universityName: str = "Other"
    category: str = "General"
    featured: bool = False

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    university: Optional[str] = None
    universityName: Optional[str] = None
    category: Optional[str] = None
    featured: Optional[bool] = None
    isOriginal: Optional[bool] = None
    rating: Optional[int] = None
    quality: Optional[str] = None

class ChannelFetch(BaseModel):
    channelId: str
    university: str = "other"
    universityName: str = "Other"
    category: str = "General"
    maxPlaylists: int = 10

# ============ YOUTUBE API HELPERS ============

def extract_playlist_id(url: str) -> str:
    """Extract playlist ID from various YouTube URL formats"""
    patterns = [
        r'list=([a-zA-Z0-9_-]+)',
        r'playlist\?list=([a-zA-Z0-9_-]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    # If no pattern matches, assume it's already a playlist ID
    if re.match(r'^[a-zA-Z0-9_-]+$', url):
        return url
    raise ValueError("Invalid playlist URL or ID")

def format_duration(duration_str: str) -> str:
    """Convert ISO 8601 duration to human readable format"""
    if not duration_str:
        return ""
    # PT1H2M3S -> 1h 2m
    hours = re.search(r'(\d+)H', duration_str)
    minutes = re.search(r'(\d+)M', duration_str)
    seconds = re.search(r'(\d+)S', duration_str)
    
    parts = []
    if hours:
        parts.append(f"{hours.group(1)}h")
    if minutes:
        parts.append(f"{minutes.group(1)}m")
    if not parts and seconds:
        parts.append(f"{seconds.group(1)}s")
    
    return ' '.join(parts) if parts else ""

async def fetch_playlist_details(playlist_id: str) -> dict:
    """Fetch playlist metadata from YouTube API"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{YOUTUBE_API_BASE}/playlists",
            params={
                'part': 'snippet,contentDetails',
                'id': playlist_id,
                'key': YOUTUBE_API_KEY
            }
        )
        data = response.json()
        
        if 'error' in data:
            raise HTTPException(status_code=400, detail=data['error']['message'])
        
        if not data.get('items'):
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        return data['items'][0]

async def fetch_playlist_items(playlist_id: str, max_results: int = 50) -> List[dict]:
    """Fetch all videos in a playlist"""
    items = []
    next_page_token = None
    
    async with httpx.AsyncClient() as client:
        while True:
            params = {
                'part': 'snippet,contentDetails',
                'playlistId': playlist_id,
                'maxResults': min(50, max_results - len(items)),
                'key': YOUTUBE_API_KEY
            }
            if next_page_token:
                params['pageToken'] = next_page_token
            
            response = await client.get(f"{YOUTUBE_API_BASE}/playlistItems", params=params)
            data = response.json()
            
            if 'error' in data:
                raise HTTPException(status_code=400, detail=data['error']['message'])
            
            items.extend(data.get('items', []))
            
            next_page_token = data.get('nextPageToken')
            if not next_page_token or len(items) >= max_results:
                break
    
    return items

async def fetch_video_details(video_ids: List[str]) -> dict:
    """Fetch video details including duration"""
    if not video_ids:
        return {}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{YOUTUBE_API_BASE}/videos",
            params={
                'part': 'contentDetails,snippet',
                'id': ','.join(video_ids[:50]),  # API limit
                'key': YOUTUBE_API_KEY
            }
        )
        data = response.json()
        
        return {item['id']: item for item in data.get('items', [])}

async def fetch_channel_playlists(channel_id: str, max_results: int = 10) -> List[dict]:
    """Fetch playlists from a YouTube channel"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{YOUTUBE_API_BASE}/playlists",
            params={
                'part': 'snippet,contentDetails',
                'channelId': channel_id,
                'maxResults': max_results,
                'key': YOUTUBE_API_KEY
            }
        )
        data = response.json()
        
        if 'error' in data:
            raise HTTPException(status_code=400, detail=data['error']['message'])
        
        return data.get('items', [])

# ============ API ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "EduStream API v1.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "youtube_api": bool(YOUTUBE_API_KEY)}

# ============ AUTH HELPER ============

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token (cookie or header)"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

async def require_auth(request: Request) -> User:
    """Require authentication - raises 401 if not authenticated"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> User:
    """Require admin authentication"""
    user = await require_auth(request)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id from Emergent Auth for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id with Emergent Auth
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            EMERGENT_AUTH_URL,
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        auth_data = auth_response.json()
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture", "")
    emergent_session_token = auth_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "is_admin": False,
            "created_at": datetime.now(timezone.utc)
        })
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
        max_age=7 * 24 * 60 * 60
    )

    # Get user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return user_doc

@api_router.get("/auth/me")
async def get_current_user_endpoint(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.dict()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out successfully"}

# ============ ADMIN LOGIN ============

class AdminLoginRequest(BaseModel):
    username: str
    password: str

@api_router.post("/auth/admin/login")
async def admin_login(login_data: AdminLoginRequest, response: Response):
    """Simple admin login with username/password"""
    if login_data.username != ADMIN_USERNAME or login_data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create admin session
    admin_user_id = "admin_user"
    
    # Check if admin user exists
    existing_admin = await db.users.find_one({"user_id": admin_user_id}, {"_id": 0})
    if not existing_admin:
        await db.users.insert_one({
            "user_id": admin_user_id,
            "email": "admin@edustream.local",
            "name": "Admin",
            "picture": "",
            "is_admin": True,
            "created_at": datetime.now(timezone.utc)
        })
    
    # Create session token
    session_token = f"admin_sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": admin_user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
        max_age=7 * 24 * 60 * 60
    )

    return {
        "user_id": admin_user_id,
        "email": "admin@edustream.local",
        "name": "Admin",
        "is_admin": True
    }

# ============ COURSE RE-CATEGORIZATION ============

@api_router.post("/admin/recategorize")
async def recategorize_all_courses():
    """Re-categorize all existing courses based on improved keyword matching"""
    cursor = db.courses.find({})
    courses = await cursor.to_list(length=500)
    
    updated = []
    for course in courses:
        old_category = course.get('category', 'General')
        new_category = auto_categorize(course['title'], course.get('description', ''))
        
        if old_category != new_category:
            await db.courses.update_one(
                {"id": course['id']},
                {"$set": {"category": new_category, "updatedAt": datetime.utcnow()}}
            )
            updated.append({
                "title": course['title'],
                "old": old_category,
                "new": new_category
            })
    
    return {
        "total_courses": len(courses),
        "updated_count": len(updated),
        "changes": updated
    }

# ---- Course Management ----

@api_router.post("/courses", response_model=Course)
async def create_course_from_playlist(input: CourseCreate):
    """Create a new course from a YouTube playlist URL"""
    try:
        playlist_id = extract_playlist_id(input.playlistUrl)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Check if playlist already exists
    existing = await db.courses.find_one({"playlistId": playlist_id})
    if existing:
        raise HTTPException(status_code=400, detail="This playlist has already been added as a course")
    
    # Fetch playlist details
    playlist_data = await fetch_playlist_details(playlist_id)
    snippet = playlist_data['snippet']
    content_details = playlist_data['contentDetails']
    
    # Fetch playlist items (videos)
    playlist_items = await fetch_playlist_items(playlist_id)
    
    # Get video IDs for duration lookup
    video_ids = [
        item['snippet']['resourceId']['videoId'] 
        for item in playlist_items 
        if item['snippet']['resourceId']['kind'] == 'youtube#video'
    ]
    
    # Fetch video details for duration
    video_details = await fetch_video_details(video_ids)
    
    # Build modules
    modules = []
    total_duration_minutes = 0
    
    for i, item in enumerate(playlist_items):
        if item['snippet']['resourceId']['kind'] != 'youtube#video':
            continue
        
        video_id = item['snippet']['resourceId']['videoId']
        video_info = video_details.get(video_id, {})
        duration_iso = video_info.get('contentDetails', {}).get('duration', '')
        duration_str = format_duration(duration_iso)
        
        # Calculate minutes for total
        hours_match = re.search(r'(\d+)H', duration_iso)
        mins_match = re.search(r'(\d+)M', duration_iso)
        if hours_match:
            total_duration_minutes += int(hours_match.group(1)) * 60
        if mins_match:
            total_duration_minutes += int(mins_match.group(1))
        
        thumbnail = item['snippet']['thumbnails'].get('high', {}).get('url', '')
        if not thumbnail:
            thumbnail = item['snippet']['thumbnails'].get('default', {}).get('url', '')
        
        modules.append(Module(
            title=item['snippet']['title'],
            videoId=video_id,
            duration=duration_str,
            position=i,
            thumbnail=thumbnail
        ))
    
    # Calculate total duration string
    total_hours = total_duration_minutes // 60
    total_mins = total_duration_minutes % 60
    if total_hours > 0:
        total_duration = f"{total_hours}h {total_mins}m"
    else:
        total_duration = f"{total_mins}m"
    
    # Get best thumbnail
    thumbnails = snippet.get('thumbnails', {})
    thumbnail = (
        thumbnails.get('maxres', {}).get('url') or
        thumbnails.get('high', {}).get('url') or
        thumbnails.get('medium', {}).get('url') or
        thumbnails.get('default', {}).get('url', '')
    )
    
    # Auto-categorize if category is "General" or not specified
    category = input.category
    if category == "General" or not category:
        category = auto_categorize(snippet['title'], snippet.get('description', ''))
    
    # Create course
    course = Course(
        title=snippet['title'],
        description=snippet.get('description', '')[:500],
        playlistId=playlist_id,
        thumbnail=thumbnail,
        channelTitle=snippet.get('channelTitle', ''),
        channelId=snippet.get('channelId', ''),
        university=input.university,
        universityName=input.universityName,
        category=category,
        featured=input.featured,
        duration=total_duration,
        videoCount=content_details.get('itemCount', len(modules)),
        modules=[m.dict() for m in modules],
        quality='HD' if any('1080' in str(v) for v in video_details.values()) else 'HD'
    )
    
    # Save to database
    await db.courses.insert_one(course.dict())
    
    return course

@api_router.get("/courses", response_model=List[Course])
async def get_courses(
    university: Optional[str] = None,
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, le=500)
):
    """Get all courses with optional filters"""
    query = {}
    
    if university:
        query['university'] = university
    if category:
        query['category'] = category
    if featured is not None:
        query['featured'] = featured
    if search:
        query['$or'] = [
            {'title': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'channelTitle': {'$regex': search, '$options': 'i'}},
            {'category': {'$regex': search, '$options': 'i'}}
        ]
    
    cursor = db.courses.find(query).sort('createdAt', -1).limit(limit)
    courses = await cursor.to_list(length=limit)
    
    return [Course(**course) for course in courses]

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    """Get a single course by ID"""
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**course)

@api_router.put("/courses/{course_id}", response_model=Course)
async def update_course(course_id: str, update: CourseUpdate):
    """Update course metadata"""
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data['updatedAt'] = datetime.utcnow()
    
    await db.courses.update_one({"id": course_id}, {"$set": update_data})
    
    updated_course = await db.courses.find_one({"id": course_id})
    return Course(**updated_course)

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    """Delete a course"""
    result = await db.courses.delete_one({"id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

@api_router.post("/courses/{course_id}/refresh", response_model=Course)
async def refresh_course(course_id: str):
    """Refresh course data from YouTube API"""
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    playlist_id = course['playlistId']
    
    # Fetch updated playlist data
    playlist_data = await fetch_playlist_details(playlist_id)
    playlist_items = await fetch_playlist_items(playlist_id)
    
    video_ids = [
        item['snippet']['resourceId']['videoId'] 
        for item in playlist_items 
        if item['snippet']['resourceId']['kind'] == 'youtube#video'
    ]
    video_details = await fetch_video_details(video_ids)
    
    # Rebuild modules
    modules = []
    total_duration_minutes = 0
    
    for i, item in enumerate(playlist_items):
        if item['snippet']['resourceId']['kind'] != 'youtube#video':
            continue
        
        video_id = item['snippet']['resourceId']['videoId']
        video_info = video_details.get(video_id, {})
        duration_iso = video_info.get('contentDetails', {}).get('duration', '')
        duration_str = format_duration(duration_iso)
        
        hours_match = re.search(r'(\d+)H', duration_iso)
        mins_match = re.search(r'(\d+)M', duration_iso)
        if hours_match:
            total_duration_minutes += int(hours_match.group(1)) * 60
        if mins_match:
            total_duration_minutes += int(mins_match.group(1))
        
        thumbnail = item['snippet']['thumbnails'].get('high', {}).get('url', '')
        
        modules.append({
            'id': str(uuid.uuid4()),
            'title': item['snippet']['title'],
            'videoId': video_id,
            'duration': duration_str,
            'position': i,
            'thumbnail': thumbnail
        })
    
    total_hours = total_duration_minutes // 60
    total_mins = total_duration_minutes % 60
    total_duration = f"{total_hours}h {total_mins}m" if total_hours > 0 else f"{total_mins}m"
    
    # Update course
    snippet = playlist_data['snippet']
    thumbnails = snippet.get('thumbnails', {})
    thumbnail = (
        thumbnails.get('maxres', {}).get('url') or
        thumbnails.get('high', {}).get('url') or
        thumbnails.get('medium', {}).get('url', '')
    )
    
    update_data = {
        'title': snippet['title'],
        'description': snippet.get('description', '')[:500],
        'thumbnail': thumbnail,
        'modules': modules,
        'videoCount': len(modules),
        'duration': total_duration,
        'updatedAt': datetime.utcnow()
    }
    
    await db.courses.update_one({"id": course_id}, {"$set": update_data})
    
    updated_course = await db.courses.find_one({"id": course_id})
    return Course(**updated_course)

# ---- Channel Import ----

@api_router.post("/channels/import")
async def import_from_channel(input: ChannelFetch):
    """Import playlists from a YouTube channel"""
    playlists = await fetch_channel_playlists(input.channelId, input.maxPlaylists)
    
    imported = []
    skipped = []
    
    for playlist in playlists:
        playlist_id = playlist['id']
        
        # Check if already exists
        existing = await db.courses.find_one({"playlistId": playlist_id})
        if existing:
            skipped.append(playlist['snippet']['title'])
            continue
        
        try:
            # Create course from this playlist
            course_input = CourseCreate(
                playlistUrl=playlist_id,
                university=input.university,
                universityName=input.universityName,
                category=input.category
            )
            course = await create_course_from_playlist(course_input)
            imported.append(course.title)
        except Exception as e:
            logger.error(f"Failed to import playlist {playlist_id}: {e}")
            skipped.append(playlist['snippet']['title'])
    
    return {
        "imported": len(imported),
        "skipped": len(skipped),
        "importedTitles": imported,
        "skippedTitles": skipped
    }

# ---- Categories & Universities ----

@api_router.get("/categories")
async def get_categories():
    """Get all unique categories"""
    categories = await db.courses.distinct('category')
    return categories

@api_router.get("/universities")
async def get_universities():
    """Get all unique universities"""
    pipeline = [
        {'$group': {'_id': {'university': '$university', 'universityName': '$universityName'}}},
        {'$project': {'university': '$_id.university', 'universityName': '$_id.universityName', '_id': 0}}
    ]
    cursor = db.courses.aggregate(pipeline)
    universities = await cursor.to_list(length=100)
    return universities

# ---- Stats ----

@api_router.get("/stats")
async def get_stats():
    """Get platform statistics"""
    total_courses = await db.courses.count_documents({})
    featured_courses = await db.courses.count_documents({"featured": True})
    
    # Count total videos
    pipeline = [
        {'$project': {'videoCount': 1}},
        {'$group': {'_id': None, 'total': {'$sum': '$videoCount'}}}
    ]
    cursor = db.courses.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    total_videos = result[0]['total'] if result else 0
    
    categories = await db.courses.distinct('category')
    universities = await db.courses.distinct('university')
    
    return {
        "totalCourses": total_courses,
        "featuredCourses": featured_courses,
        "totalVideos": total_videos,
        "totalCategories": len(categories),
        "totalUniversities": len(universities)
    }

# ---- Smart YouTube Search ----

# Default educational channel IDs (can be extended via database)
DEFAULT_EDUCATIONAL_CHANNELS = {
    'UCEBb1b_L6zDS3xTUrIALZOw': {'name': 'MIT OpenCourseWare', 'university': 'mit', 'universityName': 'MIT OpenCourseWare'},
    'UCSIvk78tK2TiviLQn4fSHaw': {'name': 'Stanford', 'university': 'stanford', 'universityName': 'Stanford Online'},
    'UCiMhD4jzUqG-IgPzUmmytRQ': {'name': 'Yale', 'university': 'yale', 'universityName': 'Yale Courses'},
    'UCcvhgJmjKZA_Y6Qq1kW1NKg': {'name': 'Harvard', 'university': 'harvard', 'universityName': 'Harvard'},
    'UC8butISFwT-Wl7EV0hUK0BQ': {'name': 'freeCodeCamp', 'university': 'other', 'universityName': 'freeCodeCamp'},
    'UCvjgEDvShRsAg8Hl2wMtQzg': {'name': 'NPTEL', 'university': 'nptel', 'universityName': 'NPTEL (IITs)'},
    'UCqNLx3e0NFpOVg5ixiVDsHQ': {'name': 'SWAYAM', 'university': 'swayam', 'universityName': 'SWAYAM'},
    'UCWN3xxRkmTPphiiT1F2KWcg': {'name': 'CrashCourse', 'university': 'other', 'universityName': 'CrashCourse'},
    'UC7_gcs09iThXybpVgjHZ_7g': {'name': 'PBS', 'university': 'other', 'universityName': 'PBS'},
    'UCsooa4yRKGN_zEE8iknghZA': {'name': 'TED-Ed', 'university': 'other', 'universityName': 'TED-Ed'},
}

class WhitelistedChannel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    channelId: str
    name: str
    university: str = "other"
    universityName: str = "Other"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class WhitelistedChannelCreate(BaseModel):
    channelId: str
    name: str
    university: str = "other"
    universityName: str = "Other"

async def get_all_whitelisted_channels():
    """Get combined list of default + database whitelisted channels"""
    channels = dict(DEFAULT_EDUCATIONAL_CHANNELS)
    
    # Get channels from database
    db_channels = await db.whitelisted_channels.find().to_list(length=100)
    for ch in db_channels:
        channels[ch['channelId']] = {
            'name': ch['name'],
            'university': ch['university'],
            'universityName': ch['universityName']
        }
    
    return channels

# ---- Whitelist Management ----

@api_router.get("/whitelist")
async def get_whitelist():
    """Get all whitelisted channels (default + custom)"""
    # Get custom channels from database
    db_channels = await db.whitelisted_channels.find().to_list(length=100)
    custom_channels = [WhitelistedChannel(**ch) for ch in db_channels]
    
    # Format default channels
    default_channels = [
        {
            'id': f'default-{cid}',
            'channelId': cid,
            'name': info['name'],
            'university': info['university'],
            'universityName': info['universityName'],
            'isDefault': True
        }
        for cid, info in DEFAULT_EDUCATIONAL_CHANNELS.items()
    ]
    
    return {
        'default': default_channels,
        'custom': custom_channels
    }

@api_router.post("/whitelist", response_model=WhitelistedChannel)
async def add_to_whitelist(channel: WhitelistedChannelCreate):
    """Add a channel to the whitelist"""
    # Check if already exists
    existing = await db.whitelisted_channels.find_one({'channelId': channel.channelId})
    if existing:
        raise HTTPException(status_code=400, detail="Channel already in whitelist")
    
    # Check if it's a default channel
    if channel.channelId in DEFAULT_EDUCATIONAL_CHANNELS:
        raise HTTPException(status_code=400, detail="Channel is already in default whitelist")
    
    channel_obj = WhitelistedChannel(**channel.dict())
    await db.whitelisted_channels.insert_one(channel_obj.dict())
    
    return channel_obj

@api_router.delete("/whitelist/{channel_id}")
async def remove_from_whitelist(channel_id: str):
    """Remove a custom channel from whitelist"""
    result = await db.whitelisted_channels.delete_one({'id': channel_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Channel not found in custom whitelist")
    return {"message": "Channel removed from whitelist"}

@api_router.get("/whitelist/lookup/{channel_id}")
async def lookup_channel(channel_id: str):
    """Lookup a YouTube channel by ID to get its name"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{YOUTUBE_API_BASE}/channels",
            params={
                'part': 'snippet',
                'id': channel_id,
                'key': YOUTUBE_API_KEY
            }
        )
        data = response.json()
        
        if 'error' in data:
            raise HTTPException(status_code=400, detail=data['error']['message'])
        
        if not data.get('items'):
            raise HTTPException(status_code=404, detail="Channel not found")
        
        channel = data['items'][0]
        return {
            'channelId': channel['id'],
            'name': channel['snippet']['title'],
            'thumbnail': channel['snippet']['thumbnails']['default']['url']
        }

@api_router.get("/whitelist/resolve")
async def resolve_channel_handle(url: str = Query(..., description="YouTube channel URL or handle")):
    """Resolve a YouTube handle (@username) or URL to a channel ID"""
    channel_id = None
    handle = None
    
    # Extract handle or channel ID from URL
    url = url.strip()
    
    # Handle formats:
    # - @username
    # - https://www.youtube.com/@username
    # - https://www.youtube.com/channel/UCxxxxx
    # - UCxxxxx (direct channel ID)
    
    if url.startswith('@'):
        # Direct handle
        handle = url[1:]  # Remove @
    elif '/@' in url:
        # URL with handle
        handle = url.split('/@')[1].split('/')[0].split('?')[0]
    elif '/channel/' in url:
        # Direct channel URL
        channel_id = url.split('/channel/')[1].split('/')[0].split('?')[0]
    elif url.startswith('UC') and len(url) >= 24:
        # Direct channel ID
        channel_id = url[:24]
    elif 'youtube.com' in url:
        # Try to extract from various URL formats
        parts = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')
        if len(parts) > 1:
            potential = parts[1].split('?')[0]
            if potential.startswith('@'):
                handle = potential[1:]
            elif potential.startswith('UC'):
                channel_id = potential
    else:
        # Assume it's a handle without @
        handle = url
    
    # If we have a handle, resolve it using YouTube API forHandle
    if not channel_id and handle:
        try:
            async with httpx.AsyncClient() as client:
                # Try forHandle parameter first (most accurate)
                response = await client.get(
                    f"{YOUTUBE_API_BASE}/channels",
                    params={
                        'part': 'snippet',
                        'forHandle': handle,
                        'key': YOUTUBE_API_KEY
                    }
                )
                data = response.json()
                
                if data.get('items'):
                    channel_id = data['items'][0]['id']
                else:
                    # Fallback to search
                    response = await client.get(
                        f"{YOUTUBE_API_BASE}/search",
                        params={
                            'part': 'snippet',
                            'q': f"@{handle}",
                            'type': 'channel',
                            'maxResults': 1,
                            'key': YOUTUBE_API_KEY
                        }
                    )
                    data = response.json()
                    
                    if 'error' in data:
                        raise HTTPException(status_code=400, detail=data['error']['message'])
                    
                    if data.get('items'):
                        channel_id = data['items'][0]['id']['channelId']
                    
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error resolving handle {handle}: {e}")
            raise HTTPException(status_code=400, detail=f"Could not resolve handle: {str(e)}")
    
    if not channel_id:
        raise HTTPException(status_code=404, detail="Could not resolve channel. Try using the channel ID directly (starts with UC).")
    
    # Now get channel details
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{YOUTUBE_API_BASE}/channels",
            params={
                'part': 'snippet',
                'id': channel_id,
                'key': YOUTUBE_API_KEY
            }
        )
        data = response.json()
        
        if not data.get('items'):
            raise HTTPException(status_code=404, detail="Channel not found")
        
        channel = data['items'][0]
        return {
            'channelId': channel['id'],
            'name': channel['snippet']['title'],
            'description': channel['snippet'].get('description', '')[:200],
            'thumbnail': channel['snippet']['thumbnails']['default']['url']
        }

# ---- Custom Universities & Categories ----

@api_router.get("/admin/universities")
async def get_universities():
    """Get all universities (default + custom)"""
    default_universities = [
        {'id': 'mit', 'name': 'MIT OpenCourseWare'},
        {'id': 'stanford', 'name': 'Stanford Online'},
        {'id': 'yale', 'name': 'Yale Open Courses'},
        {'id': 'harvard', 'name': 'Harvard Online'},
        {'id': 'berkeley', 'name': 'UC Berkeley'},
        {'id': 'princeton', 'name': 'Princeton'},
        {'id': 'nptel', 'name': 'NPTEL (IITs)'},
        {'id': 'swayam', 'name': 'SWAYAM'},
        {'id': 'other', 'name': 'Other'},
    ]
    
    # Get custom universities from database
    custom = await db.custom_universities.find().to_list(length=100)
    custom_list = [{'id': u['id'], 'name': u['name'], 'custom': True} for u in custom]
    
    return {
        'default': default_universities,
        'custom': custom_list
    }

@api_router.post("/admin/universities")
async def add_university(name: str = Query(...)):
    """Add a custom university"""
    uni_id = name.lower().replace(' ', '_').replace('-', '_')
    
    # Check if exists
    existing = await db.custom_universities.find_one({'id': uni_id})
    if existing:
        raise HTTPException(status_code=400, detail="University already exists")
    
    await db.custom_universities.insert_one({
        'id': uni_id,
        'name': name,
        'createdAt': datetime.utcnow()
    })
    
    return {'id': uni_id, 'name': name}

@api_router.delete("/admin/universities/{uni_id}")
async def delete_university(uni_id: str):
    """Delete a custom university"""
    result = await db.custom_universities.delete_one({'id': uni_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="University not found")
    return {"message": "University deleted"}

@api_router.get("/admin/categories")
async def get_categories():
    """Get all categories (default + custom)"""
    default_categories = list(CATEGORY_KEYWORDS.keys())
    
    # Get custom categories from database
    custom = await db.custom_categories.find().to_list(length=100)
    custom_list = [c['name'] for c in custom]
    
    return {
        'default': default_categories,
        'custom': custom_list
    }

@api_router.post("/admin/categories")
async def add_category(name: str = Query(...), keywords: str = Query(default="")):
    """Add a custom category with optional keywords"""
    # Check if exists in defaults
    if name in CATEGORY_KEYWORDS:
        raise HTTPException(status_code=400, detail="Category already exists in defaults")
    
    # Check if exists in custom
    existing = await db.custom_categories.find_one({'name': name})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    keyword_list = [k.strip().lower() for k in keywords.split(',') if k.strip()]
    
    await db.custom_categories.insert_one({
        'name': name,
        'keywords': keyword_list,
        'createdAt': datetime.utcnow()
    })
    
    return {'name': name, 'keywords': keyword_list}

@api_router.delete("/admin/categories/{category_name}")
async def delete_category(category_name: str):
    """Delete a custom category"""
    result = await db.custom_categories.delete_one({'name': category_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

class YouTubeSearchResult(BaseModel):
    playlistId: str
    title: str
    description: str
    thumbnail: str
    channelId: str
    channelTitle: str
    videoCount: int = 0
    isEducational: bool = False
    university: str = "other"
    universityName: str = "Other"
    alreadyAdded: bool = False

@api_router.get("/search/youtube")
async def search_youtube_playlists(
    q: str = Query(..., min_length=2, description="Search query"),
    max_results: int = Query(default=10, le=25),
    auto_add: bool = Query(default=True, description="Auto-add courses from whitelisted channels")
):
    """Search YouTube for educational playlists and auto-add from whitelisted channels"""
    
    # Get all whitelisted channels (default + custom)
    whitelisted_channels = await get_all_whitelisted_channels()
    
    async with httpx.AsyncClient() as http_client:
        # Search for playlists on YouTube
        response = await http_client.get(
            f"{YOUTUBE_API_BASE}/search",
            params={
                'part': 'snippet',
                'q': f"{q} course lecture university",
                'type': 'playlist',
                'maxResults': max_results,
                'key': YOUTUBE_API_KEY
            }
        )
        data = response.json()
        
        if 'error' in data:
            raise HTTPException(status_code=400, detail=data['error']['message'])
        
        results = []
        playlist_ids = []
        auto_added = []
        
        for item in data.get('items', []):
            playlist_id = item['id']['playlistId']
            playlist_ids.append(playlist_id)
            
            snippet = item['snippet']
            channel_id = snippet.get('channelId', '')
            
            # Check if from whitelisted channel
            channel_info = whitelisted_channels.get(channel_id, {})
            is_educational = bool(channel_info)
            
            # Get best thumbnail
            thumbnails = snippet.get('thumbnails', {})
            thumbnail = (
                thumbnails.get('high', {}).get('url') or
                thumbnails.get('medium', {}).get('url') or
                thumbnails.get('default', {}).get('url', '')
            )
            
            results.append({
                'playlistId': playlist_id,
                'title': snippet.get('title', ''),
                'description': snippet.get('description', '')[:200],
                'thumbnail': thumbnail,
                'channelId': channel_id,
                'channelTitle': snippet.get('channelTitle', ''),
                'videoCount': 0,
                'isEducational': is_educational,
                'university': channel_info.get('university', 'other'),
                'universityName': channel_info.get('universityName', 'Other'),
                'alreadyAdded': False,
                'autoAdded': False
            })
        
        # Get video counts for playlists
        if playlist_ids:
            playlist_response = await http_client.get(
                f"{YOUTUBE_API_BASE}/playlists",
                params={
                    'part': 'contentDetails',
                    'id': ','.join(playlist_ids),
                    'key': YOUTUBE_API_KEY
                }
            )
            playlist_data = playlist_response.json()
            
            video_counts = {}
            for item in playlist_data.get('items', []):
                video_counts[item['id']] = item['contentDetails']['itemCount']
            
            for result in results:
                result['videoCount'] = video_counts.get(result['playlistId'], 0)
        
        # Check which playlists are already added
        existing_playlists = await db.courses.find(
            {'playlistId': {'$in': playlist_ids}},
            {'playlistId': 1}
        ).to_list(length=100)
        existing_ids = {p['playlistId'] for p in existing_playlists}
        
        # Auto-add from whitelisted channels if enabled
        if auto_add:
            for result in results:
                if result['isEducational'] and result['playlistId'] not in existing_ids:
                    try:
                        # Auto-add this course
                        course_input = CourseCreate(
                            playlistUrl=result['playlistId'],
                            university=result['university'],
                            universityName=result['universityName'],
                            category="General",  # Will be auto-categorized
                            featured=True  # Featured since from whitelisted channel
                        )
                        await create_course_from_playlist(course_input)
                        result['alreadyAdded'] = True
                        result['autoAdded'] = True
                        auto_added.append(result['title'])
                        existing_ids.add(result['playlistId'])
                        logger.info(f"Auto-added course from whitelist: {result['title']}")
                    except Exception as e:
                        logger.error(f"Failed to auto-add {result['playlistId']}: {e}")
        
        for result in results:
            result['alreadyAdded'] = result['playlistId'] in existing_ids
        
        # Sort: educational first, then by video count
        results.sort(key=lambda x: (-x['isEducational'], -x['videoCount']))
        
        return {
            'results': results,
            'autoAdded': auto_added,
            'autoAddedCount': len(auto_added)
        }

@api_router.post("/search/youtube/add")
async def add_from_youtube_search(playlist_id: str, category: str = "General"):
    """Quick add a playlist from YouTube search results"""
    
    # Check if already exists
    existing = await db.courses.find_one({"playlistId": playlist_id})
    if existing:
        raise HTTPException(status_code=400, detail="This playlist has already been added")
    
    # Get whitelisted channels
    whitelisted_channels = await get_all_whitelisted_channels()
    
    # Fetch playlist details
    playlist_data = await fetch_playlist_details(playlist_id)
    snippet = playlist_data['snippet']
    channel_id = snippet.get('channelId', '')
    
    # Get channel info from whitelist
    channel_info = whitelisted_channels.get(channel_id, {})
    university = channel_info.get('university', 'other')
    university_name = channel_info.get('universityName', 'Other')
    
    # Create course using existing function
    course_input = CourseCreate(
        playlistUrl=playlist_id,
        university=university,
        universityName=university_name,
        category=category,
        featured=bool(channel_info)  # Auto-feature if from whitelisted channel
    )
    
    return await create_course_from_playlist(course_input)

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
