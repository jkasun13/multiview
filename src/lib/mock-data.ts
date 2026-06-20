import type { Story, AIAnalysis } from "@/types";

export const MOCK_STORIES: Story[] = [
  {
    id: "story-001",
    title: "Federal Reserve Holds Interest Rates Steady Amid Economic Uncertainty",
    summary:
      "The Federal Reserve announced it would maintain current interest rates, citing mixed economic signals including persistent inflation and a cooling job market.",
    category: "business",
    imageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    publishedRange: {
      from: "2024-11-15T10:00:00Z",
      to: "2024-11-15T18:30:00Z",
    },
    sources: [
      {
        id: "src-001-1",
        outlet: "Reuters",
        outletDomain: "reuters.com",
        headline: "Fed holds rates, signals cautious path ahead",
        snippet:
          "The Federal Reserve kept its benchmark interest rate unchanged Wednesday, with Chair Jerome Powell emphasizing that policymakers need more data before considering cuts.",
        url: "https://reuters.com",
        publishedAt: "2024-11-15T10:00:00Z",
        tone: "neutral",
      },
      {
        id: "src-001-2",
        outlet: "Fox Business",
        outletDomain: "foxbusiness.com",
        headline: "Fed freezes rates again — inflation fight not over, Powell warns",
        snippet:
          "The Federal Reserve once again refused to cut interest rates, with Jerome Powell warning that inflation remains too high and the central bank will not rush to ease policy.",
        url: "https://foxbusiness.com",
        publishedAt: "2024-11-15T11:15:00Z",
        tone: "critical",
      },
      {
        id: "src-001-3",
        outlet: "Bloomberg",
        outletDomain: "bloomberg.com",
        headline: "Fed pauses rate cycle, markets rally on dovish commentary",
        snippet:
          "Federal Reserve officials voted unanimously to hold rates steady, while market participants focused on hints of future easing embedded in the post-meeting statement.",
        url: "https://bloomberg.com",
        publishedAt: "2024-11-15T12:00:00Z",
        tone: "favorable",
      },
      {
        id: "src-001-4",
        outlet: "NPR",
        outletDomain: "npr.org",
        headline: "What the Fed's rate decision means for everyday Americans",
        snippet:
          "The Federal Reserve held interest rates steady for the third consecutive meeting, a decision that will keep borrowing costs elevated for mortgages, car loans, and credit cards.",
        url: "https://npr.org",
        publishedAt: "2024-11-15T14:00:00Z",
        tone: "neutral",
      },
    ],
    tags: ["federal reserve", "interest rates", "economy", "inflation"],
  },
  {
    id: "story-002",
    title: "Major AI Lab Releases Multimodal Model Claiming Human-Level Reasoning",
    summary:
      "A leading artificial intelligence company unveiled a new model it claims surpasses human performance on several benchmark reasoning tasks, reigniting debates about AGI timelines.",
    category: "technology",
    imageUrl:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
    publishedRange: {
      from: "2024-11-14T09:00:00Z",
      to: "2024-11-14T22:00:00Z",
    },
    sources: [
      {
        id: "src-002-1",
        outlet: "The Verge",
        outletDomain: "theverge.com",
        headline: "New AI model claims human-level reasoning — researchers are skeptical",
        snippet:
          "The company's announcement was met with excitement from investors and skepticism from independent AI researchers who questioned the methodology behind the benchmark scores.",
        url: "https://theverge.com",
        publishedAt: "2024-11-14T09:00:00Z",
        tone: "mixed",
      },
      {
        id: "src-002-2",
        outlet: "Wired",
        outletDomain: "wired.com",
        headline: "The AI reasoning revolution is here — or is it?",
        snippet:
          "Wired examines what human-level reasoning actually means and why benchmark performance may not translate to real-world intelligence.",
        url: "https://wired.com",
        publishedAt: "2024-11-14T11:30:00Z",
        tone: "critical",
      },
      {
        id: "src-002-3",
        outlet: "TechCrunch",
        outletDomain: "techcrunch.com",
        headline: "AI startup raises $2B on the back of breakthrough reasoning model",
        snippet:
          "The announcement coincided with a massive funding round, raising questions about whether the timing was driven by scientific progress or investor relations.",
        url: "https://techcrunch.com",
        publishedAt: "2024-11-14T15:00:00Z",
        tone: "neutral",
      },
      {
        id: "src-002-4",
        outlet: "BBC Technology",
        outletDomain: "bbc.com",
        headline: "AI that thinks like humans: what does it really mean?",
        snippet:
          "The BBC explores the philosophical and practical implications of a machine that can reportedly reason at or above the level of a typical adult human.",
        url: "https://bbc.com",
        publishedAt: "2024-11-14T18:00:00Z",
        tone: "neutral",
      },
    ],
    tags: ["artificial intelligence", "AI", "machine learning", "AGI"],
  },
  {
    id: "story-003",
    title: "Climate Summit Ends with Landmark Fossil Fuel Agreement",
    summary:
      "Delegates from 190 countries reached a historic accord committing to phase out fossil fuels over the next two decades, though critics argue the timeline is insufficient.",
    category: "world",
    imageUrl:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    publishedRange: {
      from: "2024-11-13T08:00:00Z",
      to: "2024-11-13T20:00:00Z",
    },
    sources: [
      {
        id: "src-003-1",
        outlet: "The Guardian",
        outletDomain: "theguardian.com",
        headline: "Climate deal 'too little, too late' say scientists as summit wraps",
        snippet:
          "Environmental scientists and activist groups expressed disappointment with the 20-year phase-out timeline, arguing it falls far short of what is needed to limit warming to 1.5°C.",
        url: "https://theguardian.com",
        publishedAt: "2024-11-13T10:00:00Z",
        tone: "critical",
      },
      {
        id: "src-003-2",
        outlet: "Associated Press",
        outletDomain: "apnews.com",
        headline: "Nations agree to phase out fossil fuels in historic UN climate deal",
        snippet:
          "In a breakthrough moment at the COP climate conference, world leaders committed to a binding timeline to transition away from coal, oil, and gas over the next two decades.",
        url: "https://apnews.com",
        publishedAt: "2024-11-13T12:00:00Z",
        tone: "favorable",
      },
      {
        id: "src-003-3",
        outlet: "Wall Street Journal",
        outletDomain: "wsj.com",
        headline: "Climate pact threatens energy security, industry groups warn",
        snippet:
          "Business and energy industry organizations cautioned that a rushed fossil fuel phase-out could trigger supply disruptions and economic instability in energy-dependent nations.",
        url: "https://wsj.com",
        publishedAt: "2024-11-13T14:30:00Z",
        tone: "critical",
      },
      {
        id: "src-003-4",
        outlet: "CNN",
        outletDomain: "cnn.com",
        headline: "World leaders hail 'historic' fossil fuel deal at climate summit",
        snippet:
          "World leaders from the US, EU, and major emerging economies praised the agreement, calling it the most significant climate commitment since the Paris Accord.",
        url: "https://cnn.com",
        publishedAt: "2024-11-13T16:00:00Z",
        tone: "favorable",
      },
    ],
    tags: ["climate change", "COP", "fossil fuels", "environment"],
  },
  {
    id: "story-004",
    title: "Senate Passes Sweeping Immigration Reform Bill",
    summary:
      "The Senate approved a bipartisan immigration reform package that includes a path to citizenship for undocumented immigrants and increased border security funding.",
    category: "politics",
    imageUrl:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    publishedRange: {
      from: "2024-11-12T14:00:00Z",
      to: "2024-11-12T23:00:00Z",
    },
    sources: [
      {
        id: "src-004-1",
        outlet: "CNN Politics",
        outletDomain: "cnn.com",
        headline: "Senate passes landmark immigration bill in rare bipartisan vote",
        snippet:
          "The legislation, which passed 64-36, represents the most significant overhaul of U.S. immigration law in nearly four decades.",
        url: "https://cnn.com",
        publishedAt: "2024-11-12T14:00:00Z",
        tone: "favorable",
      },
      {
        id: "src-004-2",
        outlet: "Fox News",
        outletDomain: "foxnews.com",
        headline: "Senate immigration bill slammed as 'amnesty' by conservatives",
        snippet:
          "Critics on the right blasted the Senate-passed immigration legislation as a massive expansion of legal status for illegal aliens that will incentivize more border crossings.",
        url: "https://foxnews.com",
        publishedAt: "2024-11-12T15:30:00Z",
        tone: "critical",
      },
      {
        id: "src-004-3",
        outlet: "New York Times",
        outletDomain: "nytimes.com",
        headline: "What's in the Senate immigration bill — and who it helps",
        snippet:
          "A breakdown of the major provisions: a 10-year path to citizenship for DACA recipients, expanded H-1B caps, and $12 billion for border infrastructure.",
        url: "https://nytimes.com",
        publishedAt: "2024-11-12T17:00:00Z",
        tone: "neutral",
      },
      {
        id: "src-004-4",
        outlet: "Politico",
        outletDomain: "politico.com",
        headline: "Inside the Senate deal: who got what in the immigration compromise",
        snippet:
          "Politico reveals the closed-door negotiations, concessions made to moderate Republicans, and the political calculus behind the rare bipartisan agreement.",
        url: "https://politico.com",
        publishedAt: "2024-11-12T20:00:00Z",
        tone: "neutral",
      },
    ],
    tags: ["immigration", "senate", "bipartisan", "politics"],
  },
  {
    id: "story-005",
    title: "Pharmaceutical Giant Announces Phase 3 Results for Alzheimer's Drug",
    summary:
      "A major pharmaceutical company reported positive Phase 3 trial results for a new Alzheimer's treatment, showing a significant slowdown in cognitive decline in early-stage patients.",
    category: "health",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    publishedRange: {
      from: "2024-11-11T07:00:00Z",
      to: "2024-11-11T19:00:00Z",
    },
    sources: [
      {
        id: "src-005-1",
        outlet: "STAT News",
        outletDomain: "statnews.com",
        headline: "Alzheimer's drug shows promise but safety questions linger",
        snippet:
          "While the trial met its primary endpoint, a significant subset of patients experienced brain swelling and microbleeds, raising questions about the risk-benefit profile.",
        url: "https://statnews.com",
        publishedAt: "2024-11-11T07:00:00Z",
        tone: "mixed",
      },
      {
        id: "src-005-2",
        outlet: "NBC News",
        outletDomain: "nbcnews.com",
        headline: "'A real breakthrough': Alzheimer's drug slows memory loss in trial",
        snippet:
          "Patients and families celebrated the news, with doctors calling the results a meaningful step forward in treating one of the most devastating diseases.",
        url: "https://nbcnews.com",
        publishedAt: "2024-11-11T10:00:00Z",
        tone: "favorable",
      },
      {
        id: "src-005-3",
        outlet: "Reuters Health",
        outletDomain: "reuters.com",
        headline: "Drug maker shares surge after Alzheimer's trial data released",
        snippet:
          "Shares in the pharmaceutical company rose 18% after the company reported the Phase 3 results, as analysts raised price targets ahead of an expected FDA submission.",
        url: "https://reuters.com",
        publishedAt: "2024-11-11T13:00:00Z",
        tone: "favorable",
      },
    ],
    tags: ["alzheimers", "pharma", "clinical trial", "health"],
  },
  {
    id: "story-006",
    title: "SpaceX Starship Completes First Successful Ocean Landing",
    summary:
      "SpaceX's Starship rocket completed its first fully successful integrated flight test, with both the Super Heavy booster and the upper stage vehicle returning safely.",
    category: "science",
    imageUrl:
      "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&q=80",
    publishedRange: {
      from: "2024-11-10T16:00:00Z",
      to: "2024-11-10T22:00:00Z",
    },
    sources: [
      {
        id: "src-006-1",
        outlet: "Ars Technica",
        outletDomain: "arstechnica.com",
        headline: "Starship sticks the landing: a technical deep-dive",
        snippet:
          "Ars Technica breaks down the engineering milestones — the chopstick catch attempt, the Raptor engine performance, and what it all means for Starship's path to orbit.",
        url: "https://arstechnica.com",
        publishedAt: "2024-11-10T16:00:00Z",
        tone: "favorable",
      },
      {
        id: "src-006-2",
        outlet: "BBC Science",
        outletDomain: "bbc.com",
        headline: "SpaceX Starship lands safely — why it matters for Moon and Mars missions",
        snippet:
          "The BBC explains the significance of SpaceX's latest achievement for NASA's Artemis moon program and Elon Musk's long-term vision of Mars colonization.",
        url: "https://bbc.com",
        publishedAt: "2024-11-10T18:00:00Z",
        tone: "favorable",
      },
      {
        id: "src-006-3",
        outlet: "Scientific American",
        outletDomain: "scientificamerican.com",
        headline: "What scientists are cautiously optimistic about after Starship's flight",
        snippet:
          "Aerospace engineers and scientists offer measured praise for the landing while noting the long road still ahead before Starship becomes a reliable launch platform.",
        url: "https://scientificamerican.com",
        publishedAt: "2024-11-10T20:00:00Z",
        tone: "mixed",
      },
    ],
    tags: ["SpaceX", "Starship", "space", "NASA"],
  },
];

export const MOCK_ANALYSIS: Record<string, AIAnalysis> = {
  "story-001": {
    agree: [
      "The Federal Reserve held interest rates unchanged at this meeting",
      "The decision was unanimous among FOMC members",
      "Chair Jerome Powell cited the need for more economic data before making changes",
    ],
    differ: [
      {
        outlet: "Fox Business",
        angle:
          "Frames the decision negatively as a 'freeze,' emphasizing continued inflation risk and a stern warning tone from Powell",
      },
      {
        outlet: "Bloomberg",
        angle:
          "Focuses on the dovish undercurrent and positive market reaction, suggesting future cuts are on the horizon",
      },
      {
        outlet: "NPR",
        angle:
          "Centers the story on impact to ordinary consumers — mortgage rates, car loans, credit cards — rather than market or macro framing",
      },
    ],
    missingContext: [
      "The specific language changes in the FOMC statement that markets interpreted as dovish are not quoted in most outlets",
      "Historical comparison: how does this rate-hold streak compare to previous Fed cycles?",
      "Dissenting voices within the Fed who may have preferred a cut are not mentioned",
      "International central bank actions (ECB, Bank of England) that provide broader context are absent",
    ],
    generatedAt: new Date().toISOString(),
  },
};
