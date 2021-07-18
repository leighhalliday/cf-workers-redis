export async function handleRequest(request: Request): Promise<Response> {
  const ip = request.headers.get('cf-connecting-ip') ?? ''
  const allowed = await isIpAllowed(ip)
  const url = new URL(request.url)
  const asRoute = !url.host.endsWith('workers.dev')

  console.log({ host: url.host, asRoute })

  if (!allowed) {
    return new Response(`IP ${ip} is not allowed.`, { status: 403 })
  }

  if (asRoute) {
    return fetch(request)
  } else {
    return new Response(`IP ${ip} is allowed`)
  }
}

async function isIpAllowed(ip: string): Promise<boolean> {
  const url = `https://us1-fluent-seasnail-34298.upstash.io/sismember/allowed-set/${ip}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${REDIS_PW}`,
    },
  })
  const { result }: { result: 0 | 1 } = await response.json()

  return result === 1
}
