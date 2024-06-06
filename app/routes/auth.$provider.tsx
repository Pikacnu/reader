import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';
import { AuthorizationError } from 'remix-auth';

export async function loader() {
	return redirect('/login');
}

export async function action({ request, params }: ActionFunctionArgs) {
	if (!params.provider) return redirect('/login');
	if (params.provider === 'email') {
		try {
			return await authenticator.authenticate(params.provider, request, {
				successRedirect: '/home',
				failureRedirect: '/login',
			});
		} catch (e) {
			console.log(e)
			return e
		}
	}
	return await authenticator.authenticate(params.provider, request);
}
