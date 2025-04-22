import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import {
  CContainer,
  CForm,
  CFormInput,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CInputGroup,
  CInputGroupText,
  useColorModes,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilContrast,
  cilApplicationsSettings,
  cilMenu,
  cilMoon,
  cilSearch,
  cilSun,
  cilLanguage,
  cifGb,
  cifEs,
  cifPl,
} from '@coreui/icons'

import {
  AppHeaderDropdown,
  AppHeaderDropdownMssg,
  AppHeaderDropdownNotif,
  AppHeaderDropdownTasks,
} from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-pro-react-admin-template-theme-modern')
  const { i18n, t } = useTranslation()

  const dispatch = useDispatch()
  const asideShow = useSelector((state) => state.asideShow)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}></CHeader>
}

export default AppHeader
