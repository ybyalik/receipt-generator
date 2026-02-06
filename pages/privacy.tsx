import React from 'react';
import Layout from '../components/Layout';

export default function Privacy() {
  return (
    <Layout breadcrumbs={[{ label: 'Privacy Policy' }]}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            
            <p><strong>Last Updated:</strong> October 20, 2024</p>
            <p>This Privacy Policy explains how <strong>ReceiptGenerator.net</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) collects, uses, and protects the information you provide when using our website and services.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>ReceiptGenerator.net collects limited information necessary to operate and improve our services. We may collect:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Non-personal data such as browser type, device, and usage statistics.</li>
              <li>Optional information you voluntarily provide, such as your email address when contacting support.</li>
              <li>Receipt data generated through the site, which may be temporarily stored for performance or troubleshooting purposes.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Maintain and improve the performance of our service.</li>
              <li>Provide user support and respond to inquiries.</li>
              <li>Analyze site usage to enhance user experience.</li>
            </ul>
            <p>We do not sell, rent, or trade user data with third parties.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Storage and Retention</h2>
            <p>Generated receipts may be stored temporarily on our servers for operational purposes. These receipts are not linked to personal user identities. Users can request deletion of stored receipts by contacting us at <a href="mailto:contact@receiptgenerator.net" className="text-teal-600 hover:text-teal-800 underline">contact@receiptgenerator.net</a>.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Cookies</h2>
            <p>ReceiptGenerator.net may use cookies or similar technologies to improve site functionality and user experience. You can disable cookies in your browser settings, but certain features may not function properly as a result.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Security</h2>
            <p>We implement reasonable technical and administrative safeguards to protect user data from unauthorized access, loss, or misuse. However, no online system is completely secure, and we cannot guarantee absolute protection.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Third-Party Links</h2>
            <p>Our website may contain links to third-party sites. We are not responsible for the content or privacy practices of those websites. We encourage you to review the privacy policies of any external sites you visit.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Children&apos;s Privacy</h2>
            <p>ReceiptGenerator.net is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe that a child has provided us with personal information, please contact us to request its removal.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Request access to or deletion of any personal information we may hold.</li>
              <li>Withdraw consent for data collection where applicable.</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:contact@receiptgenerator.net" className="text-teal-600 hover:text-teal-800 underline">contact@receiptgenerator.net</a>.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Updates to This Policy</h2>
            <p>We may update this Privacy Policy periodically. The most recent version will always be available on this page, with the updated date indicated at the top. Continued use of our website after changes means you accept the revised policy.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact Information</h2>
            <p>If you have any questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:contact@receiptgenerator.net" className="text-teal-600 hover:text-teal-800 underline">contact@receiptgenerator.net</a>.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Governing Law</h2>
            <p>This Privacy Policy shall be governed by and construed in accordance with the laws of the United States and the State of Wyoming.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
