import type { InputHTMLAttributes, ReactNode } from 'react';
export const button = 'rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50';
export const secondary = 'rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50';
export const control = 'w-full rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900 focus:outline-2 focus:outline-blue-500';
export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="grid gap-1 text-sm font-medium text-slate-700">{label}<input className={control} {...props} /></label>;
}
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="mb-5 text-xl font-bold">{title}</h2>{children}</section>;
}

