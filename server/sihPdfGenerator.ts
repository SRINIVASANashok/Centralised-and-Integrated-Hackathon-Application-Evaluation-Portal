// ==============================================================================
// SRM IST Tiruchirappalli SIH Internal Hackathon - PDF Generator Utility
// Generates standards-compliant PDF 1.4 documents for SIH templates & submissions
// ==============================================================================

interface SlideContent {
  title: string;
  subtitle?: string;
  lines: string[];
}

export function buildMultiPagePdf(slides: SlideContent[], headerTitle: string = 'SRM IST TIRUCHIRAPPALLI · YUVA MEGA-THON'): Buffer {
  const FONT_REGULAR_ID = 3;
  const FONT_BOLD_ID = 4;
  
  let currentId = 5;
  const pageObjIds: number[] = [];
  const contentAndPageObjs: string[] = [];

  slides.forEach((slide, idx) => {
    const contentId = currentId++;
    const pageId = currentId++;
    pageObjIds.push(pageId);

    // Construct text stream
    let stream = 'BT\n';
    
    // Header Banner
    stream += `/F2 10 Tf\n50 750 Td\n(${escapePdfText(headerTitle)}) Tj\n`;
    stream += `0 -14 Td /F1 8 Tf (ACM · IET · IEEE STB60221343 Student Chapter · StarTech) Tj\n`;
    
    // Slide Number & Title
    stream += `0 -28 Td /F2 16 Tf (SLIDE ${idx + 1}: ${escapePdfText(slide.title.toUpperCase())}) Tj\n`;
    
    if (slide.subtitle) {
      stream += `0 -18 Td /F1 11 Tf (${escapePdfText(slide.subtitle)}) Tj\n`;
    }

    // Divider gap
    stream += `0 -20 Td\n`;

    // Content lines
    slide.lines.forEach((line) => {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
      const font = isBullet ? '/F1 10 Tf' : '/F1 10.5 Tf';
      stream += `${font} (${escapePdfText(line)}) Tj\n0 -18 Td\n`;
    });

    // Footer on each slide
    stream += `0 -30 Td /F1 8 Tf (@ YUVA MEGA-THON Submission Template · SRM IST Tiruchirappalli) Tj\n`;
    stream += 'ET';

    const streamLen = Buffer.byteLength(stream, 'utf8');
    contentAndPageObjs.push(`${contentId} 0 obj << /Length ${streamLen} >> stream\n${stream}\nendstream\nendobj`);
    contentAndPageObjs.push(
      `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${FONT_REGULAR_ID} 0 R /F2 ${FONT_BOLD_ID} 0 R >> >> >> endobj`
    );
  });

  const fontRegular = '3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj';
  const fontBold = '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj';
  const pagesObj = `2 0 obj << /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >> endobj`;
  const catalogObj = '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj';

  const allObjs = [catalogObj, pagesObj, fontRegular, fontBold, ...contentAndPageObjs];

  let header = '%PDF-1.4\n';
  let body = '';
  let xref = `xref\n0 ${allObjs.length + 1}\n0000000000 65535 f \n`;
  let offset = Buffer.byteLength(header, 'utf8');

  allObjs.forEach((obj, idx) => {
    xref += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    const str = obj + '\n';
    body += str;
    offset += Buffer.byteLength(str, 'utf8');
  });

  const startxref = offset;
  const trailer = `trailer << /Size ${allObjs.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return Buffer.from(header + body + xref + trailer, 'utf8');
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Keep printable ASCII for standard Type 1 Helvetica
}

// Generate the official 12-slide template provided by user
export function generateOfficialSIHTemplatePdf(): Buffer {
  const slides: SlideContent[] = [
    {
      title: 'Team Details & Track Details',
      subtitle: 'Slide 1: Team Structure and Chosen Problem Statement Track',
      lines: [
        'Team Details:',
        '  • Team Name: [Enter Your Team Name]',
        '  • Team Members: [Name 1 (Lead), Name 2, Name 3, Name 4, Name 5, Name 6]',
        '  • College / Organization: SRM Institute of Science and Technology, Tiruchirappalli Campus',
        '  • Team Leader / Contact: [Email & Contact Number]',
        '',
        'Track Details:',
        '  • Track Name: [e.g. Smart Education, Agriculture, Healthcare, Smart Automation]',
        '  • Problem Statement: [Problem Statement ID & Official Title]',
      ],
    },
    {
      title: 'Problem Statement',
      subtitle: 'Slide 2: Contextualizing the Core Challenge',
      lines: [
        'What problem are you trying to solve?',
        '  • Clear, factual definition of the target real-world operational problem.',
        '',
        'Who faces this problem?',
        '  • Impacted stakeholders, end-users, organizations, or demographic groups.',
        '',
        'Why is this problem important?',
        '  • Scale of the issue, economic/social costs of current inefficiencies.',
      ],
    },
    {
      title: 'Proposed Solution',
      subtitle: 'Slide 3: High-Level Innovation Architecture',
      lines: [
        'Briefly describe your solution:',
        '  • Concrete explanation of how your system addresses the root problem.',
        '',
        'How does it solve the identified problem?',
        '  • Step-by-step workflow from problem input to successful resolution.',
        '  • Distinct advantage over existing status-quo workflows.',
      ],
    },
    {
      title: 'Innovation / Uniqueness',
      subtitle: 'Slide 4: Key Differentiators and Competitive Edge',
      lines: [
        'What is new or different about your idea?',
        '  • Novel technical integration, algorithm, design, or business model.',
        '',
        'How is it better than existing solutions?',
        '  • Quantitative comparison (speed, accuracy, cost-reduction, ease of adoption).',
        '  • Intellectual property / patent potential if applicable.',
      ],
    },
    {
      title: 'Target Users',
      subtitle: 'Slide 5: User Personas and Deployment Beneficiaries',
      lines: [
        'Who will use the solution?',
        '  • Primary Users (e.g. students, hospital staff, field technicians, farmers).',
        '  • Secondary Users / Administrators (e.g. supervisors, analytics teams).',
        '  • Institutional Beneficiaries (e.g. government bodies, enterprise partners).',
      ],
    },
    {
      title: 'Key Features',
      subtitle: 'Slide 6: Core System Capabilities (3-6 Major Features)',
      lines: [
        'Feature 1: Real-time telemetry / data ingestion pipeline',
        'Feature 2: Automated edge-inference and decision logic',
        'Feature 3: Role-based multi-tier institutional dashboard',
        'Feature 4: Resilient offline synchronization with cloud backend',
        'Feature 5: Secure tamper-evident audit trail & notification dispatcher',
      ],
    },
    {
      title: 'Technology / Tech Stack',
      subtitle: 'Slide 7: Technical Architecture and Tooling',
      lines: [
        '• Programming Languages: TypeScript, Python, C++',
        '• Frameworks & Libraries: React, Node.js, FastAPI, PyTorch',
        '• AI/ML Models: Custom CNN / Transformer-based classification',
        '• APIs & Integrations: RESTful APIs, WebSockets, Supabase / PostgreSQL',
        '• Cloud & Platforms: Docker, Cloud Run, AWS / GCP',
        '• Hardware Components (if applicable): ESP32, Raspberry Pi, LoRa sensors',
      ],
    },
    {
      title: 'Implementation Plan',
      subtitle: 'Slide 8: Hackathon Sprint Roadmap and MVP Scope',
      lines: [
        'How will you build it during the hackathon?',
        '  • Phase 1 (Hours 0-6): Environment setup, schema design, base API build',
        '  • Phase 2 (Hours 6-18): Core model training / hardware firmware / frontend integration',
        '  • Phase 3 (Hours 18-30): End-to-end testing, error boundary hardening, latency optimization',
        '  • Phase 4 (Hours 30-36): Live demonstration preparation and deployment',
        '',
        'What will be the Minimum Viable Prototype (MVP)?',
        '  • Functional end-to-end demonstration running on test dataset/devices.',
      ],
    },
    {
      title: 'Expected Impact',
      subtitle: 'Slide 9: Measurable Benefits and Value Creation',
      lines: [
        'What benefit will the solution provide?',
        '  • Social Impact: Empowerment of underserved communities and improved access.',
        '  • Economic Impact: Estimated 40% reduction in diagnostic turnaround time.',
        '  • Educational / Technical Impact: Reusable open-source baseline for institutional labs.',
      ],
    },
    {
      title: 'Feasibility & Viability',
      subtitle: 'Slide 10: Technical Feasibility and Risk Mitigation',
      lines: [
        'Can the solution realistically be built during the hackathon?',
        '  • Yes: Pre-identified open-source models, verified API documentation, modular team roles.',
        '',
        'Any major dependencies or limitations?',
        '  • Dependency: Stable internet connectivity for cloud inference.',
        '  • Limitation: Initial prototype calibrated for regional dataset baseline.',
      ],
    },
    {
      title: 'Prototype / References (Optional)',
      subtitle: 'Slide 11: Artifacts, Wireframes, and Research Citations',
      lines: [
        '• Figma UI Prototype: https://figma.com/@srm-yuva-demo',
        '• GitHub Repository: https://github.com/srmist-trchy-sih/mvp-proto',
        '• Architecture Diagram: Client <-> Edge Gateway <-> PostgreSQL DB',
        '• Reference Papers: IEEE Access / ACM Digital Library publications',
      ],
    },
    {
      title: 'One-Line Pitch',
      subtitle: 'Slide 12: High-Impact Summary Statement',
      lines: [
        '"An intelligent, offline-capable institutional surveillance and analytics system',
        'engineered to empower regional operators with real-time automated decision intelligence."',
        '',
        'Official Submission for SRM IST Tiruchirappalli SIH Internal Hackathon 2026',
        'End of Presentation Slide Deck',
      ],
    },
  ];

  return buildMultiPagePdf(slides, 'SRM IST TIRUCHIRAPPALLI · SIH INTERNAL HACKATHON TEMPLATE');
}

// Generate a realistic seed idea proposal PDF
export function generateSampleIdeaPdf(
  ideaTitle: string,
  teamName: string,
  studentName: string,
  regNo: string,
  psId: string,
  psTitle: string,
  department: string
): Buffer {
  const slides: SlideContent[] = [
    {
      title: 'Team Details & Track Details',
      subtitle: 'Slide 1: Team Structure & Challenge ID',
      lines: [
        `Team Name: ${teamName}`,
        `Team Lead: ${studentName} (${regNo})`,
        `Department: ${department} · SRM IST Tiruchirappalli`,
        `Problem Statement ID: ${psId}`,
        `Problem Statement Title: ${psTitle}`,
      ],
    },
    {
      title: 'Problem Statement & Need Analysis',
      subtitle: 'Slide 2: The Core Challenge',
      lines: [
        `Title: ${ideaTitle}`,
        'Context: Rural and regional institutions face significant diagnostic latencies.',
        'Affected Groups: Field operators, primary healthcare centers, agricultural cooperatives.',
        'Significance: Early detection reduces operational losses by up to 65%.',
      ],
    },
    {
      title: 'Proposed Solution Architecture',
      subtitle: 'Slide 3: High Level Workflow',
      lines: [
        '• Lightweight Mobile-first application for zero-latency localized input capture.',
        '• Server-side accelerated pipeline delivering sub-second classification.',
        '• Role-based administrative triage portal for automated assignment to specialists.',
      ],
    },
    {
      title: 'Innovation & Key Features',
      subtitle: 'Slide 4: Technical Differentiators',
      lines: [
        '• 98.4% validation accuracy on benchmark datasets.',
        '• Zero requirement for costly proprietary hardware; operates on commodity smartphones.',
        '• End-to-end encrypted cryptographic audit log for all status changes.',
      ],
    },
    {
      title: 'Implementation & Tech Stack',
      subtitle: 'Slide 5: Tools & Architecture',
      lines: [
        '• Frontend: React 19, TypeScript, Tailwind CSS',
        '• Backend: Node.js, Express, Supabase PostgreSQL with RLS',
        '• Processing: ONNX Runtime, Python FastAPI service',
      ],
    },
    {
      title: 'One-Line Pitch & Feasibility',
      subtitle: 'Slide 6: Conclusion & Impact',
      lines: [
        `"${ideaTitle}: Transforming institutional efficiency through edge-native automation."`,
        'Feasibility: Prototype core completed and verified during internal sprint.',
        'Respectfully submitted to SRM IST Internal Screening Committee.',
      ],
    },
  ];

  return buildMultiPagePdf(slides, `SRM IST SIH 2026 · ${teamName.toUpperCase()}`);
}
