/**
 * Scheduled Job: Check Overdue Requests and Send Reminders
 * Run: Daily at 12:00 AM
 */
(function() {
    gs.info("LMS: Starting CheckOverdueRequests Scheduled Job.");

    var today = new GlideDate();
    
    // 1. MARK OVERDUE BOOKS AND TRIGGER EVENT
    var overdueRequests = new GlideRecord('u_borrow_request');
    overdueRequests.addQuery('u_status', 'borrowed');
    overdueRequests.addQuery('u_due_date', '<', today);
    overdueRequests.query();

    var overdueCount = 0;
    while (overdueRequests.next()) {
        overdueRequests.setValue('u_status', 'overdue');
        overdueRequests.update();

        // Trigger Event for Overdue Email Notification
        // Event registry key: u_borrow_request.overdue
        // Parm1: Student email/sys_id, Parm2: Due date
        gs.eventQueue('u_borrow_request.overdue', overdueRequests, overdueRequests.getValue('u_student'), overdueRequests.getValue('u_due_date'));
        overdueCount++;
    }
    gs.info("LMS: Completed marking overdue requests. Total marked overdue: " + overdueCount);

    // 2. TRIGGER DUE SOON REMINDERS (Books due in exactly 2 days)
    var dueSoonDate = new GlideDate();
    dueSoonDate.addDaysUTC(2);

    var reminderRequests = new GlideRecord('u_borrow_request');
    reminderRequests.addQuery('u_status', 'borrowed');
    reminderRequests.addQuery('u_due_date', '=', dueSoonDate);
    reminderRequests.query();

    var reminderCount = 0;
    while (reminderRequests.next()) {
        // Trigger Event for Book Due Soon Reminder
        // Event registry key: u_borrow_request.due_soon
        gs.eventQueue('u_borrow_request.due_soon', reminderRequests, reminderRequests.getValue('u_student'), reminderRequests.getValue('u_due_date'));
        reminderCount++;
    }
    gs.info("LMS: Completed sending due soon reminders. Total alerts queued: " + reminderCount);

})();
