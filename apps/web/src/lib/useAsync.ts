import { useCallback, useEffect, useRef, useState } from "react";

/** Veri yükleme durumu: yükleniyor / hata / veri. Bağımlılıklar değişince yeniden yükler; eski yanıtları yok sayar. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | null; error: Error | null; loading: boolean }>({ data: null, error: null, loading: true });
  const seq = useRef(0);

  const run = useCallback(() => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn().then(
      (data) => { if (id === seq.current) setState({ data, error: null, loading: false }); },
      (error: Error) => { if (id === seq.current) setState((s) => ({ ...s, error, loading: false })); },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run };
}
