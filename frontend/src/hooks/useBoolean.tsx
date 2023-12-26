import {useCallback, useState} from "react";

function useBoolean(val=false) {
 const [state,setState] = useState(val);
 const on = useCallback(()=>setState(true),[]);
  const off = useCallback(()=>setState(false),[]);
  const toggle = useCallback(()=>setState((s)=>!s),[]);
  return [state,{on,off,toggle}] as const;
}

export default useBoolean;