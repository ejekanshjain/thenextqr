'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icons } from '@/components/icons'
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
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { GetQRCodeFnDataType, createQRCode, updateQRCode } from './actions'

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
        router.refresh()
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
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
                {form.getValues('dynamic') ? (
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
              <div></div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.save className="mr-2 h-4 w-4" />
              )}
              <span>Save</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
