import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
  structuredData?: any;
}

class SEOOptimizer {
  private baseUrl = 'https://unlockedcoding.com';
  private publicDir = join(process.cwd(), 'client', 'public');

  constructor() {
    if (!existsSync(this.publicDir)) {
      mkdirSync(this.publicDir, { recursive: true });
    }
  }

  // Generate structured data for educational organization
  private generateEducationalOrganizationSchema(): any {
    return {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Unlocked Coding",
      "url": this.baseUrl,
      "logo": `${this.baseUrl}/logo.png`,
      "description": "Learn programming skills, build projects, and advance your career with our expert-led courses. From web development to data science, we've got you covered.",
      "foundingDate": "2023",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@unlockedcoding.com"
      },
      "sameAs": [
        "https://t.me/unlocked_coding",
        "https://t.me/unlocked_chat",
        "https://instagram.com/unlocked_devs",
        "https://x.com/unlocked_devs"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Programming Courses",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Course",
              "name": "Web Development",
              "description": "Learn modern web development with React, Node.js, and MongoDB"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Course",
              "name": "Data Science",
              "description": "Master data science with Python, machine learning, and analytics"
            }
          }
        ]
      }
    };
  }

  // Generate structured data for course
  public generateCourseSchema(course: any): any {
    return {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description,
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Unlocked Coding",
        "url": this.baseUrl
      },
      "courseMode": "online",
      "educationalLevel": "beginner",
      "inLanguage": "en",
      "teaches": course.skills || [],
      "timeRequired": `PT${course.duration || 20}H`,
      "url": `${this.baseUrl}/course/${course._id}`,
      "image": course.thumbnail || `${this.baseUrl}/og-image.svg`,
      "aggregateRating": course.rating ? {
        "@type": "AggregateRating",
        "ratingValue": course.rating,
        "ratingCount": course.reviewCount || 0
      } : undefined
    };
  }

  // Generate structured data for breadcrumbs
  public generateBreadcrumbSchema(path: string, title: string): any {
    const pathParts = path.split('/').filter(Boolean);
    const breadcrumbs = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": this.baseUrl
      }
    ];

    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      breadcrumbs.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": part.charAt(0).toUpperCase() + part.slice(1),
        "item": `${this.baseUrl}${currentPath}`
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs
    };
  }

  // Generate FAQ structured data
  private generateFAQSchema(): any {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Unlocked Coding?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Unlocked Coding is an online platform that offers comprehensive programming courses to help you learn coding skills and advance your career in technology."
          }
        },
        {
          "@type": "Question",
          "name": "What programming languages do you teach?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We teach JavaScript, Python, React, Node.js, MongoDB, and many other modern programming languages and frameworks."
          }
        },
        {
          "@type": "Question",
          "name": "Are the courses suitable for beginners?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Our courses are designed for all skill levels, from complete beginners to advanced developers looking to upskill."
          }
        },
        {
          "@type": "Question",
          "name": "How long does it take to complete a course?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Course duration varies from 10-50 hours depending on the complexity. You can learn at your own pace with lifetime access."
          }
        }
      ]
    };
  }

  // Generate meta tags for a page
  public generateMetaTags(config: SEOConfig): string {
    const {
      title,
      description,
      keywords,
      ogImage = `${this.baseUrl}/og-image.svg`,
      canonical = this.baseUrl,
      structuredData
    } = config;

    const metaTags = [
      `<title>${title}</title>`,
      `<meta name="description" content="${description}">`,
      `<meta name="keywords" content="${keywords.join(', ')}">`,
      `<meta name="robots" content="index, follow">`,
      `<meta name="author" content="Unlocked Coding">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
      
      // Open Graph tags
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`,
      `<meta property="og:image" content="${ogImage}">`,
      `<meta property="og:url" content="${canonical}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="Unlocked Coding">`,
      
      // Twitter Card tags
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${title}">`,
      `<meta name="twitter:description" content="${description}">`,
      `<meta name="twitter:image" content="${ogImage}">`,
      
      // Canonical URL
      `<link rel="canonical" href="${canonical}">`,
      
      // Additional SEO tags
      `<meta name="theme-color" content="#3B82F6">`,
      `<meta name="msapplication-TileColor" content="#3B82F6">`,
      `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`
    ];

    return metaTags.join('\n    ');
  }

  // Generate structured data JSON-LD
  public generateStructuredData(data: any): string {
    return `<script type="application/ld+json">
${JSON.stringify(data, null, 2)}
</script>`;
  }

  // Create SEO-optimized content for target keywords
  public generateKeywordOptimizedContent(keyword: string): SEOConfig {
    const keywordConfigs: Record<string, SEOConfig> = {
      'unlockedcoding': {
        title: 'Unlocked Coding - Learn Programming Skills | Best Coding Platform',
        description: 'Unlocked Coding is the premier platform for learning programming skills. Master web development, data science, and mobile development with expert-led courses. Join thousands of successful developers.',
        keywords: ['unlockedcoding', 'programming', 'coding', 'web development', 'learn to code', 'online courses', 'programming bootcamp'],
        structuredData: this.generateEducationalOrganizationSchema()
      },
      'harkirat': {
        title: 'Harkirat Singh - Programming Mentor | Unlocked Coding',
        description: 'Learn from Harkirat Singh, expert programming mentor at Unlocked Coding. Master modern web development, React, Node.js, and build real-world projects with industry best practices.',
        keywords: ['harkirat', 'harkirat singh', 'programming mentor', 'web development', 'react', 'node.js', 'unlockedcoding'],
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Harkirat Singh",
          "jobTitle": "Programming Mentor",
          "worksFor": {
            "@type": "Organization",
            "name": "Unlocked Coding"
          },
          "description": "Expert programming mentor specializing in modern web development",
          "url": `${this.baseUrl}/mentor/harkirat`
        }
      },
      'cohort': {
        title: 'Programming Cohort 3.0 | Unlocked Coding - Join the Next Generation',
        description: 'Join Unlocked Coding Cohort 3.0 - The most comprehensive programming bootcamp. Learn with peers, build projects, and launch your tech career. Limited spots available.',
        keywords: ['cohort', 'cohort 3.0', 'programming bootcamp', 'coding cohort', 'unlockedcoding', 'web development bootcamp'],
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Unlocked Coding Cohort 3.0",
          "description": "Comprehensive programming bootcamp with peer learning and project-based curriculum",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "Unlocked Coding"
          },
          "courseMode": "online",
          "educationalLevel": "beginner",
          "inLanguage": "en"
        }
      },
      'cohort 2.0': {
        title: 'Programming Cohort 2.0 | Unlocked Coding - Proven Success',
        description: 'Unlocked Coding Cohort 2.0 - The proven programming bootcamp that launched hundreds of successful careers. Learn from industry experts and join our alumni network.',
        keywords: ['cohort 2.0', 'programming bootcamp', 'coding cohort', 'unlockedcoding', 'web development', 'success stories'],
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Unlocked Coding Cohort 2.0",
          "description": "Proven programming bootcamp with successful alumni and industry connections",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "Unlocked Coding"
          },
          "courseMode": "online",
          "educationalLevel": "beginner",
          "inLanguage": "en"
        }
      }
    };

    return keywordConfigs[keyword.toLowerCase()] || {
      title: 'Unlocked Coding - Learn Programming Skills',
      description: 'Learn programming skills with Unlocked Coding. Expert-led courses in web development, data science, and mobile development.',
      keywords: ['programming', 'coding', 'web development', 'unlockedcoding'],
      structuredData: this.generateEducationalOrganizationSchema()
    };
  }

  // Generate sitemap for specific keywords
  public async generateKeywordSitemap(keywords: string[]): Promise<void> {
    const keywordUrls = keywords.map(keyword => ({
      loc: `${this.baseUrl}/?keyword=${encodeURIComponent(keyword)}`,
      changefreq: 'daily' as const,
      priority: 0.9
    }));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${keywordUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    writeFileSync(join(this.publicDir, 'sitemap-keywords.xml'), xml);
    console.log('✅ Keyword sitemap generated');
  }

  // Create robots.txt with keyword-specific directives
  public generateEnhancedRobotsTxt(): void {
    const robotsContent = `User-agent: *
Allow: /

# Allow important pages for crawling
Allow: /about
Allow: /blog
Allow: /contact
Allow: /terms
Allow: /privacy
Allow: /donate

# Allow course and category pages
Allow: /r/
Allow: /course/

# Allow keyword-specific pages
Allow: /?keyword=unlockedcoding
Allow: /?keyword=harkirat
Allow: /?keyword=cohort
Allow: /?keyword=cohort+3.0
Allow: /?keyword=cohort+2.0

# Disallow admin and private routes
Disallow: /admin/
Disallow: /admin/*
Disallow: /profile/
Disallow: /profile/*
Disallow: /auth/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Disallow temporary and development files
Disallow: /temp/
Disallow: /test/
Disallow: /dev/
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /*.txt$

# Crawl delay for respectful crawling
Crawl-delay: 1

# Sitemap locations
Sitemap: https://unlockedcoding.com/sitemap.xml
Sitemap: https://unlockedcoding.com/sitemap-courses.xml
Sitemap: https://unlockedcoding.com/sitemap-categories.xml
Sitemap: https://unlockedcoding.com/sitemap-blog.xml
Sitemap: https://unlockedcoding.com/sitemap-keywords.xml

# Additional directives for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Block AI training bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: Omgilibot
Disallow: /`;

    writeFileSync(join(this.publicDir, 'robots.txt'), robotsContent);
    console.log('✅ Enhanced robots.txt generated');
  }
}

export default SEOOptimizer; 