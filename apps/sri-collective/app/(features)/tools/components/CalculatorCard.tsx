'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CalculatorCardProps {
  title: string
  onClose: () => void
  children: ReactNode
  accentColor?: string
}

export function CalculatorCard({
  title,
  onClose,
  children,
  accentColor = 'from-blue-500 to-blue-600'
}: CalculatorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#0a1628] via-[#1a2d4d] to-[#0a1628] text-white px-6 py-5">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Back to calculators"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        {children}
      </div>
    </motion.div>
  )
}

interface InputFieldProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: 'text' | 'number'
  prefix?: string
  suffix?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  helpText?: string
}

export function InputField({
  label,
  value,
  onChange,
  type = 'number',
  prefix,
  suffix,
  placeholder,
  min,
  max,
  step,
  helpText,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative group">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`
            w-full rounded-xl border-2 border-slate-200 bg-slate-50/50
            px-4 py-3 text-slate-900 font-medium
            focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10
            outline-none transition-all duration-200
            placeholder:text-slate-400 placeholder:font-normal
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-14' : ''}
          `}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            {suffix}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  helpText?: string
}

export function SelectField({ label, value, onChange, options, helpText }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-xl border-2 border-slate-200 bg-slate-50/50
          px-4 py-3 text-slate-900 font-medium
          focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10
          outline-none transition-all duration-200
          cursor-pointer appearance-none
          bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
          bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem]
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && (
        <p className="text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  )
}

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

export function CheckboxField({ label, checked, onChange, description }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`
          w-5 h-5 rounded-md border-2 transition-all duration-200
          ${checked
            ? 'bg-primary border-primary'
            : 'bg-white border-slate-300 group-hover:border-slate-400'
          }
        `}>
          {checked && (
            <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-slate-900 group-hover:text-slate-700 transition-colors">
          {label}
        </span>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  )
}

interface ResultRowProps {
  label: string
  value: string
  highlight?: boolean
  subtext?: string
  variant?: 'default' | 'light'
}

export function ResultRow({ label, value, highlight, subtext, variant = 'default' }: ResultRowProps) {
  const isLight = variant === 'light'

  return (
    <div className={`
      flex justify-between items-start py-3
      ${highlight ? 'border-t-2 border-slate-100 pt-4 mt-2' : ''}
    `}>
      <div className="flex-1">
        <span className={`
          text-sm
          ${highlight
            ? (isLight ? 'font-semibold text-white' : 'font-semibold text-slate-900')
            : (isLight ? 'text-white/80' : 'text-slate-600')
          }
        `}>
          {label}
        </span>
        {subtext && (
          <p className={`text-xs mt-0.5 ${isLight ? 'text-white/50' : 'text-slate-400'}`}>
            {subtext}
          </p>
        )}
      </div>
      <span className={`
        font-semibold text-right
        ${highlight
          ? (isLight ? 'text-xl text-white' : 'text-xl text-primary')
          : (isLight ? 'text-white' : 'text-slate-900')
        }
      `}>
        {value}
      </span>
    </div>
  )
}

interface ResultCardProps {
  title: string
  children: ReactNode
  variant?: 'default' | 'highlight' | 'success' | 'warning'
  icon?: ReactNode
}

export function ResultCard({ title, children, variant = 'default', icon }: ResultCardProps) {
  const variants = {
    default: 'bg-slate-50 border-slate-100',
    highlight: 'bg-gradient-to-br from-[#0a1628] via-[#1a2d4d] to-[#0a1628] text-white border-transparent',
    success: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100',
    warning: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100',
  }

  const titleColors = {
    default: 'text-slate-500',
    highlight: 'text-primary-light',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border-2 p-5 ${variants[variant]}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${titleColors[variant]}`}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  )
}

interface InfoBoxProps {
  children: ReactNode
  variant?: 'info' | 'tip' | 'warning'
}

export function InfoBox({ children, variant = 'info' }: InfoBoxProps) {
  const variants = {
    info: {
      bg: 'bg-blue-50 border-blue-100',
      icon: 'text-blue-500',
      text: 'text-blue-800',
    },
    tip: {
      bg: 'bg-emerald-50 border-emerald-100',
      icon: 'text-emerald-500',
      text: 'text-emerald-800',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-100',
      icon: 'text-amber-500',
      text: 'text-amber-800',
    },
  }

  const icons = {
    info: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    tip: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  }

  const style = variants[variant]

  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${style.bg}`}>
      <span className={style.icon}>{icons[variant]}</span>
      <div className={`text-sm leading-relaxed ${style.text}`}>{children}</div>
    </div>
  )
}

interface ProgressBarProps {
  label: string
  value: number
  max: number
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

export function ProgressBar({
  label,
  value,
  max,
  showPercentage = true,
  color = 'primary'
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const colors = {
    primary: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        {showPercentage && (
          <span className="font-semibold text-slate-900">{value.toFixed(1)}%</span>
        )}
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${colors[color]}`}
        />
      </div>
      <p className="text-xs text-slate-500">Max {max}%</p>
    </div>
  )
}
