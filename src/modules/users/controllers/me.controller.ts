import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApiSuccessResponse } from '@/base/decorators';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { UpdateUserDto, UserProfileDto } from '@/modules/users/dtos/user.dtos';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/services/users.service';

@Controller('me')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: "Retrieve the current user's profile",
  })
  @ApiSuccessResponse({
    schema: UserProfileDto,
    description: 'User profile retrieved successfully',
  })
  @Get('/profile')
  getCurrentUserProfile(@CurrentUser() user: User) {
    return UserProfileDto.fromUser(user);
  }

  @ApiOperation({
    summary: "Update the current user's profile",
  })
  @ApiSuccessResponse({
    schema: UserProfileDto,
    description: 'User profile updated successfully',
  })
  @Patch('/profile')
  async updateCurrentUserProfile(
    @CurrentUser() currentUser: User,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const user = await this.usersService.updateUserProfile({
      ...updateUserDto,
      id: currentUser.id,
    });
    return UserProfileDto.fromUser(user);
  }
}
