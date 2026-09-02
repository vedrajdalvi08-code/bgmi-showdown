import serverless from 'serverless-http';
import app from '../../api/index.js';

const expressHandler = serverless(app);

type NetlifyEvent = {
  path: string;
  rawUrl?: string;
};

export const handler = async (event: NetlifyEvent, context: unknown) => {
  if (!event.path.startsWith('/api')) {
    event.path = `/api${event.path === '/' ? '' : event.path}`;
  }
  if (!event.rawUrl?.includes('/api')) {
    event.rawUrl = `${event.rawUrl?.replace(/\/[^/]*$/, '') || ''}${event.path}`;
  }

  return expressHandler(event as never, context as never);
};
