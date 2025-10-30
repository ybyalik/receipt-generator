import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import { FiUpload, FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import type { Section, TemplateSettings } from '../lib/types';

export default function AIReceiptGenerator() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Upload image to AI API
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze receipt');
      }

      const aiData = await response.json();

      // Convert AI data to template structure
      const sections: Section[] = [];
      
      // Detect currency from amounts or use USD as default
      const detectedCurrency = aiData.amounts?.currency || aiData.currency || 'USD';
      
      const settings: Partial<TemplateSettings> = {
        font: aiData.font || 'mono',
        currency: detectedCurrency,
        currencyFormat: 'symbol_before',
        receiptWidth: '80mm',
        backgroundTexture: 'none',
        textColor: '#000000',
      };

      // Safely parse numeric values from AI response
      const parseNumber = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      // Header section - use businessLines for complete info
      const headerLines: string[] = [];
      if (aiData.businessName) headerLines.push(aiData.businessName);
      
      // Add ALL business lines (branch, address, etc.)
      if (aiData.businessLines && Array.isArray(aiData.businessLines)) {
        headerLines.push(...aiData.businessLines);
      } else if (aiData.address) {
        const addressLines = aiData.address.split('\n');
        headerLines.push(...addressLines);
      }
      
      // Only add contact info if not already in businessLines
      if (aiData.phone && !headerLines.some(line => line.includes(aiData.phone))) {
        headerLines.push(aiData.phone);
      }
      if (aiData.email && !headerLines.some(line => line.includes(aiData.email))) {
        headerLines.push(aiData.email);
      }
      if (aiData.website && !headerLines.some(line => line.includes(aiData.website))) {
        headerLines.push(aiData.website);
      }

      // Only add header if we have content
      if (headerLines.length > 0) {
        sections.push({
          id: 'header',
          type: 'header',
          alignment: aiData.textAlignment || 'center',
          logo: '',
          logoSize: 64,
          businessDetails: headerLines.join('\n'),
          dividerStyle: 'dashed',
          dividerAtBottom: true,
        });
      }

      // Transaction details section (for bank receipts, payment terminals, etc.)
      if (aiData.transactionDetails && Array.isArray(aiData.transactionDetails) && aiData.transactionDetails.length > 0) {
        sections.push({
          id: 'transaction-details',
          type: 'custom_message',
          alignment: 'left',
          message: aiData.transactionDetails.join('\n'),
          dividerStyle: 'dashed',
          dividerAtBottom: true,
        });
      }

      // Receipt title section
      if (aiData.receiptTitle || aiData.receiptNumber) {
        const titleLines: string[] = [];
        if (aiData.receiptTitle) titleLines.push(aiData.receiptTitle);
        if (aiData.receiptNumber) titleLines.push(`#${aiData.receiptNumber}`);
        
        sections.push({
          id: 'receipt-title',
          type: 'custom_message',
          alignment: aiData.textAlignment || 'center',
          message: titleLines.join('\n'),
          dividerStyle: 'dashed',
          dividerAtBottom: true,
        });
      }

      // Items list
      if (aiData.items && aiData.items.length > 0) {
        // Calculate total from items
        const itemsTotal = aiData.items.reduce((sum: number, item: any) => {
          const qty = parseNumber(item.quantity || 1);
          const price = parseNumber(item.price || 0);
          return sum + (qty * price);
        }, 0);

        sections.push({
          id: 'items',
          type: 'items_list',
          items: aiData.items.map((item: any, idx: number) => ({
            quantity: parseNumber(item.quantity || 1),
            item: item.description || item.name || `Item ${idx + 1}`,
            price: parseNumber(item.price || 0),
          })),
          totalLines: [],
          tax: {
            title: 'Tax',
            value: 0,
          },
          total: {
            title: 'Total',
            price: itemsTotal,
          },
          dividerStyle: 'dashed',
          dividerAtBottom: true,
        });
      }

      // Payment section - handle both old and new structure
      const paymentFields: Array<{ title: string; value: string }> = [];
      
      // Use new amounts structure if available
      const amounts = aiData.amounts || aiData;
      
      if (amounts.subtotal !== undefined && amounts.subtotal !== null) {
        paymentFields.push({ title: 'Subtotal', value: parseNumber(amounts.subtotal).toFixed(2) });
      }
      if (amounts.tax !== undefined && amounts.tax !== null) {
        paymentFields.push({ 
          title: amounts.taxRate ? `Tax (${amounts.taxRate})` : 'Tax', 
          value: parseNumber(amounts.tax).toFixed(2) 
        });
      }
      if (amounts.total !== undefined && amounts.total !== null) {
        paymentFields.push({ title: 'Total', value: parseNumber(amounts.total).toFixed(2) });
      }

      // Handle payment info from new structure
      const paymentInfo = aiData.paymentInfo || {};
      const isCardPayment = paymentInfo.method === 'card' || aiData.paymentMethod === 'card';
      
      if (isCardPayment) {
        if (paymentInfo.cardType || aiData.cardType) {
          paymentFields.push({ title: 'Card Type', value: paymentInfo.cardType || aiData.cardType });
        }
        if (paymentInfo.cardNumber || aiData.cardLast4) {
          paymentFields.push({ title: 'Card', value: paymentInfo.cardNumber || `****${aiData.cardLast4}` });
        }
        if (paymentInfo.amount) {
          paymentFields.push({ title: 'Amount', value: parseNumber(paymentInfo.amount).toFixed(2) });
        }
      }

      // Add approval info if available
      if (aiData.approvalInfo && Array.isArray(aiData.approvalInfo) && aiData.approvalInfo.length > 0) {
        aiData.approvalInfo.forEach((info: string) => {
          // Try to split "Status: Approved" style entries
          if (info.includes(':')) {
            const [key, value] = info.split(':').map((s: string) => s.trim());
            paymentFields.push({ title: key, value: value });
          } else {
            paymentFields.push({ title: 'Status', value: info });
          }
        });
      }

      // Only add payment section if we have fields
      if (paymentFields.length > 0) {
        sections.push({
          id: 'payment',
          type: 'payment',
          paymentType: isCardPayment ? 'card' : 'cash',
          cardFields: isCardPayment ? paymentFields : [],
          cashFields: !isCardPayment ? paymentFields : [],
          dividerStyle: 'dashed',
          dividerAtBottom: true,
        });
      }

      // Date & Time
      if (aiData.date) {
        sections.push({
          id: 'datetime',
          type: 'date_time',
          alignment: aiData.textAlignment || 'center',
          date: aiData.date,
          dateFormat: 'MM/dd/yyyy, h:mm:ss a',
          dividerStyle: 'dashed',
          dividerAtBottom: true,
        });
      }

      // Barcode
      if (aiData.barcode) {
        sections.push({
          id: 'barcode',
          type: 'barcode',
          value: aiData.barcode,
          size: 2,
          length: 50,
          dividerStyle: 'blank',
          dividerAtBottom: false,
        });
      }

      // Footer section - handle both old footerMessage and new footerLines
      const footerLines: string[] = [];
      if (aiData.footerLines && Array.isArray(aiData.footerLines)) {
        footerLines.push(...aiData.footerLines);
      } else if (aiData.footerMessage) {
        footerLines.push(aiData.footerMessage);
      }
      
      if (footerLines.length > 0) {
        sections.push({
          id: 'footer',
          type: 'custom_message',
          alignment: 'center',
          message: footerLines.join('\n'),
          dividerStyle: 'blank',
          dividerAtBottom: false,
        });
      }

      // Store in sessionStorage and redirect to a new template
      const templateData = {
        sections,
        settings,
        fromAI: true,
      };
      
      sessionStorage.setItem('ai-generated-template', JSON.stringify(templateData));
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/ai-result');
      }, 1000);

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>AI Receipt Generator - Upload Image & Create Template Instantly | ReceiptGen</title>
        <meta name="description" content="Upload a receipt image and let our AI automatically extract data to create a customizable template. Powered by advanced vision technology. Try it free!" />
        <meta name="keywords" content="AI receipt generator, receipt OCR, receipt scanner, receipt image to template, automatic receipt maker, AI receipt reader" />
        <meta property="og:title" content="AI Receipt Generator - Upload Image & Create Template Instantly" />
        <meta property="og:description" content="Upload a receipt image and let our AI automatically extract data to create a customizable template. Powered by advanced vision technology." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-navy-900">
                AI Receipt Generator
              </h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                BETA
              </span>
            </div>
            <p className="text-base sm:text-lg text-gray-600">
              Upload a receipt image and let AI automatically create a matching template
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Upload area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Receipt Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="receipt-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="receipt-upload"
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    loading
                      ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full p-4">
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  Receipt analyzed successfully! Redirecting to template editor...
                </p>
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading || success}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                !selectedFile || loading || success
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Analyzing Receipt...
                </>
              ) : success ? (
                <>
                  <FiCheck className="w-5 h-5" />
                  Success!
                </>
              ) : (
                <>
                  <FiUpload className="w-5 h-5" />
                  Generate Template from Receipt
                </>
              )}
            </button>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Upload a clear photo or screenshot of your receipt</li>
                <li>AI will analyze and extract all text and information</li>
                <li>A matching receipt template will be automatically created</li>
                <li>You can then customize and download your receipt</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
