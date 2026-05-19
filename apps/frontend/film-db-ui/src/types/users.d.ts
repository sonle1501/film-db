export interface UserProfileDto {
  userId: string;
  displayName: string;
  username: string;
  dateCreated: string;
  bio: string;
  role: string;
  userState: string;
}

export interface UserListDto {
  listId: string;
  userId: string;
  nameList: string;
  listType: string;
  isCustom: boolean;
  isPublic: boolean;
  dateCreated: string;
}

export interface ListItemDto {
  itemId: string;
  listId: string;
  movieId: string;
  state: string;
  notes: string;
}

export interface UserInfoDto {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  displayName?: string;
}
