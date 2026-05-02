import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

// ───── CHATBOT ─────
type Message = { from: "bot" | "user"; text: string };
type ChatStep = "menu" | "question" | "collect_name" | "collect_contact" | "done";

const BOT_DELAY = 600;

const QUICK_ANSWERS: Record<string, string> = {
  "💰 Сколько стоит?": "Стартовый тариф — от 3 900 ₽ за контент-план. Полное ведение — от 25 000 ₽/мес. Точную стоимость рассчитаем индивидуально под вашу нишу.",
  "⏱️ Как быстро?": "Контент-план готовим за 24 часа после брифинга. Полный пакет постов — 3–5 рабочих дней.",
  "🏗️ Работаете с B2B/строительством?": "Да! B2B, строительство и производство — одно из наших ключевых направлений. Умеем писать экспертный контент для корпоративной аудитории.",
  "📋 Что входит в услугу?": "Бриф → контент-план с датами и темами → тексты постов → подбор визуала. Всё согласовываем с вами перед публикацией.",
  "✏️ Можно ли вносить правки?": "Конечно! В каждый тариф включены 2 раунда правок. Дорабатываем до вашего полного одобрения.",
};

const MENU_OPTIONS = Object.keys(QUICK_ANSWERS);

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<ChatStep>("menu");
  const [input, setInput] = useState("");
  const [leadName, setLeadName] = useState("");
  const [showNotif, setShowNotif] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addBot = (text: string, delay = BOT_DELAY) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text }]);
    }, delay);
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      addBot("Привет! 👋 Я помогу ответить на ваши вопросы о контент-маркетинге. Выберите тему:", 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setShowNotif(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleOption = (option: string) => {
    setMessages((prev) => [...prev, { from: "user", text: option }]);
    addBot(QUICK_ANSWERS[option]);
    addBot("Хотите узнать что-то ещё или оставить заявку?", BOT_DELAY + 400);
    setStep("question");
  };

  const handleSend = () => {
    const val = input.trim();
    if (!val) return;
    setInput("");

    if (step === "collect_name") {
      setLeadName(val);
      setMessages((prev) => [...prev, { from: "user", text: val }]);
      addBot(`Приятно познакомиться, ${val}! Оставьте телефон или Telegram — наш менеджер свяжется с вами в течение часа.`);
      setStep("collect_contact");
      return;
    }

    if (step === "collect_contact") {
      setMessages((prev) => [...prev, { from: "user", text: val }]);
      addBot(`Отлично! Заявка принята. Скоро свяжемся с вами, ${leadName} 🎉`);
      addBot("Если появятся вопросы — пишите сюда в любое время!", BOT_DELAY + 300);
      setStep("done");
      return;
    }

    setMessages((prev) => [...prev, { from: "user", text: val }]);
    addBot("Хороший вопрос! Чтобы ответить точнее, лучше пообщаться с нашим менеджером. Оставить контакт?");
    setStep("question");
  };

  const startLead = () => {
    setMessages((prev) => [...prev, { from: "user", text: "Хочу оставить заявку" }]);
    addBot("Отлично! Как вас зовут?");
    setStep("collect_name");
  };

  const goMenu = () => {
    addBot("Хорошо, выберите интересующую тему:");
    setStep("menu");
  };

  return (
    <>
      {/* Кнопка чата */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {showNotif && !open && (
          <div
            className="bg-white rounded-2xl shadow-xl px-4 py-3 text-sm font-medium max-w-[220px] border border-gray-100 animate-fade-up"
            style={{ color: "var(--navy-dark)" }}
          >
            Есть вопросы? Напишите нам 👋
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, var(--navy-dark), var(--navy-light))" }}
        >
          {open
            ? <Icon name="X" size={22} className="text-white" />
            : <Icon name="MessageCircle" size={24} className="text-white" />
          }
          {showNotif && !open && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
          )}
        </button>
      </div>

      {/* Окно чата */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: "520px", background: "white", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          {/* Шапка */}
          <div
            className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--navy-dark), var(--navy-light))" }}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(201,162,39,0.25)" }}>
              <Icon name="Bot" size={18} style={{ color: "var(--gold-light)" }} />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">ContentPro</div>
              <div className="text-xs text-blue-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Онлайн · отвечаем быстро
              </div>
            </div>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#f8f9fc" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[80%]"
                  style={
                    m.from === "user"
                      ? { background: "linear-gradient(135deg, var(--navy-dark), var(--navy-light))", color: "white", borderBottomRightRadius: "4px" }
                      : { background: "white", color: "#1a1a2e", border: "1px solid #e5e7eb", borderBottomLeftRadius: "4px" }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Быстрые кнопки */}
            {step === "menu" && messages.length > 0 && (
              <div className="flex flex-col gap-2 pt-1">
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:shadow-sm"
                    style={{ background: "white", borderColor: "rgba(201,162,39,0.35)", color: "var(--navy-dark)" }}
                  >
                    {opt}
                  </button>
                ))}
                <button
                  onClick={startLead}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "var(--navy-dark)" }}
                >
                  📩 Оставить заявку
                </button>
              </div>
            )}

            {step === "question" && (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={startLead}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "var(--navy-dark)" }}
                >
                  📩 Оставить заявку
                </button>
                <button
                  onClick={goMenu}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
                  style={{ background: "white", borderColor: "#e5e7eb", color: "var(--navy-dark)" }}
                >
                  ← Другой вопрос
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Ввод */}
          {(step === "collect_name" || step === "collect_contact") && (
            <div className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0 bg-white">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={step === "collect_name" ? "Ваше имя…" : "Телефон или Telegram…"}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400 text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, var(--navy-dark), var(--navy-light))" }}
              >
                <Icon name="Send" size={16} className="text-white" />
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="p-4 border-t border-gray-100 text-center text-sm text-gray-400 bg-white flex-shrink-0">
              Спасибо! Скоро свяжемся с вами 🎉
            </div>
          )}
        </div>
      )}
    </>
  );
}

