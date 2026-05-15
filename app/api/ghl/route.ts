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

// Target pipeline name — partial match, case insensitive
const TARGET_PIPELINE = 'land clearing';

export async function GET() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) {
    return NextResponse.json({ error: 'GHL not configured' }, { status: 400 });
  }

  try {
    // Get all pipelines
    const pipelinesData = await ghlFetch(`/opportunities/pipelines?locationId=${locationId}`, apiKey);
    const allPipelines: { id: string; name: string; stages: { id: string; name: string; position?: number }[] }[] =
      pipelinesData.pipelines || [];

    // Find target pipeline — "Land Clearing"
    const targetPipeline = allPipelines.find(p =>
      p.name.toLowerCase().includes(TARGET_PIPELINE)
    ) || allPipelines[0]; // fallback to first pipeline

    if (!targetPipeline) {
      return NextResponse.json({ error: 'No pipeline found', pipelines: [] }, { status: 200 });
    }

    // Sort stages by position
    const sortedStages = [...(targetPipeline.stages || [])].sort((a, b) => (a.position || 0) - (b.position || 0));

    // Build stage map for this pipeline
    const stageMap: Record<string, { name: string; position: number }> = {};
    sortedStages.forEach((s, idx) => {
      stageMap[s.id] = { name: s.name, position: idx };
    });

    // Get all opportunities for this specific pipeline
    const oppsData = await ghlFetch(
      `/opportunities/search?location_id=${locationId}&pipeline_id=${targetPipeline.id}&limit=100`,
      apiKey
    );
    const opportunities = oppsData.opportunities || [];

    const deals = opportunities.map((opp: {
      id: string;
      name: string;
      status: string;
      monetaryValue?: number;
      pipelineStageId?: string;
      contact?: { name?: string; phone?: string };
      updatedAt?: string;
      createdAt?: string;
    }) => ({
      id: opp.id,
      name: opp.name,
      status: opp.status, // open / won / lost / abandoned
      value: opp.monetaryValue || 0,
      stageId: opp.pipelineStageId || '',
      stageName: stageMap[opp.pipelineStageId || '']?.name || 'Unknown',
      stagePosition: stageMap[opp.pipelineStageId || '']?.position ?? 99,
      contact: opp.contact?.name || '',
      phone: opp.contact?.phone || '',
      updatedAt: opp.updatedAt || '',
      createdAt: opp.createdAt || '',
    }));

    // Sort deals by stage position
    deals.sort((a: { stagePosition: number }, b: { stagePosition: number }) => a.stagePosition - b.stagePosition);

    // Group ALL deals by stage (including won/lost) — show full pipeline
    const byStage: Record<string, {
      stageName: string;
      stagePosition: number;
      deals: typeof deals;
      total: number;
      isTerminal: boolean;
    }> = {};

    // Initialize all stages (even empty ones)
    sortedStages.forEach((s, idx) => {
      byStage[s.id] = {
        stageName: s.name,
        stagePosition: idx,
        deals: [],
        total: 0,
        isTerminal: s.name.toLowerCase().includes('closed') ||
                    s.name.toLowerCase().includes('won') ||
                    s.name.toLowerCase().includes('lost'),
      };
    });

    // Fill deals into stages
    for (const deal of deals) {
      if (byStage[deal.stageId]) {
        byStage[deal.stageId].deals.push(deal);
        byStage[deal.stageId].total += deal.value;
      }
    }

    // Active deals (open only) for pipeline value
    const activeDeals = deals.filter((d: { status: string }) => d.status === 'open');
    const totalPipelineValue = activeDeals.reduce((s: number, d: { value: number }) => s + d.value, 0);
    const totalAllValue = deals.reduce((s: number, d: { value: number }) => s + d.value, 0);

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

    // Contacts count
    const contactsData = await ghlFetch(`/contacts/?locationId=${locationId}&limit=1`, apiKey).catch(() => ({ total: 0 }));

    return NextResponse.json({
      pipelineName: targetPipeline.name,
      pipelineId: targetPipeline.id,
      stages: sortedStages,
      deals,
      activeDeals,
      byStage,
      totalPipelineValue,  // only open deals
      totalAllValue,       // all deals including won/lost
      totalContacts: contactsData.total || 0,
      appointments,
      wonDeals: deals.filter((d: { status: string }) => d.status === 'won').length,
      lostDeals: deals.filter((d: { status: string }) => d.status === 'lost').length,
      openDeals: activeDeals.length,
    });

  } catch (error) {
    console.error('GHL error:', error);
    return NextResponse.json({ error: 'GHL error', details: String(error) }, { status: 500 });
  }
}
