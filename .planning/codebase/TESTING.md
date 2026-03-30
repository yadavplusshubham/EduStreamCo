# Testing Patterns

**Analysis Date:** 2026-03-30

## Test Framework

**Runner:**
- Frontend: Jest (via `craco test` in package.json, part of react-scripts)
- Backend: pytest (version 8.0.0+, in `requirements.txt`)
- Config: Frontend uses create-react-app default Jest config; Backend has no explicit `pytest.ini` or `conftest.py`

**Assertion Library:**
- Backend: pytest assertions (using `assert` statements)
- Frontend: Jest assertions (implicit via react-scripts)

**Run Commands:**
```bash
# Frontend
yarn test                   # Run tests via craco (Jest)
yarn start                  # Dev server
yarn build                  # Production build

# Backend
pytest                      # Run all tests
pytest tests/test_admin_settings.py  # Run specific test file
pytest -v                   # Verbose output
```

## Test File Organization

**Location:**
- Frontend: No test files found in codebase (no `*.test.js`, `*.test.jsx`, `*.spec.js` files)
- Backend: Tests stored in `/tests/` directory and `backend_test.py` at project root

**Naming:**
- Backend: `test_*.py` convention (e.g., `test_admin_settings.py`)
- Backend integration test: `backend_test.py` at root level

**Structure:**
```
EduStream-main/
├── tests/
│   ├── __init__.py
│   └── test_admin_settings.py
└── backend_test.py
```

## Test Structure

**Suite Organization:**

Backend uses pytest class-based organization:
```python
class TestAdminLogin:
    """Admin authentication tests"""

    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
            "username": "admin",
            "password": "edustream2024"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_admin"] == True
        assert data["user_id"] == "admin_user"
```

**Patterns:**

Setup:
```python
# Class-level docstrings describe test purpose
class TestAdminLogin:
    """Admin authentication tests"""
```

Teardown:
```python
# Cleanup pattern - delete created test data
delete_response = requests.delete(f"{BASE_URL}/api/admin/universities/{uni_id}")
assert delete_response.status_code == 200

# Verify cleanup
get_response = requests.get(f"{BASE_URL}/api/admin/universities")
universities = get_response.json()
custom_names = [u["name"] for u in universities["custom"]]
assert unique_name not in custom_names
```

Assertion pattern:
```python
# Direct assertions on HTTP status and response content
assert response.status_code == 200
assert data["is_admin"] == True
assert "id" in data
assert isinstance(data["default"], list)
```

## Test Types

**Unit Tests:**
- Not found in codebase

**Integration Tests:**
- Backend focuses on API integration testing
- Tests hit actual running backend endpoint (e.g., `BASE_URL = 'https://streamlearn-2.preview.emergentagent.com'`)
- Tests verify HTTP contract: status codes, response structure, field presence

**E2E Tests:**
- Backend `backend_test.py`: Tests the complete API workflow
  - Health check endpoint
  - Stats endpoint
  - Course creation from playlist
  - Course retrieval
  - Course updates
  - Deletion
  - Real YouTube API integration

```python
# From backend_test.py
def test_health_check(self):
    """Test GET /api/health endpoint"""
    response = self.session.get(f"{self.base_url}/api/health", timeout=10)
    if response.status_code == 200:
        data = response.json()
        if data.get('status') == 'healthy' and 'youtube_api' in data:
            self.log_test(...)
            return True
```

## Mocking

**Framework:**
- Not found: No mocking library imports (no unittest.mock, pytest-mock, etc.)
- Integration tests use real HTTP requests against running backend

**Patterns:**

Backend integration tests make real requests:
```python
# No mocking - real HTTP request
response = requests.post(
    f"{self.base_url}/api/courses",
    json=course_data,
    timeout=30
)
```

