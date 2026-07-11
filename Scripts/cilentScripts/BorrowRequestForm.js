/**
 * Client Script: BorrowRequestFormLogic
 * Table: u_borrow_request
 * Type: onLoad (with sub-handlers for onChange)
 * UI Type: All
 */
function onLoad() {
    var isLibrarian = g_user.hasRole('u_library_librarian');
    var status = g_form.getValue('u_status');
    var isNew = g_form.isNewRecord();

    // 1. ACCESS CONTROL BY ROLE
    if (!isLibrarian) {
        // Students cannot edit admin or workflow fields
        g_form.setReadOnly('u_status', true);
        g_form.setReadOnly('u_approval_date', true);
        g_form.setReadOnly('u_due_date', true);
        g_form.setReadOnly('u_return_date', true);
        g_form.setReadOnly('u_librarian_comments', true);
        g_form.setReadOnly('assignment_group', true);
        g_form.setReadOnly('assigned_to', true);
        g_form.setReadOnly('u_student', true);

        // If request is already processed, student cannot edit anything
        if (!isNew && status !== 'pending') {
            g_form.setReadOnly('u_book', true);
            g_form.setReadOnly('u_request_date', true);
        }
    } else {
        // Librarians can edit almost everything except logs
        g_form.setReadOnly('u_approval_date', true);
        g_form.setReadOnly('u_return_date', true);
        g_form.setReadOnly('u_request_date', true);

        // If the book is already returned, lock the record
        if (status === 'returned') {
            g_form.setReadOnly('u_student', true);
            g_form.setReadOnly('u_book', true);
            g_form.setReadOnly('u_status', true);
            g_form.setReadOnly('u_due_date', true);
            g_form.setReadOnly('u_librarian_comments', true);
            g_form.setReadOnly('assignment_group', true);
            g_form.setReadOnly('assigned_to', true);
        }
    }

    // 2. DYNAMIC FIELD BEHAVIORS ON NEW RECORD
    if (isNew) {
        // Automatically default student field to current user if empty
        if (g_form.getValue('u_student') === '') {
            g_form.setValue('u_student', g_user.userID, g_user.getFullName());
        }
    }
}

/**
 * OnChange function for u_due_date
 * (In ServiceNow, this would be a separate Client Script record, but we document it here 
 * for implementation reference to validate that due date cannot be set in the past).
 */
function onChangeDueDate(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    var selectedDate = new Date(newValue);

    if (selectedDate < currentDate) {
        g_form.clearValue('u_due_date');
        g_form.showFieldMsg('u_due_date', 'Due date must be in the future.', 'error');
    }
}
