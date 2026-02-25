export function LogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Gear/cog body */}
      <path
        d="M33.6 8h-3.2l-1.8 5.4a17.2 17.2 0 0 0-4.4 2.5L19 14l-2.3 1.6 2.1 5.2a17.3 17.3 0 0 0-1.6 4.8L12 27.4v3.2l5.2 1.8c.3 1.7.9 3.3 1.6 4.8l-2.1 5.2L19 44l5.2-1.9a17.2 17.2 0 0 0 4.4 2.5L30.4 50h3.2l1.8-5.4a17.2 17.2 0 0 0 4.4-2.5L45 44l2.3-1.6-2.1-5.2a17.3 17.3 0 0 0 1.6-4.8L52 30.6v-3.2l-5.2-1.8a17.3 17.3 0 0 0-1.6-4.8l2.1-5.2L45 14l-5.2 1.9a17.2 17.2 0 0 0-4.4-2.5L33.6 8Z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Magnifying glass circle */}
      <circle
        cx="29"
        cy="29"
        r="8"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      {/* Magnifying glass handle */}
      <line
        x1="35"
        y1="35"
        x2="44"
        y2="44"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Small dot in center of glass */}
      <circle cx="29" cy="29" r="2" fill="currentColor" />
    </svg>
  )
}
