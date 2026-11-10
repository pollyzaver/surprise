/* global process */
/* Приём заявок с формы «Записаться» (функция Vercel).

   Vercel публикует сайт и сам запускает этот файл по адресу /api/signup.
   Функция проверяет поля и пересылает заявку сообщением в Телеграм.
   Ключ бота хранится только в настройках проекта на Vercel
   (Settings → Environment Variables), в коде и на GitHub его нет:
     TG_BOT_TOKEN — ключ от @BotFather
     TG_CHAT_ID   — твой Id от @userinfobot
   Позже можно добавить ВКонтакте: VK_TOKEN и VK_USER_ID —
   канал включится сам, код менять не нужно. */

const LIMITS = { parent: 80, phone: 30, age: 3, venue: 80 };
const TIMEOUT_MS = 8000;

function clean(value, max) {
  return String(value ?? "")
    // eslint-disable-next-line no-control-regex -- убираем управляющие символы
    .replace(/[\u0000-\u001f]/g, " ")
    .trim()
    .slice(0, max);
}

async function post(url, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function sendTelegram(text) {
  const { TG_BOT_TOKEN: token, TG_CHAT_ID: chat } = process.env;
  const data = await post(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text }),
  });
  if (!data.ok) throw new Error(`telegram: ${data.description}`);
}

async function sendVk(text) {
  const { VK_TOKEN: token, VK_USER_ID: user } = process.env;
  const data = await post("https://api.vk.com/method/messages.send", {
    method: "POST",
    body: new URLSearchParams({
      user_id: user,
      message: text,
      random_id: String(Date.now()),
      access_token: token,
      v: "5.199",
    }),
  });
  if (data.error) throw new Error(`vk: ${data.error.error_msg}`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "bad_json" });
  }

  // ловушка для спам-ботов: человек это поле не видит и не заполняет
  if (body.website) return res.status(200).json({ ok: true });

  const form = {};
  for (const [key, max] of Object.entries(LIMITS)) form[key] = clean(body[key], max);

  const age = Number(form.age);
  const digits = form.phone.replace(/\D/g, "");
  if (!form.parent || digits.length < 10 || !(age >= 3 && age <= 16) || body.consent !== "on") {
    return res.status(400).json({ ok: false, error: "invalid" });
  }

  const text =
    "Новая заявка на пробное занятие\n\n" +
    `Родитель: ${form.parent}\n` +
    `Телефон: ${form.phone}\n` +
    `Возраст ребёнка: ${age}\n` +
    `Площадка: ${form.venue || "не выбрана"}\n` +
    "Согласие на обработку данных: дано";

  const jobs = [];
  if (process.env.TG_BOT_TOKEN && process.env.TG_CHAT_ID) jobs.push(sendTelegram(text));
  if (process.env.VK_TOKEN && process.env.VK_USER_ID) jobs.push(sendVk(text));
  if (!jobs.length) {
    console.error("Не задан ни один канал: проверь Environment Variables на Vercel");
    return res.status(500).json({ ok: false, error: "no_channels" });
  }

  const results = await Promise.allSettled(jobs);
  results
    .filter((r) => r.status === "rejected")
    .forEach((r) => console.error(String(r.reason)));

  const delivered = results.some((r) => r.status === "fulfilled");
  return res.status(delivered ? 200 : 502).json({ ok: delivered });
}
