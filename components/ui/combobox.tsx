"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  onCreateNew?: () => void
  createNewText?: string
  disabled?: boolean
  className?: string
}

/**
 * Combobox simple y robusto — sin cmdk.
 * Filtrado en cliente, accesible, con teclado, dark/light listo.
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  emptyText = "No se encontraron resultados.",
  onCreateNew,
  createNewText = "Crear nuevo...",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  // Cuando se abre, focus al input
  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-10 justify-between font-normal bg-background hover:bg-muted/50 border-input",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 border-border bg-popover text-popover-foreground"
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Options list */}
          <div className="max-h-[260px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="py-6 px-3 text-center text-sm text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:outline-none focus:bg-accent focus:text-accent-foreground",
                      isSelected && "bg-accent/50 text-accent-foreground font-medium"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </button>
                )
              })
            )}
          </div>

          {/* Crear nuevo */}
          {onCreateNew && (
            <>
              <div className="h-px bg-border" />
              <button
                type="button"
                onClick={() => {
                  onCreateNew()
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-primary hover:bg-accent transition-colors focus:outline-none focus:bg-accent"
              >
                <Plus className="h-4 w-4" />
                {createNewText}
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
