import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Category from './models/Category';
import Review from './models/Review';

// Import the page components using relative paths
import HomePage from '../client/src/pages/home-page';
import AboutPage from '../client/src/pages/about-page';
import BlogPage from '../client/src/pages/blog-page';
import TermsPage from '../client/src/pages/terms-page';
import PrivacyPage from '../client/src/pages/privacy-page';
import CopyrightPage from '../client/src/pages/copyright-page';

// Define interface for populated reviews (same as in testimonials controller)
interface PopulatedReview {
  _id: any;
  userId: any;
  courseId: any;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id: any;
    username: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
  course?: {
    _id: any;
    title: string;
    categoryId?: {
      _id: any;
      name: string;
    };
  };
}

// Define page configurations
const pageConfigs = {
  '/': {
    component: HomePage,
    title: 'Unlocked Coding - Learn Programming Skills',
    description: 'Learn programming skills, build projects, and advance your career with our expert-led courses. From web development to data science, we\'ve got you covered.',
    keywords: 'programming, coding, web development, data science, mobile development, online courses, learn to code',
    needsData: true
  },
  '/about': {
    component: AboutPage,
    title: 'About Us - Unlocked Coding',
    description: 'Learn about Unlocked Coding\'s mission to democratize programming education and help individuals build successful careers in technology.',
    keywords: 'about unlocked coding, programming education, coding bootcamp, tech education',
    needsData: false
  },
  '/blog': {
    component: BlogPage,
    title: 'Blog - Unlocked Coding',
    description: 'Insights, tutorials, and updates from the world of programming and technology. Stay updated with the latest trends and best practices.',
    keywords: 'programming blog, coding tutorials, tech insights, web development blog',
    needsData: false
  },
  '/terms': {
    component: TermsPage,
    title: 'Terms & Conditions - Unlocked Coding',
    description: 'Read our terms and conditions to understand the rules and guidelines for using Unlocked Coding\'s educational platform.',
    keywords: 'terms and conditions, legal, user agreement, platform terms',
    needsData: false
  },
  '/privacy': {
    component: PrivacyPage,
    title: 'Privacy Policy - Unlocked Coding',
    description: 'Learn how Unlocked Coding collects, uses, and protects your personal information. Your privacy is important to us.',
    keywords: 'privacy policy, data protection, personal information, GDPR',
    needsData: false
  },
  '/copyright': {
    component: CopyrightPage,
    title: 'Copyright Dispute - Unlocked Coding',
    description: 'Submit copyright disputes or report content that violates intellectual property rights. We review all requests within 24 hours.',
    keywords: 'copyright dispute, intellectual property, DMCA, content removal, copyright violation',
    needsData: false
  }
};

export async function renderPage(path: string): Promise<{
  html: string;
  dehydratedState: any;
  title: string;
  description: string;
  keywords: string;
}> {
  console.log(`Starting SSR for page: ${path}`);
  
  const config = pageConfigs[path as keyof typeof pageConfigs];
  if (!config) {
    throw new Error(`No configuration found for path: ${path}`);
  }

  // Create a fresh QueryClient for SSR
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries and refetching during SSR
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  });

  try {
    // Pre-fetch data only for pages that need it
    if (config.needsData) {
      console.log("Pre-fetching categories data...");
      await queryClient.prefetchQuery({
        queryKey: ['/api/categories'],
        queryFn: async () => {
          const categories = await Category.find().sort({ name: 1 });
          console.log(`Fetched ${categories.length} categories for SSR`);
          return categories;
        },
      });

      console.log("Pre-fetching testimonials data...");
      await queryClient.prefetchQuery({
        queryKey: ['/api/testimonials/featured'],
        queryFn: async () => {
          const testimonials = await Review.find({ rating: { $gte: 4 } })
            .populate({
              path: 'user',
              select: 'username profile',
              populate: {
                path: 'profile',
                select: 'firstName lastName avatar'
              }
            })
            .populate({
              path: 'course',
              select: 'title categoryId',
              populate: {
                path: 'categoryId',
                select: 'name'
              }
            })
            .sort({ rating: -1, createdAt: -1 })
            .limit(6) as PopulatedReview[];

          const transformedTestimonials = testimonials.map(review => ({
            id: review._id,
            name: review.user?.profile?.firstName && review.user?.profile?.lastName 
              ? `${review.user.profile.firstName} ${review.user.profile.lastName}`
              : review.user?.username || 'Anonymous',
            avatar: review.user?.profile?.avatar || (review.user as any)?.avatar || null,
            role: review.course?.categoryId?.name 
              ? `${review.course.categoryId.name} Graduate`
              : 'Student',
            content: review.comment,
            rating: review.rating,
            courseTitle: review.course?.title || 'Programming Course',
            createdAt: review.createdAt
          }));

          console.log(`Fetched ${transformedTestimonials.length} testimonials for SSR`);
          return transformedTestimonials;
        },
      });
    }

    console.log("Rendering component to string...");
    // Render the component to string
    const app = createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(config.component)
    );

    const html = renderToString(app);
    console.log("Component rendered successfully");

    // Get the dehydrated state for hydration
    let dehydratedState = null;
    if (config.needsData) {
      const categoriesData = queryClient.getQueryData(['/api/categories']);
      const testimonialsData = queryClient.getQueryData(['/api/testimonials/featured']);
      
      dehydratedState = {
        queries: [
          {
            queryKey: ['/api/categories'],
            data: categoriesData,
            state: { dataUpdatedAt: Date.now(), errorUpdatedAt: 0, fetchFailureCount: 0, fetchMeta: null, isInvalidated: false, status: 'success', dataUpdateCount: 1 }
          },
          {
            queryKey: ['/api/testimonials/featured'],
            data: testimonialsData,
            state: { dataUpdatedAt: Date.now(), errorUpdatedAt: 0, fetchFailureCount: 0, fetchMeta: null, isInvalidated: false, status: 'success', dataUpdateCount: 1 }
          }
        ]
      };
    }
    
    console.log("Dehydrated state prepared");

    return {
      html,
      dehydratedState,
      title: config.title,
      description: config.description,
      keywords: config.keywords
    };
  } catch (error) {
    console.error("SSR Error:", error);
    throw error;
  } finally {
    // Clean up the query client
    queryClient.clear();
  }
}

