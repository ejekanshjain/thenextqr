import { relations } from 'drizzle-orm'
import {
  accountsTable,
  invitationsTable,
  membersTable,
  organizationsTable,
  sessionsTable,
  usersTable
} from './schema'

export const userRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  accounts: many(accountsTable),
  members: many(membersTable),
  invitations: many(invitationsTable)
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
    invitations: many(invitationsTable)
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
