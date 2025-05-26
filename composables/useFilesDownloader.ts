import { date } from "quasar";
export default function downloadFile(file: Blob, name: string) {
  const url = window.URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = `
    ${name} Скачан: +
    ${date.formatDate(new Date().toISOString(), "DD.MM.YYYY HH:mm:ss")}
  .pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
