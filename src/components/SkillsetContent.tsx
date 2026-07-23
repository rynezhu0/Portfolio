'use client';

const skillCategories = [
  {
    name: 'Languages',
    skills: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'SQL'],
  },
  {
    name: 'Frameworks',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'PyTorch'],
  },
  {
    name: 'Developer Tools',
    skills: ['Git', 'Docker', 'PostgreSQL', 'Node.js', 'Vercel'],
  },
];

export default function SkillsetContent() {
  return (
    <div className="w-full">
      <h1 className="font-display text-6xl font-semibold text-text-primary mb-12 tracking-tight text-center">
        Skillset
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {skillCategories.map((category) => (
          <div
            key={category.name}
            className="p-9 rounded-2xl bg-surface/75 border border-border-subtle"
          >
            <h2 className="font-display text-3xl font-semibold text-text-primary mb-7 tracking-tight">
              {category.name}
            </h2>
            <ul className="space-y-4">
              {category.skills.map((skill, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 text-xl text-text-primary"
                >
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" aria-hidden="true" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
