import { logger } from './logger';

interface PerformanceMetrics {
  url: string;
  timestamp: Date;
  loadTime: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  userAgent: string;
  ip: string;
}

interface SEOInsights {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  h1Count: number;
  h2Count: number;
  h3Count: number;
  imageCount: number;
  linkCount: number;
  wordCount: number;
  loadTime: number;
  score: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private insights: SEOInsights[] = [];

  // Track page load performance
  public trackPageLoad(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: new Date()
    };

    this.metrics.push(fullMetrics);
    
    // Log performance data
    logger.info(`Performance: ${metrics.url} loaded in ${metrics.loadTime}ms`);
    
    // Alert if performance is poor
    if (metrics.loadTime > 3000) {
      logger.warn(`Slow page load detected: ${metrics.url} took ${metrics.loadTime}ms`);
    }
  }

  // Analyze SEO metrics for a page
  public analyzeSEO(url: string, html: string, title: string, description: string, keywords: string[]): SEOInsights {
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
    const imageCount = (html.match(/<img[^>]*>/gi) || []).length;
    const linkCount = (html.match(/<a[^>]*>/gi) || []).length;
    const wordCount = html.replace(/<[^>]*>/g, '').split(/\s+/).length;

    // Get average load time for this URL
    const urlMetrics = this.metrics.filter(m => m.url === url);
    const avgLoadTime = urlMetrics.length > 0 
      ? urlMetrics.reduce((sum, m) => sum + m.loadTime, 0) / urlMetrics.length 
      : 0;

    // Calculate SEO score (0-100)
    let score = 100;
    
    // Deduct points for missing elements
    if (h1Count === 0) score -= 10;
    if (h1Count > 1) score -= 5; // Multiple H1s are bad
    if (h2Count === 0) score -= 5;
    if (imageCount === 0) score -= 5;
    if (wordCount < 300) score -= 10;
    if (avgLoadTime > 3000) score -= 15;
    if (avgLoadTime > 5000) score -= 10;
    if (description.length < 50) score -= 10;
    if (description.length > 160) score -= 5;
    if (keywords.length === 0) score -= 5;

    const insights: SEOInsights = {
      url,
      title,
      description,
      keywords,
      h1Count,
      h2Count,
      h3Count,
      imageCount,
      linkCount,
      wordCount,
      loadTime: avgLoadTime,
      score: Math.max(0, score)
    };

    this.insights.push(insights);
    
    // Log SEO analysis
    logger.info(`SEO Analysis: ${url} - Score: ${score}/100`);
    
    if (score < 70) {
      logger.warn(`Poor SEO score detected: ${url} - Score: ${score}/100`);
    }

    return insights;
  }

  // Get performance report
  public getPerformanceReport(): any {
    const totalPages = this.metrics.length;
    const avgLoadTime = totalPages > 0 
      ? this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / totalPages 
      : 0;

    const slowPages = this.metrics.filter(m => m.loadTime > 3000);
    const fastPages = this.metrics.filter(m => m.loadTime < 1000);

    return {
      totalPages,
      avgLoadTime: Math.round(avgLoadTime),
      slowPages: slowPages.length,
      fastPages: fastPages.length,
      performanceScore: Math.max(0, 100 - (slowPages.length / totalPages) * 100)
    };
  }

  // Get SEO report
  public getSEOReport(): any {
    const totalPages = this.insights.length;
    const avgScore = totalPages > 0 
      ? this.insights.reduce((sum, i) => sum + i.score, 0) / totalPages 
      : 0;

    const excellentPages = this.insights.filter(i => i.score >= 90);
    const goodPages = this.insights.filter(i => i.score >= 70 && i.score < 90);
    const poorPages = this.insights.filter(i => i.score < 70);

    return {
      totalPages,
      avgScore: Math.round(avgScore),
      excellentPages: excellentPages.length,
      goodPages: goodPages.length,
      poorPages: poorPages.length,
      recommendations: this.generateRecommendations()
    };
  }

  // Generate SEO recommendations
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const avgInsights = this.insights.reduce((acc, insight) => ({
      h1Count: acc.h1Count + insight.h1Count,
      h2Count: acc.h2Count + insight.h2Count,
      wordCount: acc.wordCount + insight.wordCount,
      loadTime: acc.loadTime + insight.loadTime
    }), { h1Count: 0, h2Count: 0, wordCount: 0, loadTime: 0 });

    const avgH1Count = avgInsights.h1Count / this.insights.length;
    const avgWordCount = avgInsights.wordCount / this.insights.length;
    const avgLoadTime = avgInsights.loadTime / this.insights.length;

    if (avgH1Count === 0) {
      recommendations.push("Add H1 headings to all pages for better SEO");
    }
    if (avgWordCount < 500) {
      recommendations.push("Increase content length to improve SEO ranking");
    }
    if (avgLoadTime > 3000) {
      recommendations.push("Optimize page load times for better user experience");
    }

    return recommendations;
  }

  // Track Core Web Vitals
  public trackCoreWebVitals(url: string, vitals: {
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    firstInputDelay?: number;
    cumulativeLayoutShift?: number;
  }): void {
    const metrics = this.metrics.find(m => m.url === url);
    if (metrics) {
      Object.assign(metrics, vitals);
      
      // Log Core Web Vitals
      logger.info(`Core Web Vitals for ${url}:`, {
        FCP: vitals.firstContentfulPaint,
        LCP: vitals.largestContentfulPaint,
        FID: vitals.firstInputDelay,
        CLS: vitals.cumulativeLayoutShift
      });
    }
  }

  // Export data for analysis
  public exportData(): any {
    return {
      performance: this.metrics,
      seo: this.insights,
      report: {
        performance: this.getPerformanceReport(),
        seo: this.getSEOReport()
      }
    };
  }

  // Clear old data (keep last 1000 entries)
  public cleanup(): void {
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    if (this.insights.length > 1000) {
      this.insights = this.insights.slice(-1000);
    }
  }
}

export default PerformanceMonitor; 