Database state is real:
```python
# Tests verify actual MongoDB data persistence
response = requests.delete(f"{BASE_URL}/api/admin/universities/{uni_id}")
assert response.status_code == 200

# Verify it's actually deleted
get_response = requests.get(f"{BASE_URL}/api/admin/universities")
universities = get_response.json()
custom_names = [u["name"] for u in universities["custom"]]
assert unique_name not in custom_names
```

**What to Mock:**
- No mocking patterns established (tests are integration-focused)
- External APIs (YouTube) are called directly, not mocked

**What NOT to Mock:**
- Database operations (real MongoDB is used)
- HTTP endpoints (tests target real running server)

## Fixtures and Test Data

**Test Data:**

Backend uses unique test data to avoid conflicts:
```python
# From test_admin_settings.py
unique_name = f"TEST_University_{uuid.uuid4().hex[:8]}"

# Add university
response = requests.post(f"{BASE_URL}/api/admin/universities?name={unique_name}")
assert response.status_code == 200
```

Test fixtures for admin settings:
```python
# Predefined test data
course_data = {
    "playlistUrl": "https://www.youtube.com/playlist?list=PLUl4u3cNGP63WbdFxL8giv4yhgdMGaZNA",
    "university": "mit",
    "universityName": "MIT OpenCourseWare",
    "category": "Computer Science",
    "featured": True
}
```

**Location:**
- Test data hardcoded in test functions
- No separate fixtures file or factory pattern

## Test Coverage

**Requirements:**
- Not enforced: No coverage configuration found (no `pytest.ini`, no `.coveragerc`)
- No coverage reporting configured

**View Coverage:**
- Run backend tests with: `pytest --cov=backend --cov-report=html`
- Coverage tool: pytest-cov (not in requirements.txt but could be added)

## Common Patterns

**Async Testing:**
Not used in tests (tests are synchronous using requests library for HTTP)

**Error Testing:**

Backend tests verify error conditions:
```python
def test_admin_login_invalid_credentials(self):
    """Test admin login with invalid credentials"""
    response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
        "username": "admin",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
```

**Status Code Testing:**

HTTP response validation:
```python
# Success cases
assert response.status_code == 200

# Error cases
assert response.status_code == 400  # Bad request
assert response.status_code == 401  # Unauthorized
assert response.status_code == 404  # Not found
```

**Response Structure Validation:**

```python
# Verify required fields exist
expected_fields = ['totalCourses', 'featuredCourses', 'totalVideos', 'totalCategories']
assert all(field in data for field in expected_fields)

# Verify field types
assert isinstance(data["default"], list)
assert isinstance(data["custom"], list)
```

## Test Organization by Feature

**Admin Authentication (TestAdminLogin):**
- Success case: valid credentials
- Invalid credentials: wrong password
- Invalid username: non-existent user

**Universities API (TestUniversitiesAPI):**
- Get all universities (default + custom)
- Add university and verify persistence
- Add duplicate fails
- Delete university
- Delete non-existent university returns 404

**Categories API (TestCategoriesAPI):**
- Get categories (default + custom)
- Add category without keywords
- Add category with keywords
- Duplicate add fails
- Add default category fails
- Delete category
- Delete non-existent category returns 404

**Health and Stats (TestHealthAndStats):**
- Health endpoint returns status=healthy
- Stats endpoint has all required fields

## Test Data Management

**Isolation:**
```python
# Each test creates unique data
unique_name = f"TEST_University_{uuid.uuid4().hex[:8]}"
```

**Cleanup:**
```python
# Cleanup in same test (not in teardown hook)
delete_response = requests.delete(f"{BASE_URL}/api/admin/universities/{uni_id}")
assert delete_response.status_code == 200
```

## Known Testing Gaps

**Frontend:**
- No tests found for React components
- No test utilities setup
- No test helpers or test library usage

**Backend:**
- No unit tests for utility functions (e.g., `auto_categorize`, `extract_playlist_id`)
- No tests for data validation (Pydantic models)
- No tests for authentication edge cases
- No tests for MongoDB operations in isolation

---

*Testing analysis: 2026-03-30*
