import React from 'react'
import { Translation } from 'react-i18next'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Listings = React.lazy(() => import('./views/pages/listings/listings'))
const Indivudual = React.lazy(() => import('./views/pages/individual/Individual'))

const routes = [
  { path: '/', exact: true, name: <Translation>{(t) => t('home')}</Translation> },
  {
    path: '/dashboard',
    name: <Translation>{(t) => t('listings')}</Translation>,
    element: Dashboard,
  },
  {
    path: '/listings',
    name: <Translation>{(t) => t('listings')}</Translation>,
    element: Listings,
  },
  {
    path: '/vacancies/:id',
    name: <Translation>{(t) => t('individual')}</Translation>,
    element: Indivudual,
  },
]

export default routes
