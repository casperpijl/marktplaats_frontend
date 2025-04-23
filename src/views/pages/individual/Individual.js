import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CCarousel,
  CCarouselItem,
  CCarouselCaption,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
} from '@coreui/react-pro'

function VacancyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Vacancy state
  const [vacancy, setVacancy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Similar vacancies state
  const [similarVacancies, setSimilarVacancies] = useState([])
  const [similarMessage, setSimilarMessage] = useState(null)
  const [similarLoading, setSimilarLoading] = useState(false)
  const [similarError, setSimilarError] = useState(null)

  // Fetch the main vacancy
  useEffect(() => {
    async function fetchVacancy() {
      try {
        const response = await fetch(`http://92.108.241.160:8000/listings/api/vacancies/${id}/`)
        if (!response.ok) {
          throw new Error(`Fout bij het ophalen van vacaturedetails. Status: ${response.status}`)
        }
        const data = await response.json()
        setVacancy(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchVacancy()
  }, [id])

  // Once the main vacancy is loaded, fetch similar vacancies
  useEffect(() => {
    async function fetchSimilarVacancies() {
      if (!vacancy) return
      setSimilarLoading(true)
      setSimilarError(null)
      try {
        const response = await fetch(
          `http://92.108.241.160:8000/listings/api/vacancies/${vacancy.id}/similar/`,
        )
        if (!response.ok) {
          throw new Error(
            `Fout bij het ophalen van vergelijkbare advertenties. Status: ${response.status}`,
          )
        }
        const data = await response.json()
        setSimilarVacancies(data.similar || [])
        setSimilarMessage(data.message || null)
      } catch (err) {
        setSimilarError(err.message)
      } finally {
        setSimilarLoading(false)
      }
    }
    fetchSimilarVacancies()
  }, [vacancy])

  // Handle loading/error for the main vacancy
  if (loading) {
    return (
      <div className="text-center my-4">
        <CSpinner color="primary" />
        <p>Vacaturedetails laden...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center my-4">
        <CAlert color="danger">Kan vacaturedetails niet laden: {error}</CAlert>
      </div>
    )
  }

  // Destructure fields from the main vacancy
  const {
    url,
    title,
    pricetype,
    price,
    cityname,
    condition,
    brand,
    maximumdistance,
    frameheight,
    description,
    published_date,
    chat_realistische_waarde,
    chat_minimale_waarde,
    chat_brand,
    chat_model,
    chat_samenvatting,
    particulier,
    images,
    biddings,
    uitleg_waardes, // <-- NEW FIELD
  } = vacancy

  // Show price only if "fixed" or "min_bid"
  const shouldShowPrice =
    (pricetype && pricetype.toLowerCase() === 'fixed') ||
    (pricetype && pricetype.toLowerCase() === 'min_bid')

  return (
    <div className="container my-4">
      <CRow>
        {/* LEFT COLUMN */}
        <CCol md={8}>
          {/* Card with main vacancy details */}
          <CCard className="mb-3">
            <CCardHeader>
              <strong>{title}</strong>
            </CCardHeader>
            <CCardBody>
              <p>
                <strong>Prijstype:</strong> {pricetype || 'Niet beschikbaar'}
              </p>
              {shouldShowPrice && (
                <p>
                  <strong>Prijs:</strong> {price ? `€${price}` : 'Niet opgegeven'}
                </p>
              )}
              <p>
                <strong>Beschrijving:</strong>
                <br />
                {description}
              </p>

              {/* Accordion: Toon alle details */}
              <CAccordion className="mt-3">
                <CAccordionItem itemKey={1}>
                  <CAccordionHeader>Toon alle details</CAccordionHeader>
                  <CAccordionBody>
                    <p>
                      <strong>Stad:</strong> {cityname}
                    </p>
                    <p>
                      <strong>Conditie:</strong> {condition || 'Niet verstrekt'}
                    </p>
                    <p>
                      <strong>Merk:</strong> {brand}
                    </p>
                    <p>
                      <strong>Maximale afstand:</strong> {maximumdistance}
                    </p>
                    <p>
                      <strong>Framemaat:</strong> {frameheight}
                    </p>
                    <p>
                      <strong>Publicatiedatum:</strong> {published_date || 'Onbekend'}
                    </p>
                    <p>
                      <strong>Particulier?:</strong> {particulier ? 'Ja' : 'Nee'}
                    </p>
                  </CAccordionBody>
                </CAccordionItem>
              </CAccordion>
            </CCardBody>
          </CCard>

          {/* Accordion: AI-inzichten */}
          <CAccordion alwaysOpen className="mb-3">
            <CAccordionItem itemKey={1}>
              <CAccordionHeader>AI-inzichten</CAccordionHeader>
              <CAccordionBody>
                <p>
                  <strong>AI realistische waarde:</strong>{' '}
                  {chat_realistische_waarde ? `€${chat_realistische_waarde}` : 'Niet beschikbaar'}
                </p>
                <p>
                  <strong>AI minimale waarde:</strong>{' '}
                  {chat_minimale_waarde ? `€${chat_minimale_waarde}` : 'Niet beschikbaar'}
                </p>
                <p>
                  <strong>AI merk:</strong> {chat_brand || 'Niet beschikbaar'}
                </p>
                <p>
                  <strong>AI model:</strong> {chat_model || 'Niet beschikbaar'}
                </p>
                <p>
                  <strong>AI samenvatting:</strong>
                  <br />
                  {chat_samenvatting || 'Geen samenvatting beschikbaar'}
                </p>
                {/* NEW: Show uitleg_waardes */}
                <p>
                  <strong>AI uitleg waardes:</strong>
                  <br />
                  {uitleg_waardes || 'Geen uitleg waardes beschikbaar'}
                </p>
              </CAccordionBody>
            </CAccordionItem>
          </CAccordion>

          {/* ONE main accordion item for "Vergelijkbare advertenties" */}
          <CAccordion>
            <CAccordionItem itemKey="similarAll">
              <CAccordionHeader>Vergelijkbare advertenties</CAccordionHeader>
              <CAccordionBody>
                {similarLoading && (
                  <div className="text-center my-2">
                    <CSpinner size="sm" /> Bezig met laden...
                  </div>
                )}

                {similarError && (
                  <CAlert color="danger" className="mt-2">
                    Kan vergelijkbare advertenties niet laden: {similarError}
                  </CAlert>
                )}

                {/* Custom message when provided */}
                {!similarLoading && !similarError && similarMessage && (
                  <p>
                    <em>{similarMessage}</em>
                  </p>
                )}

                {/* If no similar items */}
                {!similarLoading && !similarError && similarVacancies.length === 0 && (
                  <p>
                    <em>Geen vergelijkbare advertenties gevonden.</em>
                  </p>
                )}

                {/* If we have similar items, display them in a list */}
                {!similarLoading && !similarError && similarVacancies.length > 0 && (
                  <ul className="list-group">
                    {similarVacancies.map((sim) => (
                      <li
                        key={sim.id}
                        className="list-group-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/vacancies/${sim.id}`)}
                      >
                        <strong>{sim.title}</strong> – €{sim.price || 0} – {sim.cityname}
                        {sim.chat_brand && sim.chat_model && (
                          <small>
                            {' '}
                            ({sim.chat_brand} / {sim.chat_model})
                          </small>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CAccordionBody>
            </CAccordionItem>
          </CAccordion>

          {/* Marktplaats button */}
          {url && (
            <div className="my-3">
              <CButton
                color="primary"
                className="w-100 text-white"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Bekijk op Marktplaats
              </CButton>
            </div>
          )}
        </CCol>

        {/* RIGHT COLUMN: Images + Biddings */}
        <CCol md={4}>
          {/* Images Carousel */}
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Afbeeldingen</strong>
            </CCardHeader>
            <CCardBody>
              {images && images.length > 0 ? (
                <CCarousel controls indicators>
                  {images.map((img, idx) => (
                    <CCarouselItem key={img.id || idx}>
                      <img
                        className="d-block w-100"
                        src={img.image_url}
                        alt={`Vacatureafbeelding ${idx + 1}`}
                      />
                      <CCarouselCaption className="d-none d-md-block">
                        <h5>{title}</h5>
                      </CCarouselCaption>
                    </CCarouselItem>
                  ))}
                </CCarousel>
              ) : (
                <p>
                  <em>Geen afbeeldingen beschikbaar.</em>
                </p>
              )}
            </CCardBody>
          </CCard>

          {/* Biddings Table */}
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Biedingen</strong>
            </CCardHeader>
            <CCardBody className="p-0">
              {biddings && biddings.length > 0 ? (
                <CTable hover responsive>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Bieder</CTableHeaderCell>
                      <CTableHeaderCell>Bedrag</CTableHeaderCell>
                      <CTableHeaderCell>Datum</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {biddings.map((bid) => (
                      <CTableRow key={bid.id}>
                        <CTableDataCell>{bid.bidder_name || 'Anoniem'}</CTableDataCell>
                        <CTableDataCell>€{bid.amount}</CTableDataCell>
                        <CTableDataCell>{bid.bidding_date || 'Onbekend'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <div className="p-3">
                  <em>Geen biedingen beschikbaar.</em>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default VacancyDetailPage
