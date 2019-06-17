export interface IAuthentication {
  token: string;
  socialMedia: 'fb' | 'google';
} 

export interface IAuthenticationResult {
  username: string;
  avatar: string;
}