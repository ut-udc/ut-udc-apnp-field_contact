# SupContact - Architecture Documentation

## Overview

SupContact is an Angular-based Progressive Web Application (PWA) designed for probation/parole supervision management. It enables supervision officers to track, document, and manage their interactions with offenders under their supervision using an offline-first architecture.

## System Architecture

### Technology Stack
- **Frontend:** Angular 20.0 with standalone components
- **UI Framework:** Angular Material Design
- **Database:** IndexedDB (via Dexie.js)
- **State Management:** RxJS Observables
- **Offline Support:** Service Worker + PWA capabilities
- **Build Tool:** Angular CLI with Vite

### Architectural Patterns
- **Component-Based Architecture:** Standalone Angular components
- **Service-Oriented Architecture:** Centralized business logic in services
- **Offline-First Design:** Local data persistence with sync capabilities
- **Reactive Programming:** Observable-based data flows

## Project Structure

```
src/app/
├── components/           # UI Components
│   ├── home/            # Dashboard
│   ├── contact-form/    # Contact creation/editing
│   ├── offender-detail/ # Offender profile view
│   ├── my-caseload/     # Assigned offenders list
│   └── [other-components]/
├── model/               # TypeScript interfaces
│   ├── Contact.ts       # Contact data structure
│   ├── Offender.ts      # Offender profile structure
│   ├── Agent.ts         # User/officer structure
│   └── [other-models]/
├── services/            # Business logic layer
│   ├── contact-data.ts  # Primary data service
│   ├── dao.ts          # Data access object
│   ├── navigation.ts   # Routing utilities
│   └── [other-services]/
└── css/                # Theme stylesheets
```

## Core Components

### 1. Home Component
**Purpose:** Application dashboard and entry point

**Responsibilities:**
- Display current agent information
- Show caseload overview
- Provide navigation to main features

**Key Dependencies:**
- `ContactData` service for agent data
- `MyCaseload` component for offender list
- `OtherOffendersList` component for additional offenders

**Data Flow:**
```
Home → ContactData.getAgentById() → IndexedDB → Agent Display
Home → MyCaseload → ContactData.getMyCaseload() → Offender List
```

### 2. ContactForm Component
**Purpose:** Multi-step form for creating and editing supervision contacts

**Responsibilities:**
- Capture contact details (date, time, participants, type, location)
- Handle form validation and submission
- Support both new contact creation and editing existing contacts
- Navigate to commentary form upon completion

**Key Dependencies:**
- `ContactData` service for CRUD operations
- `ActivatedRoute` for URL parameter extraction
- `Navigation` service for routing

**Data Flow:**
```
Route Params → ContactForm.ngOnInit() → ContactData.getCaseloadOffenderById()
ContactForm.onSubmit() → ContactData.addContact()/updateContact() → IndexedDB
ContactForm → Navigation → CommentaryForm
```

**Form Fields:**
- Contact ID (auto-generated)
- Contact Date/Time
- Primary/Secondary Interviewer
- Contact Type (dropdown)
- Location (dropdown)

### 3. OffenderDetail Component
**Purpose:** Display comprehensive offender profile and contact history

**Responsibilities:**
- Show offender personal information
- Display chronological contact history
- Provide quick access to create new contacts
- Navigate to individual contact details

**Key Dependencies:**
- `ContactData` service for offender and contact data
- `ContactListingCard` components for contact display
- `ActivatedRoute` for offender ID

**Data Flow:**
```
Route Params → OffenderDetail → ContactData.getCaseloadOffenderById()
OffenderDetail → ContactData.getAllContactsByOffenderNumberDesc()
ContactListingCard[] ← Contact History Display
```

### 4. MyCaseload Component
**Purpose:** Display and manage assigned offender caseload

**Responsibilities:**
- List all assigned offenders
- Show basic offender information
- Provide navigation to offender details
- Support filtering and search (future enhancement)

**Key Dependencies:**
- `ContactData` service for caseload data
- `OffenderCard` components for individual display

**Data Flow:**
```
MyCaseload → ContactData.getMyCaseload() → IndexedDB → Offender[]
OffenderCard[] ← Offender List Display
OffenderCard.click → Navigation → OffenderDetail
```

## Service Layer Architecture

### ContactData Service (Primary Data Service)
**Purpose:** Central data management and business logic

**Core Responsibilities:**
- IndexedDB operations via Dexie
- Data validation and transformation
- Offline data synchronization
- Business rule enforcement

**Database Schema:**
```typescript
contacts: {
  contactId: number,
  ofndrNum: number,
  agentId: string,
  contactDate: Date,
  contactType: string,
  location: string,
  commentary: string,
  formCompleted: boolean
}

agents: {
  agentId: string,
  firstName: string,
  lastName: string,
  fullName: string,
  email: string
}

myCaseload: {
  ofndrNum: number,
  firstName: string,
  lastName: string,
  lastSuccessfulContactDate: Date
}
```

