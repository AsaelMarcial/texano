import { Fragment, useRef } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  const cancelRef = useRef(null)

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" initialFocus={cancelRef} onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-t-2xl sm:rounded-xl bg-white p-5 sm:p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    {title || '¿Estás seguro?'}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    {message || 'Esta acción no se puede deshacer.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  ref={cancelRef}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                >
                  Eliminar
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

