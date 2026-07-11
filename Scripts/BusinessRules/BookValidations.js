(function executeRule(current, previous /*null when async*/) {

    var utils = new LibraryUtils();
    
    // Validate copies fields consistency
    var errorMsg = utils.validateBookCounts(current);
    if (errorMsg) {
        gs.addErrorMessage("Book Validation Failed: " + errorMsg);
        current.setAbortAction(true);
        return;
    }

    var available = parseInt(current.getValue('u_available_copies'), 10);
    var status = current.getValue('u_status');

    // Automatically synchronize status with availability
    if (available === 0 && status === 'available') {
        current.setValue('u_status', 'borrowed');
        gs.addInfoMessage("Book status updated to 'Borrowed' because available copies reached 0.");
    } else if (available > 0 && status === 'borrowed') {
        current.setValue('u_status', 'available');
        gs.addInfoMessage("Book status updated to 'Available' because copies are now available.");
    }

})(current, previous);
