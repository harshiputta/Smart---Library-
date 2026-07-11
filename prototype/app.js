/**
 * ServiceNow LMS - Interactive Prototype Logic
 * Simulates ServiceNow database and script engine (Script Includes, Business Rules, Scheduled Jobs)
 */

// Initial Seed Data (matching PopulateSampleData.js and setup configurations)
const INITIAL_BOOKS = [
  {
    sys_id: "book_cormen_1",
    u_title: "Introduction to Algorithms",
    u_author: "Thomas H. Cormen",
    u_isbn: "9780262033848",
    u_category: "technology",
    u_publisher: "MIT Press",
    u_publication_year: 2009,
    u_total_copies: 5,
    u_available_copies: 5,
    u_shelf_location: "Aisle 1, Rack A",
    u_status: "available",
    u_description: "The standard textbook on algorithms, covering sorting, data structures, graph algorithms, and more."
  },
  {
    sys_id: "book_clean_2",
    u_title: "Clean Code",
    u_author: "Robert C. Martin",
    u_isbn: "9780132350884",
    u_category: "technology",
    u_publisher: "Prentice Hall",
    u_publication_year: 2008,
    u_total_copies: 3,
    u_available_copies: 3,
    u_shelf_location: "Aisle 1, Rack B",
    u_status: "available",
    u_description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees."
  },
  {
    sys_id: "book_mockingbird_3",
    u_title: "To Kill a Mockingbird",
    u_author: "Harper Lee",
    u_isbn: "9780446310789",
    u_category: "fiction",
    u_publisher: "Grand Central Publishing",
    u_publication_year: 1988,
    u_total_copies: 4,
    u_available_copies: 4,
    u_shelf_location: "Aisle 2, Rack A",
    u_status: "available",
    u_description: "Compassionate, dramatic, and deeply moving, To Kill A Mockingbird takes readers to the roots of human behavior."
  },
  {
    sys_id: "book_hawking_4",
    u_title: "A Brief History of Time",
    u_author: "Stephen Hawking",
    u_isbn: "9780553380163",
    u_category: "science",
    u_publisher: "Bantam Books",
    u_publication_year: 1998,
    u_total_copies: 2,
    u_available_copies: 2,
    u_shelf_location: "Aisle 3, Rack C",
    u_status: "available",
    u_description: "A landmark volume in science writing by one of the great minds of our time, exploring the origins of the universe."
  },
  {
    sys_id: "book_sapiens_5",
    u_title: "Sapiens: A Brief History of Humankind",
    u_author: "Yuval Noah Harari",
    u_isbn: "9780062316097",
    u_category: "history",
    u_publisher: "Harper",
    u_publication_year: 2015,
    u_total_copies: 6,
    u_available_copies: 6,
    u_shelf_location: "Aisle 4, Rack D",
    u_status: "available",
    u_description: "Sapiens integrates history and science to reconsider common narratives and connect past developments."
  },
  {
    sys_id: "book_jobs_6",
    u_title: "Steve Jobs",
    u_author: "Walter Isaacson",
    u_isbn: "9781451648539",
    u_category: "biography",
    u_publisher: "Simon & Schuster",
    u_publication_year: 2011,
    u_total_copies: 2,
    u_available_copies: 1, // 1 copy currently borrowed out in initial mock state
    u_shelf_location: "Aisle 5, Rack A",
    u_status: "available",
    u_description: "The exclusive biography of Steve Jobs, based on more than forty interviews with Jobs conducted over two years."
  },
  {
    sys_id: "book_britannica_7",
    u_title: "Encyclopædia Britannica",
    u_author: "Britannica Editors",
    u_isbn: "9781593392925",
    u_category: "reference",
    u_publisher: "Encyclopædia Britannica, Inc.",
    u_publication_year: 2010,
    u_total_copies: 1,
    u_available_copies: 0, // 0 copies available (borrowed) to test out-of-stock validation
    u_shelf_location: "Reference Desk",
    u_status: "borrowed",
    u_description: "For library use only. Standard reference compilation of general knowledge."
  }
];

