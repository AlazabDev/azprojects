import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface ConversationManagerPayload {
  action: 'save_turn' | 'get_history' | 'clear_session' | 'summarize_context';
  session_id: string;
  user_id?: string;
  project_id?: string;
  message?: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, unknown>;
  };
  limit?: number;
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

    const body: ConversationManagerPayload = await req.json();
    const action = body.action || 'get_history';
    const sessionId = body.session_id || 'session-default';
    const projectId = body.project_id || 'PRJ-ARABESQUE';

    if (action === 'save_turn' && body.message) {
      // In persistent production, store in chat memory table or audit log
      const turnRecord = {
        session_id: sessionId,
        project_id: projectId,
        role: body.message.role,
        content: body.message.content,
        created_at: new Date().toISOString(),
      };

      return jsonResponse({
        success: true,
        action: 'save_turn',
        saved: turnRecord,
      });
    }

    if (action === 'get_history') {
      const mockHistory = [
        {
          role: 'system',
          content: 'أنت الوكيل الهندسي المتخصص لمؤسسة العزب في تشييد فيلا أرابيسك التراثية وفق كود البناء السعودي SBC 304 وأمر عمل دفترة #17 ومخطط MagicPlan #2.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          role: 'user',
          content: 'ما هي حالة أمر العمل رقم 17 ومخطط الدور الأرضي؟',
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          role: 'assistant',
          content: 'أمر العمل #17 في دفترة بميزانية 1.85M ر.س بنسبة إنجاز 48%، ومخطط الدور الأرضي رقم 2 معتمد بمساحة 320.5 م² متضمناً بهو الأرابيسك المفتوح.',
          created_at: new Date(Date.now() - 1750000).toISOString(),
        },
      ];

      return jsonResponse({
        success: true,
        action: 'get_history',
        session_id: sessionId,
        history: mockHistory,
      });
    }

    return jsonResponse({
      success: true,
      action,
      session_id: sessionId,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse(error.message || 'Error in conversation-manager', 500);
  }
});
