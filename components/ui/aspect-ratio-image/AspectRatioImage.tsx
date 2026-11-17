import Image from 'next/image';
import styles from './AspectRatioImage.module.css';

export type AspectRatio = '16-9' | '4-3' | '1-1' | '9-16';

export type AspectRatioImageProps = {
  ratio:      AspectRatio;
  src?:       string;
  alt:        string;
  className?: string;
  /** `sizes` for next/image — pass the rendered width when it is not full width. */
  sizes?:     string;
};

// Safe default: never blurry; callers with a known small width pass their own.
const DEFAULT_SIZES = '100vw';

const RATIO_MAP: Record<AspectRatio, string> = {
  '16-9': '16 / 9',
  '4-3':  '4 / 3',
  '1-1':  '1 / 1',
  '9-16': '9 / 16',
};

export const AspectRatioImage = ({ ratio, src, alt, className, sizes = DEFAULT_SIZES }: AspectRatioImageProps) => {
  const cls = [styles.wrapper, className].filter(Boolean).join(' ');

  if (src) {
    return (
      <div className={cls} style={{ aspectRatio: RATIO_MAP[ratio] }}>
        <Image src={src} alt={alt} fill sizes={sizes} />
      </div>
    );
  }

  return (
    <div
      className={[cls, styles.placeholder].join(' ')}
      style={{ aspectRatio: RATIO_MAP[ratio] }}
      role="img"
      aria-label={alt}
    />
  );
};
