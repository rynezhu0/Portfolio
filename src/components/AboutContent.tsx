'use client';

import Link from 'next/link';
import { contactLinks } from '@/data/contact';

// The pill row reuses the Contact page's list so there's one place to edit a
// handle. Location has no href, so it drops out here.
const socials = contactLinks.filter((l) => l.href);

// One label/value line in the quick-stats column (see globals.css).
function StatRow({
  label,
  accent,
  children,
}: {
  label: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className={`stat-value${accent ? ' stat-value--accent' : ''}`}>{children}</span>
    </div>
  );
}

export default function AboutContent() {
  return (
    <div className="about-layout">
      {/* Left — intro copy */}
      <div className="about-intro">
        <h1 className="font-display text-4xl font-semibold text-text-primary mb-6 tracking-tight">
          Hello, I&apos;m <span className="text-accent">Ryne Zhu</span>
        </h1>
        <p className="text-base text-text-secondary leading-relaxed mb-4">
          I am a Computer Engineering student at McMaster University that is passionate about solving real-world problems using AI-Powered Products with experience in Full-Stack Development, Machine Learning, and Cloud Technologies.
        </p>
        <p className="text-base text-text-secondary leading-relaxed mb-4">
          I enjoy breaking down intricate problems and like being challenged by unfamiliar concepts as I believe that is the best way to learn a new technology. I also love collaborating with others to search for the most efficient and intuitive solution working together. 
        </p>
        <p className="text-base text-text-secondary leading-relaxed mb-4">
          I&apos;m interested in opportunities where I can positively contribute to products at scale. Working alongside experienced teams, tackling technically challenging problems, and building products that are utilized by real users are the experiences that motivate me most as an engineer.
        </p>
        <div className="flex gap-3 mt-8">
          {socials.map(({ label, href, external, icon: Icon }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex items-center gap-2 font-mono text-[13px] text-text-secondary hover:text-text-primary tracking-wider px-3 py-1.5 rounded-md bg-surface border border-border-subtle hover:border-white/45 transition-colors no-underline"
            >
              <Icon size={15} className="flex-shrink-0" />
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Right — quick stats + current status */}
      <div className="about-stats" aria-label="Quick stats">
        <StatRow label="Role">Computer Engineer</StatRow>
        <StatRow label="Focus" accent>
          Machine Learning, Agentic AI
        </StatRow>
        <StatRow label="Now">AI-Powered Products</StatRow>
        <StatRow label="Status">
          <span className="status-dot" aria-hidden="true" />
          Open to Internships
        </StatRow>
        <StatRow label="Skills">
          <Link href="/skillset" className="stat-link">
            View Skillset →
          </Link>
        </StatRow>
      </div>
    </div>
  );
}
