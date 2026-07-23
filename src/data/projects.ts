export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  year: string;
  links: ProjectLink[];
  /** Optional screenshot shown in the detail panel. Put the file in
   *  public/images/ and reference it from the site root, e.g.
   *  '/images/checkmark-screenshot.png'. Omit for no image. */
  image?: string;
  /** Alt text for the screenshot; falls back to "<title> screenshot". */
  imageAlt?: string;
}

const featured: Project[] = [
  {
    id: 'counterstrafe.ninja',
    title: 'Counterstrafe.ninja',
    blurb: 'A Steam marketplace analytics platform for Counter-Strike 2 that provides real-time pricing, historical trends, and item details as well as an AI Chatbot to help users make informed trading decisions. Created using React styled with Tailwind CSS while integrating multiple REST APIs to fetch and transform live market data to provide a dynamic user experience.',
    tags: ['TypeScript', 'React', 'Tailwind CSS', 'REST APIs'],
    year: '2026',
    links: [
      { label: 'Website', url: 'https://counterstrafe.ninja' },
      { label: 'GitHub', url: 'https://github.com/rynezhu0/counterstrafe.ninja' },
    ],
  },
  {
    id: 'portfolio',
    title: 'PlayStation Themed Portfolio',
    blurb: 'A personal portfolio that is inspired from the PlayStation 4 main menu using React and Three.js for the animations, background, and effects while being deployed using Vercel.',
    tags: ['TypeScript', 'React', 'Tailwind CSS', 'Next.js', 'Three.js'],
    year: '2026',
    links: [
      { label: 'GitHub', url: 'https://github.com/rynezhu0/Portfolio' },
    ],
  },
  {
    id: 'checkmark',
    title: 'Checkmark',
    blurb: 'A productivity web app that helps users manage tasks using multi-task list organization, text customization, and productivity features in a modern, responsive UI design. It is built with React, Vite, and Tailwind CSS and features reusable componenets and browser local storage to speed up efficiency and create the ultimate offline user experience.',
    tags: ['JavaScript', 'React', 'Tailwind CSS'],
    year: '2026',
    image: '/images/checkmark-screenshot.png',
    // To show a screenshot in the detail panel, drop the file in
    // public/images/ and uncomment (adjusting the filename):
    // image: '/images/checkmark-screenshot.png',
    links: [
      { label: 'Website', url:'https://checkmarkproject.vercel.app/'},
      { label: 'GitHub', url: 'https://github.com/rynezhu0/Checkmark' },
    ],
  },
];

export const projects: Project[] = [...featured];