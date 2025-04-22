import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CWidgetStatsB,
  CProgress,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react-pro'
import { cilOptions, cilChartLine, cilArrowTop } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

/**
 * Dashboard Page
 * Shows a table of the 10 most popular (chat_brand, chat_model) combos for particuliere vacancies.
 * In the future, you can add additional widgets/cards to this dashboard.
 */
const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [topCombos, setTopCombos] = useState([])

  // Fetch the top-ten combos from your endpoint
  const fetchTopCombos = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:8000/listings/api/combos/top-ten/')
      if (!response.ok) {
        throw new Error(`Error fetching top combos (status ${response.status})`)
      }
      const data = await response.json()
      // Filter out entries where both brand and model are "onbekend" (case insensitive)
      const filteredData = data.filter(
        (combo) =>
          !(
            combo.chat_brand?.toLowerCase() === 'onbekend' &&
            combo.chat_model?.toLowerCase() === 'onbekend'
          ),
      )
      setTopCombos(filteredData)
    } catch (err) {
      setError(err.message || 'Unknown error while fetching top combos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopCombos()
  }, [])

  return (
    <div className="dashboard-container pb-4">
      {/* Stats Widgets Row */}
      <CRow className="mb-4">
        <CCol xs={12} md={4}>
          <CWidgetStatsB
            className="mb-3"
            progress={{ color: 'success', value: 89 }}
            text="Totaal aantal advertenties deze maand"
            title="Actieve Advertenties"
            value="2,349"
          />
        </CCol>
        <CCol xs={12} md={4}>
          <CWidgetStatsB
            className="mb-3"
            progress={{ color: 'info', value: 72 }}
            text="Unieke merken in database"
            title="Verschillende Merken"
            value="156"
          />
        </CCol>
        <CCol xs={12} md={4}>
          <CWidgetStatsB
            className="mb-3"
            progress={{ color: 'warning', value: 95 }}
            text="Gemiddelde views per advertentie"
            title="Gem. Views"
            value="1,147"
          />
        </CCol>
      </CRow>

      {/* Main Content Row */}
      <CRow className="gy-4">
        {/* Top 10 Brands Card */}
        <CCol xs={12} md={6}>
          <CCard className="h-100 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="m-0">
                <CIcon icon={cilChartLine} className="me-2" />
                Populairste Merken/Modellen
                <CBadge color="primary" shape="rounded-pill" className="ms-2">
                  Top 10
                </CBadge>
              </h5>
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false}>
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem>Vernieuwen</CDropdownItem>
                  <CDropdownItem>Exporteren</CDropdownItem>
                  <CDropdownItem>Details</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCardHeader>
            <CCardBody>
              {loading && (
                <div className="d-flex align-items-center justify-content-center p-5">
                  <CSpinner color="primary" className="me-2" />
                  <span>Bezig met laden...</span>
                </div>
              )}
              {error && (
                <CAlert color="danger" className="text-white">
                  <strong>Error:</strong> {error}
                </CAlert>
              )}
              {!loading && !error && topCombos.length === 0 && (
                <div className="text-center p-5">
                  <p className="text-medium-emphasis mb-0">Geen data gevonden.</p>
                </div>
              )}
              {!loading && !error && topCombos.length > 0 && (
                <CTable align="middle" hover responsive className="table-striped">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell className="text-center" width="5%">
                        #
                      </CTableHeaderCell>
                      <CTableHeaderCell>Merk</CTableHeaderCell>
                      <CTableHeaderCell>Model</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Aantal</CTableHeaderCell>
                      <CTableHeaderCell className="text-center" width="20%">
                        Trend
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {topCombos.map((combo, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell className="text-center">
                          <strong>{index + 1}</strong>
                        </CTableDataCell>
                        <CTableDataCell>
                          <strong>{combo.chat_brand}</strong>
                        </CTableDataCell>
                        <CTableDataCell>{combo.chat_model}</CTableDataCell>
                        <CTableDataCell className="text-end">
                          <strong>{combo.count}</strong>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CProgress
                            thin
                            color="success"
                            value={Math.min(100, (combo.count / topCombos[0].count) * 100)}
                          />
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Future Widget Card */}
        <CCol xs={12} md={6}>
          <CCard className="h-100 shadow-sm">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="m-0">
                <CIcon icon={cilArrowTop} className="me-2" />
                Trending Modellen
              </h5>
              <CBadge color="danger">Nieuw</CBadge>
            </CCardHeader>
            <CCardBody>
              <div className="text-center p-5">
                <p className="text-medium-emphasis mb-0">Binnenkort beschikbaar</p>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard
