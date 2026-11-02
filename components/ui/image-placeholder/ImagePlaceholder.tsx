import Image from 'next/image';
import styles from './ImagePlaceholder.module.css';

export type AspectRatio = '16-9' | '4-3' | '1-1' | '9-16';

export type ImagePlaceholderProps = {
  ratio:      AspectRatio;
  src?:       string;
  alt:        string;
  className?: string;
};

const RATIO_MAP: Record<AspectRatio, string> = {
  '16-9': '16 / 9',
  '4-3':  '4 / 3',
  '1-1':  '1 / 1',
  '9-16': '9 / 16',
};

export const ImagePlaceholder = ({ ratio, src, alt, className }: ImagePlaceholderProps) => {
  const cls = [styles.wrapper, className].filter(Boolean).join(' ');

  if (src) {
    return (
      <div className={cls} style={{ aspectRatio: RATIO_MAP[ratio] }}>
        <Image src={src} alt={alt} fill />
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
