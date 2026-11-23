interface BrandLogoProps {
  compact?: boolean;
}

export default function BrandLogo({
  compact = false
}: BrandLogoProps) {

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10
      }}
    >

      <div
        style={{
          width: compact ? 34 : 42,
          height: compact ? 34 : 42,
          borderRadius: 11,
          background: "#2563eb",
          display: "grid",
          placeItems: "center",
          flexShrink: 0
        }}
      >

        <svg
          width={compact ? 19 : 24}
          height={compact ? 19 : 24}
          viewBox="0 0 64 64"
          fill="none"
        >

          <path
            d="M12 18
               L21 39
               L31 24
               L40 39
               L52 18
               L47 47
               H17
               Z"
            fill="white"
          />

          <path
            d="M18 49 H46"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />

        </svg>

      </div>


      {!compact && (

        <div>

          <strong
            style={{
              display: "block",
              color: "#0f172a",
              fontSize: 15
            }}
          >
            AS CROWN
          </strong>

          <span
            style={{
              display: "block",
              color: "#64748b",
              fontSize: 10,
              marginTop: 2
            }}
          >
            Society Management
          </span>

        </div>

      )}

    </div>
  );
}