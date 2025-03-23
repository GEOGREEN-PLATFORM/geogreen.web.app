export function useDebounce() {
  const timersByKey: {
    [key: string]: NodeJS.Timeout | null;
  } = {};
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  function debounce(someFunction: Function, time: number, key = "default") {
    if (Object.hasOwn(timersByKey, key) && timersByKey[key] != null) {
      clearTimeout(timersByKey[key] as NodeJS.Timeout);
      timersByKey[key] = null;
    }
    timersByKey[key] = setTimeout(() => {
      someFunction();
    }, time);
  }
  return debounce;
}
