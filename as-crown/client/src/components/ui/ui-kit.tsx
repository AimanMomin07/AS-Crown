import type { ReactNode, CSSProperties } from "react";

export const tokens = {
  radius: "var(--as-radius-lg)",
  radiusSm: "var(--as-radius)",
  shadow: "var(--as-shadow-sm)",
  primary: "var(--as-primary)",
  primarySoft: "rgba(37, 99, 235, 0.1)",
  success: "var(--as-success)",
  successSoft: "rgba(22, 163, 74, 0.12)",
  warning: "var(--as-warning)",
  warningSoft: "rgba(217, 119, 6, 0.12)",
  danger: "var(--as-danger)",
  dangerSoft: "rgba(220, 38, 38, 0.12)"
};

/* ---------------------------------------------------------
   PAGE HEADER
--------------------------------------------------------- */
export function PageHeader({
  icon,
  title,
  subtitle,
  action
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 24
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {icon && (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: tokens.primarySoft,
              color: tokens.primary,
              display: "grid",
              placeItems: "center",
              flexShrink: 0
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--as-text)" }}>{title}</h1>
          {subtitle && (
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--as-text-soft)" }}>{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------
   SECTION CARD
--------------------------------------------------------- */
export function SectionCard({
  children,
  style
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--as-surface)",
        border: "1px solid var(--as-border)",
        borderRadius: tokens.radius,
        padding: 20,
        boxShadow: tokens.shadow,
        ...style
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   STAT CARD
--------------------------------------------------------- */
export function StatCard({
  icon,
  label,
  value,
  tone = "primary",
  hint
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger";
  hint?: string;
}) {
  const toneMap: Record<string, { bg: string; color: string }> = {
    primary: { bg: tokens.primarySoft, color: tokens.primary },
    success: { bg: tokens.successSoft, color: tokens.success },
    warning: { bg: tokens.warningSoft, color: tokens.warning },
    danger: { bg: tokens.dangerSoft, color: tokens.danger }
  };
  const c = toneMap[tone];

  return (
    <SectionCard style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--as-text-soft)", textTransform: "uppercase", letterSpacing: 0.4 }}>
          {label}
        </span>
        {icon && (
          <div style={{ width: 34, height: 34, borderRadius: 10, background: c.bg, color: c.color, display: "grid", placeItems: "center" }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--as-text)" }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--as-text-soft)" }}>{hint}</div>}
    </SectionCard>
  );
}

/* ---------------------------------------------------------
   BADGE
--------------------------------------------------------- */
export function Badge({
  children,
  tone = "primary"
}: {
  children: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
}) {
  const toneMap: Record<string, { bg: string; color: string }> = {
    primary: { bg: tokens.primarySoft, color: tokens.primary },
    success: { bg: tokens.successSoft, color: tokens.success },
    warning: { bg: tokens.warningSoft, color: tokens.warning },
    danger: { bg: tokens.dangerSoft, color: tokens.danger },
    neutral: { bg: "var(--as-surface-soft)", color: "var(--as-text-soft)" }
  };
  const c = toneMap[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        textTransform: "capitalize"
      }}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------
   BUTTON
--------------------------------------------------------- */
export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  fullWidth,
  style
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
}) {
  const variants: Record<string, CSSProperties> = {
    primary: { background: tokens.primary, color: "#fff", border: "1px solid transparent" },
    secondary: { background: "var(--as-surface)", color: "var(--as-text)", border: "1px solid var(--as-border)" },
    danger: { background: tokens.danger, color: "#fff", border: "1px solid transparent" },
    ghost: { background: "transparent", color: tokens.primary, border: "1px solid transparent" }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 42,
        padding: "0 18px",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? "100%" : undefined,
        transition: "transform .12s ease, opacity .12s ease",
        ...variants[variant],
        ...style
      }}
      onMouseDown={e => { if (!disabled) (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------
   EMPTY STATE
--------------------------------------------------------- */
export function EmptyState({
  icon,
  title,
  subtitle
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--as-text-soft)" }}>
      {icon && <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", opacity: 0.6 }}>{icon}</div>}
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--as-text)" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

/* ---------------------------------------------------------
   SKELETON
--------------------------------------------------------- */
export function Skeleton({ height = 16, width = "100%", radius = 8 }: { height?: number; width?: number | string; radius?: number }) {
  return (
    <div
      className="as-skeleton"
      style={{
        height,
        width,
        borderRadius: radius
      }}
    />
  );
}

/* ---------------------------------------------------------
   INPUT (shared field style)
--------------------------------------------------------- */
export const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  height: 44,
  border: "1px solid var(--as-border)",
  borderRadius: 10,
  padding: "0 12px",
  background: "var(--as-surface)",
  color: "var(--as-text)",
  fontSize: 14
};
