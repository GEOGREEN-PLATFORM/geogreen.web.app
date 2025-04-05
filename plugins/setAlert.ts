export default defineNuxtPlugin((nuxtApp) => {
  useState("showAlert", () =>
    ref<Alert>({
      show: false,
      text: "",
    }),
  );
});
