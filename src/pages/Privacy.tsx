const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 6, 2026</p>

        <section className="space-y-6 text-base leading-relaxed">
          <p>
            Champions Menu ("we", "our", or "the app") respects your privacy. This Privacy
            Policy explains how the app handles information when you use it on your device.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p>
              Champions Menu does <strong>not</strong> collect, store, or transmit any
              personal data. The app does not require registration or a user account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2. Local Storage</h2>
            <p>
              All data you create in the app (favorite recipes, weekly menu, shopping
              list, pantry items) is stored <strong>locally on your device</strong> using
              your browser's local storage. This data never leaves your device and is not
              accessible to us or any third party.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">3. Third-Party Services</h2>
            <p>
              Champions Menu does not use analytics, advertising, tracking pixels, or any
              third-party SDKs that collect user data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Children's Privacy</h2>
            <p>
              The app is suitable for all ages and does not knowingly collect any
              information from children.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">5. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be
              posted on this page with an updated date.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us by
              email through the support page.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;