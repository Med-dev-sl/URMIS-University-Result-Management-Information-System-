import test from 'node:test'
import assert from 'node:assert/strict'
import { filterCommunicationItems } from './communicationUtils.js'

test('filters communication items by search and category', () => {
  const items = [
    { title: 'Registration reminder', category: 'Announcements', priority: 'High' },
    { title: 'Transcript request', category: 'Inbox', priority: 'Medium' },
    { title: 'Exam results published', category: 'Broadcast', priority: 'High' },
  ]

  assert.equal(filterCommunicationItems(items, 'registration', 'All').length, 1)
  assert.equal(filterCommunicationItems(items, '', 'High').length, 2)
  assert.equal(filterCommunicationItems(items, 'transcript', 'All').length, 1)
})
