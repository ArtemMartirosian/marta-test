interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

const SOCIAL_IMAGE_PLACEHOLDER = '__OG_IMAGE__'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request)
    const contentType = response.headers.get('content-type')

    if (!contentType?.includes('text/html')) {
      return response
    }

    const socialImageUrl = new URL('/og.png', request.url).href
    const html = (await response.text()).replaceAll(
      SOCIAL_IMAGE_PLACEHOLDER,
      socialImageUrl,
    )

    return new Response(html, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    })
  },
}
