# API Reference for Frontend Development

## Overview

This document provides a comprehensive API reference for building a frontend application to manage teams, students, and lesson progress.

**Base URL**: `http://localhost:3000`

**API Architecture**: RESTful API following DDD (Domain-Driven Design) with CQRS pattern

**ID Format**: All IDs use ULID format (e.g., `01KG2E6463X0BCGY6GGG0DRRZ2`)

---

## Common Patterns

### Error Response Format
All endpoints return consistent error responses:

```typescript
{
  "error": "Error Type",      // "Not Found", "Conflict", "Bad Request", etc.
  "message": "Detailed error message"
}
```

### HTTP Status Codes
- `200 OK` - Success (GET, PUT, DELETE operations)
- `201 Created` - Resource created (POST operations)
- `400 Bad Request` - Validation errors or business rule violations
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Uniqueness violations (e.g., duplicate email/name)
- `500 Internal Server Error` - Unexpected server error

---

## TypeScript Type Definitions

```typescript
// Common Types
type EnrollmentStatus = "ENROLLED" | "ON_LEAVE" | "WITHDRAWN";
type LessonProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";
type RecommendAction = "SPLIT" | "DISBAND" | "NONE";

// Student Types
interface Student {
  id: string;
  name: string;
  mailAddress: string;
  enrollmentStatus: EnrollmentStatus;
}

// Team Types
interface Team {
  id: string;
  name: string;
  memberIds: string[];
  recommendAction: RecommendAction;
  canSplit: boolean;
  canDisband: boolean;
}

// Lesson Progress Types
interface LessonProgress {
  id: string;
  studentId: string;
  lessonId: string;
  status: LessonProgressStatus;
}

// Lesson Types
interface Lesson {
  id: string;
  name: string;
  description: string;
  categoryId: string;
}

interface LessonCategory {
  id: string;
  name: string;
}

// Combined View Types (for frontend state management)
interface StudentWithTeamAndProgress {
  student: Student;
  team: Team | null;
  lessonProgress: LessonProgress[];
  lessons: Lesson[];
}
```

---

## Screen 1: Team List (チーム一覧)

### GET /teams

Retrieve all teams with member information and recommendation actions.

**Request:**
```bash
curl http://localhost:3000/teams
```

**TypeScript Example:**
```typescript
const fetchTeams = async (): Promise<Team[]> => {
  const response = await fetch('http://localhost:3000/teams');
  if (!response.ok) {
    throw new Error('Failed to fetch teams');
  }
  return response.json();
};
```

**Response (200 OK):**
```json
[
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRZ2",
    "name": "TeamAlpha",
    "memberIds": [
      "01KG2E6463X0BCGY6GGG0DRRA1",
      "01KG2E6463X0BCGY6GGG0DRRA2",
      "01KG2E6463X0BCGY6GGG0DRRA3",
      "01KG2E6463X0BCGY6GGG0DRRA4",
      "01KG2E6463X0BCGY6GGG0DRRA5"
    ],
    "recommendAction": "SPLIT",
    "canSplit": true,
    "canDisband": false
  },
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRZ3",
    "name": "TeamBeta",
    "memberIds": [
      "01KG2E6463X0BCGY6GGG0DRRA6"
    ],
    "recommendAction": "DISBAND",
    "canSplit": false,
    "canDisband": true
  },
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRZ4",
    "name": "TeamGamma",
    "memberIds": [
      "01KG2E6463X0BCGY6GGG0DRRA7",
      "01KG2E6463X0BCGY6GGG0DRRA8",
      "01KG2E6463X0BCGY6GGG0DRRA9"
    ],
    "recommendAction": "NONE",
    "canSplit": false,
    "canDisband": false
  }
]
```

**Recommendation Logic:**
- `SPLIT`: Team has 5 or more members → Split operation is recommended
- `DISBAND`: Team has exactly 1 member → Disband operation is recommended
- `NONE`: Team has 2-4 members → No action needed

