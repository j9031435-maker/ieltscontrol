import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.question.deleteMany();
  await prisma.test.deleteMany();
  await prisma.writingTask.deleteMany();
  await prisma.speakingTask.deleteMany();

  // ---------- READING ----------
  await prisma.test.create({
    data: {
      section: "READING",
      title: "The History of Coffee",
      description: "Academic Reading passage — 8 questions",
      bodyText: `Coffee is one of the most widely consumed beverages in the world, yet its origins remain wrapped in legend. According to popular folklore, a goat herder named Kaldi in the Ethiopian highlands first discovered the energising effects of the coffee plant when he noticed his goats became unusually lively after eating berries from a certain tree. Kaldi reported his findings to the local monastery, where monks made a drink with the berries and noticed that it kept them alert during long hours of evening prayer.

From Ethiopia, coffee cultivation and trade spread to the Arabian Peninsula, and by the fifteenth century it was being grown in the Yemeni district of Arabia. By the sixteenth century, coffee had reached Persia, Egypt, Syria, and Turkey. Coffee was not only enjoyed in homes but also in the many public coffee houses that began to appear in cities across the Near East. The popularity of these coffee houses was unmatched; people frequented them not solely for the beverage but also for the company, to listen to music, watch performers, play chess, and stay current on the news of the day.

European travellers to the Near East brought back stories of the unusual dark black beverage, and by the seventeenth century coffee had made its way to Europe, becoming popular across the continent despite religious controversy surrounding its consumption. Some clergy condemned coffee as sinful, but Pope Clement VIII is said to have approved of it after tasting it himself, giving it his blessing.

Coffee houses quickly became centres of social activity in major European cities. In England, coffee houses were sometimes referred to as "penny universities" because for the price of a penny, one could purchase a cup of coffee and engage in stimulating conversation with other patrons, many of whom were scholars, merchants, and writers.

In the mid-1600s, coffee was brought to New Amsterdam, later called New York by the British. Though coffee houses rapidly began to appear, it was tea that remained the favoured drink in the New World until 1773, when the colonists revolted against a heavy tax on tea imposed by King George III. The revolt, known as the Boston Tea Party, permanently shifted American preference from tea to coffee.

Today, coffee is grown in a coffee belt around the equator, across more than seventy countries, and is one of the most valuable traded commodities in the world.`,
      questions: {
        create: [
          {
            order: 1,
            type: "TRUE_FALSE_NG",
            promptText: "According to legend, Kaldi discovered coffee's effects by drinking it himself.",
            correctAnswer: "FALSE",
          },
          {
            order: 2,
            type: "TRUE_FALSE_NG",
            promptText: "Coffee houses in the Near East were used only for drinking coffee.",
            correctAnswer: "FALSE",
          },
          {
            order: 3,
            type: "TRUE_FALSE_NG",
            promptText: "Pope Clement VIII banned coffee from being consumed in Europe.",
            correctAnswer: "FALSE",
          },
          {
            order: 4,
            type: "TRUE_FALSE_NG",
            promptText: "The exact number of goats Kaldi owned is known.",
            correctAnswer: "NOT GIVEN",
          },
          {
            order: 5,
            type: "MCQ",
            promptText: "In which century did coffee reach Persia, Egypt, Syria and Turkey?",
            options: JSON.stringify(["14th century", "15th century", "16th century", "17th century"]),
            correctAnswer: "16th century",
          },
          {
            order: 6,
            type: "MCQ",
            promptText: "Why were English coffee houses called 'penny universities'?",
            options: JSON.stringify([
              "Because only university students could enter",
              "Because a penny bought a cup of coffee and access to conversation",
              "Because they were located near universities",
              "Because professors taught classes there",
            ]),
            correctAnswer: "Because a penny bought a cup of coffee and access to conversation",
          },
          {
            order: 7,
            type: "FILL_BLANK",
            promptText: "The event that shifted American preference from tea to coffee was known as the ____.",
            correctAnswer: "Boston Tea Party",
          },
          {
            order: 8,
            type: "FILL_BLANK",
            promptText: "Coffee is grown in a coffee belt around the ____.",
            correctAnswer: "equator",
          },
        ],
      },
    },
  });

  await prisma.test.create({
    data: {
      section: "READING",
      title: "Urban Bee-Keeping",
      description: "Academic Reading passage — 8 questions",
      bodyText: `Over the past two decades, beekeeping has undergone a quiet transformation, moving from rural farms into the heart of major cities. Rooftops in New York, London, and Tokyo now host thousands of managed honeybee colonies, a trend commonly referred to as urban beekeeping. While it might seem counterintuitive to raise bees amid concrete and traffic, cities can actually offer bees a surprisingly hospitable environment.

Urban areas tend to have a greater diversity of flowering plants than the monoculture farmland found in many rural regions, where a single crop, such as corn or soybeans, dominates the landscape for miles. Parks, gardens, balconies, and even roadside verges provide a varied diet for bees throughout the growing season. In addition, cities are typically a few degrees warmer than surrounding rural areas due to the "urban heat island" effect, which can extend the foraging season for bees by several weeks.

However, urban beekeeping is not without its challenges. Bees kept in dense residential areas must be managed carefully to avoid conflicts with neighbours, some of whom may have allergies or simply feel uneasy about insects nearby. Many cities have therefore introduced regulations governing hive placement, requiring beekeepers to register their colonies or to position hives a minimum distance from property lines and public walkways.

Proponents argue that urban beekeeping delivers benefits well beyond honey production. Honeybees are important pollinators, and their presence can improve yields in community gardens and increase the biodiversity of urban green spaces. Beekeeping initiatives have also been adopted by schools and community organisations as a tool for environmental education, teaching participants about ecology, food systems, and the crucial role that pollinators play in agriculture.

Critics, meanwhile, caution that the rapid rise in managed honeybee populations in some cities may inadvertently harm wild, native bee species by increasing competition for limited floral resources. Unlike honeybees, many native bee species are solitary and do not produce surplus honey, yet they are often more efficient pollinators of certain native plants. Conservationists argue that urban greening efforts should prioritise planting a wide variety of native flowering species to support both honeybees and their wild relatives, rather than focusing exclusively on hive numbers.

As cities continue to grow, the debate over how best to balance human development, honeybee populations, and native biodiversity is likely to remain an important topic in urban ecology.`,
      questions: {
        create: [
          {
            order: 1,
            type: "TRUE_FALSE_NG",
            promptText: "Urban areas are always cooler than nearby rural areas.",
            correctAnswer: "FALSE",
          },
          {
            order: 2,
            type: "TRUE_FALSE_NG",
            promptText: "Some cities require beekeepers to place hives a certain distance from walkways.",
            correctAnswer: "TRUE",
          },
          {
            order: 3,
            type: "TRUE_FALSE_NG",
            promptText: "All native bee species produce surplus honey.",
            correctAnswer: "FALSE",
          },
          {
            order: 4,
            type: "TRUE_FALSE_NG",
            promptText: "The exact number of urban beehives in London is stated in the passage.",
            correctAnswer: "NOT GIVEN",
          },
          {
            order: 5,
            type: "MCQ",
            promptText: "According to the passage, why can cities offer a varied diet for bees?",
            options: JSON.stringify([
              "Cities grow only one type of crop",
              "Cities have parks, gardens, and balconies with diverse plants",
              "Cities import flowers from rural farms",
              "Cities have no flowering plants",
            ]),
            correctAnswer: "Cities have parks, gardens, and balconies with diverse plants",
          },
          {
            order: 6,
            type: "MCQ",
            promptText: "What concern do critics raise about urban beekeeping?",
            options: JSON.stringify([
              "It produces too much honey",
              "It may increase competition for native bee species",
              "It requires too much rooftop space",
              "It is too expensive for schools",
            ]),
            correctAnswer: "It may increase competition for native bee species",
          },
          {
            order: 7,
            type: "FILL_BLANK",
            promptText: "The phenomenon that makes cities warmer than surrounding areas is called the urban ____ effect.",
            correctAnswer: "heat island",
          },
          {
            order: 8,
            type: "FILL_BLANK",
            promptText: "Honeybees are important ____, which can improve yields in community gardens.",
            correctAnswer: "pollinators",
          },
        ],
      },
    },
  });

  // ---------- LISTENING ----------
  await prisma.test.create({
    data: {
      section: "LISTENING",
      title: "Community Language Centre — Registration Call",
      description: "Listening Section 1 style — form completion, 8 questions",
      bodyText: `Good morning, thank you for calling the Riverside Community Language Centre. My name is Officer Dana Reyes and I'll be helping you register for a course today.

We currently offer four evening courses: Beginner Spanish, Intermediate French, Beginner Mandarin, and Conversational Italian. Each course runs for ten weeks and meets twice a week, on Tuesdays and Thursdays, from six to eight in the evening.

The Beginner Spanish course starts on the third of March and costs one hundred and twenty dollars. The Intermediate French course starts a week later, on the tenth of March, and costs one hundred and forty dollars because it includes a textbook.

All classes are held in the Riverside Community Centre, in Room 204, on the second floor. Please note that the centre's car park closes at nine in the evening, so plan to leave a little early if you're driving.

To register, you will need to provide your full name, a contact phone number, and an emergency contact. A non-refundable deposit of twenty-five dollars is required to hold your place, and the remaining balance is due on the first day of class.

If you need to cancel, please notify us at least five working days in advance, otherwise the deposit will not be returned. For any further questions, you can reach our office directly at extension 305 between nine and five, Monday to Friday.

Thank you again for choosing the Riverside Community Language Centre, and we look forward to seeing you in class.`,
      questions: {
        create: [
          {
            order: 1,
            type: "FILL_BLANK",
            promptText: "The Beginner Spanish course starts on the third of ____.",
            correctAnswer: "March",
          },
          {
            order: 2,
            type: "FILL_BLANK",
            promptText: "Classes are held in Room ____.",
            correctAnswer: "204",
          },
          {
            order: 3,
            type: "MCQ",
            promptText: "Which two days do classes meet?",
            options: JSON.stringify([
              "Monday and Wednesday",
              "Tuesday and Thursday",
              "Wednesday and Friday",
              "Saturday and Sunday",
            ]),
            correctAnswer: "Tuesday and Thursday",
          },
          {
            order: 4,
            type: "FILL_BLANK",
            promptText: "The Intermediate French course costs $____ because it includes a textbook.",
            correctAnswer: "140|one hundred and forty",
          },
          {
            order: 5,
            type: "TRUE_FALSE_NG",
            promptText: "The car park closes at nine in the evening.",
            correctAnswer: "TRUE",
          },
          {
            order: 6,
            type: "FILL_BLANK",
            promptText: "A non-refundable deposit of $____ is required to hold a place.",
            correctAnswer: "25|twenty-five|twenty five",
          },
          {
            order: 7,
            type: "TRUE_FALSE_NG",
            promptText: "Cancellations made three working days in advance will be refunded.",
            correctAnswer: "FALSE",
          },
          {
            order: 8,
            type: "FILL_BLANK",
            promptText: "Further questions can be directed to extension ____.",
            correctAnswer: "305",
          },
        ],
      },
    },
  });

  await prisma.test.create({
    data: {
      section: "LISTENING",
      title: "Library Orientation Talk",
      description: "Listening Section 3 style — talk on library services, 8 questions",
      bodyText: `Good afternoon, everyone, and welcome to Fairview University Library. My name is Marcus and I'll be giving you a short orientation before you start using the library's services.

The library is open from eight in the morning until midnight on weekdays, and from ten in the morning until six in the evening on weekends. During the final exam period each semester, the library extends its weekday hours until two in the morning.

We have four floors. The ground floor houses the main circulation desk, the café, and the group study rooms, which can be booked online up to two weeks in advance. The second floor contains the general collection and quiet reading areas. The third floor is reserved for postgraduate students and includes individual study carrels. The fourth floor houses our special collections and archives, which require a staff member to accompany you.

Undergraduate students may borrow up to eight books at a time for a period of three weeks, while postgraduate students may borrow up to fifteen books for four weeks. Overdue books are charged at fifty cents per day, per item.

If you need a book that isn't available, you can request it through our inter-library loan service, which typically takes between five and ten working days to arrive. There is no charge for this service for currently enrolled students.

Wireless printing is available on every floor, and the first fifty pages each month are free for all students; after that, printing costs ten cents per page.

Finally, if you ever need help finding a resource, our research librarians are available at the reference desk on the second floor from nine in the morning until seven in the evening, Monday through Friday.

Thank you, and enjoy the library.`,
      questions: {
        create: [
          {
            order: 1,
            type: "FILL_BLANK",
            promptText: "During exam period, the library stays open on weekdays until ____ in the morning.",
            correctAnswer: "two|2",
          },
          {
            order: 2,
            type: "MCQ",
            promptText: "Which floor contains the special collections and archives?",
            options: JSON.stringify(["Ground floor", "Second floor", "Third floor", "Fourth floor"]),
            correctAnswer: "Fourth floor",
          },
          {
            order: 3,
            type: "FILL_BLANK",
            promptText: "Undergraduate students may borrow up to ____ books at a time.",
            correctAnswer: "eight|8",
          },
          {
            order: 4,
            type: "TRUE_FALSE_NG",
            promptText: "Postgraduate students may keep books for three weeks.",
            correctAnswer: "FALSE",
          },
          {
            order: 5,
            type: "FILL_BLANK",
            promptText: "Overdue books are charged ____ cents per day, per item.",
            correctAnswer: "fifty|50",
          },
          {
            order: 6,
            type: "TRUE_FALSE_NG",
            promptText: "Inter-library loan requests are free for currently enrolled students.",
            correctAnswer: "TRUE",
          },
          {
            order: 7,
            type: "FILL_BLANK",
            promptText: "The first ____ pages of printing each month are free.",
            correctAnswer: "fifty|50",
          },
          {
            order: 8,
            type: "MCQ",
            promptText: "Where can students find the research librarians?",
            options: JSON.stringify([
              "Ground floor café",
              "Reference desk on the second floor",
              "Fourth floor archives",
              "Third floor carrels",
            ]),
            correctAnswer: "Reference desk on the second floor",
          },
        ],
      },
    },
  });

  // ---------- WRITING ----------
  await prisma.writingTask.create({
    data: {
      title: "Internet Access Over Time",
      taskType: "TASK1",
      minWords: 150,
      prompt: `The table below shows the percentage of households with internet access in four countries in 2005 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Country       | 2005 | 2020
Country A     | 38%  | 96%
Country B     | 22%  | 89%
Country C     | 15%  | 77%
Country D     | 8%   | 62%

Write at least 150 words.`,
    },
  });

  await prisma.writingTask.create({
    data: {
      title: "Compulsory Community Service",
      taskType: "TASK2",
      minWords: 250,
      prompt: `Some people believe that unpaid community service should be a compulsory part of high school programmes.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.`,
    },
  });

  await prisma.writingTask.create({
    data: {
      title: "Living Alone",
      taskType: "TASK2",
      minWords: 250,
      prompt: `In many countries, the number of people choosing to live alone is increasing.

What are the causes of this trend, and what effects does it have on society?

Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.`,
    },
  });

  // ---------- SPEAKING ----------
  await prisma.speakingTask.create({
    data: {
      title: "Hometown & Skills",
      part: 1,
      promptText: "Let's talk about your hometown.",
      followUps: JSON.stringify([
        "Where is your hometown?",
        "What do you like most about it?",
        "Do you think you will continue living there in the future?",
      ]),
    },
  });
  await prisma.speakingTask.create({
    data: {
      title: "Hometown & Skills",
      part: 2,
      promptText: "Describe a skill you would like to learn.",
      followUps: JSON.stringify([
        "what the skill is",
        "why you want to learn it",
        "how you would learn it",
        "and explain how this skill would be useful to you",
      ]),
    },
  });
  await prisma.speakingTask.create({
    data: {
      title: "Hometown & Skills",
      part: 3,
      promptText: "Let's consider skills and learning in general.",
      followUps: JSON.stringify([
        "Why do some people find it difficult to learn new skills as adults?",
        "Do you think schools should teach practical life skills?",
        "How has technology changed the way people learn new skills?",
      ]),
    },
  });

  await prisma.speakingTask.create({
    data: {
      title: "Free Time & Travel",
      part: 1,
      promptText: "Let's talk about free time.",
      followUps: JSON.stringify([
        "What do you usually do in your free time?",
        "Do you prefer spending free time alone or with others?",
        "Has the way you spend your free time changed since you were a child?",
      ]),
    },
  });
  await prisma.speakingTask.create({
    data: {
      title: "Free Time & Travel",
      part: 2,
      promptText: "Describe a memorable journey you have taken.",
      followUps: JSON.stringify([
        "where you went",
        "who you went with",
        "what you did during the journey",
        "and explain why this journey was memorable to you",
      ]),
    },
  });
  await prisma.speakingTask.create({
    data: {
      title: "Free Time & Travel",
      part: 3,
      promptText: "Let's talk about travel more broadly.",
      followUps: JSON.stringify([
        "How has tourism changed in your country over the last twenty years?",
        "What are the advantages and disadvantages of international tourism?",
        "Do you think space travel will become common for ordinary people in the future?",
      ]),
    },
  });

  console.log("Seed data created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
