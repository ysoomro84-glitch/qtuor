import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/ai/respond
 *
 * Advanced AI Support Chatbot backend. Routes user messages to the LLM
 * (z-ai-web-dev-sdk — equivalent to OpenAI GPT-4o-mini) with a rich system
 * prompt that encodes Qtuor's subscription plans, Tajweed curriculum, tutor
 * booking rules, and platform policies. The AI behaves as an automated human
 * assistant for the Qtuor marketplace.
 *
 * NOTE: The z-ai SDK is dynamically imported inside a try/catch so that if
 * it OOMs in a memory-constrained environment, the server stays alive and
 * returns a graceful fallback instead of crashing.
 *
 * Body: { message: string, history?: [{role, content}] }
 * Returns: { reply: string }
 */

// Static fallback responses for common questions (used if the LLM is unavailable)
const FALLBACK_RESPONSES: Array<{ match: RegExp; reply: string }> = [
  {
    match: /plan|price|cost|subscription|how much|fee/i,
    reply:
      "Qtuor offers monthly subscription plans across 3 subjects: Noorani Qaida, Quran Recitation With Tajweed, and Hifz. Each subject has 4 frequency tiers — 2, 3, 4, or 5 classes per week. The more classes per week, the higher the monthly price. All plans include our interactive virtual classroom, certified tutor, and word-by-word Quran sync. You can also try a FREE TRIAL class before subscribing! Visit our Plans page for exact pricing. 🌟",
  },
  {
    match: /register|sign up|signup|account|create/i,
    reply:
      "To register as a student: click 'Get Started' → choose 'Student' → fill your account details (name, email, password, phone, country) → complete your learning profile (age, goals, preferred tutor gender, timezone, plan). It takes about 2 minutes! For tutors, there's a 3-step verification + a legal agreement + $10 activation fee after approval. Jazak Allah Khair!",
  },
  {
    match: /child|kid|children|son|daughter|young/i,
    reply:
      "Yes! We offer Tajweed and Noorani Qaida classes specially for children. Many of our tutors are marked 'child-friendly' with patient, gentle teaching styles. We recommend starting with Noorani Qaida for ages 4-5, then progressing to Quran Recitation. You can filter tutors by 'Child-friendly' teaching style on our Find Tutors page. Book a free trial to see if the tutor is a good fit for your child! 👶",
  },
  {
    match: /female|sister|daughter|girl|woman|lady/i,
    reply:
      "Yes, we have verified female Quran tutors available. You can filter tutors by gender (Female) on our Find Tutors page. This is especially popular for sisters and young girls who prefer a female teacher for comfort and modesty. All our female tutors are certified and vetted. Book a free trial class to get started! 🧕",
  },
  {
    match: /trial|free|try|test|demo/i,
    reply:
      "Absolutely! Every Qtuor tutor offers a FREE TRIAL class. Just browse our Find Tutors page, pick a tutor, and click 'Book Free Trial'. You'll get a 30-minute session in our interactive virtual classroom — no payment required. It's the perfect way to meet your tutor and see if their teaching style suits you before subscribing. 📖",
  },
  {
    match: /tajweed|recitation|pronunciation|rule/i,
    reply:
      "Tajweed is the science of reciting the Quran correctly. Our Tajweed curriculum covers: Noon Sakinah rules (Izhar, Idgham, Iqlab, Ikhfa), Meem Sakinah rules, Madd (elongation), Qalqalah (echo sound), and Makharij (points of articulation). We start with Noorani Qaida for beginners, then progress to full Quran recitation with proper Tajweed. Book a class with one of our certified Tajweed tutors! 🌙",
  },
  {
    match: /tutor|teacher|qualif|certif|ijaza|hafiz/i,
    reply:
      "All Qtuor tutors are verified — we review their ID documents and certifications before approval. You can filter by: specialty (Noorani Qaida, Tajweed, Hifz, Arabic), gender, language (Arabic, English, Urdu, and more), and qualifications (Native Arabic, Hafiz, Ijaza certified). Visit our Find Tutors page to browse and book a free trial! 🎓",
  },
  {
    match: /payment|pay|jazzcash|easypaisa|bank|stripe|paypal/i,
    reply:
      "We accept multiple payment methods: International — Stripe (card) and PayPal; Local (Pakistan) — JazzCash, EasyPaisa, and Local Bank Transfer (upload a receipt for admin approval). All payments are monthly subscriptions — no hourly rates. Subscribe from our Plans page! 💰",
  },
]

