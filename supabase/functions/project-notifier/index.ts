import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface NotifierPayload {
  project_id: string;
  title: string;
  message: string;
  type?: 'task_assignment' | 'milestone_reached' | 'cost_alert' | 'whatsapp' | 'warning' | 'system';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  target_user_id?: string;
  send_whatsapp?: boolean;
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

    const body: NotifierPayload = await req.json();
    const projectId = body.project_id || 'PRJ-ARABESQUE';
    const title = body.title;
    const message = body.message;
    const type = body.type || 'system';
    const priority = body.priority || 'normal';

    if (!title || !message) {
      return errorResponse('title and message are required', 400);
    }

    // 1. Insert in-app notification
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        project_id: projectId,
        user_id: body.target_user_id || null,
        title,
        message,
        type,
        priority,
        is_read: false,
      })
      .select()
      .single();

    if (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    // 2. If send_whatsapp requested, log outgoing message
    let whatsappRecord = null;
    if (body.send_whatsapp) {
      const { data: waMsg } = await supabase
        .from('whatsapp_messages')
        .insert({
          project_id: projectId,
          sender_name: 'منظومة AzProjects الآلية',
          sender_phone: '+966500000000',
          direction: 'outgoing',
          content: `🔔 *تنبيه من مؤسسة العزب:*\n${title}\n${message}`,
          media_type: 'text',
          status: 'delivered',
        })
        .select()
        .single();
      whatsappRecord = waMsg;
    }

    return jsonResponse({
      success: true,
      notification,
      whatsapp: whatsappRecord,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse(error.message || 'Error in project-notifier', 500);
  }
});
