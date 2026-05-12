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
  if (!res.ok) throw new Error(`GHL ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function GET() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 400 });
  }

  try {
    // Get pipelines WITH stages
    const pipelinesData = await ghlFetch(`/opportunities/pipelines?locationId=${locationId}`, apiKey);
    const pipelines: { id: string; name: string; stages: { id: string; name: string }[] }[] =
      pipelinesData.pipelines || [];

    // Build stage map: stageId -> stageName
    const stageMap: Record<string, string> = {};
    for (const pipeline of pipelines) {
      for (const stage of pipeline.stages || []) {
        stageMap[stage.id] = stage.name;
      }
    }

    // Get all opportunities
    const oppsData = await ghlFetch(
      `/opportunities/search?location_id=${locationId}&limit=100`,
      apiKey
    );
    const opportunities = oppsData.opportunities || [];

    const deals = opportunities.map((opp: {
      id: string;
      name: string;
      status: string;
      monetaryValue?: number;
      pipelineId?: string;
      pipelineStageId?: string;
      contact?: { name?: string };
      updatedAt?: string;
    }) => ({
      id: opp.id,
      name: opp.name,
      status: opp.status,          // open / won / lost / abandoned
      value: opp.monetaryValue || 0,
      pipelineId: opp.pipelineId || '',
      stageId: opp.pipelineStageId || '',
      stageName: stageMap[opp.pipelineStageId || ''] || opp.status || 'Unknown',
      contact: opp.contact?.name || '',
      updatedAt: opp.updatedAt || '',
    }));

    const activeDeals = deals.filter((d: { status: string }) => d.status === 'open');
    const totalPipelineValue = activeDeals.reduce((s: number, d: { value: number }) => s + d.value, 0);

    // Group by stage
    const byStage: Record<string, { stageName: string; deals: typeof deals; total: number }> = {};
    for (const deal of activeDeals) {
      if (!byStage[deal.stageId]) {
        byStage[deal.stageId] = { stageName: deal.stageName, deals: [], total: 0 };
      }
      byStage[deal.stageId].deals.push(deal);
      byStage[deal.stageId].total += deal.value;
    }

    // Contacts
    const contactsData = await ghlFetch(`/contacts/?locationId=${locationId}&limit=1`, apiKey).catch(() => ({ total: 0 }));
    const totalContacts = contactsData.total || 0;

    // Appointments
    let appointments: { id: string; title: string; status: string; startTime: string; contact: string }[] = [];
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 3600000);
      const apptData = await ghlFetch(
        `/calendars/events?locationId=${locationId}&startTime=${weekAgo.toISOString()}&endTime=${now.toISOString()}`,
        apiKey
      );
      appointments = (apptData.events || []).slice(0, 15).map((e: {
        id: string; title?: string; status?: string; startTime?: string; contact?: { name?: string };
      }) => ({
        id: e.id,
        title: e.title || 'Call',
        status: e.status || '',
        startTime: e.startTime || '',
        contact: e.contact?.name || '',
      }));
    } catch { /* calendar optional */ }

    return NextResponse.json({
      deals,
      activeDeals,
      totalPipelineValue,
      byStage,
      pipelines: pipelines.map(p => ({ id: p.id, name: p.name, stages: p.stages })),
      totalContacts,
      appointments,
      wonDeals: deals.filter((d: { status: string }) => d.status === 'won').length,
      lostDeals: deals.filter((d: { status: string }) => d.status === 'lost').length,
    });

  } catch (error) {
    console.error('GHL error:', error);
    return NextResponse.json({ error: 'GHL error', details: String(error) }, { status: 500 });
  }
}
