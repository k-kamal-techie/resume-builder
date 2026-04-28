/**
 * Seed Kamal Kumar's Knowledge Base from portfolio data.
 * Run: npx tsx src/scripts/seed-kb.ts
 */
import mongoose from "mongoose";
import { config } from "dotenv";
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const KAMAL_EMAIL = "kamaldroxtar@gmail.com";

async function seed() {
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;

  // Find user by email
  const user = await db.collection("users").findOne({ email: KAMAL_EMAIL });
  if (!user) {
    console.error(`User with email ${KAMAL_EMAIL} not found. Sign in first.`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (${user._id})`);

  const knowledgeBase = {
    userId: user._id,
    profile: {
      fullName: "Kamal Kumar",
      headline: "Senior Developer & Technical Lead",
      email: KAMAL_EMAIL,
      phone: "+91 7023779667",
      location: "Bhopal, India",
      website: "",
      linkedin: "https://www.linkedin.com/in/kamaldroxtar",
      github: "https://github.com/k-kamal-techie",
      bio: "Seasoned Senior Developer and Technical Lead at Pabbly Connect, one of the leading workflow automation platforms processing millions of webhooks daily. Longest-serving developer on the product team with deep institutional knowledge spanning the full technology stack. Work sits at the intersection of full-stack development, agentic AI, DevOps, database engineering, and team leadership. Recently architected an agentic AI platform with a multi-provider Master Agent and a Firecracker-powered serverless platform replacing Cloudflare Workers at ~95% cost savings. Passionate about building systems that scale — not just in terms of traffic, but in terms of team capability.",
    },
    timeline: [
      {
        type: "education",
        title: "Bachelor of Technology (B.Tech) in Information Technology",
        organization: "Technocrats Institute of Technology, Bhopal",
        location: "Bhopal, India",
        startDate: "2017",
        endDate: "2021",
        current: false,
        description: "B.Tech in Information Technology",
        highlights: [],
        skills: [],
        metrics: [],
        tags: ["education", "btech", "it"],
      },
      {
        type: "role",
        title: "Senior Developer & Technical Lead",
        organization: "Pabbly Connect",
        location: "India",
        startDate: "2021",
        endDate: "",
        current: true,
        description:
          "Lead a development team in technical direction, mentoring, and process improvement. Architect and maintain high-throughput webhook processing pipeline handling millions of daily webhooks through OpenResty.",
        highlights: [
          "Architected webhook ingestion pipeline processing millions of daily webhooks",
          "Optimized PHP-FPM configuration achieving 3.3x increase in concurrent request handling (300 to 1,000 max_children)",
          "Managed and optimized database tables consuming 764GB+ storage with 50M+ records",
          "Led strategic migration from PHP CodeIgniter 4 monolith to Express.js + React",
          "Designed complex MongoDB schemas for AI-generated workflows with nested loops and routers",
          "Built AI Action Builder inside Pabbly Connect — auto-generates step configurations (HTTP calls, transforms, mappings) from natural-language prompts",
          "Built AI Workflow Generator for the classic Pabbly Connect workflow editor — turns plain-English requirements into fully wired workflows with triggers, actions, routers, and field mappings",
          "Architected Pabbly Agentic AI — a standalone Rust/Axum + React agentic platform with a Master Agent, multi-provider LLM routing (Anthropic, OpenAI, Google, xAI), credit-metered execution, and capability-gated bundled JS deployment",
          "Built functions.pabbly.com — a Firecracker microVM serverless platform replacing Cloudflare Workers / AWS Lambda at ~95% cost savings (€90/month Hetzner vs. €500–2000/month at 1M requests)",
          "Created comprehensive video training curriculum for entire tech stack (8+ modules)",
          "Conduct code reviews and establish coding standards across the team",
          "Lead incident response and root cause analysis for production issues",
          "Author technical announcements for Pabbly Connect community",
        ],
        skills: [
          "PHP", "CodeIgniter 4", "Node.js", "Express.js", "React.js",
          "MongoDB", "MySQL", "Redis", "OpenResty", "Nginx", "Lua",
          "AWS EC2", "Docker", "New Relic", "Team Leadership",
          "Rust", "Axum", "Python", "Flask", "Firecracker",
          "Anthropic API", "OpenAI API", "Agentic AI", "Master Agent Design",
          "Multi-Provider LLM Routing", "Tailwind CSS", "Vite",
        ],
        metrics: [
          { label: "Daily Webhooks Processed", value: "Millions" },
          { label: "Database Size Optimized", value: "764GB+" },
          { label: "Records Managed", value: "50M+" },
          { label: "Performance Boost", value: "3.3x" },
          { label: "Team Members Led", value: "5+" },
          { label: "Serverless Cost Savings", value: "~95%" },
          { label: "AI Products Shipped", value: "4+" },
        ],
        tags: ["leadership", "backend", "devops", "architecture", "ai", "agentic-ai", "current"],
      },
    ],
    skills: [
      // Backend
      { name: "PHP", category: "Backend", proficiency: 95, yearsOfExperience: 4, tags: ["backend", "codeigniter"] },
      { name: "CodeIgniter 4", category: "Backend", proficiency: 95, yearsOfExperience: 4, tags: ["backend", "php"] },
      { name: "Node.js", category: "Backend", proficiency: 90, yearsOfExperience: 3, tags: ["backend", "javascript"] },
      { name: "Express.js", category: "Backend", proficiency: 90, yearsOfExperience: 3, tags: ["backend", "node"] },
      { name: "REST API Design", category: "Backend", proficiency: 95, yearsOfExperience: 4, tags: ["backend", "api"] },
      { name: "OAuth 2.0", category: "Backend", proficiency: 85, yearsOfExperience: 3, tags: ["auth", "security"] },
      { name: "Microservices", category: "Backend", proficiency: 90, yearsOfExperience: 3, tags: ["architecture"] },
      { name: "Rust", category: "Backend", proficiency: 80, yearsOfExperience: 1, tags: ["backend", "systems"] },
      { name: "Axum (Rust)", category: "Backend", proficiency: 80, yearsOfExperience: 1, tags: ["backend", "rust"] },
      { name: "Python", category: "Backend", proficiency: 85, yearsOfExperience: 4, tags: ["backend", "python"] },
      { name: "Flask", category: "Backend", proficiency: 85, yearsOfExperience: 2, tags: ["backend", "python"] },
      // Frontend
      { name: "React.js", category: "Frontend", proficiency: 90, yearsOfExperience: 3, tags: ["frontend", "javascript"] },
      { name: "JavaScript", category: "Frontend", proficiency: 95, yearsOfExperience: 5, tags: ["frontend", "core"] },
      { name: "HTML5", category: "Frontend", proficiency: 95, yearsOfExperience: 5, tags: ["frontend"] },
      { name: "CSS3", category: "Frontend", proficiency: 90, yearsOfExperience: 5, tags: ["frontend"] },
      { name: "Tailwind CSS", category: "Frontend", proficiency: 90, yearsOfExperience: 2, tags: ["frontend", "css"] },
      { name: "Vite", category: "Frontend", proficiency: 85, yearsOfExperience: 2, tags: ["frontend", "build"] },
      // Databases
      { name: "MongoDB", category: "Databases", proficiency: 95, yearsOfExperience: 4, tags: ["database", "nosql"] },
      { name: "MySQL / MariaDB", category: "Databases", proficiency: 90, yearsOfExperience: 4, tags: ["database", "sql"] },
      { name: "Redis", category: "Databases", proficiency: 90, yearsOfExperience: 3, tags: ["database", "cache"] },
      { name: "AWS RDS", category: "Databases", proficiency: 85, yearsOfExperience: 3, tags: ["database", "cloud"] },
      // Web Servers
      { name: "OpenResty", category: "Web Servers", proficiency: 90, yearsOfExperience: 3, tags: ["server", "nginx"] },
      { name: "Nginx", category: "Web Servers", proficiency: 90, yearsOfExperience: 4, tags: ["server"] },
      { name: "Lua Scripting", category: "Web Servers", proficiency: 85, yearsOfExperience: 3, tags: ["scripting"] },
      // DevOps
      { name: "AWS EC2", category: "DevOps", proficiency: 90, yearsOfExperience: 3, tags: ["cloud", "infrastructure"] },
      { name: "Docker", category: "DevOps", proficiency: 90, yearsOfExperience: 3, tags: ["containers"] },
      { name: "Docker Compose", category: "DevOps", proficiency: 90, yearsOfExperience: 3, tags: ["containers"] },
      { name: "CI/CD Pipelines", category: "DevOps", proficiency: 85, yearsOfExperience: 3, tags: ["automation"] },
      { name: "PHP-FPM", category: "DevOps", proficiency: 90, yearsOfExperience: 4, tags: ["server"] },
      { name: "Cloudflare", category: "DevOps", proficiency: 80, yearsOfExperience: 3, tags: ["cdn", "security"] },
      { name: "Firecracker microVMs", category: "DevOps", proficiency: 85, yearsOfExperience: 1, tags: ["virtualization", "sandbox"] },
      { name: "Serverless Architecture", category: "DevOps", proficiency: 85, yearsOfExperience: 2, tags: ["faas", "architecture"] },
      { name: "Hetzner Bare Metal", category: "DevOps", proficiency: 80, yearsOfExperience: 1, tags: ["infrastructure", "cost"] },
      { name: "Multi-tenant SaaS", category: "DevOps", proficiency: 90, yearsOfExperience: 3, tags: ["saas", "architecture"] },
      // AI & ML
      { name: "AI / LLM Integration", category: "AI & ML", proficiency: 90, yearsOfExperience: 2, tags: ["ai"] },
      { name: "Agentic AI / Multi-Agent Systems", category: "AI & ML", proficiency: 90, yearsOfExperience: 2, tags: ["ai", "agents"] },
      { name: "LLM Tool Use / Function Calling", category: "AI & ML", proficiency: 90, yearsOfExperience: 2, tags: ["ai", "tools"] },
      { name: "Anthropic Claude API", category: "AI & ML", proficiency: 90, yearsOfExperience: 2, tags: ["ai", "anthropic"] },
      { name: "OpenAI API", category: "AI & ML", proficiency: 85, yearsOfExperience: 2, tags: ["ai", "openai"] },
      { name: "Google Gemini API", category: "AI & ML", proficiency: 80, yearsOfExperience: 1, tags: ["ai", "google"] },
      { name: "xAI Grok API", category: "AI & ML", proficiency: 75, yearsOfExperience: 1, tags: ["ai", "xai"] },
      { name: "Multi-Provider LLM Routing", category: "AI & ML", proficiency: 90, yearsOfExperience: 2, tags: ["ai", "architecture"] },
      { name: "Prompt Engineering", category: "AI & ML", proficiency: 90, yearsOfExperience: 2, tags: ["ai", "prompts"] },
      { name: "Master Agent / Orchestration Design", category: "AI & ML", proficiency: 90, yearsOfExperience: 2, tags: ["ai", "agents"] },
      { name: "Vector Embeddings", category: "AI & ML", proficiency: 85, yearsOfExperience: 1, tags: ["ai", "ml"] },
      { name: "FAISS", category: "AI & ML", proficiency: 80, yearsOfExperience: 1, tags: ["ai", "search"] },
      { name: "Semantic Search", category: "AI & ML", proficiency: 80, yearsOfExperience: 1, tags: ["ai", "search"] },
      { name: "RAG", category: "AI & ML", proficiency: 80, yearsOfExperience: 1, tags: ["ai"] },
      // Monitoring
      { name: "New Relic", category: "Monitoring", proficiency: 85, yearsOfExperience: 3, tags: ["monitoring", "apm"] },
      { name: "Log Management", category: "Monitoring", proficiency: 90, yearsOfExperience: 4, tags: ["monitoring"] },
      // Tools
      { name: "Git", category: "Tools", proficiency: 95, yearsOfExperience: 5, tags: ["vcs"] },
      { name: "GitHub", category: "Tools", proficiency: 90, yearsOfExperience: 5, tags: ["vcs"] },
      { name: "VS Code", category: "Tools", proficiency: 95, yearsOfExperience: 5, tags: ["ide"] },
      // Soft Skills
      { name: "Team Leadership", category: "Soft Skills", proficiency: 90, yearsOfExperience: 3, tags: ["leadership"] },
      { name: "Code Reviews", category: "Soft Skills", proficiency: 95, yearsOfExperience: 4, tags: ["quality"] },
      { name: "Technical Mentoring", category: "Soft Skills", proficiency: 90, yearsOfExperience: 3, tags: ["leadership"] },
      { name: "Architecture Design", category: "Soft Skills", proficiency: 90, yearsOfExperience: 3, tags: ["architecture"] },
    ],
    projects: [
      {
        name: "Full-Stack Platform Migration",
        description: "Led strategic migration from PHP CodeIgniter 4 monolith to Express.js + React. Designed phased controller-by-controller migration methodology. Created comprehensive migration guides for parallel team development.",
        role: "Technical Lead",
        technologies: ["PHP", "CodeIgniter 4", "Express.js", "React.js", "MongoDB"],
        url: "https://connect.pabbly.com",
        startDate: "2023",
        endDate: "",
        highlights: [
          "Designed phased controller-by-controller migration methodology",
          "Created comprehensive migration guides for parallel team development",
          "Zero-downtime migration with backward compatibility",
        ],
        metrics: [],
        tags: ["migration", "architecture", "leadership"],
      },
      {
        name: "High-Throughput Webhook Processing Pipeline",
        description: "Architected webhook ingestion pipeline processing millions of daily webhooks through OpenResty with Lua-based filtering and Redis async queue processing.",
        role: "Architect",
        technologies: ["OpenResty", "Lua", "Redis", "Nginx", "PHP"],
        url: "",
        startDate: "2022",
        endDate: "",
        highlights: [
          "Implemented Lua-based webhook filtering and validation",
          "Asynchronous queue processing via Redis",
          "Sub-second response times under massive traffic spikes",
        ],
        metrics: [
          { label: "Daily Webhooks", value: "Millions" },
          { label: "Response Time", value: "Sub-second" },
        ],
        tags: ["performance", "infrastructure", "scale"],
      },
      {
        name: "Database Performance Optimization",
        description: "Diagnosed and resolved critical RDS performance issues. Implemented connection pooling, query optimization, and strategic indexing for tables consuming 764GB+ storage.",
        role: "Lead Developer",
        technologies: ["MySQL", "MariaDB", "AWS RDS", "MongoDB"],
        url: "",
        startDate: "2022",
        endDate: "2023",
        highlights: [
          "Resolved critical RDS performance bottlenecks",
          "Implemented connection pooling strategies",
          "Query optimization and strategic indexing",
        ],
        metrics: [
          { label: "Storage Managed", value: "764GB+" },
          { label: "Records", value: "50M+" },
        ],
        tags: ["database", "performance", "optimization"],
      },
      {
        name: "Server Infrastructure Optimization",
        description: "Scaled PHP-FPM max_children from 300 to 1,000 on m6i.8xlarge EC2 instances (32 vCPUs, 128GB RAM) with progressive scaling and comprehensive monitoring.",
        role: "DevOps Lead",
        technologies: ["PHP-FPM", "AWS EC2", "New Relic", "Nginx"],
        url: "",
        startDate: "2023",
        endDate: "2023",
        highlights: [
          "3.3x increase in concurrent request handling",
          "Progressive scaling with comprehensive monitoring",
          "Optimized m6i.8xlarge instances (32 vCPUs, 128GB RAM)",
        ],
        metrics: [{ label: "Performance Boost", value: "3.3x" }],
        tags: ["devops", "performance", "infrastructure"],
      },
      {
        name: "AI-Driven Workflow Generation",
        description: "Designed complex MongoDB schemas for AI-generated workflows supporting arbitrary nesting of loops and routers. Foundational work enabling the platform's AI features.",
        role: "Schema Architect",
        technologies: ["MongoDB", "AI/LLM", "Node.js"],
        url: "",
        startDate: "2024",
        endDate: "",
        highlights: [
          "Complex schema supporting arbitrary nesting of loops and routers",
          "Foundation for platform AI features",
        ],
        metrics: [],
        tags: ["ai", "database", "architecture"],
      },
      {
        name: "Developer Training Program",
        description: "Created comprehensive video training curriculum for entire tech stack. Designed 8+ training modules with scripts, code examples, and documentation.",
        role: "Training Lead",
        technologies: [],
        url: "",
        startDate: "2023",
        endDate: "",
        highlights: [
          "8+ training modules covering full tech stack",
          "Reduced new developer onboarding time",
          "Reduced dependency on senior engineers",
        ],
        metrics: [{ label: "Training Modules", value: "8+" }],
        tags: ["leadership", "mentoring", "knowledge-transfer"],
      },
      {
        name: "Production Log Management System",
        description: "Resolved critical 114GB access log accumulation issue with multi-layered log rotation strategies and conditional logging for high-traffic endpoints.",
        role: "DevOps Engineer",
        technologies: ["Nginx", "Shell Scripting", "Linux"],
        url: "",
        startDate: "2023",
        endDate: "2023",
        highlights: [
          "Resolved 114GB log accumulation issue",
          "Multi-layered log rotation strategies",
          "Hourly size-based rotation policies",
        ],
        metrics: [{ label: "Logs Resolved", value: "114GB" }],
        tags: ["devops", "monitoring", "infrastructure"],
      },
      {
        name: "Pabbly Connect — AI Action Builder",
        description:
          "AI-powered action builder inside Pabbly Connect that auto-generates step configurations (HTTP calls, transforms, field mappings) from natural-language prompts. Built into the classic workflow editor to dramatically reduce setup time for non-technical users.",
        role: "Lead Developer",
        technologies: ["Node.js", "Express.js", "MongoDB", "Anthropic API", "React.js"],
        url: "https://connect.pabbly.com",
        startDate: "2024",
        endDate: "",
        highlights: [
          "Natural-language → structured step configuration",
          "Schema-aware generation against Pabbly's connector catalog",
          "Inline validation and auto-correction of generated configs",
        ],
        metrics: [],
        tags: ["ai", "product", "workflow"],
      },
      {
        name: "Pabbly Connect — AI Workflow Generator (Classic)",
        description:
          "Conversational workflow generator that turns plain-English requirements into a fully wired Pabbly Connect workflow — including triggers, actions, routers, and field mappings against the platform's app catalog.",
        role: "Lead Developer",
        technologies: ["Node.js", "Express.js", "MongoDB", "Anthropic API", "JSON Schema"],
        url: "https://connect.pabbly.com",
        startDate: "2024",
        endDate: "",
        highlights: [
          "Schema-driven generation from plain-English specs",
          "Mapping inference across triggers, actions, and routers",
          "Validation against connector specs before persistence",
        ],
        metrics: [],
        tags: ["ai", "workflow", "generation"],
      },
      {
        name: "Pabbly Agentic AI — Master Agent Platform",
        description:
          "Standalone agentic AI platform where non-technical users build multi-step AI workflows by chatting with a Master Agent. Each step has its own LLM, system prompt, tools, and credentials. Workflows trigger via webhooks and execute steps sequentially with native function calling and credit-metered execution.",
        role: "Architect / Lead Developer",
        technologies: [
          "Rust", "Axum", "MongoDB", "React", "Vite", "Tailwind CSS",
          "Anthropic API", "OpenAI API", "Google Gemini API", "xAI Grok API",
          "JWT", "AES-256-GCM",
        ],
        url: "",
        startDate: "2024",
        endDate: "",
        highlights: [
          "Native function-calling agentic loop (25-iteration cap) with multi-provider tool schema adapters (Anthropic / OpenAI / Google)",
          "4-step API key resolution: custom match → BYOK → custom fallback → platform",
          "Capability-gated bundled JS deployment — emits only the helpers each agent uses (~500 → ~110 lines)",
          "Credit system in milli-credits with atomic deduction and BYOK bypass",
          "Encrypted agent memory (AES-256-GCM) for stored credentials",
          "Verification-first Master Agent that tests credentials with real calls before marking steps ready",
        ],
        metrics: [
          { label: "LLM Providers Supported", value: "5+" },
          { label: "Agentic Loop Cap", value: "25 iters" },
        ],
        tags: ["ai", "agents", "rust", "architecture"],
      },
      {
        name: "Pabbly Functions — Firecracker Serverless Platform",
        description:
          "Self-hosted Cloudflare Workers / AWS Lambda alternative powered by Firecracker microVMs. Multi-tenant organizations with role-based permissions, function versioning, rollback, and full invocation history. ~95% cost savings vs. mainstream FaaS providers.",
        role: "Architect / Lead Developer",
        technologies: [
          "Python", "Flask", "MongoDB", "React 19", "Vite 8", "Tailwind CSS 4",
          "Firecracker", "Node.js", "bcrypt", "JWT",
        ],
        url: "https://functions.pabbly.com",
        startDate: "2024",
        endDate: "",
        highlights: [
          "Firecracker microVM warm pool (kernel 5.10.245) for cold-start-free execution of Node.js and Python",
          "Multi-tenant organizations with owner/admin/developer/viewer roles and granular per-module permissions",
          "Function versioning, rollback, and full invocation history",
          "Google SSO + JWT auth, SMTP-based invites with auto-accept on signup, X-API-Key for external clients",
          "Strict org-scoped isolation (all queries scoped by organization_id)",
          "~95% cost savings vs. Cloudflare Workers / AWS Lambda at 1M+ requests/month",
        ],
        metrics: [
          { label: "1M req/mo cost", value: "€90" },
          { label: "10M req/mo cost", value: "€90–180" },
          { label: "Cost vs CF Workers", value: "~95% savings" },
        ],
        tags: ["serverless", "faas", "firecracker", "cost-optimization", "multi-tenant"],
      },
    ],
    achievements: [
      {
        title: "3.3x Server Performance Improvement",
        description: "Scaled PHP-FPM from 300 to 1,000 concurrent connections on m6i.8xlarge EC2 instances.",
        date: "2023",
        issuer: "Pabbly Connect",
        tags: ["performance", "devops"],
      },
      {
        title: "764GB+ Database Optimization",
        description: "Managed and optimized massive database tables with 50M+ records while maintaining performance.",
        date: "2022",
        issuer: "Pabbly Connect",
        tags: ["database", "optimization"],
      },
      {
        title: "Longest-Serving Developer",
        description: "Longest-serving developer on Pabbly Connect product team with deep institutional knowledge.",
        issuer: "Pabbly Connect",
        tags: ["tenure", "leadership"],
      },
      {
        title: "Developer Training Curriculum Creator",
        description: "Designed and created 8+ comprehensive training modules enabling faster team onboarding.",
        date: "2023",
        issuer: "Pabbly Connect",
        tags: ["leadership", "mentoring"],
      },
      {
        title: "Architected Pabbly Agentic AI Platform",
        description:
          "Designed and led development of a Rust/Axum + React agentic AI platform with a Master Agent, multi-provider LLM routing, capability-gated bundled JS deployment, and credit-metered execution.",
        date: "2024",
        issuer: "Pabbly",
        tags: ["ai", "agentic-ai", "architecture"],
      },
      {
        title: "Built Pabbly Functions — ~95% Serverless Cost Savings",
        description:
          "Architected and shipped functions.pabbly.com, a Firecracker-powered serverless platform replacing Cloudflare Workers / AWS Lambda at roughly 95% cost reduction (€90/month at 1M requests vs. €500–2000/month).",
        date: "2024",
        issuer: "Pabbly",
        url: "https://functions.pabbly.com",
        tags: ["serverless", "firecracker", "cost-optimization"],
      },
      {
        title: "Shipped AI Action Builder & AI Workflow Generator",
        description:
          "Designed and built two AI products inside Pabbly Connect — the AI Action Builder (auto-generates step configurations from natural language) and the AI Workflow Generator (turns plain-English requirements into fully wired classic workflows).",
        date: "2024",
        issuer: "Pabbly Connect",
        tags: ["ai", "product"],
      },
    ],
  };

  // Upsert knowledge base
  await db.collection("knowledgebases").updateOne(
    { userId: user._id },
    { $set: { ...knowledgeBase, updatedAt: new Date(), createdAt: new Date() } },
    { upsert: true }
  );

  console.log("Knowledge base seeded successfully!");
  console.log(`  Profile: ${knowledgeBase.profile.fullName}`);
  console.log(`  Timeline entries: ${knowledgeBase.timeline.length}`);
  console.log(`  Skills: ${knowledgeBase.skills.length}`);
  console.log(`  Projects: ${knowledgeBase.projects.length}`);
  console.log(`  Achievements: ${knowledgeBase.achievements.length}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
