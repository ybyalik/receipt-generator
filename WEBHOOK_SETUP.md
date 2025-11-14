# Webhook Integration Setup Guide

Your webhook endpoint is now configured and ready to receive blog articles from third-party services!

## ✅ What's Been Set Up

1. **Webhook Endpoint**: `/api/webhooks/blog`
2. **Authentication**: Bearer token security (using `WEBHOOK_ACCESS_TOKEN`)
3. **Database Schema**: Extended to support article tags and meta descriptions
4. **Auto-Publishing**: Articles are automatically published to your blog when received

## 🔗 Your Webhook URL

**Production URL** (once deployed):
```
https://your-domain.com/api/webhooks/blog
```

**Development URL** (for testing):
```
https://ce8b2b32-b68a-42d7-abc7-0df77b2388bb-00-cs6rgeh0h3ww.pike.replit.dev/api/webhooks/blog
```

## 🔐 Configuration Details

When setting up the webhook integration on the third-party service platform, provide:

### Integration Name
```
ReceiptGen Blog Integration
```

### Webhook Endpoint
```
https://your-domain.com/api/webhooks/blog
```
*Replace with your actual production domain once deployed*

### Access Token
Your secret token is stored in Replit Secrets as `WEBHOOK_ACCESS_TOKEN`.

**Important**: You need to provide this exact token to the third-party service. They will include it in the `Authorization` header as:
```
Authorization: Bearer YOUR_WEBHOOK_ACCESS_TOKEN
```

## 📋 How It Works

1. **Third-party publishes articles** → They send a POST request to your webhook URL
2. **Authentication verified** → The endpoint checks the Bearer token matches `WEBHOOK_ACCESS_TOKEN`
3. **Articles processed** → Each article is either created (if new) or updated (if exists)
4. **Auto-published** → Articles are set to "published" status immediately
5. **Response sent** → The third-party receives confirmation with success/failure details

## 🎯 What Happens When Articles Arrive

For each article received:
- ✅ **Creates** new blog post if slug doesn't exist
- ✅ **Updates** existing blog post if slug already exists
- ✅ Sets status to `published` automatically
- ✅ Stores all article data including:
  - Title and content (HTML format)
  - Featured image URL
  - Tags array
  - Meta description for SEO
  - Published date

## 📊 Response Format

The webhook returns a detailed response showing what happened:

### Success Response (200/207)
```json
{
  "message": "Webhook processed",
  "processed": 2,
  "successful": 2,
  "failed": 0,
  "results": {
    "success": ["article-slug-1", "article-slug-2"],
    "failed": []
  }
}
```

### Partial Success (207)
If some articles fail, you'll get a 207 status with details:
```json
{
  "message": "Webhook processed",
  "processed": 3,
  "successful": 2,
  "failed": 1,
  "results": {
    "success": ["article-slug-1", "article-slug-2"],
    "failed": [
      {
        "slug": "article-slug-3",
        "error": "Error message here"
      }
    ]
  }
}
```

## ✅ Verification

To verify your webhook is working:

1. **Check the test results** - Two test articles were successfully created:
   - "How to Implement Webhooks"
   - "Best Practices for API Design"

2. **View in admin panel** - Go to `/admin/blog` to see the imported articles

3. **Test with the third-party service** - Publish an article from their platform and verify it appears in your blog

## 🔒 Security Features

- ✅ **Bearer token authentication** - Only requests with valid token are processed
- ✅ **HTTPS required** - Production endpoint must use secure connection
- ✅ **Token stored securely** - Access token kept in Replit Secrets, never exposed in code
- ✅ **Error handling** - Graceful handling of malformed requests
- ✅ **Validation** - Verifies event type and payload structure

## 🚨 Troubleshooting

### Webhook not receiving requests
- Verify the URL is correct and publicly accessible
- Check that you're using HTTPS (not HTTP) in production
- Ensure the endpoint isn't blocked by firewall

### Authentication errors (401)
- Verify the access token matches exactly
- Check for extra spaces in the token
- Ensure "Bearer " prefix is included in Authorization header

### Articles not appearing
- Check `/admin/blog` to see if they were created
- Verify the `status` field is set to "published"
- Check server logs for any processing errors

### Duplicate articles
- The webhook uses `slug` as the unique identifier
- If same slug is sent again, it updates the existing article
- No duplicates will be created

## 📝 Next Steps

1. **Deploy your application** to get a permanent production URL
2. **Update webhook URL** on the third-party platform with your production domain
3. **Test the integration** by publishing an article from their platform
4. **Monitor webhook logs** to ensure articles are being received correctly

## 🧪 Testing Locally

You can test the webhook locally using the provided test script:

```bash
npx tsx scripts/test-webhook.ts
```

This sends a sample payload to your local endpoint and verifies it works correctly.

---

**Questions or Issues?**

If you encounter any problems with the webhook integration, check:
1. Server logs for detailed error messages
2. Database to confirm articles were saved
3. Access token configuration on both sides matches exactly
