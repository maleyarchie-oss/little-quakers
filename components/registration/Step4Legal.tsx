'use client'

import { useState } from 'react'
import { FormData } from './RegistrationForm'

interface Props {
  data: FormData
  update: (fields: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

function AgreementSection({
  title, children, checked, onChange
}: { title: string; children: React.ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border-2 rounded-xl transition-colors ${checked ? 'border-green-400' : 'border-gray-200'}`}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-bold text-base">{title}</span>
        <span className="text-gray-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed max-h-60 overflow-y-auto mb-4">
            {children}
          </div>
        </div>
      )}
      <div className="px-5 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`w-7 h-7 rounded border-2 flex items-center justify-center font-bold text-white transition-colors flex-shrink-0 ${
            checked ? 'bg-[#B8962A] border-[#B8962A]' : 'bg-white border-gray-300'
          }`}
        >
          {checked && '✓'}
        </button>
        <span className="text-sm font-medium text-gray-700">
          I have read and agree to the {title}
        </span>
      </div>
    </div>
  )
}

export default function Step4Legal({ data, update, onNext, onBack }: Props) {
  const allAgreed = data.agreed_code_of_conduct && data.agreed_medical_release && data.agreed_photo_release

  return (
    <div className="card">
      <h2 className="text-2xl font-black mb-1">Legal Agreements</h2>
      <p className="text-gray-500 mb-6 text-sm">
        Please read and agree to all three documents to continue. Click each title to expand and read.
      </p>

      <div className="flex flex-col gap-4">
        <AgreementSection
          title="Code of Conduct"
          checked={data.agreed_code_of_conduct}
          onChange={v => update({ agreed_code_of_conduct: v })}
        >
          <p className="font-semibold mb-3">As a member of the Philadelphia Little Quakers you are expected to represent the organization with class and integrity. You have now become a role model for your teammates, your neighborhood friends, and your brothers &amp; sisters. We need you &amp; your parent(s) to read the following Code of Conduct, understand the rules and click indicating that you will follow them:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Be prepared both mentally &amp; physically to perform at your best at practices, team functions and games. Do not let your schoolwork suffer.</li>
            <li>Always listen &amp; obey directions from coaches and chaperones. Do what you are asked the first time.</li>
            <li>You are responsible to obey the dress code established by your chaperones (Team ¼ Zips, Khakis and White Shirt when we travel).</li>
            <li>Be respectful to your teammates, coaches, chaperones and those people around you (thank you, no sir, pardon me, etc.). You are now part of the Philadelphia Little Quaker history and we expect professional behavior.</li>
            <li>Misbehavior, foul language and repeated lateness WILL NOT be tolerated.</li>
            <li>Absolutely no smoking, vaping, or consumption of alcohol is permitted.</li>
            <li>You are responsible for being on-time to all team functions. Missing a team function may lead to you not playing in the game.</li>
            <li>When traveling, if a player is found outside of his room after room check, he is subject to not playing in the game or being sent home at his family&apos;s expense.</li>
            <li>Our #1 Goal when the team travels is to improve as a football team and win the game. Be professional.</li>
          </ol>
        </AgreementSection>

        <AgreementSection
          title="Medical Consent & Liability Waiver"
          checked={data.agreed_medical_release}
          onChange={v => update({ agreed_medical_release: v })}
        >
          <p className="font-semibold mb-2">Medical Consent &amp; Emergency Treatment Authorization</p>
          <p className="mb-3">I, the parent/legal guardian of the above-named participant, hereby give permission for my child to participate in all activities related to the Little Quakers Football Team, including practices, games, and travel. I understand that participation in football involves risk of injury, including serious injury. In the event of an emergency, I authorize the Little Quakers staff, coaches, or volunteers to obtain medical treatment for my child from a licensed physician, hospital, or medical provider, including emergency care, anesthesia, and/or surgery, if necessary. I accept full responsibility for all medical costs incurred as a result of injury or illness sustained during participation.</p>
          <p className="font-semibold mb-2">Liability Waiver</p>
          <p className="mb-3">I acknowledge and fully understand that football is a contact sport that carries with it the risk of injury. In consideration of my child&apos;s participation, I hereby release, waive, discharge, and hold harmless the Little Quakers Football Team, its officers, directors, coaches, staff, volunteers, and affiliated entities from any and all liability, claims, demands, losses, or damages arising out of or related to any injury, illness, or accident that may occur during participation in team activities. This release includes, without limitation, injuries resulting from equipment, field conditions, weather, travel, or actions of other participants.</p>
          <p className="font-semibold">Acknowledgment</p>
          <p>I have read and fully understand this medical release and liability waiver. I voluntarily agree to its terms.</p>
        </AgreementSection>

        <AgreementSection
          title="Photo Release"
          checked={data.agreed_photo_release}
          onChange={v => update({ agreed_photo_release: v })}
        >
          <p className="mb-3">In consideration of my engagement as a member of the Philadelphia Little Quakers, I hereby grant to the Photographers assigned by the Little Quakers, Inc Organization, their legal representatives and assigns, the irrevocable and unrestricted right and permission to copyright, use, re-use, publish, and re-publish photographic portraits or pictures of me or in which I may be included, in whole or in part, without restriction as to changes or alterations, in conjunction with my own or a fictitious name, or reproductions thereof in color or otherwise, made through any medium at his/her studios or elsewhere, and in any and all media now or hereafter known for illustration, promotion, art, editorial, advertising, trade, or any other purpose whatsoever.</p>
          <p className="mb-3">I hereby waive any right that I may have to inspect or approve the finished product and the advertising copy or other matter that may be used in connection therewith.</p>
          <p>I hereby release, discharge and agree to save harmless the Little Quakers Inc Organization and Photographer, their heirs, legal representatives and assigns from any liability, including without limitation any claims for libel or invasion of privacy. I am of full age or the legal guardian for the person shown and have read the above authorization, release, and agreement. This release shall be binding upon me and my heirs, legal representatives, and assigns.</p>
        </AgreementSection>
      </div>

      <div className="mt-8 flex justify-between">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <button
          className="btn-primary"
          disabled={!allAgreed}
          onClick={onNext}
          style={{ opacity: allAgreed ? 1 : 0.5 }}
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}
