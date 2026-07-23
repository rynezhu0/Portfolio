'use client';

import { contactLinks, RESUME_URL, type ContactLink } from '@/data/contact';

// Contact is a directory, not a form: a heading over a hairline-divided
// label/value table, in the site typeface. See globals.css for the layout.

function Row({ label, value, href, external, icon: Icon }: ContactLink) {
  return (
    <div className="contact-row">
      <span className="contact-row-label">
        <Icon size={17} className="contact-row-icon" />
        {label}
      </span>
      {href ? (
        <a
          className="contact-row-value"
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {value}
          {external && (
            <span className="contact-arrow" aria-hidden="true">
              ↗
            </span>
          )}
        </a>
      ) : (
        <span className="contact-row-value">{value}</span>
      )}
    </div>
  );
}

export default function ContactContent() {
  return (
    <div className="contact-layout">
      <h1 className="contact-heading">Contact Details</h1>

      <div className="contact-table">
        {contactLinks.map((link) => (
          <Row key={link.label} {...link} />
        ))}
      </div>

      <a
        className="contact-resume"
        href={RESUME_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Résumé
        <span className="contact-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </div>
  );
}
