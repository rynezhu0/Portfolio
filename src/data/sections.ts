import { RzLogoIcon, ToolIcon, BriefcaseIcon, BoltIcon, MailIcon, type IconComponent } from '@/components/icons';

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  icon: IconComponent;
  /** Sections that browse their own nested tile row (Projects, Experience) instead of filling the screen themselves. */
  hasNestedRow: boolean;
  /** Render the icon as large artwork spanning the tile width instead of a small centered glyph. */
  wideArt?: boolean;
}

export const sections: Section[] = [
  {
    id: 'about',
    title: 'About Me',
    subtitle: 'A brief introduction',
    route: '/about',
    icon: RzLogoIcon,
    hasNestedRow: false,
    wideArt: true,
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Selected works and builds',
    route: '/projects',
    icon: ToolIcon,
    hasNestedRow: false,
  },
  {
    id: 'experience',
    title: 'Experience',
    subtitle: 'Professional history',
    route: '/experience',
    icon: BriefcaseIcon,
    hasNestedRow: false,
  },
  {
    id: 'skillset',
    title: 'Skillset',
    subtitle: 'Technologies and tools',
    route: '/skillset',
    icon: BoltIcon,
    hasNestedRow: false,
  },
  {
    id: 'contact',
    title: 'Contact',
    subtitle: 'Get in touch',
    route: '/contact',
    icon: MailIcon,
    hasNestedRow: false,
  },
];
