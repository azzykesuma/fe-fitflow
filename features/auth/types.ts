export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
};

export type EncryptedPasswordPayload = {
  password_encrypted: string;
  password_alg: "RSA-OAEP-SHA256";
};

export type LoginPayload = Omit<LoginInput, "password"> &
  EncryptedPasswordPayload;

export type RegisterPayload = Omit<RegisterInput, "password"> &
  EncryptedPasswordPayload;

export type AuthResponse = {
  data: {
    access_token: string;
    refresh_token: string;
    user: User;
  };
};

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export type CurrentUserResponse = User | { data: User };
