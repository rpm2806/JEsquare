import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Create Super Admin ───
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@jeesaas.com' },
    update: { roleConfirmed: true },
    create: {
      name: 'Super Admin',
      email: 'admin@jeesaas.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      roleConfirmed: true,
      phone: '+91-9999999999',
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // ─── Create Sample Teacher ───
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@jeesaas.com' },
    update: { roleConfirmed: true },
    create: {
      name: 'Anil Kumar',
      email: 'teacher@jeesaas.com',
      password: hashedPassword,
      role: 'TEACHER',
      roleConfirmed: true,
      phone: '+91-9888888888',
    },
  });
  console.log(`✅ Teacher created: ${teacher.email}`);

  // ─── Create Sample Student ───
  const student = await prisma.user.upsert({
    where: { email: 'student@jeesaas.com' },
    update: { roleConfirmed: true },
    create: {
      name: 'Rahul Sharma',
      email: 'student@jeesaas.com',
      password: hashedPassword,
      role: 'STUDENT',
      roleConfirmed: true,
      phone: '+91-9777777777',
    },
  });
  console.log(`✅ Student created: ${student.email}`);

  // ─── Create Subjects ───
  const physics = await prisma.subject.upsert({
    where: { name: 'Physics' },
    update: {},
    create: { name: 'Physics', order: 1 },
  });

  const chemistry = await prisma.subject.upsert({
    where: { name: 'Chemistry' },
    update: {},
    create: { name: 'Chemistry', order: 2 },
  });

  const mathematics = await prisma.subject.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: { name: 'Mathematics', order: 3 },
  });

  console.log(`✅ Subjects created: Physics, Chemistry, Mathematics`);

  // ─── Create Chapters ───
  // Physics chapters
  const physicsChapters = [
    'Mechanics',
    'Thermodynamics',
    'Electrostatics',
    'Magnetism',
    'Optics',
    'Modern Physics',
    'Waves',
  ];
  const physChapRecords: any[] = [];
  for (let i = 0; i < physicsChapters.length; i++) {
    const ch = await prisma.chapter.create({
      data: {
        name: physicsChapters[i],
        subjectId: physics.id,
        order: i + 1,
      },
    });
    physChapRecords.push(ch);
  }

  // Chemistry chapters
  const chemistryChapters = [
    'Physical Chemistry',
    'Organic Chemistry',
    'Inorganic Chemistry',
    'Chemical Bonding',
    'Electrochemistry',
    'Chemical Kinetics',
  ];
  const chemChapRecords: any[] = [];
  for (let i = 0; i < chemistryChapters.length; i++) {
    const ch = await prisma.chapter.create({
      data: {
        name: chemistryChapters[i],
        subjectId: chemistry.id,
        order: i + 1,
      },
    });
    chemChapRecords.push(ch);
  }

  // Mathematics chapters
  const mathChapters = [
    'Algebra',
    'Calculus',
    'Coordinate Geometry',
    'Trigonometry',
    'Probability & Statistics',
    'Vectors & 3D Geometry',
  ];
  const mathChapRecords: any[] = [];
  for (let i = 0; i < mathChapters.length; i++) {
    const ch = await prisma.chapter.create({
      data: {
        name: mathChapters[i],
        subjectId: mathematics.id,
        order: i + 1,
      },
    });
    mathChapRecords.push(ch);
  }

  console.log(`✅ Chapters created for all subjects`);

  // ─── Create Topics ───
  const mechanicsTopics = ['Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion', 'Gravitation'];
  for (let i = 0; i < mechanicsTopics.length; i++) {
    await prisma.topic.create({
      data: {
        name: mechanicsTopics[i],
        chapterId: physChapRecords[0].id,
        order: i + 1,
      },
    });
  }

  const algebraTopics = ['Quadratic Equations', 'Complex Numbers', 'Sequences & Series', 'Matrices & Determinants'];
  for (let i = 0; i < algebraTopics.length; i++) {
    await prisma.topic.create({
      data: {
        name: algebraTopics[i],
        chapterId: mathChapRecords[0].id,
        order: i + 1,
      },
    });
  }
  console.log(`✅ Topics created`);

  // ─── Create Sample Questions ───
  // Physics Questions
  const physicsQuestions = [
    {
      type: 'MCQ',
      text: 'A ball is thrown vertically upward with a velocity of 20 m/s from the top of a building 50 m high. What is the maximum height reached above the ground?',
      optionA: '60.4 m',
      optionB: '70.4 m',
      optionC: '80.4 m',
      optionD: '90.4 m',
      correctAnswer: 'B',
      difficulty: 'MEDIUM',
      solution: 'Using v² = u² - 2gh, h = u²/(2g) = 400/19.6 = 20.4m. Total height = 50 + 20.4 = 70.4m',
    },
    {
      type: 'MCQ',
      text: 'The dimension of Planck\'s constant is the same as that of:',
      optionA: 'Energy',
      optionB: 'Power',
      optionC: 'Angular momentum',
      optionD: 'Linear momentum',
      correctAnswer: 'C',
      difficulty: 'EASY',
      solution: '[h] = [ML²T⁻¹] which is same as angular momentum',
    },
    {
      type: 'NUMERICAL',
      text: 'A car accelerates from rest at 2 m/s². Find the distance covered in the first 5 seconds (in meters).',
      correctAnswer: '25',
      numericalAnswer: 25,
      difficulty: 'EASY',
      solution: 's = ut + ½at² = 0 + ½(2)(25) = 25 m',
    },
    {
      type: 'MCQ',
      text: 'In a Young\'s double-slit experiment, the fringe width is found to be 0.4 mm. If the whole apparatus is immersed in water of refractive index 4/3, the fringe width becomes:',
      optionA: '0.2 mm',
      optionB: '0.3 mm',
      optionC: '0.4 mm',
      optionD: '0.53 mm',
      correctAnswer: 'B',
      difficulty: 'HARD',
      solution: 'In water, wavelength decreases by factor μ. New fringe width = 0.4 × (3/4) = 0.3 mm',
    },
    {
      type: 'MULTI_CORRECT',
      text: 'Which of the following are conservative forces?',
      optionA: 'Gravitational force',
      optionB: 'Frictional force',
      optionC: 'Electrostatic force',
      optionD: 'Viscous force',
      correctAnswer: 'A,C',
      difficulty: 'MEDIUM',
      solution: 'Gravitational and electrostatic forces are conservative. Friction and viscous forces are non-conservative.',
    },
    {
      type: 'MCQ',
      text: 'The escape velocity of a body from the surface of the Earth is approximately:',
      optionA: '7.9 km/s',
      optionB: '11.2 km/s',
      optionC: '15.0 km/s',
      optionD: '3.1 km/s',
      correctAnswer: 'B',
      difficulty: 'EASY',
      solution: 'Escape velocity = √(2gR) ≈ 11.2 km/s for Earth',
    },
  ];

  for (const q of physicsQuestions) {
    await prisma.question.create({
      data: {
        ...q,
        subjectId: physics.id,
        chapterId: physChapRecords[0].id,
        createdById: teacher.id,
        isVerified: true,
        source: 'JEE Previous Year',
      },
    });
  }
  console.log(`✅ ${physicsQuestions.length} Physics questions created`);

  // Chemistry Questions
  const chemistryQuestions = [
    {
      type: 'MCQ',
      text: 'Which of the following has the highest ionization energy?',
      optionA: 'Na',
      optionB: 'Mg',
      optionC: 'Al',
      optionD: 'Ne',
      correctAnswer: 'D',
      difficulty: 'EASY',
      solution: 'Noble gases have the highest ionization energy due to stable electron configuration.',
    },
    {
      type: 'MCQ',
      text: 'The hybridization of carbon in methane (CH₄) is:',
      optionA: 'sp',
      optionB: 'sp²',
      optionC: 'sp³',
      optionD: 'sp³d',
      correctAnswer: 'C',
      difficulty: 'EASY',
      solution: 'Carbon in CH₄ forms 4 sigma bonds, requiring sp³ hybridization.',
    },
    {
      type: 'NUMERICAL',
      text: 'The pH of a 0.01 M HCl solution is:',
      correctAnswer: '2',
      numericalAnswer: 2,
      difficulty: 'EASY',
      solution: 'pH = -log[H⁺] = -log(0.01) = 2',
    },
    {
      type: 'MCQ',
      text: 'Which of the following is an example of a Lewis acid?',
      optionA: 'NH₃',
      optionB: 'BF₃',
      optionC: 'H₂O',
      optionD: 'OH⁻',
      correctAnswer: 'B',
      difficulty: 'MEDIUM',
      solution: 'BF₃ is an electron-pair acceptor (Lewis acid) due to its incomplete octet on Boron.',
    },
    {
      type: 'MCQ',
      text: 'The IUPAC name of CH₃-CH=CH-CHO is:',
      optionA: 'But-2-enal',
      optionB: 'But-2-enoic acid',
      optionC: 'But-3-enal',
      optionD: 'Butenal',
      correctAnswer: 'A',
      difficulty: 'MEDIUM',
      solution: 'The compound is an unsaturated aldehyde with 4 carbons. Double bond at C2, aldehyde group gives priority.',
    },
    {
      type: 'MULTI_CORRECT',
      text: 'Which of the following are properties of ionic compounds?',
      optionA: 'High melting point',
      optionB: 'Conduct electricity in molten state',
      optionC: 'Soluble in non-polar solvents',
      optionD: 'Form crystalline solids',
      correctAnswer: 'A,B,D',
      difficulty: 'MEDIUM',
      solution: 'Ionic compounds have high MP, conduct electricity when dissolved/molten, form crystals, but are NOT soluble in non-polar solvents.',
    },
  ];

  for (const q of chemistryQuestions) {
    await prisma.question.create({
      data: {
        ...q,
        subjectId: chemistry.id,
        chapterId: chemChapRecords[0].id,
        createdById: teacher.id,
        isVerified: true,
        source: 'JEE Previous Year',
      },
    });
  }
  console.log(`✅ ${chemistryQuestions.length} Chemistry questions created`);

  // Mathematics Questions
  const mathQuestions = [
    {
      type: 'MCQ',
      text: 'If the roots of x² - 5x + 6 = 0 are α and β, then α² + β² equals:',
      optionA: '11',
      optionB: '13',
      optionC: '25',
      optionD: '7',
      correctAnswer: 'B',
      difficulty: 'EASY',
      solution: 'α + β = 5, αβ = 6. α² + β² = (α+β)² - 2αβ = 25 - 12 = 13',
    },
    {
      type: 'MCQ',
      text: 'The value of ∫₀¹ x·eˣ dx is:',
      optionA: '1',
      optionB: 'e',
      optionC: 'e - 1',
      optionD: '1',
      correctAnswer: 'A',
      difficulty: 'MEDIUM',
      solution: 'Using integration by parts: ∫x·eˣdx = x·eˣ - eˣ + C. Evaluating from 0 to 1: (e-e) - (0-1) = 1',
    },
    {
      type: 'NUMERICAL',
      text: 'The number of ways to arrange the letters of the word "MISSISSIPPI" is 34650. Find the number of distinct permutations divided by 10 (answer as integer).',
      correctAnswer: '3465',
      numericalAnswer: 3465,
      difficulty: 'HARD',
      solution: '11!/(4!4!2!) = 34650. Divided by 10 = 3465',
    },
    {
      type: 'MCQ',
      text: 'The derivative of sin(x²) with respect to x is:',
      optionA: 'cos(x²)',
      optionB: '2x·cos(x²)',
      optionC: 'x·cos(x²)',
      optionD: '2·cos(x²)',
      correctAnswer: 'B',
      difficulty: 'EASY',
      solution: 'Using chain rule: d/dx[sin(x²)] = cos(x²) · 2x = 2x·cos(x²)',
    },
    {
      type: 'MCQ',
      text: 'The equation of the tangent to the circle x² + y² = 25 at the point (3, 4) is:',
      optionA: '3x + 4y = 25',
      optionB: '4x + 3y = 25',
      optionC: '3x + 4y = 12',
      optionD: '4x + 3y = 24',
      correctAnswer: 'A',
      difficulty: 'MEDIUM',
      solution: 'Tangent to x² + y² = a² at (x₁,y₁) is xx₁ + yy₁ = a². So 3x + 4y = 25',
    },
    {
      type: 'MULTI_CORRECT',
      text: 'Which of the following functions are continuous at x = 0?',
      optionA: 'f(x) = |x|',
      optionB: 'f(x) = 1/x',
      optionC: 'f(x) = sin(x)/x (defined as 1 at x=0)',
      optionD: 'f(x) = x²',
      correctAnswer: 'A,C,D',
      difficulty: 'HARD',
      solution: '|x| is continuous everywhere. sin(x)/x → 1 as x→0 so its continuous if defined as 1 at 0. x² is continuous. 1/x is not defined at 0.',
    },
  ];

  for (const q of mathQuestions) {
    await prisma.question.create({
      data: {
        ...q,
        subjectId: mathematics.id,
        chapterId: mathChapRecords[0].id,
        createdById: teacher.id,
        isVerified: true,
        source: 'JEE Previous Year',
      },
    });
  }
  console.log(`✅ ${mathQuestions.length} Mathematics questions created`);

  // ─── Create Seeded Mock Test ───
  console.log('\n🌱 Seeding JEsquare Official Main Mock Test 1...');
  const seededTest = await prisma.test.create({
    data: {
      title: 'JEsquare Official Main Mock Test 1',
      description: 'Comprehensive practice mock exam covering Physics, Chemistry, and Mathematics from the latest syllabus.',
      type: 'FULL_SYLLABUS',
      duration: 180,
      totalMarks: 72,
      isPublished: true, // Mark as published immediately!
      createdById: superAdmin.id,
    },
  });

  const subjects = [physics, chemistry, mathematics];

  for (let sIdx = 0; sIdx < subjects.length; sIdx++) {
    const sub = subjects[sIdx];

    // Fetch question records created in database for this subject
    const dbQs = await prisma.question.findMany({
      where: { subjectId: sub.id },
    });

    // Create Section
    const section = await prisma.testSection.create({
      data: {
        testId: seededTest.id,
        name: sub.name,
        order: sIdx,
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
        maxQuestions: dbQs.length,
      },
    });

    // Link questions to the section
    for (let qIdx = 0; qIdx < dbQs.length; qIdx++) {
      await prisma.testQuestion.create({
        data: {
          testId: seededTest.id,
          sectionId: section.id,
          questionId: dbQs[qIdx].id,
          order: qIdx,
        },
      });
    }
  }
  console.log('✅ JEsquare Official Main Mock Test 1 seeded successfully!');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:   admin@jeesaas.com / admin123');
  console.log('  Teacher: teacher@jeesaas.com / admin123');
  console.log('  Student: student@jeesaas.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
