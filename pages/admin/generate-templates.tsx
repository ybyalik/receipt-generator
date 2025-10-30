import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { FiLoader, FiCheckCircle, FiXCircle, FiZap } from 'react-icons/fi';

interface GenerationResult {
  success: boolean;
  industry: string;
  template?: any;
  style?: string;
  error?: string;
}

export default function GenerateTemplates() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [industries, setIndustries] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);

  useEffect(() => {
    if (user && !isAdmin()) {
      router.push('/');
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin()) {
    return <Layout><div className="py-12 text-center">Access denied. Admin only.</div></Layout>;
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const industryList = industries
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    if (industryList.length === 0) {
      alert('Please enter at least one receipt type');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industries: industryList,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate templates. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI Template Generator</h1>
          <p className="text-gray-600">
            Generate professional receipt templates with AI. Enter receipt types below (one per line for bulk generation).
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <form onSubmit={handleGenerate}>
            <div className="mb-4">
              <label htmlFor="industries" className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Types
              </label>
              <textarea
                id="industries"
                value={industries}
                onChange={(e) => setIndustries(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
                placeholder="Hair Salon&#10;Plumbing Service&#10;Veterinary Clinic&#10;Landscaping&#10;Photography Studio"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter one receipt type per line. AI will generate unique templates with varied designs.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <FiZap className="text-blue-600" />
                How It Works
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• AI generates realistic business names, addresses, and items for each type</li>
                <li>• Each template gets a unique visual style (Furniture, Pawn Shop, or Minimal)</li>
                <li>• Different fonts, divider styles, and section arrangements</li>
                <li>• Automatically creates URL-friendly slugs</li>
                <li>• Skips duplicates if template already exists</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !industries.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiZap />
                  Generate Templates
                </>
              )}
            </button>
          </form>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Generation Results</h2>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <FiCheckCircle /> {successCount} succeeded
                </span>
                {failCount > 0 && (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    <FiXCircle /> {failCount} failed
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-md border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <FiCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <FiXCircle className="text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {result.industry}
                        {result.success && result.template && (
                          <span className="ml-2 text-sm text-gray-600">
                            → {result.template.name}
                          </span>
                        )}
                      </p>
                      {result.success && result.template && (
                        <div className="mt-1 text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Slug:</span>{' '}
                            <a
                              href={`/template/${result.template.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {result.template.slug}
                            </a>
                          </p>
                          <p>
                            <span className="font-medium">Style:</span>{' '}
                            <span className="capitalize">{result.style}</span>
                          </p>
                          <p>
                            <span className="font-medium">Font:</span>{' '}
                            {result.template.settings.font}
                          </p>
                        </div>
                      )}
                      {!result.success && result.error && (
                        <p className="mt-1 text-sm text-red-700">{result.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {successCount > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  ✨ {successCount} template{successCount !== 1 ? 's' : ''} created successfully!{' '}
                  <a href="/admin" className="font-medium text-blue-600 hover:underline">
                    View all templates →
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
