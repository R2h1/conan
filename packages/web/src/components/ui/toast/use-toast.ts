import type { Component, VNode } from "vue"
import { computed, ref } from "vue"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

export type StringOrVNode
  = | string
    | VNode
    | (() => VNode)

export interface ToastProps {
  class?: string
  variant?: 'default' | 'destructive'
  onOpenChange?: (value: boolean) => void
}

export interface ToasterToast extends ToastProps {
  id: string
  title?: string
  description?: StringOrVNode
  action?: Component
  open?: boolean
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: string }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: actionTypes.REMOVE_TOAST, toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

const state = ref<State>({ toasts: [] })

function dispatch(action: Action) {
  switch (action.type) {
    case actionTypes.ADD_TOAST: {
      const newToasts: ToasterToast[] = [action.toast, ...state.value.toasts]
      state.value.toasts = newToasts.slice(0, TOAST_LIMIT)
      break
    }

    case actionTypes.UPDATE_TOAST: {
      const updatedToasts: ToasterToast[] = []
      for (const t of state.value.toasts) {
        if (t.id === action.toast.id) {
          updatedToasts.push({ ...t, ...action.toast })
        } else {
          updatedToasts.push(t)
        }
      }
      state.value.toasts = updatedToasts
      break
    }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        for (const toast of state.value.toasts) {
          addToRemoveQueue(toast.id)
        }
      }

      const dismissedToasts: ToasterToast[] = []
      for (const t of state.value.toasts) {
        if (t.id === toastId || toastId === undefined) {
          dismissedToasts.push({ ...t, open: false })
        } else {
          dismissedToasts.push(t)
        }
      }
      state.value.toasts = dismissedToasts
      break
    }

    case actionTypes.REMOVE_TOAST: {
      if (action.toastId === undefined) {
        state.value.toasts = []
      } else {
        const filteredToasts: ToasterToast[] = []
        for (const t of state.value.toasts) {
          if (t.id !== action.toastId) {
            filteredToasts.push(t)
          }
        }
        state.value.toasts = filteredToasts
      }
      break
    }
  }
}

export function useToast() {
  return {
    toasts: computed(() => state.value.toasts),
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

export type Toast = Omit<ToasterToast, "id">

export function toast(props: Toast) {
  const id = genId()

  const update = (props: ToasterToast) => {
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...props, id } })
  }

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
      },
    },
  })

  return { id, dismiss, update }
}