---

### GET /teams/:id

Retrieve a specific team by ID.

**Request:**
```bash
curl http://localhost:3000/teams/01KG2E6463X0BCGY6GGG0DRRZ2
```

**Response (200 OK):**
Same structure as individual team object above.

**Response (404 Not Found):**
```json
{
  "error": "Not Found"
}
```

---

## Screen 2: All Team Members' Lesson Progress (全チームメンバーの課題進捗一覧)

### Data Fetching Strategy (Flat View)

To display all students with their team affiliation and lesson progress in a flat list, you need to combine data from multiple endpoints:

**Step 1: Fetch all students**
```typescript
const fetchAllStudents = async (): Promise<Student[]> => {
  const response = await fetch('http://localhost:3000/students');
  return response.json();
};
```

**Step 2: Fetch all teams (to map student → team)**
```typescript
const fetchAllTeams = async (): Promise<Team[]> => {
  const response = await fetch('http://localhost:3000/teams');
  return response.json();
};
```

**Step 3: Fetch lesson progress for each student**
```typescript
const fetchStudentProgress = async (studentId: string): Promise<LessonProgress[]> => {
  const response = await fetch(
    `http://localhost:3000/students/${studentId}/lesson-progress`
  );
  return response.json();
};
```

**Step 4: Fetch all lessons (for lesson metadata)**
```typescript
const fetchAllLessons = async (): Promise<Lesson[]> => {
  const response = await fetch('http://localhost:3000/lessons');
  return response.json();
};
```

**Complete Data Fetching Pattern:**
```typescript
const fetchAllStudentProgressWithTeams = async (): Promise<StudentWithTeamAndProgress[]> => {
  // Fetch all base data
  const [students, teams, lessons] = await Promise.all([
    fetchAllStudents(),
    fetchAllTeams(),
    fetchAllLessons()
  ]);

  // Create student ID → team mapping
  const studentIdToTeamMap = new Map<string, Team>();
  teams.forEach(team => {
    team.memberIds.forEach(memberId => {
      studentIdToTeamMap.set(memberId, team);
    });
  });

  // Fetch progress for all students in parallel
  const progressData = await Promise.all(
    students.map(async (student) => {
      const lessonProgress = await fetchStudentProgress(student.id);
      return {
        student,
        team: studentIdToTeamMap.get(student.id) || null,
        lessonProgress,
        lessons
      };
    })
  );

  return progressData;
};
```

---

### GET /students

Retrieve all students.

**Request:**
```bash
curl http://localhost:3000/students
```

**Response (200 OK):**
```json
[
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRA1",
    "name": "山田太郎",
    "mailAddress": "yamada@example.com",
    "enrollmentStatus": "ENROLLED"
  },
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRA2",
    "name": "佐藤花子",
    "mailAddress": "sato@example.com",
    "enrollmentStatus": "ON_LEAVE"
  }
]
```

---

### GET /students/:id

Retrieve a specific student by ID.

**Request:**
```bash
curl http://localhost:3000/students/01KG2E6463X0BCGY6GGG0DRRA1
```

**Response (200 OK):**
Same structure as individual student object above.

**Response (404 Not Found):**
```json
{
  "error": "Not Found"
}
```

---

### GET /students/:studentId/lesson-progress

Retrieve all lesson progress records for a specific student.

**Request:**
```bash
curl http://localhost:3000/students/01KG2E6463X0BCGY6GGG0DRRA1/lesson-progress
```

**Response (200 OK):**
```json
[
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRP1",
    "studentId": "01KG2E6463X0BCGY6GGG0DRRA1",
    "lessonId": "01KG2E6463X0BCGY6GGG0DRRL1",
    "status": "COMPLETED"
  },
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRP2",
    "studentId": "01KG2E6463X0BCGY6GGG0DRRA1",
    "lessonId": "01KG2E6463X0BCGY6GGG0DRRL2",
    "status": "IN_PROGRESS"
  },
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRP3",
    "studentId": "01KG2E6463X0BCGY6GGG0DRRA1",
    "lessonId": "01KG2E6463X0BCGY6GGG0DRRL3",
    "status": "NOT_STARTED"
  }
]
```

---

### GET /lessons

Retrieve all lessons (for displaying lesson names and metadata).

**Request:**
```bash
curl http://localhost:3000/lessons
```

**Response (200 OK):**
```json
[
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRL1",
    "name": "TypeScript基礎",
    "description": "TypeScriptの基本文法を学ぶ",
    "categoryId": "01KG2E6463X0BCGY6GGG0DRRC1"
  },
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRL2",
    "name": "DDD入門",
    "description": "ドメイン駆動設計の基礎",
    "categoryId": "01KG2E6463X0BCGY6GGG0DRRC2"
  }
]
```

---

### GET /lesson-categories

Retrieve all lesson categories (optional, for grouping lessons).

**Request:**
```bash
curl http://localhost:3000/lesson-categories
```

**Response (200 OK):**
```json
[
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRC1",
    "name": "プログラミング基礎"
  },
  {
    "id": "01KG2E6463X0BCGY6GGG0DRRC2",
    "name": "設計パターン"
  }
]
```

---

## Screen 3: Team Member Management (チームメンバーの編集)

### POST /teams/:teamId/members/add

Add a student to a team.

**Request:**
```bash
curl -X POST http://localhost:3000/teams/01KG2E6463X0BCGY6GGG0DRRZ2/members/add \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "01KG2E6463X0BCGY6GGG0DRRA7"
  }'
