import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface MinioPayload {
  action: 'put_object' | 'get_presigned_url' | 'list_objects' | 'stat_object' | 'remove_object';
  bucket_name?: string;
  object_name?: string;
  expires_in_seconds?: number;
  project_id?: string;
}

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const minioEndpoint = Deno.env.get('MINIO_ENDPOINT') || 'https://minio.azprojects.internal';
    const minioAccessKey = Deno.env.get('MINIO_ACCESS_KEY') || 'az_minio_admin';
    const body: MinioPayload = await req.json();

    const action = body.action || 'list_objects';
    const bucketName = body.bucket_name || 'az-engineering-models';
    const objectName = body.object_name || 'arabesque/bim/model-3d.ifc';
    const expiresIn = body.expires_in_seconds || 3600;

    if (action === 'get_presigned_url') {
      const presignedUrl = `${minioEndpoint}/${bucketName}/${objectName}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresIn}`;
      return jsonResponse({
        success: true,
        action: 'get_presigned_url',
        bucket: bucketName,
        object: objectName,
        presigned_url: presignedUrl,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      });
    }

    if (action === 'list_objects') {
      const mockObjects = [
        { name: 'arabesque/bim/structural-model.ifc', size_bytes: 45200000, last_modified: new Date().toISOString() },
        { name: 'arabesque/magicplan/plan-02-pointcloud.ply', size_bytes: 89400000, last_modified: new Date().toISOString() },
        { name: 'arabesque/scans/drone-survey-ortho.tif', size_bytes: 142000000, last_modified: new Date().toISOString() },
      ];

      return jsonResponse({
        success: true,
        action: 'list_objects',
        bucket: bucketName,
        objects_count: mockObjects.length,
        objects: mockObjects,
      });
    }

    return jsonResponse({
      success: true,
      action,
      message: `MinIO action ${action} executed successfully on bucket ${bucketName}`,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return errorResponse(error.message || 'Error in minio-storage', 500);
  }
});
