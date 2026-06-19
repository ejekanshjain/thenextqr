/* eslint-disable @next/next/no-img-element */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import debounce from 'lodash/debounce'
import { useRouter } from 'next/navigation'
import QRCodeGen from 'qrcode'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icons } from '@/components/icons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { env } from '@/env.mjs'
import { canvasRoundRect } from '@/lib/canvasRoundRect'
import { getQRUrl } from '@/lib/getQRUrl'
import {
  DEFAULT_QR_COLOR_MODE,
  DEFAULT_QR_FINDER_PATTERN_COLOR,
  applyQRCodeColor,
  getQRCodeCanvasOptions,
  isQRCodeFinderPatternColorValid,
  normalizeQRCodeFinderPatternColor
} from '@/lib/qrFinderPatternColor'
import { QRCodeType } from '@prisma/client'
import {
  GetQRCodeFnDataType,
  createQRCode,
  deleteQRCode,
  updateQRCode
} from './actions'

const QRCodeSchema = z.object({
  dynamic: z.boolean(),
  name: z.string().min(1),
  slug: z.string().optional(),
  logoId: z.string().optional().nullable(),
  type: z.nativeEnum(QRCodeType),
  colorCode: z.string().refine(isQRCodeFinderPatternColorValid, {
    message: 'Enter a valid hex color, like #000000.'
  }),
  colorMode: z.enum(['finderPattern', 'full']),
  website: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  message: z.string().optional(),
  email: z.string().optional(),
  subject: z.string().optional()
})

type FormData = z.infer<typeof QRCodeSchema>

