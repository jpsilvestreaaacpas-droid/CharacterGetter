import * as React from "react";

/**
 * Debounces rapidly changing values (e.g. search inputs on large catalogs)
 * to avoid filtering hundreds of items on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 150): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
