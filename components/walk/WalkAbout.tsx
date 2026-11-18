import Image from 'next/image'
import styles from './WalkAbout.module.css'

function getLinkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

type Guide = {
  name: string
  photoUrl?: string | null
  education?: string | null
  achievements?: string | null
  profileLinks: string[]
}

type Props = {
  description: string
  guide?: Guide | null
}

export const WalkAbout = ({ description, guide }: Props) => (
  <section className={styles.about}>
    <div className={styles.descriptionCol}>
      <h2 className={`text-h1 ${styles.heading}`}>О прогулке</h2>
      <p className={`text-body-l ${styles.description}`}>{description}</p>
    </div>

    {guide && (
      <div className={styles.guideCol}>
        <h2 className={`text-h1 ${styles.heading}`}>Сопровождение</h2>
        <div className={styles.guide}>
          <div className={styles.guidePhoto}>
            <Image
              src={guide.photoUrl ?? '/placeholders/image-placeholder.png'}
              alt={guide.name}
              fill
              className={styles.guidePhotoImg}
              sizes="(min-width: 1248px) 300px, 100vw"
            />
          </div>
          <div className={styles.guideInfo}>
            <p className={`text-h2 ${styles.guideName}`}>{guide.name}</p>
            {guide.education && (
              <p className={`text-body ${styles.guideSubtitle}`}>{guide.education}</p>
            )}
            {guide.achievements && (
              <p className={`text-body-l ${styles.guideText}`}>{guide.achievements}</p>
            )}
            {guide.profileLinks.length > 0 && (
              <ul className={styles.guideLinks}>
                {guide.profileLinks.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-body ${styles.guideLink}`}
                    >
                      {getLinkLabel(url)}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    )}
  </section>
)