export const Render: FC<{ qrCode?: GetQRCodeFnDataType }> = ({ qrCode }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(QRCodeSchema),
    defaultValues: {
      dynamic: qrCode?.dynamic || false,
      name: qrCode?.name || '',
      slug: qrCode?.slug || '',
      logoId: qrCode?.logo?.id,
      type: qrCode?.type || 'website',
      colorCode: qrCode?.colorCode || DEFAULT_QR_FINDER_PATTERN_COLOR,
      colorMode: qrCode?.colorMode || DEFAULT_QR_COLOR_MODE,
      website: qrCode?.website || undefined,
      phoneNumber: qrCode?.phoneNumber || undefined,
      message: qrCode?.message || undefined,
      email: qrCode?.email || undefined,
      subject: qrCode?.subject || undefined
    }
  })
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [generatedQRCode, setGeneratedQRCode] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoUrl = qrCode?.logo?.cdnUrl || qrCode?.logo?.url

  const dynamic = form.watch('dynamic')
  const slug = form.watch('slug')
  const type = form.watch('type')
  const colorCode = form.watch('colorCode')
  const colorMode = form.watch('colorMode')
  const website = form.watch('website')
  const phoneNumber = form.watch('phoneNumber')
  const message = form.watch('message')
  const email = form.watch('email')
  const subject = form.watch('subject')

  useEffect(() => {
    if (!qrCode) return
    form.setValue('dynamic', qrCode.dynamic)
    form.setValue('name', qrCode.name)
    form.setValue('slug', qrCode.slug || '')
    form.setValue('logoId', qrCode.logo?.id)
    form.setValue('type', qrCode.type)
    form.setValue('colorCode', qrCode.colorCode)
    form.setValue('colorMode', qrCode.colorMode)
    form.setValue('website', qrCode.website || undefined)
    form.setValue('phoneNumber', qrCode.phoneNumber || undefined)
    form.setValue('message', qrCode.message || undefined)
    form.setValue('email', qrCode.email || undefined)
    form.setValue('subject', qrCode.subject || undefined)
  }, [qrCode, form])

  const debouncedSetQr = useMemo(
    () =>
      debounce(
        (
          url: string,
          colorCode: string,
          colorMode: FormData['colorMode'],
          imageUrl: string | undefined
        ) => {
          const qrCodeCanvasOptions = getQRCodeCanvasOptions(
            colorCode,
            colorMode
          )
          const qrData = QRCodeGen.create(url, qrCodeCanvasOptions)

          QRCodeGen.toCanvas(canvasRef.current, url, qrCodeCanvasOptions).then(
            () => {
              const canvas = canvasRef.current
              if (!canvas) return

              applyQRCodeColor({
                canvas,
                color: colorCode,
                margin: qrCodeCanvasOptions.margin,
                mode: colorMode,
                moduleCount: qrData.modules.size
              })

              if (!imageUrl) {
                setGeneratedQRCode(canvas.toDataURL('image/png'))
                return
              }

              const image = new Image()
              image.src = imageUrl
              image.crossOrigin = 'anonymous'

              const ctx = canvasRef.current.getContext('2d')!
              const canvasWidth = canvas.width
              const logoSize = 0.29
              const borderSize = 0.024
              const borderRadius = 1
              const bgColor = '#ffffff'

              const logoWidth = canvasWidth * logoSize
              const logoXY = (canvasWidth * (1 - logoSize)) / 2
              const logoBgWidth = canvasWidth * (logoSize + borderSize)
              const logoBgXY = (canvasWidth * (1 - logoSize - borderSize)) / 2

              canvasRoundRect(ctx)(
                logoBgXY,
                logoBgXY,
                logoBgWidth,
                logoBgWidth,
                borderRadius
              )
              ctx.fillStyle = bgColor
              ctx.fill()

              image.onload = () => {
                ctx.drawImage(image, logoXY, logoXY, logoWidth, logoWidth)
                const dataUrl = canvasRef.current?.toDataURL('image/png')
                setGeneratedQRCode(dataUrl || '')
              }

              image.onerror = () => {
                const dataUrl = canvasRef.current?.toDataURL('image/png')
                setGeneratedQRCode(dataUrl || '')
              }
            }
          )
        },
        500
      ),
    []
  )

  const url = useMemo(() => {
    if (dynamic) return slug ? `${env.NEXT_PUBLIC_APP_URL}/${slug}` : undefined
    else {
      return getQRUrl({
        type,
        website,
        phoneNumber,
        message,
        email,
        subject
      })
    }
  }, [dynamic, slug, type, website, phoneNumber, message, email, subject])

  useEffect(() => {
    if (!url) return setGeneratedQRCode('')
    debouncedSetQr(
      url,
      normalizeQRCodeFinderPatternColor(colorCode),
      colorMode,
      logoUrl
    )
  }, [colorCode, colorMode, debouncedSetQr, logoUrl, url])

  useEffect(() => {
    return () => {
      debouncedSetQr.cancel()
    }
  }, [debouncedSetQr])

  const onSubmit = async (data: FormData) => {
    setIsSaving(true)

    if (!qrCode) {
      const result = await createQRCode({
        dynamic: data.dynamic,
        name: data.name,
        slug: data.slug,
        logoId: data.logoId,
        type: data.type,
        colorCode: data.colorCode,
        colorMode: data.colorMode,
        website: data.website || null,
        phoneNumber: data.phoneNumber || null,
        message: data.message || null,
        email: data.email || null,
        subject: data.subject || null
      })

      if (result.error) {
        toast({
          title: 'Error saving qr code',
          description: result.error,
          variant: 'destructive'
        })
      } else if (result.id) {
        toast({
          title: 'QR Code saved'
        })
        router.replace(`/qr-codes/${result.id}`)
      }
    } else {
      const result = await updateQRCode({
        id: qrCode.id,
        dynamic: data.dynamic,
        name: data.name,
        slug: data.slug,
        logoId: data.logoId,
        colorCode: data.colorCode,
        colorMode: data.colorMode,
        website: data.website || null,
        phoneNumber: data.phoneNumber || null,
        message: data.message || null,
        email: data.email || null,
        subject: data.subject || null
      })
      if (result.error) {
        toast({
          title: 'Error saving qr code',
          description: result.error,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'QR Code saved'
        })
      }
    }

    setIsSaving(false)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <div className="col-span-1 flex gap-2 lg:col-span-2">
          <Button type="button" onClick={() => router.back()} variant="ghost">
            <Icons.chevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isDeleting || isUploading}
          >
            {isSaving ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.save className="mr-2 h-4 w-4" />
            )}
            <span>Save</span>
          </Button>
          {qrCode ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSaving || isDeleting || isUploading}
                >
                  {isDeleting ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.delete className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your qr code and remove all its analytics data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      setIsDeleting(true)
                      await deleteQRCode(qrCode.id)
                      toast({
                        title: 'QR Code deleted'
                      })
                      router.push('/qr-codes')
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          {qrCode?.totalScans ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/qr-codes/${qrCode.id}/analytics`)}
            >
              <Icons.analytics className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <div className="col-span-1 flex flex-col gap-3">
          <FormField
            control={form.control}
            name="dynamic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Dynamic QR Code</FormLabel>
                  <FormDescription>Track number of scans.</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter name"
                    autoComplete="off"
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {dynamic ? (
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom url</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter custom url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      disabled={isSaving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : undefined}
          <div className="grid w-full gap-3">
            <Label htmlFor="logoFileInput">Logo</Label>
            <Input
              id="logoFileInput"
              type="file"
              accept="image/png,image/jpeg"
              disabled={isUploading}
              onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                setIsUploading(true)
                try {
                  const formData = new FormData()
                  formData.append('file', file)
                  const res = await fetch('/api/upload-qr-logo', {
                    method: 'POST',
                    body: formData
                  })
                  const json = await res.json()
                  if (json.success && json.id) {
                    form.setValue('logoId', json.id)
                    onSubmit(form.getValues())
                  } else {
                    toast({
                      title: 'Failed to upload logo',
                      variant: 'destructive'
                    })
                  }
                } catch (err) {
                  console.error(err)
                  toast({
                    title: 'Failed to upload logo',
                    variant: 'destructive'
                  })
                }
                setIsUploading(false)
              }}
            />
          </div>
          <div className="grid gap-3 rounded-lg border p-4">
            <FormField
              control={form.control}
              name="colorCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QR color</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="#000000"
                      autoCapitalize="none"
                      autoCorrect="off"
                      disabled={isSaving}
                      aria-invalid={
                        !isQRCodeFinderPatternColorValid(field.value)
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Color complete QR
                    </FormLabel>
                    <FormDescription>
                      Turn off to color only the three side squares.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'full'}
                      onCheckedChange={checked =>
                        field.onChange(checked ? 'full' : 'finderPattern')
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(QRCodeType).map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {type === 'website' ? (
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="Enter website url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      disabled={isSaving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          {type === 'phone' || type === 'sms' ? (
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="tel"
                      disabled={isSaving}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          {type === 'email' ? (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="email"
                        disabled={isSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter subject"
                        autoCapitalize="on"
                        autoCorrect="on"
                        disabled={isSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter message"
                        autoCapitalize="on"
                        autoCorrect="on"
                        disabled={isSaving}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <canvas ref={canvasRef} className="hidden" />
          {url && generatedQRCode ? (
            <Card>
              <CardHeader>Generated QR Code</CardHeader>
              <CardContent>
                <img src={generatedQRCode} alt="QR Code" />
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = generatedQRCode
                    a.download = `${
                      form.getValues('name').toString() ||
                      Math.random().toString().replace('.', '')
                    }.png`
                    a.click()
                  }}
                >
                  <Icons.download className="mr-2 h-4 w-4" />
                  Download png
                </Button>
              </CardFooter>
            </Card>
          ) : undefined}
        </div>
      </form>
    </Form>
  )
}
