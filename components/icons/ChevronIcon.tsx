type Props = { direction: 'left' | 'right' }

const PATHS: Record<Props['direction'], string> = {
  left: 'M12.5 4L6.5 10L12.5 16',
  right: 'M7.5 4L13.5 10L7.5 16',
}

export const ChevronIcon = ({ direction }: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d={PATHS[direction]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
  </svg>
)
