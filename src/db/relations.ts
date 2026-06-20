import { relations } from 'drizzle-orm'
import {
  accountsTable,
  fileUploadsTable,
  invitationsTable,
  membersTable,
  organizationsTable,
  qrCodesTable,
  qrCodeScanLogsTable,
  sessionsTable,
  usersTable
} from './schema'

export const userRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  accounts: many(accountsTable),
  members: many(membersTable),
  invitations: many(invitationsTable),
  createdQRCodes: many(qrCodesTable, { relationName: 'createdQRCodes' }),
  updatedQRCodes: many(qrCodesTable, { relationName: 'updatedQRCodes' })
}))

export const sessionRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id]
  })
}))

export const accountRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id]
  })
}))

export const organizationRelations = relations(
  organizationsTable,
  ({ many }) => ({
    members: many(membersTable),
    invitations: many(invitationsTable),
    qrCodes: many(qrCodesTable)
  })
)

export const memberRelations = relations(membersTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [membersTable.organizationId],
    references: [organizationsTable.id]
  }),
  user: one(usersTable, {
    fields: [membersTable.userId],
    references: [usersTable.id]
  })
}))

export const invitationRelations = relations(invitationsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [invitationsTable.organizationId],
    references: [organizationsTable.id]
  }),
  user: one(usersTable, {
    fields: [invitationsTable.inviterId],
    references: [usersTable.id]
  })
}))

export const fileUploadRelations = relations(fileUploadsTable, ({ one }) => ({
  qrCodeLogo: one(qrCodesTable, {
    fields: [fileUploadsTable.id],
    references: [qrCodesTable.logoUploadId]
  })
}))

export const qrCodeRelations = relations(qrCodesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [qrCodesTable.organizationId],
    references: [organizationsTable.id]
  }),
  createdBy: one(usersTable, {
    fields: [qrCodesTable.createdById],
    references: [usersTable.id],
    relationName: 'createdQRCodes'
  }),
  updatedBy: one(usersTable, {
    fields: [qrCodesTable.updatedById],
    references: [usersTable.id],
    relationName: 'updatedQRCodes'
  }),
  logoUpload: one(fileUploadsTable, {
    fields: [qrCodesTable.logoUploadId],
    references: [fileUploadsTable.id]
  }),
  scanLogs: many(qrCodeScanLogsTable)
}))

export const qrCodeScanLogRelations = relations(
  qrCodeScanLogsTable,
  ({ one }) => ({
    qrCode: one(qrCodesTable, {
      fields: [qrCodeScanLogsTable.qrCodeId],
      references: [qrCodesTable.id]
    })
  })
)
