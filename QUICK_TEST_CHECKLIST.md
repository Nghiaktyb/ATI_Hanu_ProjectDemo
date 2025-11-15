# Quick Test Checklist

A condensed checklist for quick testing of all major features.

## Pre-Test Setup

- [ ] Start services: `docker-compose up -d`
- [ ] Verify all containers running: `docker-compose ps`
- [ ] Open browser: http://localhost
- [ ] Open browser console (F12) to check for errors

---

## Authentication

- [ ] Login with `admin@example.com` / `admin123`
- [ ] Try invalid login (should show error)
- [ ] Click Sign Out button
- [ ] Close tab and reopen (should be logged out)

---

## Staff Management

- [ ] View staff list
- [ ] Create new staff (fill all fields)
- [ ] Try creating staff with empty required fields (should show validation)
- [ ] Edit existing staff
- [ ] Delete staff (confirm deletion)
- [ ] Search staff by name/email

---

## Scheduling

- [ ] View shifts list
- [ ] Create new shift (title, location, start/end time)
- [ ] Try creating shift with invalid times (end before start)
- [ ] Assign staff to shift
- [ ] View shift with assignments

---

## Timesheets

- [ ] Clock in (select staff, date, time)
- [ ] Clock out (same staff, date, later time, break minutes)
- [ ] View timesheet list
- [ ] Verify hours calculated correctly

---

## Payroll

- [ ] Run payroll calculation (select period, hourly rate)
- [ ] Verify pay items created
- [ ] Check calculations (hours × rate)
- [ ] View pay items list
- [ ] Try invalid period format (should show error)
- [ ] Try negative hourly rate (should show error)

---

## Training

- [ ] View training courses
- [ ] Create new course (title, category, description, duration)
- [ ] Assign course to staff
- [ ] View training assignments
- [ ] Mark training as complete

---

## Document & AI

- [ ] Upload document (PDF/DOCX/TXT)
- [ ] Upload multiple documents
- [ ] Try uploading invalid file type (should reject)
- [ ] View uploaded documents list
- [ ] Ask AI question about uploaded documents
- [ ] Verify answer and citations
- [ ] Upload image file (PNG/JPG) and test OCR
- [ ] Ask question with no documents (should handle gracefully)

---

## UI/UX

- [ ] Toggle dark/light mode (should persist)
- [ ] Click menu button (sidebar should toggle)
- [ ] Navigate using sidebar items
- [ ] Test on mobile/tablet (responsive design)
- [ ] Check loading states (during API calls)
- [ ] Verify error messages display correctly

---

## Integration

- [ ] Complete workflow: Create staff → Assign shift → Clock in/out → Calculate payroll
- [ ] Complete workflow: Upload documents → Ask questions → Complete training

---

## Error Handling

- [ ] Disconnect network and try actions (should show errors)
- [ ] Enter invalid data in forms (should validate)
- [ ] Try to access without login (should redirect)

---

## Quick Verification

- [ ] No console errors
- [ ] All buttons work
- [ ] All forms submit correctly
- [ ] Data persists after operations
- [ ] Navigation works smoothly
- [ ] Theme toggle works
- [ ] Responsive on mobile

---

## Critical Paths to Test

### Path 1: Staff Lifecycle

1. Create staff
2. Assign to shift
3. Clock in/out
4. Calculate payroll
5. Assign training
6. Complete training

### Path 2: Document Training

1. Upload training documents
2. Staff asks questions
3. AI provides answers
4. Training completed

### Path 3: Management Workflow

1. Create shifts
2. Assign staff
3. View timesheets
4. Calculate payroll
5. Review training progress

---

## Common Issues to Watch For

- [ ] API errors in console
- [ ] Forms not submitting
- [ ] Data not saving
- [ ] Navigation not working
- [ ] Icons not displaying
- [ ] Dark mode not working
- [ ] Sidebar not toggling
- [ ] Calculations incorrect
- [ ] File uploads failing
- [ ] AI not responding

---

## Test Completion

- [ ] All critical paths tested
- [ ] No blocking issues found
- [ ] All major features working
- [ ] UI/UX acceptable
- [ ] Ready for use

---

**Time to Complete**: ~30-45 minutes for full test
**Priority**: Test critical paths first, then expand to full test
