export const styles = {
  serviceGrid: `service-grid
    grid grid-cols-3 gap-[18px] pt-0 px-6 pb-6
    max-[1270px]:grid-cols-2
    max-[680px]:grid-cols-1 max-[680px]:pt-0 max-[680px]:px-[17px] max-[680px]:pb-[17px]`,

  serviceCard: `service-card
    rounded-[9px] p-[22px] border border-line border-solid
    [&_h3]:font-medium [&_h3]:text-strong [&_h3]:mt-0 [&_h3]:mx-0 [&_h3]:mb-[10px]
    [&_p]:text-[11px] [&_p]:text-muted [&_p]:whitespace-pre-wrap [&_p]:wrap-anywhere [&_p]:min-h-[45px]
    max-[680px]:p-[21px]`,

  serviceCardTop: `service-card-top
    flex items-center justify-between mb-5`,

  servicePrice: `service-price
    flex gap-[6px] items-baseline border-t border-solid border-t-line pt-4
    [&_strong]:text-[18px] [&_strong]:font-medium [&_strong]:tracking-[-0.6px] [&_strong]:text-brand
    [&_span]:text-[10px] [&_span]:text-subtle`,
} as const;
