import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('OCR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('extract')
  @Roles('SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Extract questions from uploaded image/PDF (stubbed)' })
  @ApiResponse({ status: 200, description: 'Extracted questions' })
  async extract(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: PNG, JPEG, PDF',
      );
    }

    const { bookDetected, questions } = await this.ocrService.extractQuestions(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    return {
      filename: file.originalname,
      mimeType: file.mimetype,
      bookDetected,
      questionsFound: questions.length,
      questions,
    };
  }
}
