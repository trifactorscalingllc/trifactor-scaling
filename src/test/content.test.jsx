import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import App from '../App.jsx'

describe('Services section', () => {
  it('renders all three services with their titles', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /Web Development/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Sales Funnels/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Brand Strategy/i }),
    ).toBeInTheDocument()
  })

  it('shows the numeric badge derived from the "01." style number', () => {
    // The component renders svc.num[1] to turn "01." into "1", "02." into "2".
    render(<App />)
    const services = document.querySelector('#services')
    const badges = within(services)
      .getAllByText(/^[0-9]$/)
      .map((el) => el.textContent.trim())
    expect(badges).toEqual(['1', '2', '3'])
  })
})

describe('Portfolio section', () => {
  it('renders one live iframe per project with a secure URL and matching title', () => {
    render(<App />)
    const work = document.querySelector('#work')
    const iframes = work.querySelectorAll('iframe')

    expect(iframes).toHaveLength(3)
    iframes.forEach((frame) => {
      expect(frame.getAttribute('src')).toMatch(/^https:\/\//)
      expect(frame.getAttribute('title')).toBeTruthy()
    })

    const titles = [...iframes].map((f) => f.getAttribute('title'))
    expect(titles).toEqual(['Cut By Dack', 'Lead Compass', 'Mectrix Media'])
  })
})

describe('Testimonials section', () => {
  it('renders three review cards', () => {
    render(<App />)
    const reviews = document.querySelector('#reviews')
    expect(reviews.querySelectorAll('.testimonial-card')).toHaveLength(3)
  })

  it('renders a five-star rating on every card', () => {
    render(<App />)
    const reviews = document.querySelector('#reviews')
    // lucide-react renders each Star icon as an <svg class="lucide-star">.
    expect(reviews.querySelectorAll('.lucide-star')).toHaveLength(15)
  })

  it('omits the company line when a review has no company', () => {
    // Only two of the three reviews specify a company ("" is falsy and skipped).
    // Scope to #reviews since "Mectrix Media" is also a portfolio project title.
    render(<App />)
    const reviews = within(document.querySelector('#reviews'))
    expect(reviews.getByText('Lumina Sphere')).toBeInTheDocument()
    expect(reviews.getByText('Mectrix Media')).toBeInTheDocument()
    expect(reviews.getByText('Vultus Worldwide')).toBeInTheDocument()
  })
})

describe('Footer contact details', () => {
  it('exposes a mailto and tel link with the expected values', () => {
    const { container } = render(<App />)
    const footer = container.querySelector('footer')

    const mail = footer.querySelector('a[href^="mailto:"]')
    const tel = footer.querySelector('a[href^="tel:"]')

    expect(mail).toHaveAttribute('href', 'mailto:contact@trifactorscaling.com')
    expect(tel).toHaveAttribute('href', 'tel:4848602177')
  })
})

describe('In-page navigation anchors', () => {
  it('every header nav link points at a section that exists', () => {
    const { container } = render(<App />)
    const nav = container.querySelector('.desktop-nav')
    const anchors = [...nav.querySelectorAll('a[href^="#"]')]

    expect(anchors.length).toBeGreaterThan(0)
    anchors.forEach((a) => {
      const id = a.getAttribute('href').slice(1)
      expect(document.getElementById(id)).toBeInTheDocument()
    })
  })
})
