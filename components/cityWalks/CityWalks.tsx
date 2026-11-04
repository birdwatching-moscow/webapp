import { WalksTable } from '@/components/WalksTable/WalksTable'
import { getActiveWalks } from '@/lib/walks'

export const CityWalks = async () => {
  const walks = await getActiveWalks()
  return <WalksTable walks={walks} />
}
