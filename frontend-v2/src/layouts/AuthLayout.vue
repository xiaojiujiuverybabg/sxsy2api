<template>
  <main class="auth-stage relative min-h-screen overflow-hidden px-4 py-5 md:px-8 md:py-8">
    <div class="pointer-events-none absolute inset-0">
      <div class="auth-orb auth-orb-primary"></div>
      <div class="auth-orb auth-orb-success"></div>
      <div class="auth-orb auth-orb-ink"></div>
      <div class="auth-gridline"></div>
      <div class="auth-scanline"></div>
    </div>

    <section class="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center">
      <RouterView />
    </section>
  </main>
</template>
