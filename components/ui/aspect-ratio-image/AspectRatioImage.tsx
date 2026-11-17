import Image from 'next/image';
import { IMAGE_SIZES } from '@/utils/imageSizes';
import styles from './AspectRatioImage.module.css';

export type AspectRatio = '16-9' | '4-3' | '1-1' | '9-16';

export type AspectRatioImageProps = {
  ratio:      AspectRatio;
  src?:       string;
  alt:        string;
  className?: string;
  /** `sizes` for next/image — pass the rendered width when it differs from a card. */
  sizes?:     string;
};

// Used inside cards; callers with a known width (e.g. 80px avatar) pass their own.
const DEFAULT_SIZES = IMAGE_SIZES.cardThird;

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
