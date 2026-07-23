"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const colors = {
  page: "#03162E",
  pageDeep: "#021126",
  header:"#123D70",
  blueCard: "#0B2D55",
  green: "#17664F",
  greenDark: "#08483C",
  greenSoft: "#E8F3EE",
  gold: "#D7A73F",
  white: "#FFFFFF",
  textDark: "#07152D",
};

export default function Menu({
  username = "Speler",
  isAdmin = false,
  avatarUrl = "",
}: {
  username?: string;
  isAdmin?: boolean;
  avatarUrl?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <>
      <header
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 9999,
  }}
  >
        <div
  style={{
    background: colors.header,
    color: colors.white,
    minHeight: 76,
    paddingTop: "env(safe-area-inset-top)",
    paddingLeft: 20,
    paddingRight: 20,
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) 48px",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
  }}
  >
        
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Menu openen"
            aria-expanded={isOpen}
            style={{
              width: 44,
              height: 44,
              padding: 0,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: colors.white,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 21,
                height: 3,
                borderRadius: 999,
                backgroundColor: colors.white,
                display: "block",
              }}
            />

            <span
              style={{
                width: 21,
                height: 3,
                borderRadius: 999,
                backgroundColor: colors.white,
                display: "block",
              }}
            />

            <span
              style={{
                width: 21,
                height: 3,
                borderRadius: 999,
                backgroundColor: colors.white,
                display: "block",
              }}
            />
          </button>

          <div
            style={{
              textAlign: "center",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 19,
                fontWeight: 900,
                letterSpacing: 1.2,
                lineHeight: 1.1,
              }}
            >
              WK PRONO
            </div>

            <div
              style={{
                marginTop: 3,
                color: colors.greenSoft,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2.5,
              }}
            >
              2026
            </div>
          </div>

          <Link
            href="/profiel"
            aria-label="Profiel openen"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: colors.greenSoft,
              color: colors.textDark,
              border: `2px solid ${colors.gold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 900,
              overflow: "hidden",
              textDecoration: "none",
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
          </Link>
        </div>
      </header>

      {isOpen && (
        <>
          <div
            onClick={closeMenu}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2147483645,
              backgroundColor: "rgba(0,0,0,0.58)",
            }}
          />

          <aside
            aria-label="Hoofdmenu"
            style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "84%",
          maxWidth: 340,
          height: "100dvh",
          zIndex: 2147483646,
          backgroundColor: `#123D70`,
          color: colors.white,
          paddingTop: "calc(24px + env(safe-area-inset-top))",
          paddingLeft: 26,
          paddingRight: 26,
          paddingBottom: "calc(30px + env(safe-area-inset-bottom))",
          borderTopRightRadius: 28,
          borderBottomRightRadius: 28,
          boxShadow: "14px 0 40px rgba(0,0,0,0.38)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 18,
          }}
        >
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Menu sluiten"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.14)",
              backgroundColor: "rgba(255,255,255,0.09)",
              color: colors.white,
              fontSize: 25,
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        <Link
          href="/profiel"
          onClick={closeMenu}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 30,
            padding: 14,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: colors.white,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: colors.greenSoft,
              color: colors.textDark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 900,
              flexShrink: 0,
              overflow: "hidden",
              border: `2px solid ${colors.gold}`,
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
              minWidth: 0,
            }}
          >
            <div
              style={{
                color: colors.greenSoft,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.4,
                marginBottom: 4,
              }}
            >
              PROFIEL
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {username}
            </div>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <MenuLink href="/dashboard" onClick={closeMenu}>
            Overzicht
          </MenuLink>

          <MenuLink href="/voorspellingen" onClick={closeMenu}>
            Voorspellingen
          </MenuLink>

          <MenuLink href="/ranking" onClick={closeMenu}>
            Ranking
          </MenuLink>

          <MenuLink href="/trionda" onClick={closeMenu}>
            Trionda
          </MenuLink>

          <MenuLink href="/reglement" onClick={closeMenu}>
            Reglement
          </MenuLink>

          {isAdmin && (
            <MenuLink href="/admin" onClick={closeMenu}>
              Admin
            </MenuLink>
          )}
        </nav>

        <form
          action="/api/logout"
          method="POST"
          style={{
            marginTop: "auto",
            paddingTop: 30,
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.08)",
              color: colors.white,
              padding: "15px 16px",
              fontSize: 17,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Afmelden
          </button>
        </form>
          </aside>
        </>
      )}
    </>
  );
}

function MenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        color: colors.white,
        fontSize: 18,
        fontWeight: 900,
        textDecoration: "none",
        padding: "14px 16px",
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {children}
    </Link>
  );
}