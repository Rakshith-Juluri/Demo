import React from 'react'
import Header from './Header'
import { Outlet } from 'react-router-dom'

export default function MainLayout() {
  // This layout shows the Header on all pages and renders the active route below via Outlet.
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
