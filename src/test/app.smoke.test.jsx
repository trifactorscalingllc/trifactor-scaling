import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import App from '../App.jsx'

describe('App (smoke)', () => {
  it('renders the whole page without crashing', () => {
    expect(() => render(<App />)).not.toThrow()
  })

  it('renders every major section heading', () => {
    const { container } = render(<App />)
    // Hero (the phrase also appears in the footer tagline, so scope to .hero)
    const hero = container.querySelector('.hero')
    expect(within(hero).getByText(/Build a Brand/i)).toBeInTheDocument()
    // Services
    expect(
      screen.getByRole('heading', { name: /What We Do/i }),
    ).toBeInTheDocument()
    // Portfolio
    expect(
      screen.getByRole('heading', { name: /Selected Work/i }),
    ).toBeInTheDocument()
    // Testimonials
    expect(
      screen.getByRole('heading', { name: /What They Say/i }),
    ).toBeInTheDocument()
    // About
    expect(screen.getByText(/Who We Are/i)).toBeInTheDocument()
    // CTA
    expect(screen.getByText(/Let's Build Something/i)).toBeInTheDocument()
  })

  it('renders header and footer landmarks', () => {
    const { container } = render(<App />)
    expect(container.querySelector('header')).toBeInTheDocument()
    expect(container.querySelector('footer')).toBeInTheDocument()
    expect(container.querySelector('main')).toBeInTheDocument()
  })
})
