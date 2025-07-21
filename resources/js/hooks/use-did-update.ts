import { useEffect, useRef } from 'react';

function useDidUpdate(callback: () => void, deps: any[]) {
    const didMountRef = useRef(false);

    useEffect(() => {
        if (didMountRef.current) {
            callback();
        } else {
            didMountRef.current = true;
        }
        // disable lint warning for this hook
        // we trust the caller to pass correct deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
export default useDidUpdate;