```

**TypeScript Example:**
```typescript
const addTeamMember = async (teamId: string, studentId: string) => {
  const response = await fetch(
    `http://localhost:3000/teams/${teamId}/members/add`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

**Request Body:**
```typescript
{
  studentId: string;  // ULID of the student to add
}
```

**Response (200 OK):**
```json
{
  "teamId": "01KG2E6463X0BCGY6GGG0DRRZ2",
  "studentId": "01KG2E6463X0BCGY6GGG0DRRA7"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "student not found"
}
```
or
```json
{
  "error": "Not Found",
  "message": "team not found"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "student is already in a team"
}
```

---

### DELETE /teams/members/:studentId

Remove a student from their team.

**Request:**
```bash
curl -X DELETE http://localhost:3000/teams/members/01KG2E6463X0BCGY6GGG0DRRA7
```

**TypeScript Example:**
```typescript
const removeTeamMember = async (studentId: string) => {
  const response = await fetch(
    `http://localhost:3000/teams/members/${studentId}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

**Response (200 OK):**
```json
{
  "teamId": "01KG2E6463X0BCGY6GGG0DRRZ2",
  "studentId": "01KG2E6463X0BCGY6GGG0DRRA7"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "team not found for the student"
}
```

---

### POST /teams/:teamId/split

Split a team into two teams. Only available when team has 5 or more members.

**Business Rules:**
- Team must have at least 5 members (`canSplit: true`)
- Original team retains 3 members
- New team gets 2 members
- New team name must be unique and alphanumeric

**Request:**
```bash
curl -X POST http://localhost:3000/teams/01KG2E6463X0BCGY6GGG0DRRZ2/split \
  -H "Content-Type: application/json" \
  -d '{
    "memberIds": [
      "01KG2E6463X0BCGY6GGG0DRRA4",
      "01KG2E6463X0BCGY6GGG0DRRA5"
    ],
    "newTeamName": "TeamDelta"
  }'
```

**TypeScript Example:**
```typescript
interface SplitTeamRequest {
  memberIds: string[];  // Exactly 2 members to move to new team
  newTeamName: string;  // Alphanumeric only
}

const splitTeam = async (teamId: string, request: SplitTeamRequest) => {
  const response = await fetch(
    `http://localhost:3000/teams/${teamId}/split`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

**Request Body:**
```typescript
{
  memberIds: string[];   // Array of 2 student IDs to move to new team
  newTeamName: string;   // Name for the new team (alphanumeric only)
}
```

**Response (201 Created):**
```json
{
  "teamIds": [
    "01KG2E6463X0BCGY6GGG0DRRZ2",  // Original team ID
    "01KG2E6463X0BCGY6GGG0DRRZ5"   // New team ID
  ],
  "memberIds": [
    "01KG2E6463X0BCGY6GGG0DRRA4",  // Members moved to new team
    "01KG2E6463X0BCGY6GGG0DRRA5"
  ]
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "team is not eligible for split (requires 5+ members)"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "team not found"
}
```

**Response (409 Conflict):**
```json
{
  "error": "Conflict",
  "message": "team name already exists"
}
```

---

### DELETE /teams/:teamId/disband

Disband a team and merge its members into another team. Only available when team has exactly 1 member.

**Business Rules:**
- Team must have exactly 1 member (`canDisband: true`)
- System automatically selects the smallest available team as destination
- At least one other team must exist
- Original team is deleted

**Request:**
```bash
curl -X DELETE http://localhost:3000/teams/01KG2E6463X0BCGY6GGG0DRRZ3/disband
```

**TypeScript Example:**
```typescript
const disbandTeam = async (teamId: string) => {
  const response = await fetch(
    `http://localhost:3000/teams/${teamId}/disband`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

**Response (200 OK):**
```json
{
  "teamId": "01KG2E6463X0BCGY6GGG0DRRZ4",  // Destination team ID
  "memberIds": [
    "01KG2E6463X0BCGY6GGG0DRRA6"  // Member(s) moved from disbanded team
  ]
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "team is not eligible for disband (requires exactly 1 member)"
}
```
or
```json
{
  "error": "Bad Request",
  "message": "no destination team available"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "team not found"
}
```

---

## Additional Endpoints

### Create Team

**POST /teams/new**

Create a new team.

**Request:**
```bash
curl -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TeamEpsilon",
    "memberIds": []
  }'
```

**Request Body:**
```typescript
{
  name: string;         // Required, alphanumeric only
  memberIds?: string[]; // Optional, defaults to []
}
```

**Response (201 Created):**
```json
{
  "id": "01KG2E6463X0BCGY6GGG0DRRZ6",
  "name": "TeamEpsilon",
  "memberIds": []
}
```

**Response (409 Conflict):**
```json
{
  "error": "Conflict",
  "message": "team name already exists"
}
```

---

### Create Student

**POST /students/new**

Create a new student.

**Request:**
```bash
curl -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{
    "name": "田中一郎",
    "mailAddress": "tanaka@example.com"
  }'
```

**Request Body:**
```typescript
{
  name: string;        // Required, minimum 1 character
  mailAddress: string; // Required, must be valid email format
}
```

**Response (201 Created):**
```json
{
  "id": "01KG2E6463X0BCGY6GGG0DRRA8",
  "name": "田中一郎",
  "mailAddress": "tanaka@example.com",
  "enrollmentStatus": "ENROLLED"
}
```

**Response (409 Conflict):**
```json
{
  "error": "Conflict",
  "message": "mail address already exists"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "Invalid email format"
}
```

---

## Lesson Progress Management

### Status Transition Rules

Lesson progress follows strict state transitions:

```
NOT_STARTED → IN_PROGRESS → IN_REVIEW ⇄ COMPLETED
                                ↑          |
                                └──────────┘
```

**Allowed Transitions:**
- `NOT_STARTED` → `IN_PROGRESS` (start working)
- `IN_PROGRESS` → `IN_REVIEW` (submit for review)
- `IN_REVIEW` → `IN_PROGRESS` (revisions needed)
- `IN_REVIEW` → `COMPLETED` (approved)
- `COMPLETED` → *immutable* (cannot change once completed)

---

### PUT /lesson-progress/:studentId/:lessonId/in-progress

Change lesson progress status to IN_PROGRESS.

**Request:**
```bash
curl -X PUT http://localhost:3000/lesson-progress/01KG2E6463X0BCGY6GGG0DRRA1/01KG2E6463X0BCGY6GGG0DRRL1/in-progress
```

**Response (200 OK):**
```json
{
  "id": "01KG2E6463X0BCGY6GGG0DRRP1",
  "studentId": "01KG2E6463X0BCGY6GGG0DRRA1",
  "lessonId": "01KG2E6463X0BCGY6GGG0DRRL1",
  "status": "IN_PROGRESS"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "Cannot change status to IN_PROGRESS from COMPLETED"
}
```

---

### PUT /lesson-progress/:studentId/:lessonId/in-review

Change lesson progress status to IN_REVIEW.

**Request:**
```bash
curl -X PUT http://localhost:3000/lesson-progress/01KG2E6463X0BCGY6GGG0DRRA1/01KG2E6463X0BCGY6GGG0DRRL1/in-review
```

**Response (200 OK):**
```json
{
  "id": "01KG2E6463X0BCGY6GGG0DRRP1",
  "studentId": "01KG2E6463X0BCGY6GGG0DRRA1",
  "lessonId": "01KG2E6463X0BCGY6GGG0DRRL1",
  "status": "IN_REVIEW"
}
```

---

### PUT /lesson-progress/:studentId/:lessonId/completed

Change lesson progress status to COMPLETED.

**Request:**
```bash
curl -X PUT http://localhost:3000/lesson-progress/01KG2E6463X0BCGY6GGG0DRRA1/01KG2E6463X0BCGY6GGG0DRRL1/completed
```

**Response (200 OK):**
```json
{
  "id": "01KG2E6463X0BCGY6GGG0DRRP1",
  "studentId": "01KG2E6463X0BCGY6GGG0DRRA1",
  "lessonId": "01KG2E6463X0BCGY6GGG0DRRL1",
  "status": "COMPLETED"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "Cannot change status to COMPLETED from IN_PROGRESS"
}
```

---

### POST /lesson-progress/new

Create a new lesson progress record (status: NOT_STARTED).

**Request:**
```bash
curl -X POST http://localhost:3000/lesson-progress/new \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "01KG2E6463X0BCGY6GGG0DRRA1",
    "lessonId": "01KG2E6463X0BCGY6GGG0DRRL1"
  }'
```

**Request Body:**
```typescript
{
  studentId: string;
  lessonId: string;
}
```

**Response (201 Created):**
```json
{
  "id": "01KG2E6463X0BCGY6GGG0DRRP1",
  "studentId": "01KG2E6463X0BCGY6GGG0DRRA1",
  "lessonId": "01KG2E6463X0BCGY6GGG0DRRL1",
  "status": "NOT_STARTED"
}
```

---

## Student Enrollment Status Management

### PUT /students/:studentId/enrollment-status/enrolled

Change student enrollment status to ENROLLED.

**Request:**
```bash
curl -X PUT http://localhost:3000/students/01KG2E6463X0BCGY6GGG0DRRA1/enrollment-status/enrolled
```

**Response (200 OK):**
```json
{
  "id": "01KG2E6463X0BCGY6GGG0DRRA1",
  "name": "山田太郎",
  "mailAddress": "yamada@example.com",
  "enrollmentStatus": "ENROLLED"
}
```

---

### PUT /students/:studentId/enrollment-status/on-leave

Change student enrollment status to ON_LEAVE.

**Request:**
```bash
curl -X PUT http://localhost:3000/students/01KG2E6463X0BCGY6GGG0DRRA1/enrollment-status/on-leave
```

**Response (200 OK):**
```json
{
  "id": "01KG2E6463X0BCGY6GGG0DRRA1",
  "name": "山田太郎",
  "mailAddress": "yamada@example.com",
  "enrollmentStatus": "ON_LEAVE"
}
```

---

### PUT /students/:studentId/enrollment-status/withdrawn

Change student enrollment status to WITHDRAWN.

**Request:**
```bash
curl -X PUT http://localhost:3000/students/01KG2E6463X0BCGY6GGG0DRRA1/enrollment-status/withdrawn
```

**Response (200 OK):**
```json
{
  "id": "01KG2E6463X0BCGY6GGG0DRRA1",
  "name": "山田太郎",
  "mailAddress": "yamada@example.com",
  "enrollmentStatus": "WITHDRAWN"
}
```

---

## Frontend Implementation Tips

### 1. State Management Strategy

```typescript
// Example using React hooks
const useStudentProgressData = () => {
  const [data, setData] = useState<StudentWithTeamAndProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAllStudentProgressWithTeams()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
```

### 2. Optimistic Updates

For better UX, implement optimistic updates for team member operations:

```typescript
const handleAddMember = async (teamId: string, studentId: string) => {
  // Optimistically update UI
  const optimisticUpdate = updateTeamMemberLocally(teamId, studentId);
  
  try {
    await addTeamMember(teamId, studentId);
    // Server confirmed - no action needed
  } catch (error) {
    // Revert optimistic update
    revertTeamMemberUpdate(optimisticUpdate);
    showErrorNotification(error.message);
  }
};
```

### 3. Conditional Action Buttons

Use the `canSplit` and `canDisband` flags to enable/disable action buttons:

```typescript
<Button 
  onClick={() => handleSplit(team.id)}
  disabled={!team.canSplit}
>
  Split Team
</Button>

<Button 
  onClick={() => handleDisband(team.id)}
  disabled={!team.canDisband}
>
  Disband Team
</Button>
```

### 4. Progress Status Visualization

```typescript
const getStatusColor = (status: LessonProgressStatus) => {
  switch (status) {
    case 'NOT_STARTED': return 'gray';
    case 'IN_PROGRESS': return 'blue';
    case 'IN_REVIEW': return 'yellow';
    case 'COMPLETED': return 'green';
  }
};

const getStatusIcon = (status: LessonProgressStatus) => {
  switch (status) {
    case 'NOT_STARTED': return '○';
    case 'IN_PROGRESS': return '▶';
    case 'IN_REVIEW': return '👁';
    case 'COMPLETED': return '✓';
  }
};
```

### 5. Error Handling Pattern

```typescript
const handleApiError = (error: any) => {
  if (error.message.includes('Conflict')) {
    showNotification('The requested name already exists', 'warning');
  } else if (error.message.includes('Not Found')) {
    showNotification('The requested resource was not found', 'error');
  } else if (error.message.includes('eligible')) {
    showNotification('This action is not available for this team', 'info');
  } else {
    showNotification('An unexpected error occurred', 'error');
  }
};
```

---

## Testing the API

### Start the Server

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm run db:migrate

# Start the development server
pnpm run dev
```

The API will be available at `http://localhost:3000`

### Sample Data Setup

If you need to set up initial test data, refer to the documentation in `docs/initial-data-setup.md`.

---

## Summary Table: Key Endpoints for 3 Screens

| Screen | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| **Team List** | `/teams` | GET | Fetch all teams with recommendations |
| **Team List** | `/teams/:id` | GET | Fetch specific team details |
| **Progress** | `/students` | GET | Fetch all students |
| **Progress** | `/teams` | GET | Map students to teams |
| **Progress** | `/students/:studentId/lesson-progress` | GET | Fetch student progress |
| **Progress** | `/lessons` | GET | Fetch lesson metadata |
| **Management** | `/teams/:teamId/members/add` | POST | Add member to team |
| **Management** | `/teams/members/:studentId` | DELETE | Remove member from team |
| **Management** | `/teams/:teamId/split` | POST | Split team (5+ members) |
| **Management** | `/teams/:teamId/disband` | DELETE | Disband team (1 member) |

---

**Document Version**: 1.0  
**Last Updated**: February 17, 2026  
**API Base URL**: http://localhost:3000
