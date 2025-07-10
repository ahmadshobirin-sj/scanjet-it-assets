// import { router } from '@inertiajs/react'
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

//   useEffect(() => {
//     const cancelNavigation = (event: any) => {
//       if (shouldWarn && !window.confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
//         event.preventDefault()
//       }
//     }

//     const unsubscribe = router.on('before', cancelNavigation)

//     return unsubscribe
//   }, [shouldWarn])
}
