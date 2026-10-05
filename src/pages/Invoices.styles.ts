export const styles = {
  btnActiveFilter: `btn active-filter
    inline-flex items-center justify-center gap-2 rounded-[7px] bg-brand-soft text-strong text-[12px] font-semibold whitespace-nowrap leading-[1.5] shadow-[0_1px_2px_#1e3a5f05] py-[11px] px-4 border border-line border-solid
    hover:bg-surface`,

  dateFilters: `date-filters
    flex gap-[13px] items-center flex-wrap text-muted text-[10px] pt-0 px-6 pb-[18px]
    [&_label]:flex [&_label]:gap-[7px] [&_label]:items-center
    [&_input]:w-35 [&_input]:text-[10px] [&_input]:min-h-[30px] [&_input]:py-[5px] [&_input]:px-[7px]
    [&>span]:ml-auto
    max-[680px]:gap-2 max-[680px]:pt-0 max-[680px]:px-[17px] max-[680px]:pb-[18px]
    max-[680px]:[&_input]:w-[126px] max-[680px]:[&_input]:text-[9px]`,

  invoicePaper: `invoice-paper
    max-w-[830px] bg-white rounded-[6px] shadow-[0_5px_25px_#1e3a5f04] text-strong text-[11px] p-[55px] my-0 mx-auto border border-line border-solid
    max-[1050px]:p-[35px]
    max-[680px]:text-[10px] max-[680px]:py-[25px] max-[680px]:px-5
    print:shadow-none print:w-full print:max-w-none print:p-5 print:border-0 print:border-current print:border-solid`,

  paperTop: `paper-top
    flex justify-between gap-[25px] mb-11
    [&>div:first-child]:max-w-[55%]
    [&_h2]:text-[23px] [&_h2]:tracking-[-0.7px] [&_h2]:text-brand [&_h2]:mt-0 [&_h2]:mx-0 [&_h2]:mb-[14px]
    [&_p]:text-[10px] [&_p]:text-muted [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-[7px]
    max-[680px]:gap-[15px] max-[680px]:mb-[30px]
    max-[680px]:[&_h2]:text-[19px]
    max-[680px]:[&_p]:text-[9px]`,

  businessLogo: `business-logo
    w-[95px] h-[55px] object-contain object-left mb-5`,

  businessMark: `business-mark
    flex w-[95px] h-[55px] items-center mb-5`,

  paperMeta: `paper-meta
    text-right min-w-[190px]
    [&_h1]:text-[33px] [&_h1]:text-ink [&_h1]:tracking-[1px] [&_h1]:mt-0 [&_h1]:mx-0 [&_h1]:mb-[11px]
    [&>strong]:text-[11px] [&>strong]:font-medium [&>strong]:text-muted
    [&_dl]:grid [&_dl]:grid-cols-[1fr_1fr] [&_dl]:text-left [&_dl]:gap-[10px_17px] [&_dl]:mt-[22px] [&_dl]:text-[10px]
    [&_dt]:text-subtle
    [&_dd]:text-right [&_dd]:text-strong [&_dd]:m-0
    max-[1050px]:[&_h1]:text-[27px]
    max-[680px]:min-w-[145px] max-[680px]:max-w-[50%]
    max-[680px]:[&_h1]:text-[24px]
    max-[680px]:[&>strong]:text-[9px]
    max-[680px]:[&_dl]:text-[8px] max-[680px]:[&_dl]:gap-[9px]`,

  billTo: `bill-to
    mb-[34px]
    [&_.eyebrow]:text-[8px] [&_.eyebrow]:mb-3
    [&_h3]:text-[14px] [&_h3]:text-strong [&_h3]:mt-0 [&_h3]:mx-0 [&_h3]:mb-2
    [&_p]:text-muted [&_p]:text-[10px] [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-[6px]
    max-[680px]:mb-[27px]`,

  eyebrow: `eyebrow
    block text-[9px] font-semibold tracking-[1.6px] text-muted mb-[13px]`,

  paperItems: `paper-items
    [&_th]:text-[8px] [&_th]:bg-brand-soft [&_th]:text-muted [&_th]:py-3 [&_th]:px-[10px]
    [&_td]:text-[10px] [&_td]:align-top [&_td]:py-[17px] [&_td]:px-[10px]
    [&_td:first-child]:whitespace-pre-wrap [&_td:first-child]:min-w-[170px] [&_td:first-child]:max-w-75
    [&_th:first-child]:w-[45%]
    max-[680px]:[&_td]:text-[9px] max-[680px]:[&_td]:py-3 max-[680px]:[&_td]:px-2
    max-[680px]:[&_th]:text-[9px] max-[680px]:[&_th]:py-3 max-[680px]:[&_th]:px-2
    max-[680px]:[&_td:first-child]:min-w-[145px]
    print:break-inside-auto
    print:[&_tr]:break-inside-avoid`,

  paperTotals: `paper-totals
    max-w-75 mt-7 mr-0 mb-[30px] ml-auto
    [&>div]:flex [&>div]:justify-between [&>div]:gap-5 [&>div]:text-[11px] [&>div]:text-muted [&>div]:py-[10px] [&>div]:px-[11px]
    [&_.grand-total]:bg-brand [&_.grand-total]:text-white [&_.grand-total]:mt-3 [&_.grand-total]:text-[12px] [&_.grand-total]:rounded-[3px] [&_.grand-total]:py-4 [&_.grand-total]:px-[15px]
    [&_strong]:font-medium
    max-[680px]:max-w-65
    print:break-inside-avoid`,

  grandTotal: `grand-total`,

  paperBottom: `paper-bottom
    border-t border-solid border-t-line pt-[27px] grid grid-cols-[1fr_1fr] gap-[27px]
    [&_p]:text-[10px] [&_p]:text-muted [&_p]:leading-[1.9]
    [&_.eyebrow]:text-[8px]
    max-[680px]:grid-cols-1 max-[680px]:gap-[14px]
    print:break-inside-avoid`,

  backButton: `back-button
    inline-flex items-center gap-2 bg-transparent text-muted text-[10px] mb-[19px] p-0 border-0 border-current border-solid
    print:hidden!`,

  detailToolbar: `detail-toolbar
    flex items-center gap-5 mb-[23px]
    [&_label]:flex [&_label]:gap-[10px] [&_label]:items-center [&_label]:text-subtle [&_label]:text-[10px]
    [&_select]:w-[130px] [&_select]:text-[11px] [&_select]:py-2 [&_select]:px-[11px]
    [&>.text-button]:ml-auto [&>.text-button]:text-[10px]
    max-[680px]:gap-[13px] max-[680px]:flex-wrap
    max-[680px]:[&_label]:gap-2
    max-[680px]:[&>.text-button]:ml-0
    print:hidden!`,

  textButtonDanger: `text-button danger
    inline-flex items-center gap-[7px] bg-transparent text-rose-700 text-[12px] font-semibold py-1 px-0 border-0 border-current border-solid
    hover:underline`,

  editorLayout: `editor-layout
    grid grid-cols-[minmax(0,_1fr)_280px] gap-6 items-start
    max-[1270px]:grid-cols-[minmax(0,_1fr)_245px] max-[1270px]:gap-[17px]
    max-[1050px]:grid-cols-1`,

  editorMain: `editor-main`,

  stepNumber: `step-number
    h-[31px] w-[31px] inline-flex items-center justify-center bg-brand-soft text-muted rounded-[8px] text-[11px] shrink-0 border border-line border-solid`,

  formGridFour: `form-grid four
    grid grid-cols-4 gap-[0_12px]
    max-[1270px]:grid-cols-2
    max-[680px]:gap-[0_12px]`,

  snapshotFields: `snapshot-fields
    pt-[7px]`,

  serviceSelect: `service-select
    relative mb-[23px]
    [&>svg]:absolute [&>svg]:top-3 [&>svg]:left-[13px] [&>svg]:text-muted [&>svg]:pointer-events-none
    [&_select]:pl-[39px] [&_select]:text-muted [&_select]:bg-surface [&_select]:text-[11px]`,

  itemLabels: `item-labels
    grid grid-cols-[minmax(130px,_1fr)_63px_68px_98px_95px_30px] gap-[9px] items-start text-[9px] text-muted mb-[10px]
    max-[1270px]:grid-cols-[minmax(110px,_1fr)_50px_55px_75px_75px_24px] max-[1270px]:gap-[6px]
    max-[1050px]:grid-cols-[minmax(140px,_1fr)_60px_65px_95px_95px_27px] max-[1050px]:gap-[9px]
    max-[680px]:hidden`,

  itemRow: `item-row
    grid grid-cols-[minmax(130px,_1fr)_63px_68px_98px_95px_30px] gap-[9px] items-center mb-3
    [&_input]:text-[10px] [&_input]:py-[10px] [&_input]:px-2
    [&_textarea]:text-[10px] [&_textarea]:min-h-[61px] [&_textarea]:py-[10px] [&_textarea]:px-2
    max-[1270px]:grid-cols-[minmax(110px,_1fr)_50px_55px_75px_75px_24px] max-[1270px]:gap-[6px]
    max-[1050px]:grid-cols-[minmax(140px,_1fr)_60px_65px_95px_95px_27px] max-[1050px]:gap-[9px]
    max-[680px]:grid max-[680px]:grid-cols-[1fr_1fr_1fr] max-[680px]:gap-[9px] max-[680px]:bg-canvas max-[680px]:rounded-[8px] max-[680px]:mb-[13px] max-[680px]:p-[14px] max-[680px]:border max-[680px]:border-line max-[680px]:border-solid
    max-[680px]:[&_textarea]:col-span-full max-[680px]:[&_textarea]:bg-white
    max-[680px]:[&_input]:text-[10px]
    max-[680px]:[&_.item-amount]:col-span-full max-[680px]:[&_.item-amount]:text-left max-[680px]:[&_.item-amount]:text-[11px]`,

  itemField: `item-field
    contents
    [&>span]:hidden
    max-[680px]:flex max-[680px]:flex-col max-[680px]:gap-[7px]
    max-[680px]:[&>span]:block max-[680px]:[&>span]:text-[9px] max-[680px]:[&>span]:text-strong
    max-[680px]:first:col-span-full
    max-[680px]:[&:nth-child(2)]:col-[1]`,

  itemAmount: `item-amount
    text-right text-[10px] text-muted wrap-anywhere
    max-[1270px]:text-[9px]`,

  itemActions: `item-actions
    flex flex-col gap-0
    [&_.icon-button]:h-[21px] [&_.icon-button]:w-6
    max-[680px]:col-span-full max-[680px]:flex-row max-[680px]:justify-end
    max-[680px]:[&_.icon-button]:w-10 max-[680px]:[&_.icon-button]:h-10`,

  btnAddItem: `btn add-item
    inline-flex items-center justify-center gap-2 rounded-[7px] bg-canvas text-muted text-[10px] font-semibold whitespace-nowrap leading-[1.5] shadow-[0_1px_2px_#1e3a5f05] mt-2 py-[11px] px-4 border border-line border-dashed
    hover:bg-surface`,

  formGridAdjustments: `form-grid adjustments
    grid grid-cols-[1.2fr_1fr_1fr] gap-[0_18px] mt-7 border-t border-solid border-t-line pt-[22px]
    max-[680px]:gap-[0_12px] max-[680px]:grid-cols-[1fr_1fr]
    max-[680px]:[&_.field:first-child]:col-span-full`,

  formGridThree: `form-grid three
    grid grid-cols-3 gap-[0_18px]
    max-[1270px]:grid-cols-1
    max-[1050px]:grid-cols-3
    max-[680px]:gap-[0_12px] max-[680px]:grid-cols-1`,

  businessDetails: `business-details
    border-t border-solid border-t-line pt-[17px] text-muted text-[11px]
    [&_summary]:cursor-pointer [&_summary]:flex [&_summary]:justify-between [&_summary]:items-center [&_summary]:list-none [&_summary]:mb-5`,

  summaryPanelPanel: `summary-panel panel
    bg-white rounded-[10px] shadow-[0_2px_3px_#1e3a5f02] overflow-hidden sticky top-6 py-[25px] px-[22px] border border-line border-solid
    [&_.eyebrow]:text-[8px] [&_.eyebrow]:mb-[10px]
    [&_h2]:text-[16px] [&_h2]:mb-[7px]
    [&>p]:text-[11px] [&>p]:text-subtle [&>p]:pb-[22px] [&>p]:border-b [&>p]:border-solid [&>p]:border-b-line [&>p]:mb-[22px]
    [&>small]:flex [&>small]:gap-[6px] [&>small]:items-center [&>small]:text-[10px] [&>small]:text-subtle [&>small]:mb-6
    [&_.btn]:mb-[9px]
    [&>p.summary-note]:flex [&>p.summary-note]:items-start [&>p.summary-note]:gap-[6px] [&>p.summary-note]:text-[9px] [&>p.summary-note]:leading-[1.6] [&>p.summary-note]:pt-[10px] [&>p.summary-note]:px-0 [&>p.summary-note]:pb-0 [&>p.summary-note]:m-0 [&>p.summary-note]:border-0 [&>p.summary-note]:border-current [&>p.summary-note]:border-solid
    max-[1270px]:py-[23px] max-[1270px]:px-[17px]
    max-[1050px]:static max-[1050px]:max-w-none max-[1050px]:grid max-[1050px]:grid-cols-[1fr_1fr] max-[1050px]:gap-[0_20px]
    max-[1050px]:[&>.eyebrow]:col-span-full
    max-[1050px]:[&>h2]:col-span-full
    max-[1050px]:[&>p]:col-span-full
    max-[1050px]:[&_.summary-total]:col-span-full
    max-[1050px]:[&>small]:col-span-full
    max-[1050px]:[&>p.summary-note]:col-span-full
    max-[680px]:py-[22px] max-[680px]:px-[18px]`,

  summaryLine: `summary-line
    flex justify-between gap-2 text-[11px] text-muted my-[17px] mx-0
    [&_strong]:text-strong [&_strong]:font-medium`,

  summaryTotal: `summary-total
    border-t border-solid border-t-line border-b border-solid border-b-line py-5 px-0 mt-[21px] mx-0 mb-4
    [&_span]:text-[11px] [&_span]:text-muted [&_span]:block [&_span]:mb-[9px]
    [&_strong]:text-[26px] [&_strong]:font-medium [&_strong]:text-brand [&_strong]:tracking-[-0.8px] [&_strong]:wrap-anywhere
    max-[1270px]:[&_strong]:text-[23px]`,

  btnFull: `btn full
    inline-flex items-center justify-center gap-2 rounded-[7px] bg-white text-strong text-[12px] font-semibold whitespace-nowrap leading-[1.5] shadow-[0_1px_2px_#1e3a5f05] w-full py-[11px] px-4 border border-line border-solid
    hover:bg-surface`,
} as const;
