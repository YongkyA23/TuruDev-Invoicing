export const styles = {
  badge: `badge
    inline-flex items-center gap-[5px] text-[9px] font-medium rounded-[5px] whitespace-nowrap py-[5px] px-2
    [&_i]:w-1 [&_i]:h-1 [&_i]:rounded-full [&_i]:bg-current
    [&.draft]:bg-slate-100 [&.draft]:text-slate-600
    [&.sent]:bg-amber-50 [&.sent]:text-amber-700
    [&.paid]:bg-emerald-50 [&.paid]:text-emerald-700
    [&.cancelled]:bg-rose-50 [&.cancelled]:text-rose-700`,

  loading: `loading
    min-h-[250px] flex items-center justify-center gap-3 text-muted text-[12px]`,

  error: `error
    bg-rose-50 text-rose-700 rounded-[7px] text-[12px] leading-[1.6] mb-5 wrap-anywhere py-[14px] px-4 border border-rose-200 border-solid
    [&_.text-button]:ml-[15px]`,

  field: `field
    flex flex-col gap-2 mb-[18px] text-[12px]
    [&>span]:text-[11px] [&>span]:text-strong [&>span]:font-medium
    [&_small]:text-muted [&_small]:text-[10px]
    max-[680px]:[&>span]:text-[10px]
    max-[680px]:[&_input]:text-[11px] max-[680px]:[&_input]:py-[11px] max-[680px]:[&_input]:px-[10px]
    max-[680px]:[&_select]:text-[11px] max-[680px]:[&_select]:py-[11px] max-[680px]:[&_select]:px-[10px]
    max-[680px]:[&_textarea]:text-[11px] max-[680px]:[&_textarea]:py-[11px] max-[680px]:[&_textarea]:px-[10px]`,

  empty: `empty
    text-center py-14 px-6
    [&_h3]:text-[17px] [&_h3]:text-strong [&_h3]:mb-[10px] [&_h3]:font-medium
    [&_p]:text-[11px] [&_p]:text-muted [&_p]:max-w-95 [&_p]:mt-0 [&_p]:mx-auto [&_p]:mb-[22px]
    [&_.btn]:text-[11px]
    max-[680px]:py-[45px] max-[680px]:px-[22px]
    max-[680px]:[&_p]:text-[10px]`,

  emptyIcon: `empty-icon
    inline-flex items-center justify-center w-[55px] h-[55px] bg-brand-soft text-muted rounded-[14px] mb-[18px]`,

  pageTitle: `page-title
    flex justify-between items-center gap-[18px] mb-[30px]
    [&_h1]:m-0
    [&_p]:text-[12px] [&_p]:text-muted [&_p]:m-0
    [&_.btn]:py-3 [&_.btn]:px-[17px]
    max-[1050px]:[&_h1]:text-[27px]
    max-[1050px]:items-start max-[1050px]:gap-[14px]
    max-[1050px]:[&_.btn]:text-[10px] max-[1050px]:[&_.btn]:py-[10px] max-[1050px]:[&_.btn]:px-[13px]
    max-[680px]:[&_h1]:text-[26px]
    max-[680px]:flex-col max-[680px]:gap-[17px] max-[680px]:mb-[23px]
    max-[680px]:[&_p]:text-[11px]
    print:hidden!`,

  titleActions: `title-actions
    flex gap-2 items-center
    max-[1050px]:flex-wrap max-[1050px]:justify-end
    max-[680px]:justify-start max-[680px]:flex-wrap max-[680px]:w-full`,

  dialog: `dialog
    m-auto rounded-[12px] bg-white shadow-[0_25px_100px_#1e3a5f30] w-[570px] max-w-[calc(100vw_-_28px)] max-h-[90vh] text-inherit overflow-y-auto p-[27px] border border-line border-solid
    [&:has(.invoice-paper)]:w-[890px]
    backdrop:bg-[#20385565] backdrop:backdrop-blur-[3px]
    [&_.invoice-paper]:shadow-none [&_.invoice-paper]:p-[35px]
    max-[680px]:py-[22px] max-[680px]:px-[19px]
    max-[680px]:[&_.invoice-paper]:py-5 max-[680px]:[&_.invoice-paper]:px-[15px]`,

  modalHeading: `modal-heading
    flex justify-between items-center mb-[25px]
    [&_h2]:text-[20px] [&_h2]:text-strong [&_h2]:m-0
    max-[680px]:[&_h2]:text-[18px]`,

  invoiceLink: `invoice-link
    bg-transparent text-[11px] font-medium text-brand py-[3px] px-0 border-0 border-current border-solid
    hover:underline`,

  clientCell: `client-cell
    flex items-center gap-[10px] text-[11px] text-strong leading-[1.4]
    [&_strong]:font-medium
    [&_small]:block [&_small]:text-[9px] [&_small]:text-subtle [&_small]:mt-[3px]`,

  avatarMini: `avatar mini
    w-[30px] h-[30px] rounded-full bg-brand-soft text-strong text-[9px] font-[650] inline-flex items-center justify-center shrink-0`,

  alignRightAmount: `align-right amount
    text-right text-strong font-medium text-[11px]`,
} as const;
