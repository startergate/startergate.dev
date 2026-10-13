import type { Dictionary } from "./ko";

const en: Dictionary = {
  nav: {
    menuOpen: "Expand menu",
    menuClose: "Collapse menu",
    github: "GitHub",
    projects: "Projects",
    timeline: "Timeline",
    conferences: "Conferences",
    blog: "Blog",
    blogSoon: "Coming soon",
    cv: "CV",
    homeLink: "STARTERGATE home",
    langSelect: "Select language",
    langKo: "한국어",
    langEn: "English",
  },
  theme: {
    toggle: "Toggle theme",
  },
  bottomDock: {
    scrollTop: "Scroll to top",
    modeBackend: "Backend developer mode",
    modeGame: "Game developer mode",
  },
  pageTitles: {
    projects: "Projects",
    timeline: "Timeline",
  },
  notFound: {
    title: "Page not found",
    description: "The page you requested does not exist.",
    backHome: "Back to home",
  },
  rootRedirect: {
    choose: "Choose your language",
  },
  status: {
    planning: "Planning",
    active: "In progress",
    canceled: "Canceled",
    done: "Done",
  },
  hero: {
    slogan: "[새 표어]",
    roleBackend: "Backend Engineer",
    roleGame: "Game Developer / Player",
    openToWork: "open to work",
    scrollDown: "Scroll down",
    skySeoul: "Sky over Seoul",
    skyMine: "Sky above you",
    locToMine: "View from my location",
    locToSeoul: "Reset to Seoul",
  },
  about: {
    backend: {
      title1: "I'm a backend engineer.",
      title2: "I build what you don't see.",
      subtitle: "I build programs that run on servers, and the programs that connect to them.",
      paragraphs: [
        {
          label: "Stack",
          body: "I build with **TypeScript on Node.js**, mainly using **Nest.js** as the server framework. I work with MySQL-family databases both through raw queries and TypeORM, and have run **Aurora MySQL** migrations and operations, Redis/DynamoDB caching, and task distribution combining **RabbitMQ and SQS** in production.",
        },
        {
          label: "Experience",
          body: "I've worked on everything from a backend serving **750K MAU** to a crawling system handling **5M jobs a day**, four-tier database clusters, and infrastructure and internal networking spanning cloud and on-premise. Across about 9 years of development and **5 years 3 months in industry**, I've built frontend, infrastructure, and CI/CD alongside backend work, and designed the architecture for several projects.",
        },
        {
          label: "Cloud & Ops",
          body: "I ran **AWS** as the primary cloud, mixing in GCP and Naver Cloud Platform as cost and needs required. I built and ran CI/CD with **GitHub Actions**, deployment logic with the AWS SDK, and monitoring with Sentry and Grafana wired into Slack.",
        },
        {
          label: "Collaboration",
          body: "Beyond my own team, I've worked with MSPs like Bespin Global, partners like SmartRo, PortOne, and Naver Shopping, onboarded merchants, and public institutions — **a wide range of external collaboration and API integrations**.",
        },
      ],
    },
    game: {
      title1: "I'm an indie game developer.",
      title2: "I build experiences.",
      subtitle: "I make games across different genres. I've shipped a platformer and have several projects in the works.",
      paragraphs: [
        { body: "Like most teenage boys, I love games. I grew up on Nexon games in elementary school, and got hooked on packaged games after middle school." },
        { body: "Playing so many games made me want to make my own, so I took a Unity after-school class in my first year of high school." },
        { body: "Building on what I learned there, I started the club Tiny Beluga in my second year and shipped a game called Lost with friends." },
        { body: "I try different genres. My first shipped game was a 2D platformer, and I keep building whatever genre fits a good idea." },
      ],
    },
  },
  highlights: {
    heading: "Project Highlights",
    seeMore: "See all projects →",
    ghBadge: "startergate",
  },
  tech: {
    heading: "Technologies",
    ssBadge: "stackshare",
    using: "Using",
    learned: "Learned / Used",
    learning: "Learning / Interested",
  },
  resume: {
    heading: "Experiences",
    downloadCv: "Download CV ↓",
    downloadAria: "Download CV",
    detailAriaExpand: "Show details",
    timelineCardTitle: "Education · Awards · Activities",
    timelineCardSub: "See them all on the Timeline",
    timelineCardCta: "Timeline →",
    cvOptions: [
      { label: "Korean (Short, 1 page)", file: "cv.pdf" },
      { label: "Korean (Full)", file: "resume-ko.pdf" },
      { label: "English (Full)", file: "resume-en.pdf" },
    ],
  },
  links: {
    heading: "Links",
  },
  modal: {
    closeAria: "Close",
    copyLink: "Copy link",
    copyLinkDone: "Link copied",
    teamProjectTemplate: "{team} project",
    teamProject: "Team project",
    personalProject: "Personal project",
    overview: "Overview",
    techStack: "Tech stack",
    members: "Team",
    linksLabel: "Links",
    prevProject: "Previous project",
    nextProject: "Next project",
    start: "Start",
    endDone: "End",
    endPlanned: "Expected end",
    endCanceled: "Canceled",
    daysStatusTemplate: "{days} days · {status}",
    planningCaption: "Planning",
    noEndValue: "—",
    detailAriaTemplate: "View details for {name}",
  },
};

export default en;
