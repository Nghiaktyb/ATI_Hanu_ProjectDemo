# Test Plan - HR Management Platform

## Overview

This test plan covers all functionality of the HR Management Platform including staff management, scheduling, payroll calculation, document management, AI-powered training, and authentication.

---

## Test Environment Setup

### Prerequisites

- Docker and Docker Compose installed
- All services running: `docker-compose up -d`
- Database initialized
- Default admin credentials: `admin@example.com` / `admin123`

### Test Data

- Default admin user
- Sample staff members (if seeded)
- Test documents for AI features

---

## 1. Authentication & Authorization Testing

### Test Case 1.1: User Login

**Objective**: Verify users can log in with valid credentials

**Steps**:

1. Navigate to http://localhost
2. Enter email: `admin@example.com`
3. Enter password: `admin123`
4. Click "Sign in"

**Expected Results**:

- Login successful
- Redirected to dashboard
- NavBar and Sidebar visible
- Token stored in localStorage

**Test Data**: Valid credentials

---

### Test Case 1.2: Invalid Login

**Objective**: Verify system rejects invalid credentials

**Steps**:

1. Navigate to http://localhost
2. Enter invalid email or password
3. Click "Sign in"

**Expected Results**:

- Error message displayed
- User remains on login page
- No token stored

**Test Data**:

- Invalid email: `wrong@example.com`
- Invalid password: `wrongpassword`

---

### Test Case 1.3: Sign Out

**Objective**: Verify users can sign out

**Steps**:

1. Log in successfully
2. Click "Sign Out" button in NavBar
3. Verify logout

**Expected Results**:

- Token cleared from localStorage
- Redirected to login page
- NavBar and Sidebar hidden

---

### Test Case 1.4: Auto Signout on Page Close

**Objective**: Verify automatic signout when page is closed

**Steps**:

1. Log in successfully
2. Close the browser tab/window
3. Reopen the application

**Expected Results**:

- Token cleared automatically
- User must log in again

---

### Test Case 1.5: Session Persistence

**Objective**: Verify session persists on page refresh (if implemented)

**Steps**:

1. Log in successfully
2. Refresh the page (F5)

**Expected Results**:

- User remains logged in
- Token persists in localStorage
- Dashboard loads correctly

---

## 2. Staff Management Testing

### Test Case 2.1: View Staff List

**Objective**: Verify staff list displays correctly

**Steps**:

1. Log in
2. Navigate to "Staff" from sidebar
3. View staff list

**Expected Results**:

- Staff list displays
- All staff information visible (name, email, department, location)
- Table format correct
- Search functionality works

---

### Test Case 2.2: Create New Staff

**Objective**: Verify new staff can be created

**Steps**:

