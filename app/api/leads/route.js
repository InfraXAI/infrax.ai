import { handleLead } from './lead';

// Demo requests from the website: see lead.js. Mail goes through Microsoft Graph (settings in .env.example).
export const runtime = 'nodejs';
export const maxDuration = 20;

export function POST(request) {
  return handleLead(request);
}
