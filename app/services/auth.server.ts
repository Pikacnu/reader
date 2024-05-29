import { Authenticator } from 'remix-auth';
import { commitSession, sessionStorage } from '~/services/session.server';
import {
	GoogleStrategy,
	GitHubStrategy,
	DiscordStrategy,
	SocialsProvider,
	DiscordProfile,
	GitHubProfile,
	GoogleProfile,
} from 'remix-auth-socials';
import { Permission, Platform, Profile, User } from '~/types/user.server';
import { account } from 'db/schema';
import { eq } from 'drizzle-orm';
import { db } from './db.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage);

// 實作帳號連結
// 這裡是一個範例，你可以根據自己的需求來實作

const getCallback = (provider: SocialsProvider) => {
	return `https://test.pikacnu.com/auth/${provider}/callback`;
};

const newUser = async (profile: Profile) => {
	let user: User = {
		id: 0,
		email: profile.email,
		displayName: profile.displayName,
		photoURL: profile.photoURL,
		provider: profile.provider,
		permissions: Permission.USER,
		link_account: [profile.provider as Platform],
	};
	const userdata = (
		await db.select().from(account).where(eq(account.email, profile.email))
	)[0];
	if (userdata) {
		user.permissions = userdata.permissions as Permission;
		user.id = userdata.id;
		user.link_account = [
			...(userdata.link_discord ? [Platform.DISCORD] : []),
			...(userdata.link_google ? [Platform.GOOGLE] : []),
			...(userdata.link_github ? [Platform.GITHUB] : []),
		];
		user.displayName = userdata.name;
		user.photoURL = userdata.link_avatar;
	}
	return user;
};
authenticator.use(
	new DiscordStrategy(
		{
			clientID: process.env.DISCORD_CLIENT_ID!,
			clientSecret: process.env.DISCORD_CLIENT_SECRET!,
			callbackURL: getCallback(SocialsProvider.DISCORD),
			scope: ['identify', 'email'],
		},
		async ({ profile }: { profile: DiscordProfile }) => {
			await db
				.insert(account)
				.values({
					name: profile.displayName,
					email: profile.emails![0].value,
					link_avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.__json.avatar}.png`,
					link_discord: true,
				})
				.onConflictDoUpdate({
					target: account.email,
					set: {
						link_discord: true,
					},
				});

			return newUser({
				displayName: profile.displayName,
				email: profile.emails![0].value,
				photoURL: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.__json.avatar}.png`,
				provider: SocialsProvider.DISCORD,
			});
		},
	),
);
authenticator.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			callbackURL: getCallback(SocialsProvider.GITHUB),
		},
		async ({ profile }: { profile: GitHubProfile }) => {
			await db
				.insert(account)
				.values({
					name: profile.displayName,
					email: profile.emails![0].value,
					link_avatar: profile.photos![0].value,
					link_github: true,
				})
				.onConflictDoUpdate({
					target: [account.email],
					set: {
						link_github: true,
					},
				});

			return newUser({
				displayName: profile.displayName,
				email: profile.emails![0].value,
				photoURL: profile.photos![0].value,
				provider: SocialsProvider.GITHUB,
			});
		},
	),
);

authenticator.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL: getCallback(SocialsProvider.GOOGLE),
		},
		async ({ profile }: { profile: GoogleProfile }) => {
			await db
				.insert(account)
				.values({
					name: profile.displayName,
					email: profile.emails![0].value,
					link_avatar: profile.photos![0].value,
					link_google: true,
				})
				.onConflictDoUpdate({
					target: [account.email],
					set: {
						link_google: true,
					},
				});

			return newUser({
				displayName: profile.displayName,
				email: profile.emails![0].value,
				photoURL: profile.photos![0].value,
				provider: SocialsProvider.GOOGLE,
			});
		},
	),
);
