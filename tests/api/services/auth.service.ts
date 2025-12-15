import { AUTH_CONSTANTS } from "../api-utils/api.constants";

export class AuthService {
  static loginPayload(
    username: string = AUTH_CONSTANTS.validUsername,
    password: string = AUTH_CONSTANTS.validPassword,
  ): Record<string, string> {
    return { username, password };
  }

  static parseLoginResponse(response: any): { token: string } {
    return { token: response.token };
  }
}
