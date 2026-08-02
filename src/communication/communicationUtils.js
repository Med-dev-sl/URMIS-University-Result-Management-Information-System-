export function filterCommunicationItems(items, searchTerm, category) {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const normalizedCategory = category.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = normalizedSearch.length === 0 || `${item.title ?? ''} ${item.detail ?? ''} ${item.subject ?? ''} ${item.category ?? ''}`.toLowerCase().includes(normalizedSearch)
    const matchesCategory = normalizedCategory === 'all' || item.category?.toLowerCase() === normalizedCategory || item.priority?.toLowerCase() === normalizedCategory
    return matchesSearch && matchesCategory
  })
}
