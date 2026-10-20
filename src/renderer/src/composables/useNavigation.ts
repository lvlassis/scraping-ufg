import { ref, computed } from 'vue'
import type { Materia } from '../types/api'

export type NavigationEntry =
  | { view: 'dashboard' }
  | { view: 'materia'; materia: Materia }

// Module-level singleton so back/forward work across components
const stack = ref<NavigationEntry[]>([{ view: 'dashboard' }])
const cursor = ref(0)

export function useNavigation() {
  const current = computed(() => stack.value[cursor.value])
  const canGoBack = computed(() => cursor.value > 0)
  const canGoForward = computed(() => cursor.value < stack.value.length - 1)

  function navigate(entry: NavigationEntry): void {
    stack.value = stack.value.slice(0, cursor.value + 1)
    stack.value.push(entry)
    cursor.value = stack.value.length - 1
  }

  function back(): void {
    if (canGoBack.value) cursor.value--
  }

  function forward(): void {
    if (canGoForward.value) cursor.value++
  }

  function reset(): void {
    stack.value = [{ view: 'dashboard' }]
    cursor.value = 0
  }

  return { current, canGoBack, canGoForward, navigate, back, forward, reset }
}
