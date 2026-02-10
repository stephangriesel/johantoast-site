import type { APIRoute } from 'astro';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ params, locals, redirect }) => {
    const { key } = params;

    if (!key) {
        return new Response('Video key not found', { status: 404 });
    }

    // Find video in content collection (simulating DB/CMS lookup)
    const videos = await getCollection('videos');
    const video = videos.find((v) => v.data.s3_key === key);

    if (!video) {
        // Fallback: If not in CMS, assume protected by default or handle as error
        // unique handling required? For now return 404
        return new Response('Video metadata not found', { status: 404 });
    }

    const isProtected = video.data.is_protected;

    // Authorization Check
    if (isProtected) {
        if (!locals.user) {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    // Generate Signed URL
    const s3Client = new S3Client({
        region: 'us-east-1', // Set your region or make env var
        credentials: {
            accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    const command = new GetObjectCommand({
        Bucket: import.meta.env.S3_BUCKET_NAME,
        Key: key,
    });

    try {
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return redirect(signedUrl);
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return new Response('Error generating video URL', { status: 500 });
    }
};
