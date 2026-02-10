import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, organization, email, phone, audience, message, source } = body;

    const notionApiKey = process.env.NOTION_API_KEY;
    const notionDatabaseId = process.env.NOTION_DATABASE_ID;

    if (!notionApiKey || !notionDatabaseId) {
      console.error('Missing Notion configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: notionDatabaseId },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: name,
                },
              },
            ],
          },
          Organization: {
            rich_text: [
              {
                text: {
                  content: organization,
                },
              },
            ],
          },
          Email: {
            email: email,
          },
          Phone: {
            phone_number: phone || null,
          },
          Audience: {
            select: {
              name: audience,
            },
          },
          Message: {
            rich_text: [
              {
                text: {
                  content: message || 'No message provided',
                },
              },
            ],
          },
          Source: {
            rich_text: [
              {
                text: {
                  content: source || 'website',
                },
              },
            ],
          },
          'Submitted At': {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
      }),
    });

    if (!notionResponse.ok) {
      const errorData = await notionResponse.json();
      console.error('Notion API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
