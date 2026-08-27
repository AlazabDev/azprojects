import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface WhatsAppIncomingPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      value?: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        contacts?: Array<{
          profile?: { name?: string };
          wa_id?: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: 'text' | 'image' | 'audio' | 'document' | 'video' | 'location';
          text?: { body: string };
          image?: { id: string; mime_type: string; sha256: string; caption?: string };
          audio?: { id: string; mime_type: string; voice?: boolean };
          document?: { id: string; filename: string; mime_type: string; caption?: string };
          location?: { latitude: number; longitude: number; name?: string; address?: string };
        }>;
      };
      field?: string;
    }>;
  }>;
  // Manual direct testing payload support
  sender_name?: string;
  sender_phone?: string;
  content?: string;
  project_id?: string;
  media_url?: string;
  media_type?: string;
}

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  // Webhook verification for Meta WhatsApp Cloud API (GET request)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const expectedToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'az_whatsapp_secret_2026';

    if (mode === 'subscribe' && token === expectedToken) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('Verification failed', { status: 403 });
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: WhatsAppIncomingPayload = await req.json();

    // Check if it is a Meta Cloud API Webhook or a direct manual message
    let senderPhone = '';
    let senderName = 'مهندس الموقع';
    let content = '';
    let mediaType = 'text';
    let mediaUrl = '';
    let projectId: string | null = null;

    if (body.entry && body.entry[0]?.changes?.[0]?.value?.messages?.[0]) {
      const val = body.entry[0].changes[0].value;
      const msg = val.messages![0];
      const contact = val.contacts?.[0];

      senderPhone = msg.from;
      senderName = contact?.profile?.name || 'مستخدم واتساب الميداني';
      mediaType = msg.type;

      if (msg.type === 'text') {
        content = msg.text?.body || '';
      } else if (msg.type === 'image') {
        content = msg.image?.caption || 'صورة ملتقطة من الموقع الميداني';
        mediaUrl = `https://graph.facebook.com/v18.0/${msg.image?.id}`;
      } else if (msg.type === 'audio') {
        content = 'تسجيل صوتي ميداني من موقع العمل';
        mediaUrl = `https://graph.facebook.com/v18.0/${msg.audio?.id}`;
      } else if (msg.type === 'document') {
        content = msg.document?.caption || `مستند: ${msg.document?.filename || 'مخطط/تقرير'}`;
        mediaUrl = `https://graph.facebook.com/v18.0/${msg.document?.id}`;
      }
    } else {
      // Direct API invocation format
      senderPhone = body.sender_phone || '+966548923410';
      senderName = body.sender_name || 'م. أحمد العزب';
      content = body.content || 'تقرير الموقع الميداني اليومي لمشروع أرابيسك';
      mediaType = body.media_type || 'text';
      mediaUrl = body.media_url || '';
      projectId = body.project_id || 'PRJ-ARABESQUE';
    }

    // Default project match if not found
    if (!projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      projectId = project?.id || 'PRJ-ARABESQUE';
    }

    // Classify intent using simple rules or forward to agent-router
    let aiClassification = 'site_update';
    if (content.includes('خرسانة') || content.includes('صب') || content.includes('حديد') || content.includes('فحص')) {
      aiClassification = 'inspection_report';
    } else if (content.includes('دفترة') || content.includes('فاتورة') || content.includes('مبلغ') || content.includes('تكلفة')) {
      aiClassification = 'cost_inquiry';
    } else if (content.includes('مخطط') || content.includes('تعديل') || content.includes('ماجيك')) {
      aiClassification = 'design_request';
    }

    // Save message to database
    const messageId = `WAM-${Date.now().toString(36).toUpperCase()}`;
    const { data: insertedMessage, error: insertError } = await supabase
      .from('whatsapp_messages')
      .insert({
        id: messageId,
        project_id: projectId,
        sender_name: senderName,
        sender_phone: senderPhone,
        direction: 'incoming',
        content,
        media_url: mediaUrl || null,
        media_type: mediaType,
        ai_classification: aiClassification,
        status: 'processed',
        received_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting whatsapp message:', insertError);
    }

    // Create system notification for critical updates
    if (aiClassification === 'inspection_report' || aiClassification === 'cost_inquiry') {
      await supabase.from('notifications').insert({
        project_id: projectId,
        title: `رسالة واتساب ميدانية جديدة: ${senderName}`,
        message: content.substring(0, 150),
        type: 'whatsapp',
        priority: 'high',
      });
    }

    return jsonResponse({
      success: true,
      message_id: messageId,
      classification: aiClassification,
      project_id: projectId,
      data: insertedMessage,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse(error.message || 'Internal server error in wa-ingestor', 500);
  }
});
