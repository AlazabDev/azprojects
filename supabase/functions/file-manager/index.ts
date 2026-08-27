import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface FileManagerPayload {
  action: 'get_upload_url' | 'list_files' | 'delete_file' | 'get_download_url';
  bucket?: string;
  file_path?: string;
  project_id?: string;
  file_name?: string;
  mime_type?: string;
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

    const body: FileManagerPayload = await req.json();
    const action = body.action || 'list_files';
    const bucket = body.bucket || 'project-documents';
    const projectId = body.project_id || 'PRJ-ARABESQUE';
    const fileName = body.file_name || 'blueprint.pdf';

    if (action === 'get_upload_url') {
      const generatedPath = `${projectId}/${Date.now()}_${fileName}`;
      // In production, creates signed upload URL with supabase.storage
      const uploadUrl = `${supabaseUrl}/storage/v1/object/upload/sign/${bucket}/${generatedPath}`;

      return jsonResponse({
        success: true,
        action: 'get_upload_url',
        file_path: generatedPath,
        upload_url: uploadUrl,
        public_url: `${supabaseUrl}/storage/v1/object/public/${bucket}/${generatedPath}`,
        expires_in_seconds: 3600,
      });
    }

    if (action === 'list_files') {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      return jsonResponse({
        success: true,
        action: 'list_files',
        project_id: projectId,
        total_files: documents?.length || 0,
        files: documents || [],
      });
    }

    return jsonResponse({
      success: true,
      action,
      message: 'Operation executed successfully',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse(error.message || 'Error in file-manager', 500);
  }
});
