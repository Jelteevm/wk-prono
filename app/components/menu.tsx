import Link from "next/link";

export default function Menu({
  username = "Speler",
  isAdmin = false,
  avatarUrl = "",
}: {
  username?: string;
  isAdmin?: boolean;
  avatarUrl?: string;
}) {
  const initial = username.charAt(0).toUpperCase();

  return (
    <details style={{ display: "inline-block" }}>
      <summary
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          backgroundColor: "#FCEA10",
          color: "black",
          fontSize: 32,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          listStyle: "none",
          cursor: "pointer",
          position: "relative",
          zIndex: 999999,
        }}
      >
        ☰
      </summary>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "80%",
          maxWidth: "320px",
          height: "100dvh",
          zIndex: 999998,
          background: "linear-gradient(180deg, #ffef35, #fff162)",
          color: "#020A2D",
          padding: "110px 28px 32px",
          borderTopRightRadius: "24px",
          borderBottomRightRadius: "24px",
          boxShadow: "0 0 25px rgba(0,0,0,0.25)",
        }}
      >
        <Link
          href="/profiel"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 34,
            paddingBottom: 22,
            borderBottom: "2px solid rgba(0,0,0,0.18)",
            color: "#020A2D",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: "50%",
              backgroundColor: "white",
              color: "black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              initial
            )}
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1.1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {username}
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <Link href="/dashboard" style={linkStyle}>
            OVERZICHT
          </Link>

          <Link href="/voorspellingen" style={linkStyle}>
            VOORSPELLINGEN
          </Link>

          <Link href="/ranking" style={linkStyle}>
            RANKING
          </Link>

          <Link href="/reglement" style={linkStyle}>
            REGLEMENT
          </Link>

          {isAdmin && (
            <Link href="/admin" style={linkStyle}>
              ADMIN
            </Link>
          )}
        </nav>

        <form
          action="/api/logout"
          method="POST"
          style={{
            position: "absolute",
            left: 28,
            right: 28,
            bottom: 32,
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              border: "none",
              borderRadius: 16,
              backgroundColor: "#EC5353",
              color: "black",
              padding: "18px 16px",
              fontSize: 24,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            }}
          >
            Afmelden
          </button>
        </form>
      </div>
    </details>
  );
}

const linkStyle = {
  color: "#020A2D",
  fontSize: 28,
  fontWeight: 900,
  fontStyle: "italic",
  textDecoration: "none",
} as const;