const INITIAL_REQUESTS = [
  {
    sys_id: "req_1",
    number: "BRQ0000001",
    u_student: "Test Student",
    u_book: "book_jobs_6", // Steve Jobs
    u_request_date: "2026-07-01 10:00:00",
    u_approval_date: "2026-07-01 11:30:00",
    u_due_date: "2026-07-15",
    u_return_date: null,
    u_status: "borrowed",
    u_librarian_comments: "Collected by student.",
    assignment_group: "Librarians"
  },
  {
    sys_id: "req_2",
    number: "BRQ0000002",
    u_student: "Alex Carter",
    u_book: "book_britannica_7", // Britannica
    u_request_date: "2026-06-15 14:00:00",
    u_approval_date: "2026-06-15 14:15:00",
    u_due_date: "2026-06-29", // Overdue! (Today is July 6, 2026)
    u_return_date: null,
    u_status: "overdue",
    u_librarian_comments: "Immediate return required.",
    assignment_group: "Librarians"
  },
  {
    sys_id: "req_3",
    number: "BRQ0000003",
    u_student: "Emma Watson",
    u_book: "book_clean_2", // Clean Code
    u_request_date: "2026-07-06 09:12:00",
    u_approval_date: null,
    u_due_date: null,
    u_return_date: null,
    u_status: "pending",
    u_librarian_comments: "",
    assignment_group: "Librarians"
  },
  {
    sys_id: "req_4",
    number: "BRQ0000004",
    u_student: "Test Student",
    u_book: "book_sapiens_5", // Sapiens
    u_request_date: "2026-06-10 11:00:00",
    u_approval_date: "2026-06-10 11:20:00",
    u_due_date: "2026-06-24",
    u_return_date: "2026-06-22 15:45:00",
    u_status: "returned",
    u_librarian_comments: "Returned in good condition.",
    assignment_group: "Librarians"
  }
];

// App State Manager
class LMSState {
  constructor() {
    this.loadState();
  }

  loadState() {
    const books = localStorage.getItem("lms_books");
    const requests = localStorage.getItem("lms_requests");

    if (books && requests) {
      this.books = JSON.parse(books);
      this.requests = JSON.parse(requests);
    } else {
      this.resetToDefaults();
    }
  }

  saveState() {
    localStorage.setItem("lms_books", JSON.stringify(this.books));
    localStorage.setItem("lms_requests", JSON.stringify(this.requests));
  }

  resetToDefaults() {
    this.books = JSON.parse(JSON.stringify(INITIAL_BOOKS));
    this.requests = JSON.parse(JSON.stringify(INITIAL_REQUESTS));
    this.saveState();
  }
}

// Global instances
const state = new LMSState();
let selectedBookForBorrow = null;
let currentActiveView = "student";

// Document Elements
const roleSelect = document.getElementById("role-select");
const resetDbBtn = document.getElementById("reset-db-btn");
const studentView = document.getElementById("student-view");
const librarianView = document.getElementById("librarian-view");

const bookCardsContainer = document.getElementById("book-cards-container");
const catalogSearch = document.getElementById("catalog-search");
const categoryFilter = document.getElementById("category-filter");
const studentHistoryBody = document.getElementById("student-history-body");

// Librarian fields
const statTotalBooks = document.getElementById("stat-total-books");
const statAvailBooks = document.getElementById("stat-avail-books");
const statBorrowedBooks = document.getElementById("stat-borrowed-books");
const statPendingReqs = document.getElementById("stat-pending-reqs");
const statOverdueReqs = document.getElementById("stat-overdue-reqs");
const librarianRequestsBody = document.getElementById("librarian-requests-body");
const addBookForm = document.getElementById("add-book-form");
const triggerOverdueJob = document.getElementById("trigger-overdue-job");

// Modal fields
const borrowModal = document.getElementById("borrow-modal");
const modalBookTitle = document.getElementById("modal-book-title");
const modalBookAuthor = document.getElementById("modal-book-author");
const modalBookIsbn = document.getElementById("modal-book-isbn");
const modalBookShelf = document.getElementById("modal-book-shelf");
const modalDueDateInput = document.getElementById("modal-due-date");
const modalSubmitBtn = document.getElementById("modal-submit-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const closeModalBtn = document.querySelector(".close-modal-btn");

// Toast Notification
const toastContainer = document.getElementById("toast-container");

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderApp();
});

