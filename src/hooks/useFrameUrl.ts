import { useCallback, useEffect, useState } from 'react'

const frameFromUrl = (validFrameIds: readonly string[]) => {
  const requested = new URL(window.location.href).searchParams.get('frame')
  return requested && validFrameIds.includes(requested)
    ? requested
    : validFrameIds[0]
}

export const useFrameUrl = (validFrameIds: readonly string[]) => {
  const [frameId, setFrameId] = useState(() => frameFromUrl(validFrameIds))

  useEffect(() => {
    const handlePopState = () => setFrameId(frameFromUrl(validFrameIds))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [validFrameIds])

  const selectFrame = useCallback(
    (nextFrameId: string) => {
      if (!validFrameIds.includes(nextFrameId)) {
        return
      }

      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.set('frame', nextFrameId)
      window.history.pushState({ frame: nextFrameId }, '', nextUrl)
      setFrameId(nextFrameId)
    },
    [validFrameIds],
  )

  return { frameId, selectFrame }
}

