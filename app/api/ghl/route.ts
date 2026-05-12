import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GHL_API = 'https://services.leadconnectorhq.com';

async function ghlFetch(path: string, apiKey: string) {
  const res = await fetch(`${GHL_API}${path}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
  });
  if (!res.ok) throw new Error(`GHL error: ${res.status}`);
  return res.json();
}

export async function GET() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 400 });
  }

  try {
    // Get pipelines
    const pipelinesData = await ghlFetch(`/opportunities/pipelines?locationId=${locationId}`, apiKey);
    const pipelines = pipelinesData.pipelines || [];

    // Get all opportunities (deals)
    const oppsData = await ghlFetch(`/opportunities/search?location_id=${locationId}&limit=50`, apiKey);
    const opportunities = oppsData.opportunities || [];

    // Calculate pipeline value
    const pipelineDeals = opportunities.map((opp: {
      id: string;
      name: string;
      status: string;
      monetaryValue?: number;
      pipelineStageId?: string;
      contact?: { name?: string; email?: string };
      updatedAt?: string;
    }) => ({
      id: opp.id,
      name: opp.name,
      status: opp.status,
      value: opp.monetaryValue || 0,
      stage: opp.pipelineStageId,
      contact: opp.contact?.name || '',
      updatedAt: opp.updatedAt,
    }));

    const totalPipelineValue = pipelineDeals
      .filter((d: { status: string }) => d.status !== 'lost' && d.status !== 'won')
      .reduce((sum: number, d: { value: number }) => sum + d.value, 0);

    // Get contacts count
    const contactsData = await ghlFetch(`/contacts/?locationId=${locationId}&limit=1`, apiKey);
    const totalContacts = contactsData.total || 0;

    // Get recent appointments/calls
    let appointments: {
      id: string;
      title: string;
      status: string;
      startTime: string;
      contact?: string;
    }[] = [];
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 3600000);
      const apptData = await ghlFetch(
        `/calendars/events?locationId=${locationId}&startTime=${weekAgo.toISOString()}&endTime=${now.toISOString()}`,
        apiKey
      );
      appointments = (apptData.events || []).slice(0, 10).map((e: {
        id: string;
        title?: string;
        status?: string;
        startTime?: string;
        contact?: { name?: string };
      }) => ({
        id: e.id,
        title: e.title || 'Call',
        status: e.status || '',
        startTime: e.startTime || '',
        contact: e.contact?.name || '',
      }));
    } catch {
      // Calendar endpoint might not be available
    }

    return NextResponse.json({
      pipelines: pipelines.length,
      deals: pipelineDeals,
      totalPipelineValue,
      totalContacts,
      appointments,
      wonDeals: pipelineDeals.filter((d: { status: string }) => d.status === 'won').length,
      activDeals: pipelineDeals.filter((d: { status: string }) => d.status !== 'lost' && d.status !== 'won').length,
    });

  } catch (error) {
    console.error('GHL API error:', error);
    return NextResponse.json({ error: 'GHL error', details: String(error) }, { status: 500 });
  }
}
