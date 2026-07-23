'use client';

import { useNavStore } from '@/store/useNavStore';

export default function BackButton() {
  const { expandedSection, subExpandedId, collapseSection, collapseSubItem } =
    useNavStore();

  if (!expandedSection) return null;

  const handleBack = () => {
    if (subExpandedId) {
      collapseSubItem();
    } else {
      collapseSection();
    }
  };

  return (
    <button
      className="back-button"
      onClick={handleBack}
      aria-label="Go back"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}
