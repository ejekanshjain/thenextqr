'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, ExternalLink, Loader2, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import {
  createQRCodeAction,
  deleteQRCodeAction,
  updateQRCodeAction
} from '~/app/(app)/actions/qr-codes'
import {
  createQRCodeSchema,
  updateQRCodeSchema
} from '~/app/(app)/actions/qr-codes.validation'
import { FileUpload } from '~/components/file-upload'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldTitle
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { Textarea } from '~/components/ui/textarea'
import { getDynamicQRCodeUrl, getQRUrl } from '~/lib/qr-url'
import { useSafeActionMutation } from '~/lib/safe-action-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'
import { QRCodePreview } from './qr-code-preview'

type QRCodeFormInput = z.input<typeof createQRCodeSchema>
type QRCodeFormValues = z.output<typeof createQRCodeSchema>

type QRCodeFormRecord = z.infer<typeof updateQRCodeSchema> & {
  logoResolvedUrl?: string | null
}

type QRCodeFormProps = {
  mode: 'create' | 'edit'
  organizationId: string
  appBaseUrl: string
  qrCode?: QRCodeFormRecord
}

const qrTypes = [
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'phone', label: 'Phone' }
] as const

const colorModes = [
  { value: 'finderPattern', label: 'Corner markers' },
  { value: 'full', label: 'Full QR code' }
] as const

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function QRCodeForm({
  mode,
  organizationId,
  appBaseUrl,
  qrCode
}: QRCodeFormProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [slugEdited, setSlugEdited] = useState(mode === 'edit')
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    qrCode?.logoResolvedUrl ?? null
  )
  const { mutateAsync: createQRCode, isPending: isCreating } =
    useSafeActionMutation(createQRCodeAction)
  const { mutateAsync: updateQRCode, isPending: isUpdating } =
    useSafeActionMutation(updateQRCodeAction)
  const { mutateAsync: deleteQRCode, isPending: isDeleting } =
    useSafeActionMutation(deleteQRCodeAction)

  const form = useForm<QRCodeFormInput, unknown, QRCodeFormValues>({
    resolver: zodResolver(createQRCodeSchema),
    defaultValues: {
      organizationId,
      name: qrCode?.name ?? '',
      isDynamic: qrCode?.isDynamic ?? true,
      slug: qrCode?.slug ?? '',
      logoUrl: qrCode?.logoUrl ?? null,
      type: qrCode?.type ?? 'website',
      colorCode: qrCode?.colorCode ?? '#000000',
      colorMode: qrCode?.colorMode ?? 'finderPattern',
      website: qrCode?.website ?? null,
      phoneNumber: qrCode?.phoneNumber ?? null,
      message: qrCode?.message ?? null,
      email: qrCode?.email ?? null,
      subject: qrCode?.subject ?? null
    }
  })

  const watchedValues = useWatch({ control: form.control })
  const type = watchedValues.type ?? 'website'
  const isDynamic = watchedValues.isDynamic ?? false
  const slug = watchedValues.slug
  const colorCode = watchedValues.colorCode ?? '#000000'
  const colorMode = watchedValues.colorMode ?? 'finderPattern'
  const name = watchedValues.name
  const website = watchedValues.website
  const phoneNumber = watchedValues.phoneNumber
  const message = watchedValues.message
  const email = watchedValues.email
  const subject = watchedValues.subject

  const staticDestination = useMemo(
    () =>
      getQRUrl({
        type,
        website,
        phoneNumber,
        message,
        email,
        subject
      }),
    [email, message, phoneNumber, subject, type, website]
  )

  const previewValue =
    isDynamic && slug
      ? getDynamicQRCodeUrl(slug, appBaseUrl)
      : isDynamic
        ? undefined
        : staticDestination

  const statusText = isDynamic
    ? slug
      ? `Scans route through /q/${slug}. Destination can be changed later.`
      : 'Choose a slug to create a trackable redirect link.'
    : 'Destination is embedded directly. Changing it requires a new download.'

  async function onSubmit(values: QRCodeFormValues) {
    try {
      if (mode === 'create') {
        const created = await createQRCode(values)
        if (!created?.id) throw new Error('QR code was not created')
        toastSuccessMessage('QR code created')
        router.push(`/app/${organizationId}/qr-codes/${created.id}`)
        return
      }

      if (!qrCode?.id) return

      await updateQRCode({
        ...values,
        id: qrCode.id
      })
      toastSuccessMessage('QR code saved')
      router.refresh()
    } catch (error) {
      toastErrorMessage(
        error instanceof Error ? error.message : 'Failed to save QR code'
      )
    }
  }

  async function onDelete() {
    if (!qrCode?.id) return

    try {
      await deleteQRCode({ organizationId, id: qrCode.id })
      toastSuccessMessage('QR code deleted')
      router.push(`/app/${organizationId}/qr-codes`)
    } catch (error) {
      toastErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete QR code'
      )
    }
  }

  const isSaving = isCreating || isUpdating

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]"
    >
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>QR details</CardTitle>
            <CardDescription>
              Name the QR code and choose how scans should resolve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldTitle>Name</FieldTitle>
                    <FieldContent>
                      <Input
                        placeholder="Summer menu"
                        aria-invalid={fieldState.invalid}
                        {...field}
                        onChange={event => {
                          field.onChange(event)
                          if (!slugEdited) {
                            form.setValue('slug', slugify(event.target.value), {
                              shouldValidate: true
                            })
                          }
                        }}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="isDynamic"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FieldContent>
                      <FieldTitle>Dynamic QR</FieldTitle>
                      <FieldDescription>
                        Use a short redirect link so scans can be tracked and
                        the destination can change later.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                )}
              />

              {isDynamic ? (
                <Controller
                  control={form.control}
                  name="slug"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldTitle>Public slug</FieldTitle>
                      <FieldContent>
                        <Input
                          placeholder="summer-menu"
                          aria-invalid={fieldState.invalid}
                          value={field.value ?? ''}
                          onChange={event => {
                            setSlugEdited(true)
                            field.onChange(slugify(event.target.value))
                          }}
                        />
                        <FieldDescription>
                          Public link: /q/{field.value || 'your-slug'}
                        </FieldDescription>
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destination</CardTitle>
            <CardDescription>
              Only the fields needed for the selected type are shown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldTitle>Type</FieldTitle>
                    <FieldContent>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {qrTypes.map(item => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {type === 'website' ? (
                <Controller
                  control={form.control}
                  name="website"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldTitle>Website URL</FieldTitle>
                      <FieldContent>
                        <Input
                          placeholder="https://example.com"
                          aria-invalid={fieldState.invalid}
                          value={field.value ?? ''}
                          onChange={field.onChange}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />
              ) : null}

              {type === 'phone' || type === 'sms' ? (
                <Controller
                  control={form.control}
                  name="phoneNumber"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldTitle>Phone number</FieldTitle>
                      <FieldContent>
                        <Input
                          placeholder="+1 555 123 4567"
                          aria-invalid={fieldState.invalid}
                          value={field.value ?? ''}
                          onChange={field.onChange}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />
              ) : null}

              {type === 'sms' ? (
                <Controller
                  control={form.control}
                  name="message"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldTitle>Message</FieldTitle>
                      <FieldContent>
                        <Textarea
                          placeholder="Optional message"
                          aria-invalid={fieldState.invalid}
                          value={field.value ?? ''}
                          onChange={field.onChange}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />
              ) : null}

              {type === 'email' ? (
                <>
                  <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldTitle>Email address</FieldTitle>
                        <FieldContent>
                          <Input
                            placeholder="hello@example.com"
                            aria-invalid={fieldState.invalid}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="subject"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldTitle>Subject</FieldTitle>
                        <FieldContent>
                          <Input
                            placeholder="Optional subject"
                            aria-invalid={fieldState.invalid}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="message"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldTitle>Message</FieldTitle>
                        <FieldContent>
                          <Textarea
                            placeholder="Optional email body"
                            aria-invalid={fieldState.invalid}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                      </Field>
                    )}
                  />
                </>
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Keep contrast high so printed codes remain easy to scan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                control={form.control}
                name="colorCode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldTitle>Color</FieldTitle>
                    <FieldContent>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-16 p-1"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        <Input
                          placeholder="#000000"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                      </div>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="colorMode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldTitle>Color mode</FieldTitle>
                    <FieldContent>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorModes.map(item => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Choose whether the color applies to only the corner
                        markers or every dark QR module.
                      </FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="logoUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldTitle>Logo</FieldTitle>
                    <FieldContent>
                      <div className="w-32">
                        <FileUpload
                          organizationId={organizationId}
                          accept="image/*"
                          currentUrl={logoPreviewUrl}
                          onPreviewChange={setLogoPreviewUrl}
                          onClientUploadFinish={value =>
                            field.onChange(value ?? '')
                          }
                          sizes="128px"
                        />
                      </div>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <aside className="xl:sticky xl:top-4">
        <Card>
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
            <CardDescription>{statusText}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <QRCodePreview
              value={previewValue}
              name={name || 'qr-code'}
              colorCode={colorCode}
              colorMode={colorMode}
              logoUrl={logoPreviewUrl}
              downloadable
            />

            <div className="flex flex-col gap-2">
              {previewValue ? (
                <Button type="button" variant="outline" asChild>
                  <a
                    href={previewValue}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink data-icon="inline-start" />
                    Test link
                  </a>
                </Button>
              ) : null}
              {previewValue ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(previewValue)
                    toastSuccessMessage('Link copied')
                  }}
                >
                  <Copy data-icon="inline-start" />
                  Copy link
                </Button>
              ) : null}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                {mode === 'create' ? 'Create QR code' : 'Save changes'}
              </Button>
              {mode === 'edit' ? (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 data-icon="inline-start" />
                      Delete QR code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete QR code?</DialogTitle>
                      <DialogDescription>
                        This permanently deletes the QR code and its scan logs.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeleteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={onDelete}
                      >
                        Delete QR code
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </aside>
    </form>
  )
}
