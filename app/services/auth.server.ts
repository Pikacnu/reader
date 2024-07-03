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
import { FormStrategy } from 'remix-auth-form';
import crypto from 'crypto';
import { AuthorizationError } from 'remix-auth';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator(sessionStorage);

// 實作帳號連結
// 這裡是一個範例，你可以根據自己的需求來實作

const getCallback = (provider: SocialsProvider) => {
	return `${process.env.HOST_LINK}/auth/${provider}/callback`;
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
			...(userdata.link_laganto ? [Platform.LAGANTO] : []),
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

authenticator.use(
	new FormStrategy(async ({ form, context }) => {
		const email = form.get('email') as string;
		const password = form.get('password') as string;

		if (!email || !password) {
			throw new AuthorizationError('Please provide email and password', {
				name: 'FormError',
				message: 'Please provide email and password',
				cause: 'Password or email is empty',
			});
		}

		if (email === '')
			throw new AuthorizationError('Email is empty', {
				name: 'FormError',
				message: 'Email is empty',
				cause: 'Email is empty',
			});
		if (password === '')
			throw new AuthorizationError('Password is empty', {
				name: 'FormError',
				message: 'Password is empty',
				cause: 'Password is empty',
			});

		const userdata = (
			await db.select().from(account).where(eq(account.email, email))
		)[0];

		if (!userdata) {
			throw new AuthorizationError('account not found', {
				name: 'FormError',
				message: 'account not found',
				cause: 'account not found',
			});
		}

		let temp = crypto.createHmac('sha256', process.env.SECRET_KEY!);
		temp.update(password);
		const hash = temp.digest('hex');

		if (hash !== userdata.password) {
			throw new AuthorizationError('Password not match', {
				name: 'FormError',
				message: 'Password not match',
				cause: 'Password not match',
			});
		}
		return newUser({
			displayName: userdata.name,
			email: userdata.email,
			photoURL: userdata.link_avatar,
			provider: Platform.LAGANTO,
		});
	}),
	'email',
);
