import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-background py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
                Terms & Conditions
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
                  1. Copyright & Intellectual Property
                </h2>
                <p className="text-muted-foreground mb-6">
                  All content on Unlocked Coding, including but not limited to text, graphics, videos, software, and course materials, is owned by Unlocked Coding or its licensors and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                
                <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Copyright Issues?</h3>
                  <p className="text-muted-foreground mb-3">
                    If you believe your copyright has been infringed, please contact us immediately. We take copyright violations seriously and will resolve all legitimate claims within 48 hours.
                  </p>
                  <a href="/contact" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    Report Copyright Issue
                  </a>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  2. Free Platform Policy
                </h2>
                <p className="text-muted-foreground mb-6">
                  Unlocked Coding is a 100% free educational platform. All courses, tutorials, and learning resources are provided at no cost to users. We believe quality programming education should be accessible to everyone without financial barriers.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  3. Revenue Model
                </h2>
                <p className="text-muted-foreground mb-6">
                  Our platform is supported through advertisements. This allows us to maintain the quality of our educational content while keeping it completely free for all users. We do not sell user data or personal information.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  4. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground mb-6">
                  By accessing and using Unlocked Coding ("the Platform"), you accept and agree to be bound by these terms. If you do not agree to abide by these terms, please do not use this service.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  5. User Accounts
                </h2>
                <p className="text-muted-foreground mb-6">
                  To access our courses, you must create a free account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  6. User Conduct
                </h2>
                <p className="text-muted-foreground mb-6">
                  You agree not to use the Platform to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Upload or transmit harmful, offensive, or inappropriate content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Platform</li>
                  <li>Share account credentials with others</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  7. Privacy & Data Protection
                </h2>
                <p className="text-muted-foreground mb-6">
                  We do not sell your personal data. Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information solely to improve your learning experience.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  8. Service Availability
                </h2>
                <p className="text-muted-foreground mb-6">
                  The Platform is provided "as is" without warranties of any kind. We strive to maintain high availability but do not guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  9. Limitation of Liability
                </h2>
                <p className="text-muted-foreground mb-6">
                  Since our platform is free, our liability is limited to the fullest extent permitted by law. We are not responsible for any decisions made based on the information provided through our courses.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  10. Termination
                </h2>
                <p className="text-muted-foreground mb-6">
                  We may terminate or suspend your account and access to the Platform at any time, with or without cause, with or without notice. Upon termination, your right to use the Platform will cease immediately.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  11. Changes to Terms
                </h2>
                <p className="text-muted-foreground mb-6">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on the Platform. Your continued use of the Platform after such changes constitutes acceptance of the new Terms.
                </p>

                <h2 className="text-2xl font-bold text-foreground mb-6">
                  12. Contact Information
                </h2>
                <p className="text-muted-foreground mb-6">
                  For any questions about these Terms & Conditions, copyright issues, or general inquiries, please contact us:
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
                    By using Unlocked Coding, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. Remember, our platform is completely free and we're committed to democratizing programming education.
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