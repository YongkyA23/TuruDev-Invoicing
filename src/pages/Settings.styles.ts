export const styles = {
  settingsLayout: `settings-layout
    grid grid-cols-[1fr_1fr] gap-[23px] max-w-285
    max-[1050px]:grid-cols-1`,

  logoUpload: `logo-upload
    flex items-center gap-[18px] mb-5 border-b border-solid border-b-line pt-0 px-0 pb-[22px]
    [&>img]:w-16 [&>img]:h-16 [&>img]:object-contain [&>img]:rounded-[9px] [&>img]:p-[5px] [&>img]:border [&>img]:border-line [&>img]:border-solid
    [&_.field]:mt-0 [&_.field]:mx-0 [&_.field]:mb-[5px]
    [&_small]:text-[9px] [&_small]:text-muted
    [&_.brand-mark]:h-15 [&_.brand-mark]:w-15
    max-[680px]:flex-wrap max-[680px]:gap-[14px]
    max-[680px]:[&>div]:max-w-60`,
} as const;
