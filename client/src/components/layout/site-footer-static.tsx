import React from 'react';
import { Code } from "lucide-react";

export function SiteFooterStatic() {
  const currentYear = new Date().getFullYear();
  const footerLinks = [
    { title: "About", href: "/about" },
    { title: "Courses", href: "/r" },
    { title: "Blog", href: "/blog" },
    { title: "Contact", href: "/contact" },
    { title: "Terms", href: "/terms" },
    { title: "Privacy", href: "/privacy" },
  ];
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #eee', marginTop: 40, padding: '32px 0 16px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#222' }}>
            <Code style={{ height: 24, width: 24, color: '#1a8917' }} />
            <span style={{ marginLeft: 8, fontSize: 18, fontWeight: 700 }}>Unlocked Coding</span>
          </a>
        </div>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
          {footerLinks.map((link) => (
            <a key={link.title} href={link.href} style={{ color: '#222', textDecoration: 'none', fontSize: 15 }}>{link.title}</a>
          ))}
        </nav>
        <div style={{ color: '#888', fontSize: 14 }}>&copy; {currentYear} Unlocked Coding. All rights reserved.</div>
      </div>
    </footer>
  );
} 