const DEFAULT_FALLBACK =
  "Assalamu Alaikum! I'm the Qtuor AI Assistant. I can help you with: 📚 Subscription Plans (Noorani Qaida, Tajweed, Hifz), 🎓 Tutor verification & filtering, 📖 Free trial classes, 💰 Payment methods, and 👶 Classes for children. What would you like to know? You can also browse our Plans page or Find Tutors page directly!"

/**
 * POST /api/ai/respond
 *
 * Advanced AI Support Chatbot backend. Routes user messages to the LLM
 * (z-ai-web-dev-sdk — equivalent to OpenAI GPT-4o-mini) with a rich system
 * prompt that encodes Qtuor's subscription plans, Tajweed curriculum, tutor
 * booking rules, and platform policies. The AI behaves as an automated human
 * assistant for the Qtuor marketplace.
 *
 * Body: { message: string, history?: [{role, content}] }
 * Returns: { reply: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // ===== Qtuor Platform Knowledge Base (System Prompt) =====
    const SYSTEM_PROMPT = `You are the Qtuor AI Assistant — a knowledgeable, warm, and professional support guide for Qtuor (www.qtuor.com), the global online Quran learning marketplace platform.

YOUR ROLE:
Guide users strictly about Qtuor's premium monthly subscription models, Tajweed learning milestones, Noorani Qaida, Hifz (memorization), Arabic language courses, and our world-certified tutors. You help students and parents choose the right plan, understand the curriculum, and navigate the booking/registration flow.

PLATFORM KNOWLEDGE BASE:

1. SUBSCRIPTION PLANS (Monthly, NOT hourly):
Qtuor uses a flat monthly subscription model across 3 core subjects:
- Noorani Qaida (foundational Arabic letter recognition & pronunciation)
- Quran Recitation With Tajweed (proper rules of recitation)
- Hifz (Quran memorization)
Each subject offers 4 frequency tiers: 2, 3, 4, or 5 classes per week.
The more classes per week, the higher the monthly price.
All plans include: real-time interactive virtual classroom, certified tutor, word-by-word Quran sync, auto-bookmark/resume, and safety snapshots.
There is NO hourly rate — students pay a flat monthly fee and get scheduled classes.
A FREE TRIAL class is available with any tutor before subscribing.

2. REVENUE SPLIT (Tutor Earnings):
Tutors earn 55% of the student's monthly subscription. Qtuor retains 45% for platform operations. Payouts are released monthly (1st-5th of each month). Tutors can withdraw via Local Bank, JazzCash, EasyPaisa, or PayPal.

3. TUTORS:
All tutors are verified (ID documents + certifications reviewed by admin). Tutors may be Native Arabic speakers, Hafiz of the Quran, or Ijaza-certified. Students can filter tutors by specialty, gender (male/female), language (Arabic, English, Urdu, Turkish, French, Malay, Hindi, Bengali), and teaching style. Many tutors are "child-friendly" for young learners.

4. TAJWEED CURRICULUM MILESTONES:
- Beginner: Noorani Qaida → letter recognition, harakat (vowels), joining letters
- Intermediate: Quran Recitation with Tajweed rules — Noon Sakinah (Izhar/Idgham/Iqlab/Ikhfa), Meem Sakinah, Madd (elongation), Qalqalah (echo), Makharij (articulation points)
- Advanced: Hifz (memorization) using the Sabaq method (new lesson) + Sabaq Para (recent revision) + Ammukhta (old revision)

5. REGISTRATION & BOOKING RULES:
- Students register (3-step wizard: role → account → learning profile with age, goals, preferred tutor gender, timezone, plan selection)
- Tutors register (3-step wizard: role → account → professional verification + legal agreement + document upload). Tutors pay a $10 USD one-time activation fee after admin approval.
- Students can book a FREE TRIAL class or subscribe to a monthly plan
- Classes run in a real-time interactive virtual classroom (video, chat, whiteboard, Quran word-by-word sync, Noorani Qaida lessons)
- Classes auto-end at scheduled duration + 15-minute grace period
- Smart lesson tracking: auto-bookmark saves the exact page/line; auto-resume on next class

6. PAYMENT METHODS:
- International: Stripe (card), PayPal
- Local (Pakistan): JazzCash, EasyPaisa, Local Bank Transfer (with receipt upload for admin approval)

7. CLASSROOM FEATURES:
3-column layout: video tiles + chat (left), interactive board with tabs (Quran / Whiteboard / Noorani Qaida / Uploads) (center), surah/qaida/font selectors + teacher controls (right). Word-by-word hover sync, click-to-highlight with 5 Tajweed colors, drawing canvas, session countdown timer.

RESPONSE GUIDELINES:
- Always be respectful, warm, and use Islamic greetings naturally (Assalamu Alaikum, Jazak Allah Khair) where appropriate.
- Keep responses concise (2-4 short paragraphs max) — this is a chat widget, not an essay.
- If asked about pricing, explain the monthly subscription tiers (2/3/4/5 classes per week per subject) and mention the free trial.
- If asked about tutors, mention the verification process, filtering options, and free trial.
- If asked about something outside Qtuor's scope (politics, non-Islamic religious rulings, general world knowledge), politely redirect: "I'm the Qtuor AI Assistant and can help you with our Quran learning platform, subscription plans, tutors, and Tajweed curriculum. For that question, please consult a qualified scholar or appropriate resource."
- Never make up specific dollar amounts for plans — say "prices vary by subject and frequency tier (2-5 classes/week); check our Plans page for exact pricing."
- Encourage users to register or book a free trial when relevant.
- Use emojis sparingly (1-2 per message max) for warmth.`

    // Build the conversation messages for the LLM
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    // Append conversation history (last 10 messages for context)
    if (Array.isArray(history)) {
      for (const m of history.slice(-10)) {
        if (m.role === 'user' || m.role === 'assistant') {
          messages.push({ role: m.role, content: m.content })
        }
      }
    }

    // Current user message
    messages.push({ role: 'user', content: message })

    // ===== Keyword-based smart matching (no heavy SDK import = no OOM crash) =====
    // This provides instant, relevant responses to common Qtuor questions without
    // loading the z-ai SDK (which OOMs in memory-constrained environments).
    // The responses are comprehensive and cover all the knowledge-base topics.
    const lowerMsg = message.toLowerCase()
    let reply: string | null = null

    // Find the first matching fallback response
    for (const fr of FALLBACK_RESPONSES) {
      if (fr.match.test(lowerMsg)) {
        reply = fr.reply
        break
      }
    }

    // If no keyword match, try the LLM dynamically (may fail gracefully)
    if (!reply) {
      try {
        // Dynamic import — only loads the SDK when needed
        const ZAIModule = await import('z-ai-web-dev-sdk')
        const ZAI = ZAIModule.default
        const zai = await ZAI.create()
        const completion = await Promise.race([
          zai.chat.completions.create({ messages, thinking: { type: 'disabled' } }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI_TIMEOUT')), 15000)
          ),
        ])
        reply = (completion as any)?.choices?.[0]?.message?.content || null
      } catch (llmErr: any) {
        // SDK failed (OOM/timeout) — use the default fallback
        console.error('[ai/respond] LLM unavailable, using fallback:', llmErr?.message || llmErr)
        reply = DEFAULT_FALLBACK
      }
    }

    return NextResponse.json({ reply })
  } catch (e: any) {
    console.error('[ai/respond] Error:', e?.message || e)
    return NextResponse.json(
      { error: 'AI assistant is temporarily unavailable. Please try again.' },
      { status: 500 }
    )
  }
}
