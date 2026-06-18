export type StaffMember = {
  name: string
  title: string
  subtitle?: string
  bio: string
  initials: string
  alumni?: string
  tenure?: string
  photo?: string
}

export const leadership: StaffMember[] = [
  {
    name: 'PJ Maley',
    title: 'President',
    initials: 'PJ',
    bio: "PJ was a 1982 Little Quaker and took the reins 5 years ago. He oversees all program operations, sponsorships, finance, and community relationships. For him, it's an honor to carry on the Little Quaker tradition.",
  },
  {
    name: 'Keshina Bouie',
    title: 'VP, Team Operations',
    subtitle: '"Mama Bouie"',
    initials: 'KB',
    photo: '/coachkeshina.jpg',
    tenure: '4 years',
    bio: 'Known affectionately as "Mama Bouie," Keshina owns communications, guest speakers, event planning, and the annual away trip. Her fingerprints are on every part of the season — she\'s the engine that makes it all run.',
  },
  {
    name: 'Anthony Bouie',
    title: 'Digital Director',
    initials: 'AB',
    bio: 'Anthony serves as the program\'s Digital Director, handling team photography, media day portraits, and the annual Little Quaker Yearbook presented to every family at the spring banquet.',
  },
]

export const coachingStaff: StaffMember[] = [
  {
    name: 'Chris Rahill',
    title: 'Head Coach',
    photo: '/coachrahill.jpg',
    initials: 'CR',
    alumni: 'LQ Class of 1995',
    tenure: '10 years',
    bio: "Chris came up through the Little Quakers as a player (Class of 1995) and has led the program as Head Coach for 10 years. Following his playing career at Ursinus College, Chris has 23 years of high-school and college coaching experience. An offensive-minded tactician with a deep football IQ, he is the living definition of 'Once a Little Quaker, always a Little Quaker.'",
  },
  {
    name: 'Joe Spera',
    title: 'Defensive Coordinator',
    subtitle: 'Decades of high school coaching experience',
    initials: 'JS',
    tenure: '20 years',
    bio: "Joe brings 20 years of Little Quakers experience to the defensive side of the ball. Joe has been coaching at the high school level for decades, a credential that signals the seriousness he brings to our sideline. Players and parents alike consistently name him a favorite.",
  },
  {
    name: 'Rick "Hollywood" Mellor',
    title: 'Defensive Coach',
    initials: 'RM',
    alumni: 'LQ Class of 1963',
    tenure: '50 years',
    bio: 'Coach Mellor first played for the Little Quakers in 1963 and has been part of the program for 50 years. His nickname "Hollywood" comes with good reason — Coach Mellor is the inspiration behind the character Coach Mellor on the ABC sitcom The Goldbergs, a long-running Philly-set show that used his name and likeness.',
  },
  {
    name: 'John Loughery',
    title: 'Quarterbacks Coach',
    initials: 'JL',
    alumni: 'LQ Class of 1973',
    tenure: '40 years',
    bio: 'John played for the Little Quakers in 1973 and went on to play college football at Boston College. He has spent the last 40 years developing Little Quakers quarterbacks — a 53-year relationship with a single organization that speaks for itself.',
  },
  {
    name: 'Mike "Neeko" Hnatkowski',
    title: 'Quarterbacks Coach',
    subtitle: 'All-American, Muhlenberg College',
    initials: 'MH',
    alumni: 'LQ Class of 2013',
    bio: "Neeko played for the Little Quakers in 2013 and went on to earn All-American honors at Muhlenberg College. He brings recent elite playing experience to the QB room, and the kids love him for it. The distance between him and the players he coaches is small. He was their age not long ago.",
  },
  {
    name: 'Casey Jones',
    title: 'Offensive Line Coach',
    photo: '/coachjones.jpg',
    subtitle: 'Temple University Football',
    initials: 'CJ',
    bio: 'Casey played college football at Temple University and brings genuine collegiate offensive line technique to our trenches. Consistently named one of the best instructors on staff by families, his impact shows up fast — players and parents cite him after as few as four games.',
  },
  {
    name: 'Kyle Jones',
    title: 'Assistant Offensive Line Coach',
    initials: 'KJ',
    alumni: 'LQ Class of 2015',
    bio: "Kyle played for the Little Quakers in 2015. After a successful college career at Franklin and Marshall College and Widener University, Kyle joined the Penn Charter and Little Quakers coaching staffs as a defensive assistant. He's a great example of the long-term success of Little Quakers.",
  },
  {
    name: 'Pat McCain',
    title: 'Special Teams Coach',
    subtitle: 'Dickinson College Football',
    initials: 'PM',
    bio: "Pat played at Dickinson College and returned to the Little Quakers, alongside fellow alum Neeko Hnatkowski, to coach the next generation. He owns special teams, a phase of the game that few youth programs dedicate real coaching attention to.",
  },
  {
    name: 'John Estok',
    title: 'Strength Coach & Defensive Line',
    initials: 'JE',
    photo: '/coachestok.jpg',
    bio: 'John is an award-winning strength coach who brings certified, professional-level strength-and-conditioning expertise to the Little Quakers. Almost no youth football program at any price point has a dedicated credentialed strength coach. Our players train like high school and college athletes.',
  },
  {
    name: 'Bart Schindler',
    title: 'Wide Receivers Coach',
    initials: 'BS',
    tenure: '15 years',
    bio: 'Bart was a standout player in the state of Delaware and went on to great success at Widener University. A 15-year veteran of the Little Quakers coaching staff, Bart has helped guide multiple college and NFL players through the organization. A sustained volunteer commitment that reflects the culture of the Little Quakers staff. Not a hired gun, but a lifelong contributor to the program.',
  },
  {
    name: 'Kenny Devenney',
    title: 'Coach',
    subtitle: 'Head Baseball Coach, Central High School',
    initials: 'KD',
    alumni: 'LQ Class of 1996',
    tenure: '15+ years',
    bio: "Kenny played for the Little Quakers in 1996 and has coached with the program for 15+ years. A graduate and baseball player at St. John's University, Kenny brings a wealth of knowledge to our players. By day he serves as Head Baseball Coach at Philadelphia's Central High School, where he's also a teacher. Another return alum carrying forward what was given to him.",
  },
]
