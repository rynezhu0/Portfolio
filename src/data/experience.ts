export interface RoleLink {
  label: string;
  url: string;
}

export interface Role {
  id: string;
  title: string;
  company: string;
  period: string;
  blurb: string;
  /** Optional — a role with nothing to link to simply omits this. */
  links?: RoleLink[];
}

export const experience: Role[] = [
  {
    id: 'project-manager',
    title: 'Project Manager',
    company: 'McMaster University',
    period: 'Sep 2025 – Dec 2025',
    blurb: 'Led a 5-member team in designing and integrating a custom end-effector platform for the Quanser QArm. Utilized Autodesk Inventor to design and print the product and a Python-based UI to control robotic arm movements in order to acheive consistent pick-and-place performance.',
  },
  {
    id: 'student-instructor',
    title: 'CAMS Student Instructor',
    company: 'Canada Abacus Mental Study',
    period: 'Sep 2021 – May 2024',
    blurb: 'Instructed students in abacus-based mental math and helped developed calculation speed, accuracy, and confidence while managing classroom activities, checking homework, and enforcing behavioral standards in the classroom.',
  },
  {
    id: 'private-tutor',
    title: 'Private Tutor',
    company: 'Self-Employed',
    period: 'Sep 2023 – Jun 2025',
    blurb: 'Coached AP students in Physics, Calculus, Chemistry, and Computer Science subjects throughout 80+ hours of learning sessions, and boosting average grades by 10-20%. Also designed personalized study plans and taught advanced problem-solving strategies to help students achieve 85-95% on major assessments.',
  },
];