**Key Methods:**
- `addContact(contact: Contact)` - Create new contact
- `updateContact(contact: Contact)` - Update existing contact
- `getContactById(id: number)` - Retrieve contact by ID
- `getMyCaseload()` - Get assigned offenders
- `getCaseloadOffenderById(id: number)` - Get specific offender

### Navigation Service
**Purpose:** Centralized routing and navigation logic

**Responsibilities:**
- Programmatic navigation between components
- Route parameter management
- Navigation history tracking

### Dao Service
**Purpose:** Data Access Object with static data initialization

**Responsibilities:**
- Provide initial seed data
- Define data structures
- Support offline initialization

## Data Flow Patterns

### 1. Contact Creation Flow
```
User Action: "Create Contact"
    ↓
Home → Navigation → /contact-form/:ofndrNum
    ↓
ContactForm.ngOnInit()
    ↓
ContactData.getCaseloadOffenderById(ofndrNum)
    ↓
IndexedDB Query → Offender Data
    ↓
Form Initialization with Offender Context
    ↓
User Fills Form → ContactForm.onSubmit()
    ↓
ContactData.addContact(contact)
    ↓
IndexedDB Insert → Contact Saved
    ↓
Navigation → /commentary-form/:ofndrNum/:contactId
```

### 2. Offender Detail View Flow
```
User Action: "View Offender"
    ↓
MyCaseload → OffenderCard.click → /offender-detail/:ofndrNum
    ↓
OffenderDetail.ngOnInit()
    ↓
Parallel Data Loading:
├── ContactData.getCaseloadOffenderById(ofndrNum)
└── ContactData.getAllContactsByOffenderNumberDesc(ofndrNum)
    ↓
IndexedDB Queries → Offender + Contact[]
    ↓
UI Rendering:
├── Offender Profile Display
└── ContactListingCard[] for each contact
```

### 3. Dashboard Loading Flow
```
Application Start → Home Component
    ↓
Home.ngOnInit()
    ↓
Parallel Service Calls:
├── ContactData.getAgentById(currentAgentId)
├── MyCaseload.loadMyCaseload()
└── OtherOffendersList.loadOtherOffenders()
    ↓
IndexedDB Queries → Agent + Offender Lists
    ↓
Observable Streams → UI Updates
    ↓
Dashboard Rendered with Live Data
```

## Component Interaction Patterns

### Parent-Child Communication
```typescript
// Parent passes data down
<app-offender-card [offender]="offenderData"></app-offender-card>

// Child emits events up
@Output() contactSelected = new EventEmitter<Contact>();
```

### Service-Based Communication
```typescript
// Components inject shared services
contactData: ContactData = inject(ContactData);

// Service methods return Observables
getMyCaseload(): Observable<Offender[]>
```

### Route-Based Communication
```typescript
// URL parameters pass data between routes
/contact-form/:ofndrNum/:contactId

// Components extract route parameters
this.route.snapshot.params['ofndrNum']
```

## State Management

### Local State (Component Level)
- Form data and validation states
- UI interaction states (loading, error)
- Component-specific temporary data

### Shared State (Service Level)
- User session data (`ContactData.applicationUserName`)
- Cached lookup data (agents, contact types, locations)
- Application configuration

### Persistent State (IndexedDB)
- Contact records
- Offender profiles
- Agent information
- Reference data (types, locations)

## Offline Architecture

### Data Persistence Strategy
- **Primary Storage:** IndexedDB via Dexie
- **Sync Strategy:** Offline-first with eventual consistency
- **Conflict Resolution:** Last-write-wins with timestamp comparison

### Service Worker Implementation
- **Caching Strategy:** Cache-first for static assets
- **API Caching:** Network-first with fallback to cache
- **Background Sync:** Queue operations for online sync

### Progressive Web App Features
- **Installable:** Web app manifest configuration
- **Offline Capable:** Full functionality without network
- **Responsive:** Mobile-first design approach

## Security Considerations

### Data Protection
- Local data encryption (future enhancement)
- Secure token storage
- Input validation and sanitization

### Access Control
- Role-based component access
- Route guards for protected areas
- Session management

## Performance Optimizations

### Angular Optimizations
- OnPush change detection strategy
- Lazy loading for large components
- Trackby functions for ngFor loops

### Database Optimizations
- Indexed queries for fast lookups
- Bulk operations for data loading
- Connection pooling and caching

### UI Optimizations
- Virtual scrolling for large lists
- Image lazy loading
- Component preloading

## Future Enhancements

### Planned Features
- Real-time sync with backend API
- Advanced search and filtering
- Reporting and analytics dashboard
- Multi-language support

### Technical Improvements
- End-to-end encryption
- Advanced caching strategies
- Performance monitoring
- Automated testing suite

## Development Guidelines

### Component Development
- Use standalone components
- Implement OnPush change detection
- Follow Angular style guide
- Write comprehensive unit tests

### Service Development
- Single responsibility principle
- Dependency injection patterns
- Error handling and logging
- Observable-based APIs

### Data Management
- Consistent data models
- Validation at service layer
- Transaction management
- Migration strategies