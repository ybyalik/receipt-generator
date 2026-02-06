import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Terms() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
            
            <p><strong>Last Updated:</strong> October 20, 2024</p>
            <p>Welcome to <strong>ReceiptGenerator.net</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our website and services, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using our site. If you do not agree with these terms, you must not use our services.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using ReceiptGenerator.net, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, along with our <Link href="/privacy" className="text-teal-600 hover:text-teal-800 underline">Privacy Policy</Link>. These terms apply to all visitors, users, and anyone who accesses or uses our service.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Purpose of ReceiptGenerator.net</h2>
            <p>ReceiptGenerator.net is an online tool designed to help users recreate lost receipts, generate sample receipts for record-keeping, or create mock receipts for presentations, design, or educational purposes. Our service is intended solely for lawful and legitimate uses, such as:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Reconstructing missing receipts for personal bookkeeping or warranty purposes.</li>
              <li>Designing or showcasing sample receipts in business, marketing, or educational contexts.</li>
              <li>Generating templates for illustrative or entertainment use.</li>
            </ul>
            <p>Any misuse of our platform for deceptive or illegal purposes is strictly prohibited.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Prohibited Uses</h2>
            <p>You agree not to use ReceiptGenerator.net for:</p>
            <ul className="list-disc pl-6 my-4">
              <li>Creating fake receipts for refunds, reimbursements, or tax evasion.</li>
              <li>Submitting receipts to obtain financial gain through deception.</li>
              <li>Misrepresenting transactions to businesses, financial institutions, or government agencies.</li>
              <li>Violating any applicable law, regulation, or third-party rights.</li>
            </ul>
            <p>We reserve the right to suspend or terminate any user account or access to our site if we reasonably believe it is being used for fraudulent or unlawful purposes. We may also cooperate with law enforcement authorities as required.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. User-Generated Content and Intellectual Property</h2>
            <p>ReceiptGenerator.net provides receipt templates that users can customize. You are solely responsible for the content you create, including any business names, logos, or trademarks you upload or enter.</p>
            <p>By using our platform, you agree that:</p>
            <ul className="list-disc pl-6 my-4">
              <li>You have the right to use any brand elements or information included in your generated receipts.</li>
              <li>ReceiptGenerator.net does not claim ownership of user-generated receipts.</li>
              <li>We are not liable for copyright or trademark violations resulting from user content.</li>
            </ul>
            <p>If you believe your intellectual property rights are being infringed, please contact us at <a href="mailto:contact@receiptgenerator.net" className="text-teal-600 hover:text-teal-800 underline">contact@receiptgenerator.net</a>.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Storage and Use of Generated Receipts</h2>
            <p>To improve user experience, ReceiptGenerator.net may temporarily store generated receipts for system performance, troubleshooting, or demonstration purposes. We do not associate receipts with personal data unless voluntarily provided by the user. If you wish to have a generated receipt permanently removed from our servers, please contact us directly.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. User Responsibility</h2>
            <p>You acknowledge that:</p>
            <ul className="list-disc pl-6 my-4">
              <li>You are fully responsible for how you use the receipts generated through our service.</li>
              <li>ReceiptGenerator.net and its operators assume no liability for any harm, loss, or legal consequences resulting from misuse.</li>
              <li>You agree to indemnify and hold harmless ReceiptGenerator.net, its owners, employees, and affiliates from any claims arising from your use of the service.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Disclaimer of Warranties</h2>
            <p>ReceiptGenerator.net is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no representations or warranties of any kind, express or implied, including but not limited to accuracy or authenticity of generated receipts, continuous or error-free operation, or suitability for a specific purpose. We cannot guarantee that receipts created on our platform will be accepted by any business, financial institution, or third party.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
            <p>In no event shall ReceiptGenerator.net, its owners, affiliates, or employees be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our service, inaccuracies or errors in generated receipts, or unauthorized use or access to our systems. Your sole and exclusive remedy for dissatisfaction with the service is to stop using ReceiptGenerator.net.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Payment and Refund Policy</h2>
            <p>Some features of ReceiptGenerator.net may require a one-time payment or premium subscription. All purchases are final and non-refundable, except where required by applicable law. If you experience technical issues with a paid feature, contact our support team for resolution.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Termination of Access</h2>
            <p>We reserve the right to suspend or permanently terminate access to our services without prior notice if we believe you have violated these Terms or engaged in prohibited behavior.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Privacy and Data Protection</h2>
            <p>We value your privacy. ReceiptGenerator.net collects minimal user data necessary to operate the service effectively. We do not sell or share user data with third parties. For more details, please refer to our <Link href="/privacy" className="text-teal-600 hover:text-teal-800 underline">Privacy Policy</Link>.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Modifications to Terms</h2>
            <p>We may revise these Terms and Conditions from time to time. Updates will be posted on this page with a new &quot;Last Updated&quot; date. Continued use of our website after changes constitutes acceptance of the updated terms.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Governing Law</h2>
            <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of the United States and the State of Wyoming, without regard to conflict of law principles. Any disputes arising from or related to these Terms shall be handled in the appropriate courts located within the State of Wyoming.</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Information</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:contact@receiptgenerator.net" className="text-teal-600 hover:text-teal-800 underline">contact@receiptgenerator.net</a>.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
