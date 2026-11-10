declare global {
  // eslint-disable-next-line no-var
  var _closeFinishedEventsStarted: boolean | undefined
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && !global._closeFinishedEventsStarted) {
    global._closeFinishedEventsStarted = true
    const { closeFinishedEvents } = await import('@/lib/jobs/closeFinishedEvents')
    closeFinishedEvents().catch(console.error)
    setInterval(() => closeFinishedEvents().catch(console.error), 15 * 60 * 1000)
  }
}
