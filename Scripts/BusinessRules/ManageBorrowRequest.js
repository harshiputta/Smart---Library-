(function executeRule(current, previous /*null when async*/) {

    var utils = new LibraryUtils();

    // 1. ONSUBMIT/ONINSERT VALIDATIONS (When request is newly created as 'pending')
    if (current.isNewRecord()) {
        // Ensure student is set (default to current user if empty)
        if (!current.u_student) {
            current.u_student = gs.getUserID();
        }
        
        // Default request date to current timestamp
        if (!current.u_request_date) {
            current.u_request_date = gs.nowDateTime();
        }

        // Verify book availability
        var isAvail = utils.isBookAvailable(current.u_book);
        if (!isAvail) {
            gs.addErrorMessage("Sorry, this book is currently not available for borrowing.");
            current.setAbortAction(true);
            return;
        }

        // Check if student has outstanding overdue books
        if (utils.hasOverdueRequests(current.u_student)) {
            gs.addErrorMessage("You cannot request new books while you have overdue items.");
            current.setAbortAction(true);
            return;
        }

        // Auto-assign to Librarians group if empty
        if (!current.assignment_group) {
            var groupGR = new GlideRecord('sys_user_group');
            groupGR.addQuery('name', 'Librarians');
            groupGR.query();
            if (groupGR.next()) {
                current.assignment_group = groupGR.getUniqueValue();
            }
        }
    }

    // 2. STATE TRANSITIONS
    
    // Case A: Request Approved & Book Borrowed
    // Triggers when status changes to 'borrowed' (or 'approved' if we merge both)
    // Requirement: "If approved: Update Book status to Borrowed. Reduce available copies. Notify the student."
    var statusChangedToBorrowed = (current.u_status == 'borrowed' && (previous == null || previous.u_status != 'borrowed'));
    var statusChangedToApproved = (current.u_status == 'approved' && (previous == null || previous.u_status != 'approved'));
    
    if (statusChangedToBorrowed || statusChangedToApproved) {
        // Check if we need to set approval date
        if (!current.u_approval_date) {
            current.u_approval_date = gs.nowDateTime();
        }
        
        // Auto-calculate Due Date (14 days from now) if not already set by librarian
        if (!current.u_due_date) {
            var gDate = new GlideDateTime();
            gDate.addDaysUTC(14);
            current.u_due_date = gDate.getDate();
        }

        // Reduce available copies of the book (only once)
        var decSuccess = utils.decrementBookCopies(current.u_book);
        if (!decSuccess && statusChangedToApproved) {
            gs.addErrorMessage("Unable to approve request: Book copies could not be decremented.");
            current.setAbortAction(true);
            return;
        }
    }

    // Case B: Book Returned
    // Triggers when status changes to 'returned'
    // Requirement: "When the book is returned: Update status to Returned. Increase available copies. Mark available if copies exist."
    var statusChangedToReturned = (current.u_status == 'returned' && (previous == null || previous.u_status != 'returned'));
    if (statusChangedToReturned) {
        // Record return date
        if (!current.u_return_date) {
            current.u_return_date = gs.nowDateTime();
        }

        // Increase available copies
        var incSuccess = utils.incrementBookCopies(current.u_book);
        if (!incSuccess) {
            gs.warn("LibraryUtils: Failed to increment book copies for returned book on request " + current.number);
        }
    }

    // Case C: Request Rejected
    var statusChangedToRejected = (current.u_status == 'rejected' && (previous == null || previous.u_status != 'rejected'));
    if (statusChangedToRejected) {
        if (!current.u_approval_date) {
            current.u_approval_date = gs.nowDateTime(); // Marks resolution date
        }
    }

})(current, previous);
