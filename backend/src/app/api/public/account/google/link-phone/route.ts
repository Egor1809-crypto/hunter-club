import { apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export const POST = async () =>
  apiError("Привязка телефона отключена. Кабинет работает через Google.", 410);
