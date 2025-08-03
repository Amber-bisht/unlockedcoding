import React from 'react';
import { Code } from "lucide-react";

export function SiteHeaderStatic() {
  const navItems = [
    { title: "Home", href: "/" },
    { title: "Categories", href: "/r" },
    { title: "About", href: "/about" },
  ];

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '0 0 0 0', marginBottom: 0 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, padding: '0 24px' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#222' }}>
          <Code style={{ height: 32, width: 32, color: '#1a8917' }} />
          <span style={{ marginLeft: 8, fontSize: 22, fontWeight: 700 }}>Unlocked Coding</span>
        </a>
        <nav style={{ marginLeft: 32, display: 'flex', gap: 24 }}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} style={{ color: '#222', textDecoration: 'none', fontWeight: 500, fontSize: 16 }}>{item.title}</a>
          ))}
        </nav>
      </div>
    </header>
  );
} 