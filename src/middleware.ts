import { defineMiddleware } from 'astro:middleware';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, redirect, locals, cookies } = context;

    // --- Maintenance Mode / Splash Page Check ---
    const publicRoutes = ['/splash', '/api/access', '/admin', '/logo.png', '/favicon.svg', '/favicon.ico'];
    const isPublic = publicRoutes.some(route => url.pathname.startsWith(route));
    const isStaticAsset = url.pathname.match(/\.(css|js|jpg|png|gif|svg|webp)$/);

    if (!isPublic && !isStaticAsset) {
        const hasAccess = cookies.get('site_access')?.value === 'granted';
        if (!hasAccess) {
            return redirect('/splash');
        }
    }
    // -------------------------------------------

    // Protected routes check
    if (url.pathname.startsWith('/exclusive')) {
        if (!isSupabaseConfigured()) {
            console.error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
            return new Response('Server Configuration Error: Database not connected', { status: 500 });
        }

        const accessToken = context.cookies.get('sb-access-token');
        const refreshToken = context.cookies.get('sb-refresh-token');

        if (!accessToken || !refreshToken) {
            return redirect('/login');
        }

        const { data: { user }, error } = await supabase.auth.getUser(accessToken.value);

        if (error || !user) {
            return redirect('/login');
        }

        // Attach user to locals for use in pages/endpoints
        locals.user = user;
    }

    return next();
});
