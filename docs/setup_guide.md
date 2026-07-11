# ServiceNow Setup and Configuration Guide

This setup guide provides step-by-step instructions for installing and configuring the Library Management System in ServiceNow. You can perform these steps manually or import the provided XML Update Set file.

---

## 1. Create Roles and Groups
Before creating tables, define the security roles:
1. Navigate to **User Administration > Roles**.
2. Click **New** and create the following roles:
   - **Student**: Name: `u_library_student`, Description: "Library Student - Borrow books"
   - **Librarian**: Name: `u_library_librarian`, Description: "Library Librarian - Manage books and approve requests"
3. Navigate to **User Administration > Groups**.
4. Click **New** and create the group:
   - **Name**: `Librarians`
   - **Roles (Related List)**: Add `u_library_librarian`.
   - Add users who will manage the requests to this group.

---

## 2. Define Custom Tables and Columns
Navigate to **System Definition > Tables**.

### Table 1: Book (`u_book`)
1. Click **New**.
2. **Label**: `Book`, **Name**: `u_book`.
3. Under **Controls**, check **Auto-number**. Prefix: `BOK`, Digits: `7`.
4. Define the columns specified in [architecture.md](file:///c:/Users/chall/OneDrive/Desktop/teja/docs/architecture.md).
5. For choice fields:
   - **Category (`u_category`)**: Configure choices for Fiction, Non-Fiction, Science, History, Technology, Biography, and Reference.
   - **Status (`u_status`)**: Configure choices for Available, Borrowed, Reserved, and Lost.

### Table 2: Borrow Request (`u_borrow_request`)
1. Click **New**.
2. **Label**: `Borrow Request`, **Name**: `u_borrow_request`.
3. Under **Controls**, check **Auto-number**. Prefix: `BRQ`, Digits: `7`.
4. Define the columns specified in [architecture.md](file:///c:/Users/chall/OneDrive/Desktop/teja/docs/architecture.md).
5. For the `u_book` reference field, set the **Reference Qualifier** (Condition) to:
   `u_available_copies > 0^u_status = available`
6. For the `u_student` reference field, set the default value to `javascript:gs.getUserID()`.
7. For the `assignment_group` field, set the default value to the sys_id of the `Librarians` group.

---

## 3. Implement Server-Side and Client-Side Scripting
The JavaScript source code files are stored in the `scripts/` directory:
1. **Script Include**: Create `LibraryUtils` in **System Definition > Script Includes**. Check **Client Callable** if needed (set to false for security, call from Business Rules). Copy code from `scripts/ScriptIncludes/LibraryUtils.js`.
2. **Business Rules**: Create the following rules in **System Definition > Business Rules**:
   - `Manage Borrow Request`: On table `u_borrow_request`, runs **Before** Insert/Update. Copy code from `scripts/BusinessRules/ManageBorrowRequest.js`.
   - `Book Validation`: On table `u_book`, runs **Before** Insert/Update. Copy code from `scripts/BusinessRules/BookValidation.js`.
3. **Client Scripts**: Create in **System Definition > Client Scripts**:
   - `Borrow Request Form Logic`: On table `u_borrow_request`, UI Type: All, Type: onLoad & onChange. Copy code from `scripts/ClientScripts/BorrowRequestForm.js`.
4. **Scheduled Job**: Create in **System Definition > Scheduled Jobs > Scheduled Script Execution**:
   - `Check Overdue Requests`: Set to Run **Daily** at 12:00 AM. Copy code from `scripts/ScheduledJobs/CheckOverdueRequests.js`.

---

## 4. Design Workflow Automations (Flow Designer)
To automate approvals and assignments, create a flow named **Library Borrow Request Flow**:
1. Open **Flow Designer**.
2. Click **New > Flow**. Name: `Library Borrow Request Flow`. Trigger: `Created` on `u_borrow_request`.
3. **Actions**:
   - **Step 1 (Assignment)**: Update Record `u_borrow_request` -> Set `assignment_group` to `Librarians`.
   - **Step 2 (Approval)**: Ask for Approval.
     - **Approval User**: Group approval from `Librarians` or individual librarians.
     - Rules: Approve when `Anyone approves`, Reject when `Anyone rejects`.
   - **Step 3 (Decision - Approval)**: If Approved:
     - Update Record `u_borrow_request` -> Set `u_status` to `borrowed` (or `approved` first, and then let Librarian mark as `borrowed`).
     - Set `u_approval_date` to Trigger date.
     - Set `u_due_date` to `14 days` from current date (handled automatically by Business Rule or Flow script).
     - Send Email Notification to `u_student`.
   - **Step 4 (Decision - Rejection)**: If Rejected:
     - Update Record `u_borrow_request` -> Set `u_status` to `rejected`.
     - Send Email Notification to `u_student` with `u_librarian_comments`.

---

## 5. Configure System Email Notifications
Navigate to **System Notification > Email > Notifications**. Create notifications:

1. **Borrow Request Submitted**:
   - Table: `u_borrow_request`
   - When to send: Record inserted (Status = Pending)
   - Recipients: `u_student` (CC) and Members of Assignment Group `Librarians`.
   - Subject: `Library Borrow Request Submitted - ${number}`
   - Body: "Hello ${u_student.first_name}, your request for the book '${u_book.u_title}' has been submitted and is pending librarian review."

2. **Request Approved**:
   - Table: `u_borrow_request`
   - When to send: Record updated (Status = Approved or Borrowed)
   - Recipients: `u_student`
   - Subject: `Approved: Borrow Request - ${number}`
   - Body: "Your request for '${u_book.u_title}' has been approved. Please collect the book. It is due on ${u_due_date}."

3. **Request Rejected**:
   - Table: `u_borrow_request`
   - When to send: Record updated (Status = Rejected)
   - Recipients: `u_student`
   - Subject: `Rejected: Borrow Request - ${number}`
   - Body: "Your request for '${u_book.u_title}' has been rejected. Librarian Comments: ${u_librarian_comments}."

4. **Book Due Reminder**:
   - Table: `u_borrow_request`
   - Trigger: Triggered via event `u_borrow_request.due_soon` (fired from scheduled job 2 days before due date).
   - Recipients: `u_student`
   - Subject: `Reminder: Book Due Soon - ${u_book.u_title}`
   - Body: "This is a reminder that '${u_book.u_title}' is due in 2 days on ${u_due_date}."

5. **Overdue Reminder**:
   - Table: `u_borrow_request`
   - Trigger: Event `u_borrow_request.overdue` (fired from Scheduled Job).
   - Recipients: `u_student`
   - Subject: `URGENT: Overdue Book - ${u_book.u_title}`
   - Body: "The book '${u_book.u_title}' was due on ${u_due_date} and is now overdue. Please return it immediately."

6. **Book Returned Confirmation**:
   - Table: `u_borrow_request`
   - When to send: Record updated (Status = Returned)
   - Recipients: `u_student`
   - Subject: `Book Returned Confirmation - ${number}`
   - Body: "Thank you. The book '${u_book.u_title}' has been marked as returned on ${u_return_date}."

---

## 6. Reports & Dashboard Setup
Navigate to **Reports > View / Run**. Create 6 reports:

1. **Most Borrowed Books**:
   - Source: Table `u_borrow_request`
   - Type: Bar Chart
   - Group by: `u_book`
   - Filter: `u_status` in Borrowed, Returned, Overdue
2. **Books Currently Borrowed**:
   - Source: Table `u_borrow_request`
   - Type: List
   - Columns: Request ID, Student, Book, Due Date
   - Filter: `u_status` = `borrowed`
3. **Pending Approval Requests**:
   - Source: Table `u_borrow_request`
   - Type: List
   - Columns: Request ID, Student, Book, Request Date
   - Filter: `u_status` = `pending`
4. **Overdue Books**:
   - Source: Table `u_borrow_request`
   - Type: List
   - Columns: Request ID, Student, Book, Due Date, Days Overdue
   - Filter: `u_status` = `overdue`
5. **Monthly Borrow Requests**:
   - Source: Table `u_borrow_request`
   - Type: Trend Chart
   - Group by: `u_request_date` per Month
6. **Books by Category**:
   - Source: Table `u_book`
   - Type: Donut/Pie Chart
   - Group by: `u_category`

### Create Dashboard
1. Navigate to **Self-Service > Dashboards**. Click **New**.
2. Title: `Library Dashboard`.
3. Create two tabs: **Student Portal View** (for general catalog and request tracking) and **Librarian Console** (for analytics and approvals).
4. Add the reports and count widgets:
   - **Total Books Count**: Score widget on `u_book`.
   - **Available Books Count**: Score widget on `u_book` (Condition: Available Copies > 0).
   - **Borrowed Books Count**: Score widget on `u_borrow_request` (Condition: Status = Borrowed).
   - **Pending Approval Count**: Score widget on `u_borrow_request` (Condition: Status = Pending).
   - **Overdue Count**: Score widget on `u_borrow_request` (Condition: Status = Overdue).
   - Add the **Most Borrowed Books** chart and **Overdue Books** list to the Librarian tab.
