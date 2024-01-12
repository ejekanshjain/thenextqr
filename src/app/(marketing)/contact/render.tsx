'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FC, HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/cn'

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1)
})

type FormData = z.infer<typeof contactSchema>

interface ContactFormProps extends HTMLAttributes<HTMLDivElement> {}

export const Render: FC = ({ className, ...props }: ContactFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(contactSchema)
  })

  const [isSaving, setIsSaving] = useState(false)

  async function onSubmit(data: FormData) {
    console.log(data)
    setIsSaving(true)
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="max-w-[400px]">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Your Name"
                    autoComplete="name"
                    autoCapitalize="on"
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
            name="email"
            render={({ field }) => (
              <FormItem className="max-w-[400px]">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Your Email"
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
              <FormItem className="max-w-[400px]">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter Subject"
                    autoComplete="off"
                    autoCapitalize="on"
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
              <FormItem className="max-w-[400px]">
                <FormControl>
                  <Textarea
                    placeholder="Your Message"
                    autoComplete="off"
                    autoCapitalize="on"
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.send className="mr-2 h-4 w-4" />
            )}
            <span>Submit</span>
          </Button>
        </form>
      </Form>
    </div>
  )
}