// Toast Logger
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  } else {
    iconSvg = `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  }

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  toastContainer.appendChild(toast);
  
  // Trigger transition
  setTimeout(() => toast.classList.add("active"), 10);
  
  // Fade out and remove
  setTimeout(() => {
    toast.classList.remove("active");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Setup listeners
function setupEventListeners() {
  // Role selector
  roleSelect.addEventListener("change", (e) => {
    currentActiveView = e.target.value;
    switchView(currentActiveView);
  });

  // Reset database btn
  resetDbBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all data back to the demo state?")) {
      state.resetToDefaults();
      showToast("Database seeded with sample books & requests.", "info");
      renderApp();
    }
  });

  // Student searches
  catalogSearch.addEventListener("input", renderStudentPortal);
  categoryFilter.addEventListener("change", renderStudentPortal);

  // Close modals
  closeModalBtn.addEventListener("click", hideBorrowModal);
  modalCancelBtn.addEventListener("click", hideBorrowModal);
  window.addEventListener("click", (e) => {
    if (e.target === borrowModal) hideBorrowModal();
  });

  // Confirm borrow submit
  modalSubmitBtn.addEventListener("click", submitBorrowRequest);

  // Librarian Add Book
  addBookForm.addEventListener("submit", handleAddBook);

  // Librarian trigger overdue job
  triggerOverdueJob.addEventListener("click", runOverdueScheduledJob);

  // Report tabs switching
  document.querySelectorAll(".report-tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".report-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".report-panel").forEach(p => p.classList.remove("active"));
      
      e.target.classList.add("active");
      const targetReport = e.target.getAttribute("data-report");
      document.getElementById(`report-${targetReport}`).classList.add("active");
      
      // Animate bars if selected
      if (targetReport === "most-borrowed") {
        setTimeout(animateBarChart, 50);
      }
    });
  });
}

// Swapper for role views
function switchView(role) {
  if (role === "student") {
    studentView.classList.add("active");
    librarianView.classList.remove("active");
  } else {
    studentView.classList.remove("active");
    librarianView.classList.add("active");
  }
  renderApp();
}

// Master Render trigger
function renderApp() {
  if (currentActiveView === "student") {
    renderStudentPortal();
  } else {
    renderLibrarianPortal();
  }
}

// ==========================================================================
// STUDENT VIEW LOGIC
// ==========================================================================
function renderStudentPortal() {
  // Render Books
  const query = catalogSearch.value.toLowerCase().trim();
  const category = categoryFilter.value;
  
  let filteredBooks = state.books;
  
  if (category !== "all") {
    filteredBooks = filteredBooks.filter(b => b.u_category === category);
  }
  
  if (query !== "") {
    filteredBooks = filteredBooks.filter(b => 
      b.u_title.toLowerCase().includes(query) || 
      b.u_author.toLowerCase().includes(query) || 
      b.u_isbn.includes(query)
    );
  }

  bookCardsContainer.innerHTML = "";
  
  if (filteredBooks.length === 0) {
    bookCardsContainer.innerHTML = `<div class="card" style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--text-muted);">No books match your criteria.</div>`;
  } else {
    filteredBooks.forEach(book => {
      const isAvail = book.u_available_copies > 0 && book.u_status === 'available';
      const requestable = isAvail;
      
      const card = document.createElement("div");
      card.className = "card book-card";
      card.innerHTML = `
        <span class="book-tag">${book.u_category}</span>
        <div class="book-title-row">
          <h3>${book.u_title}</h3>
        </div>
        <div class="book-author-row">by ${book.u_author}</div>
        <p class="book-desc-short">${book.u_description}</p>
        <div class="book-meta-footer">
          <div class="meta-item">
            <span class="label">ISBN</span>
            <span class="val">${book.u_isbn}</span>
          </div>
          <div class="meta-item">
            <span class="label">Shelf Location</span>
            <span class="val">${book.u_shelf_location || 'Not Specified'}</span>
          </div>
          <div class="meta-item">
            <span class="label">Availability</span>
            <span class="val">
              <span class="badge ${book.u_status}">${book.u_available_copies} of ${book.u_total_copies} available</span>
            </span>
          </div>
        </div>
        <div class="book-action-btn-row">
          <button class="btn btn-primary btn-sm full-width" 
                  ${!requestable ? 'disabled' : ''} 
                  onclick="openBorrowModal('${book.sys_id}')">
            ${requestable ? 'Request Borrow' : 'Out of Stock / Checked Out'}
          </button>
        </div>
      `;
      bookCardsContainer.appendChild(card);
    });
  }

  // Render history table (filtered only by current student "Test Student")
  const studentRequests = state.requests.filter(r => r.u_student === "Test Student");
  studentHistoryBody.innerHTML = "";

  if (studentRequests.length === 0) {
    studentHistoryBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No borrow requests submitted yet.</td></tr>`;
  } else {
    // Sort newest first
    studentRequests.sort((a,b) => b.number.localeCompare(a.number)).forEach(req => {
      const bookObj = state.books.find(b => b.sys_id === req.u_book);
      const title = bookObj ? bookObj.u_title : "Unknown Book";
      
      let cancelBtn = "";
      if (req.u_status === "pending") {
        cancelBtn = `<button class="btn btn-danger btn-sm" onclick="cancelPendingRequest('${req.sys_id}')">Cancel</button>`;
      }
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${req.number}</strong></td>
        <td>${title}</td>
        <td>${req.u_request_date.split(" ")[0]}</td>
        <td>${req.u_due_date || '—'}</td>
        <td><span class="badge status-${req.u_status}">${req.u_status}</span></td>
        <td>${cancelBtn}</td>
      `;
      studentHistoryBody.appendChild(tr);
    });
  }
}

