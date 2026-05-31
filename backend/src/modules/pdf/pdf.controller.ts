import {
  Controller,
  Post,
  Param,
  Res,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('PDF')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate/:testId')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Generate question paper PDF/HTML for a test' })
  @ApiResponse({ status: 200, description: 'Question paper generated' })
  async generatePaper(
    @Param('testId') testId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    if (user.role === 'STUDENT') {
      const hasAttempted = await this.pdfService.checkUserAttempt(testId, user.id);
      if (!hasAttempted) {
        throw new ForbiddenException(
          'You must complete the test first before exporting it as a PDF.',
        );
      }
    }

    const result = await this.pdfService.generateQuestionPaper(testId);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.html);
  }

  @Post('answer-key/:testId')
  @Roles('SUPER_ADMIN', 'INSTITUTE_ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Generate answer key PDF/HTML for a test' })
  @ApiResponse({ status: 200, description: 'Answer key generated' })
  async generateAnswerKey(
    @Param('testId') testId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    if (user.role === 'STUDENT') {
      const hasAttempted = await this.pdfService.checkUserAttempt(testId, user.id);
      if (!hasAttempted) {
        throw new ForbiddenException(
          'You must complete the test first before exporting it as a PDF.',
        );
      }
    }

    const result = await this.pdfService.generateAnswerKey(testId);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.html);
  }
}
