import Image from 'next/image'
import HeaderServer from '@/components/ui/HeaderServer'
import Footer from '@/components/ui/Footer'
import { leadership, coachingStaff, StaffMember } from '@/data/staff'

export const metadata = {
  title: 'About Us | Philadelphia Little Quakers',
  description: 'Meet the coaches and staff behind the Philadelphia Little Quakers all-star football program.',
}

function StaffCard({ member }: { member: StaffMember }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-14 h-14 rounded-full bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
          {member.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[#B8962A] font-black text-lg">{member.initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg leading-tight">{member.name}</h3>
          <p className="text-[#B8962A] font-semibold text-sm">{member.title}</p>
          {member.subtitle && (
            <p className="text-gray-500 text-xs mt-0.5">{member.subtitle}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {member.alumni && (
              <span className="text-xs bg-[#0A0A0A] text-[#B8962A] px-2 py-0.5 rounded-full font-semibold">
                {member.alumni}
              </span>
            )}
            {member.tenure && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                {member.tenure}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-gray-600 text-sm mt-4 leading-relaxed">{member.bio}</p>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderServer />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-[#0A0A0A] text-white py-24 px-4 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/lockedarmsLQ.jpg"
              alt="Little Quakers players"
              fill
              className="object-cover object-center opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>
          <div className="relative max-w-6xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">The Program</p>
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Built by People<br />Who Lived It
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl leading-relaxed">
              Our coaches aren't hired guns. They're alumni, fathers, and lifelong volunteers. People who played for this program, built careers around football, and came back to give the next generation what they were given.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-[#B8962A] py-10 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-white text-center">
            {[
              { stat: '73+', label: 'Years of Football', sub: 'Est. 1953' },
              { stat: '200+', label: 'Combined Years', sub: 'Coaching experience on staff' },
              { stat: '100%', label: 'Alumni-Driven', sub: 'Coaches who played in this program' },
            ].map(({ stat, label, sub }) => (
              <div key={label}>
                <p className="text-4xl font-black">{stat}</p>
                <p className="font-bold text-lg">{label}</p>
                <p className="text-white/70 text-sm">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">Who We Are</p>
            <h2 className="text-4xl font-black mb-6 leading-tight">A Philadelphia tradition, free to every family.</h2>
            <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
              <p>
                Started in 1953, the Little Quakers is a Philadelphia-based youth football organization with a single mission: opportunity. In a world where elite youth football costs families thousands of dollars a year, the Little Quakers remain an outlier, delivering a world-class experience at $0 cost.
              </p>
              <p>
                The program endures because of two groups of people: the former Little Quakers who never forgot, and the major corporate partners who choose to invest in a Philadelphia tradition.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-20 px-4 bg-[#F5F4F0]">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">Organization</p>
            <h2 className="text-4xl font-black mb-10">Leadership</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {leadership.map(member => (
                <StaffCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Coaching Staff */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <p className="text-[#B8962A] font-bold uppercase tracking-widest text-sm mb-3">On the Field</p>
            <h2 className="text-4xl font-black mb-4">Coaching Staff</h2>
            <p className="text-gray-500 text-lg mb-10 max-w-2xl">
              A staff built on tenure, credentials, and the kind of commitment you can't hire. It comes from having played in this program yourself.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {coachingStaff.map(member => (
                <StaffCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Team photo strip — Option A: show entire photo, no cropping */}
        <section className="bg-[#0A0A0A]">
          <div className="relative w-full aspect-[3/2] md:aspect-[16/9] max-h-[80vh] bg-[#0A0A0A]">
            <Image
              src="/2026teamphoto.jpg"
              alt="Little Quakers team photo"
              fill
              className="object-contain"
            />
          </div>
          <div className="bg-[#B8962A] py-5 text-center">
            <p className="text-white text-2xl md:text-3xl font-black tracking-wide">ONE TEAM. ONE CITY.</p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0A0A0A] py-16 px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Join the Legacy?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Register for tryouts and earn your place on a team coached by people who have dedicated their lives to this program.
          </p>
          <a href="/register" className="btn-primary text-lg px-10 py-4">
            Register for Tryouts
          </a>
        </section>

      </main>
      <Footer />
    </div>
  )
}
