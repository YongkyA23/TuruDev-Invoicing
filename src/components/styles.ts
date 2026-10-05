const primaryButton = `btn primary
    inline-flex items-center justify-center gap-2 rounded-[7px] bg-brand text-white text-[12px] font-semibold whitespace-nowrap leading-[1.5] shadow-[0_2px_3px_#1e3a5f19] py-[11px] px-4 border border-brand border-solid
    hover:bg-brand-dark`;

export const ui = {
  iconButton: `icon-button
    inline-flex items-center justify-center w-[30px] h-[30px] bg-transparent text-muted rounded-[6px] p-0 border-0 border-current border-solid
    hover:bg-brand-soft hover:text-brand`,

  avatar: `avatar
    w-[35px] h-[35px] rounded-full bg-brand-soft text-strong text-[11px] font-[650] inline-flex items-center justify-center shrink-0`,

  formGrid: `form-grid
    grid grid-cols-2 gap-[0_18px]
    max-[680px]:gap-[0_12px]`,

  modalFooter: `modal-footer
    flex justify-end gap-[10px] pt-5 mt-5 border-t border-solid border-t-line`,

  btnPrimary: primaryButton,

  spin: `spin
    animate-spin`,

  panel: `panel
    bg-white rounded-[10px] shadow-[0_2px_3px_#1e3a5f02] overflow-hidden border border-line border-solid`,

  filterBar: `filter-bar
    flex items-center gap-3 flex-wrap py-[22px] px-6
    [&_.search]:flex-1 [&_.search]:min-w-45 [&_.search]:max-w-[430px]
    [&>select]:w-auto [&>select]:text-[11px] [&>select]:max-w-50
    max-[680px]:gap-[10px] max-[680px]:py-[19px] max-[680px]:px-[17px]
    max-[680px]:[&_.search]:basis-full max-[680px]:[&_.search]:max-w-none
    max-[680px]:[&>select]:max-w-40 max-[680px]:[&>select]:text-[10px]
    max-[680px]:[&_.btn]:text-[9px] max-[680px]:[&_.btn]:py-[9px] max-[680px]:[&_.btn]:px-[11px]`,

  search: `search
    relative
    [&_svg]:absolute [&_svg]:left-3 [&_svg]:top-3 [&_svg]:text-muted
    [&_input]:pl-[37px] [&_input]:text-[11px] [&_input]:bg-canvas`,

  muted: `muted
    text-muted text-[12px]`,

  tableWrap: `table-wrap
    w-full overflow-x-auto`,

  alignRight: `align-right
    text-right`,

  subtext: `subtext
    block text-[9px] text-subtle mt-[5px]`,

  rowActions: `row-actions
    flex gap-[2px] justify-end`,

  iconButtonDangerIcon: `icon-button danger-icon
    inline-flex items-center justify-center w-[30px] h-[30px] bg-transparent text-muted rounded-[6px] p-0 border-0 border-current border-solid
    hover:bg-surface hover:text-rose-700`,

  preWrap: `pre-wrap
    whitespace-pre-wrap wrap-anywhere`,

  noteBox: `note-box
    flex items-start gap-2 rounded-[6px] bg-surface text-muted text-[11px] leading-[1.6] p-[13px]
    [&_svg]:mt-[2px]`,

  textButton: `text-button
    inline-flex items-center gap-[7px] bg-transparent text-brand text-[12px] font-semibold py-1 px-0 border-0 border-current border-solid
    hover:underline`,

  quickIcon: `quick-icon
    bg-brand-soft rounded-[8px] inline-flex items-center justify-center h-10 w-10 text-muted shrink-0`,

  panelFormPanel: `panel form-panel
    bg-white rounded-[10px] shadow-[0_2px_3px_#1e3a5f02] overflow-visible mb-[21px] p-[25px] border border-line border-solid
    max-[1270px]:p-[21px]
    max-[680px]:py-5 max-[680px]:px-[18px]`,

  sectionTitle: `section-title
    flex items-center gap-3 mb-6
    [&_h2]:text-[15px] [&_h2]:mt-0 [&_h2]:mx-0 [&_h2]:mb-[5px]
    [&_p]:text-[10px] [&_p]:text-muted [&_p]:m-0
    [&_.text-button]:ml-auto
    max-[1270px]:[&_.text-button]:text-[10px]
    max-[680px]:gap-[9px] max-[680px]:flex-wrap
    max-[680px]:[&_h2]:text-[14px]
    max-[680px]:[&_p]:text-[9px]
    max-[680px]:[&_.text-button]:ml-10 max-[680px]:[&_.text-button]:mt-0`,

  btnPrimaryFull: `${primaryButton} full w-full`,
  btn: `btn
    inline-flex items-center justify-center gap-2 rounded-[7px] bg-white text-strong text-[12px] font-semibold whitespace-nowrap leading-[1.5] shadow-[0_1px_2px_#1e3a5f05] py-[11px] px-4 border border-line border-solid
    hover:bg-surface`,

  btnDanger: `btn danger
    inline-flex items-center justify-center gap-2 rounded-[7px] bg-rose-600 text-white text-[12px] font-semibold whitespace-nowrap leading-[1.5] shadow-[0_2px_3px_#1e3a5f19] py-[11px] px-4 border border-rose-600 border-solid
    hover:bg-rose-700`,
} as const;
