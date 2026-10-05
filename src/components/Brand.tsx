import { styles } from "./Brand.styles";
export function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <img
        src="/turudev-logo.png"
        alt=""
        className="absolute top-[-91%] left-[-107.5%] h-[315%] w-[315%] max-w-none"
      />
    </span>
  );
}
