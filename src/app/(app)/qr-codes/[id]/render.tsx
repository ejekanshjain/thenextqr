/* eslint-disable @next/next/no-img-element */
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { FC, useEffect, useMemo, useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { env } from '@/env.mjs'
import Link from 'next/link'
import {
  GetQRCodeFnDataType,
  createQRCode,
  deleteQRCode,
  updateQRCode
} from './actions'

const QRCodeSchema = z.object({
  dynamic: z.boolean(),
  name: z.string(),
  slug: z.string().optional(),
  website: z.string().url()
})

type FormData = z.infer<typeof QRCodeSchema>

export const Render: FC<{ qrCode?: GetQRCodeFnDataType }> = ({ qrCode }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(QRCodeSchema),
    defaultValues: {
      dynamic: qrCode?.dynamic || false,
      name: qrCode?.name || '',
      slug: qrCode?.slug || '',
      website: qrCode?.website || ''
    }
  })
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [qr, setQr] = useState('')

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    try {
      if (!qrCode) {
        const newQRCodeId = await createQRCode({
          ...data
        })
        router.replace(`/qr-codes/${newQRCodeId}`)
      } else {
        await updateQRCode({
          id: qrCode.id,
          ...data
        })
      }
      toast({
        title: 'QR Code saved'
      })
    } catch (err) {
      toast({
        title: 'Error saving qr code',
        description: (err as any).message || undefined,
        variant: 'destructive'
      })
    }
    setIsSaving(false)
  }

  const dynamic = form.watch('dynamic')
  const slug = form.watch('slug')
  const website = form.watch('website')

  const url = useMemo(() => {
    if (dynamic) return slug ? `${env.NEXT_PUBLIC_APP_URL}/${slug}` : undefined
    else return website ? website : undefined
  }, [dynamic, slug, website])

  useEffect(() => {
    if (!url) return setQr('')
    QRCode.toDataURL(
      url,
      {
        width: 640
      },
      (err, dataUrl) => {
        if (err) return console.error(err)
        setQr(dataUrl)
      }
    )
  }, [url])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div className="col-span-1 flex gap-2 md:col-span-2">
          <Button type="button" onClick={() => router.back()} variant="ghost">
            <Icons.chevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button type="submit" disabled={isSaving}>
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
                <Button type="button" variant="destructive">
                  <Icons.delete className="mr-2 h-4 w-4" />
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
                      setIsSaving(true)
                      await deleteQRCode(qrCode.id)
                      toast({
                        title: 'QR Code deleted'
                      })
                      router.replace('/qr-codes')
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
        </div>
        <div className="col-span-1 flex items-center justify-center">
          {url && qr ? (
            <Card>
              <CardContent>
                <img src={qr} alt="QR Code" />
                <Link
                  href={url}
                  className="text-sm text-muted-foreground underline underline-offset-4"
                >
                  {url}
                </Link>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          ) : undefined}
        </div>
      </form>
    </Form>
  )
}
