<template>
  <div
    class="min-h-screen bg-background text-foreground overflow-hidden relative"
  >
    <!-- 动态背景元素 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <!-- 主背景渐变 -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-transparent dark:to-transparent"
      ></div>

      <!-- 浮动几何元素 - 视差效果 -->
      <div
        class="parallax-element absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-warm"
        data-speed="0.1"
      ></div>
      <div
        class="parallax-element absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse-gentle"
        data-speed="0.15"
        style="animation-delay: 1s"
      ></div>

      <!-- 装饰性粒子 - 视差效果 -->
      <div
        class="parallax-element interactive-element absolute top-1/3 right-1/3 w-4 h-4 bg-primary/20 rounded-full animate-float"
        data-speed="0.2"
      ></div>
      <div
        class="parallax-element interactive-element absolute bottom-1/4 left-1/3 w-3 h-3 bg-secondary/30 rounded-full animate-float"
        data-speed="0.25"
        style="animation-delay: 0.5s"
      ></div>
      <div
        class="parallax-element interactive-element absolute top-2/3 left-2/3 w-2 h-2 bg-accent/40 rounded-full animate-float"
        data-speed="0.3"
        style="animation-delay: 1.5s"
      ></div>

      <!-- 网格背景 -->
      <div
        class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style="
          background-image: radial-gradient(
            circle at 1px 1px,
            currentColor 1px,
            transparent 0
          );
          background-size: 40px 40px;
        "
      ></div>
    </div>

    <!-- 温暖友好的导航栏 -->
    <header
      class="sticky top-0 z-50 border-b border-border/50 glass backdrop-blur-md"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- 品牌标识 -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <div
                class="absolute inset-0 bg-primary/20 rounded-lg blur-md"
              ></div>
              <div
                class="relative p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20"
              >
                <Globe class="h-6 w-6 text-primary animate-spin-slow" />
              </div>
            </div>
            <h1 class="text-xl font-bold tracking-tight">
              <span
                class="text-gradient bg-gradient-to-r from-primary via-primary/80 to-primary/60"
                >Conan</span
              >
            </h1>
          </div>

          <!-- 导航项 -->
          <nav class="hidden md:flex items-center gap-6" aria-label="主要导航">
            <a
              href="#features"
              class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 link-warm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-md"
              @click.prevent="scrollToFeatures"
              @keydown.enter.prevent="scrollToFeatures"
              @keydown.space.prevent="scrollToFeatures"
              role="link"
              tabindex="0"
              aria-label="跳转到功能特性区域"
            >
              功能特性
            </a>
            <a
              href="#values"
              class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 link-warm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-md"
              @keydown.enter.prevent="scrollToValues"
              @keydown.space.prevent="scrollToValues"
              role="link"
              tabindex="0"
              aria-label="跳转到核心价值区域"
            >
              核心价值
            </a>
            <a
              href="#testimonials"
              class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 link-warm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-md"
              @click.prevent="scrollToTestimonials"
              @keydown.enter.prevent="scrollToTestimonials"
              @keydown.space.prevent="scrollToTestimonials"
              role="link"
              tabindex="0"
              aria-label="跳转到用户见证区域"
            >
              用户见证
            </a>
          </nav>

          <!-- 右侧操作 -->
          <div class="flex items-center gap-4">
            <ThemeToggle />
            <Button
              size="sm"
              variant="outline-warm"
              class="hidden md:inline-flex focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              @click="scrollToFeatures"
              @keydown.enter="scrollToFeatures"
              @keydown.space="scrollToFeatures"
              aria-label="了解更多关于Conan的功能特性"
              role="button"
              tabindex="0"
            >
              了解更多
            </Button>
            <Button
              size="sm"
              class="gap-2 group touch-optimized focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              @click="enterApp"
              @keydown.enter="enterApp"
              @keydown.space="enterApp"
              aria-label="立即体验Conan应用"
              role="button"
              tabindex="0"
            >
              立即体验
              <ArrowRight
                class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="relative z-10">
      <!-- 英雄区域 - 温暖友好的欢迎界面 -->
      <section class="relative py-20 sm:py-24 lg:py-32 overflow-hidden">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto text-center">
            <!-- 品牌标识动画 -->
            <div class="inline-block relative mb-8">
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 rounded-full blur-2xl animate-pulse-gentle"
              ></div>
              <div
                class="relative p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 backdrop-blur-sm"
              >
                <div class="flex items-center justify-center gap-3">
                  <Globe class="h-12 w-12 text-primary animate-spin-slow" />
                  <div
                    class="h-12 w-1 bg-gradient-to-b from-primary/30 to-secondary/30 rounded-full"
                  ></div>
                  <div class="text-left">
                    <div class="text-lg font-bold text-foreground">Conan</div>
                    <div class="text-xs text-muted-foreground">
                      个人数字伙伴
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 主标题 -->
            <h1
              class="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up"
            >
              <span class="block">你的温暖友好</span>
              <span class="block mt-2">
                <span
                  class="text-gradient bg-gradient-to-r from-primary via-primary/80 to-warm-600 animate-gradient-shift"
                >
                  个人数字伙伴
                </span>
              </span>
            </h1>

            <!-- 副标题 -->
            <p
              class="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in-up"
              style="animation-delay: 0.1s"
            >
              专注于实用工具，让数字生活更温暖、更高效、更愉悦
            </p>

            <!-- 行动号召按钮 -->
            <div
              class="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up"
              style="animation-delay: 0.2s"
              role="group"
              aria-label="主要行动号召按钮"
            >
              <Button
                size="lg"
                class="gap-3 group btn-warm touch-optimized focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                @click="enterApp"
                @keydown.enter="enterApp"
                @keydown.space="enterApp"
                aria-label="开始免费体验Conan应用"
                role="button"
                tabindex="0"
              >
                <div class="relative">
                  <div
                    class="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-500"
                  ></div>
                  <Rocket class="h-5 w-5 relative" aria-hidden="true" />
                </div>
                开始免费体验
                <ArrowRight
                  class="h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110"
                  aria-hidden="true"
                />
              </Button>
              <Button
                size="lg"
                variant="outline-warm"
                class="gap-2 group touch-optimized focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                @click="scrollToFeatures"
                @keydown.enter="scrollToFeatures"
                @keydown.space="scrollToFeatures"
                aria-label="探索Conan的功能特性"
                role="button"
                tabindex="0"
              >
                <Eye class="h-5 w-5" aria-hidden="true" />
                探索功能特性
                <ChevronDown
                  class="h-5 w-5 transition-transform duration-300 group-hover:translate-y-1"
                  aria-hidden="true"
                />
              </Button>
            </div>

            <!-- 信任徽章 -->
            <div
              class="inline-flex items-center gap-6 text-sm text-muted-foreground animate-fade-in-up"
              style="animation-delay: 0.3s"
            >
              <div class="flex items-center gap-2">
                <CheckCircle class="h-4 w-4 text-success" />
                <span>无需信用卡</span>
              </div>
              <div class="h-4 w-px bg-border"></div>
              <div class="flex items-center gap-2">
                <Shield class="h-4 w-4 text-info" />
                <span>数据安全存储</span>
              </div>
              <div class="h-4 w-px bg-border"></div>
              <div class="flex items-center gap-2">
                <Zap class="h-4 w-4 text-warning" />
                <span>快速上手</span>
              </div>
            </div>
          </div>

          <!-- 预览图占位符 -->
          <div class="mt-20 relative">
            <div
              class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"
            ></div>
            <div
              class="relative max-w-5xl mx-auto rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-8 shadow-xl animate-slide-up"
            >
              <div
                class="aspect-video rounded-lg bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-border/30 flex items-center justify-center"
              >
                <div class="text-center space-y-4">
                  <div
                    class="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20"
                  >
                    <Globe class="h-8 w-8 text-primary animate-spin-slow" />
                    <div class="text-left">
                      <div class="font-semibold text-foreground">
                        Conan 仪表盘预览
                      </div>
                      <div class="text-sm text-muted-foreground">
                        温暖友好的界面设计
                      </div>
                    </div>
                  </div>
                  <p class="text-sm text-muted-foreground max-w-md mx-auto">
                    这里是 Conan
                    应用的界面预览，展示了温暖友好的设计风格和直观的用户体验
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能特性区域 - 3D交互卡片 -->
      <section
        id="features"
        class="py-20 bg-gradient-to-b from-transparent to-warm-50/30 dark:to-warm-800/10"
      >
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-3xl mx-auto text-center mb-16">
            <h2
              class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 animate-fade-in-up"
            >
              专为<span class="text-primary">温暖友好</span>的数字体验设计
            </h2>
            <p
              class="text-lg text-muted-foreground animate-fade-in-up"
              style="animation-delay: 0.1s"
            >
              Conan
              专注于实用工具，为你提供高效温暖的数字工作伴侣
            </p>
          </div>

          <div class="flex justify-center">
            <!-- 工具卡片 -->
            <div
              class="group relative card-warm animate-fade-in-up focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              style="animation-delay: 0.2s"
              role="article"
              aria-labelledby="tool-card-title"
              tabindex="0"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>
              <div
                class="relative p-8 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm overflow-hidden"
              >
                <!-- 装饰性背景 -->
                <div
                  class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-16 translate-x-16"
                  aria-hidden="true"
                ></div>

                <!-- 图标区域 -->
                <div class="relative mb-6">
                  <div
                    class="absolute inset-0 bg-primary/10 rounded-xl blur-md group-hover:blur-lg transition-all duration-500"
                    aria-hidden="true"
                  ></div>
                  <div
                    class="relative inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl border border-primary/20"
                  >
                    <Wrench
                      class="h-10 w-10 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <!-- 内容 -->
                <h3
                  id="tool-card-title"
                  class="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300"
                >
                  实用工具集
                </h3>
                <p class="text-muted-foreground mb-6">
                  JSON
                  格式化、时间戳转换、编解码等日常开发工具，让技术工作更轻松愉快。
                </p>

                <!-- 功能列表 -->
                <ul class="space-y-2 mb-6" aria-label="工具集功能">
                  <li class="flex items-center gap-2 text-sm">
                    <CheckCircle
                      class="h-4 w-4 text-success"
                      aria-hidden="true"
                    />
                    <span>实时格式化预览</span>
                  </li>
                  <li class="flex items-center gap-2 text-sm">
                    <CheckCircle
                      class="h-4 w-4 text-success"
                      aria-hidden="true"
                    />
                    <span>批量处理支持</span>
                  </li>
                  <li class="flex items-center gap-2 text-sm">
                    <CheckCircle
                      class="h-4 w-4 text-success"
                      aria-hidden="true"
                    />
                    <span>历史记录保存</span>
                  </li>
                </ul>

                <!-- 悬停指示器 -->
                <div
                  class="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500"
                  aria-hidden="true"
                ></div>
              </div>
            </div>
          </div>

          <!-- 功能对比占位符 -->
          <div
            class="mt-20 text-center animate-fade-in-up"
            style="animation-delay: 0.5s"
          >
            <p class="text-sm text-muted-foreground mb-2">
              还有更多惊喜功能等你发现
            </p>
            <Button
              variant="ghost"
              size="sm"
              class="gap-2 group"
              @click="enterApp"
            >
              查看所有功能
              <ArrowRight
                class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          </div>
        </div>
      </section>

      <!-- 核心价值区域 -->
      <section
        id="values"
        class="py-20 bg-gradient-to-b from-warm-50/30 dark:from-warm-800/10 to-transparent"
      >
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-16">
              <h2
                class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 animate-fade-in-up"
              >
                为什么选择 <span class="text-primary">Conan</span>？
              </h2>
              <p
                class="text-lg text-muted-foreground animate-fade-in-up"
                style="animation-delay: 0.1s"
              >
                我们不只是打造工具，更是创造温暖友好的数字体验
              </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <!-- 左侧：价值主张 -->
              <div class="space-y-8 animate-slide-in-from-left">
                <div
                  class="flex items-start gap-4 p-6 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover-lift-sm"
                >
                  <div class="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
                    <Heart class="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold mb-2">温暖友好的设计</h3>
                    <p class="text-muted-foreground">
                      精心设计的温暖色调和柔和交互，让每一次使用都充满愉悦感。
                    </p>
                  </div>
                </div>

                <div
                  class="flex items-start gap-4 p-6 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover-lift-sm"
                >
                  <div class="flex-shrink-0 p-3 bg-secondary/10 rounded-lg">
                    <Zap class="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold mb-2">高效的工作流</h3>
                    <p class="text-muted-foreground">
                      无缝集成的工具链，减少上下文切换，让你的工作流程更加顺畅。
                    </p>
                  </div>
                </div>

                <div
                  class="flex items-start gap-4 p-6 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover-lift-sm"
                >
                  <div class="flex-shrink-0 p-3 bg-accent/10 rounded-lg">
                    <Shield class="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold mb-2">数据安全可靠</h3>
                    <p class="text-muted-foreground">
                      本地优先的数据存储，端到端加密，你的数据完全由你掌控。
                    </p>
                  </div>
                </div>
              </div>

              <!-- 右侧：视觉展示占位符 -->
              <div class="relative animate-slide-in-from-right">
                <div
                  class="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl blur-2xl"
                ></div>
                <div
                  class="relative p-8 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm"
                >
                  <div
                    class="aspect-square rounded-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-border/30 flex items-center justify-center"
                  >
                    <div class="text-center space-y-4 p-8">
                      <div
                        class="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20"
                      >
                        <Sparkles class="h-8 w-8 text-primary" />
                        <div class="text-left">
                          <div class="font-semibold text-foreground">
                            温暖体验
                          </div>
                          <div class="text-sm text-muted-foreground">
                            从每一个细节开始
                          </div>
                        </div>
                      </div>
                      <p class="text-sm text-muted-foreground max-w-xs mx-auto">
                        Conan
                        致力于打造温暖友好的数字环境，让你在高效工作的同时感受到愉悦和关怀
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 用户见证区域 -->
      <section
        id="testimonials"
        class="py-20 bg-gradient-to-b from-transparent to-warm-50/20 dark:to-warm-800/5"
      >
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto text-center mb-16">
            <h2
              class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 animate-fade-in-up"
            >
              听听<span class="text-primary">用户</span>怎么说
            </h2>
            <p
              class="text-lg text-muted-foreground animate-fade-in-up"
              style="animation-delay: 0.1s"
            >
              来自真实用户的温暖反馈，见证Conan如何改变他们的数字生活
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- 见证卡片 1 -->
            <div
              class="group relative card-warm animate-fade-in-up"
              style="animation-delay: 0.2s"
              role="article"
              aria-labelledby="testimonial-1-title"
              tabindex="0"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>
              <div
                class="relative p-8 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm overflow-hidden"
              >
                <!-- 装饰性背景 -->
                <div
                  class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-16 translate-x-16"
                  aria-hidden="true"
                ></div>

                <!-- 用户信息 -->
                <div class="flex items-center gap-4 mb-6">
                  <div class="relative">
                    <div
                      class="absolute inset-0 bg-primary/10 rounded-full blur-md"
                      aria-hidden="true"
                    ></div>
                    <div
                      class="relative w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full border border-primary/20 flex items-center justify-center"
                    >
                      <span class="text-lg font-bold text-primary">张</span>
                    </div>
                  </div>
                  <div class="text-left">
                    <h3
                      id="testimonial-1-title"
                      class="font-semibold text-foreground"
                    >
                      张明
                    </h3>
                    <p class="text-sm text-muted-foreground">软件工程师</p>
                  </div>
                </div>

                <!-- 见证内容 -->
                <div class="relative">
                  <div
                    class="absolute -top-3 -left-3 text-4xl text-primary/20"
                    aria-hidden="true"
                  >
                    "
                  </div>
                  <p class="text-muted-foreground italic">
                    Conan让我的工作流程变得如此顺畅。特别是JSON格式化工具，每天节省我大量时间。温暖的设计让长时间工作也不觉得累。
                  </p>
                  <div
                    class="absolute -bottom-3 -right-3 text-4xl text-primary/20"
                    aria-hidden="true"
                  >
                    "
                  </div>
                </div>

                <!-- 评分 -->
                <div class="mt-6 flex items-center gap-1">
                  <div
                    v-for="star in 5"
                    :key="star"
                    class="w-4 h-4 text-warning fill-current"
                  >
                    ★
                  </div>
                </div>
              </div>
            </div>

            <!-- 见证卡片 2 -->
            <div
              class="group relative card-warm animate-fade-in-up"
              style="animation-delay: 0.3s"
              role="article"
              aria-labelledby="testimonial-2-title"
              tabindex="0"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>
              <div
                class="relative p-8 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm overflow-hidden"
              >
                <!-- 装饰性背景 -->
                <div
                  class="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -translate-y-16 translate-x-16"
                  aria-hidden="true"
                ></div>

                <!-- 用户信息 -->
                <div class="flex items-center gap-4 mb-6">
                  <div class="relative">
                    <div
                      class="absolute inset-0 bg-secondary/10 rounded-full blur-md"
                      aria-hidden="true"
                    ></div>
                    <div
                      class="relative w-12 h-12 bg-gradient-to-br from-secondary/15 to-secondary/5 rounded-full border border-secondary/20 flex items-center justify-center"
                    >
                      <span class="text-lg font-bold text-secondary">李</span>
                    </div>
                  </div>
                  <div class="text-left">
                    <h3
                      id="testimonial-2-title"
                      class="font-semibold text-foreground"
                    >
                      李思雨
                    </h3>
                    <p class="text-sm text-muted-foreground">产品设计师</p>
                  </div>
                </div>

                <!-- 见证内容 -->
                <div class="relative">
                  <div
                    class="absolute -top-3 -left-3 text-4xl text-secondary/20"
                    aria-hidden="true"
                  >
                    "
                  </div>
                  <p class="text-muted-foreground italic">
                    作为一个设计师，我特别注重工具的美观度。Conan的温暖友好设计让我爱不释手，工具集帮我提高了工作效率。
                  </p>
                  <div
                    class="absolute -bottom-3 -right-3 text-4xl text-secondary/20"
                    aria-hidden="true"
                  >
                    "
                  </div>
                </div>

                <!-- 评分 -->
                <div class="mt-6 flex items-center gap-1">
                  <div
                    v-for="star in 5"
                    :key="star"
                    class="w-4 h-4 text-warning fill-current"
                  >
                    ★
                  </div>
                </div>
              </div>
            </div>

            <!-- 见证卡片 3 -->
            <div
              class="group relative card-warm animate-fade-in-up"
              style="animation-delay: 0.4s"
              role="article"
              aria-labelledby="testimonial-3-title"
              tabindex="0"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>
              <div
                class="relative p-8 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm overflow-hidden"
              >
                <!-- 装饰性背景 -->
                <div
                  class="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -translate-y-16 translate-x-16"
                  aria-hidden="true"
                ></div>

                <!-- 用户信息 -->
                <div class="flex items-center gap-4 mb-6">
                  <div class="relative">
                    <div
                      class="absolute inset-0 bg-accent/10 rounded-full blur-md"
                      aria-hidden="true"
                    ></div>
                    <div
                      class="relative w-12 h-12 bg-gradient-to-br from-accent/15 to-accent/5 rounded-full border border-accent/20 flex items-center justify-center"
                    >
                      <span class="text-lg font-bold text-accent">王</span>
                    </div>
                  </div>
                  <div class="text-left">
                    <h3
                      id="testimonial-3-title"
                      class="font-semibold text-foreground"
                    >
                      王浩然
                    </h3>
                    <p class="text-sm text-muted-foreground">学生开发者</p>
                  </div>
                </div>

                <!-- 见证内容 -->
                <div class="relative">
                  <div
                    class="absolute -top-3 -left-3 text-4xl text-accent/20"
                    aria-hidden="true"
                  >
                    "
                  </div>
                  <p class="text-muted-foreground italic">
                    作为学生，Conan的免费工具集对我来说太实用了。时间戳转换和Base64编解码功能在学习Web开发时帮了大忙。
                  </p>
                  <div
                    class="absolute -bottom-3 -right-3 text-4xl text-accent/20"
                    aria-hidden="true"
                  >
                    "
                  </div>
                </div>

                <!-- 评分 -->
                <div class="mt-6 flex items-center gap-1">
                  <div
                    v-for="star in 5"
                    :key="star"
                    class="w-4 h-4 text-warning fill-current"
                  >
                    ★
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 更多见证提示 -->
          <div class="mt-16 text-center animate-fade-in-up" style="animation-delay: 0.5s">
            <p class="text-sm text-muted-foreground mb-4">
              还有更多用户正在分享他们的温暖体验
            </p>
            <Button
              variant="ghost"
              size="sm"
              class="gap-2 group"
              @click="scrollToTestimonials"
            >
              查看更多见证
              <ArrowRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      <!-- 最终行动号召 -->
      <section class="py-20">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-4xl mx-auto text-center">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl blur-3xl"
              ></div>
              <div
                class="relative p-12 rounded-3xl border border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm"
              >
                <h2
                  class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
                >
                  准备好开启你的
                  <span
                    class="text-gradient bg-gradient-to-r from-primary via-primary/80 to-warm-600"
                  >
                    温暖数字旅程
                  </span>
                  了吗？
                </h2>
                <p
                  class="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
                >
                  加入数千名用户的行列，体验 Conan
                  带来的温暖友好、高效愉悦的数字生活
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    class="gap-3 group btn-warm animate-heartbeat"
                    @click="enterApp"
                  >
                    <Rocket class="h-5 w-5" />
                    立即免费开始
                    <ArrowRight
                      class="h-5 w-5 transition-all duration-300 group-hover:translate-x-2"
                    />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline-warm"
                    class="gap-2 group"
                    @click="scrollToFeatures"
                  >
                    <Info class="h-5 w-5" />
                    了解更多详情
                  </Button>
                </div>
                <p class="mt-8 text-sm text-muted-foreground">
                  无需信用卡 · 14天免费试用 · 随时取消
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 温暖友好的页脚 -->
    <footer
      class="border-t border-border/50 bg-background"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          class="flex flex-col md:flex-row justify-between items-center gap-8"
        >
          <!-- 品牌信息 -->
          <div class="text-center md:text-left">
            <div
              class="flex items-center gap-3 justify-center md:justify-start mb-4"
            >
              <div class="p-2 bg-primary/10 rounded-lg">
                <Globe class="h-5 w-5 text-primary" />
              </div>
              <h3 class="text-lg font-bold text-gradient">Conan</h3>
            </div>
            <p class="text-sm text-muted-foreground max-w-md">
              你的温暖友好个人数字伙伴，让技术服务于人，让数字生活更愉悦。
            </p>
          </div>

          <!-- 链接 -->
          <div class="flex flex-wrap justify-center gap-8">
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-foreground">产品</h4>
              <div class="space-y-2">
                <a
                  href="#features"
                  class="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 link-warm no-underline"
                  @click.prevent="scrollToFeatures"
                  >功能特性</a
                >
                <a
                  href="#values"
                  class="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 link-warm no-underline"
                  >核心价值</a
                >
                <a
                  href="#"
                  class="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 link-warm no-underline"
                  >定价</a
                >
              </div>
            </div>
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-foreground">资源</h4>
              <div class="space-y-2">
                <a
                  href="#"
                  class="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 link-warm no-underline"
                  >文档</a
                >
                <a
                  href="#"
                  class="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 link-warm no-underline"
                  >博客</a
                >
                <a
                  href="#"
                  class="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 link-warm no-underline"
                  >支持</a
                >
              </div>
            </div>
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-foreground">公司</h4>
              <div class="space-y-2">
                <a
                  href="#"
                  class="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 link-warm no-underline"
                  >关于我们</a
                >
                <a
                  href="#"
                  class="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 link-warm no-underline"
                  >职业</a
                >
                <a
                  href="#"
                  class="block text-sm text-muted-foreground hover:text-primary transition-colors duration-300 link-warm no-underline"
                  >联系</a
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 版权信息 -->
        <div class="mt-12 pt-8 border-t border-border/30 text-center">
          <p class="text-sm text-muted-foreground">
            © 2026 Conan. 保留所有权利。致力于打造温暖友好的数字体验。
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import {
  Globe,
  ArrowRight,
  Wrench,
  Rocket,
  Eye,
  ChevronDown,
  CheckCircle,
  Shield,
  Zap,
  Heart,
  Sparkles,
  Info,
} from 'lucide-vue-next';
import ThemeToggle from '@/components/theme-toggle.vue';