// Modal handling
window.openBorrowModal = function(bookId) {
  // Check if student has outstanding overdue books
  const hasOverdue = state.requests.some(r => r.u_student === "Test Student" && r.u_status === "overdue");
  if (hasOverdue) {
    showToast("Transaction Aborted: You have overdue books that must be returned.", "error");
    return;
  }

  selectedBookForBorrow = state.books.find(b => b.sys_id === bookId);
  if (!selectedBookForBorrow) return;

  modalBookTitle.textContent = selectedBookForBorrow.u_title;
  modalBookAuthor.textContent = selectedBookForBorrow.u_author;
  modalBookIsbn.textContent = selectedBookForBorrow.u_isbn;
  modalBookShelf.textContent = selectedBookForBorrow.u_shelf_location || "N/A";

  // Default to 14 days in future
  const fourteenDays = new Date();
  fourteenDays.setDate(fourteenDays.getDate() + 14);
  modalDueDateInput.value = fourteenDays.toISOString().split("T")[0];
  modalDueDateInput.min = new Date().toISOString().split("T")[0];

  borrowModal.classList.add("active");
};

function hideBorrowModal() {
  borrowModal.classList.remove("active");
  selectedBookForBorrow = null;
}

// Submit borrow request logic (simulating ServiceNow business rule validates)
function submitBorrowRequest() {
  if (!selectedBookForBorrow) return;

  const dueDate = modalDueDateInput.value;
  if (!dueDate) {
    alert("Please select a due date.");
    return;
  }

  // Generate request ID
  const nextNum = state.requests.length + 1;
  const numStr = "BRQ" + String(nextNum).padStart(7, '0');
  
  const now = new Date();
  const dateStr = now.getFullYear() + "-" + 
                  String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                  String(now.getDate()).padStart(2, '0') + " " + 
                  String(now.getHours()).padStart(2, '0') + ":" + 
                  String(now.getMinutes()).padStart(2, '0') + ":" + 
                  String(now.getSeconds()).padStart(2, '0');

  const newRequest = {
    sys_id: "req_" + Date.now(),
    number: numStr,
    u_student: "Test Student",
    u_book: selectedBookForBorrow.sys_id,
    u_request_date: dateStr,
    u_approval_date: null,
    u_due_date: dueDate,
    u_return_date: null,
    u_status: "pending",
    u_librarian_comments: "",
    assignment_group: "Librarians"
  };

  // Push, Save, and alert
  state.requests.push(newRequest);
  state.saveState();
  
  showToast(`Borrow Request submitted: ${numStr}. Pending approval.`, "info");
  
  hideBorrowModal();
  renderStudentPortal();
}

