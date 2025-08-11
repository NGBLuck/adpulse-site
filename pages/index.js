import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

export default function Home() {
  const heroRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // GSAP hero text animation
    const ctx = gsap.context(() => {
      gsap.from('.headline', { y: 30, opacity: 0, duration: 0.8, stagger: 0.12 })
      gsap.from('.subline', { y: 10, opacity: 0, duration: 0.8, delay: 0.2 })
      gsap.to('.cta', { scale: 1.03, repeat: -1, yoyo: true, duration: 1.8, ease: 'sine.inOut', opacity: 1 })
    }, heroRef)

    // THREE.js enhanced scene (particles + soft motion)
    const canvas = canvasRef.current
    let renderer, scene, camera, particles, rafId
    if (canvas) {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
      camera.position.z = 2.5

      // Particles
      const count = 1200
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(count * 3)
      const sizes = new Float32Array(count)
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 6
        positions[i * 3 + 1] = (Math.random() - 0.5) * 3
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4
        sizes[i] = 2 + Math.random() * 6
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

      const material = new THREE.PointsMaterial({ size: 0.06, transparent: true, opacity: 0.85, depthWrite: false })
      material.blending = THREE.AdditiveBlending
      material.color = new THREE.Color(0x06b6d4)

      particles = new THREE.Points(geometry, material)
      scene.add(particles)

      // Lights for subtle shading
      scene.add(new THREE.AmbientLight(0xffffff, 0.4))
      const dir = new THREE.DirectionalLight(0xffffff, 0.6)
      dir.position.set(5, 5, 5)
      scene.add(dir)

      const onResize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      let t = 0
      const loop = () => {
        t += 0.006
        particles.rotation.y = t * 0.3
        particles.rotation.x = Math.sin(t * 0.2) * 0.05
        material.opacity = 0.7 + Math.sin(t * 0.8) * 0.15
        renderer.render(scene, camera)
        rafId = requestAnimationFrame(loop)
      }
      loop()
    }

    return () => {
      ctx.revert()
      if (rafId) cancelAnimationFrame(rafId)
    }

  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = Object.fromEntries(form.entries())
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        alert('Спасибо! Заявка отправлена.')
        e.target.reset()
      } else {
        alert('Ошибка отправки, попробуйте позже.')
      }
    } catch (err) {
      console.error(err)
      alert('Ошибка соединения.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060617] to-[#0b0b1b] text-gray-100">
      <header className="max-w-7xl mx-auto p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent1 to-accent2 flex items-center justify-center text-black font-bold">AP</div>
          <div>
            <div className="font-bold">AdPulse</div>
            <div className="text-xs text-gray-400">Маркетинговое ателье</div>
          </div>
        </div>
        <nav className="hidden md:flex gap-6 text-sm text-gray-300">
          <a href="#services" className="hover:text-white">Услуги</a>
          <a href="#cases" className="hover:text-white">Кейсы</a>
          <a href="#contact" className="hover:text-white">Контакты</a>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6" ref={heroRef}>
        <section className="grid md:grid-cols-2 gap-8 items-center py-12">
          <div>
            <h1 className="headline text-4xl lg:text-5xl font-extrabold leading-tight">Ваш B2B-канал на пике эффективности<br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-accent1 to-accent2">Яндекс.Директ • Google Ads</span></h1>
            <p className="subline mt-4 text-gray-400 max-w-xl">AdPulse — маркетинговое ателье. Аудит, настройка, ведение и аналитика — единый цикл для роста лидов.</p>
            <div className="mt-6 flex gap-3">
              <a href="#contact" className="cta inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-accent1 to-accent2 text-black">Получить аудит</a>
              <a href="#services" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10">Услуги</a>
            </div>
          </div>

          <aside className="bg-white/3 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="font-semibold">Запрос консультации</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3" >
              <input name="name" placeholder="Ваше имя" className="w-full p-3 rounded-md bg-transparent border border-white/10" required />
              <input name="phone" placeholder="Телефон" className="w-full p-3 rounded-md bg-transparent border border-white/10" required />
              <select name="service" className="w-full p-3 rounded-md bg-transparent border border-white/10">
                <option value="">Выберите услугу</option>
                <option value="audit">Аудит РК</option>
                <option value="setup">Настройка</option>
              </select>
              <button className="w-full px-4 py-3 rounded-md bg-gradient-to-r from-accent1 to-accent2 text-black font-semibold">Отправить</button>
            </form>
            <canvas ref={canvasRef} className="w-full h-40 mt-4" />
          </aside>
        </section>

        <section id="services" className="py-12">
          <h2 className="text-2xl font-bold mb-6">Услуги</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-white/3"> 
              <h3 className="font-semibold">Аудит РК</h3>
              <p className="text-gray-400 text-sm mt-2">Анализ, рекомендации, roadmap.</p>
            </div>
            <div className="p-5 rounded-xl bg-white/3"> 
              <h3 className="font-semibold">Настройка с нуля</h3>
              <p className="text-gray-400 text-sm mt-2">Сбор семантики, объявления, метки.</p>
            </div>
            <div className="p-5 rounded-xl bg-white/3"> 
              <h3 className="font-semibold">Ведение рекламы</h3>
              <p className="text-gray-400 text-sm mt-2">Оптимизация, отчёты, масштаб.</p>
            </div>
          </div>
        </section>

        <section id="cases" className="py-12">
          <h2 className="text-2xl font-bold mb-6">Кейсы</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <article className="p-6 rounded-xl bg-white/3">
              <h4 className="font-semibold">E‑commerce: рост продаж на 200%</h4>
              <p className="text-gray-400 mt-2">Оптимизация Google Ads — увеличение конверсий при сохранении бюджета.</p>
            </article>
            <article className="p-6 rounded-xl bg-white/3">
              <h4 className="font-semibold">B2B: снижение CPL на 40%</h4>
              <p className="text-gray-400 mt-2">Перенастройка Яндекс.Директ и таргетинг — качественные лиды.</p>
            </article>
          </div>
        </section>

        <section id="contact" className="py-12 max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">Контакты</h2>
          <p className="text-gray-400">Или: <a href="tel:+78001234567" className="text-accent1">+7 (800) 123-45-67</a> • <a href="mailto:info@adagency.ru" className="text-accent1">info@adagency.ru</a></p>
        </section>
      </main>

      <footer className="py-8 text-center text-gray-500">© 2025 AdPulse</footer>
    </div>
  )
}