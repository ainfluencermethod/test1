export interface SequenceEmail {
  id: string;
  title: string;
  subject: string;
  send: string;
  type: string;
  body: string;
}

export interface EmailSequence {
  code: string;
  name: string;
  trigger: string;
  remove: string;
  summary: string;
  emails: SequenceEmail[];
}

export const AIB_EMAIL_SEQUENCES: EmailSequence[] = [
  {
    "code": "A",
    "name": "Sequence A · Freebie Path",
    "trigger": "Email opt-in for free workbook",
    "remove": "Remove if OTO purchased",
    "summary": "8-email nurture that delivers the freebie, fixes 300 views jail, teaches the Goldmine method, sells the $27 AI Influencer Method, and sets up monetisation.",
    "emails": [
      {
        "id": "A0",
        "title": "Email 0 — Freebie Delivery",
        "subject": "Your AI Influencer Starter Kit is inside",
        "send": "Immediately on opt-in",
        "type": "Delivery + Soft Seed",
        "body": "Hey {{first_name}},\n\nEight months ago I was sitting in a coffee shop in Lisbon scrolling through TikTok.\n\nNot casually. Obsessively.\n\nI’d just seen an AI influencer account hit 2 million views on a single post. The character looked indistinguishable from a real person. The comments were full of people arguing about whether she was real.\n\nShe wasn’t. And the person behind her had started the account eleven days earlier.\n\nThat was the moment I stopped watching and started building.\n\nSince then, the AI Influencer Blueprint community has tracked over 800 million views and $100K+ in earnings across our members. We’ve tested everything. We’ve broken everything. And we’ve documented what actually works.\n\nToday you’re getting the starting point. Two things:\n\n📘 Your Free Workbook: “Build Your First AI Model”\nThis is the same framework our community uses. It covers niche selection, character building, algorithm basics, and Fanvue setup. It’s not theory — it’s a step-by-step action plan.\n\n[ DOWNLOAD YOUR FREE WORKBOOK → ]\n\n🔍 Your Free AI Model Analyser: \nPaste your AI model’s Instagram link. Get an instant Viral Potential Score — it shows you exactly where you stand, what’s working, and what to fix first. Takes 3 minutes.\n\n[ ANALYSE YOUR AI MODEL NOW → ]\n\nOver the next 7 days, I’m going to walk you through the entire system.\n\nNot “tips.” Not “ideas.” The actual method — from zero knowledge to a live AI influencer that gets views, builds an audience, and makes money.\n\nTomorrow’s email is the one I wish someone had sent me before I wasted three months posting into the void. It’s about a problem called “300 views jail” — and why 90% of new AI creator accounts never escape it.\n\nDon’t miss it.\n\nTalk soon,\nThe AI Influencer Blueprint Team\n\n \n\nP.S. If you’re the type who skips the free stuff and wants the full system immediately — the complete 7-Day Viral Launch Plan, Account Warm-Up Protocol, Goldmine Content System, and the AI Realism Pack are all inside the AI Influencer Method. It’s $27. Available through this link only:\n\n[ GET THE AI INFLUENCER METHOD — $27 → ]"
      },
      {
        "id": "A1",
        "title": "Email 1 — The “300 Views Jail” Story",
        "subject": "I spent 3 months stuck at 300 views. Here’s why.",
        "send": "Day 1 (24 hours after opt-in)",
        "type": "Story + Education",
        "body": "Hey {{first_name}},\n\nLet me tell you about the most frustrating three months of my life.\n\nI’d built what I thought was an incredible AI character. Spent two weeks perfecting her look. The skin texture was flawless. The lighting was cinematic. The outfits were on point.\n\nI posted my first image on Instagram. Sat back. Waited.\n\n287 views.\n\nOkay, first post. Maybe the algorithm needs to warm up.\n\nSecond post. 312 views.\nThird post. 294 views.\nFourth post. 301 views.\n\nI was stuck in a band. 280 to 320 views, post after post after post. No matter what I tried. Better images. Different times. More hashtags. Fewer hashtags. Carousel. Single image. Video.\n\nNothing worked.\n\nI was creating some of the best AI content I’d ever seen — and nobody was seeing it.\n\nAfter three months, I finally figured out what was wrong.\n\nIt wasn’t the content. It was the launch.\n\nWhat “300 Views Jail” Actually Is\n\nEvery major social platform — Instagram, TikTok, YouTube Shorts — puts new accounts through a probationary period.\n\nThe algorithm gives you a tiny initial distribution window. Around 300 people. It’s testing you.\n\nIf those 300 people don’t engage, the algorithm makes a decision: this account isn’t worth distributing to more people.\n\nAnd once it makes that decision? It’s incredibly hard to reverse.\n\nHere’s the part nobody tells you: the algorithm’s first impression of your account happens before you post anything.\n\nRead that again.\n\nBefore your first post ever goes live, the algorithm has already started forming an opinion about your account based on your behaviour — who you follow, what you engage with, how you interact.\n\nIf you just created an account and immediately started posting, you skipped the most important step. You didn’t tell the algorithm what your account is about. So it showed your content to random people. Random people didn’t engage. And the algorithm buried you.\n\nThat’s 300 views jail. And it’s where I was stuck for three months.\n\nThe Fix: The Account Warm-Up Protocol\n\nWhen I finally cracked the code, the solution was embarrassingly simple.\n\nBefore posting anything, you spend 48 hours engaging exclusively in your niche. Following accounts. Leaving real comments. Watching full videos. Saving content.\n\nYou’re training the algorithm. Teaching it: “This account is about [your niche]. Show my content to people who care about [your niche].”\n\nThen, when you post your first piece of content, the algorithm already knows who to show it to. Your first 300 viewers aren’t random — they’re people who are genuinely interested in your niche.\n\nThose people engage. The algorithm sees the engagement. It pushes you to more people. The flywheel starts.\n\nThe first account I launched using this protocol hit 14,000 views on its second post. Not because the content was dramatically better. Because the audience was right.\n\nI turned the entire protocol into Module 2 of the AI Influencer Method. It’s a day-by-day sequence for your first 7 days — exactly what to do, when to do it, and in what order. It’s the module I wish existed when I was burning three months wondering what was wrong with my content.\n\nTomorrow I’m going to give you a free technique you can use to “reset” the algorithm’s perception of your account, even if you’ve already been posting.\n\nTalk tomorrow,\nThe AI Influencer Blueprint Team\n\n \n\nP.S. The full Account Warm-Up Protocol — including the day-by-day posting schedule, engagement ratios, and the 5 warm-up mistakes that kill accounts — is inside the AI Influencer Method:\n[ GET THE FULL LAUNCH PLAN — $27 → ]"
      },
      {
        "id": "A2",
        "title": "Email 2 — The Algorithm Reset Discovery",
        "subject": "Do this before your next post (free technique inside)",
        "send": "Day 2 (48 hours after opt-in)",
        "type": "Pure Value + Trust Building",
        "body": "Hey {{first_name}},\n\nYesterday I told you about 300 views jail. Today I want to give you something you can use right now, for free, regardless of whether you ever buy anything from me.\n\nI call it the Algorithm Reset.\n\nOne of our community members — let’s call him Jake — had been posting for six weeks. His account was completely flatlined. Every post: 200 to 400 views. He’d made all the mistakes. Posted before engaging. Switched niches twice. Posted at random times.\n\nHis account was algorithmically dead.\n\nI told him to try something. Stop posting for 3 days. During those 3 days, spend 15–20 minutes, three times per day, doing one thing: engaging aggressively with the top 10 accounts in his target niche.\n\nNot casual engagement. Not “great post 🔥” comments.\n\nReal engagement. Thoughtful comments that add to the conversation. Saving posts. Sharing content to stories. Watching full videos without skipping.\n\nHere’s why this works.\n\nSocial platforms use a concept called “interest graph clustering.” The algorithm maps every user into clusters based on what they engage with. When you heavily engage with a specific niche, the platform re-classifies your account into that cluster.\n\nJake’s account was in no cluster. Or rather, it was in three conflicting clusters because he’d been all over the place. The algorithm had no idea who to show his content to.\n\nAfter three days of focused niche engagement — zero posting, pure engagement — he put up a new post.\n\n8,400 views.\n\nSame content quality. Same account. Same everything. The only thing that changed was the audience the algorithm chose to show it to.\n\nYour Action Step Today\n\nBefore your next post, do this:\n\n1. Identify 10 accounts in your exact niche with 50K–500K followers.\n2. Spend 20 minutes engaging with their most recent content. Real comments. Save at least 5 posts. Watch all videos to completion.\n3. Do this for 3 days straight before your next post.\n\nThat’s it. It costs nothing. It takes 60 minutes spread over 3 days. And it might be the single highest-ROI thing you do for your AI influencer account this month.\n\nThis is a simplified version of what we teach inside the Method. The full warm-up protocol has specific follower-to-engagement ratios, a day-by-day schedule, and the 5 critical mistakes that tank new accounts. But this free version alone will make a noticeable difference.\n\nTomorrow I’m covering something that changed the way I think about content creation entirely. I used to spend hours brainstorming original ideas. Now I spend 15 minutes and have two weeks of content mapped out.\n\nI’ll explain the system.\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      },
      {
        "id": "A3",
        "title": "Email 3 — The Goldmine Content Origin Story",
        "subject": "The content strategy that killed my creativity (and tripled my views)",
        "send": "Day 3 (72 hours after opt-in)",
        "type": "Story + Framework + Soft Sell",
        "body": "Hey {{first_name}},\n\nI used to believe originality was everything.\n\nEvery post had to be a fresh idea. A unique concept. Something nobody had ever done before.\n\nI’d sit in front of my laptop for an hour trying to think of “what to post today.” Some days I’d come up with something decent. Most days I’d stare at a blank screen and eventually give up.\n\nThen I started studying the AI influencer accounts that were actually making money.\n\nAnd I noticed something that bothered me at first.\n\nThe top accounts weren’t being original. They were all making the same types of content. The same hooks. The same formats. The same visual structures. Just with different characters.\n\nI remember thinking: “That’s lazy. That’s copying. I’m better than that.”\n\nMeanwhile, those “lazy copiers” were getting 500K views per post. And I was getting 300.\n\nThat was a humbling moment.\n\nThe Uncomfortable Truth About Viral Content\n\nHere’s what I eventually understood: virality is not about originality. It’s about format validation.\n\nWhen a piece of content goes viral, it’s telling you something important. It’s telling you that the hook works, the format resonates, the emotional trigger connects, and the audience for this concept is proven and large.\n\nThat’s not a data point to ignore. That’s a data point to exploit.\n\nSo I built a system around it. I call it the Goldmine Method.\n\nThe 3-Step Goldmine Framework (Simplified Version)\n\nStep 1 — Mine. Find 5 accounts in your niche with 50K–500K followers. Sort their content by most liked or most viewed in the last 30 days. Screenshot the top 10. Save them in a swipe file. These are your goldmine posts.\n\nStep 2 — Dissect. For each goldmine post, identify the variable that made it work. Was it the hook? The angle? The setting? The outfit? The caption? Isolate the winning element.\n\nStep 3 — Recreate. Take the concept, the hook, and the format. Recreate it with your AI character, in your visual style, with one signature detail that makes it distinctly yours. The concept is borrowed. The execution is original.\n\nThe first week I used this system, I produced 14 posts in a single afternoon. I used to produce 3 per week.\n\nWithin two weeks, my views went from consistent 300s to a post that hit 47,000.\n\nSame character. Same account. Same tools. Different content strategy.\n\nThe full Goldmine Content module inside the AI Influencer Method goes much deeper than what I can share in an email. It includes specific tools for finding viral content fast, the 5 content types that consistently outperform (The Flex, The Candid, The Editorial, The Story, The Reveal), and a system for batching two weeks of content in 2.5 hours.\n\nBut this simplified version? Try it today. Go find 10 goldmine posts in your niche. You’ll immediately see patterns you never noticed before.\n\n[ GET THE FULL GOLDMINE CONTENT SYSTEM — $27 → ]\n\nTomorrow I’m tackling the silent killer of AI influencer accounts. It’s not the algorithm. It’s not the content strategy. It’s the one thing your audience notices in 0.5 seconds — and the reason most AI content gets scrolled past without a second thought.\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      },
      {
        "id": "A4",
        "title": "Email 4 — The Realism Breakthrough",
        "subject": "My AI content fooled 2 million people. Here’s the exact technique.",
        "send": "Day 4 (96 hours after opt-in)",
        "type": "Technical Story + Soft Sell",
        "body": "Hey {{first_name}},\n\nI need to tell you about the most important lesson I’ve learned in this entire space.\n\nIt’s not about the algorithm. It’s not about content strategy. It’s about one word:\n\nRealism.\n\nWhen I started, my AI images looked … AI-generated. I could tell. You could tell. And more importantly, the audience could tell in about half a second.\n\nThe skin was too smooth. The eyes were too symmetrical. The lighting was too perfect. The pose looked like it came from a 3D rendering engine, not a camera.\n\nI was generating beautiful images that nobody believed.\n\nThe accounts making money? Their content looked like it was shot on an iPhone. Candid. Imperfect. Real.\n\nThat’s when I realized: the goal is not to create perfect AI images. The goal is to create imperfect images that happen to be made by AI.\n\nThe 3 Tells That Expose AI Content\n\nTell #1: Plastic skin. AI defaults to smooth, poreless skin. Real skin has texture, pores, tiny imperfections. If your character’s skin looks like a beauty filter, people will scroll.\n\nTell #2: Perfect symmetry. Real faces are asymmetrical. One eye is slightly different from the other. The smile isn’t perfectly centered. AI tends toward mathematical perfection, and our brains register it as uncanny.\n\nTell #3: Studio lighting in casual settings. If your character is supposed to be at a coffee shop but the lighting looks like a professional photoshoot, the brain flags it. Matching the lighting to the environment is critical.\n\nThe Technique That Changed Everything\n\nThe fix is counterintuitive: you need to add imperfections on purpose.\n\nHere’s one technique you can use today, right now, for free:\n\nIn your prompt, add these phrases: “visible pores, natural skin texture, no beauty retouching, no plastic skin, realistic asymmetry, handheld camera shake, slight motion blur, JPEG compression artifacts.”\n\nThat single string will improve your image realism dramatically. You’re telling the AI generator to produce a photo that looks like it was taken by a real person with a real camera — not rendered in a studio.\n\nOur AI Realism Pack — which is included free with the AI Influencer Method — has our complete 10-Layer Prompt System, 5 production-ready prompt templates (Luxury Night Out, Golden Hour Travel, Candid Street, High Fashion Editorial, Morning Lifestyle), and a Pre-Post Realism Checklist that covers skin, eyes, lighting, background, camera physics, body language, color grade, and the gut check.\n\nThe difference between content that gets 300 views and content that gets 300,000 views often comes down to these details. Not the concept. Not the strategy. The micro-level realism that makes someone’s brain accept what they’re seeing without questioning it.\n\n[ GET THE AI INFLUENCER METHOD + REALISM PACK — $27 → ]\n\nTomorrow: the email about money. I’m going to break down exactly how AI influencers are earning $1,500+ per month with small followings — and why the income often comes before the audience growth, not after.\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      },
      {
        "id": "A5",
        "title": "Email 5 — The $1,500/Month Math",
        "subject": "The math that made me quit my “wait until I’m big enough” mindset",
        "send": "Day 5 (120 hours after opt-in)",
        "type": "Math + Objection Killer",
        "body": "Hey {{first_name}},\n\nMost people think you need a massive following to make money as an AI influencer.\n\n50K followers. 100K followers. “When I get big enough, then I’ll monetise.”\n\nI thought the same thing. It was the most expensive belief I’ve ever held.\n\nBecause while I was waiting to “get big enough,” people with a fraction of my follower count were earning $1,500, $3,000, $5,000 per month.\n\nHere’s the math that changed my thinking:\n\nThe Fanvue Revenue Equation\n\nOn Fanvue, the average subscription price for AI influencer accounts is $9.99 per month.\n\nTo earn $1,500 per month in subscription revenue alone, you need 150 paying subscribers.\n\nThe industry-standard conversion rate from free followers to paid Fanvue subscribers is 2–3%.\n\nAt 2% conversion: you need 7,500 followers.\nAt 3% conversion: you need 5,000 followers.\n\n5,000 to 7,500 followers. That’s it.\n\nWith the Goldmine Content method and proper algorithm engineering, that’s 4–6 weeks of consistent posting.\n\nBut here’s what most people miss: that $1,500 is just the subscription base. On top of that, you have PPV (pay-per-view) messages, which can double your Fanvue revenue. You have Higgsfield Earn, which pays $100–$300/month for active creators. And you have digital products — prompt packs, character blueprints, preset packs — which can add $300–$5,000+ per month.\n\nA conservative Month 3 income stack looks like this:\n\nFanvue subscriptions (100 × $9.99): $999\nFanvue PPV (4 weekly drops): $600\nHiggsfield Earn: $200\nDigital products: $300\nTotal: $2,099/month. Before 10,000 followers.\n\nThe income precedes the audience growth. Not the other way around.\n\nModule 6 of the AI Influencer Method walks through the exact Fanvue setup, pricing strategy, welcome sequence automation, PPV campaign structure, and the profile optimisation that maximises your follower-to-subscriber conversion rate.\n\nBut the mindset shift is what matters most: stop waiting to “get big.” Set up monetisation on Day 7. Every follower you gain before it’s live is a conversion you already lost.\n\nTomorrow I’m laying out the full 7-day timeline. The exact day-by-day roadmap from zero to a live, earning AI influencer.\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      },
      {
        "id": "A6",
        "title": "Email 6 — The 7-Day Roadmap",
        "subject": "Your 7-day timeline: zero to live, earning AI influencer",
        "send": "Day 6 (144 hours after opt-in)",
        "type": "Roadmap + Hard Sell",
        "body": "Hey {{first_name}},\n\nI’ve been building up to this email all week.\n\nI’ve shown you why accounts get stuck at 300 views (and how to fix it). I’ve given you the algorithm reset technique. I’ve explained the Goldmine Content method. I’ve covered realism — the silent killer of AI accounts. And yesterday I broke down the $1,500/month math.\n\nToday I want to show you what all of this looks like when you execute it as a linear sequence.\n\nSeven days. One day at a time. Each step builds on the last.\n\nThe 7-Day Launch Sequence\n\nDay 1 — Foundation. Pick your niche. Build your AI character’s brief — name, age, physical description, signature details, aesthetic. Write your prompt anchor string. This is the master document that keeps your character consistent across every image. Estimated time: 2 hours.\n\nDay 2 — Character Build. Generate 15–20 images using your anchor string. Pick the single best one as your reference image. Build your style library — 5 wardrobe and setting combinations. This is your character’s visual identity, locked in. Estimated time: 2–3 hours.\n\nDay 3 — Account Warm-Up. Set up your social accounts and Fanvue page. Begin the engagement protocol — 45 minutes engaging in your niche before posting anything. Follow 20–30 niche accounts. Leave thoughtful comments on 15+ posts. This trains the algorithm. Estimated time: 1 hour setup + 45 min engagement.\n\nDay 4 — First Content. Post your strongest content first — it sets the quality baseline. Post at peak time (6–8 PM local). Do NOT post more than once. Reply to every comment within the first hour. Continue niche engagement. Estimated time: 1 hour.\n\nDay 5 — Goldmine Research. Find 10 goldmine posts in your niche. Dissect what made each one work. Recreate 5 of them with your character. You now have your next week of content mapped out. Estimated time: 2–3 hours.\n\nDay 6 — Analyse and Double Down. Check analytics. Identify your outliers — the 1–2 posts that significantly outperformed. Double down on that format. Cut what’s not working. This is where the algorithm starts to reward your consistency. Estimated time: 30 minutes.\n\nDay 7 — Monetise. Launch your Fanvue link. Set subscription price at $9.99/month. Create 5 pieces of subscriber-only content. Set up your welcome sequence. Add your Fanvue link to every bio. Start converting followers to paying subscribers. Estimated time: 1–2 hours.\n\nThat’s the simplified version. The action items without the nuance.\n\nThe AI Influencer Method gives you the detailed version of every single step — the warm-up protocol with engagement ratios, the goldmine system with specific tools, the 10-Layer Prompt System for generating consistent content, the algo mastery framework with all 6 core metrics, and the complete Fanvue monetisation playbook.\n\nIt’s $27.\n\nI’m not going to pretend that’s a lot of money. It’s the price of lunch. And it’s the difference between spending the next 3 months figuring this out through trial and error, or having the complete system in your hands by tonight.\n\n[ GET THE AI INFLUENCER METHOD — $27 → ]\n\nTomorrow is the final email in this series. I’ll share the one thing that separates people who actually build this from people who just think about it.\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      },
      {
        "id": "A7",
        "title": "Email 7 — The Decision",
        "subject": "This is the last email. Here’s what I know about you.",
        "send": "Day 7 (168 hours after opt-in)",
        "type": "Final Push",
        "body": "Hey {{first_name}},\n\nThis is the final email in this series.\n\nI want to be honest with you about something.\n\nMost people who read this email series won’t do anything with it.\n\nThey’ll find it interesting. They’ll learn a few things. They’ll think “I should really try that Goldmine method” or “I need to fix my account warm-up.”\n\nAnd then they’ll close their inbox, open TikTok, and scroll through other people’s AI influencer accounts wondering how they did it.\n\nI’m not saying that to be harsh. I’m saying it because I was that person.\n\nI spent four months “researching” AI influencers before I generated my first image. I watched every YouTube video. Read every guide. Saved every TikTok. I was the world’s most informed person who had never actually posted anything.\n\nThe moment I actually started — imperfectly, messily, with a character that wasn’t even that good yet — everything changed. Not because the content was great. But because I was in motion. And the algorithm rewards motion.\n\nHere’s What I’ve Given You This Week"
      },
      {
        "id": "A1",
        "title": "Email 1 — Why accounts get stuck at 300 views (and the Account Warm-Up Protocol that fixes it).",
        "subject": "",
        "send": "",
        "type": "",
        "body": ""
      },
      {
        "id": "A2",
        "title": "Email 2 — The Algorithm Reset technique (free, actionable, works immediately).",
        "subject": "",
        "send": "",
        "type": "",
        "body": ""
      },
      {
        "id": "A3",
        "title": "Email 3 — The Goldmine Content method (stop guessing, start recreating what’s proven).",
        "subject": "",
        "send": "",
        "type": "",
        "body": ""
      },
      {
        "id": "A4",
        "title": "Email 4 — The realism breakthrough (imperfection is the secret to believability).",
        "subject": "",
        "send": "",
        "type": "",
        "body": ""
      },
      {
        "id": "A5",
        "title": "Email 5 — The $1,500/month math (you need fewer followers than you think).",
        "subject": "",
        "send": "",
        "type": "",
        "body": ""
      },
      {
        "id": "A6",
        "title": "Email 6 — The complete 7-day roadmap (day-by-day, step-by-step).",
        "subject": "",
        "send": "",
        "type": "",
        "body": ""
      }
    ]
  },
  {
    "code": "B",
    "name": "Sequence B · OTO Buyer Path",
    "trigger": "$27 purchase",
    "remove": "Remove from Sequence A + stop if Blueprint purchased",
    "summary": "6-email ascension sequence for $27 buyers that bridges into the Blueprint membership with stories, feature drops, and urgency.",
    "emails": [
      {
        "id": "B0",
        "title": "Email 0 — Purchase Confirmation",
        "subject": "You’re in — your AI Influencer Method is ready",
        "send": "Immediately on $27 purchase",
        "type": "Delivery + Onboarding",
        "body": "Hey {{first_name}},\n\nYour purchase is confirmed. Welcome to the AI Influencer Method.\n\nOrder: AI Influencer Method 2026\nPrice: $27.00\nIncludes: 7-Day Viral Launch Blueprint + AI Realism Pack + Bonus Resources\n\n[ ACCESS YOUR AI INFLUENCER METHOD → ]\n\nHere’s Exactly What To Do First\n\nStep 1 — Start with Module 1 (Foundation). Build your character brief and anchor string. This takes about 45 minutes and sets the foundation for everything else. Do not skip this.\n\nStep 2 — Move to Module 2 (Account Warm-Up) before you post anything publicly. This is the module that gets you out of 300 views jail. Skipping it is the #1 mistake that keeps accounts stuck.\n\nStep 3 — When you’re ready to generate content (Module 4), grab your AI Realism Pack. It’s a separate download inside the members area. It contains 5 production-ready prompts and the Pre-Post Realism Checklist.\n\nThe Weavy Workflow Template for recreating viral videos is also included in the Bonus section. Open the link, duplicate the flow, and follow the steps.\n\nIf you hit any snags, just reply to this email. We read and respond to everything.\n\nLet’s build this,\nThe AI Influencer Blueprint Team\n\n \n\nP.S. Over the next few days I’m going to share something with you. Many of our most successful members started with the Method — exactly where you are now — and eventually upgraded to the full Blueprint community. I’ll explain what that looks like and why it matters. But for now, focus on Module 1. That’s your only job today."
      },
      {
        "id": "B1",
        "title": "Email 1 — The Gap",
        "subject": "The question every Method buyer asks on Day 4",
        "send": "Day 2 after purchase",
        "type": "Story + Upsell Seed",
        "body": "Hey {{first_name}},\n\nBy now you should be into Module 1 or 2 of the AI Influencer Method. If you haven’t started yet, close this email and go do that first. This will still be here when you get back.\n\nOkay. Still here? Good.\n\nI want to tell you something that happens to almost every person who buys the Method.\n\nAround Day 3 or 4, they hit a moment. A specific moment. It sounds like this:\n\n“This system makes total sense. But I have a question about MY specific situation. My niche isn’t exactly like the example. My character looks slightly off. I’m not sure if my warm-up engagement is working. I need someone to look at what I’m doing and tell me if I’m on the right track.”\n\nThe Method is the system. It tells you what to do, in what order, and why.\n\nBut a system without feedback is like a gym membership without a trainer. You’ll get results. You’ll also waste time on mistakes that someone experienced could catch in five seconds.\n\nThat’s the gap.\n\nAnd that’s why the AI Blueprint community exists.\n\nTwice a week, we run live prompting calls. You bring your content, your AI model, your questions. You get direct feedback in real time. Not from a chatbot. Not from a pre-recorded video. From people who are actively building and earning in this space right now.\n\nOn top of that, you get access to a private community of creators. Not lurkers. Not people who bought something and disappeared. Active builders who share what’s working, ask hard questions, and push each other to ship.\n\nIt’s $97/month.\n\nOne Fanvue subscriber at $9.99/month. That’s a 10:1 return on your membership cost from a single subscriber. Most of our members cover their membership within their first month.\n\n[ JOIN THE AI BLUEPRINT COMMUNITY → ]\n\nIf you’re not ready yet, that’s completely fine. Keep working through the Method. But know that the option exists for when you hit that moment. And you will hit that moment.\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      },
      {
        "id": "B2",
        "title": "Email 2 — The Tool Overwhelm Problem",
        "subject": "How much time did you spend Googling AI tools this week?",
        "send": "Day 4 after purchase",
        "type": "Problem/Solution + Upsell",
        "body": "Hey {{first_name}},\n\nI want to ask you an honest question.\n\nHow many hours have you spent this week researching AI tools?\n\nWhich image generator is best? HiggsField or Midjourney or Flux or Leonardo? Which upscaler? Which face swap tool? What ComfyUI settings? Which scheduling platform?\n\nIf the answer is “too many,” you’re not alone.\n\nThe AI tool ecosystem is the biggest time sink in this entire space. There are dozens of generators, editors, upscalers, face-swappers, and workflow managers. They change constantly. What was the best option 3 months ago might be obsolete today.\n\nI used to lose entire days going down tool rabbit holes. Watching comparison videos. Testing free trials. Reading Reddit threads. And at the end of the day? Zero content produced.\n\nThis is the problem the Blueprint’s Tool Walkthrough Vault solves.\n\n30+ screen-recorded walkthroughs of the exact tools and settings our top creators use. Not generic tutorials. Specific workflows: “here are the exact HiggsField settings for the Nano Banana Pro model,” “here’s the ComfyUI node setup for consistent character generation,” “here’s how to batch-process 20 images in 15 minutes.”\n\nThe vault alone is valued at $197. And it’s updated regularly as tools change, so you’re never working with outdated information.\n\nBut the part most people don’t expect? The daily trending video feed.\n\nEvery single day, we curate the AI influencer content that’s going viral right now. You open the feed, see what’s working today, and adapt it for your character. No more “what should I post?” No more Goldmine research sessions. The research is done for you, daily.\n\nThe Method taught you the strategy. The Blueprint gives you the tools, the workflows, and the daily intelligence to execute it faster than you ever could alone.\n\n[ UNLOCK THE FULL TOOLKIT — $97/MO → ]\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      },
      {
        "id": "B3",
        "title": "Email 3 — Member Story",
        "subject": "{{member_name}} joined the Blueprint 6 weeks ago. Here’s what happened.",
        "send": "Day 6 after purchase",
        "type": "Social Proof + Upsell",
        "body": "Hey {{first_name}},\n\nI want to introduce you to {{member_name}}.\n\n[INSERT REAL MEMBER STORY HERE]\n\n[Include: Where they started (skill level, follower count, earnings). What they struggled with. What specific Blueprint resource helped them break through (live calls? community feedback? tool walkthroughs? daily trending feed?). Their current results (views, followers, Fanvue revenue, timeline). Keep it specific — numbers, dates, platform names. 4–5 paragraphs.]\n\n{{member_name}}’s story isn’t unusual.\n\nAcross the AI Blueprint community, we’ve tracked 800M+ views and $100K+ in collective earnings. These aren’t people with special talent or technical backgrounds. They’re people who followed the system and had the right environment around them.\n\nThat’s the word I keep coming back to: environment.\n\nYou can have the best strategy in the world. But if you’re executing it alone — with nobody to check your work, nobody to push you, nobody to share what’s working right now — the results come slower. Or they don’t come at all.\n\nThe Blueprint isn’t a course. It’s an environment. A room full of people doing the same thing you’re doing, sharing what they learn in real time, and pushing each other to ship.\n\nThat’s why the results compound.\n\n[ JOIN THE BLUEPRINT COMMUNITY → ]\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      },
      {
        "id": "B4",
        "title": "Email 4 — New Feature Drop",
        "subject": "We just dropped something new inside the Blueprint",
        "send": "Day 8 after purchase",
        "type": "Urgency + Upsell",
        "body": "Hey {{first_name}},\n\nQuick update.\n\nWe just added a brand new module to the AI Blueprint: AI Live-Streaming Setup.\n\nThis has been the most requested feature in the community for months. Live-streaming with AI characters is one of the fastest-growing content formats right now. The creators who figure it out early are seeing engagement numbers that make regular posting look quaint.\n\nThe module walks through the entire technical setup — OBS configuration, real-time AI character rendering, audience interaction, and the streaming schedule that maximises growth.\n\nIt’s available now for all Blueprint members.\n\nThis is what I mean when I say the Blueprint is a living product. It doesn’t stay the same. It evolves with the space. New tools emerge — we test them and add walkthroughs. New content formats blow up — we reverse-engineer them and share the playbook. New monetisation channels open — we document the setup.\n\nThe Method you already have is a snapshot. It’s the system as it existed when you bought it. And it’s excellent.\n\nThe Blueprint is the live feed. It’s the system as it exists right now, updated daily, with a community of people pushing the edges of what’s possible.\n\nHere’s everything you’d unlock:\n\n✔ Complete AI Influencer Blueprint System (5 core modules)\n✔ 30+ Tool Walkthrough Vault\n✔ Private Community Access\n✔ Advanced ComfyUI Workflows\n✔ AI Live-Streaming Setup (brand new)\n✔ 2x Weekly Live Prompting Calls\n✔ Daily Trending Video Feed\n✔ Premium Lifestyle Prompt Pack\n✔ Celebrity-Style Prompt Pack\n✔ Seedream Prompt Pack\n\n$97/month. One subscriber covers it.\n\n[ GET THE FULL AI BLUEPRINT — $97/MO → ]\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      },
      {
        "id": "B5",
        "title": "Email 5 — The Final Pitch",
        "subject": "Last time I’ll mention this — here’s the honest picture",
        "send": "Day 10 after purchase",
        "type": "Respectful Close + Full Stack",
        "body": "Hey {{first_name}},\n\nThis is the last email I’ll send you about the Blueprint. After this, you’ll only hear from me with general updates and tips.\n\nI want to be direct about what you’re weighing.\n\nYou already have the AI Influencer Method. It’s a great launch system. If you follow it step by step, you’ll be ahead of 95% of people trying to build an AI influencer.\n\nBut here’s the thing I’ve learned after watching hundreds of people go through this journey:\n\nBuilding an AI influencer is not a one-week project. It’s an ongoing operation.\n\nContent trends change weekly. Tools update constantly. What works today might not work in 30 days. The algorithm shifts. Platforms change their policies. New competitors enter your niche.\n\nThe Method gives you the launch system. The Blueprint keeps you current, connected, and supported as you scale.\n\nThat’s the honest distinction. The Method is the ignition. The Blueprint is the engine.\n\nIf you’re serious about this — if this isn’t a hobby, if you actually want to build a revenue-generating AI influencer — the Blueprint is where that happens.\n\nIf the timing isn’t right, I genuinely get it. The link will stay active whenever you’re ready:\n\n[ JOIN THE AI BLUEPRINT → ]\n\nNo matter what, keep building. You’ve got the Method. Use it. Follow it in order. Don’t skip steps. Post your first piece of content this week.\n\nThe algorithm rewards people who start.\n\nTalk soon,\nThe AI Influencer Blueprint Team"
      }
    ]
  },
  {
    "code": "C",
    "name": "Sequence C · Blueprint Welcome",
    "trigger": "$97/mo Blueprint purchase",
    "remove": "Remove from all other sequences",
    "summary": "Single welcome/onboarding email for new Blueprint members.",
    "emails": [
      {
        "id": "C0",
        "title": "Email 0 — Blueprint Welcome",
        "subject": "Welcome to the AI Blueprint — start here",
        "send": "Immediately on $97/mo purchase",
        "type": "Onboarding",
        "body": "Hey {{first_name}},\n\nYou just made the decision that separates people who build AI influencers as a side curiosity from people who build them as a business.\n\nWelcome to the AI Blueprint.\n\nOrder: AI Blueprint (Monthly Membership)\nPrice: $97.00/month\nIncludes: Full system, community, live calls, all bonuses\n\n[ ENTER THE AI BLUEPRINT → ]\n\nYour First 60 Minutes Inside\n\nThere’s a lot in here. Don’t try to consume everything at once. Here’s your quickstart — the 4 things to do in your first 60 minutes:\n\nMinute 0–10: Join the Private Community. This is the single most valuable thing inside the Blueprint. Introduce yourself in the welcome channel. Tell us your niche, where you’re at, and what your 30-day goal is. The community will rally around you. This isn’t a ghost town — it’s active builders who share daily.\n\nMinute 10–20: Download the Prompt Packs. Go to the Bonuses section. Grab the Premium Lifestyle Pack, Celebrity-Style Pack, and Seedream Pack. These are production-ready prompts you can use immediately to level up your image quality.\n\nMinute 20–35: Check the Live Call Schedule. Our next prompting call is [DAY/TIME]. Put it in your calendar now. These calls are where breakthroughs happen. Bring your AI model, your content, your questions — anything you’re working on. You’ll get real-time feedback from people who’ve already solved the problem you’re stuck on.\n\nMinute 35–60: Check Today’s Trending Content. The daily trending video feed is in the community dashboard. Open it. See what’s going viral in the AI influencer space right now. Use it to plan your next 3 posts. This alone is worth the membership — it eliminates the “what should I post?” problem permanently.\n\nEverything Inside Your Membership\n\n✔ Complete AI Influencer Blueprint System (5 core modules)\n✔ 30+ Tool Walkthrough Vault\n✔ Private Community Access (lifetime for active members)\n✔ Advanced ComfyUI Workflows\n✔ AI Live-Streaming Setup\n✔ 2x Weekly Live Prompting Calls\n✔ Daily Trending Video Feed\n✔ Premium Lifestyle Prompt Pack\n✔ Celebrity-Style Prompt Pack\n✔ Seedream Prompt Pack\n\nIf you also purchased the $27 AI Influencer Method, everything in that product is included and consolidated inside your Blueprint access. One home for everything.\n\nOne last thing.\n\nYour membership costs $97/month. One Fanvue subscriber at $9.99/month covers it. Your job this month is to get that first subscriber. Everything inside the Blueprint is designed to help you get there as fast as possible.\n\nWe’ll help you do it.\n\nLet’s build,\nThe AI Influencer Blueprint Team\n\n \n\nP.S. The community is active right now. There are people in the welcome channel who started exactly where you are today. Go say hello. You’ll be surprised how fast things move when you’re building alongside other people instead of alone."
      }
    ]
  }
] as const;
