import { toValue } from '@solidjs-use/shared'
import { useEventListener } from '../useEventListener'
import { defaultWindow } from '../_configurable'
import type { MaybeAccessor } from '@solidjs-use/shared'

export type KeyPredicate = (event: KeyboardEvent) => boolean
export type KeyFilter = true | string | string[] | KeyPredicate
export type KeyStrokeEventName = 'keydown' | 'keypress' | 'keyup'
export interface OnKeyStrokeOptions {
  eventName?: KeyStrokeEventName
  target?: MaybeAccessor<EventTarget | null | undefined>
  passive?: boolean
  /**
   * Set to `true` to ignore repeated events when the key is being held down.
   *
   * @default false
   */
  dedupe?: MaybeAccessor<boolean>
}

function createKeyPredicate(keyFilter: KeyFilter): KeyPredicate {
  if (typeof keyFilter === 'function') return keyFilter
  else if (typeof keyFilter === 'string') return (event: KeyboardEvent) => event.key === keyFilter
  else if (Array.isArray(keyFilter)) return (event: KeyboardEvent) => keyFilter.includes(event.key)

  return () => true
}

export function onKeyStroke(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options?: OnKeyStrokeOptions
): () => void
export function onKeyStroke(handler: (event: KeyboardEvent) => void, options?: OnKeyStrokeOptions): () => void

/**
 * Listen for keyboard keys being stroked.
 */
export function onKeyStroke(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options?: OnKeyStrokeOptions
): () => void
export function onKeyStroke(handler: (event: KeyboardEvent) => void, options?: OnKeyStrokeOptions): () => void
export function onKeyStroke(...args: any[]) {
  let key: KeyFilter
  let handler: (event: KeyboardEvent) => void
  let options: OnKeyStrokeOptions = {}

  if (args.length === 3) {
    key = args[0]
    handler = args[1]
    options = args[2]
  } else if (args.length === 2) {
    if (typeof args[1] === 'object') {
      key = true
      handler = args[0]
      options = args[1]
    } else {
      key = args[0]
      handler = args[1]
    }
  } else {
    key = true
    handler = args[0]
  }

  const { target = defaultWindow, eventName = 'keydown', passive = false, dedupe = false } = options
  const predicate = createKeyPredicate(key)
  const listener = (e: KeyboardEvent) => {
    if (e.repeat && toValue(dedupe)) return

    if (predicate(e)) handler(e)
  }

  return useEventListener(target, eventName, listener, passive)
}

/**
 * Listen to the keydown event of the given key.
 *
 * @see https://solidjs-use.github.io/solidjs-use/core/onKeyDown
 */
export function onKeyDown(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: Omit<OnKeyStrokeOptions, 'eventName'> = {}
) {
  return onKeyStroke(key, handler, { ...options, eventName: 'keydown' })
}

/**
 * Listen to the keypress event of the given key.
 */
export function onKeyPressed(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: Omit<OnKeyStrokeOptions, 'eventName'> = {}
) {
  return onKeyStroke(key, handler, { ...options, eventName: 'keypress' })
}

/**
 * Listen to the keyup event of the given key.
 */
export function onKeyUp(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: Omit<OnKeyStrokeOptions, 'eventName'> = {}
) {
  return onKeyStroke(key, handler, { ...options, eventName: 'keyup' })
}
