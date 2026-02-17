
import HomeContent from '@/components/HomeContent'
import { db } from '@/lib/db'



export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; already_confirmed?: string }>
}) {
  const sp = await searchParams
  const servicesResult = await db.execute(`SELECT * FROM services`)
  const staffResult = await db.execute(`SELECT * FROM staff`)
  const locationsResult = await db.execute(`SELECT * FROM locations`)
  const settingsResult = await db.execute(`SELECT * FROM settings`)
  const portfolioResult = await db.execute(`SELECT * FROM portfolio_images`)


  return (
    <HomeContent
      initialServices={JSON.parse(JSON.stringify(servicesResult.rows))}
      initialStaff={JSON.parse(JSON.stringify(staffResult.rows))}
      initialLocations={JSON.parse(JSON.stringify(locationsResult.rows))}
      initialSettings={JSON.parse(JSON.stringify(settingsResult.rows))}
      initialPortfolio={JSON.parse(JSON.stringify(portfolioResult.rows))}
      searchParams={sp}
    />
  )
}
