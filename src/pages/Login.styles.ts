export const styles = {
  login: `login
    min-h-screen grid grid-cols-[1.1fr_1fr] bg-canvas
    max-[800px]:[&_.brand]:text-[20px]
    max-[680px]:grid-cols-1`,

  loginStory: `login-story
    bg-brand-soft flex flex-col relative overflow-hidden py-[45px] px-[58px]
    [&::before]:content-[''] [&::before]:absolute [&::before]:w-[450px] [&::before]:h-[450px] [&::before]:rounded-full [&::before]:bottom-[-240px] [&::before]:left-[-120px] [&::before]:pointer-events-none [&::before]:border [&::before]:border-line [&::before]:border-solid
    max-[1270px]:p-[35px]
    max-[800px]:p-[30px]
    max-[800px]:[&_.brand_small]:text-[6px]
    max-[680px]:bg-brand-soft max-[680px]:py-6 max-[680px]:px-[27px]
    max-[680px]:[&_.brand]:mb-0`,

  brand: `brand
    flex gap-[10px] items-center no-underline text-ink text-[21px] font-[650] tracking-[-0.7px]
    [&_small]:block [&_small]:text-[7px] [&_small]:tracking-[1.25px] [&_small]:text-muted [&_small]:font-semibold [&_small]:mt-[5px]`,

  storyContent: `story-content
    max-w-[470px] pt-[70px] px-0 pb-[55px] my-auto mx-0
    [&_h1]:text-[57px] [&_h1]:tracking-[-2.7px] [&_h1]:font-medium [&_h1]:text-brand [&_h1]:leading-[1.15] [&_h1]:mt-7 [&_h1]:mx-0 [&_h1]:mb-5
    [&_p]:text-[12px] [&_p]:text-muted [&_p]:leading-[1.9]
    max-[1270px]:[&_h1]:text-[48px]
    max-[800px]:[&_h1]:text-[42px]
    max-[800px]:[&_p_br]:hidden
    max-[800px]:py-10 max-[800px]:px-0
    max-[680px]:pt-[25px] max-[680px]:px-0 max-[680px]:pb-0
    max-[680px]:[&_h1]:text-[35px] max-[680px]:[&_h1]:leading-[1.15] max-[680px]:[&_h1]:tracking-[-1.5px] max-[680px]:[&_h1]:mt-0 max-[680px]:[&_h1]:mx-0 max-[680px]:[&_h1]:mb-[10px]
    max-[680px]:[&_h1_br]:hidden
    max-[680px]:[&_p]:text-[10px] max-[680px]:[&_p]:max-w-[310px] max-[680px]:[&_p]:m-0`,

  invoiceIllustration: `invoice-illustration
    bg-canvas w-75 rounded-[9px] shadow-[8px_10px_0_#d6e8f8] rotate-[-4deg] p-6 mt-[45px] mr-[15px] mb-[15px] ml-15 border border-brand-tint border-solid
    max-[1270px]:ml-[30px]
    max-[800px]:w-[250px] max-[800px]:ml-[10px]
    max-[680px]:hidden`,

  illustrationTop: `illustration-top
    flex gap-[10px] items-center text-[9px] tracking-[1px] text-muted mb-7
    [&_.brand-mark]:h-[30px] [&_.brand-mark]:w-[30px]
    [&_small]:text-[7px] [&_small]:tracking-[0] [&_small]:text-subtle [&_small]:block [&_small]:mt-1`,

  illustrationCheck: `illustration-check
    bg-brand-soft text-subtle rounded-full h-[27px] w-[27px] flex items-center justify-center ml-auto
    [&_svg]:w-[15px]`,

  illustrationLineWide: `illustration-line wide
    bg-brand-tint h-[5px] w-[110px] rounded-[2px] mb-[7px]`,

  illustrationLine: `illustration-line
    bg-brand-tint h-[5px] w-[65px] rounded-[2px] mb-[7px]`,

  illustrationRow: `illustration-row
    flex justify-between border-b [border-bottom-style:solid] border-b-line text-[9px] text-muted py-[13px] px-0`,

  illustrationTotal: `illustration-total
    flex justify-between items-center pt-[18px] text-muted text-[9px]`,

  loginForm: `login-form
    flex flex-col items-center justify-center relative pt-[50px] px-10 pb-[30px]
    [&>div]:w-full [&>div]:max-w-85 [&>div]:my-auto [&>div]:mx-0
    [&_h2]:text-[34px] [&_h2]:font-medium [&_h2]:tracking-[-1.1px] [&_h2]:text-brand [&_h2]:mt-0 [&_h2]:mx-0 [&_h2]:mb-7
    [&_p]:text-[12px] [&_p]:text-muted [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-[35px]
    [&_.field]:mb-[23px]
    [&_.field>span]:text-[10px] [&_.field>span]:text-muted
    [&_input]:text-[11px] [&_input]:bg-white [&_input]:pt-[13px] [&_input]:pr-[13px] [&_input]:pb-[13px] [&_input]:pl-10
    [&_.btn]:mt-[6px] [&_.btn]:text-[11px] [&_.btn]:p-[13px]
    max-[800px]:p-[30px]
    max-[680px]:pt-[35px] max-[680px]:px-[27px] max-[680px]:pb-[25px]
    max-[680px]:[&>div]:max-w-95
    max-[680px]:[&_h2]:text-[28px]
    max-[680px]:[&_p]:text-[11px] max-[680px]:[&_p]:mb-[27px]`,

  inputIcon: `input-icon
    relative
    [&>svg]:absolute [&>svg]:left-[13px] [&>svg]:top-[13px] [&>svg]:text-subtle`,

  loginCopyright: `login-copyright
    text-subtle text-[9px] mt-[50px]
    max-[680px]:mt-[38px] max-[680px]:text-[8px]`,
} as const;
