import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees and reset mock call history between tests so they
// stay independent of one another.
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  if (globalThis.IntersectionObserver?.instances) {
    globalThis.IntersectionObserver.instances.length = 0
  }
})

// --- Canvas 2D context ---
// jsdom does not implement the canvas API, so getContext() would return null
// and the animation components would throw. We return a permissive stub whose
// methods are all no-ops and whose properties accept any assignment.
const make2dContextStub = () =>
  new Proxy(
    {},
    {
      get: (target, prop) => {
        if (!(prop in target)) {
          target[prop] = typeof prop === 'string' ? vi.fn() : undefined
        }
        return target[prop]
      },
      set: (target, prop, value) => {
        target[prop] = value
        return true
      },
    },
  )

HTMLCanvasElement.prototype.getContext = vi.fn(() => make2dContextStub())

// --- requestAnimationFrame ---
// Return a handle but do NOT invoke the callback. The animation loops call
// requestAnimationFrame recursively; invoking it synchronously would recurse
// forever. Tests only need to verify that a frame was requested.
vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
vi.stubGlobal('cancelAnimationFrame', vi.fn())

// --- IntersectionObserver ---
// Not implemented in jsdom. Track instances so tests can assert observe/
// disconnect behavior and manually trigger intersections.
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.elements = new Set()
    MockIntersectionObserver.instances.push(this)
  }
  observe(el) {
    this.elements.add(el)
  }
  unobserve(el) {
    this.elements.delete(el)
  }
  disconnect() {
    this.elements.clear()
    this.disconnected = true
  }
  // Test helper: simulate the given elements scrolling into view.
  trigger(entries) {
    this.callback(entries, this)
  }
}
MockIntersectionObserver.instances = []
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
