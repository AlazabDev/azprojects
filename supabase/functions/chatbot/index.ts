import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { transcribeAudio } from "./speech-to-text.ts";
import { synthesizeSpeech } from "./text-to-speech.ts";
import { handleArabicEngineeringConversation, ConversationTurn } from "./conversation-handler.ts";

interface ChatbotPayload {
  message?: string;
  audio_base64?: string;
  history?: ConversationTurn[];
  project_id?: string;
  enable_voice_output?: boolean;
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

    const body: ChatbotPayload = await req.json();
    let textPrompt = body.message || '';
    const projectId = body.project_id || 'PRJ-ARABESQUE';
    const history = body.history || [];
    const enableVoiceOutput = body.enable_voice_output ?? false;

    // 1. If incoming audio is provided, transcribe it first
    let audioTranscript: string | null = null;
    if (body.audio_base64) {
      const sttResult = await transcribeAudio(body.audio_base64, 'ar');
      textPrompt = sttResult.text;
      audioTranscript = sttResult.text;
    }

    if (!textPrompt) {
      return errorResponse('Either message or audio_base64 is required', 400);
    }

    // 2. Generate response using contextual domain handler
    const replyText = await handleArabicEngineeringConversation(textPrompt, history, projectId, supabase);

    // 3. Synthesize voice if requested
    let voiceOutput: { audio_url: string; format: string; duration_seconds: number } | null = null;
    if (enableVoiceOutput) {
      voiceOutput = await synthesizeSpeech(replyText);
    }

    return jsonResponse({
      success: true,
      input_text: textPrompt,
      is_audio_input: Boolean(audioTranscript),
      transcribed_text: audioTranscript,
      reply: replyText,
      voice_output: voiceOutput,
      project_id: projectId,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse(error.message || 'Error in chatbot function', 500);
  }
});
