import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import Category from '../models/Category';
import Course from '../models/Course';
import Review from '../models/Review';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

class SitemapGenerator {
  private baseUrl = 'https://unlockedcoding.com';
  private publicDir = join(process.cwd(), 'client', 'public');

  constructor() {
    // Ensure public directory exists
    if (!existsSync(this.publicDir)) {
      mkdirSync(this.publicDir, { recursive: true });
    }
  }

  private generateSitemapXml(urls: SitemapUrl[]): string {
    const xmlUrls = urls.map(url => {
      const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
      return `  <url>
    <loc>${url.loc}</loc>${lastmod}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
  }

  private async generateMainSitemap(): Promise<void> {
    const urls: SitemapUrl[] = [
      {
        loc: `${this.baseUrl}/`,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: `${this.baseUrl}/about`,
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/blog`,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/contact`,
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        loc: `${this.baseUrl}/terms`,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        loc: `${this.baseUrl}/privacy`,
        changefreq: 'yearly',
        priority: 0.3
      },
      {
        loc: `${this.baseUrl}/donate`,
        changefreq: 'monthly',
        priority: 0.6
      },
      {
        loc: `${this.baseUrl}/auth`,
        changefreq: 'monthly',
        priority: 0.5
      }
    ];

    const xml = this.generateSitemapXml(urls);
    writeFileSync(join(this.publicDir, 'sitemap.xml'), xml);
    console.log('✅ Main sitemap generated');
  }

  private async generateCategoriesSitemap(): Promise<void> {
    try {
      const categories = await Category.find({}).lean();
      const urls: SitemapUrl[] = categories.map(category => ({
        loc: `${this.baseUrl}/r/${category.slug}`,
        changefreq: 'weekly',
        priority: 0.9
      }));

      const xml = this.generateSitemapXml(urls);
      writeFileSync(join(this.publicDir, 'sitemap-categories.xml'), xml);
      console.log(`✅ Categories sitemap generated with ${categories.length} categories`);
    } catch (error) {
      console.error('❌ Error generating categories sitemap:', error);
    }
  }

  private async generateCoursesSitemap(): Promise<void> {
    try {
      const courses = await Course.find({ isPublished: true }).populate('categoryId').lean();
      const urls: SitemapUrl[] = courses.map(course => ({
        loc: `${this.baseUrl}/course/${course._id}`,
        lastmod: course.updatedAt?.toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      }));

      const xml = this.generateSitemapXml(urls);
      writeFileSync(join(this.publicDir, 'sitemap-courses.xml'), xml);
      console.log(`✅ Courses sitemap generated with ${courses.length} courses`);
    } catch (error) {
      console.error('❌ Error generating courses sitemap:', error);
    }
  }

  private async generateBlogSitemap(): Promise<void> {
    // For now, we'll create a basic blog sitemap
    // In the future, this can be enhanced with actual blog posts
    const urls: SitemapUrl[] = [
      {
        loc: `${this.baseUrl}/blog`,
        changefreq: 'weekly',
        priority: 0.8
      }
    ];

    const xml = this.generateSitemapXml(urls);
    writeFileSync(join(this.publicDir, 'sitemap-blog.xml'), xml);
    console.log('✅ Blog sitemap generated');
  }

  private generateSitemapIndex(): void {
    const sitemaps = [
      `${this.baseUrl}/sitemap.xml`,
      `${this.baseUrl}/sitemap-categories.xml`,
      `${this.baseUrl}/sitemap-courses.xml`,
      `${this.baseUrl}/sitemap-blog.xml`
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    writeFileSync(join(this.publicDir, 'sitemap-index.xml'), xml);
    console.log('✅ Sitemap index generated');
  }

  public async generateAllSitemaps(): Promise<void> {
    console.log('🚀 Starting sitemap generation...');
    
    await this.generateMainSitemap();
    await this.generateCategoriesSitemap();
    await this.generateCoursesSitemap();
    await this.generateBlogSitemap();
    this.generateSitemapIndex();
    
    console.log('🎉 All sitemaps generated successfully!');
  }

  public async generateSitemapForKeyword(keyword: string): Promise<void> {
    // Generate keyword-specific sitemap for better SEO targeting
    const keywordUrls: SitemapUrl[] = [
      {
        loc: `${this.baseUrl}/?q=${encodeURIComponent(keyword)}`,
        changefreq: 'daily',
        priority: 0.9
      }
    ];

    // Add category pages that match the keyword
    try {
      const categories = await Category.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      }).lean();

      categories.forEach(category => {
        keywordUrls.push({
          loc: `${this.baseUrl}/r/${category.slug}`,
          changefreq: 'weekly',
          priority: 0.8
        });
      });

      const xml = this.generateSitemapXml(keywordUrls);
      const filename = `sitemap-${keyword.toLowerCase().replace(/\s+/g, '-')}.xml`;
      writeFileSync(join(this.publicDir, filename), xml);
      console.log(`✅ Keyword sitemap generated for "${keyword}"`);
    } catch (error) {
      console.error(`❌ Error generating keyword sitemap for "${keyword}":`, error);
    }
  }
}

export default SitemapGenerator; 