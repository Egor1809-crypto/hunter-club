import { apiError } from "@/lib/api";

export const POST = async () =>
  apiError("Вход по телефону отключён. Используйте вход через Google.", 410);
