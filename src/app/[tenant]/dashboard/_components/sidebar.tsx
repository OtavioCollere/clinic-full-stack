"use client"

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import clsx from "clsx";
import { List } from "lucide-react";
import { usePathname } from "next/navigation"
import { useState } from "react";

export default function SidebarDashboard({children}: {children: React.ReactNode}) {
  
  const pathName = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return(
    <div className="flex min-h-screen w-full">
      <div className={clsx("flex flex-1 flex-col transition-all duration-300", 
        {
          "md:ml-20" : isCollapsed,
          "md:ml-64" : !isCollapsed,
        }
      )}>

        <header className="md:hidden">
          <Sheet>
            <div className="flex items-center gap-4">
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <List className="w-5 h-5"></List>
                </Button>
              </SheetTrigger>
              <h1 className="text-base md:text-lg font-semibold">
                Menu OdontoPRO
              </h1>
            </div>
            <SheetContent>
              <SheetTitle>Menu</SheetTitle>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 py-4 px-2 md:p-6">
          {children}
        </main>
      </div>

    </div>
  )
}