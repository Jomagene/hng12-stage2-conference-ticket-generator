import { TOTAL_STEPS } from '@/config/site';
import { cn } from '@/lib/utils';

export function PageCard({ title, step, totalSteps = TOTAL_STEPS, className, children }) {
  return (
    <section
      aria-labelledby="page-title"
      className={cn(
        'mx-auto flex w-full max-w-[700px] flex-col gap-8 rounded-3xl border border-line bg-panel p-6 sm:rounded-[40px] md:bg-card md:p-12',
        className,
      )}>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="page-title" className="font-serif text-2xl sm:text-[32px]">
            {title}
          </h1>
          {step && (
            <span>
              Step {step}/{totalSteps}
            </span>
          )}
        </div>
        {step && (
          <div
            role="progressbar"
            aria-label="Booking progress"
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuenow={step}
            className="h-1 rounded bg-line-muted">
            <div
              className="h-full rounded bg-accent transition-[width] duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        )}
      </header>
      {children}
    </section>
  );
}

export function Panel({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col gap-8 rounded-[32px] border-line-muted bg-panel md:border md:p-6', className)}
      {...props}
    />
  );
}

export function Divider() {
  return <hr className="h-1 rounded border-0 bg-line-subtle" />;
}

export function StepActions({ className, ...props }) {
  return <div className={cn('flex flex-col-reverse gap-4 sm:flex-row sm:gap-6 [&>*]:flex-1', className)} {...props} />;
}
