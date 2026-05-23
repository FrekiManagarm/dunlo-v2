import { Star } from "lucide-react";
import { FadeIn } from "./shared";

const TESTIMONIALS = [
  {
    name: "Raphaël Bernstein",
    role: "CTO, Meridian Analytics",
    avatar: "RB",
    text: "We were losing roughly €8k/month to failed cards. Within two weeks of activating Dunlo, we recovered over €6,200. The founder escalation feature alone paid for the tool ten times over.",
  },
  {
    name: "Valeria Cortez",
    role: "Founder, Volta Cloud",
    avatar: "VC",
    text: "I spent months manually chasing failed payments. Dunlo just handles it. The email sequences feel genuinely personal — customers don't realize they're automated.",
  },
  {
    name: "Sven Richter",
    role: "Head of Revenue, Praxis Labs",
    avatar: "SR",
    text: "Setup was 4 minutes flat. The failure-type detection is smart — our bank decline recovery rate jumped from 31% to 67% in the first month.",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={13} className="fill-dunlo text-dunlo" />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {TESTIMONIALS.map((t, i) => (
        <FadeIn key={t.name} i={i} className="flex flex-col">
          <div className="flex h-full flex-col rounded-3xl border border-gray-200/60 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.role}</p>
              </div>
            </div>
            <StarRating />
            <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
              "{t.text}"
            </p>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
