import { PhotoCard } from '@/components/PhotoCard/PhotoCard'
import { IMAGE_SIZES } from '@/utils/imageSizes'
import styles from './BirdIdPhotoRow.module.css'

const PHOTOS = [
  {
    src: '/images/birdid/birdid-row1-1.jpg',
    alt: 'Участница курса BirdID стоит в воде с биноклем',
    caption: 'Ольга Ерёменко, BirdID-2027',
  },
  {
    src: '/images/birdid/birdid-row1-2.jpg',
    alt: 'Участники курса BirdID наблюдают птиц в поле с оптикой',
    caption: 'Ольга Ерёменко, BirdID-2027',
  },
  {
    src: '/images/birdid/birdid-row1-3.jpg',
    alt: 'Участники курса BirdID фотографируют птиц с телеобъективами',
    caption: 'Оскар Сайфуллин, BirdID-2018',
  },
] as const

export const BirdIdPhotoRow = () => (
  <section className={styles.section}>
    <ul className={styles.list}>
      {PHOTOS.map((photo) => (
        <li key={photo.src} className={styles.item}>
          <PhotoCard
            src={photo.src}
            alt={photo.alt}
            caption={photo.caption}
            sizes={IMAGE_SIZES.cardThird}
          />
        </li>
      ))}
    </ul>
  </section>
)
