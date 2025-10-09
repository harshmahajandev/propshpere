// Simple mock implementations for missing UI components
import React from 'react'

// Select Components
export function Select({ children, value, onValueChange }: any) {
  return (
    <div className="relative">
      {children}
    </div>
  )
}

export function SelectTrigger({ children, className }: any) {
  return (
    <button className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-diyar-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
      {children}
    </button>
  )
}

export function SelectValue({ placeholder }: any) {
  return <span className="text-gray-500">{placeholder}</span>
}

export function SelectContent({ children }: any) {
  return (
    <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-950 shadow-md">
      {children}
    </div>
  )
}

export function SelectItem({ children, value }: any) {
  return (
    <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 hover:bg-gray-100">
      {children}
    </div>
  )
}

// Dialog Components
export function Dialog({ children, open, onOpenChange }: any) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  )
}

export function DialogTrigger({ children }: any) {
  return children
}

export function DialogContent({ children, className }: any) {
  return (
    <div className={`relative z-50 w-full max-w-lg bg-white p-6 shadow-lg rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export function DialogHeader({ children }: any) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }: any) {
  return <h2 className="text-lg font-semibold">{children}</h2>
}

export function DialogDescription({ children }: any) {
  return <p className="text-sm text-gray-600">{children}</p>
}

// Calendar Component
export function Calendar({ mode, selected, onSelect, className, numberOfMonths }: any) {
  return (
    <div className={`p-3 ${className}`}>
      <div className="text-center text-sm text-gray-600 p-4">
        Calendar component (simplified)
      </div>
    </div>
  )
}

// Popover Components
export function Popover({ children }: any) {
  return <div className="relative">{children}</div>
}

export function PopoverTrigger({ children }: any) {
  return children
}

export function PopoverContent({ children, className }: any) {
  return (
    <div className={`absolute z-50 w-72 rounded-md border bg-white p-4 text-gray-950 shadow-md outline-none ${className}`}>
      {children}
    </div>
  )
}

// Textarea Component
export function Textarea({ className, ...props }: any) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diyar-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

// Tabs Components
export function Tabs({ children, value, onValueChange, defaultValue }: any) {
  return <div className="w-full">{children}</div>
}

export function TabsList({ children, className }: any) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
      {children}
    </div>
  )
}

export function TabsTrigger({ children, value, className }: any) {
  return (
    <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm ${className}`}>
      {children}
    </button>
  )
}

export function TabsContent({ children, value, className }: any) {
  return (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  )
}