// Legacy function for backward compatibility
export async function renderHomePage(): Promise<{
  html: string;
  dehydratedState: any;
}> {
  const result = await renderPage('/');
  return {
    html: result.html,
    dehydratedState: result.dehydratedState
  };
}

export function createHTMLTemplate(
  appHtml: string,
  dehydratedState: any,
  title: string,
  description: string,
  keywords: string,
  path: string = '/'
): string {
  const baseUrl = 'https://unlockedcoding.com';
  const canonicalUrl = `${baseUrl}${path}`;
  const ogImage = `${baseUrl}/og-image.svg`;

  // Generate enhanced structured data based on path
  const structuredData = generateStructuredDataForPath(path, title, description);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="Unlocked Coding">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Unlocked Coding">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="twitter:site" content="@unlocked_devs">
  <meta name="twitter:creator" content="@unlocked_devs">
  
  <!-- Additional SEO -->
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">
  
  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://images.unsplash.com">
  <link rel="dns-prefetch" href="https://www.google-analytics.com">
  
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
  </script>
  
  <!-- Additional structured data for better SEO -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Unlocked Coding",
    "url": "${baseUrl}",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "${baseUrl}/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  </script>
  
  <!-- Critical CSS for above-the-fold content -->
  <style>
    body { margin: 0; font-family: 'Inter', sans-serif; }
    #root { min-height: 100vh; }
    .loading { opacity: 0; transition: opacity 0.3s; }
    .loaded { opacity: 1; }
  </style>
</head>
<body>
  <div id="root" class="loading">${appHtml}</div>
  
  <!-- Dehydrated state for hydration -->
  <script>
    window.__DEHYDRATED_STATE__ = ${JSON.stringify(dehydratedState)};
    window.__SEO_DATA__ = {
      title: "${title}",
      description: "${description}",
      keywords: "${keywords}",
      canonical: "${canonicalUrl}"
    };
  </script>
  
  <script type="module" src="/src/main.tsx"></script>
  
  <!-- Performance optimization -->
  <script>
    // Mark as loaded for smooth transitions
    document.addEventListener('DOMContentLoaded', function() {
      const root = document.getElementById('root');
      if (root) {
        root.classList.add('loaded');
      }
    });
  </script>
</body>
</html>
  `.trim();
}

function generateStructuredDataForPath(path: string, title: string, description: string): any {
  const baseUrl = 'https://unlockedcoding.com';
  
  // Base organization schema
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Unlocked Coding",
    "description": "Learn programming skills, build projects, and advance your career with our expert-led courses.",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
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
    ]
  };

  // Add path-specific enhancements
  if (path === '/') {
    return {
      ...baseSchema,
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

  if (path.startsWith('/r/')) {
    return {
      ...baseSchema,
      "@type": "Course",
      "name": title,
      "description": description,
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Unlocked Coding"
      },
      "courseMode": "online",
      "educationalLevel": "beginner",
      "inLanguage": "en"
    };
  }

  if (path.startsWith('/course/')) {
    return {
      ...baseSchema,
      "@type": "Course",
      "name": title,
      "description": description,
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Unlocked Coding"
      },
      "courseMode": "online",
      "educationalLevel": "beginner",
      "inLanguage": "en",
      "url": `${baseUrl}${path}`
    };
  }

  return baseSchema;
} 