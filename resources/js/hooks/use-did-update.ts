import { useEffect, useRef } from "react";

function useDidUpdate(callback: () => void, deps: any[]) {
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    callback();
  }, deps);
}
export default useDidUpdate;
