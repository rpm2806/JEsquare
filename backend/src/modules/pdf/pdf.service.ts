import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  generateQuestionPaperHtml,
  generateAnswerKeyHtml,
} from './templates/pdf-templates';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private prisma: PrismaService) {}

  async generateQuestionPaper(testId: string): Promise<{ html: string; filename: string }> {
    const test = await this.getTestWithQuestions(testId);
    const institute = test.instituteId
      ? await this.prisma.institute.findUnique({ where: { id: test.instituteId } })
      : null;

    const html = generateQuestionPaperHtml(test, institute);
    const filename = `${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_Question_Paper.html`;

    this.logger.log(`Generated question paper HTML for test: ${testId}`);

    // In production, you would use Puppeteer to convert HTML to PDF:
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(html);
    // const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    // await browser.close();
    // return { buffer: pdfBuffer, filename: filename.replace('.html', '.pdf') };

    return { html, filename };
  }

  async generateAnswerKey(testId: string): Promise<{ html: string; filename: string }> {
    const test = await this.getTestWithFullQuestions(testId);
    const institute = test.instituteId
      ? await this.prisma.institute.findUnique({ where: { id: test.instituteId } })
      : null;

    const html = generateAnswerKeyHtml(test, institute);
    const filename = `${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_Answer_Key.html`;

    this.logger.log(`Generated answer key HTML for test: ${testId}`);

    return { html, filename };
  }

  async checkUserAttempt(testId: string, studentId: string): Promise<boolean> {
    const attempt = await this.prisma.attempt.findFirst({
      where: {
        testId,
        studentId,
        status: { in: ['EVALUATED', 'SUBMITTED'] },
      },
    });
    return !!attempt;
  }

  private async getTestWithQuestions(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                question: {
                  select: {
                    id: true,
                    type: true,
                    text: true,
                    optionA: true,
                    optionB: true,
                    optionC: true,
                    optionD: true,
                    difficulty: true,
                    questionImage: true,
                    subject: { select: { name: true } },
                    chapter: { select: { name: true } },
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        questions: {
          include: {
            question: {
              select: {
                id: true,
                type: true,
                text: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                difficulty: true,
                questionImage: true,
                subject: { select: { name: true } },
                chapter: { select: { name: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    return test;
  }

  private async getTestWithFullQuestions(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                question: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        questions: {
          include: {
            question: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    return test;
  }
}
