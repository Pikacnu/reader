import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export async function loader() {
	return redirect('/login');
}

export async function action({ request, params }: ActionFunctionArgs) {
	if(!params.provider) return redirect('/login');
	return await authenticator.authenticate(params.provider, request);
}