const TEAM_IMAGE =
  "https://cdn.poehali.dev/projects/6368137c-f999-4029-8c66-58a65c0863ca/files/c3a6e4b5-cc1f-45e1-b73a-0464861aa1f3.jpg";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`section-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const Index = () => {
  const [form, setForm] = useState({ name: "", contact: "", social: "" });
  const [submitted, setSubmitted] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const faqs = [
    {
      q: "Кому принадлежат авторские права на созданный контент?",
      a: "Все тексты и материалы полностью принадлежат вам. Подписываем NDA по запросу.",
    },
    {
      q: "Сколько правок включено в стоимость?",
      a: "В каждый тариф включены 2 раунда правок. Дорабатываем до вашего полного одобрения.",
    },
    {
      q: "Как происходит оплата?",
      a: "50% после согласования контент-плана, 50% — после передачи готовых материалов. Принимаем карты и расчётный счёт.",
    },
    {
      q: "Работаете ли вы с нишами, которые мне нужны?",
      a: "Да, наш опыт: бьюти, инфобиз, услуги, ритейл, фитнес и другие. Напишите нам — обсудим вашу нишу.",
    },
    {
      q: "Работаете ли вы с B2B, строительством и производством?",
      a: "Да, это одно из наших ключевых направлений. Умеем переводить сложные технические продукты на язык клиента: пишем экспертный контент для строительных компаний, производственных предприятий и B2B-услуг. Знаем, как привлекать корпоративных клиентов через соцсети.",
    },
  ];

  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
              }}
            >
              <Icon name="Zap" size={16} className="text-white" />
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: "var(--navy-dark)" }}
            >
              ContentPro
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            {[
              ["Услуги", "services"],
              ["Кейсы", "cases"],
              ["Тарифы", "pricing"],
              ["О нас", "team"],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="hover:text-gray-900 transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => scrollTo("contact")}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, var(--navy-dark), var(--navy-light))",
            }}
          >
            Оставить заявку
          </button>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden pt-16"
        style={{
          background:
            "linear-gradient(135deg, #0f1a3e 0%, #1a2c5b 55%, #1e3a7a 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, var(--gold-light), transparent)",
            }}
          />
          <div
            className="absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-5"
            style={{
              background: "radial-gradient(circle, #6272f3, transparent)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 70px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 70px)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-28 relative z-10">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 border"
              style={{
                background: "rgba(201,162,39,0.1)",
                borderColor: "rgba(201,162,39,0.3)",
                color: "var(--gold-light)",
              }}
            >
              <Icon name="Sparkles" size={14} />
              Экспертный SMM без вашего участия
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-6">
              Контент-план и посты{" "}
              <span style={{ color: "var(--gold-light)" }}>за 24 часа</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-10 max-w-2xl opacity-90">
              Перестаньте тратить часы на поиск идей и написание текстов. Мы создадим стратегию и контент для любой ниши — от бьюти до B2B, строительства и производства. Работаем на ваши продажи, а не ради галочки.
            </p>

            <div className="flex flex-wrap gap-6 mb-12">
              {[
                "Экономия 30+ часов в месяц",
                "Посты под ваш Tone of Voice",
                "B2B, строительство, производство",
                "Старт от 3 900 ₽",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-blue-100">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--gold)" }}
                  >
                    <Icon name="Check" size={11} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollTo("contact")}
                className="group inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-base transition-all hover:shadow-xl hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, var(--gold), var(--gold-light))",
                  color: "#0f1a3e",
                }}
              >
                Рассчитать стоимость услуг
                <Icon
                  name="ArrowRight"
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </button>
              <button
                onClick={() => scrollTo("cases")}
                className="px-8 py-4 rounded-xl font-semibold text-base border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                Смотреть кейсы
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* БОЛИ */}
      <section id="problems" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--gold)" }}
              >
                Узнаёте себя?
              </p>
              <h2
                className="font-display text-4xl md:text-5xl font-bold"
                style={{ color: "var(--navy-dark)" }}
              >
                Проблема → Решение
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal delay={100}>
              <div className="space-y-4">
                <div className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6">
                  Типичная ситуация
                </div>
                {[
                  {
                    icon: "AlertCircle",
                    text: "Посты выходят хаотично, нет системы",
                  },
                  {
                    icon: "Clock",
                    text: "Долго согласовываем каждую запятую",
                  },
                  {
                    icon: "BatteryLow",
                    text: "Сил на креатив уже не остаётся",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-red-50 border border-red-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Icon
                        name={item.icon}
                        size={18}
                        className="text-red-500"
                      />
                    </div>
                    <p className="text-gray-700 font-medium leading-relaxed pt-1.5">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="space-y-4">
                <div
                  className="text-sm font-semibold uppercase tracking-widest mb-6"
                  style={{ color: "var(--gold)" }}
                >
                  Наше решение
                </div>
                {[
                  "Системный контент-план на месяц с датами и темами",
                  "Бережём ваше время — согласование в 1 клик",
                  "Креативные рубрики, которые нравятся вашей аудитории",
                ].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-5 rounded-2xl border"
                    style={{
                      background: "rgba(201,162,39,0.05)",
                      borderColor: "rgba(201,162,39,0.2)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--gold)" }}
                    >
                      <Icon name="Check" size={18} className="text-white" />
                    </div>
                    <p
                      className="font-medium leading-relaxed pt-1.5"
                      style={{ color: "var(--navy-dark)" }}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section
        id="services"
        className="py-24"
        style={{ background: "linear-gradient(180deg, #f8f9fc 0%, #fff 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--gold)" }}
              >
                Почему выбирают нас
              </p>
              <h2
                className="font-display text-4xl md:text-5xl font-bold"
                style={{ color: "var(--navy-dark)" }}
              >
                4 ключевых преимущества
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "TrendingUp",
                title: "Не просто копирайтеры, а маркетологи с KPI",
                desc: "Знаем воронку, триггеры и форматы: Reels, карусели, сторис.",
              },
              {
                icon: "Lightbulb",
                title: "Уникальные рубрики, а не клоны конкурентов",
                desc: "Генерируем 30+ тем на месяц, включая интерактивы и продающие посты.",
              },
              {
                icon: "Briefcase",
                title: "Вы занимаетесь бизнесом — мы контентом",
                desc: "Отменяем микроменеджмент: чёткий бриф + готовый контент-план.",
              },
              {
                icon: "Zap",
                title: "Посты за 1 день, под ключ от 3 900 ₽",
                desc: "Фиксированная стоимость без скрытых доначислений. Срочные заказы — без наценки.",
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="card-hover p-6 rounded-2xl bg-white border border-gray-100 shadow-sm h-full">
                  <div
                    className="w-12 h-12 rounded-2xl mb-5 flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--navy-dark), var(--navy-light))",
                    }}
                  >
                    <Icon
                      name={item.icon}
                      size={22}
                      className="text-white"
                    />
                  </div>
                  <h3
                    className="font-bold text-base leading-snug mb-3"
                    style={{ color: "var(--navy-dark)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ПРОЦЕСС */}
      <section
        id="process"
        className="py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-mid) 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 80px)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--gold-light)" }}
              >
                Прозрачно и просто
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                Как мы работаем
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: "FileText",
                title: "Бриф (15 мин)",
                desc: "Вы отвечаете на 5 вопросов о продукте и аудитории.",
              },
              {
                step: "02",
                icon: "LayoutList",
                title: "Контент-план",
                desc: "Получаете таблицу с темами и идеями на месяц.",
              },
              {
                step: "03",
                icon: "PenLine",
                title: "Создание постов",
                desc: "Пишем тексты, подбираем визуал или работаем с вашими фото.",
              },
              {
                step: "04",
                icon: "PartyPopper",
                title: "Готово!",
                desc: "Получаете контент-план + готовые посты в Google Docs / Trello.",
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="relative p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div
                    className="text-6xl font-display font-bold mb-4 leading-none"
                    style={{ color: "rgba(201,162,39,0.2)" }}
                  >
                    {item.step}
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                    style={{
                      background: "rgba(201,162,39,0.2)",
                      border: "1px solid rgba(201,162,39,0.3)",
                    }}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      style={{ color: "var(--gold-light)" }}
                    />
                  </div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-blue-200 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* КЕЙСЫ */}
      <section id="cases" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--gold)" }}
              >
                Реальные результаты
              </p>
              <h2
                className="font-display text-4xl md:text-5xl font-bold"
                style={{ color: "var(--navy-dark)" }}
              >
                Кейсы клиентов
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                niche: "🌿 Эко-товары",
                before: "0 постов 3 недели, нет стратегии",
                after: "Контент-план на месяц + рост вовлечённости",
                metric: "+40%",
                metricLabel: "ER (вовлечённость)",
                tags: ["Instagram", "ВКонтакте"],
              },
              {
                niche: "💪 Фитнес-студия",
                before: "Хаотичные Reels без системы",
                after: "Система постов + рост заявок из соцсетей",
                metric: "+25%",
                metricLabel: "Заявок из соцсетей",
                tags: ["Instagram", "Telegram"],
              },
              {
                niche: "🏗️ Строительная компания",
                before: "Нет присутствия в соцсетях, клиенты не доверяют",
                after: "Экспертный контент об объектах + рост входящих обращений",
                metric: "+3х",
                metricLabel: "Входящих обращений",
                tags: ["ВКонтакте", "Telegram"],
              },
              {
                niche: "🏭 B2B производство",
                before: "Скучные посты без вовлечения, нет лидов из соцсетей",
                after: "Контент-стратегия для корпоративных клиентов, кейсы и экспертиза",
                metric: "+18%",
                metricLabel: "Корпоративных запросов",
                tags: ["LinkedIn", "ВКонтакте"],
              },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="card-hover rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <div
                    className="p-6 border-b border-gray-100"
                    style={{
                      background: "linear-gradient(135deg, #f8f9fc, #fff)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-xl font-bold"
                        style={{ color: "var(--navy-dark)" }}
                      >
                        {c.niche}
                      </span>
                      <div className="flex gap-2">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                        <div className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">
                          Было
                        </div>
                        <p className="text-sm text-gray-600">{c.before}</p>
                      </div>
                      <div
                        className="p-4 rounded-xl border"
                        style={{
                          background: "rgba(201,162,39,0.05)",
                          borderColor: "rgba(201,162,39,0.2)",
                        }}
                      >
                        <div
                          className="text-xs font-semibold uppercase tracking-wide mb-2"
                          style={{ color: "var(--gold)" }}
                        >
                          Стало
                        </div>
                        <p className="text-sm text-gray-600">{c.after}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <div
                        className="text-3xl font-display font-bold"
                        style={{ color: "var(--navy-dark)" }}
                      >
                        {c.metric}
                      </div>
                      <div className="text-sm text-gray-400">
                        {c.metricLabel}
                      </div>
                    </div>
                    <button
                      onClick={() => scrollTo("contact")}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
                      style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
                    >
                      Запросить кейс
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* КОМАНДА */}
      <section
        id="team"
        className="py-24"
        style={{ background: "linear-gradient(180deg, #f8f9fc 0%, #fff 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={TEAM_IMAGE}
                  alt="Команда ContentPro"
                  className="w-full h-96 object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--gold)" }}
                >
                  Кто делает
                </p>
                <h2
                  className="font-display text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: "var(--navy-dark)" }}
                >
                  Ваша команда экспертов
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Мы — команда SMM-специалистов и маркетологов с опытом от 5
                  лет. Не просто создаём контент — выстраиваем стратегию,
                  которая работает на ваши бизнес-цели.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: "Award", text: "Опыт в SMM от 5 лет" },
                    { icon: "Users", text: "100+ контент-планов" },
                    { icon: "BookOpen", text: "Обучались у топовых экспертов" },
                    {
                      icon: "Star",
                      text: "Ниши: B2B, услуги, строительство, производство, бьюти, инфобиз",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--navy-dark), var(--navy-light))",
                        }}
                      >
                        <Icon
                          name={item.icon}
                          size={15}
                          className="text-white"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => scrollTo("contact")}
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--navy-dark), var(--navy-light))",
                  }}
                >
                  Запросить кейс по вашей нише
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ТАРИФЫ */}
      <section
        id="pricing"
        className="py-24 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--navy-dark), var(--navy-mid))",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 80px)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--gold-light)" }}
              >
                Прозрачные цены
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
                Выберите тариф
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {[
              {
                name: "Лёгкий",
                price: "от 3 900 ₽",
                desc: "Только контент-план",
                features: [
                  "30 тем + идеи на месяц",
                  "Рубрикатор",
                  "Даты публикаций",
                  "Фиксированная цена",
                  "Срок от 1 дня",
                ],
                popular: false,
              },
              {
                name: "Оптимальный",
                price: "от 12 900 ₽",
                desc: "Контент-план + посты",
                features: [
                  "Контент-план на месяц",
                  "15 готовых постов",
                  "Текст + макет визуала",
                  "2 раунда правок",
                  "Фиксированная цена",
                  "Срок от 1 дня",
                ],
                popular: true,
              },
              {
                name: "Всё включено",
                price: "от 25 000 ₽",
                desc: "Полное ведение",
                features: [
                  "Полное ведение соцсетей",
                  "Посты + сторис + Reels",
                  "Аналитика + отчёты",
                  "Неограниченные правки",
                  "Приоритетная поддержка",
                  "Фиксированная цена",
                ],
                popular: false,
              },
            ].map((plan, i) => (
              <Reveal key={i} delay={i * 100}>
                <div
                  className={`relative rounded-2xl p-6 flex flex-col transition-all ${
                    plan.popular
                      ? "ring-2 shadow-2xl"
                      : "border border-white/10"
                  }`}
                  style={
                    plan.popular
                      ? {
                          background: "white",
                          outlineColor: "var(--gold)",
                          ringColor: "var(--gold)",
                        }
                      : { background: "rgba(255,255,255,0.05)" }
                  }
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap"
                      style={{ background: "var(--gold)" }}
                    >
                      Популярный выбор
                    </div>
                  )}
                  <div className="mb-6">
                    <div
                      className="text-sm font-semibold uppercase tracking-wide mb-1"
                      style={
                        plan.popular
                          ? { color: "var(--gold)" }
                          : { color: "#93c5fd" }
                      }
                    >
                      {plan.name}
                    </div>
                    <div
                      className="text-3xl font-display font-bold mb-1"
                      style={
                        plan.popular
                          ? { color: "var(--navy-dark)" }
                          : { color: "white" }
                      }
                    >
                      {plan.price}
                    </div>
                    <div
                      className={`text-sm ${
                        plan.popular ? "text-gray-500" : "text-blue-300"
                      }`}
                    >
                      {plan.desc}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={
                            plan.popular
                              ? { background: "var(--gold)" }
                              : { background: "rgba(201,162,39,0.2)" }
                          }
                        >
                          <Icon
                            name="Check"
                            size={11}
                            style={
                              plan.popular
                                ? { color: "white" }
                                : { color: "var(--gold-light)" }
                            }
                          />
                        </div>
                        <span
                          className={`text-sm ${
                            plan.popular ? "text-gray-600" : "text-blue-100"
                          }`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => scrollTo("contact")}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                    style={
                      plan.popular
                        ? {
                            background:
                              "linear-gradient(135deg, var(--navy-dark), var(--navy-light))",
                            color: "white",
                          }
                        : {
                            background: "rgba(201,162,39,0.15)",
                            border: "1px solid rgba(201,162,39,0.4)",
                            color: "var(--gold-light)",
                          }
                    }
                  >
                    Выбрать тариф и оставить заявку
                  </button>
                </div>
              </Reveal>
            ))}
          </div>

          {/* FAQ */}
          <Reveal delay={200}>
            <div className="mt-16 max-w-2xl mx-auto">
              <h3 className="font-display text-2xl font-bold text-white text-center mb-8">
                Частые вопросы
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden border border-white/10 bg-white/5"
                  >
                    <button
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left text-white font-medium hover:bg-white/5 transition-colors"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <Icon
                        name={faqOpen === i ? "ChevronUp" : "ChevronDown"}
                        size={18}
                        className="flex-shrink-0 text-blue-300"
                      />
                    </button>
                    {faqOpen === i && (
                      <div className="px-5 pb-5 text-blue-200 text-sm leading-relaxed border-t border-white/10 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ФОРМА ЗАЯВКИ */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--gold)" }}
              >
                Бесплатно
              </p>
              <h2
                className="font-display text-4xl md:text-5xl font-bold mb-4"
                style={{ color: "var(--navy-dark)" }}
              >
                Получите контент-план<br />и 3 поста в подарок
              </h2>
              <p className="text-gray-500 text-lg">
                Закажите услугу и получите чек-лист «50 идей для постов»
                бесплатно
              </p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="rounded-3xl p-8 shadow-xl border border-gray-100">
              {submitted ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(201,162,39,0.1)" }}
                  >
                    <Icon
                      name="CheckCircle"
                      size={32}
                      style={{ color: "var(--gold)" }}
                    />
                  </div>
                  <h3
                    className="font-display text-2xl font-bold mb-2"
                    style={{ color: "var(--navy-dark)" }}
                  >
                    Заявка отправлена!
                  </h3>
                  <p className="text-gray-500">
                    Мы свяжемся с вами в течение 1 часа. Без спама.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ваше имя
                      </label>
                      <input
                        type="text"
                        placeholder="Александр"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 text-gray-800 placeholder-gray-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Телефон или Telegram
                      </label>
                      <input
                        type="text"
                        placeholder="+7 999 123-45-67"
                        value={form.contact}
                        onChange={(e) =>
                          setForm({ ...form, contact: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 text-gray-800 placeholder-gray-400 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ссылка на вашу соцсеть
                    </label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/yourprofile"
                      value={form.social}
                      onChange={(e) =>
                        setForm({ ...form, social: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500 text-gray-800 placeholder-gray-400 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all hover:opacity-90 hover:shadow-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--navy-dark), var(--navy-light))",
                    }}
                  >
                    Оставить заявку на контент-план
                  </button>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Icon name="Lock" size={13} className="text-gray-400" />
                    <p className="text-xs text-gray-400">
                      Мы свяжемся с вами за 1 час. Без спама.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              {[
                { icon: "Clock", text: "Опыт 5+ лет" },
                { icon: "Users", text: "100+ клиентов" },
                { icon: "Zap", text: "Старт за 24 часа" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-400">
                  <Icon
                    name={item.icon}
                    size={16}
                    style={{ color: "var(--gold)" }}
                  />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CHATBOT */}
      <ChatWidget />

      {/* FOOTER */}
      <footer className="py-10 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--gold), var(--gold-light))",
              }}
            >
              <Icon name="Zap" size={14} className="text-white" />
            </div>
            <span className="font-bold" style={{ color: "var(--navy-dark)" }}>
              ContentPro
            </span>
          </div>
          <p className="text-sm text-gray-400 text-center">
            © 2024 ContentPro. Все права защищены.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <button
              onClick={() => scrollTo("contact")}
              className="hover:text-gray-700 transition-colors"
            >
              Связаться
            </button>
            <button
              onClick={() => scrollTo("pricing")}
              className="hover:text-gray-700 transition-colors"
            >
              Тарифы
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;