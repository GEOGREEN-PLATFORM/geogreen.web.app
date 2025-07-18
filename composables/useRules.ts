export default function useRules() {
  function validateEmail(email: string) {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email) return "Не может быть пустым";
    return reg.test(String(email).toLowerCase()) || "Неверный формат почты";
  }
  function validatePassword(password: string) {
    if (!password) return "Не может быть пустым";
    return (
      (password.length >= 8 && password.length <= 20) || "От 8 до 20 символов"
    );
  }
  return {
    validateEmail,
    validatePassword,
  };
}
