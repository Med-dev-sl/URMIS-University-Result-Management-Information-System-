import { useMemo, useState } from 'react'

export function useCrudManager({ items = [], pageSize = 8 }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim()
    return items.filter((item) => {
      if (filter !== 'all' && item.status && item.status !== filter) {
        return false
      }
      if (!term) return true
      return Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(term))
    })
  }, [items, search, filter])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))

  return {
    search,
    setSearch,
    filter,
    setFilter,
    page,
    setPage,
    selectedItem,
    setSelectedItem,
    showForm,
    setShowForm,
    showConfirmDelete,
    setShowConfirmDelete,
    pendingDelete,
    setPendingDelete,
    filteredItems,
    pagedItems,
    totalPages,
  }
}
