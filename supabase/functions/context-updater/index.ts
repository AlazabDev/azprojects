import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface ContextUpdaterPayload {
  project_id: string;
  source: 'daftra' | 'magicplan' | 'whatsapp' | 'manual_inspection' | 'system';
  updates: {
    progress_delta?: number;
    new_status?: string;
    budget_spent_delta?: number;
    notes?: string;
    completed_task_ids?: string[];
  };
}

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ContextUpdaterPayload = await req.json();
    const projectId = body.project_id || 'PRJ-ARABESQUE';
    const source = body.source || 'system';
    const updates = body.updates || {};

    // 1. Fetch current project state
    const { data: project, error: fetchErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchErr || !project) {
      return errorResponse(`Project ${projectId} not found`, 404);
    }

    // 2. Compute updated fields
    const updatedProgress = Math.min(100, Math.max(0, (project.progress || 0) + (updates.progress_delta || 0)));
    const updatedActualCost = (Number(project.actual_cost) || 0) + (updates.budget_spent_delta || 0);

    // 3. Update database
    const { data: updatedProject, error: updateErr } = await supabase
      .from('projects')
      .update({
        progress: updates.progress_delta !== undefined ? updatedProgress : project.progress,
        status: updates.new_status || project.status,
        actual_cost: updates.budget_spent_delta !== undefined ? updatedActualCost : project.actual_cost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateErr) {
      return errorResponse(`Failed to update project context: ${updateErr.message}`, 500);
    }

    // 4. Log in Audit Trail
    await supabase.from('audit_logs').insert({
      project_id: projectId,
      action: `CONTEXT_UPDATE_FROM_${source.toUpperCase()}`,
      table_name: 'projects',
      record_id: projectId,
      old_data: { progress: project.progress, actual_cost: project.actual_cost },
      new_data: { progress: updatedProject.progress, actual_cost: updatedProject.actual_cost, notes: updates.notes },
    });

    return jsonResponse({
      success: true,
      project_id: projectId,
      source,
      previous_state: { progress: project.progress, actual_cost: project.actual_cost },
      updated_state: { progress: updatedProject.progress, actual_cost: updatedProject.actual_cost, status: updatedProject.status },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse(error.message || 'Error in context-updater', 500);
  }
});
