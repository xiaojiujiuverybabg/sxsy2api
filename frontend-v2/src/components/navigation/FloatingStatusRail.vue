<template>
  <section class="pointer-events-none fixed inset-x-4 top-4 z-30 md:inset-x-8 md:top-6">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3">
      <RouterLink
        to="/home"
        class="pointer-events-auto flex items-center gap-3 rounded-full border border-white/70 bg-white/76 px-3 py-2 shadow-insetline backdrop-blur-xl transition hover:bg-white"
      >
        <span class="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-xs font-black text-white">S2</span>
        <span class="hidden pr-2 text-sm font-black text-text-primary sm:block">sxsy2Api 控制台</span>
      </RouterLink>

      <button
        class="pointer-events-auto hidden rounded-full border border-white/70 bg-white/76 px-5 py-3 text-sm font-black text-text-secondary shadow-insetline backdrop-blur-xl transition hover:bg-white hover:text-brand-500 md:block"
      >
        Ctrl K · 命令中心
      </button>

      <div class="pointer-events-auto flex items-center gap-2 rounded-full border border-white/70 bg-white/76 px-3 py-2 shadow-insetline backdrop-blur-xl">
        <span class="h-2.5 w-2.5 rounded-full bg-success-500 shadow-[0_0_0_6px_rgba(56,161,105,.12)]"></span>
        <span class="hidden text-xs font-black uppercase tracking-[0.22em] text-text-muted sm:inline">系统就绪</span>
      </div>
    </div>
  </section>
</template>
