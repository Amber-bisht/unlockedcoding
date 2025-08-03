import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-background py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Last updated: January 15, 2024
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-lg shadow-lg p-8">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  1. We Do NOT Sell Your Data
                </h2>
                <p className="text-muted-foreground mb-6">
                  At Unlocked Coding, we are committed to protecting your privacy. We want to be crystal clear: <strong>we do not sell your personal data to anyone.</strong> Your privacy is our priority, and we only use your information to improve your learning experience.
                </p>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Our Privacy Promise</h3>
                  <p className="text-green-700">
                    We earn money through advertisements, not by selling your data. Your personal information stays with us and is only used to provide you with better educational content.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  2. Information We Collect
                </h2>
                <p className="text-muted-foreground mb-6">
                  We collect minimal information necessary to provide you with the best learning experience:
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Information You Provide
                </h3>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Name and email address (for account creation)</li>
                  <li>Profile information and learning preferences</li>
                  <li>Course progress and completion data</li>
                  <li>Communications with our support team</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Automatically Collected Information
                </h3>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Device information and IP address (for security)</li>
                  <li>Browser type and version (for compatibility)</li>
                  <li>Usage patterns (to improve our platform)</li>
                  <li>Cookies (for better user experience)</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  3. How We Use Your Information
                </h2>
                <p className="text-muted-foreground mb-6">
                  We use your information solely to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Provide and improve our free educational services</li>
                  <li>Track your learning progress and provide personalized recommendations</li>
                  <li>Communicate with you about course updates and new content</li>
                  <li>Ensure platform security and prevent abuse</li>
                  <li>Analyze usage patterns to improve our platform</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  4. Information Sharing Policy
                </h2>
                <p className="text-muted-foreground mb-6">
                  <strong>We do not sell, trade, or rent your personal information.</strong> We may share your information only in these limited circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To trusted service providers who help us operate our platform (under strict confidentiality agreements)</li>
                  <li>To comply with legal requirements or protect our rights</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  5. Data Security
                </h2>
                <p className="text-muted-foreground mb-6">
                  We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted and stored securely.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  6. Cookies and Tracking
                </h2>
                <p className="text-muted-foreground mb-6">
                  We use cookies and similar technologies to enhance your experience and provide personalized content. These help us understand how you use our platform so we can make it better. You can control cookie settings through your browser preferences.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  7. Your Rights
                </h2>
                <p className="text-muted-foreground mb-6">
                  You have complete control over your data:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Access and update your personal information anytime</li>
                  <li>Request deletion of your account and all associated data</li>
                  <li>Opt out of any communications</li>
                  <li>Control cookie preferences</li>
                  <li>Export your data if needed</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  8. Data Retention
                </h2>
                <p className="text-muted-foreground mb-6">
                  We keep your information only as long as necessary to provide our services. If you delete your account, we will remove your personal data within 30 days, except where required by law.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  9. Children's Privacy
                </h2>
                <p className="text-muted-foreground mb-6">
                  Our platform is designed for learners of all ages, but we do not knowingly collect personal information from children under 13 without parental consent. If you believe we have collected such information, please contact us immediately.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  10. Changes to This Policy
                </h2>
                <p className="text-muted-foreground mb-6">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last updated" date.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  11. Contact Us
                </h2>
                <p className="text-muted-foreground mb-6">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-muted-foreground">
                    <strong>Telegram Channel:</strong> <a href="https://t.me/unlocked_coding" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@unlocked_coding</a><br />
                    <strong>Telegram Chat:</strong> <a href="https://t.me/unlocked_chat" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@unlocked_chat</a><br />
                    <strong>Direct Contact:</strong> <a href="https://t.me/unlocked_devs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@unlocked_devs</a><br />
                    <strong>Contact Form:</strong> <a href="/contact" className="text-primary hover:underline">Visit Contact Page</a>
                  </p>
                </div>

                <div className="border-t pt-6 mt-8">
                  <p className="text-sm text-muted-foreground">
                    By using Unlocked Coding, you acknowledge that you have read and understood this Privacy Policy. We're committed to transparency and protecting your privacy while providing free, quality education.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
} 