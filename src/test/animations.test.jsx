import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App.jsx'

describe('Canvas animations', () => {
  it('renders a canvas for the background and each service animation', () => {
    const { container } = render(<App />)
    // GlobalBackground + WebDev + Targeting + Brand = 4 canvases.
    expect(container.querySelectorAll('canvas')).toHaveLength(4)
  })

  it('acquires a 2D drawing context for the canvases', () => {
    render(<App />)
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d')
  })

  it('starts an animation loop via requestAnimationFrame', () => {
    render(<App />)
    expect(requestAnimationFrame).toHaveBeenCalled()
  })

  it('cancels its animation frames on unmount (no leaked loops)', () => {
    const { unmount } = render(<App />)
    expect(cancelAnimationFrame).not.toHaveBeenCalled()
    unmount()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it('removes its resize listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<App />)
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeSpy.mockRestore()
  })
})
