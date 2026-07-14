'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { usePlans, usePublicBankDetails, useLocalBankSubscribe } from '@/lib/queries'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, CreditCard, Loader2, Lock, ShieldCheck, Landmark, Copy, Upload, FileText, X } from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  category?: string
  classesPerMonth: number
  monthlyPrice: number
  features: string[]
  popular?: boolean
}

interface BankDetails {
  id: string
  bankName: string
  accountHolder: string
  accountNumber: string | null
  iban: string | null
  swiftCode: string | null
  branchCode: string | null
  country: string | null
  currency: string
  notes: string | null
}

export function CheckoutModal({ plan: planProp }: { plan: Plan | null }) {
  const { checkoutOpen, setCheckoutOpen, selectedPlanId, user, openAuth, setView } = useAppStore()
  const { data: plansData, isLoading: plansLoading } = usePlans()
  const plans = plansData?.plans
  // Resolve the plan from the query cache if the prop is null
  const plan = planProp || plans?.find((p) => p.id === selectedPlanId) || null
  const [loading, setLoading] = React.useState(false)
  const [card, setCard] = React.useState({ number: '', name: '', exp: '', cvc: '' })

  // Local bank transfer state
  const [payMethod, setPayMethod] = React.useState<'card' | 'bank'>('card')
  const [bankDetails, setBankDetails] = React.useState<BankDetails | null>(null)
  const [receiptUrl, setReceiptUrl] = React.useState('')
  const [receiptName, setReceiptName] = React.useState('')
  const [uploading, setUploading] = React.useState(false)

  const { data: bankData, isLoading: bankLoading } = usePublicBankDetails()
  const localBankMut = useLocalBankSubscribe()

  // Sync bank details from query → local state.
  React.useEffect(() => {
    if (bankData?.bank) setBankDetails(bankData.bank as BankDetails)
    else setBankDetails(null)
  }, [bankData])

  // Reset bank-transfer state whenever the modal closes.
  React.useEffect(() => {
    if (!checkoutOpen) {
      setPayMethod('card')
      setReceiptUrl('')
      setReceiptName('')
      setCard({ number: '', name: '', exp: '', cvc: '' })
    }
  }, [checkoutOpen])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setCheckoutOpen(false)
      openAuth('register')
      toast.info('Please sign up to complete your subscription.')
      return
    }
    if (!plan) return
    setLoading(true)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Subscription failed')
      toast.success(`You're subscribed to the ${plan.name} plan! Your monthly subscription is active. Enjoy unlimited scheduled classes.`)
      setCheckoutOpen(false)
      setView('student-dashboard')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadReceipt = async (file: File) => {
    if (!user) {
      openAuth('register')
      toast.info('Please sign up to upload a receipt.')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/receipt', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Receipt upload failed')
      setReceiptUrl(data.url)
      setReceiptName(file.name)
      toast.success('Receipt uploaded')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setCheckoutOpen(false)
      openAuth('register')
      toast.info('Please sign up to complete your subscription.')
      return
    }
    if (!plan) return
    if (!receiptUrl) {
      toast.error('Please upload your bank-transfer receipt.')
      return
    }
    setLoading(true)
    try {
      localBankMut.mutate(
        { planId: plan.id, receiptUrl },
        {
          onSuccess: () => {
            toast.success('Receipt submitted! Your subscription will be activated after admin verification.')
            setCheckoutOpen(false)
            setView('student-dashboard')
          },
          onError: (err: Error) => toast.error(err.message || 'Failed to submit receipt'),
          onSettled: () => setLoading(false),
        }
      )
    } catch (e: any) {
      toast.error(e.message)
      setLoading(false)
    }
  }

  const copyToClipboard = (label: string, value: string) => {
    if (!value) return
    navigator.clipboard?.writeText(value).then(
      () => toast.success(`${label} copied`),
      () => toast.error('Copy failed — please copy manually')
    )
  }

  return (
    <Dialog open={checkoutOpen && (!!plan || plansLoading)} onOpenChange={(o) => (o ? null : setCheckoutOpen(false))}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        {plansLoading && !plan ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading plan details…</p>
          </div>
        ) : plan ? (
        <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Subscribe to {plan.category ? `${plan.category} — ` : ''}{plan.name}
          </DialogTitle>
          <DialogDescription>
            {plan.classesPerMonth} classes/month · ${plan.monthlyPrice}/month · billed monthly
          </DialogDescription>
        </DialogHeader>

        {plan && (
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{plan.name} Plan</div>
                <div className="text-xs text-muted-foreground">{plan.classesPerMonth} classes / month</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">${plan.monthlyPrice}</div>
                <div className="text-xs text-muted-foreground">/month</div>
              </div>
            </div>
            <ul className="mt-2 space-y-1">
              {plan.features.slice(0, 3).map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Check className="mt-0.5 h-3 w-3 text-[oklch(0.62_0.14_230)]" /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payment-method selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPayMethod('card')}
            className={
              'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ' +
              (payMethod === 'card'
                ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/60')
            }
          >
            <CreditCard className="h-4 w-4" /> Card
          </button>
          <button
            type="button"
            onClick={() => setPayMethod('bank')}
            className={
              'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ' +
              (payMethod === 'bank'
                ? 'border-transparent bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/60')
            }
          >
            <Landmark className="h-4 w-4" /> Local Bank Transfer
          </button>
        </div>

        {payMethod === 'card' ? (
          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cn">Card number</Label>
                <Input
                  id="cn"
                  required
                  inputMode="numeric"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cna">Name on card</Label>
                <Input id="cna" required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ce">Expiry</Label>
                  <Input id="ce" required value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} placeholder="MM / YY" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cc">CVC</Label>
                  <Input id="cc" required inputMode="numeric" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} placeholder="123" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md bg-[oklch(0.93_0.04_240/0.6)] p-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-[oklch(0.62_0.14_230)]" />
              Demo checkout — no real payment is processed. Use any card details.
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Pay ${plan.monthlyPrice} & Subscribe
            </Button>
          </form>
        ) : (
          <form onSubmit={handleBankSubmit} className="space-y-4">
            {/* Bank details card */}
            <div className="rounded-lg border border-[oklch(0.62_0.14_230/0.35)] bg-[oklch(0.62_0.14_230/0.06)] p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[oklch(0.40_0.11_258)]">
                <Landmark className="h-3.5 w-3.5" /> Platform Bank Account
              </div>
              {bankLoading ? (
                <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading bank details…
                </div>
              ) : !bankDetails ? (
                <p className="text-xs text-muted-foreground">
                  No bank account configured. Please contact support for transfer details.
                </p>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <BankField label="Bank Name" value={bankDetails.bankName} onCopy={() => copyToClipboard('Bank name', bankDetails.bankName)} />
                  <BankField label="Account Title" value={bankDetails.accountHolder} onCopy={() => copyToClipboard('Account title', bankDetails.accountHolder)} />
                  {bankDetails.accountNumber && (
                    <BankField label="Account Number" value={bankDetails.accountNumber!} mono onCopy={() => copyToClipboard('Account number', bankDetails.accountNumber!)} />
                  )}
                  {bankDetails.iban && (
                    <BankField label="IBAN" value={bankDetails.iban!} mono onCopy={() => copyToClipboard('IBAN', bankDetails.iban!)} />
                  )}
                  {bankDetails.swiftCode && (
                    <BankField label="SWIFT / BIC" value={bankDetails.swiftCode!} mono onCopy={() => copyToClipboard('SWIFT', bankDetails.swiftCode!)} />
                  )}
                </div>
              )}
            </div>

            {/* Receipt upload */}
            <div className="space-y-1.5">
              <Label htmlFor="receipt">Upload Payment Receipt *</Label>
              <p className="text-[10px] text-muted-foreground">
                Transfer ${plan.monthlyPrice} to the account above, then upload your receipt (image or PDF, max 10 MB).
              </p>
              {receiptUrl ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-[oklch(0.55_0.13_150/0.4)] bg-[oklch(0.55_0.13_150/0.08)] p-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-[oklch(0.45_0.13_150)]" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">{receiptName}</p>
                      <p className="text-[10px] text-muted-foreground">Receipt ready to submit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold text-[oklch(0.40_0.11_258)] hover:underline"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => { setReceiptUrl(''); setReceiptName('') }}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Remove receipt"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="receipt"
                  className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-muted/30 p-5 text-center transition-colors hover:bg-muted/60"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">Click to upload receipt</span>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP or PDF · max 10 MB</span>
                    </>
                  )}
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleUploadReceipt(f)
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex items-start gap-2 rounded-md bg-[oklch(0.75_0.13_70/0.12)] p-2 text-[10px] text-[oklch(0.45_0.10_60)]">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.50_0.12_70)]" />
              Your subscription will be activated after the admin verifies your bank-transfer receipt (usually within 24 hours).
            </div>

            <Button
              type="submit"
              disabled={loading || uploading || !receiptUrl}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Submit Receipt for Approval
            </Button>
          </form>
        )}
        </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Plan not found.</p>
            <Button variant="outline" className="mt-3" onClick={() => setCheckoutOpen(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function BankField({
  label,
  value,
  mono,
  onCopy,
}: {
  label: string
  value: string | null | undefined
  mono?: boolean
  onCopy: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-background/60 px-2 py-1.5">
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={'truncate text-xs text-foreground ' + (mono ? 'font-mono' : 'font-semibold')}>{value}</div>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="flex shrink-0 items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold text-[oklch(0.40_0.11_258)] hover:bg-[oklch(0.62_0.14_230/0.1)]"
      >
        <Copy className="h-3 w-3" /> Copy
      </button>
    </div>
  )
}

function formatCard(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}
