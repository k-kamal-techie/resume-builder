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
      bio: "Seasoned Senior Developer and Technical Lead at Pabbly Connect, one of the leading workflow automation platforms processing millions of webhooks daily. Longest-serving developer on the product team with deep institutional knowledge spanning the full technology stack. Work sits at the intersection of full-stack development, DevOps, database engineering, and team leadership. Passionate about building systems that scale — not just in terms of traffic, but in terms of team capability.",
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
          "Created comprehensive video training curriculum for entire tech stack (8+ modules)",
          "Conduct code reviews and establish coding standards across the team",
          "Lead incident response and root cause analysis for production issues",
          "Author technical announcements for Pabbly Connect community",
        ],
        skills: [
          "PHP", "CodeIgniter 4", "Node.js", "Express.js", "React.js",
          "MongoDB", "MySQL", "Redis", "OpenResty", "Nginx", "Lua",
          "AWS EC2", "Docker", "New Relic", "Team Leadership",
        ],
        metrics: [
          { label: "Daily Webhooks Processed", value: "Millions" },
          { label: "Database Size Optimized", value: "764GB+" },
          { label: "Records Managed", value: "50M+" },
          { label: "Performance Boost", value: "3.3x" },
          { label: "Team Members Led", value: "5+" },
        ],
        tags: ["leadership", "backend", "devops", "architecture", "current"],
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
      // Frontend
      { name: "React.js", category: "Frontend", proficiency: 90, yearsOfExperience: 3, tags: ["frontend", "javascript"] },
      { name: "JavaScript", category: "Frontend", proficiency: 95, yearsOfExperience: 5, tags: ["frontend", "core"] },
      { name: "HTML5", category: "Frontend", proficiency: 95, yearsOfExperience: 5, tags: ["frontend"] },
      { name: "CSS3", category: "Frontend", proficiency: 90, yearsOfExperience: 5, tags: ["frontend"] },
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
      // AI & ML
      { name: "AI / LLM Integration", category: "AI & ML", proficiency: 85, yearsOfExperience: 2, tags: ["ai"] },
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
