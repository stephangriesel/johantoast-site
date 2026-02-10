# Video Portal Usage Guide

## 1. Backend Status & Configuration
The "backend" of this portal consists of three parts:
1.  **Supabase**: Handles user accounts and authentication.
2.  **AWS S3**: Stores the actual video files securely.
3.  **Netlify/Astro API**: Generates secure, temporary links so only logged-in users can watch protected videos.

**Is it working?**
The code is ready, but it **requires your credentials** to function. You must update your `.env` file with these real values:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=your-s3-bucket-name
```

## 2. How to Upload Videos
Since we are using a "decoupled" approach (CMS for text, S3 for heavy video), the upload process is done in two steps. This ensures your site stays fast and doesn't get bloated by large video files.

### Step A: Upload the Video File
1.  Log in to your **AWS S3 Console**.
2.  Open your bucket (`your-s3-bucket-name`).
3.  Click **Upload** and select your video file (e.g., `my-movie.mp4`).
4.  **Important**: Keep the file **Private**. Do not make it public. The application will handle secure access.
5.  Copy the **File name** (e.g., `my-movie.mp4`).

### Step B: Create the Content Entry (Local)
1.  **Start the Local Server**: Ensure `npx decap-server` is running in your terminal.
2.  **Access Admin Panel**: Go to `http://localhost:4321/admin/`.
3.  **Login**: Click "Login with Netlify Identity" (it might look like a button, but locally it will bypass auth if the proxy is running correctly, or you can just click Login).
    *   *Note: If the proxy is running, you don't need credentials locally.*
    *   *Ensure `config.yml` has `local_backend: true`.*
2.  Click **New Video**.
3.  Fill in the details:
    *   **Title**: The name of the video.
    *   **Description**: A summary.
    *   **Protected**: Toggle `true` to require login, `false` for public access.
    *   **S3 Key**: Paste the filename from Step A exactly (e.g., `my-movie.mp4`).
4.  Click **Publish**.

## 3. How it Works
When a user visits a video page:
1.  The site checks if the video is **Protected**.
2.  If yes, it checks if the user is **Logged In** (via Supabase).
3.  If authorized, the site secretly talks to AWS S3: *"Hey, this user is good. Give me a temporary link for `my-movie.mp4` valid for 1 hour."*
4.  S3 returns a signed URL, and the video starts playing.
