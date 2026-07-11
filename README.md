# ServiceNow Library Management System (LMS)

This repository contains the complete codebase, configurations, and documentation for a Library Management System built for ServiceNow.

## Features
- **Two Roles**: Supports **Students** (submitting/tracking requests) and **Librarians** (CRUD on books, reviewing/approving requests, dashboards).
- **Custom Tables**:
  - `Book (u_book)`: Catalog management with total/available copy counts and automatic status synchronization.
  - `Borrow Request (u_borrow_request)`: Detailed transaction tracking (dates, request status, assignment).
- **Automated Workflows**: Full Flow Designer logic mapping, including automated Librarian assignment, approval states, and status synchronization.
- **Access Control (ACLs)**: Fine-grained table and field-level permissions securing database integrity and restricting student visibility to their own records.
- **Scheduled Jobs**: Daily check for overdue books with automated transition to the `overdue` state and email alerts.
- **Reporting & Dashboards**: Pre-configured widgets for key indicators (total books, available books, overdue books, pending requests) and analytical charts.

---
file:///c:/Users/chall/OneDrive/Desktop/teja/prototype/index.html
## Repository Structure

```
├── README.md                            - Landing page and overview (this file)
├── docs/
│   ├── architecture.md                  - Database schemas, data types, choices, and ACL table
│   └── setup_guide.md                   - Step-by-step UI configuration instructions
├── scripts/
│   ├── ScriptIncludes/
│   │   └── LibraryUtils.js              - Core reusable server-side transaction logic
│   ├── BusinessRules/
│   │   ├── ManageBorrowRequest.js       - Borrow request lifecycle and copy increment/decrement
│   │   └── BookValidation.js            - Book copy consistency and availability state updates
│   ├── ClientScripts/
│   │   └── BorrowRequestForm.js         - UI access controls and due date validation
│   ├── ScheduledJobs/
│   │   └── CheckOverdueRequests.js      - Daily daemon marking requests overdue and sending alerts
│   └── FixScripts/
│   │   └── PopulateSampleData.js        - Seeding script with dummy book records
├── security/
│   └── roles_and_acls.json              - Security profiles and conditions in declarative JSON
├── workflows/
│   └── flow_designer_definition.json    - Detailed Flow Designer sequence steps
├── reports_dashboards/
│   └── reports_config.json              - Definitions for reports, groupings, and dashboards
├── update_set/
│   └── library_management_system_update_set.xml - Importable ServiceNow Update Set
└── testing/
    └── test_cases.md                    - QA scripts and manual test procedures
```

---

## Installation Options

### Option 1: Import the Update Set (Recommended)
This is the fastest method to load all script elements directly into ServiceNow:
1. Log in to your ServiceNow instance as an Administrator.
2. Navigate to **System Update Sets > Retrieved Update Sets**.
3. Scroll down and click **Import Update Set from XML**.
4. Upload [library_management_system_update_set.xml](file:///c:/Users/chall/OneDrive/Desktop/teja/update_set/library_management_system_update_set.xml).
5. Open the retrieved update set record ("Library Management System Update Set") and click **Preview Update Set**.
6. Ensure no errors occurred and click **Commit Update Set**.
7. *Note*: Since Update Sets might require preexisting tables, make sure you create the custom tables `u_book` and `u_borrow_request` (as described in the [setup_guide.md](file:///c:/Users/chall/OneDrive/Desktop/teja/docs/setup_guide.md)) before committing, or check/accept missing dictionary references during commit preview.

### Option 2: Manual Setup
If you want to build the elements from scratch or inside a scoped application:
1. Follow the step-by-step layout in [setup_guide.md](file:///c:/Users/chall/OneDrive/Desktop/teja/docs/setup_guide.md).
2. Copy and paste the scripts located in the `scripts/` folder into your custom ServiceNow instance.

---

## Seeding Sample Data
Once tables and scripts are loaded, run the Fix Script to populate your book catalog:
1. Navigate to **System Definition > Fix Scripts**.
2. Find or create a Fix Script named `PopulateSampleData`.
3. Paste the contents of [PopulateSampleData.js](file:///c:/Users/chall/OneDrive/Desktop/teja/scripts/FixScripts/PopulateSampleData.js).
4. Click **Run Script** and select **Proceed in Background**.
5. Check the logs under **System Logs > App Log** to confirm successful insertion of books.

---

## Verification
Follow the testing instructions in [test_cases.md](file:///c:/Users/chall/OneDrive/Desktop/teja/testing/test_cases.md) to verify that all functional requirements (borrow requests, librarian approvals, notifications, copy increments, and security ACLs) work exactly as expected.
