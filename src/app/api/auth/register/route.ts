import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, setSession } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'TUTOR']),
  country: z.string().optional(),
  phone: z.string().optional(),
  // Student-specific
  age: z.number().optional(),
  gender: z.string().optional(),
  preferredLanguage: z.string().optional(),
  timezone: z.string().optional(),
  learningGoals: z.string().optional(),
  guardianName: z.string().optional(),
  // Tutor-specific
  bio: z.string().optional(),
  specialties: z.string().optional(),
  languages: z.string().optional(),
  perClassRate: z.number().optional(),
  nativeArabic: z.boolean().optional(),
  hafiz: z.boolean().optional(),
  ijazaCertified: z.boolean().optional(),
  experienceYears: z.number().optional(),
  teachingStyle: z.string().optional(),
  videoUrl: z.string().optional(),
  // Tutor document uploads (URLs written by /api/upload/tutor-doc)
  idDocumentUrl: z.string().optional(),
  certificateUrls: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await db.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 })
    }

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashPassword(data.password),
        role: data.role,
        country: data.country,
        phone: data.phone,
        timezone: data.timezone,
        ...(data.role === 'STUDENT'
          ? {
              age: data.age,
              gender: data.gender,
              preferredLanguage: data.preferredLanguage,
              learningGoals: data.learningGoals,
              guardianName: data.guardianName,
            }
          : {}),
      },
    })

    if (data.role === 'TUTOR') {
      const profile = await db.tutorProfile.create({
        data: {
          userId: user.id,
          bio: data.bio || 'New tutor on Qtuor.',
          specialties: data.specialties || 'Noorani Qaida,Quran Recitation With Tajweed',
          languages: data.languages || 'Arabic,English',
          perClassRate: data.perClassRate || 6,
          nativeArabic: data.nativeArabic || false,
          hafiz: data.hafiz || false,
          ijazaCertified: data.ijazaCertified || false,
          experienceYears: data.experienceYears || 1,
          teachingStyle: data.teachingStyle,
          videoUrl: data.videoUrl,
          verified: false,
          status: 'PENDING',
        },
      })

      // Persist the document uploads (idDocumentUrl + certificateUrls) via a
      // raw UPDATE so this works even if the running Prisma client hasn't yet
      // been regenerated to include the new columns in its model definition
      // (the dev server caches the client across hot reloads).
      const idDoc = data.idDocumentUrl || null
      const certJson =
        data.certificateUrls && data.certificateUrls.length
          ? JSON.stringify(data.certificateUrls)
          : null
      await db.$executeRaw`
        UPDATE "TutorProfile"
        SET "idDocumentUrl" = ${idDoc}, "certificateUrls" = ${certJson}
        WHERE "id" = ${profile.id}
      `

      await db.wallet.create({ data: { tutorId: user.id, balance: 0, totalEarned: 0 } })

      // ===== Automation trigger: TUTOR_WELCOME WhatsApp message =====
      // Fired right after a tutor submits their registration (incl. the legal
      // agreement step). Uses the customizable WhatsAppTemplate.
      try {
        const { sendWhatsApp, getTemplate } = await import('@/lib/whatsapp')
        const message = await getTemplate(
          'TUTOR_WELCOME',
          'Assalamu Alaikum {TutorName}, your registration application has been received successfully on Qtuor! Our team is reviewing your uploaded documents. You will be notified once approved.',
          { TutorName: user.name }
        )
        await sendWhatsApp({
          type: 'REGISTRATION_FEE',
          recipientName: user.name,
          recipientPhone: user.phone,
          recipientUserId: user.id,
          recipientTutorId: profile.id,
          message,
          meta: { trigger: 'TUTOR_WELCOME', tutorId: user.id },
        })
      } catch (e) {
        // Non-blocking — registration should still succeed if WhatsApp fails
        console.error('[register] TUTOR_WELCOME WhatsApp trigger failed:', e)
      }
    }

    await setSession({ userId: user.id, role: data.role, email: user.email, name: user.name })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.country,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Registration failed.' }, { status: 400 })
  }
}
