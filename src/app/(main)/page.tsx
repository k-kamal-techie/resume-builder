import Link from "next/link";
import { LuSparkles, LuTarget, LuChartBar, LuFileText, LuArrowRight } from "react-icons/lu";

const features = [
  {
    icon: LuSparkles,
    title: "AI-Powered Content",
    description:
      "Chat with Claude to generate professional bullet points, summaries, and descriptions from your rough input.",
  },
  {
    icon: LuTarget,
    title: "Job Tailoring",
    description:
      "Paste a job description and get instant suggestions to tailor your resume for maximum relevance.",
  },
  {
    icon: LuChartBar,
    title: "ATS Scoring",
    description:
      "Get a detailed ATS compatibility score with keyword analysis and actionable improvement suggestions.",
  },
  {
    icon: LuFileText,
    title: "Multiple Templates",
    description:
      "Choose from Classic, Modern, and Minimal templates. Live preview as you edit.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-medium mb-6">
            <LuSparkles className="h-3 w-3" />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Build Your Resume
            <br />
            <span className="text-accent-600">With AI Intelligence</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Stop struggling with resume writing. Chat with AI to generate professional content,
            tailor for specific jobs, and get ATS-optimized in minutes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white hover:bg-accent-700 transition-colors"
            >
              Get Started Free
              <LuArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Land the Job
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-100 text-accent-600 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Your Best Resume?
          </h2>
          <p className="text-accent-100 mb-8 max-w-xl mx-auto">
            Join thousands of professionals who use AI to keep their resume updated and optimized.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-accent-600 hover:bg-accent-50 transition-colors"
          >
            Start Building Now
            <LuArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
