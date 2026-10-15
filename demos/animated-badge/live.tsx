import { AnimatedBadge } from "@/components/ikas/animated-badge"

export default function AnimatedBadgeLive() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AnimatedBadge status="success" media="dot" pulse>
        Canlı
      </AnimatedBadge>
      <AnimatedBadge status="info" media="dot" pulse>
        Akış açık
      </AnimatedBadge>
      <AnimatedBadge status="loading">Eşitleniyor</AnimatedBadge>
    </div>
  )
}
