export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

export default async function handler(request: Request) {
  return new Response(JSON.stringify({ ok: true, message: 'Global Registry Foundation edge function placeholder' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
