import Image from "next/image";
import Link from "next/link";

export default function Nav({ userEmail }: { userEmail: string }) {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="193 Shoes"
            width={36}
            height={36}
            className="rounded-full"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">
            193 Shoes
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-700">
          <Link href="/" className="hover:text-black">
            Estoque
          </Link>
          <Link href="/produtos/novo" className="hover:text-black">
            Novo produto
          </Link>
          <Link href="/categorias" className="hover:text-black">
            Modelos
          </Link>
          <span className="hidden text-zinc-400 sm:inline">{userEmail}</span>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
            >
              Sair
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