const router = useRouter();
const scrollY = ref(0);

const enterApp = async () => {
  // 检查是否已登录，如果未登录则跳转到登录页
  try {
    const { useAuthStore } = await import('@/stores/auth');
    const authStore = useAuthStore();
    await authStore.fetchUser();
    if (authStore.isAuthenticated) {
      router.push('/app');
    } else {
      router.push('/login');
    }
  } catch {
    router.push('/login');
  }
};

// 工具函数：防抖
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 工具函数：节流
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const scrollToFeatures = () => {
  const featuresElement = document.getElementById('features');
  if (featuresElement) {
    featuresElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

const scrollToTestimonials = () => {
  const testimonialsElement = document.getElementById('testimonials');
  if (testimonialsElement) {
    testimonialsElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

const scrollToValues = () => {
  const valuesElement = document.getElementById('values');
  if (valuesElement) {
    valuesElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

// 使用requestAnimationFrame优化视差滚动效果
let lastScrollY = 0;
let animationFrameId: number | null = null;

const handleScroll = () => {
  const currentScrollY = window.scrollY;

  // 如果滚动变化很小，跳过更新
  if (Math.abs(currentScrollY - lastScrollY) < 1) return;

  lastScrollY = currentScrollY;

  // 使用requestAnimationFrame进行优化
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(() => {
    scrollY.value = currentScrollY;

    // 更新视差元素的位置
    const parallaxElements = document.querySelectorAll('.parallax-element');
    parallaxElements.forEach((element) => {
      const speed = parseFloat(element.getAttribute('data-speed') || '0.1');
      const yPos = -(currentScrollY * speed);

      // 使用transform3d启用GPU加速
      (element as HTMLElement).style.transform = `translate3d(0, ${yPos}px, 0)`;
    });

    animationFrameId = null;
  });
};

// 使用节流优化鼠标移动效果
const handleMouseMove = throttle((e: MouseEvent) => {
  const { clientX, clientY } = e;
  const x = (clientX / window.innerWidth - 0.5) * 10; // 减少移动幅度
  const y = (clientY / window.innerHeight - 0.5) * 10;

  const interactiveElements = document.querySelectorAll('.interactive-element');
  interactiveElements.forEach((element) => {
    // 使用transform3d启用GPU加速
    (element as HTMLElement).style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}, 32); // 约30fps的节流

// 触摸交互优化
const handleTouchStart = (e: TouchEvent) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains('touch-optimized')) {
    target.classList.add('active-press');
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains('touch-optimized')) {
    target.classList.remove('active-press');
  }
};

// 响应式检测
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  // 使用防抖优化resize事件
  const debouncedCheckMobile = debounce(checkMobile, 150);
  const throttledHandleScroll = throttle(handleScroll, 16); // 约60fps

  window.addEventListener('scroll', throttledHandleScroll, { passive: true });
  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('resize', debouncedCheckMobile, { passive: true });

  // 保存清理函数引用
  const cleanupFunctions = {
    scroll: () => window.removeEventListener('scroll', throttledHandleScroll),
    mousemove: () => window.removeEventListener('mousemove', handleMouseMove),
    touchstart: () =>
      window.removeEventListener('touchstart', handleTouchStart),
    touchend: () => window.removeEventListener('touchend', handleTouchEnd),
    resize: () => window.removeEventListener('resize', debouncedCheckMobile),
  };

  // 在组件实例上保存清理函数
  (window as any).__landingCleanup = cleanupFunctions;

  // 初始检查
  checkMobile();
  handleScroll(); // 初始更新视差效果
});

onUnmounted(() => {
  // 清理所有事件监听器
  const cleanup = (window as any).__landingCleanup;
  if (cleanup) {
    Object.values(cleanup).forEach((cleanupFn: any) => {
      if (typeof cleanupFn === 'function') cleanupFn();
    });
    delete (window as any).__landingCleanup;
  }

  // 清理动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // 清理滚动位置追踪
  lastScrollY = 0;
});
</script>
