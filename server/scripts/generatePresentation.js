import pptxgen from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Team Avengers';
  pptx.company = 'Kalasalingam Academy of Research and Education';
  pptx.title = 'FinFlow - Expense & Budget Management Platform';

  const BG_COLOR = '0B0F19';
  const CARD_BG = '131B2E';
  const ACCENT_RED = 'F43F5E';
  const ACCENT_CYAN = '38BDF8';
  const TEXT_WHITE = 'F8FAFC';
  const TEXT_MUTED = '94A3B8';
  const BORDER_COLOR = '1E293B';

  const addHeader = (slide, title, subtitle, slideNum) => {
    slide.addText(
      [
        { text: title.toUpperCase() + '\n', options: { fontSize: 10, bold: true, color: ACCENT_RED, tracking: 2 } },
        { text: subtitle, options: { fontSize: 20, bold: true, color: TEXT_WHITE } },
      ],
      { x: 0.8, y: 0.5, w: 10, h: 0.9, margin: 0 }
    );
    if (slideNum) {
      slide.addText(slideNum, {
        x: 11.5,
        y: 0.5,
        w: 1.5,
        h: 0.4,
        align: 'right',
        fontSize: 11,
        color: TEXT_MUTED,
        bold: true,
      });
    }
  };

  // ==========================================
  // SLIDE 1: Title Slide
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addText(
      [
        { text: 'FINAL YEAR PROJECT PRESENTATION\n', options: { fontSize: 13, bold: true, color: ACCENT_RED, tracking: 2 } },
        { text: 'KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION\n', options: { fontSize: 14, bold: true, color: TEXT_MUTED } },
      ],
      { x: 1.0, y: 1.2, w: 11.3, h: 0.8, margin: 0 }
    );

    slide.addText(
      [
        { text: 'FinFlow\n', options: { fontSize: 48, bold: true, color: TEXT_WHITE } },
        { text: 'A smarter view of everyday money.\n', options: { fontSize: 22, italic: true, color: ACCENT_CYAN } },
        { text: 'Expense & Budget Management Platform', options: { fontSize: 16, color: TEXT_MUTED } },
      ],
      { x: 1.0, y: 2.3, w: 11.3, h: 2.2, margin: 0 }
    );

    // Metadata card
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 1.0,
      y: 5.2,
      w: 11.3,
      h: 1.4,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });

    slide.addText(
      [
        { text: 'TEAM AVENGERS  •  CSE (ARTIFICIAL INTELLIGENCE & ML)\n', options: { fontSize: 12, bold: true, color: ACCENT_RED } },
        { text: 'Deployed Live at: ', options: { fontSize: 11, color: TEXT_MUTED } },
        { text: 'https://fineflow-finance.onrender.com/', options: { fontSize: 11, bold: true, color: ACCENT_CYAN, hyperlink: { url: 'https://fineflow-finance.onrender.com/' } } },
      ],
      { x: 1.3, y: 5.4, w: 10.7, h: 1.0, margin: 0 }
    );
  }

  // ==========================================
  // SLIDE 2: Team Members
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'Project Team', 'Team Details — Team Avengers', '02/12');

    const teamData = [
      [
        { text: 'NAME', options: { bold: true, color: TEXT_WHITE, fill: { color: ACCENT_RED } } },
        { text: 'REGISTRATION NUMBER', options: { bold: true, color: TEXT_WHITE, fill: { color: ACCENT_RED } } },
        { text: 'PROJECT RESPONSIBILITY', options: { bold: true, color: TEXT_WHITE, fill: { color: ACCENT_RED } } },
      ],
      [
        { text: 'P. Nithees Kumar', options: { color: TEXT_WHITE } },
        { text: '99230041158', options: { color: ACCENT_CYAN } },
        { text: 'Frontend & Dashboard Development', options: { color: TEXT_MUTED } },
      ],
      [
        { text: 'E. Sujay', options: { color: TEXT_WHITE } },
        { text: '99230041188', options: { color: ACCENT_CYAN } },
        { text: 'Backend API & Controller Architecture', options: { color: TEXT_MUTED } },
      ],
      [
        { text: 'Trishav Supolia', options: { color: TEXT_WHITE } },
        { text: '99230041203', options: { color: ACCENT_CYAN } },
        { text: 'Database Models & Data Validation', options: { color: TEXT_MUTED } },
      ],
      [
        { text: 'Sujitha Mary P', options: { color: TEXT_WHITE } },
        { text: '99230041132', options: { color: ACCENT_CYAN } },
        { text: 'Authentication & OTP Security Integration', options: { color: TEXT_MUTED } },
      ],
      [
        { text: 'Jelci Antoniya A', options: { color: TEXT_WHITE } },
        { text: '99230041114', options: { color: ACCENT_CYAN } },
        { text: 'Quality Assurance, Testing & Documentation', options: { color: TEXT_MUTED } },
      ],
    ];

    slide.addTable(teamData, {
      x: 1.0,
      y: 1.8,
      w: 11.3,
      h: 4.8,
      fill: { color: CARD_BG },
      border: { pt: 1, color: BORDER_COLOR },
      fontSize: 13,
      align: 'left',
      valign: 'middle',
      autoPage: false,
    });
  }

  // ==========================================
  // SLIDE 3: Problem Statement & Objectives
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'Why FinFlow', 'Problem Statement & Objectives', '03/12');

    // Left Box: Problem
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 1.0,
      y: 1.7,
      w: 5.4,
      h: 4.9,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('THE PROBLEM', { x: 1.4, y: 2.0, w: 4.6, h: 0.5, fontSize: 16, bold: true, color: ACCENT_RED });
    slide.addText(
      '• Manual expense tracking is tedious and error-prone.\n\n' +
      '• Personal financial records remain scattered across multiple channels.\n\n' +
      '• Repeated balance calculations consume significant time.\n\n' +
      '• Spending patterns are difficult to interpret without charts.\n\n' +
      '• Monthly budget limits are easily breached without notifications.',
      { x: 1.4, y: 2.7, w: 4.6, h: 3.5, fontSize: 13, color: TEXT_MUTED, lineSpacing: 22 }
    );

    // Right Box: Objectives
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 6.9,
      y: 1.7,
      w: 5.4,
      h: 4.9,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('PROJECT OBJECTIVES', { x: 7.3, y: 2.0, w: 4.6, h: 0.5, fontSize: 16, bold: true, color: ACCENT_CYAN });
    slide.addText(
      '• Digitize all income and expense records into one unified vault.\n\n' +
      '• Automate financial math: Net Worth, Savings Rate, Cash Flow.\n\n' +
      '• Track category-wise budgets with real-time visual health alerts.\n\n' +
      '• Visualize financial activities with interactive analytics charts.\n\n' +
      '• Empower users to achieve long-term wealth and savings targets.',
      { x: 7.3, y: 2.7, w: 4.6, h: 3.5, fontSize: 13, color: TEXT_WHITE, lineSpacing: 22 }
    );
  }

  // ==========================================
  // SLIDE 4: Technology Stack
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'Implementation', 'Technology Stack (MERN Architecture)', '04/12');

    const techCards = [
      { title: 'FRONTEND', color: '38BDF8', items: 'React 18  •  Vite\nTailwind CSS  •  Lucide Icons\nAxios Client  •  Recharts\nDual Themes (Luxury Dark / Light)' },
      { title: 'BACKEND', color: '10B981', items: 'Node.js runtime\nExpress.js REST API\nModular MVC Pattern\nNodemailer & Fast2SMS' },
      { title: 'DATABASE', color: 'F59E0B', items: 'MongoDB Atlas Cloud\nMongoose ODM\n1-Hour TTL Auto-Cleanup\nIndexed Sparse Queries' },
      { title: 'SECURITY', color: 'F43F5E', items: 'JWT Token + HttpOnly Cookies\nbcryptjs Password Hashing\nSHA-256 Hashed OTPs\nRate Limiting & Helmet' },
    ];

    techCards.forEach((card, idx) => {
      const x = 1.0 + idx * 2.9;
      slide.addShape(pptx.shapes.RECTANGLE, {
        x,
        y: 1.8,
        w: 2.65,
        h: 4.8,
        fill: { color: CARD_BG },
        line: { color: BORDER_COLOR, width: 1 },
      });
      slide.addText(card.title, { x: x + 0.2, y: 2.2, w: 2.25, h: 0.5, fontSize: 15, bold: true, color: card.color });
      slide.addText(card.items, { x: x + 0.2, y: 3.0, w: 2.25, h: 3.2, fontSize: 12, color: TEXT_MUTED, lineSpacing: 22 });
    });
  }

  // ==========================================
  // SLIDE 5: System Architecture & Workflow
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'How It Works', 'System Architecture & Data Workflow', '05/12');

    const steps = [
      { step: '1', title: 'User Input', desc: 'Browser client captures user actions, authentication credentials, and financial entries.' },
      { step: '2', title: 'API Request', desc: 'Secure Axios client dispatches authenticated JSON payload with JWT tokens.' },
      { step: '3', title: 'Controller & Service', desc: 'Express controllers validate inputs and run calculation algorithms (Net Worth, Savings Rate).' },
      { step: '4', title: 'Mongoose & MongoDB', desc: 'Atomic database persistence, schema validation, and TTL lifecycle management.' },
      { step: '5', title: 'Live Dashboard', desc: 'Processed data returns in milliseconds to render real-time charts and summaries.' },
    ];

    steps.forEach((s, idx) => {
      const y = 1.8 + idx * 0.95;
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 1.0,
        y,
        w: 11.3,
        h: 0.8,
        fill: { color: CARD_BG },
        line: { color: BORDER_COLOR, width: 1 },
      });
      slide.addShape(pptx.shapes.OVAL, {
        x: 1.2,
        y: y + 0.15,
        w: 0.5,
        h: 0.5,
        fill: { color: ACCENT_RED },
      });
      slide.addText(s.step, { x: 1.2, y: y + 0.15, w: 0.5, h: 0.5, align: 'center', valign: 'middle', bold: true, color: TEXT_WHITE });
      slide.addText(s.title, { x: 1.9, y: y + 0.15, w: 2.5, h: 0.5, bold: true, fontSize: 13, color: ACCENT_CYAN, valign: 'middle' });
      slide.addText(s.desc, { x: 4.5, y: y + 0.15, w: 7.5, h: 0.5, fontSize: 11, color: TEXT_MUTED, valign: 'middle' });
    });
  }

  // ==========================================
  // SLIDE 6: Authentication & Dashboard
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'Core Modules', 'Authentication & Executive Dashboard', '06/12');

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 1.0,
      y: 1.8,
      w: 5.4,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('AUTHENTICATION MODULE', { x: 1.3, y: 2.1, w: 4.8, h: 0.4, fontSize: 15, bold: true, color: ACCENT_RED });
    slide.addText(
      '• Dual Login: Standard Email/Password + Mobile OTP Login.\n\n' +
      '• Registration OTP Verification: 6-digit codes sent via real Gmail SMTP and Fast2SMS.\n\n' +
      '• PendingRegistration Challenge: Eliminates ghost users with 1-hour auto-expiring TTL.\n\n' +
      '• Password Security: 5-point OWASP complexity validation + bcryptjs salt hashing.\n\n' +
      '• Password Reset: Self-serve recovery via email magic link or mobile passcode.',
      { x: 1.3, y: 2.7, w: 4.8, h: 3.6, fontSize: 12, color: TEXT_MUTED, lineSpacing: 20 }
    );

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 6.9,
      y: 1.8,
      w: 5.4,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('DASHBOARD MODULE', { x: 7.2, y: 2.1, w: 4.8, h: 0.4, fontSize: 15, bold: true, color: ACCENT_CYAN });
    slide.addText(
      '• Net Worth Velocity: Total assets minus liabilities calculated dynamically.\n\n' +
      '• Monthly Cash Flow: Income vs. Expense bar charts rendered with Recharts.\n\n' +
      '• Expense Breakdown: Interactive donut chart grouped by category (Food, Housing, etc.).\n\n' +
      '• Savings Rate Health Meter: Tracks savings percentage against benchmarks.\n\n' +
      '• Quick Account Selector: Seamless switching across Banking, Savings, & Credit cards.',
      { x: 7.2, y: 2.7, w: 4.8, h: 3.6, fontSize: 12, color: TEXT_WHITE, lineSpacing: 20 }
    );
  }

  // ==========================================
  // SLIDE 7: Transactions & Budget Management
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'Money Operations', 'Transactions & Budget Management', '07/12');

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 1.0,
      y: 1.8,
      w: 5.4,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('TRANSACTION LEDGER', { x: 1.3, y: 2.1, w: 4.8, h: 0.4, fontSize: 15, bold: true, color: ACCENT_RED });
    slide.addText(
      '• Supports Income, Expense, and Account-to-Account Transfers.\n\n' +
      '• Live Multi-Field Search: Filter instantly by payee, note, or tag.\n\n' +
      '• Categorized Ledger: Dropdowns with color-coded category badges.\n\n' +
      '• Pagination & Sorting: Optimized server pagination for 10,000+ entries.\n\n' +
      '• Authenticated CSV Export: Blob download with search query preservation.',
      { x: 1.3, y: 2.7, w: 4.8, h: 3.6, fontSize: 12, color: TEXT_MUTED, lineSpacing: 20 }
    );

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 6.9,
      y: 1.8,
      w: 5.4,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('ENVELOPE BUDGETS', { x: 7.2, y: 2.1, w: 4.8, h: 0.4, fontSize: 15, bold: true, color: ACCENT_CYAN });
    slide.addText(
      '• Category Budgets: Set monthly spending caps per envelope.\n\n' +
      '• Planned vs. Actual: Automatic aggregation of all expenses in the month.\n\n' +
      '• Threshold-Based Visual Alerts:\n' +
      '   - Green: Healthy (< 70% utilized)\n' +
      '   - Amber: Warning (70% - 90% utilized)\n' +
      '   - Red: Exceeded limit alert (> 90% utilized)\n\n' +
      '• Rolling Periods: Resets automatically on the first day of each month.',
      { x: 7.2, y: 2.7, w: 4.8, h: 3.6, fontSize: 12, color: TEXT_WHITE, lineSpacing: 18 }
    );
  }

  // ==========================================
  // SLIDE 8: Savings Goals & Data Architecture
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'Planning & Data', 'Savings Goals and Data Models', '08/12');

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 1.0,
      y: 1.8,
      w: 5.4,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('SAVINGS GOALS & VAULTS', { x: 1.3, y: 2.1, w: 4.8, h: 0.4, fontSize: 15, bold: true, color: ACCENT_RED });
    slide.addText(
      '• Goal Targets: Define milestone name, target amount, and deadline.\n\n' +
      '• Incremental Contributions: Record deposits straight from income.\n\n' +
      '• Progress Visualizer: Percentage progress bars and remaining days calculation.\n\n' +
      '• Priority Tagging: Classify goals as High, Medium, or Low priority.\n\n' +
      '• Milestone Celebration: Visual celebration banner upon 100% completion.',
      { x: 1.3, y: 2.7, w: 4.8, h: 3.6, fontSize: 12, color: TEXT_MUTED, lineSpacing: 20 }
    );

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 6.9,
      y: 1.8,
      w: 5.4,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('MONGODB DATA MODELS', { x: 7.2, y: 2.1, w: 4.8, h: 0.4, fontSize: 15, bold: true, color: ACCENT_CYAN });
    slide.addText(
      '• User: email, mobileNumber, passwordHash, verified status, theme.\n\n' +
      '• PendingRegistration: TTL-indexed challenge for OTP verification.\n\n' +
      '• Otp: Hashed 6-digit codes with rate limits and 5-min expiry.\n\n' +
      '• Account: userId, name, type (bank, savings, credit), balance.\n\n' +
      '• Transaction: userId, accountId, type, amount, category, date.\n\n' +
      '• Budget: userId, category, monthlyLimit, period.\n\n' +
      '• Goal: userId, title, targetAmount, currentAmount, targetDate.',
      { x: 7.2, y: 2.7, w: 4.8, h: 3.6, fontSize: 11, color: TEXT_WHITE, lineSpacing: 16 }
    );
  }

  // ==========================================
  // SLIDE 9: Project Roles & Responsibilities
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'Team Execution', 'Project Roles & Responsibilities — Team Avengers', '09/12');

    const roles = [
      { name: 'P. Nithees Kumar (99230041158)', role: 'Frontend & Dashboard Development', desc: 'Crafted the responsive React 18 / Vite UI, interactive Recharts cash flow components, and Tailwind luxury styling.' },
      { name: 'E. Sujay (99230041188)', role: 'Backend API Development', desc: 'Engineered RESTful Express route controllers, transaction CRUD, budget aggregation engines, and error middleware.' },
      { name: 'Trishav Supolia (99230041203)', role: 'Database & Data Validation', desc: 'Designed MongoDB schemas, TTL auto-cleanup indexes, Mongoose models, and OWASP password validation algorithms.' },
      { name: 'Sujitha Mary P (99230041132)', role: 'Authentication & Module Integration', desc: 'Integrated dual Email/Mobile OTP delivery (Gmail SMTP / Fast2SMS), JWT sessions, and password recovery.' },
      { name: 'Jelci Antoniya A (99230041114)', role: 'Testing & Documentation', desc: 'Authored unit and integration test suites (Node.js test runner), CSV export validation, and system documentation.' },
    ];

    roles.forEach((r, idx) => {
      const y = 1.7 + idx * 0.98;
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 1.0,
        y,
        w: 11.3,
        h: 0.85,
        fill: { color: CARD_BG },
        line: { color: BORDER_COLOR, width: 1 },
      });
      slide.addText(r.name, { x: 1.2, y: y + 0.1, w: 3.8, h: 0.35, fontSize: 12, bold: true, color: ACCENT_RED });
      slide.addText(r.role, { x: 1.2, y: y + 0.45, w: 3.8, h: 0.35, fontSize: 10, color: ACCENT_CYAN });
      slide.addText(r.desc, { x: 5.2, y: y + 0.15, w: 6.8, h: 0.55, fontSize: 11, color: TEXT_MUTED });
    });
  }

  // ==========================================
  // SLIDE 10: Verification & Test Results
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'Verification', 'Testing & Mathematical Verification', '10/12');

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 1.0,
      y: 1.8,
      w: 5.4,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('AUTOMATED TEST SUITES', { x: 1.3, y: 2.1, w: 4.8, h: 0.4, fontSize: 15, bold: true, color: ACCENT_RED });
    slide.addText(
      '• 21 of 21 Automated Unit & Integration Tests Passing.\n\n' +
      '• Financial Calculation Service:\n' +
      '   - Verified savings rate formula: (Savings ÷ Income) × 100\n' +
      '   - Verified zero/negative income edge cases safely.\n' +
      '   - Verified Net Worth = Assets (₹75k) − Liabilities (₹5k) = ₹70k.\n\n' +
      '• Authentication Security Testing:\n' +
      '   - Password complexity rejects short / simple passwords.\n' +
      '   - Phone number E.164 normalization (+91).\n' +
      '   - Email privacy masking (t****0@gmail.com).\n' +
      '   - Provider rejection handling with no false success.',
      { x: 1.3, y: 2.7, w: 4.8, h: 3.6, fontSize: 12, color: TEXT_MUTED, lineSpacing: 18 }
    );

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 6.9,
      y: 1.8,
      w: 5.4,
      h: 4.8,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });
    slide.addText('VERIFIED RESULTS BENCHMARK', { x: 7.2, y: 2.1, w: 4.8, h: 0.4, fontSize: 15, bold: true, color: ACCENT_CYAN });

    const resultsTable = [
      [
        { text: 'METRIC', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'INPUT VALUE', options: { bold: true, color: TEXT_WHITE, fill: { color: '1E293B' } } },
        { text: 'VERIFIED RESULT', options: { bold: true, color: ACCENT_CYAN, fill: { color: '1E293B' } } },
      ],
      [{ text: 'Monthly Income', options: { color: TEXT_MUTED } }, { text: '₹48,500', options: { color: TEXT_WHITE } }, { text: 'Valid', options: { color: '10B981' } }],
      [{ text: 'Monthly Expenses', options: { color: TEXT_MUTED } }, { text: '₹18,200', options: { color: TEXT_WHITE } }, { text: 'Valid', options: { color: '10B981' } }],
      [{ text: 'Total Assets', options: { color: TEXT_MUTED } }, { text: '₹75,000', options: { color: TEXT_WHITE } }, { text: 'Verified', options: { color: '10B981' } }],
      [{ text: 'Total Liabilities', options: { color: TEXT_MUTED } }, { text: '₹5,000', options: { color: TEXT_WHITE } }, { text: 'Verified', options: { color: '10B981' } }],
      [{ text: 'Computed Net Worth', options: { bold: true, color: TEXT_WHITE } }, { text: '₹75k − ₹5k', options: { color: TEXT_WHITE } }, { text: '₹70,000', options: { bold: true, color: ACCENT_CYAN } }],
      [{ text: 'Calculated Savings Rate', options: { bold: true, color: TEXT_WHITE } }, { text: '₹6,500 ÷ ₹10,000', options: { color: TEXT_WHITE } }, { text: '65.0%', options: { bold: true, color: '10B981' } }],
    ];

    slide.addTable(resultsTable, {
      x: 7.2,
      y: 2.7,
      w: 4.8,
      h: 3.4,
      fill: { color: CARD_BG },
      border: { pt: 1, color: BORDER_COLOR },
      fontSize: 11,
      align: 'left',
      valign: 'middle',
    });
  }

  // ==========================================
  // SLIDE 11: Future Enhancements Roadmap
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };
    addHeader(slide, 'Next Steps', 'Proposed Future Roadmap', '11/12');

    const roadmaps = [
      { num: '01', title: 'Automated Budget Alerts', desc: 'Browser push notifications and SMS warning before category limits are breached.' },
      { num: '02', title: 'Machine Learning Analytics', desc: 'Predictive cash flow velocity and automated expense anomaly detection.' },
      { num: '03', title: 'Downloadable Financial Statements', desc: 'Generate executive PDF tax summaries and custom monthly financial audits.' },
      { num: '04', title: 'Open Banking API (Account Aggregator)', desc: 'Direct automated bank statement syncing via RBI Account Aggregator framework.' },
      { num: '05', title: 'Native Mobile App', desc: 'Dedicated React Native cross-platform app for iOS and Android devices.' },
      { num: '06', title: 'Smart Investment Recommendations', desc: 'Automated portfolio balancing tips based on spending behavior patterns.' },
    ];

    roadmaps.forEach((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 1.0 + col * 3.9;
      const y = 1.9 + row * 2.4;

      slide.addShape(pptx.shapes.RECTANGLE, {
        x,
        y,
        w: 3.6,
        h: 2.1,
        fill: { color: CARD_BG },
        line: { color: BORDER_COLOR, width: 1 },
      });

      slide.addText(item.num, { x: x + 0.2, y: y + 0.15, w: 0.8, h: 0.35, fontSize: 16, bold: true, color: ACCENT_RED });
      slide.addText(item.title, { x: x + 0.2, y: y + 0.6, w: 3.2, h: 0.45, fontSize: 13, bold: true, color: TEXT_WHITE });
      slide.addText(item.desc, { x: x + 0.2, y: y + 1.15, w: 3.2, h: 0.85, fontSize: 11, color: TEXT_MUTED });
    });
  }

  // ==========================================
  // SLIDE 12: Project Summary & Conclusion
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addText('PROJECT SUMMARY', { x: 1.0, y: 1.0, w: 11.3, h: 0.4, fontSize: 14, bold: true, color: ACCENT_RED, tracking: 2 });
    slide.addText('A Clearer Way to Manage Everyday Money.', { x: 1.0, y: 1.5, w: 11.3, h: 0.7, fontSize: 28, bold: true, color: TEXT_WHITE });

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 1.0,
      y: 2.4,
      w: 11.3,
      h: 2.4,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });

    slide.addText(
      '✓  Centralized Income, Expense & Multi-Account Tracking\n' +
      '✓  Automated Envelope Budgeting with Visual Health Alerts\n' +
      '✓  Real-Time Interactive Analytics & Net Worth Calculation\n' +
      '✓  Multi-Factor Security: Email OTP Verification + Mobile Login\n' +
      '✓  Production Deployed on Render with MongoDB Atlas Cloud',
      { x: 1.4, y: 2.6, w: 10.5, h: 2.0, fontSize: 14, color: ACCENT_CYAN, lineSpacing: 26, bold: true }
    );

    slide.addText(
      [
        { text: 'THANK YOU! — QUESTIONS & ANSWERS\n', options: { fontSize: 20, bold: true, color: ACCENT_RED } },
        { text: 'TEAM AVENGERS  •  KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION\n', options: { fontSize: 12, color: TEXT_WHITE } },
        { text: 'Live Website: ', options: { fontSize: 11, color: TEXT_MUTED } },
        { text: 'https://fineflow-finance.onrender.com/', options: { fontSize: 11, bold: true, color: ACCENT_CYAN, hyperlink: { url: 'https://fineflow-finance.onrender.com/' } } },
      ],
      { x: 1.0, y: 5.2, w: 11.3, h: 1.5, align: 'center', margin: 0 }
    );
  }

  const outputPath = path.join(__dirname, '../../docs/presentation/FinFlow_Final_Year_Presentation.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`[Presentation Generator] Successfully saved presentation to: ${outputPath}`);
}

generatePresentation().catch(console.error);