1. Navigate to "Staff"
2. Click "Create staff" button
3. Fill in form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@example.com`
   - Department: `Kitchen`
   - Location: `Hanoi`
4. Click "Create"

**Expected Results**:

- Staff created successfully
- Success message displayed
- Redirected to staff list
- New staff appears in list

**Test Data**:

- Valid staff information
- Unique email address

---

### Test Case 2.3: Create Staff - Validation

**Objective**: Verify form validation works

**Steps**:

1. Navigate to "Staff" → "Create staff"
2. Leave required fields empty
3. Try to submit

**Expected Results**:

- Validation errors displayed
- Form does not submit
- Required fields highlighted

**Test Cases**:

- Empty first name
- Empty last name
- Empty email
- Invalid email format

---

### Test Case 2.4: Edit Staff

**Objective**: Verify staff information can be updated

**Steps**:

1. Navigate to "Staff"
2. Click "Edit" on a staff member
3. Modify information (e.g., change department)
4. Click "Save"

**Expected Results**:

- Staff information updated
- Changes reflected in staff list
- Success message displayed

---

### Test Case 2.5: Delete Staff

**Objective**: Verify staff can be deleted

**Steps**:

1. Navigate to "Staff"
2. Click "Delete" on a staff member
3. Confirm deletion

**Expected Results**:

- Confirmation dialog appears
- Staff deleted after confirmation
- Staff removed from list
- Success message displayed

---

### Test Case 2.6: Search Staff

**Objective**: Verify staff search functionality

**Steps**:

1. Navigate to "Staff"
2. Enter search term in search box
3. Verify results

**Expected Results**:

- Search filters staff list
- Results update in real-time
- Search works for name, email, department, location

**Test Data**:

- Search by first name
- Search by email
- Search by department
- Search by location

---

## 3. Scheduling & Shift Management Testing

### Test Case 3.1: View Shifts

**Objective**: Verify shifts list displays correctly

**Steps**:

1. Navigate to "Scheduling"
2. View shifts list

**Expected Results**:

- Shifts list displays
- All shift information visible
- Dates and times formatted correctly

---

### Test Case 3.2: Create Shift

**Objective**: Verify new shifts can be created

**Steps**:

1. Navigate to "Scheduling"
2. Click "Create Shift"
3. Fill in form:
   - Title: `Morning Shift`
   - Location: `Hanoi`
   - Start Time: `2025-01-15 08:00`
   - End Time: `2025-01-15 16:00`
4. Click "Create"

**Expected Results**:

- Shift created successfully
- Shift appears in list
- Success message displayed

**Test Data**:

- Valid shift information
- Future dates

---

### Test Case 3.3: Create Shift - Validation

**Objective**: Verify shift form validation

**Steps**:

1. Navigate to "Scheduling" → "Create Shift"
2. Leave required fields empty
3. Try to submit

**Expected Results**:

- Validation errors displayed
- Form does not submit

**Test Cases**:

- Empty title
- Empty start time
- Empty end time
- End time before start time

---

### Test Case 3.4: Assign Staff to Shift

**Objective**: Verify staff can be assigned to shifts

**Steps**:

1. Navigate to "Scheduling"
2. Select a shift
3. Click "Assign Staff"
4. Select staff member(s)
5. Confirm assignment

**Expected Results**:

- Staff assigned successfully
- Assignment reflected in shift details
- Staff appears in assigned list

---

### Test Case 3.5: View Shift Assignments

**Objective**: Verify shift assignments display correctly

**Steps**:

1. Navigate to "Scheduling"
2. View shift with assignments

**Expected Results**:

- Assigned staff listed
- Assignment details visible
- Multiple assignments supported

---

## 4. Timesheet Management Testing

### Test Case 4.1: Clock In

**Objective**: Verify staff can clock in

**Steps**:

1. Navigate to "Timesheets"
2. Fill in clock in form:
   - Staff: Select staff member
   - Date: `2025-01-15`
   - Time: `08:00`
3. Click "Clock In"

**Expected Results**:

- Clock in recorded
- Timesheet created
- Success message displayed
- Entry appears in timesheet list

**Test Data**:

- Valid staff member
- Current or past date
- Valid time

---

### Test Case 4.2: Clock Out

**Objective**: Verify staff can clock out

**Steps**:

1. Navigate to "Timesheets"
2. Find existing clock in entry
3. Fill in clock out form:
   - Staff: Same staff member
   - Date: Same date
   - Time: `17:00`
   - Break Minutes: `60`
4. Click "Clock Out"

**Expected Results**:

- Clock out recorded
- Timesheet updated
- Hours calculated correctly
- Break time deducted

**Test Data**:

- Existing clock in entry
- Clock out time after clock in
- Valid break minutes

---

### Test Case 4.3: View Timesheets

**Objective**: Verify timesheet list displays correctly

**Steps**:

1. Navigate to "Timesheets"
2. View timesheet list

**Expected Results**:

- All timesheets displayed
- Clock in/out times visible
- Hours calculated correctly
- Break time shown

---

### Test Case 4.4: Timesheet Validation

**Objective**: Verify timesheet validation

**Steps**:

1. Navigate to "Timesheets"
2. Try to clock out without clocking in
3. Try to clock in twice on same day

**Expected Results**:

- Validation errors displayed
- Invalid operations prevented

---

## 5. Payroll Calculation Testing

### Test Case 5.1: Calculate Payroll

**Objective**: Verify payroll calculation works correctly

**Steps**:

1. Navigate to "Payroll"
2. Click "Run Payroll"
3. Enter:
   - Period: `2025-01` (YYYY-MM)
   - Hourly Rate: `15.00`
4. Click "Calculate"

**Expected Results**:

- Payroll calculated successfully
- Pay items created for each staff member
- Calculations correct:
  - Total hours = (clock out - clock in - break time)
  - Gross pay = total hours × hourly rate
- Results displayed

**Test Data**:

- Period with existing timesheets
- Valid hourly rate
- Staff with clock in/out records

---

### Test Case 5.2: Payroll Calculation - Edge Cases

**Objective**: Verify payroll handles edge cases

**Test Cases**:

1. **No timesheets in period**

   - Expected: No pay items or message indicating no data

2. **Incomplete timesheets (only clock in)**

   - Expected: Handled gracefully or excluded

3. **Zero hourly rate**

   - Expected: Validation error

4. **Negative hourly rate**

   - Expected: Validation error

5. **Invalid period format**
   - Expected: Validation error (must be YYYY-MM)

---

### Test Case 5.3: View Pay Items

**Objective**: Verify pay items display correctly

**Steps**:

1. Navigate to "Payroll"
2. View pay items list

**Expected Results**:

- All pay items displayed
- Staff information visible
- Hours and pay amounts correct
- Period filter works

---

### Test Case 5.4: Export Payroll

**Objective**: Verify payroll can be exported (if implemented)

**Steps**:

1. Calculate payroll
2. Click "Export" button
3. Verify export

**Expected Results**:

- Export file generated
- File format correct (CSV/Excel)
- All data included

---

## 6. Training Management Testing

### Test Case 6.1: View Training Courses

**Objective**: Verify training courses list displays

**Steps**:

1. Navigate to "Training"
2. View courses list

**Expected Results**:

- Courses list displays
- Course details visible (title, category, duration, description)

---

### Test Case 6.2: Create Training Course

**Objective**: Verify new courses can be created

**Steps**:

1. Navigate to "Training"
2. Click "Create Course"
3. Fill in form:
   - Title: `Food Safety Training`
   - Category: `Safety`
   - Description: `Training on food safety protocols`
   - Duration: `120` (minutes)
4. Click "Create"

**Expected Results**:

- Course created successfully
- Course appears in list
- Success message displayed

**Test Data**:

- Valid course information
- Positive duration

---

### Test Case 6.3: Assign Course to Staff

**Objective**: Verify courses can be assigned to staff

**Steps**:

1. Navigate to "Training"
2. Click "Assign Course"
3. Select:
   - Course: Select a course
   - Staff: Select staff member
4. Click "Assign"

**Expected Results**:

- Assignment created
- Assignment appears in list
- Status shows as "Pending" or "In Progress"

---

### Test Case 6.4: Complete Training

**Objective**: Verify training completion works

**Steps**:

1. Navigate to "Training"
2. Find assigned training
3. Mark as complete

**Expected Results**:

- Status updated to "Completed"
- Completion date recorded
- Staff record updated

---

### Test Case 6.5: View Training Assignments

**Objective**: Verify training assignments display correctly

**Steps**:

1. Navigate to "Training"
2. View assignments tab

**Expected Results**:

- All assignments displayed
- Status visible (Pending/In Progress/Completed)
- Assignment dates shown

---

## 7. Document Management & AI Testing

### Test Case 7.1: Upload Document

**Objective**: Verify documents can be uploaded

**Steps**:

1. Navigate to "Docs & AI"
2. Click "Upload files"
3. Select document (PDF, DOCX, TXT, MD, XLSX, CSV, PNG, JPG)
4. Upload

**Expected Results**:

- Document uploaded successfully
- File appears in indexed files list
- File size displayed
- Success message shown

**Test Data**:

- PDF document
- DOCX document
- TXT document
- Image file (PNG/JPG)

---

### Test Case 7.2: Upload Multiple Documents

**Objective**: Verify multiple documents can be uploaded

**Steps**:

1. Navigate to "Docs & AI"
2. Click "Upload files"
3. Select multiple files
4. Upload

**Expected Results**:

- All files uploaded
- All files appear in list
- Progress indicator (if implemented)

---

### Test Case 7.3: Upload - File Type Validation

**Objective**: Verify only allowed file types accepted

**Steps**:

1. Navigate to "Docs & AI"
2. Try to upload unsupported file type

**Expected Results**:

- Error message displayed
- File rejected
- Only allowed types accepted

**Test Data**:

- Unsupported file types
- Valid file types: PDF, DOCX, TXT, MD, XLSX, CSV, PNG, JPG

---

### Test Case 7.4: View Uploaded Documents

**Objective**: Verify document list displays correctly

**Steps**:

1. Navigate to "Docs & AI"
2. View indexed files list

**Expected Results**:

- All uploaded documents listed
- File names visible
- File sizes displayed
- Refresh button works

---

### Test Case 7.5: AI Question Answering

**Objective**: Verify AI can answer questions from documents

**Steps**:

1. Navigate to "Docs & AI"
2. Upload a document (e.g., policy document)
3. Enter question: `What is the overtime policy?`
4. Click "Ask"

**Expected Results**:

- Question processed
- Answer displayed
- Answer relevant to uploaded documents
- Citations shown (if available)
- Loading state during processing

**Test Data**:

- Policy documents
- Training materials
- HR guidelines

---

### Test Case 7.6: AI - No Documents

**Objective**: Verify AI handles case with no documents

**Steps**:

1. Navigate to "Docs & AI"
2. Ensure no documents uploaded
3. Ask a question
4. Click "Ask"

**Expected Results**:

- Appropriate message displayed
- Error or warning about no documents
- System handles gracefully

---

### Test Case 7.7: AI - Multiple Documents

**Objective**: Verify AI searches across multiple documents

**Steps**:

1. Upload multiple documents
2. Ask question that may be in any document
3. Verify answer

**Expected Results**:

- AI searches all documents
- Answer includes relevant information
- Citations from multiple documents (if applicable)

---

### Test Case 7.8: AI - OCR Functionality

**Objective**: Verify OCR works for image files

**Steps**:

1. Upload an image file (PNG/JPG) with text
2. Verify text extraction
3. Ask question about image content

**Expected Results**:

- Text extracted from image
- Image content searchable
- Questions about image content answered

**Test Data**:

- Image with text
- Scanned document image

---

## 8. UI/UX Testing

### Test Case 8.1: Responsive Design

**Objective**: Verify application works on different screen sizes

**Steps**:

1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)

**Expected Results**:

- Layout adapts correctly
- Sidebar works on mobile (hamburger menu)
- All features accessible
- No horizontal scrolling

---

### Test Case 8.2: Dark Mode Toggle

**Objective**: Verify dark mode works correctly

**Steps**:

1. Click theme toggle button
2. Verify theme changes
3. Refresh page
4. Verify theme persists

**Expected Results**:

- Theme toggles between light/dark
- All components styled correctly
- Theme preference saved
- Persists on refresh

---

### Test Case 8.3: Sidebar Navigation

**Objective**: Verify sidebar navigation works

**Steps**:

1. Click menu button
2. Verify sidebar toggles
3. Click navigation items
4. Verify navigation works

**Expected Results**:

- Sidebar opens/closes
- Navigation items work
- Active route highlighted (if implemented)
- Sidebar closes on mobile after navigation

---

### Test Case 8.4: Loading States

**Objective**: Verify loading indicators display

**Steps**:

1. Perform actions that take time (API calls)
2. Verify loading states

**Expected Results**:

- Loading indicators shown
- Buttons disabled during loading
- User feedback provided

---

### Test Case 8.5: Error Messages

**Objective**: Verify error messages display correctly

**Steps**:

1. Trigger errors (invalid input, API failures)
2. Verify error messages

**Expected Results**:

- Error messages clear and helpful
- Errors displayed in appropriate locations
- Errors styled correctly (red/error styling)

---

## 9. Integration Testing

### Test Case 9.1: End-to-End Workflow - New Staff Onboarding

**Objective**: Test complete workflow for new staff

**Steps**:

1. Create new staff member
2. Create shift
3. Assign staff to shift
4. Staff clocks in
5. Staff clocks out
6. Calculate payroll for period
7. Assign training course
8. Complete training

**Expected Results**:

- All steps complete successfully
- Data flows correctly between modules
- No errors in workflow

---

### Test Case 9.2: End-to-End Workflow - Document Training

**Objective**: Test AI-powered training workflow

**Steps**:

1. Upload training documents
2. Staff asks questions about documents
3. AI provides answers
4. Staff completes training

**Expected Results**:

- Documents indexed correctly
- AI answers questions accurately
- Training workflow complete

---

## 10. Error Handling & Edge Cases

### Test Case 10.1: Network Errors

**Objective**: Verify application handles network errors

**Steps**:

1. Disconnect network
2. Perform actions (create, update, delete)
3. Reconnect network

**Expected Results**:

- Error messages displayed
- Application doesn't crash
- Retry functionality (if implemented)

---

### Test Case 10.2: Invalid API Responses

**Objective**: Verify application handles invalid API responses

**Steps**:

1. Mock invalid API responses
2. Verify error handling

**Expected Results**:

- Errors handled gracefully
- User-friendly error messages
- Application remains stable

---

### Test Case 10.3: Large File Uploads

**Objective**: Verify large files handled correctly

**Steps**:

1. Upload large file (>10MB)
2. Verify upload

**Expected Results**:

- File uploads successfully (or appropriate limit)
- Progress indicator (if implemented)
- No timeout errors

---

### Test Case 10.4: Concurrent Operations

**Objective**: Verify concurrent operations work

**Steps**:

1. Open multiple tabs
2. Perform operations in different tabs
3. Verify data consistency

**Expected Results**:

- No data conflicts
- Updates reflected correctly
- No race conditions

---

## 11. Performance Testing

### Test Case 11.1: Page Load Time

**Objective**: Verify pages load quickly

**Steps**:

1. Measure page load times
2. Verify performance

**Expected Results**:

- Pages load in < 3 seconds
- No long delays
- Smooth transitions

---

### Test Case 11.2: Large Data Sets

**Objective**: Verify application handles large data

**Steps**:

1. Create 100+ staff members
2. Create 100+ shifts
3. Verify performance

**Expected Results**:

- Lists load efficiently
- Pagination works (if implemented)
- Search remains fast

---

## 12. Security Testing

### Test Case 12.1: Authentication Required

**Objective**: Verify protected routes require authentication

**Steps**:

1. Log out
2. Try to access protected routes directly
3. Verify redirect to login

**Expected Results**:

- Protected routes inaccessible
- Redirect to login page
- No data exposed

---

### Test Case 12.2: Token Validation

**Objective**: Verify invalid tokens rejected

**Steps**:

1. Manually set invalid token in localStorage
2. Try to access application
3. Verify behavior

**Expected Results**:

- Invalid token rejected
- User redirected to login
- Error handled gracefully

---

### Test Case 12.3: XSS Protection

**Objective**: Verify XSS attacks prevented

**Steps**:

1. Enter script tags in input fields
2. Verify sanitization

**Expected Results**:

- Scripts not executed
- Input sanitized
- No XSS vulnerabilities

---

## Test Execution Checklist

### Pre-Testing

- [ ] All services running (docker-compose up -d)
- [ ] Database initialized
- [ ] Test data prepared
- [ ] Browser console open for errors

### Core Functionality

- [ ] Authentication (Login/Logout)
- [ ] Staff Management (CRUD)
- [ ] Scheduling (Create/Assign)
- [ ] Timesheets (Clock In/Out)
- [ ] Payroll Calculation
- [ ] Training Management
- [ ] Document Upload
- [ ] AI Question Answering

### UI/UX

- [ ] Responsive design
- [ ] Dark mode
- [ ] Navigation
- [ ] Loading states
- [ ] Error messages

### Integration

- [ ] End-to-end workflows
- [ ] Data flow between modules

### Edge Cases

- [ ] Error handling
- [ ] Validation
- [ ] Large data sets

---

## Test Results Template

```
Test Case ID: [ID]
Test Case Name: [Name]
Status: [PASS/FAIL/SKIP]
Date: [Date]
Tester: [Name]
Notes: [Any observations or issues]
Screenshots: [If applicable]
```

---

## Known Issues & Bugs

Document any issues found during testing:

1. **Issue**: [Description]
   - **Severity**: [Critical/High/Medium/Low]
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]

---

## Test Completion Criteria

All tests should pass with:

- No critical bugs
- All core functionality working
- UI/UX acceptable
- Performance acceptable
- Security measures in place

---

## Notes

- Run tests in order for best results
- Document any deviations from expected behavior
- Test on multiple browsers (Chrome, Firefox, Edge)
- Test with different user roles (if implemented)
- Verify data persistence after operations
