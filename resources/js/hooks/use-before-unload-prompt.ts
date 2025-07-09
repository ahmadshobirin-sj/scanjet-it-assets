import { useEffect } from 'react'

export const useBeforeUnloadPrompt = (shouldWarn: boolean) => {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (shouldWarn) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [shouldWarn])
}
