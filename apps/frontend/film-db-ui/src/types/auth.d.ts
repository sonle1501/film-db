export interface TokenResponseDto {
  token: string;
  refreshToken?: string;
  type?: string;
}

export interface LoginRequestDto {
  username: string;
  password?: string;
}

export interface RegisterRequestDto {
  username: string;
  password?: string;
}
