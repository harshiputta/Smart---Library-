/**
 * Fix Script: PopulateSampleData
 * Description: Seeds the Book (u_book) table with high-quality sample books across multiple categories.
 */
(function() {
    gs.info("LMS: Starting PopulateSampleData Fix Script.");

    var sampleBooks = [
        {
            title: "Introduction to Algorithms",
            author: "Thomas H. Cormen",
            isbn: "9780262033848",
            category: "technology",
            publisher: "MIT Press",
            pub_year: 2009,
            total_copies: 5,
            avail_copies: 5,
            shelf: "Aisle 1, Rack A",
            desc: "The standard textbook on algorithms, covering sorting, data structures, graph algorithms, and more."
        },
        {
            title: "Clean Code: A Handbook of Agile Software Craftsmanship",
            author: "Robert C. Martin",
            isbn: "9780132350884",
            category: "technology",
            publisher: "Prentice Hall",
            pub_year: 2008,
            total_copies: 3,
            avail_copies: 3,
            shelf: "Aisle 1, Rack B",
            desc: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees."
        },
        {
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            isbn: "9780446310789",
            category: "fiction",
            publisher: "Grand Central Publishing",
            pub_year: 1988,
            total_copies: 4,
            avail_copies: 4,
            shelf: "Aisle 2, Rack A",
            desc: "Compassionate, dramatic, and deeply moving, To Kill A Mockingbird takes readers to the roots of human behavior."
        },
        {
            title: "A Brief History of Time",
            author: "Stephen Hawking",
            isbn: "9780553380163",
            category: "science",
            publisher: "Bantam Books",
            pub_year: 1998,
            total_copies: 2,
            avail_copies: 2,
            shelf: "Aisle 3, Rack C",
            desc: "A landmark volume in science writing by one of the great minds of our time, exploring the origins of the universe."
        },
        {
            title: "Sapiens: A Brief History of Humankind",
            author: "Yuval Noah Harari",
            isbn: "9780062316097",
            category: "history",
            publisher: "Harper",
            pub_year: 2015,
            total_copies: 6,
            avail_copies: 6,
            shelf: "Aisle 4, Rack D",
            desc: "Sapiens integrates history and science to reconsider common narratives, connect past developments with contemporary concerns."
        },
        {
            title: "Steve Jobs",
            author: "Walter Isaacson",
            isbn: "9781451648539",
            category: "biography",
            publisher: "Simon & Schuster",
            pub_year: 2011,
            total_copies: 2,
            avail_copies: 1, // Let's seed with 1 checked out for test cases
            shelf: "Aisle 5, Rack A",
            desc: "The exclusive biography of Steve Jobs, based on more than forty interviews with Jobs conducted over two years."
        },
        {
            title: "Encyclopædia Britannica",
            author: "Britannica Editors",
            isbn: "9781593392925",
            category: "reference",
            publisher: "Encyclopædia Britannica, Inc.",
            pub_year: 2010,
            total_copies: 1,
            avail_copies: 1,
            shelf: "Reference Section Desk",
            desc: "For library use only. Standard reference compilation of general knowledge."
        }
    ];

    var insertedCount = 0;
    var updatedCount = 0;

    for (var i = 0; i < sampleBooks.length; i++) {
        var book = sampleBooks[i];
        
        var bookGR = new GlideRecord('u_book');
        bookGR.addQuery('u_isbn', book.isbn);
        bookGR.query();

        if (bookGR.next()) {
            // Book already exists, update details to ensure clean mock state
            bookGR.setValue('u_title', book.title);
            bookGR.setValue('u_author', book.author);
            bookGR.setValue('u_category', book.category);
            bookGR.setValue('u_publisher', book.publisher);
            bookGR.setValue('u_publication_year', book.pub_year);
            bookGR.setValue('u_total_copies', book.total_copies);
            bookGR.setValue('u_available_copies', book.avail_copies);
            bookGR.setValue('u_shelf_location', book.shelf);
            bookGR.setValue('u_description', book.desc);
            bookGR.setValue('u_status', book.avail_copies > 0 ? 'available' : 'borrowed');
            bookGR.update();
            updatedCount++;
        } else {
            // Insert new book
            bookGR.initialize();
            bookGR.setValue('u_title', book.title);
            bookGR.setValue('u_author', book.author);
            bookGR.setValue('u_isbn', book.isbn);
            bookGR.setValue('u_category', book.category);
            bookGR.setValue('u_publisher', book.publisher);
            bookGR.setValue('u_publication_year', book.pub_year);
            bookGR.setValue('u_total_copies', book.total_copies);
            bookGR.setValue('u_available_copies', book.avail_copies);
            bookGR.setValue('u_shelf_location', book.shelf);
            bookGR.setValue('u_description', book.desc);
            bookGR.setValue('u_status', book.avail_copies > 0 ? 'available' : 'borrowed');
            bookGR.insert();
            insertedCount++;
        }
    }

    gs.info("LMS: Sample data population complete. Inserted: " + insertedCount + ", Updated: " + updatedCount);
})();
