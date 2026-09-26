// Comprehensive mock catalog for academic book exchange

export const INITIAL_BOOKS = [
  {
    id: "book-1",
    title: "Concepts of Physics (Vol 1 & 2 Set)",
    author: "Dr. H.C. Verma",
    category: "JEE / Physics",
    originalMrp: 850,
    coinPrice: 190,
    conditionGrade: "Like New",
    conditionScore: 95,
    conditionBreakdown: {
      binding: "98% Intact, Perfect Spine",
      cover: "95% Crisp edges, No creases",
      pages: "99% Clean, No highlighters",
      yellowing: "0% Pure White Pages"
    },
    edition: "2024 Revised Edition",
    isbn: "978-8177091878",
    campus: "IIT Delhi",
    lockerLocation: "Central Library Smart Locker - Bay A2",
    seller: {
      id: "user-rohan",
      name: "Rohan Verma",
      college: "IIT Delhi - Mechanical Engg",
      year: "3rd Year",
      rating: 4.95,
      exchanges: 24,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Both Vol 1 and Vol 2 in pristine condition. Zero pencil markings or pen underlines. Used for 4 months during JEE Advanced prep. Includes formula reference sheet.",
    highlightTags: ["Unmarked Pages", "Formula Sheet Included", "Instant Locker Pickup"],
    dateListed: "3 hours ago",
    status: "available",
    demandLevel: "Very High"
  },
  {
    id: "book-2",
    title: "Introduction to Algorithms (CLRS 4th Ed)",
    author: "Cormen, Leiserson, Rivest, Stein",
    category: "Computer Science",
    originalMrp: 1899,
    coinPrice: 320,
    conditionGrade: "Good",
    conditionScore: 88,
    conditionBreakdown: {
      binding: "92% Solid Hardcover",
      cover: "88% Minor shelf edge wear",
      pages: "90% Light pencil notes on DP chapter",
      yellowing: "5% Slight natural age"
    },
    edition: "4th Global Edition (MIT Press)",
    isbn: "978-0262046305",
    campus: "IIT Delhi",
    lockerLocation: "Bharti Building CS Hub - Locker #11",
    seller: {
      id: "user-kabir",
      name: "Kabir Mehta",
      college: "IIT Delhi - Computer Science",
      year: "4th Year",
      rating: 4.9,
      exchanges: 31,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Standard algorithmic textbook for CS Core courses. Hardcover edition with tight binding. Essential for DSA & competitive coding interviews.",
    highlightTags: ["Hardcover Global Ed", "Verified AI Scan", "Top Rated Seller"],
    dateListed: "Yesterday",
    status: "available",
    demandLevel: "High"
  },
  {
    id: "book-3",
    title: "Organic Chemistry",
    author: "Morrison & Boyd / Bhattacharjee",
    category: "JEE / Chemistry",
    originalMrp: 995,
    coinPrice: 210,
    conditionGrade: "Good",
    conditionScore: 86,
    conditionBreakdown: {
      binding: "90% Firm paperback",
      cover: "85% Laminated cover in good shape",
      pages: "86% Minimal pencil marginalia",
      yellowing: "10% Standard paper tone"
    },
    edition: "7th Edition (Pearson)",
    isbn: "978-8131704813",
    campus: "IIT Bombay",
    lockerLocation: "Main Gate Student Hub - Bay 04",
    seller: {
      id: "user-priya",
      name: "Priya Patel",
      college: "IIT Bombay - Chemical Engg",
      year: "2nd Year",
      rating: 4.88,
      exchanges: 14,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80"
    ],
    description: "The definitive guide to organic reaction mechanisms. Crystal clear reaction maps. Laminated front cover protects against laboratory spills.",
    highlightTags: ["Laminated Cover", "Mechanism Summaries", "Fast Drop-off"],
    dateListed: "2 days ago",
    status: "available",
    demandLevel: "High"
  },
  {
    id: "book-4",
    title: "Gray's Anatomy for Students",
    author: "Richard Drake, A. Wayne Vogl",
    category: "Medical",
    originalMrp: 3499,
    coinPrice: 450,
    conditionGrade: "Like New",
    conditionScore: 97,
    conditionBreakdown: {
      binding: "99% Spine flawless",
      cover: "98% Glossy intact cover",
      pages: "98% Full color plates spotless",
      yellowing: "0% Crisp coated paper"
    },
    edition: "4th South Asia Edition",
    isbn: "978-8131255650",
    campus: "AIIMS Delhi",
    lockerLocation: "Hostel 3 Common Room Hub - Locker #08",
    seller: {
      id: "user-ananya",
      name: "Dr. Ananya Sen",
      college: "AIIMS Delhi - MBBS Intern",
      year: "Intern",
      rating: 5.0,
      exchanges: 42,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Gold standard medical textbook. Full-color anatomical illustrations in mint state. Kept carefully in plastic wrap throughout 1st year.",
    highlightTags: ["Full Color Plates", "Mint Condition", "AIIMS Verified"],
    dateListed: "5 hours ago",
    status: "available",
    demandLevel: "Extremely High"
  },
  {
    id: "book-5",
    title: "Principles of Microeconomics",
    author: "N. Gregory Mankiw",
    category: "Economics / Management",
    originalMrp: 899,
    coinPrice: 160,
    conditionGrade: "Fair",
    conditionScore: 78,
    conditionBreakdown: {
      binding: "82% Sturdy spine",
      cover: "76% Noticeable edge creases",
      pages: "78% Neat yellow highlighter on key concepts",
      yellowing: "15% Moderate page tone"
    },
    edition: "8th Edition (Cengage)",
    isbn: "978-1305585126",
    campus: "Delhi University",
    lockerLocation: "SRCC Gate 2 Locker Bank - Box 03",
    seller: {
      id: "user-tanvi",
      name: "Tanvi Saxena",
      college: "SRCC, Delhi University - Economics",
      year: "2nd Year",
      rating: 4.85,
      exchanges: 19,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Crucial for DU eco honors or foundational microeconomics. Highlights are cleanly done on exam-relevant definitions and diagrams.",
    highlightTags: ["Key Topics Highlighted", "Budget Friendly", "DU North Campus"],
    dateListed: "3 days ago",
    status: "available",
    demandLevel: "Medium"
  },
  {
    id: "book-6",
    title: "NCERT Complete Class 12 Science Pack",
    author: "NCERT Editorial Board",
    category: "School / CBSE",
    originalMrp: 680,
    coinPrice: 110,
    conditionGrade: "Good",
    conditionScore: 89,
    conditionBreakdown: {
      binding: "92% Paperback solid",
      cover: "88% Clean lamination",
      pages: "90% Very light pencil checkmarks",
      yellowing: "2% White NCERT stock"
    },
    edition: "2024-25 Latest Syllabus",
    isbn: "978-8174508126",
    campus: "BITS Pilani",
    lockerLocation: "Student Activity Center (SAC) - Locker #19",
    seller: {
      id: "user-sameer",
      name: "Sameer Joshi",
      college: "BITS Pilani - CS & MSc Physics",
      year: "1st Year",
      rating: 4.92,
      exchanges: 8,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Includes Physics Part 1 & 2, Chemistry Part 1 & 2, and Mathematics Part 1 & 2. Essential for CBSE Boards and baseline JEE/NEET theory.",
    highlightTags: ["Complete 6-Book Set", "Latest Syllabus", "Instant Pickup"],
    dateListed: "Yesterday",
    status: "available",
    demandLevel: "Very High"
  },
  {
    id: "book-7",
    title: "Signals and Systems (2nd Edition)",
    author: "Alan V. Oppenheim, Alan S. Willsky",
    category: "Engineering",
    originalMrp: 1250,
    coinPrice: 240,
    conditionGrade: "Like New",
    conditionScore: 94,
    conditionBreakdown: {
      binding: "96% Strong spine",
      cover: "95% Crisp corner edges",
      pages: "96% Pristine white text pages",
      yellowing: "1% Barely noticeable"
    },
    edition: "2nd Edition (Prentice Hall)",
    isbn: "978-0138147570",
    campus: "IIT Delhi",
    lockerLocation: "Electrical Dept Block 2 - Locker #05",
    seller: {
      id: "user-arjun",
      name: "Arjun Sharma",
      college: "IIT Delhi - Computer Science",
      year: "4th Year",
      rating: 4.9,
      exchanges: 12,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Classic authoritative book on continuous and discrete-time signals, Fourier transforms, and Laplace domains. Spotless condition.",
    highlightTags: ["EE & CS Core", "No Markings", "IIT Delhi Verified"],
    dateListed: "4 hours ago",
    status: "available",
    demandLevel: "High"
  },
  {
    id: "book-8",
    title: "Problems in General Physics",
    author: "I.E. Irodov",
    category: "JEE / Physics",
    originalMrp: 450,
    coinPrice: 95,
    conditionGrade: "Good",
    conditionScore: 87,
    conditionBreakdown: {
      binding: "88% Compact paperback",
      cover: "86% Normal shelf handling",
      pages: "90% Very clean problem statements",
      yellowing: "8% Natural newsprint grain"
    },
    edition: "Classic CBS Publishers Edition",
    isbn: "978-8123906232",
    campus: "BITS Pilani",
    lockerLocation: "Library Smart Locker #22",
    seller: {
      id: "user-sameer",
      name: "Sameer Joshi",
      college: "BITS Pilani - CS & MSc Physics",
      year: "1st Year",
      rating: 4.92,
      exchanges: 8,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Legendary advanced problem book for Olympiad and top-1000 JEE rank aspirants. Clean text with all 1,877 problems intact.",
    highlightTags: ["Olympiad Level", "Unsolved Challenges Clean", "Low Coin Cost"],
    dateListed: "4 days ago",
    status: "available",
    demandLevel: "Medium"
  }
];

// Presets for the 1-Click AI Test Fill in List a Book flow
export const DEMO_LISTING_PRESETS = [
  {
    title: "Engineering Mechanics: Statics & Dynamics",
    author: "R.C. Hibbeler",
    category: "Engineering",
    edition: "14th SI Units Edition",
    originalMrp: 980,
    courseCode: "APL100 / ENGMEC",
    detectedScore: 93,
    detectedGrade: "Like New",
    confidence: "98.4%",
    calculatedCoins: 195,
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop&q=80"
    ],
    ocrFindings: [
      "Title match: Hibbeler Statics & Dynamics (14th Ed)",
      "Binding check: Spine intact, no page separation",
      "Surface scan: Cover clean, zero coffee or water stains",
      "Marginalia check: 99.2% unmarked page surface"
    ]
  },
  {
    title: "Fundamentals of Database Systems",
    author: "Elmasri & Navathe",
    category: "Computer Science",
    edition: "7th Edition (Pearson)",
    originalMrp: 875,
    courseCode: "COL362 / CS302",
    detectedScore: 89,
    detectedGrade: "Good",
    confidence: "96.8%",
    calculatedCoins: 165,
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
    ],
    ocrFindings: [
      "Title match: Elmasri Navathe DBMS (7th Ed)",
      "Binding check: Solid paperback binding",
      "Surface scan: Light shelf scuffs on rear cover",
      "Marginalia check: Mild pencil markings on SQL normalization chapter"
    ]
  },
  {
    title: "Modern Approach to Chemical Calculations",
    author: "R.C. Mukherjee",
    category: "JEE / Chemistry",
    edition: "2023 Edition",
    originalMrp: 495,
    courseCode: "JEE-CHEM",
    detectedScore: 84,
    detectedGrade: "Good",
    confidence: "95.1%",
    calculatedCoins: 105,
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80"
    ],
    ocrFindings: [
      "Title match: R.C. Mukherjee Mole Concept (CBS)",
      "Binding check: Firm, all pages secure",
      "Surface scan: Clean exterior",
      "Marginalia check: Neat tick marks on solved numericals"
    ]
  }
];

export const DEMO_USERS = [
  {
    id: "user-arjun",
    name: "Arjun Sharma",
    email: "arjun.sharma@cse.iitd.ac.in",
    campus: "IIT Delhi",
    department: "Computer Science & Engineering",
    year: "4th Year Undergraduate",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    trustScore: 4.95,
    verifiedStudent: true,
    studentId: "2021CS10842",
    joinedDate: "August 2023",
    preferredLockerHub: "Central Library Smart Locker Point (Hub A)"
  },
  {
    id: "user-priya",
    name: "Priya Patel",
    email: "priya.patel@aiims.edu",
    campus: "AIIMS Delhi",
    department: "MBBS",
    year: "3rd Year Clinical",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    trustScore: 4.9,
    verifiedStudent: true,
    studentId: "2022MED104",
    joinedDate: "January 2024",
    preferredLockerHub: "Hostel 3 Common Room Hub (Hub B)"
  },
  {
    id: "user-rohan",
    name: "Rohan Verma",
    email: "rohan.v@pilani.bits-pilani.ac.in",
    campus: "BITS Pilani",
    department: "Mechanical Engineering",
    year: "2nd Year",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    trustScore: 4.88,
    verifiedStudent: true,
    studentId: "2023A4PS0482P",
    joinedDate: "October 2023",
    preferredLockerHub: "Student Activity Center (SAC Hub)"
  }
];

export const CAMPUS_HUBS = [
  {
    id: "hub-iitd-lib",
    campus: "IIT Delhi",
    name: "Central Library Smart Locker - Bay A & B",
    address: "Main Campus Ground Floor, North Gate corridor",
    lockersTotal: 48,
    lockersAvailable: 19,
    hours: "Open 24/7 with Student RFID / QR Pass",
    pinCode: "110016"
  },
  {
    id: "hub-iitd-bharti",
    campus: "IIT Delhi",
    name: "Bharti CS Building Drop Point",
    address: "Department of Computer Science 1st Floor Foyer",
    lockersTotal: 24,
    lockersAvailable: 7,
    hours: "07:00 AM - 11:00 PM",
    pinCode: "110016"
  },
  {
    id: "hub-aiims-h3",
    campus: "AIIMS Delhi",
    name: "Hostel 3 & Medical Commons Locker Hub",
    address: "Ansari Nagar East, Student Recreation Area",
    lockersTotal: 36,
    lockersAvailable: 14,
    hours: "Open 24/7 with Student ID",
    pinCode: "110029"
  },
  {
    id: "hub-bits-sac",
    campus: "BITS Pilani",
    name: "Student Activity Center (SAC) Locker Vault",
    address: "Vidya Vihar Campus, Ground Floor East Wing",
    lockersTotal: 40,
    lockersAvailable: 22,
    hours: "06:00 AM - Midnight",
    pinCode: "333031"
  },
  {
    id: "hub-du-srcc",
    campus: "Delhi University",
    name: "SRCC North Campus Smart Station",
    address: "Maurice Nagar, Near Library Lawns",
    lockersTotal: 32,
    lockersAvailable: 11,
    hours: "08:00 AM - 09:00 PM",
    pinCode: "110007"
  },
  {
    id: "hub-iitb-gate",
    campus: "IIT Bombay",
    name: "Main Gate Student Exchange Kiosk",
    address: "Powai Campus, Student Hub 1",
    lockersTotal: 50,
    lockersAvailable: 28,
    hours: "Open 24/7",
    pinCode: "400076"
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "tx-101",
    type: "credit",
    category: "Book Listed (AI Verified)",
    description: "Listed 'Signals and Systems (2nd Ed)' by Oppenheim",
    amount: 140,
    date: "Sep 02, 2026 • 02:40 PM",
    referenceId: "LST-88410",
    status: "Completed"
  },
  {
    id: "tx-102",
    type: "credit",
    category: "Campus Referral Bonus",
    description: "Referred Priya Patel (AIIMS Delhi)",
    amount: 50,
    date: "Aug 29, 2026 • 11:15 AM",
    referenceId: "REF-40912",
    status: "Completed"
  },
  {
    id: "tx-103",
    type: "debit",
    category: "Book Redeemed",
    description: "Claimed 'Database System Concepts' by Silberschatz",
    amount: -120,
    date: "Aug 25, 2026 • 04:20 PM",
    referenceId: "RDM-71203",
    status: "Completed",
    pickupLocker: "IIT Delhi Central Library - Box #09"
  },
  {
    id: "tx-104",
    type: "credit",
    category: "Welcome Grant",
    description: "Initial Academic Onboarding Bonus",
    amount: 210,
    date: "Aug 10, 2026 • 10:00 AM",
    referenceId: "ONB-00192",
    status: "Completed"
  }
];
