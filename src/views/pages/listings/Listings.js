import React, { useEffect, useState, useMemo } from 'react'
import { CContainer, CSmartTable, CMultiSelect } from '@coreui/react-pro'
import { useNavigate, useSearchParams } from 'react-router-dom'

// Helper to parse column filters from the URL parameters
const parseColumnFilters = (params) => {
  console.log('>>> parseColumnFilters: about to parse the URL params.')
  const filters = {}
  const possibleFilters = [
    'title',
    'pricetype',
    'price',
    'chat_minimale_waarde',
    'particulier',
    'published_date',
  ]
  possibleFilters.forEach((key) => {
    const val = params.get(`filter_${key}`)
    if (val) {
      console.log(`>>> parseColumnFilters: found filter_${key}=${val}`)
      filters[key] = val
    }
  })
  console.log('>>> parseColumnFilters: final filters =', filters)
  return filters
}

const VacanciesListing = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // 1) Initialize table params from the URL
  const [tableParams, setTableParams] = useState(() => {
    const parsed = {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
      columnFilters: parseColumnFilters(searchParams),
      globalFilter: searchParams.get('globalFilter') || '',
      sorter: {
        column: searchParams.get('sortColumn') || 'published_date',
        state: searchParams.get('sortOrder') || 'desc',
      },
    }
    console.log('>>> [INIT] tableParams =', parsed)
    return parsed
  })

  // 2) Keep the URL in sync with tableParams
  useEffect(() => {
    console.log(
      '>>> [EFFECT] tableParams changed, about to set search params. tableParams:',
      tableParams,
    )
    const params = new URLSearchParams()
    params.set('page', tableParams.page)
    params.set('pageSize', tableParams.pageSize)
    params.set('globalFilter', tableParams.globalFilter || '')
    params.set('sortColumn', tableParams.sorter.column || '')
    params.set('sortOrder', tableParams.sorter.state || '')

    // Store columnFilters in the URL as filter_<key>
    Object.entries(tableParams.columnFilters).forEach(([k, v]) => {
      if (v) {
        params.set(`filter_${k}`, v)
      }
    })
    console.log('>>> [EFFECT] final searchParams to set =', params.toString())

    setSearchParams(params, { replace: true })
  }, [tableParams, setSearchParams])

  // 3) Data from server
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)

  // Distinct options for multi-select columns
  const [pricetypeOptions, setPricetypeOptions] = useState([])
  const [particulierOptions, setParticulierOptions] = useState([])

  // total pages
  const totalPages = useMemo(() => {
    return tableParams.pageSize > 0 ? Math.ceil(totalItems / tableParams.pageSize) : 1
  }, [totalItems, tableParams.pageSize])

  // 4) Fetch distinct Pricetype & Particulier on mount
  useEffect(() => {
    const fetchPricetypeOptions = async () => {
      try {
        const res = await fetch('http://92.108.241.160:8000/listings/api/options/pricetypes/')
        if (!res.ok) throw new Error('Error fetching pricetype options')
        const data = await res.json()
        // data.options => ["FAST_BID","FIXED","MIN_BID", etc...]
        // we'll store them as {label, value} for now
        const mapped = data.options.map((val) => ({ label: val, value: val }))
        setPricetypeOptions(mapped)
      } catch (err) {
        console.error('Error fetching pricetype options:', err)
      }
    }

    const fetchParticulierOptions = async () => {
      try {
        const res = await fetch('http://92.108.241.160:8000/listings/api/options/particuliers/')
        if (!res.ok) throw new Error('Error fetching particulier options')
        const data = await res.json()
        // data.options => ["true","false"]
        const mapped = data.options.map((val) => ({ label: val, value: val }))
        setParticulierOptions(mapped)
      } catch (err) {
        console.error('Error fetching particulier options:', err)
      }
    }

    fetchPricetypeOptions()
    fetchParticulierOptions()
  }, [])

  // 5) Define columns
  // For multi-select columns, we rely on "selected: true" or false in each option
  // so the user sees them pre-selected.
  // We'll build that dynamic "options" array inside the `filter` function.
  const columns = [
    {
      key: 'title',
      label: 'Titel',
      sorter: true,
      filter: true,
    },
    {
      key: 'pricetype',
      label: 'Pricetype',
      sorter: true,
      filter: (columnValues, onFilterChange, filterValue) => {
        // figure out the actual filter string
        const actualValue =
          filterValue !== undefined ? filterValue : tableParams.columnFilters.pricetype || ''

        console.log('>>> [pricetype FILTER RENDER] Debug:', {
          columnValues,
          filterValue,
          actualValue,
          pricetypeOptions,
        })

        // convert CSV => array e.g. "FAST_BID,MIN_BID" => ['FAST_BID','MIN_BID']
        const selectedArray = actualValue ? actualValue.split(',') : []

        // now build new array that sets selected=true if .value is in selectedArray
        const newOptions = pricetypeOptions.map((opt) => {
          const isSelected = selectedArray.includes(opt.value)
          return { ...opt, selected: isSelected }
        })

        return (
          <CMultiSelect
            allowCreateOptions
            options={newOptions}
            placeholder="Kies Pricetype(s)"
            onChange={(selected) => {
              // 'selected' is an array of objects with { value, label, selected? }
              const joined = selected.map((s) => s.value).join(',')
              console.log('>>> [pricetype onChange], new filter =', joined)
              onFilterChange(joined)
            }}
          />
        )
      },
    },
    {
      key: 'price',
      label: 'Prijs',
      sorter: true,
      filter: true,
    },
    {
      key: 'chat_minimale_waarde',
      label: 'Min. Prijs',
      sorter: true,
      filter: true,
    },
    {
      key: 'particulier',
      label: 'Particulier',
      sorter: true,
      filter: (columnValues, onFilterChange, filterValue) => {
        const actualValue =
          filterValue !== undefined ? filterValue : tableParams.columnFilters.particulier || ''

        console.log('>>> [particulier FILTER RENDER] Debug:', {
          columnValues,
          filterValue,
          actualValue,
          particulierOptions,
        })

        const selectedArray = actualValue ? actualValue.split(',') : []

        // Mark each option "selected: true" if it's in our CSV
        const newOptions = particulierOptions.map((opt) => ({
          ...opt,
          selected: selectedArray.includes(opt.value),
        }))

        return (
          <CMultiSelect
            allowCreateOptions
            options={newOptions}
            placeholder="Kies Particulier..."
            onChange={(selected) => {
              const joined = selected.map((s) => s.value).join(',')
              console.log('>>> [particulier onChange], new filter =', joined)
              onFilterChange(joined)
            }}
          />
        )
      },
    },
    {
      key: 'published_date',
      label: 'Publicatiedatum',
      sorter: true,
      filter: true,
    },
  ]

  // 6) Table event handlers
  const handlePageChange = (newPage) => {
    console.log('>>> [handlePageChange] newPage=', newPage)
    setTableParams((prev) => ({ ...prev, page: newPage }))
  }

  const handleItemsPerPageChange = (newSize) => {
    console.log('>>> [handleItemsPerPageChange] newSize=', newSize)
    setTableParams((prev) => ({
      ...prev,
      page: 1,
      pageSize: newSize,
    }))
  }

  const handleColumnFilterChange = (filters) => {
    console.log('>>> [handleColumnFilterChange] filters=', filters)
    setTableParams((prev) => ({
      ...prev,
      page: 1,
      columnFilters: filters,
    }))
  }

  const handleTableFilterChange = (globalSearchStr) => {
    console.log('>>> [handleTableFilterChange] globalSearchStr=', globalSearchStr)
    setTableParams((prev) => ({
      ...prev,
      page: 1,
      globalFilter: globalSearchStr,
    }))
  }

  const handleSorterChange = (sorterObj) => {
    console.log('>>> [handleSorterChange] sorterObj=', sorterObj)
    setTableParams((prev) => ({
      ...prev,
      page: 1,
      sorter: sorterObj ?? { column: '', state: '' },
    }))
  }

  const handleRowClick = (item) => {
    console.log('>>> [handleRowClick] item=', item)
    if (item?.id) {
      navigate(`/vacancies/${item.id}`)
    }
  }

  // 7) Fetch data from server whenever tableParams changes
  useEffect(() => {
    const fetchData = async () => {
      console.log('>>> [FETCH] started, tableParams=', tableParams)
      setLoading(true)
      try {
        const {
          page,
          pageSize,
          columnFilters,
          globalFilter,
          sorter: { column: sortColumn, state: sortOrder },
        } = tableParams

        const params = new URLSearchParams()
        params.append('page', page)
        params.append('page_size', pageSize)

        if (globalFilter) {
          params.append('global_filter', globalFilter)
        }

        Object.entries(columnFilters).forEach(([colName, val]) => {
          if (!val) return
          switch (colName) {
            case 'title':
              params.append('title_like', val)
              break
            case 'pricetype':
              params.append('col_pricetype', val)
              break
            case 'price':
              params.append('col_price', val)
              break
            case 'chat_minimale_waarde':
              params.append('col_chat_minimale_waarde', val)
              break
            case 'particulier':
              params.append('col_particulier', val)
              break
            case 'published_date':
              params.append('col_published_date', val)
              break
            default:
              break
          }
        })

        if (sortColumn && sortOrder) {
          params.append('sort_by', sortColumn)
          params.append('sort_order', sortOrder)
        }

        const url = `http://92.108.241.160:8000/listings/api/vacancies/?${params.toString()}`
        console.log('>>> [FETCH] final GET url =', url)

        const response = await fetch(url)
        if (!response.ok) throw new Error(`Error: ${response.status}`)

        const result = await response.json()
        console.log('>>> [FETCH] success, result.data.length =', result.data?.length || 0)
        setVacancies(result.data || [])
        setTotalItems(result.total || 0)
      } catch (err) {
        console.error('>>> [FETCH] error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tableParams])

  // 8) Render
  return (
    <CContainer className="my-4">
      <CSmartTable
        items={vacancies}
        columns={columns}
        sorterValue={{
          column: tableParams.sorter.column,
          state: tableParams.sorter.state,
        }}
        columnFilter={{ external: true }}
        columnFilterValue={tableParams.columnFilters}
        tableFilter={{ external: true }}
        columnSorter={{ external: true }}
        pagination={{ external: true }}
        itemsPerPageSelect
        loading={loading}
        paginationProps={{
          activePage: tableParams.page,
          pages: totalPages,
        }}
        itemsPerPage={tableParams.pageSize}
        onActivePageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onColumnFilterChange={handleColumnFilterChange}
        onTableFilterChange={handleTableFilterChange}
        onSorterChange={handleSorterChange}
        onRowClick={handleRowClick}
        clickableRows
        scopedColumns={{
          // For a long title, show truncated text
          title: (item) => {
            const maxLength = 60
            const truncated =
              item.title?.length > maxLength
                ? item.title.substring(0, maxLength) + '...'
                : item.title
            return <td title={item.title}>{truncated}</td>
          },
          particulier: (item) => {
            return <td>{item.particulier ? 'Ja' : 'Nee'}</td>
          },
        }}
        tableProps={{
          responsive: true,
          striped: true,
          hover: true,
        }}
        tableBodyProps={{
          className: 'align-middle',
        }}
      />
    </CContainer>
  )
}

export default VacanciesListing
