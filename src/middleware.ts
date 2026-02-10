import { defineMiddleware } from 'astro:middleware';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, redirect, locals } = context;

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
