// Single source of truth for the ways to reach me — read by the Contact page
// and by the Résumé link in the top bar.

import {
  MailIcon,
  MapPinIcon,
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  type IconComponent,
} from '@/components/icons';

export const EMAIL = 'ryne.zhu2@gmail.com';

export const RESUME_URL =
  'https://drive.google.com/file/d/1yjIycfu7q7xlB7m89050zwsLJLMt3oPv/view';

export interface ContactLink {
  label: string;
  /** Right-hand column. Kept short so the rows read as a table, not a list. */
  value: string;
  /** Omitted for plain facts (location); present rows render as links. */
  href?: string;
  /** Opens in a new tab and gets the ↗ marker. */
  external?: boolean;
  icon: IconComponent;
}

export const contactLinks: ContactLink[] = [
  { label: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, icon: MailIcon },
  { label: 'Location', value: 'Toronto, ON', icon: MapPinIcon },
  {
    label: 'LinkedIn',
    value: 'Ryne Zhu',
    href: 'https://www.linkedin.com/in/ryne-zhu-83520028b/',
    external: true,
    icon: LinkedinIcon,
  },
  {
    label: 'GitHub',
    value: 'rynezhu0',
    href: 'https://github.com/rynezhu0',
    external: true,
    icon: GithubIcon,
  },
  {
    label: 'Instagram',
    value: 'ryne.zhu0',
    href: 'https://www.instagram.com/ryne.zhu0/',
    external: true,
    icon: InstagramIcon,
  },
];
