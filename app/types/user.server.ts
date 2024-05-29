export type Profile = {
  displayName: string;
  email:string;
  photoURL: string;
  provider: string;
}

export enum Permission {
  ADMIN = 'admin',
  USER = 'user',
}
export enum Platform {
  DISCORD = 'discord',
  GITHUB = 'github',
  GOOGLE = 'google',
}
export type User = {
  id: number;
  email: string;
  displayName: string;
  photoURL: string;
  provider: string;
  permissions: Permission;
  link_account: Platform[];
}