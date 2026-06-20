import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core'
import { commonFieldDefs } from './common'

export const usersTable = pgTable('users', {
  id: commonFieldDefs.id('user'),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role'),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: commonFieldDefs.date('ban_expires'),
  ...commonFieldDefs.dates
})

export const sessionsTable = pgTable(
  'sessions',
  {
    id: commonFieldDefs.id('session'),
    expiresAt: commonFieldDefs.date('expires_at').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
    activeOrganizationId: text('active_organization_id'),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.userId)]
)

export const accountsTable = pgTable(
  'accounts',
  {
    id: commonFieldDefs.id('account'),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: commonFieldDefs.date('access_token_expires_at'),
    refreshTokenExpiresAt: commonFieldDefs.date('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.userId)]
)

export const verificationsTable = pgTable('verifications', {
  id: commonFieldDefs.id('verification'),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: commonFieldDefs.date('expires_at').notNull(),
  ...commonFieldDefs.dates
})

export const organizationsTable = pgTable('organizations', {
  id: commonFieldDefs.id('organization'),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  metadata: text('metadata'),
  ...commonFieldDefs.dates
})

export const membersTable = pgTable(
  'members',
  {
    id: commonFieldDefs.id('member'),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.organizationId), index().on(table.userId)]
)

export const invitationsTable = pgTable(
  'invitations',
  {
    id: commonFieldDefs.id('invitation'),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').default('pending').notNull(),
    expiresAt: commonFieldDefs.date('expires_at'),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade'
      }),
    ...commonFieldDefs.dates
  },
  table => [
    index().on(table.organizationId),
    index().on(table.email),
    uniqueIndex()
      .on(table.organizationId, table.email)
      .where(sql`${table.status} = 'pending'`)
  ]
)

export const fileUploadsTable = pgTable(
  'file_uploads',
  {
    id: varchar('id').primaryKey(),
    // Object path e.g. uploads/organizations/organizationId/filename.jpg
    key: text('key').notNull().unique(),
    originalName: varchar('original_name').notNull(),
    mimeType: varchar('mime_type').notNull(),
    // In Bytes
    size: integer('size').notNull(),
    isTemp: boolean('is_temp').notNull().default(true),
    uploadedBy: varchar('uploaded_by').references(() => usersTable.id, {
      onDelete: 'set null'
    }),
    // Nullable: scopes upload to a organization for cleanup purposes
    organizationId: varchar('organization_id').references(
      () => organizationsTable.id
    ),
    ...commonFieldDefs.dates
  },
  table => [
    index().on(table.uploadedBy),
    index().on(table.isTemp, table.createdAt)
  ]
)

export const qrCodeTypeEnum = pgEnum('qr_code_type', [
  'website',
  'email',
  'sms',
  'phone'
])

export const qrCodeColorModeEnum = pgEnum('qr_code_color_mode', [
  'finderPattern',
  'full'
])

export const qrCodesTable = pgTable(
  'qr_codes',
  {
    id: commonFieldDefs.id('qr_code'),
    organizationId: varchar('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    createdById: varchar('created_by_id').references(() => usersTable.id, {
      onDelete: 'set null'
    }),
    updatedById: varchar('updated_by_id').references(() => usersTable.id, {
      onDelete: 'set null'
    }),
    logoUrl: text('logo_url'),
    isDynamic: boolean('is_dynamic').notNull().default(false),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    type: qrCodeTypeEnum('type').notNull().default('website'),
    colorCode: varchar('color_code', { length: 7 })
      .notNull()
      .default('#000000'),
    colorMode: qrCodeColorModeEnum('color_mode')
      .notNull()
      .default('finderPattern'),
    expiresAt: commonFieldDefs.date('expires_at'),
    totalScans: integer('total_scans').notNull().default(0),
    website: text('website'),
    phoneNumber: text('phone_number'),
    message: text('message'),
    email: text('email'),
    subject: text('subject'),
    ...commonFieldDefs.dates
  },
  table => [index().on(table.organizationId)]
)

export const qrCodeScanLogsTable = pgTable(
  'qr_code_scan_logs',
  {
    id: commonFieldDefs.id('qr_code_scan_log'),
    qrCodeId: varchar('qr_code_id')
      .notNull()
      .references(() => qrCodesTable.id, { onDelete: 'cascade' }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    browserName: text('browser_name'),
    browserVersion: text('browser_version'),
    osName: text('os_name'),
    osVersion: text('os_version'),
    deviceVendor: text('device_vendor'),
    deviceModel: text('device_model'),
    deviceType: text('device_type'),
    createdAt: commonFieldDefs.date('created_at').notNull().defaultNow()
  },
  table => [index().on(table.qrCodeId)]
)
