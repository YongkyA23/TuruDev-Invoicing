export const styles = {
  clientCellPlainButton: `client-cell plain-button
    bg-transparent text-strong text-left flex items-center gap-[10px] text-[11px] leading-[1.4] p-0 border-0 border-current border-solid
    [&_strong]:font-medium
    [&_small]:block [&_small]:text-[9px] [&_small]:text-subtle [&_small]:mt-[3px]`,

  clientDetail: `client-detail
    text-[12px] text-muted
    [&_h3]:mt-6 [&_h3]:text-strong`,

  history: `history
    mt-5
    [&_button]:w-full [&_button]:flex [&_button]:items-center [&_button]:justify-between [&_button]:gap-3 [&_button]:border-t-0 [&_button]:border-t-current [&_button]:border-r-0 [&_button]:border-r-current [&_button]:border-b [&_button]:border-b-line [&_button]:border-l-0 [&_button]:border-l-current [&_button]:bg-white [&_button]:text-[11px] [&_button]:text-muted [&_button]:text-left [&_button]:py-[14px] [&_button]:px-0 [&_button]:border-solid
    [&_small]:block [&_small]:text-[9px] [&_small]:text-subtle [&_small]:mt-[6px]
    [&_strong]:font-medium`,
} as const;
