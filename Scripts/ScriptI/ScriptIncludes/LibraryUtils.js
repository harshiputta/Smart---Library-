/**
 * Script Include: LibraryUtils
 * Description: Reusable server-side functions for managing books, borrow requests, availability, and transactions.
 * Scope: Global or Scoped
 */
var LibraryUtils = Class.create();
LibraryUtils.prototype = {
    initialize: function() {
    },

    /**
     * Checks whether a book is available for borrowing.
     * @param {String} bookSysId - The sys_id of the book.
     * @return {Boolean} - True if available, false otherwise.
     */
    isBookAvailable: function(bookSysId) {
        if (!bookSysId) return false;

        var bookGR = new GlideRecord('u_book');
        if (bookGR.get(bookSysId)) {
            var availableCopies = parseInt(bookGR.getValue('u_available_copies'), 10) || 0;
            var status = bookGR.getValue('u_status');
            
            return (availableCopies > 0 && status === 'available');
        }
        return false;
    },

    /**
     * Decrements the available copies of a book when borrowed.
     * Also updates the book's overall status to "borrowed" if copies reach 0.
     * @param {String} bookSysId - The sys_id of the book.
     * @return {Boolean} - Success status.
     */
    decrementBookCopies: function(bookSysId) {
        if (!bookSysId) return false;

        var bookGR = new GlideRecord('u_book');
        if (bookGR.get(bookSysId)) {
            var availableCopies = parseInt(bookGR.getValue('u_available_copies'), 10) || 0;
            
            if (availableCopies <= 0) {
                gs.error("LibraryUtils: Cannot decrement available copies. Already 0 for book: " + bookGR.getValue('u_title'));
                return false;
            }

            var newCount = availableCopies - 1;
            bookGR.setValue('u_available_copies', newCount);

            // Update status if copies are depleted
            if (newCount === 0) {
                bookGR.setValue('u_status', 'borrowed');
            }

            bookGR.update();
            gs.info("LibraryUtils: Successfully decremented copies for book: " + bookGR.getValue('u_title') + ". New count: " + newCount);
            return true;
        }
        return false;
    },

    /**
     * Increments the available copies of a book when returned.
     * Resets the status to "available" if copies are now > 0.
     * @param {String} bookSysId - The sys_id of the book.
     * @return {Boolean} - Success status.
     */
    incrementBookCopies: function(bookSysId) {
        if (!bookSysId) return false;

        var bookGR = new GlideRecord('u_book');
        if (bookGR.get(bookSysId)) {
            var availableCopies = parseInt(bookGR.getValue('u_available_copies'), 10) || 0;
            var totalCopies = parseInt(bookGR.getValue('u_total_copies'), 10) || 0;

            if (availableCopies >= totalCopies) {
                gs.warn("LibraryUtils: Available copies cannot exceed total copies for book: " + bookGR.getValue('u_title'));
                // Cap it to prevent logical errors
                bookGR.setValue('u_available_copies', totalCopies);
            } else {
                bookGR.setValue('u_available_copies', availableCopies + 1);
            }

            // Mark status back to available
            bookGR.setValue('u_status', 'available');
            
            bookGR.update();
            gs.info("LibraryUtils: Successfully incremented copies for book: " + bookGR.getValue('u_title') + ". New count: " + bookGR.getValue('u_available_copies'));
            return true;
        }
        return false;
    },

    /**
     * Validates book counts before insert or update.
     * Ensures total_copies >= available_copies and u_available_copies >= 0.
     * @param {GlideRecord} bookGR - The book record being modified.
     * @return {String|null} - Error message if invalid, null if valid.
     */
    validateBookCounts: function(bookGR) {
        if (!bookGR) return "No book record provided.";

        var total = parseInt(bookGR.getValue('u_total_copies'), 10);
        var available = parseInt(bookGR.getValue('u_available_copies'), 10);

        if (isNaN(total) || total < 0) {
            return "Total copies cannot be empty or negative.";
        }
        if (isNaN(available) || available < 0) {
            return "Available copies cannot be empty or negative.";
        }
        if (available > total) {
            return "Available copies cannot exceed total copies.";
        }

        return null;
    },

    /**
     * Checks if a user has any overdue books.
     * Can be used to block borrowing requests.
     * @param {String} userSysId - The sys_id of the student/user.
     * @return {Boolean} - True if student has overdue books.
     */
    hasOverdueRequests: function(userSysId) {
        if (!userSysId) return false;

        var requestGR = new GlideRecord('u_borrow_request');
        requestGR.addQuery('u_student', userSysId);
        requestGR.addQuery('u_status', 'overdue');
        requestGR.query();

        return requestGR.hasNext();
    },

    type: 'LibraryUtils'
};


