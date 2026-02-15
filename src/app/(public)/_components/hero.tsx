import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Hero() {
  return(
    <section className="bg-green-50">
      <div className="container mx-auto px-4 pt-20 pb-4 sm:pb-0 sm:px-6 lg:px-8">
        <main className="flex items-center justify-center">
          <article className="flex-[2] max-w-3xl space-y-8 flex flex-col justify-center">
            <h1 className="text-4xl font-bold lg:text-5xl font-bold max-w-2xl tracking-tight">
              Encontre os melhores profissionais em um único local
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Nós somos uma plataforma para profissionais da saúde com foco em agilizar seu atendimento de forma simplificada e organizada.
            </p>

            <Button className="bg-emerald-500 hover:bg-emerald-400 w-fit px-6 font-semibold">
              Encontre uma clinica
            </Button>
          </article>

          <div className="hidden md:block">
            <Image src="/doctor-hero.png" alt="Hero" width={340} height={400} className="object-contain" quality={100}/>
          </div>


        </main>
      </div>
    </section>   
  )
}