import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const data = await request.formData();
    const password = data.get('password');

    // Simple hardcoded password for now - User can change this later
    // Ideally this should be import.meta.env.SITE_PASSWORD
    const CORRECT_PASSWORD = import.meta.env.SITE_PASSWORD || 'toast';

    if (password === CORRECT_PASSWORD) {
        // Set cookie for 1 day
        cookies.set('site_access', 'granted', {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD, // Secure in production
            maxAge: 60 * 60 * 24
        });
        return redirect('/');
    }

    return redirect('/splash?error=invalid');
};
