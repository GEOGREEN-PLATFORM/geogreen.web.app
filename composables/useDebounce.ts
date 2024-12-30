export const useDebounce = () => {
    const timersByKey: {
      [key: string]: NodeJS.Timeout | null;
    } = {};
    function debounce(someFunction : Function, time : number, key: string = 'default') {
      if (Object.hasOwn(timersByKey, key) && timersByKey[key] != null) {
        clearTimeout(timersByKey[key] as NodeJS.Timeout)
        timersByKey[key] = null;
      }
      timersByKey[key] = setTimeout(() => {
        someFunction()
      }, time);
    }
    return debounce
  };