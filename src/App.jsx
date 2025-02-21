import React, { useState, useEffect } from 'react'
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom'
import Campaign from './Campaign'
import Price from './Price'
import Stock from './Stock'
import FileMerger from './file-merger'

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <><NavBar /> <h1>Home Page</h1>  </>,
    },
    {
      path: '/campaign',
      element: <><NavBar /><Campaign /></>,
    },
    {
      path: '/price',
      element: <><NavBar /><Price /></>,
    },
    {
      path: '/stock',
      element: <><NavBar /><Stock /></>,
    },
    {
      path: '/file-merger',
      element: <><NavBar /><FileMerger /></>,
    },
  ], {
    basename: '/daraz-tools',
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    }
  },)

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

function NavBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#f4f4f4', padding: '10px', borderBottom: '1px solid #ccc', }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
        Home
      </Link>
      <Link to="/campaign" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
        Campaign
      </Link>
      <Link to="/price" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
        Price
      </Link>
      <Link to="/stock" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
        Stock
      </Link>
      <Link to="/file-merger" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
        File merger
      </Link>
    </div>
  )
}

export default App
