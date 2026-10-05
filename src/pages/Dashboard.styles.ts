export const styles = {
  welcomeBanner: `welcome-banner
    relative flex justify-between items-center mb-[25px] rounded-[10px] bg-brand-soft min-h-[221px] overflow-hidden py-[33px] px-[35px] border border-line border-solid
    [&_h2]:text-[27px] [&_h2]:tracking-[-1px] [&_h2]:font-medium [&_h2]:text-ink [&_h2]:mt-[17px] [&_h2]:mx-0 [&_h2]:mb-[10px]
    [&_p]:text-muted [&_p]:text-[11px] [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-[19px]
    [&_.pill]:text-[7px] [&_.pill]:tracking-[1px] [&_.pill]:bg-brand-tint [&_.pill]:py-[5px] [&_.pill]:px-2
    [&_.text-button]:text-[10px] [&_.text-button]:text-strong
    min-[1500px]:py-[39px] min-[1500px]:px-10
    min-[1500px]:[&_h2]:text-[31px]
    max-[1050px]:py-[29px] max-[1050px]:px-[25px]
    max-[1050px]:[&_h2]:text-[24px]
    max-[680px]:min-h-[210px] max-[680px]:p-[25px]
    max-[680px]:[&_h2]:text-[24px] max-[680px]:[&_h2]:max-w-55
    max-[680px]:[&_p]:max-w-[205px] max-[680px]:[&_p]:text-[10px]
    max-[680px]:[&>div:first-child]:relative max-[680px]:[&>div:first-child]:z-1`,

  bannerArt: `banner-art
    relative w-[210px] h-45 mr-[18px] shrink-0
    min-[1500px]:mr-[55px]
    max-[1050px]:mr-0 max-[1050px]:w-[155px]
    max-[680px]:absolute max-[680px]:right-[-12px] max-[680px]:bottom-[-10px] max-[680px]:w-[110px] max-[680px]:h-[145px] max-[680px]:opacity-[0.65]
    max-[680px]:[&_.paper]:h-[145px] max-[680px]:[&_.paper]:w-[107px] max-[680px]:[&_.paper]:right-4 max-[680px]:[&_.paper]:p-3`,

  paper: `paper
    w-36 h-[177px] rotate-[8deg] absolute right-[30px] top-2 bg-canvas rounded-[5px] shadow-[4px_6px_0_#d6e8f8] p-[17px] border border-line border-solid`,

  paperHead: `paper-head
    flex items-center justify-between text-muted text-[7px] font-semibold tracking-[0.4px] mb-[17px]
    max-[680px]:text-[5px] max-[680px]:mb-2
    max-[680px]:[&_svg]:w-[17px]`,

  paperLine: `paper-line
    h-1 bg-brand-tint rounded-[3px] w-18 mb-[5px]
    max-[680px]:w-[55px]`,

  paperLineShort: `paper-line short
    h-1 bg-brand-tint rounded-[3px] w-12 mb-[5px]
    max-[680px]:w-[35px]`,

  paperRule: `paper-rule
    h-[1px] bg-brand-soft my-[11px] mx-0
    max-[680px]:my-[10px] max-[680px]:mx-0`,

  paperDots: `paper-dots
    flex justify-between
    [&_span]:h-1 [&_span]:w-[38px] [&_span]:bg-brand-soft
    max-[680px]:[&_span]:w-[25px]`,

  paperPaid: `paper-paid
    flex gap-[5px] items-center text-muted text-[7px] justify-center mt-[9px]
    max-[680px]:text-[5px]`,

  artBadge: `art-badge
    absolute bottom-[6px] right-5 bg-brand w-[43px] h-[43px] rounded-full text-white flex items-center justify-center border-[5px] border-line border-solid
    max-[680px]:w-[33px] max-[680px]:h-[33px] max-[680px]:border-[4px]
    max-[680px]:[&_svg]:w-[17px]`,

  artLeaf: `art-leaf
    absolute left-2 bottom-[10px] text-subtle rotate-[-35deg]
    max-[680px]:hidden`,

  stats: `stats
    grid grid-cols-4 gap-4 mb-7
    min-[1500px]:gap-[22px]
    max-[1270px]:gap-[11px]
    max-[1050px]:grid-cols-2
    max-[680px]:gap-[10px] max-[680px]:mb-5`,

  stat: `stat
    rounded-[9px] bg-white pt-5 px-5 pb-[17px] border border-line border-solid
    [&>span]:flex [&>span]:justify-between [&>span]:text-muted [&>span]:text-[10px] [&>span]:mb-4 [&>span]:gap-2
    [&>span_svg]:text-subtle [&>span_svg]:w-[17px]
    [&_strong]:block [&_strong]:text-[29px] [&_strong]:tracking-[-0.8px] [&_strong]:font-medium [&_strong]:text-ink [&_strong]:mb-[11px]
    [&_strong.money-stat]:text-[21px] [&_strong.money-stat]:tracking-[-0.6px] [&_strong.money-stat]:leading-[1.25] [&_strong.money-stat]:wrap-anywhere
    [&_small]:block [&_small]:text-[9px] [&_small]:text-subtle [&_small]:leading-[1.6]
    min-[1500px]:p-[25px]
    max-[1270px]:py-[17px] max-[1270px]:px-[13px]
    max-[1270px]:[&_strong.money-stat]:text-[18px]
    max-[1050px]:[&_strong.money-stat]:text-[24px]
    max-[680px]:py-4 max-[680px]:px-[13px]
    max-[680px]:[&>span]:text-[9px] max-[680px]:[&>span]:mb-[13px]
    max-[680px]:[&_strong]:text-[28px]
    max-[680px]:[&_strong.money-stat]:text-[20px]
    max-[680px]:[&_small]:text-[8px]`,

  moneyStat: `money-stat`,

  panelHeading: `panel-heading
    flex items-center justify-between pt-6 px-[25px] pb-5
    [&_h2]:text-[15px] [&_h2]:mt-0 [&_h2]:mx-0 [&_h2]:mb-[6px]
    [&_p]:text-muted [&_p]:text-[11px] [&_p]:m-0
    max-[680px]:gap-3 max-[680px]:py-5 max-[680px]:px-[18px]
    max-[680px]:[&_h2]:text-[14px]
    max-[680px]:[&_p]:text-[9px]
    max-[680px]:[&_.text-button]:text-[9px]
    max-[680px]:[&_.text-button_svg]:w-3`,

  count: `count
    text-[10px] ml-[6px] bg-brand-soft rounded-[4px] text-muted font-medium py-[3px] px-[6px]`,

  quickLinks: `quick-links
    grid grid-cols-[1fr_1fr] gap-[18px] mt-6
    [&_button]:flex [&_button]:items-center [&_button]:gap-[15px] [&_button]:rounded-[8px] [&_button]:text-left [&_button]:bg-surface [&_button]:text-muted [&_button]:p-[21px] [&_button]:border [&_button]:border-line [&_button]:border-solid
    [&_button>span:nth-child(2)]:flex-1
    [&_strong]:block [&_strong]:text-strong [&_strong]:text-[11px] [&_strong]:font-medium [&_strong]:mb-0
    [&_small]:block [&_small]:text-muted [&_small]:text-[9px]
    max-[1270px]:gap-3
    max-[1270px]:[&_button]:gap-3 max-[1270px]:[&_button]:p-[18px]
    max-[1270px]:[&_small]:text-[8px]
    max-[1050px]:grid-cols-1
    max-[680px]:[&_button]:p-[19px]
    max-[680px]:[&_strong]:text-[10px]`,
} as const;
