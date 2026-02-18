// Static routes to run the app. Uses environment variable or fallback to staging
// For local development, set REACT_APP_API_URL=http://localhost:8080/api/ in your .env
export const API_ENDPOINT = process.env.REACT_APP_API_URL || 'https://amrnetstaging-4f7a1b5cd3f3.herokuapp.com/api/';