window.cancelPendingRequest = function(reqSysId) {
  if (confirm("Are you sure you want to cancel this borrow request?")) {
    const idx = state.requests.findIndex(r => r.sys_id === reqSysId);
    if (idx !== -1) {
      state.requests.splice(idx, 1);
      state.saveState();
      showToast("Borrow request cancelled successfully.", "info");
      renderStudentPortal();
    }
  }
};


// ==========================================================================
// LIBRARIAN VIEW LOGIC
// ==========================================================================
function renderLibrarianPortal() {
  recalculateDashboardMetrics();
  renderLibrarianRequestCenter();
  renderReports();
}

function recalculateDashboardMetrics() {
  const totalBooksCount = state.books.length;
  let totalAvailCopies = 0;
  let totalBorrowedCopies = 0;
  
  state.books.forEach(b => {
    totalAvailCopies += b.u_available_copies;
    totalBorrowedCopies += (b.u_total_copies - b.u_available_copies);
  });

  const pendingCount = state.requests.filter(r => r.u_status === "pending").length;
  const overdueCount = state.requests.filter(r => r.u_status === "overdue").length;

  // Set visual texts
  statTotalBooks.textContent = totalBooksCount;
  statAvailBooks.textContent = totalAvailCopies;
  statBorrowedBooks.textContent = totalBorrowedCopies;
  statPendingReqs.textContent = pendingCount;
  statOverdueReqs.textContent = overdueCount;

  // Alert highlight for overdue cards
  const overdueCard = document.getElementById("overdue-card");
  if (overdueCount > 0) {
    overdueCard.classList.add("glow-red");
  } else {
    overdueCard.classList.remove("glow-red");
  }

  // Pulse highlight for pending
  const pendingCard = document.getElementById("pending-card");
  if (pendingCount > 0) {
    pendingCard.classList.add("animate-pulse");
  } else {
    pendingCard.classList.remove("animate-pulse");
  }
}

