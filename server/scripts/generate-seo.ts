import { connectDB } from '../../db';
import SitemapGenerator from '../utils/sitemap-generator';
import SEOOptimizer from '../utils/seo-optimizer';
import Category from '../models/Category';
import Course from '../models/Course';

async function generateAllSEO() {
  try {
    console.log('🚀 Starting comprehensive SEO generation...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Initialize generators
    const sitemapGenerator = new SitemapGenerator();
    const seoOptimizer = new SEOOptimizer();

    // Generate all sitemaps
    console.log('\n📋 Generating sitemaps...');
    await sitemapGenerator.generateAllSitemaps();

    // Generate keyword-specific sitemaps
    console.log('\n🎯 Generating keyword sitemaps...');
    const targetKeywords = [
      'unlockedcoding',
      'harkirat',
      'cohort',
      'cohort 3.0',
      'cohort 2.0',
      'programming',
      'web development',
      'coding bootcamp'
    ];

    for (const keyword of targetKeywords) {
      await sitemapGenerator.generateSitemapForKeyword(keyword);
    }

    // Generate enhanced robots.txt
    console.log('\n🤖 Generating enhanced robots.txt...');
    seoOptimizer.generateEnhancedRobotsTxt();

    // Generate keyword sitemap
    console.log('\n🔍 Generating keyword sitemap...');
    await seoOptimizer.generateKeywordSitemap(targetKeywords);

    // Generate SEO content for each keyword
    console.log('\n📝 Generating SEO content for keywords...');
    for (const keyword of targetKeywords) {
      const seoConfig = seoOptimizer.generateKeywordOptimizedContent(keyword);
      console.log(`✅ Generated SEO config for "${keyword}": ${seoConfig.title}`);
    }

    // Generate course-specific SEO data
    console.log('\n📚 Generating course SEO data...');
    const courses = await Course.find({ isPublished: true }).populate('categoryId').lean();
    for (const course of courses) {
      const courseSchema = seoOptimizer.generateCourseSchema(course);
      console.log(`✅ Generated course schema for "${course.title}"`);
    }

    // Generate category-specific SEO data
    console.log('\n📂 Generating category SEO data...');
    const categories = await Category.find({}).lean();
    for (const category of categories) {
      const breadcrumbSchema = seoOptimizer.generateBreadcrumbSchema(`/r/${category.slug}`, category.name);
      console.log(`✅ Generated breadcrumb schema for "${category.name}"`);
    }

    console.log('\n🎉 All SEO optimizations completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Generated ${targetKeywords.length} keyword sitemaps`);
    console.log(`- Generated ${courses.length} course schemas`);
    console.log(`- Generated ${categories.length} category schemas`);
    console.log(`- Enhanced robots.txt with keyword directives`);
    console.log(`- Created comprehensive sitemap index`);

    console.log('\n🔗 Sitemap URLs:');
    console.log('- https://unlockedcoding.com/sitemap.xml');
    console.log('- https://unlockedcoding.com/sitemap-courses.xml');
    console.log('- https://unlockedcoding.com/sitemap-categories.xml');
    console.log('- https://unlockedcoding.com/sitemap-blog.xml');
    console.log('- https://unlockedcoding.com/sitemap-keywords.xml');

    console.log('\n🎯 Target Keywords Optimized:');
    targetKeywords.forEach(keyword => {
      console.log(`- ${keyword}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating SEO optimizations:', error);
    process.exit(1);
  }
}

// Run the script
generateAllSEO(); 