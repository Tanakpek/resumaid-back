


export const GOOGLE_OAUTH_ROOT = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_OAUTH_CLIENT_ID = '1044586183876-aq7hmksu9aq656lt1hdouhdcmck2k5ov.apps.googleusercontent.com'
export const GOOGLE_OAUTH_REDIRECT_URI = 'https://127.0.0.1:3000/login/oauth'
export const ORIGIN = process.env.ORIGIN || 'https://127.0.0.1:5173'
const options = {
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    response_type: 'code',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(' ')
}

const qs = new URLSearchParams(options)
export const google_oauth_url = `${GOOGLE_OAUTH_ROOT}?${qs.toString()}`