function renderLibrarianRequestCenter() {
  librarianRequestsBody.innerHTML = "";

  if (state.requests.length === 0) {
    librarianRequestsBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">No records in database.</td></tr>`;
    return;
  }

  // Sort newest first
  const sortedReqs = [...state.requests].sort((a,b) => b.number.localeCompare(a.number));

  sortedReqs.forEach(req => {
    const bookObj = state.books.find(b => b.sys_id === req.u_book);
    const title = bookObj ? bookObj.u_title : "Unknown Book";
    
    let actionsHtml = "—";
    let commentBox = `<span class="comments-text" title="${req.u_librarian_comments || ''}">${req.u_librarian_comments || 'None'}</span>`;

    if (req.u_status === "pending") {
      commentBox = `<input type="text" id="comm-${req.sys_id}" class="tbl-input" placeholder="Comments (optional)">`;
      actionsHtml = `
        <div class="actions-cell">
          <button class="btn btn-success btn-sm" onclick="approveRequest('${req.sys_id}')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="rejectRequest('${req.sys_id}')">Reject</button>
        </div>
      `;
    } else if (req.u_status === "borrowed" || req.u_status === "overdue") {
      actionsHtml = `<button class="btn btn-secondary btn-sm" onclick="returnBook('${req.sys_id}')">Mark Returned</button>`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${req.number}</strong></td>
      <td>${req.u_student}</td>
      <td>${title}</td>
      <td>${req.u_request_date.split(" ")[0]}</td>
      <td>${req.u_due_date || '—'}</td>
      <td><span class="badge status-${req.u_status}">${req.u_status}</span></td>
      <td>${commentBox}</td>
      <td>${actionsHtml}</td>
    `;
    librarianRequestsBody.appendChild(tr);
  });
}

// Approve / Reject actions (simulating workflow action and script logic)
window.approveRequest = function(reqSysId) {
  const req = state.requests.find(r => r.sys_id === reqSysId);
  if (!req) return;

  const bookObj = state.books.find(b => b.sys_id === req.u_book);
  if (!bookObj || bookObj.u_available_copies <= 0) {
    showToast("Cannot Approve: Book has 0 copies available.", "error");
    return;
  }

  const commentsInput = document.getElementById(`comm-${reqSysId}`);
  const comments = commentsInput ? commentsInput.value.trim() : "";

  // 1. Transaction state changes
  req.u_status = "borrowed";
  req.u_approval_date = new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0];
  
  // Set due date to 14 days from approval
  const due = new Date();
  due.setDate(due.getDate() + 14);
  req.u_due_date = due.toISOString().split("T")[0];
  req.u_librarian_comments = comments || "Approved by Librarian.";

  // 2. Decrement book copies
  bookObj.u_available_copies -= 1;
  if (bookObj.u_available_copies === 0) {
    bookObj.u_status = "borrowed";
  }

  state.saveState();
  showToast(`Request Approved: ${req.number}. Book issued to student.`, "success");
  
  renderLibrarianPortal();
};

window.rejectRequest = function(reqSysId) {
  const req = state.requests.find(r => r.sys_id === reqSysId);
  if (!req) return;

  const commentsInput = document.getElementById(`comm-${reqSysId}`);
  const comments = commentsInput ? commentsInput.value.trim() : "";

  if (!comments) {
    showToast("Rejection requires a comment reason.", "error");
    if (commentsInput) commentsInput.focus();
    return;
  }

  // Transaction state changes
  req.u_status = "rejected";
  req.u_approval_date = new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0];
  req.u_librarian_comments = comments;

  state.saveState();
  showToast(`Request Rejected: ${req.number}. Student notified.`, "info");
  
  renderLibrarianPortal();
};

window.returnBook = function(reqSysId) {
  const req = state.requests.find(r => r.sys_id === reqSysId);
  if (!req) return;

  const bookObj = state.books.find(b => b.sys_id === req.u_book);
  if (!bookObj) return;

  // Transaction state changes
  req.u_status = "returned";
  req.u_return_date = new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0];

  // Increment book copies
  if (bookObj.u_available_copies >= bookObj.u_total_copies) {
    bookObj.u_available_copies = bookObj.u_total_copies;
  } else {
    bookObj.u_available_copies += 1;
  }
  bookObj.u_status = "available";

  state.saveState();
  showToast(`Book Returned: ${req.number} marked returned. Copies updated.`, "success");

  renderLibrarianPortal();
};

// Add Book Form Handler (with duplicate validation)
function handleAddBook(e) {
  e.preventDefault();

  const title = document.getElementById("book-title").value.trim();
  const author = document.getElementById("book-author").value.trim();
  const isbn = document.getElementById("book-isbn").value.trim();
  const category = document.getElementById("book-category").value;
  const publisher = document.getElementById("book-publisher").value.trim();
  const year = parseInt(document.getElementById("book-year").value, 10);
  const total = parseInt(document.getElementById("book-total").value, 10);
  const shelf = document.getElementById("book-shelf").value.trim();
  const desc = document.getElementById("book-desc").value.trim();

  // Validate duplicate ISBN
  const isDuplicate = state.books.some(b => b.u_isbn === isbn);
  if (isDuplicate) {
    showToast("Database Validation Block: A book with this ISBN already exists.", "error");
    return;
  }

  const newBook = {
    sys_id: "book_" + Date.now(),
    u_title: title,
    u_author: author,
    u_isbn: isbn,
    u_category: category,
    u_publisher: publisher || "Unknown Publisher",
    u_publication_year: year || null,
    u_total_copies: total,
    u_available_copies: total,
    u_shelf_location: shelf || "Not Assigned",
    u_status: "available",
    u_description: desc || "No description provided."
  };

  state.books.push(newBook);
  state.saveState();
  
  showToast(`Book '${title}' successfully added to catalog.`, "success");
  
  addBookForm.reset();
  renderLibrarianPortal();
}

// Scheduled job trigger (simulating ServiceNow scheduled daemon script)
function runOverdueScheduledJob() {
  showToast("Running CheckOverdueRequests daemon script...", "info");
  
  setTimeout(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let itemsMarkedOverdue = 0;
    let itemsReminded = 0;

    state.requests.forEach(req => {
      // 1. Mark overdue
      if (req.u_status === "borrowed" && req.u_due_date) {
        const dueDate = new Date(req.u_due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          req.u_status = "overdue";
          itemsMarkedOverdue++;
        }
        
        // 2. Mock reminder if due date is exactly in 2 days
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 2) {
          itemsReminded++;
        }
      }
    });

    state.saveState();
    
    if (itemsMarkedOverdue > 0 || itemsReminded > 0) {
      showToast(`Job Completed. Marked Overdue: ${itemsMarkedOverdue}, Reminders Queued: ${itemsReminded}`, "success");
      renderLibrarianPortal();
    } else {
      showToast("Job Completed. No records required state transitions today.", "info");
    }
  }, 600);
}


// ==========================================================================
// MOCK REPORTS & CHARTS DRAWING
// ==========================================================================
function renderReports() {
  renderCategoryDonutReport();
  renderMostBorrowedReport();
}

function renderCategoryDonutReport() {
  const categories = {};
  state.books.forEach(b => {
    categories[b.u_category] = (categories[b.u_category] || 0) + 1;
  });

  const donut = document.getElementById("category-donut-chart");
  const legend = document.getElementById("category-legend");

  // Colors mapping matching css variables
  const colorMap = {
    fiction: "#6366f1",
    non_fiction: "#3b82f6",
    science: "#10b981",
    history: "#f59e0b",
    technology: "#8b5cf6",
    biography: "#ec4899",
    reference: "#6b7280"
  };

  const labelsMap = {
    fiction: "Fiction",
    non_fiction: "Non-Fiction",
    science: "Science",
    history: "History",
    technology: "Technology",
    biography: "Biography",
    reference: "Reference"
  };

  // Re-draw conic gradient percentages
  let currentPercentage = 0;
  const conicParts = [];
  const entries = Object.entries(categories);
  const totalCount = state.books.length;

  entries.forEach(([cat, val]) => {
    const pct = (val / totalCount) * 100;
    const start = currentPercentage;
    const end = start + pct;
    const color = colorMap[cat] || "#cbd5e1";
    conicParts.push(`${color} ${start}% ${end}%`);
    currentPercentage = end;
  });

  donut.style.background = `conic-gradient(${conicParts.join(", ")})`;
  donut.innerHTML = `
    <div class="donut-center-label">
      <span class="num">${totalCount}</span>
      <span class="lbl">Books</span>
    </div>
  `;

  // Draw Legend
  legend.innerHTML = "";
  entries.forEach(([cat, val]) => {
    const color = colorMap[cat] || "#cbd5e1";
    const label = labelsMap[cat] || cat;
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <span class="legend-dot" style="background-color: ${color}"></span>
      <span>${label} (${val})</span>
    `;
    legend.appendChild(item);
  });
}

function renderMostBorrowedReport() {
  // Aggregate borrow counts per book title
  const bookCounts = {};
  state.requests.forEach(req => {
    const bookObj = state.books.find(b => b.sys_id === req.u_book);
    if (bookObj) {
      bookCounts[bookObj.u_title] = (bookCounts[bookObj.u_title] || 0) + 1;
    }
  });

  const chart = document.getElementById("most-borrowed-chart");
  chart.innerHTML = "";

  // Sort and pick top 5
  const sorted = Object.entries(bookCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

  if (sorted.length === 0) {
    chart.innerHTML = `<div style="text-align:center; padding: 2rem; color:var(--text-muted);">No checkout history to analyze.</div>`;
    return;
  }

  const maxVal = Math.max(...sorted.map(s => s[1]));

  sorted.forEach(([title, val]) => {
    const widthPercent = (val / maxVal) * 100;
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="bar-lbl" title="${title}">${title}</div>
      <div class="bar-track">
        <div class="bar-fill" data-width="${widthPercent}%" style="width: 0%"></div>
      </div>
      <div class="bar-val">${val}</div>
    `;
    chart.appendChild(row);
  });

  // If reports panel is currently visible, trigger animation
  const activeReport = document.querySelector(".report-tab-btn.active").getAttribute("data-report");
  if (activeReport === "most-borrowed") {
    setTimeout(animateBarChart, 50);
  }
}

function animateBarChart() {
  document.querySelectorAll(".bar-fill").forEach(bar => {
    const targetWidth = bar.getAttribute("data-width");
    bar.style.width = targetWidth;
  });
}
