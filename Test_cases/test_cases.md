# Testing and QA Plan

This document outlines the test cases and QA procedures for validating the Library Management System in ServiceNow.

---

## Test Case 1: Student Submits Borrow Request Successfully
- **Objective**: Verify that a student can browse books and submit a borrow request, which then gets defaulted and auto-assigned correctly.
- **Pre-conditions**:
  - Student user `Test Student` exists with role `u_library_student`.
  - Book `Introduction to Algorithms` (ISBN: `9780262033848`) exists and is available (`u_available_copies = 5`).
- **Steps**:
  1. Impersonate `Test Student`.
  2. Navigate to **Library Management > Books** and select `Introduction to Algorithms`. Verify the student cannot edit any field.
  3. Navigate to **Library Management > Create Borrow Request**.
  4. Fill in: Book = `Introduction to Algorithms`. Observe that `Student` is auto-filled with current user and `Request Date` is current timestamp.
  5. Click **Submit**.
- **Expected Results**:
  - Request record is created successfully (e.g., `BRQ0000001`).
  - Status is `pending`.
  - Assignment Group is auto-set to `Librarians`.
  - Book availability is NOT yet reduced.

---

## Test Case 2: Librarian Approves Request
- **Objective**: Verify that a librarian can approve a pending borrow request, decreasing book copies and updating request status.
- **Pre-conditions**:
  - Request `BRQ0000001` exists in `pending` status.
  - Book `Introduction to Algorithms` has `u_available_copies = 5`.
- **Steps**:
  1. Impersonate a user with `u_library_librarian` role (e.g., `Test Librarian`).
  2. Open request `BRQ0000001`.
  3. Set status to `borrowed` (or approve the workflow via the Approvals related list).
  4. Click **Save** or **Update**.
- **Expected Results**:
  - Status transitions to `borrowed` (or `approved` and then `borrowed`).
  - `Approval Date` is set to the current date/time.
  - `Due Date` is automatically calculated as 14 days in the future (e.g., `Today + 14 days`).
  - `Available Copies` of `Introduction to Algorithms` is decremented from `5` to `4`.
  - Email notification `Approved: Borrow Request` is triggered.

---

## Test Case 3: Librarian Rejects Request
- **Objective**: Verify that a librarian can reject a pending borrow request, setting it to `rejected` status and preserving book copies.
- **Pre-conditions**:
  - Create a new request `BRQ0000002` for student `Test Student` in `pending` status.
  - Book `To Kill a Mockingbird` has `u_available_copies = 4`.
- **Steps**:
  1. Impersonate `Test Librarian`.
  2. Open request `BRQ0000002`.
  3. Enter comments in `Librarian Comments`: "This book is currently reserved for a reading group next week."
  4. Change status to `rejected`.
  5. Click **Update**.
- **Expected Results**:
  - Status transitions to `rejected`.
  - `Available Copies` of `To Kill a Mockingbird` remains `4`.
  - Email notification `Rejected: Borrow Request` is triggered containing the librarian comments.

---

## Test Case 4: Book Availability Updates and Status Lock
- **Objective**: Verify that when a book's last copy is borrowed, the book status transitions to `borrowed` and the book is no longer requestable.
- **Pre-conditions**:
  - Book `Encyclopædia Britannica` exists with `u_total_copies = 1` and `u_available_copies = 1`, status is `available`.
- **Steps**:
  1. Impersonate `Test Student`.
  2. Create a borrow request for `Encyclopædia Britannica` (Request `BRQ0000003`).
  3. Impersonate `Test Librarian` and approve request `BRQ0000003` (transition status to `borrowed`).
  4. Open the `Book` record for `Encyclopædia Britannica`.
- **Expected Results**:
  - Book `Available Copies` is `0`.
  - Book `Status` automatically changes to `borrowed`.
  - If `Test Student` tries to create another borrow request for `Encyclopædia Britannica`, the book will NOT appear in the Book reference field search (due to reference qualifier filter). If they manually try to submit it, the Business Rule aborts the transaction with an error message: "Sorry, this book is currently not available for borrowing."

---

## Test Case 5: Return Process Updates Records
- **Objective**: Verify that returning a book increments the available copies and resets the book status to `available`.
- **Pre-conditions**:
  - Request `BRQ0000003` for `Encyclopædia Britannica` is in status `borrowed`.
  - Book `Encyclopædia Britannica` has `u_available_copies = 0` and status = `borrowed`.
- **Steps**:
  1. Impersonate `Test Librarian`.
  2. Open request `BRQ0000003`.
  3. Change status to `returned`.
  4. Click **Update**.
- **Expected Results**:
  - Request status is updated to `returned`.
  - `Return Date` is populated with the current date/time.
  - `Available Copies` of `Encyclopædia Britannica` increments to `1`.
  - Book status automatically reverts to `available`.
  - Email notification `Book Returned Confirmation` is triggered.

---

## Test Case 6: Access Control List (ACL) Restrictions
- **Objective**: Verify that students cannot access admin features and cannot see other students' requests.
- **Pre-conditions**:
  - Two students exist: `Student A` and `Student B`.
  - Librarian `Librarian C` exists.
- **Steps**:
  1. Impersonate `Student A`.
  2. Attempt to navigate to the `Book` form and modify a record (e.g., change `Total Copies` of `Clean Code`). Verify that all fields are read-only and no Save/Submit button is visible.
  3. Create request `BRQ0000004` (as `Student A`).
  4. Impersonate `Student B`.
  5. Attempt to view request `BRQ0000004` (e.g., via direct URL navigation `u_borrow_request.do?sys_id=[sys_id]`).
  6. Impersonate `Librarian C`.
  7. Attempt to view request `BRQ0000004`.
- **Expected Results**:
  - Step 2: `Student A` is blocked from editing books (Write ACL blocks students).
  - Step 5: `Student B` receives a "Security constraints prevent access to requested page" error or the record is hidden (Read ACL restricts view to `u_student == current_user`).
  - Step 7: `Librarian C` can view and edit the request successfully (Librarians have full read/write access).

---

## Test Case 7: Scheduled Overdue Trigger
- **Objective**: Verify that the daily scheduled job marks expired borrows as overdue and triggers notifications.
- **Pre-conditions**:
  - A borrow request `BRQ0000005` exists in status `borrowed` where the `Due Date` is in the past (e.g., yesterday).
- **Steps**:
  1. Run the Scheduled Script Execution `Check Overdue Requests` manually (Click **Execute Now**).
  2. Open request `BRQ0000005`.
- **Expected Results**:
  - Request `BRQ0000005` status is updated to `overdue`.
  - Event `u_borrow_request.overdue` is fired.
  - Check the Outbox (**System Logs > Emails**): Verify that an overdue reminder email has been generated for `BRQ0000005`.
