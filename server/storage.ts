import { users, lessons, aerroStandards, teacherProgress, type User, type InsertUser, type Lesson, type InsertLesson, type AerroStandard, type InsertStandard, type TeacherProgress, type InsertProgress } from "@shared/schema";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getAllTeachers(): Promise<User[]>;

  // Lesson operations
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLessonsByTeacher(teacherId: number): Promise<Lesson[]>;
  getAllLessons(): Promise<Lesson[]>;
  getLessonById(id: number): Promise<Lesson | undefined>;

  // Standards operations
  getAllStandards(): Promise<AerroStandard[]>;
  getStandardsBySubject(subjectArea: string): Promise<AerroStandard[]>;
  getStandardsByGrade(gradeLevel: string): Promise<AerroStandard[]>;
  getStandardById(id: number): Promise<AerroStandard | undefined>;
  getStandardByCode(code: string): Promise<AerroStandard | undefined>;
  searchStandards(query: string): Promise<AerroStandard[]>;

  // Progress operations
  createProgress(progress: InsertProgress): Promise<TeacherProgress>;
  getProgressByTeacher(teacherId: number): Promise<TeacherProgress[]>;
  getAllProgress(): Promise<TeacherProgress[]>;
  getTeacherStats(teacherId: number): Promise<{
    completedStandards: number;
    totalStandards: number;
    lessonsThisMonth: number;
    subjectAreas: string[];
  }>;

  // Notification operations
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  getUnreadNotificationCount(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lessons: Map<number, Lesson>;
  private standards: Map<number, AerroStandard>;
  private progress: Map<number, TeacherProgress>;
  private notifications: Map<number, Notification>;
  private currentUserId: number;
  private currentLessonId: number;
  private currentStandardId: number;
  private currentProgressId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.lessons = new Map();
    this.standards = new Map();
    this.progress = new Map();
    this.notifications = new Map();
    this.currentUserId = 1;
    this.currentLessonId = 1;
    this.currentStandardId = 1;
    this.currentProgressId = 1;
    this.currentNotificationId = 1;

    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const admin: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "password",
      email: "admin@school.edu",
      firstName: "Admin",
      lastName: "User",
      role: "administrator",
      subjectAreas: [],
      gradeLevels: [],
      createdAt: new Date(),
    };
    this.users.set(admin.id, admin);

    const teacher: User = {
      id: this.currentUserId++,
      username: "msantos",
      password: "password",
      email: "maria.santos@school.edu",
      firstName: "Maria",
      lastName: "Santos",
      role: "teacher",
      subjectAreas: ["Mathematics", "Science", "English Language Arts"],
      gradeLevels: ["3", "4", "5"],
      createdAt: new Date(),
    };
    this.users.set(teacher.id, teacher);

    const teacher2: User = {
      id: this.currentUserId++,
      username: "jdoe",
      password: "password",
      email: "john.doe@school.edu",
      firstName: "John",
      lastName: "Doe",
      role: "teacher",
      subjectAreas: ["Music", "Art"],
      gradeLevels: ["K", "1", "2"],
      createdAt: new Date(),
    };
    this.users.set(teacher2.id, teacher2);

    const teacher3: User = {
      id: this.currentUserId++,
      username: "asmith",
      password: "password",
      email: "anne.smith@school.edu",
      firstName: "Anne",
      lastName: "Smith",
      role: "teacher",
      subjectAreas: ["French", "Social Studies"],
      gradeLevels: ["9", "10", "11", "12"],
      createdAt: new Date(),
    };
    this.users.set(teacher3.id, teacher3);

    // Create comprehensive educational standards for PreK-12
    const comprehensiveStandards: Omit<AerroStandard, 'id'>[] = [
      // PreK Mathematics
      {
        code: "MA.PK.CC.1",
        title: "Count to 10",
        description: "Count to 10 with one-to-one correspondence",
        subjectArea: "Mathematics",
        gradeLevel: "PK",
        category: "Counting and Cardinality"
      },
      {
        code: "MA.PK.G.1",
        title: "Identify basic shapes",
        description: "Identify and name basic two-dimensional shapes (circle, square, triangle, rectangle)",
        subjectArea: "Mathematics",
        gradeLevel: "PK",
        category: "Geometry"
      },
      
      // Kindergarten Mathematics
      {
        code: "MA.K.CC.1",
        title: "Count to 100 by ones and tens",
        description: "Count to 100 by ones and by tens",
        subjectArea: "Mathematics",
        gradeLevel: "K",
        category: "Counting and Cardinality"
      },
      {
        code: "MA.K.OA.1",
        title: "Addition and subtraction within 10",
        description: "Represent addition and subtraction with objects, fingers, mental images, drawings, sounds, acting out situations, verbal explanations, expressions, or equations",
        subjectArea: "Mathematics",
        gradeLevel: "K",
        category: "Operations and Algebraic Thinking"
      },
      
      // Grade 1-5 Mathematics (Common Core aligned)
      {
        code: "MA.1.NBT.1",
        title: "Count to 120",
        description: "Count to 120, starting at any number less than 120",
        subjectArea: "Mathematics",
        gradeLevel: "1",
        category: "Number and Operations in Base Ten"
      },
      {
        code: "MA.2.NBT.1",
        title: "Understand place value",
        description: "Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones",
        subjectArea: "Mathematics",
        gradeLevel: "2",
        category: "Number and Operations in Base Ten"
      },
      {
        code: "MA.3.NBT.1",
        title: "Use place value understanding to round whole numbers",
        description: "Use place value understanding to round whole numbers to the nearest 10 or 100",
        subjectArea: "Mathematics",
        gradeLevel: "3",
        category: "Number and Operations in Base Ten"
      },
      {
        code: "MA.4.NBT.1",
        title: "Recognize place value in multi-digit numbers",
        description: "Recognize that in a multi-digit whole number, a digit in one place represents 10 times as much as it represents in the place to its right",
        subjectArea: "Mathematics",
        gradeLevel: "4",
        category: "Number and Operations in Base Ten"
      },
      {
        code: "MA.5.NBT.1",
        title: "Recognize place value patterns",
        description: "Recognize that in a multi-digit number, a digit in one place represents 10 times as much as it represents in the place to its right and 1/10 of what it represents in the place to its left",
        subjectArea: "Mathematics",
        gradeLevel: "5",
        category: "Number and Operations in Base Ten"
      },
      
      // Middle School Mathematics (6-8)
      {
        code: "MA.6.RP.1",
        title: "Understand ratio concepts",
        description: "Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities",
        subjectArea: "Mathematics",
        gradeLevel: "6",
        category: "Ratios and Proportional Relationships"
      },
      {
        code: "MA.7.RP.1",
        title: "Compute unit rates",
        description: "Compute unit rates associated with ratios of fractions, including ratios of lengths, areas and other quantities measured in like or different units",
        subjectArea: "Mathematics",
        gradeLevel: "7",
        category: "Ratios and Proportional Relationships"
      },
      {
        code: "MA.8.EE.1",
        title: "Know and apply properties of integer exponents",
        description: "Know and apply the properties of integer exponents to generate equivalent numerical expressions",
        subjectArea: "Mathematics",
        gradeLevel: "8",
        category: "Expressions and Equations"
      },
      
      // High School Mathematics (9-12)
      {
        code: "MA.9.A.REI.1",
        title: "Explain steps in solving equations",
        description: "Explain each step in solving a simple equation as following from the equality of numbers asserted at the previous step",
        subjectArea: "Mathematics",
        gradeLevel: "9",
        category: "Algebra - Reasoning with Equations"
      },
      {
        code: "MA.10.G.CO.1",
        title: "Know precise definitions of geometric figures",
        description: "Know precise definitions of angle, circle, perpendicular line, parallel line, and line segment, based on the undefined notions of point, line, distance along a line, and distance around a circular arc",
        subjectArea: "Mathematics",
        gradeLevel: "10",
        category: "Geometry - Congruence"
      },
      {
        code: "MA.11.A.APR.1",
        title: "Understand polynomial identities",
        description: "Understand that polynomials form a system analogous to the integers, namely, they are closed under the operations of addition, subtraction, and multiplication",
        subjectArea: "Mathematics",
        gradeLevel: "11",
        category: "Algebra - Arithmetic with Polynomials"
      },
      {
        code: "MA.12.S.IC.1",
        title: "Understand statistics as a process",
        description: "Understand statistics as a process for making inferences about population parameters based on a random sample from that population",
        subjectArea: "Mathematics",
        gradeLevel: "12",
        category: "Statistics and Probability"
      },
      
      // English Language Arts Standards (PreK-12)
      {
        code: "ELA.PK.SL.1",
        title: "Participate in conversations",
        description: "Participate in collaborative conversations with diverse partners about prekindergarten topics and texts with peers and adults in small and larger groups",
        subjectArea: "English Language Arts",
        gradeLevel: "PK",
        category: "Speaking and Listening"
      },
      {
        code: "ELA.K.RF.1",
        title: "Demonstrate understanding of print concepts",
        description: "Demonstrate understanding of the organization and basic features of print",
        subjectArea: "English Language Arts",
        gradeLevel: "K",
        category: "Reading Foundational Skills"
      },
      {
        code: "ELA.1.RL.1",
        title: "Ask and answer questions about key details",
        description: "Ask and answer questions about key details in a text",
        subjectArea: "English Language Arts",
        gradeLevel: "1",
        category: "Reading Literature"
      },
      {
        code: "ELA.2.W.1",
        title: "Write opinion pieces",
        description: "Write opinion pieces in which they introduce the topic or book they are writing about, state an opinion, supply reasons that support the opinion, use linking words, and provide a concluding statement",
        subjectArea: "English Language Arts",
        gradeLevel: "2",
        category: "Writing"
      },
      {
        code: "ELA.3.RL.1",
        title: "Ask and answer questions to demonstrate understanding",
        description: "Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers",
        subjectArea: "English Language Arts",
        gradeLevel: "3",
        category: "Reading Literature"
      },
      {
        code: "ELA.4.RI.1",
        title: "Refer to details and examples when explaining text",
        description: "Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text",
        subjectArea: "English Language Arts",
        gradeLevel: "4",
        category: "Reading Informational Text"
      },
      {
        code: "ELA.5.W.1",
        title: "Write opinion pieces on topics or texts",
        description: "Write opinion pieces on topics or texts, supporting a point of view with reasons and information",
        subjectArea: "English Language Arts",
        gradeLevel: "5",
        category: "Writing"
      },
      {
        code: "ELA.6.RST.1",
        title: "Cite textual evidence",
        description: "Cite specific textual evidence to support analysis of science and technical texts",
        subjectArea: "English Language Arts",
        gradeLevel: "6",
        category: "Reading in Science and Technical Subjects"
      },
      {
        code: "ELA.7.SL.1",
        title: "Engage in collaborative discussions",
        description: "Engage effectively in a range of collaborative discussions with diverse partners on grade 7 topics, texts, and issues",
        subjectArea: "English Language Arts",
        gradeLevel: "7",
        category: "Speaking and Listening"
      },
      {
        code: "ELA.8.L.1",
        title: "Demonstrate command of grammar conventions",
        description: "Demonstrate command of the conventions of standard English grammar and usage when writing or speaking",
        subjectArea: "English Language Arts",
        gradeLevel: "8",
        category: "Language"
      },
      {
        code: "ELA.9.RL.1",
        title: "Cite strong textual evidence",
        description: "Cite strong and thorough textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text",
        subjectArea: "English Language Arts",
        gradeLevel: "9",
        category: "Reading Literature"
      },
      {
        code: "ELA.10.W.1",
        title: "Write arguments to support claims",
        description: "Write arguments to support claims in an analysis of substantive topics or texts, using valid reasoning and relevant and sufficient evidence",
        subjectArea: "English Language Arts",
        gradeLevel: "10",
        category: "Writing"
      },
      {
        code: "ELA.11.RST.1",
        title: "Cite specific textual evidence",
        description: "Cite specific textual evidence to support analysis of science and technical texts, attending to important distinctions the author makes and to any gaps or inconsistencies in the account",
        subjectArea: "English Language Arts",
        gradeLevel: "11",
        category: "Reading in Science and Technical Subjects"
      },
      {
        code: "ELA.12.SL.1",
        title: "Initiate and participate in collaborative discussions",
        description: "Initiate and participate effectively in a range of collaborative discussions with diverse partners on grades 11-12 topics, texts, and issues",
        subjectArea: "English Language Arts",
        gradeLevel: "12",
        category: "Speaking and Listening"
      },
      
      // Science Standards (NGSS-aligned)
      {
        code: "SC.PK.PS.1",
        title: "Properties of materials",
        description: "Explore and describe properties of everyday materials",
        subjectArea: "Science",
        gradeLevel: "PK",
        category: "Physical Science"
      },
      {
        code: "SC.K.LS.1",
        title: "Living and non-living things",
        description: "Use observations to describe patterns of what plants and animals need to survive",
        subjectArea: "Science",
        gradeLevel: "K",
        category: "Life Science"
      },
      {
        code: "SC.1.PS.4",
        title: "Waves and electromagnetic radiation",
        description: "Plan and conduct investigations to provide evidence that vibrating materials can make sound and that sound can make materials vibrate",
        subjectArea: "Science",
        gradeLevel: "1",
        category: "Physical Science"
      },
      {
        code: "SC.2.LS.1",
        title: "Ecosystems: Interactions, energy, and dynamics",
        description: "Plan and conduct an investigation to determine if plants need sunlight and water to grow",
        subjectArea: "Science",
        gradeLevel: "2",
        category: "Life Science"
      },
      {
        code: "SC.3.PS.2",
        title: "Interactions of matter and energy",
        description: "Plan and conduct an investigation to describe and classify different kinds of materials by their observable properties",
        subjectArea: "Science",
        gradeLevel: "3",
        category: "Physical Science"
      },
      {
        code: "SC.4.ES.1",
        title: "Earth's place in the universe",
        description: "Identify evidence from patterns in rock formations and fossils in rock layers to support an explanation for changes in a landscape over time",
        subjectArea: "Science",
        gradeLevel: "4",
        category: "Earth Science"
      },
      {
        code: "SC.5.PS.1",
        title: "Matter and its interactions",
        description: "Develop a model to describe that matter is made of particles too small to be seen",
        subjectArea: "Science",
        gradeLevel: "5",
        category: "Physical Science"
      },
      {
        code: "SC.6.LS.1",
        title: "From molecules to organisms: Structures and processes",
        description: "Conduct an investigation to provide evidence that living things are made of cells",
        subjectArea: "Science",
        gradeLevel: "6",
        category: "Life Science"
      },
      {
        code: "SC.7.ES.1",
        title: "Earth's systems",
        description: "Develop a model to describe the cycling of Earth's materials and the flow of energy that drives this process",
        subjectArea: "Science",
        gradeLevel: "7",
        category: "Earth Science"
      },
      {
        code: "SC.8.PS.1",
        title: "Matter and its interactions",
        description: "Develop models to describe the atomic composition of simple molecules and extended structures",
        subjectArea: "Science",
        gradeLevel: "8",
        category: "Physical Science"
      },
      {
        code: "SC.9.LS.1",
        title: "From molecules to organisms: Structures and processes",
        description: "Construct an explanation based on evidence for how the structure of DNA determines the structure of proteins",
        subjectArea: "Science",
        gradeLevel: "9",
        category: "Biology"
      },
      {
        code: "SC.10.PS.1",
        title: "Matter and its interactions",
        description: "Use the periodic table as a model to predict the relative properties of elements based on the patterns of electrons in the outermost energy level of atoms",
        subjectArea: "Science",
        gradeLevel: "10",
        category: "Chemistry"
      },
      {
        code: "SC.11.PS.2",
        title: "Interactions of matter and energy",
        description: "Plan and conduct an investigation to provide evidence that the transfer of thermal energy when two components of different temperature are combined within a closed system results in a more uniform energy distribution among the components",
        subjectArea: "Science",
        gradeLevel: "11",
        category: "Physics"
      },
      {
        code: "SC.12.ES.1",
        title: "Earth's place in the universe",
        description: "Construct an explanation of the Big Bang theory based on astronomical evidence of light spectra, motion of distant galaxies, and composition of matter in the universe",
        subjectArea: "Science",
        gradeLevel: "12",
        category: "Earth and Space Science"
      },
      
      // Social Studies Standards
      {
        code: "SS.PK.C.1",
        title: "Civic ideals and practices",
        description: "Identify classroom rules and the importance of following them",
        subjectArea: "Social Studies",
        gradeLevel: "PK",
        category: "Civics"
      },
      {
        code: "SS.K.H.1",
        title: "Time, continuity, and change",
        description: "Compare and contrast past and present events or practices",
        subjectArea: "Social Studies",
        gradeLevel: "K",
        category: "History"
      },
      {
        code: "SS.1.G.1",
        title: "People, places, and environments",
        description: "Use maps and globes to identify continents, oceans, and major countries",
        subjectArea: "Social Studies",
        gradeLevel: "1",
        category: "Geography"
      },
      {
        code: "SS.2.E.1",
        title: "Production, distribution, and consumption",
        description: "Explain how people's choices about buying and selling affect the price of goods and services",
        subjectArea: "Social Studies",
        gradeLevel: "2",
        category: "Economics"
      },
      {
        code: "SS.3.H.1",
        title: "Time, continuity, and change",
        description: "Create and use chronologies to sequence events and distinguish between past, present, and future time periods",
        subjectArea: "Social Studies",
        gradeLevel: "3",
        category: "History"
      },
      {
        code: "SS.4.C.1",
        title: "Civic ideals and practices",
        description: "Identify the key functions of the three branches of national government",
        subjectArea: "Social Studies",
        gradeLevel: "4",
        category: "Civics"
      },
      {
        code: "SS.5.G.1",
        title: "People, places, and environments",
        description: "Use latitude and longitude coordinates to identify absolute locations",
        subjectArea: "Social Studies",
        gradeLevel: "5",
        category: "Geography"
      },
      {
        code: "SS.6.H.1",
        title: "Ancient civilizations",
        description: "Describe the rise of civilizations in Mesopotamia, Egypt, and the Indus Valley",
        subjectArea: "Social Studies",
        gradeLevel: "6",
        category: "Ancient History"
      },
      {
        code: "SS.7.H.1",
        title: "Medieval and early modern history",
        description: "Analyze the causes and effects of the fall of the Roman Empire",
        subjectArea: "Social Studies",
        gradeLevel: "7",
        category: "Medieval History"
      },
      {
        code: "SS.8.H.1",
        title: "American history through Reconstruction",
        description: "Analyze the causes and effects of the American Revolution",
        subjectArea: "Social Studies",
        gradeLevel: "8",
        category: "American History"
      },
      {
        code: "SS.9.H.1",
        title: "World history and civilizations",
        description: "Evaluate the impact of World War I on global political and social structures",
        subjectArea: "Social Studies",
        gradeLevel: "9",
        category: "World History"
      },
      {
        code: "SS.10.C.1",
        title: "Government and democracy",
        description: "Analyze the structure and function of the U.S. Constitution and Bill of Rights",
        subjectArea: "Social Studies",
        gradeLevel: "10",
        category: "Government"
      },
      {
        code: "SS.11.H.1",
        title: "Modern American history",
        description: "Evaluate the causes and effects of major social and political movements in 20th century America",
        subjectArea: "Social Studies",
        gradeLevel: "11",
        category: "Modern American History"
      },
      {
        code: "SS.12.E.1",
        title: "Advanced economics",
        description: "Analyze the role of government in addressing market failures and promoting economic stability",
        subjectArea: "Social Studies",
        gradeLevel: "12",
        category: "Economics"
      },
      
      // Music Standards
      {
        code: "MU.PK.CR.1",
        title: "Explore musical sounds",
        description: "Explore and experience music concepts through singing, playing instruments, and moving",
        subjectArea: "Music",
        gradeLevel: "PK",
        category: "Creating"
      },
      {
        code: "MU.K.RE.1",
        title: "Respond to music",
        description: "Demonstrate how interests, knowledge, and skills relate to personal choices and intent when creating, performing, and responding to music",
        subjectArea: "Music",
        gradeLevel: "K",
        category: "Responding"
      },
      {
        code: "MU.1.PR.1",
        title: "Perform music with expression",
        description: "Demonstrate and state personal interest in, knowledge about, and purpose of varied musical selections",
        subjectArea: "Music",
        gradeLevel: "1",
        category: "Performing"
      },
      {
        code: "MU.2.CR.1",
        title: "Create musical ideas",
        description: "Improvise rhythmic, melodic, and harmonic ideas, and explain connection to specific purpose and context",
        subjectArea: "Music",
        gradeLevel: "2",
        category: "Creating"
      },
      {
        code: "MU.3.CN.1",
        title: "Connect music to other subjects",
        description: "Demonstrate understanding of relationships between music and the other arts, other disciplines, varied contexts, and daily life",
        subjectArea: "Music",
        gradeLevel: "3",
        category: "Connecting"
      },
      {
        code: "MU.4.PR.2",
        title: "Interpret musical works",
        description: "Demonstrate understanding of musical concepts conveying creators' intent through prepared performances of varied repertoire",
        subjectArea: "Music",
        gradeLevel: "4",
        category: "Performing"
      },
      {
        code: "MU.5.RE.2",
        title: "Analyze musical works",
        description: "Demonstrate and explain how musical concepts convey meaning and intent in musical works",
        subjectArea: "Music",
        gradeLevel: "5",
        category: "Responding"
      },
      {
        code: "MU.6.CR.2",
        title: "Organize musical ideas",
        description: "Select and develop musical ideas for defined purposes and contexts using digital tools and resources",
        subjectArea: "Music",
        gradeLevel: "6",
        category: "Creating"
      },
      {
        code: "MU.7.PR.3",
        title: "Refine musical performances",
        description: "Evaluate and refine personal and ensemble performances, individually or in collaboration with others",
        subjectArea: "Music",
        gradeLevel: "7",
        category: "Performing"
      },
      {
        code: "MU.8.CN.2",
        title: "Relate musical ideas to varied contexts",
        description: "Understand relationships between music and the other arts, other disciplines, varied contexts, and daily life",
        subjectArea: "Music",
        gradeLevel: "8",
        category: "Connecting"
      },
      {
        code: "MU.9.CR.3",
        title: "Refine and complete artistic work",
        description: "Evaluate and refine selected musical ideas to create musical work that meets appropriate criteria",
        subjectArea: "Music",
        gradeLevel: "9",
        category: "Creating"
      },
      {
        code: "MU.10.PR.4",
        title: "Select artistic work for presentation",
        description: "Select varied musical works to present based on interest, knowledge, technical skill, and context",
        subjectArea: "Music",
        gradeLevel: "10",
        category: "Performing"
      },
      {
        code: "MU.11.RE.3",
        title: "Interpret intent and meaning",
        description: "Interpret intent and meaning in artistic work using diverse and developing perspectives",
        subjectArea: "Music",
        gradeLevel: "11",
        category: "Responding"
      },
      {
        code: "MU.12.CN.3",
        title: "Synthesize knowledge of music",
        description: "Synthesize and relate knowledge and personal experiences to make music that embodies artistic intent",
        subjectArea: "Music",
        gradeLevel: "12",
        category: "Connecting"
      },
      
      // Art Standards
      {
        code: "AR.PK.CR.1",
        title: "Generate artistic ideas",
        description: "Engage in exploration and imaginative play with art materials",
        subjectArea: "Art",
        gradeLevel: "PK",
        category: "Creating"
      },
      {
        code: "AR.K.PR.1",
        title: "Present artistic work",
        description: "Select art objects for personal portfolios and display, explaining why they were chosen",
        subjectArea: "Art",
        gradeLevel: "K",
        category: "Presenting"
      },
      {
        code: "AR.1.RE.1",
        title: "Perceive and analyze artistic work",
        description: "Use art vocabulary to describe observations about familiar objects and works of art",
        subjectArea: "Art",
        gradeLevel: "1",
        category: "Responding"
      },
      {
        code: "AR.2.CN.1",
        title: "Synthesize knowledge of art",
        description: "Create art or design with various materials and tools to explore personal interests, questions, and curiosity",
        subjectArea: "Art",
        gradeLevel: "2",
        category: "Connecting"
      },
      {
        code: "AR.3.CR.2",
        title: "Organize artistic ideas",
        description: "Create personally satisfying artwork using a variety of artistic processes and materials",
        subjectArea: "Art",
        gradeLevel: "3",
        category: "Creating"
      },
      {
        code: "AR.4.PR.2",
        title: "Develop artistic work for presentation",
        description: "Analyze how past, present, and emerging technologies have impacted the preservation and presentation of artwork",
        subjectArea: "Art",
        gradeLevel: "4",
        category: "Presenting"
      },
      {
        code: "AR.5.RE.2",
        title: "Interpret artistic work",
        description: "Identify and analyze cultural associations suggested by visual imagery",
        subjectArea: "Art",
        gradeLevel: "5",
        category: "Responding"
      },
      {
        code: "AR.6.CN.2",
        title: "Relate artistic ideas to varied contexts",
        description: "Analyze how art reflects changing times, traditions, resources, and cultural uses",
        subjectArea: "Art",
        gradeLevel: "6",
        category: "Connecting"
      },
      {
        code: "AR.7.CR.3",
        title: "Refine artistic work",
        description: "Reflect on and explain important information about an artwork in an artist statement",
        subjectArea: "Art",
        gradeLevel: "7",
        category: "Creating"
      },
      {
        code: "AR.8.PR.3",
        title: "Share artistic work",
        description: "Analyze and evaluate reasons for saving and displaying specific objects, artifacts, and artwork",
        subjectArea: "Art",
        gradeLevel: "8",
        category: "Presenting"
      },
      {
        code: "AR.9.RE.3",
        title: "Apply criteria to evaluate artistic work",
        description: "Interpret art by analyzing artmaking approaches, the characteristics of form and structure, and the use of media",
        subjectArea: "Art",
        gradeLevel: "9",
        category: "Responding"
      },
      {
        code: "AR.10.CN.3",
        title: "Synthesize knowledge of art",
        description: "Document the process of developing ideas from early stages to fully elaborated ideas",
        subjectArea: "Art",
        gradeLevel: "10",
        category: "Connecting"
      },
      {
        code: "AR.11.CR.4",
        title: "Select artistic work for presentation",
        description: "Through experimentation, practice, and persistence, demonstrate acquisition of skills and knowledge in a chosen art form",
        subjectArea: "Art",
        gradeLevel: "11",
        category: "Creating"
      },
      {
        code: "AR.12.PR.4",
        title: "Analyze artistic work for presentation",
        description: "Analyze, select, and curate artifacts and/or artworks for presentation and preservation",
        subjectArea: "Art",
        gradeLevel: "12",
        category: "Presenting"
      },
      
      // French (World Language) Standards
      {
        code: "FR.K.CM.1",
        title: "Interpersonal communication",
        description: "Interact with others using memorized words and phrases on familiar topics",
        subjectArea: "French",
        gradeLevel: "K",
        category: "Communication"
      },
      {
        code: "FR.1.CU.1",
        title: "Cultural practices and perspectives",
        description: "Identify some common practices and perspectives of cultures that use the target language",
        subjectArea: "French",
        gradeLevel: "1",
        category: "Cultures"
      },
      {
        code: "FR.2.CN.1",
        title: "Connect with other disciplines",
        description: "Use information acquired in the target language to reinforce and expand knowledge of other disciplines",
        subjectArea: "French",
        gradeLevel: "2",
        category: "Connections"
      },
      {
        code: "FR.3.CP.1",
        title: "Language comparisons",
        description: "Compare similarities and differences between the target language and English",
        subjectArea: "French",
        gradeLevel: "3",
        category: "Comparisons"
      },
      {
        code: "FR.4.CO.1",
        title: "School and global communities",
        description: "Use the target language both within and beyond the school setting",
        subjectArea: "French",
        gradeLevel: "4",
        category: "Communities"
      },
      {
        code: "FR.5.CM.2",
        title: "Interpretive communication",
        description: "Understand the main idea and some details in short, simple texts on familiar topics",
        subjectArea: "French",
        gradeLevel: "5",
        category: "Communication"
      },
      {
        code: "FR.6.CU.2",
        title: "Cultural products and perspectives",
        description: "Identify some common products of cultures that use the target language and how they reflect perspectives",
        subjectArea: "French",
        gradeLevel: "6",
        category: "Cultures"
      },
      {
        code: "FR.7.CN.2",
        title: "Distinctive viewpoints",
        description: "Acquire information and diverse perspectives that are available only through the target language",
        subjectArea: "French",
        gradeLevel: "7",
        category: "Connections"
      },
      {
        code: "FR.8.CP.2",
        title: "Language and culture connections",
        description: "Compare similarities and differences between cultures that use the target language and one's own culture",
        subjectArea: "French",
        gradeLevel: "8",
        category: "Comparisons"
      },
      {
        code: "FR.9.CM.3",
        title: "Presentational communication",
        description: "Present information on familiar topics using connected sentences with some detail",
        subjectArea: "French",
        gradeLevel: "9",
        category: "Communication"
      },
      {
        code: "FR.10.CU.3",
        title: "Cultural understanding",
        description: "Analyze how cultural perspectives are reflected in a variety of cultural practices and products",
        subjectArea: "French",
        gradeLevel: "10",
        category: "Cultures"
      },
      {
        code: "FR.11.CO.2",
        title: "Lifelong learning",
        description: "Use the target language for personal enjoyment and enrichment",
        subjectArea: "French",
        gradeLevel: "11",
        category: "Communities"
      },
      {
        code: "FR.12.CM.4",
        title: "Advanced communication",
        description: "Engage in extended discourse on complex topics with fluency and accuracy",
        subjectArea: "French",
        gradeLevel: "12",
        category: "Communication"
      }
    ];

    comprehensiveStandards.forEach(standard => {
      const fullStandard: AerroStandard = {
        ...standard,
        id: this.currentStandardId++
      };
      this.standards.set(fullStandard.id, fullStandard);
    });

    // Create sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: this.currentNotificationId++,
        userId: 2, // Maria Santos
        title: "Welcome to EduTrack!",
        message: "Start by adding your first lesson and mapping it to AERRO standards.",
        type: "info",
        read: false,
        createdAt: new Date()
      },
      {
        id: this.currentNotificationId++,
        userId: 2,
        title: "Standards Progress",
        message: "You're making great progress! Keep adding lessons to track your standards coverage.",
        type: "success",
        read: false,
        createdAt: new Date()
      },
      {
        id: this.currentNotificationId++,
        userId: 1, // Admin
        title: "System Update",
        message: "The platform has been updated with new features for teacher management.",
        type: "info",
        read: false,
        createdAt: new Date()
      }
    ];

    sampleNotifications.forEach(notification => {
      this.notifications.set(notification.id, notification);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
      role: insertUser.role || "teacher",
      subjectAreas: insertUser.subjectAreas || [],
      gradeLevels: insertUser.gradeLevels || [],
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllTeachers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "teacher");
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const lesson: Lesson = {
      ...insertLesson,
      id: this.currentLessonId++,
      createdAt: new Date(),
      description: insertLesson.description || null,
      standardsCovered: insertLesson.standardsCovered || [],
    };
    this.lessons.set(lesson.id, lesson);
    return lesson;
  }

  async getLessonsByTeacher(teacherId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).filter(lesson => lesson.teacherId === teacherId);
  }

  async getAllLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }

  async getLessonById(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async getAllStandards(): Promise<AerroStandard[]> {
    return Array.from(this.standards.values());
  }

  async getStandardsBySubject(subjectArea: string): Promise<AerroStandard[]> {
    return Array.from(this.standards.values()).filter(standard => 
      standard.subjectArea.toLowerCase() === subjectArea.toLowerCase()
    );
  }

  async getStandardsByGrade(gradeLevel: string): Promise<AerroStandard[]> {
    return Array.from(this.standards.values()).filter(standard => 
      standard.gradeLevel === gradeLevel
    );
  }

  async getStandardById(id: number): Promise<AerroStandard | undefined> {
    return this.standards.get(id);
  }

  async getStandardByCode(code: string): Promise<AerroStandard | undefined> {
    return Array.from(this.standards.values()).find(standard => standard.code === code);
  }

  async searchStandards(query: string): Promise<AerroStandard[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.standards.values()).filter(standard =>
      standard.code.toLowerCase().includes(lowercaseQuery) ||
      standard.title.toLowerCase().includes(lowercaseQuery) ||
      standard.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createProgress(insertProgress: InsertProgress): Promise<TeacherProgress> {
    const progress: TeacherProgress = {
      ...insertProgress,
      id: this.currentProgressId++,
      lessonId: insertProgress.lessonId || null,
    };
    this.progress.set(progress.id, progress);
    return progress;
  }

  async getProgressByTeacher(teacherId: number): Promise<TeacherProgress[]> {
    return Array.from(this.progress.values()).filter(p => p.teacherId === teacherId);
  }

  async getAllProgress(): Promise<TeacherProgress[]> {
    return Array.from(this.progress.values());
  }

  async getTeacherStats(teacherId: number): Promise<{
    completedStandards: number;
    totalStandards: number;
    lessonsThisMonth: number;
    subjectAreas: string[];
  }> {
    const user = await this.getUser(teacherId);
    const progress = await this.getProgressByTeacher(teacherId);
    const lessons = await this.getLessonsByTeacher(teacherId);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lessonsThisMonth = lessons.filter(lesson => {
      const lessonDate = new Date(lesson.dateTaught);
      return lessonDate.getMonth() === currentMonth && lessonDate.getFullYear() === currentYear;
    }).length;

    return {
      completedStandards: progress.length,
      totalStandards: this.standards.size,
      lessonsThisMonth,
      subjectAreas: user?.subjectAreas || [],
    };
  }

  // Notification operations
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: this.currentNotificationId++,
      createdAt: new Date()
    };
    this.notifications.set(newNotification.id, newNotification);
    return newNotification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.notifications.set(notificationId, notification);
    }
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .length;
  }
}

export const storage = new MemStorage();
