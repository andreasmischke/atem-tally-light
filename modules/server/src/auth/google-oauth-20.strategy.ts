import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { assertEnv } from 'src/utils/assertEnv';

@Injectable()
export class GoogleOauth20Strategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor() {
    super({
      clientID: assertEnv('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: assertEnv('GOOGLE_OAUTH_CLIENT_SECRET'),
      callbackURL: 'http://localhost:8000/auth/google/redirect',
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/youtube'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log({
      accessToken,
      refreshToken,
      profile,
    });

    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };

    done(null, user);
  }
}
