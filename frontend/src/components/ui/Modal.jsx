import { Fragment, useRef } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
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
            <DialogPanel className={`w-full ${maxWidth} bg-white shadow-xl rounded-t-2xl sm:rounded-xl max-h-[95vh] sm:max-h-[85vh] flex flex-col`}>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
                <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                <button
                  ref={cancelRef}
                  onClick={onClose}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              {/* Body */}
              <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">{children}</div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

