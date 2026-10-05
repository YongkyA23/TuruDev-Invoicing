const sidebar = `sidebar
    fixed left-0 top-0 bottom-0 w-[230px] bg-surface border-r border-solid border-r-line flex flex-col z-30 pt-[33px] px-[22px] pb-[18px]
    [&_.brand]:mb-[53px]
    [&_nav]:flex [&_nav]:flex-col [&_nav]:gap-[5px]
    [&_nav_button]:relative [&_nav_button]:bg-transparent [&_nav_button]:text-muted [&_nav_button]:rounded-[7px] [&_nav_button]:flex [&_nav_button]:items-center [&_nav_button]:gap-3 [&_nav_button]:text-[12px] [&_nav_button]:font-medium [&_nav_button]:text-left [&_nav_button]:py-[13px] [&_nav_button]:px-[14px] [&_nav_button]:border-0 [&_nav_button]:border-current [&_nav_button]:border-solid
    [&_nav_button:hover]:bg-brand-soft
    [&_nav_button.selected]:text-brand [&_nav_button.selected]:bg-brand-tint [&_nav_button.selected]:font-semibold
    max-[1270px]:w-[210px] max-[1270px]:pl-[17px] max-[1270px]:pr-[17px]
    max-[800px]:transition-transform max-[800px]:duration-200 max-[800px]:w-[230px]
    print:hidden!`;

export const styles = {
  appShell: `app-shell
    min-h-screen`,

  sidebarOverlay: `sidebar-overlay
    max-[800px]:fixed max-[800px]:inset-0 max-[800px]:bg-[#20385550] max-[800px]:z-25`,

  brandPlainButton: `brand plain-button
    bg-transparent text-ink text-left flex gap-[10px] items-center no-underline text-[21px] font-[650] tracking-[-0.7px] p-0 border-0 border-current border-solid
    [&_small]:block [&_small]:text-[7px] [&_small]:tracking-[1.25px] [&_small]:text-muted [&_small]:font-semibold [&_small]:mt-[5px]`,

  navDot: `nav-dot
    w-[5px] h-[5px] rounded-full bg-brand ml-auto`,

  sidebarUser: `sidebar-user
    flex items-center gap-[9px] border-t border-solid border-t-line pt-[18px] mt-auto
    [&>span:nth-child(2)]:min-w-0 [&>span:nth-child(2)]:flex-1
    [&_strong]:block [&_strong]:text-[10px] [&_strong]:font-semibold
    [&_small]:block [&_small]:text-muted [&_small]:text-[9px] [&_small]:mt-1 [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap
    [&_.icon-button]:w-[22px]`,

  avatarDark: `avatar dark
    w-[35px] h-[35px] rounded-full bg-brand-tint text-strong text-[11px] font-[650] inline-flex items-center justify-center shrink-0`,

  mainShell: `main-shell
    ml-[230px] min-h-screen flex flex-col
    max-[1270px]:ml-[210px]
    max-[800px]:ml-0
    print:m-0`,

  topbar: `topbar
    h-19 flex items-center justify-between bg-canvas border-b border-solid border-b-line py-0 px-10
    [&_.avatar]:h-[31px] [&_.avatar]:w-[31px] [&_.avatar]:text-[9px]
    min-[1500px]:py-0 min-[1500px]:px-[55px]
    max-[1270px]:py-0 max-[1270px]:px-[26px]
    max-[800px]:h-[65px] max-[800px]:py-0 max-[800px]:px-6
    print:hidden!`,

  iconButtonMobileMenu: `icon-button mobile-menu
    hidden items-center justify-center w-[30px] h-[30px] bg-transparent text-muted rounded-[6px] p-0 border-0 border-current border-solid
    hover:bg-brand-soft hover:text-brand
    max-[800px]:flex`,

  breadcrumb: `breadcrumb
    flex items-center gap-[13px] text-[11px] text-muted
    [&_strong]:text-strong [&_strong]:font-medium
    [&_svg]:text-subtle
    max-[800px]:mr-auto max-[800px]:ml-[14px]
    max-[680px]:text-[10px]`,

  topbarRight: `topbar-right
    flex items-center gap-5
    max-[800px]:gap-[13px]`,

  workspaceContent: `workspace-content
    w-full max-w-395 flex-1 pt-[38px] px-10 pb-[30px] my-0 mx-auto
    min-[1500px]:py-12 min-[1500px]:px-[55px]
    max-[1270px]:py-[30px] max-[1270px]:px-[26px]
    max-[800px]:py-[27px] max-[800px]:px-6
    print:p-0`,

  toast: `toast
    fixed right-7 bottom-[27px] flex items-center gap-3 max-w-[calc(100vw_-_40px)] bg-brand text-white rounded-[9px] shadow-[0_5px_20px_#1e3a5f20] text-[12px] z-100 py-4 px-[19px] border border-brand border-solid
    [&>svg]:text-blue-100
    [&_button]:flex [&_button]:bg-transparent [&_button]:text-blue-100 [&_button]:ml-[10px] [&_button]:border-0 [&_button]:border-current [&_button]:border-solid
    max-[680px]:right-4 max-[680px]:bottom-[18px] max-[680px]:text-[11px] max-[680px]:p-[14px]
    print:hidden!`,

  sidebarOpen: `${sidebar} open max-[800px]:translate-x-0`,

  sidebar: `${sidebar} max-[800px]:-translate-x-full`,
} as const;
