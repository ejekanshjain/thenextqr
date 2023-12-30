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
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { env } from '@/env.mjs'
import { canvasRoundRect } from '@/lib/canvasRoundRect'
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
  website: z.string().url(),
  logoId: z.string().optional().nullable()
})

type FormData = z.infer<typeof QRCodeSchema>

export const Render: FC<{ qrCode?: GetQRCodeFnDataType }> = ({ qrCode }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(QRCodeSchema),
    defaultValues: {
      dynamic: qrCode?.dynamic || false,
      name: qrCode?.name || '',
      slug: qrCode?.slug || '',
      website: qrCode?.website || '',
      logoId: qrCode?.logo?.id
    }
  })
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [generatedQRCode, setGeneratedQRCode] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    if (!qrCode) {
      const result = await createQRCode({
        ...data
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
        ...data
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

  const dynamic = form.watch('dynamic')
  const slug = form.watch('slug')
  const website = form.watch('website')

  const debouncedSetQr = useMemo(
    () =>
      debounce((url: string) => {
        QRCodeGen.toCanvas(canvasRef.current, url, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: 'H'
        }).then(() => {
          const canvas = canvasRef.current
          if (!canvas) return
          const imageUrl = qrCode?.logo?.cdnUrl || qrCode?.logo?.url

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
        })
      }, 1000),
    [qrCode?.logo?.cdnUrl, qrCode?.logo?.url]
  )

  const url = useMemo(() => {
    if (dynamic) return slug ? `${env.NEXT_PUBLIC_APP_URL}/${slug}` : undefined
    else return website ? website : undefined
  }, [dynamic, slug, website])

  useEffect(() => {
    if (!url) return setGeneratedQRCode('')
    debouncedSetQr(url)
  }, [debouncedSetQr, url])

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
          <div className={`grid w-full gap-3 ${!qrCode ? 'hidden' : ''}`}>
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
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <canvas ref={canvasRef} className="hidden" />
          {url && generatedQRCode ? (
            <Card>
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
