import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'

const setScrollY = (value) => {
  Object.defineProperty(window, 'scrollY', {
    value,
    configurable: true,
    writable: true,
  })
}

describe('Header — mobile menu', () => {
  it('is closed initially (no mobile nav rendered)', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.mobile-nav')).not.toBeInTheDocument()
  })

  it('opens when the toggle is clicked and shows the four nav links', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await user.click(container.querySelector('.mobile-toggle'))

    const mobileNav = container.querySelector('.mobile-nav')
    expect(mobileNav).toBeInTheDocument()
    const links = mobileNav.querySelectorAll('a')
    expect(links).toHaveLength(4)
    expect([...links].map((a) => a.textContent)).toEqual([
      'Work',
      'Services',
      'Reviews',
      'About',
    ])
  })

  it('swaps the toggle icon between Menu and X', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    const toggle = container.querySelector('.mobile-toggle')

    // Closed: hamburger icon
    expect(toggle.querySelector('.lucide-menu')).toBeInTheDocument()

    await user.click(toggle)
    // Open: close (X) icon
    expect(toggle.querySelector('.lucide-x')).toBeInTheDocument()
  })

  it('closes again when a mobile nav link is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await user.click(container.querySelector('.mobile-toggle'))
    const firstLink = container.querySelector('.mobile-nav a')
    await user.click(firstLink)

    expect(container.querySelector('.mobile-nav')).not.toBeInTheDocument()
  })
})

describe('Header — scroll state', () => {
  beforeEach(() => setScrollY(0))

  it('has no "scrolled" class at the top of the page', () => {
    const { container } = render(<App />)
    expect(container.querySelector('header')).not.toHaveClass('scrolled')
  })

  it('adds the "scrolled" class once past the 20px threshold', () => {
    const { container } = render(<App />)
    const header = container.querySelector('header')

    setScrollY(100)
    fireEvent.scroll(window)
    expect(header).toHaveClass('scrolled')
  })

  it('does not add "scrolled" at exactly the threshold (20px)', () => {
    const { container } = render(<App />)
    const header = container.querySelector('header')

    setScrollY(20)
    fireEvent.scroll(window)
    expect(header).not.toHaveClass('scrolled')
  })
})
