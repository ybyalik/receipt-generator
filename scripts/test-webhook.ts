const testWebhook = async () => {
  const webhookUrl = 'http://localhost:5000/api/webhooks/blog';
  const accessToken = process.env.WEBHOOK_ACCESS_TOKEN;

  if (!accessToken) {
    console.error('❌ Error: WEBHOOK_ACCESS_TOKEN environment variable is not set');
    console.error('Please set the WEBHOOK_ACCESS_TOKEN secret in Replit Secrets first.');
    process.exit(1);
  }

  const testPayload = {
    event_type: 'publish_articles',
    timestamp: new Date().toISOString(),
    data: {
      articles: [
        {
          id: '123456',
          title: 'How to Implement Webhooks',
          content_markdown: 'Webhooks are a powerful tool for real-time integrations...',
          content_html: '<p>Webhooks are a powerful tool for real-time integrations...</p>',
          meta_description: 'Learn how to implement webhooks in your application',
          created_at: '2023-03-31T10:30:00Z',
          image_url: 'https://example.com/images/webhook-article.jpg',
          slug: 'how-to-implement-webhooks',
          tags: ['webhooks', 'integration', 'api'],
        },
        {
          id: '789012',
          title: 'Best Practices for API Design',
          content_markdown: 'When designing an API, there are several important considerations...',
          content_html: '<p>When designing an API, there are several important considerations...</p>',
          meta_description: 'Discover the best practices for designing robust APIs',
          created_at: '2023-03-31T11:45:00Z',
          image_url: 'https://example.com/images/api-design-article.jpg',
          slug: 'best-practices-for-api-design',
          tags: ['api', 'design', 'best practices'],
        },
      ],
    },
  };

  console.log('Testing webhook endpoint...');
  console.log('URL:', webhookUrl);
  console.log('Access Token:', accessToken.substring(0, 10) + '...');
  console.log('Payload:', JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(testPayload),
    });

    const result = await response.json();
    
    console.log('\nResponse Status:', response.status);
    console.log('Response Body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Webhook test successful!');
    } else {
      console.log('\n❌ Webhook test failed!');
    }
  } catch (error) {
    console.error('\n❌ Error testing webhook:', error);
  }
};

testWebhook();
