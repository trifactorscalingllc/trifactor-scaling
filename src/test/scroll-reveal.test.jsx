import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App.jsx'

describe('useScrollReveal', () => {
  it('creates an IntersectionObserver and observes the fade-up elements', () => {
    const { container } = render(<App />)
    const observer = IntersectionObserver.instances.at(-1)

    expect(observer).toBeDefined()
    const fadeUps = container.querySelectorAll('.animate-fade-up')
    expect(fadeUps.length).toBeGreaterThan(0)
    expect(observer.elements.size).toBe(fadeUps.length)
  })

  it('adds the "is-visible" class to elements that scroll into view', () => {
    const { container } = render(<App />)
    const observer = IntersectionObserver.instances.at(-1)
    const target = container.querySelector('.animate-fade-up')

    expect(target).not.toHaveClass('is-visible')
    observer.trigger([{ isIntersecting: true, target }])
    expect(target).toHaveClass('is-visible')
  })

  it('does not reveal elements that are not yet intersecting', () => {
    const { container } = render(<App />)
    const observer = IntersectionObserver.instances.at(-1)
    const target = container.querySelector('.animate-fade-up')

    observer.trigger([{ isIntersecting: false, target }])
    expect(target).not.toHaveClass('is-visible')
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<App />)
    const observer = IntersectionObserver.instances.at(-1)

    unmount()
    expect(observer.disconnected).toBe(true)
  })
})
