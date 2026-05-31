import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || 'STUDENT',
        roleConfirmed: true,
        phone: dto.phone,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken);

    this.logger.log(`User registered: ${user.email}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleConfirmed: user.roleConfirmed,
        subscriptionPlan: 'FREE',
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken);

    this.logger.log(`User logged in: ${user.email}`);

    let subscriptionPlan = 'FREE';
    if (user.instituteId) {
      const inst = await this.prisma.institute.findUnique({
        where: { id: user.instituteId },
        select: { subscriptionPlan: true },
      });
      if (inst) {
        subscriptionPlan = inst.subscriptionPlan;
      }
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleConfirmed: user.roleConfirmed,
        instituteId: user.instituteId,
        subscriptionPlan,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate tokens
    const tokens = await this.generateTokens(
      session.user.id,
      session.user.email,
      session.user.role,
    );

    // Update session with new tokens
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(userId: string, token?: string) {
    if (token) {
      await this.prisma.session.deleteMany({
        where: { userId, token },
      });
    } else {
      // Delete all sessions for user
      await this.prisma.session.deleteMany({
        where: { userId },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // TODO: Implement email sending with reset token
    // For now, return a success message
    this.logger.log(`Password reset requested for: ${email}`);

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async googleLogin(dto: { token: string; email?: string; name?: string; avatar?: string }) {
    this.logger.log(`Google OAuth login requested for email: ${dto.email}`);

    if (!dto.email) {
      throw new UnauthorizedException('Email is required for Google login');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const isSuperAdminEmail = dto.email === 'rupamkr2040@gmail.com' || dto.email === 'rpm2806@gmail.com';

    if (!user) {
      // Create a new user automatically
      const secureRandomPassword = await bcrypt.hash(uuidv4(), 12);
      user = await this.prisma.user.create({
        data: {
          name: dto.name || dto.email.split('@')[0],
          email: dto.email,
          password: secureRandomPassword,
          role: isSuperAdminEmail ? 'SUPER_ADMIN' : 'STUDENT',
          roleConfirmed: isSuperAdminEmail ? true : false,
          avatar: dto.avatar,
        },
      });
      this.logger.log(`New user registered via Google: ${user.email} as ${user.role}`);
    } else {
      if (!user.isActive) {
        throw new UnauthorizedException('Account is disabled');
      }
      
      // Dynamically promote existing user to SUPER_ADMIN if it is Rupam's email!
      if (isSuperAdminEmail && (user.role !== 'SUPER_ADMIN' || !user.roleConfirmed)) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            role: 'SUPER_ADMIN',
            roleConfirmed: true,
          },
        });
        this.logger.log(`Promoted existing user to Global Admin: ${user.email}`);
      }

      // Optional: Update avatar if changed
      if (dto.avatar && user.avatar !== dto.avatar) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { avatar: dto.avatar },
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken);

    let subscriptionPlan = 'FREE';
    if (user.instituteId) {
      const inst = await this.prisma.institute.findUnique({
        where: { id: user.instituteId },
        select: { subscriptionPlan: true },
      });
      if (inst) {
        subscriptionPlan = inst.subscriptionPlan;
      }
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleConfirmed: user.roleConfirmed,
        instituteId: user.instituteId,
        subscriptionPlan,
      },
      ...tokens,
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload as any, {
      secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
    } as any);

    const refreshToken = await this.jwtService.signAsync(payload as any, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    } as any);

    return { accessToken, refreshToken };
  }

  private async createSession(
    userId: string,
    token: string,
    refreshToken: string,
  ) {
    await this.prisma.session.create({
      data: {
        userId,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
