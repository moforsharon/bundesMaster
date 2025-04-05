import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/i18n-config"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import GenderGame from "@/components/gender-game"
import PluralGame from "@/components/plural-game"
import SearchParamsHandler from "@/components/search-params-handler"
import { Suspense } from "react"

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang)

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-1 md:p-8 justify-center align-middle items-center overflow-hidden">
      <div className="max-w-4xl mx-auto ">
        <Tabs defaultValue="gender" className="flex justify-center text-center items-center w-full">
          <TabsContent value="gender">
            <GenderGame lang={lang} dict={dict} />
          </TabsContent>

          <TabsContent value="plural">
            <PluralGame />
          </TabsContent>
        </Tabs>
      </div>

      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
    </div>
  )
}